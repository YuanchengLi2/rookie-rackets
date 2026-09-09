import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { InterestReceiptSchema, InterestRequestSchema, toInterestRpcPayload } from '../../../lib/data/interest-contract';
import { createServiceSupabaseClient } from '../../../lib/supabase/server';

function response(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  try {
    const parsed = InterestRequestSchema.parse(await request.json());
    if (parsed.website) {
      return response({ receipt: { interestId: crypto.randomUUID(), publicReference: `RI-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}` } }, 201);
    }
    const supabase = createServiceSupabaseClient();
    const result = await supabase.rpc('submit_interest_signup', { payload: toInterestRpcPayload(parsed.submission), idempotency_key: parsed.idempotencyKey });
    if (result.error) {
      return response({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Sign-up is temporarily unavailable. Your information is still in this form; please try again.' } }, 503);
    }
    const raw = Array.isArray(result.data) ? result.data[0] : result.data;
    const normalized = raw && typeof raw === 'object' && 'interest_id' in raw
      ? { interestId: raw.interest_id, publicReference: raw.public_reference }
      : raw;
    const receipt = InterestReceiptSchema.parse(normalized);
    return response({ receipt }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return response({ error: { code: 'INVALID_INPUT', message: 'Check the sign-up information and try again.' } }, 400);
    }
    return response({ error: { code: 'INVALID_REQUEST', message: 'The sign-up request could not be read.' } }, 400);
  }
}
