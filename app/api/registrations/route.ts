import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { RegistrationReceiptSchema, parseRegistrationRequest, toRegistrationRpcPayload } from '../../../lib/data/registration-contract';
import { createServiceSupabaseClient } from '../../../lib/supabase/server';

const safeErrors: Record<string, { status: number; code: string; message: string }> = {
  PROGRAM_NOT_FOUND: { status: 404, code: 'PROGRAM_NOT_FOUND', message: 'This program could not be found.' },
  PROGRAM_CLOSED: { status: 409, code: 'PROGRAM_CLOSED', message: 'Registration for this program is closed.' },
  REGISTRATION_CLOSED: { status: 409, code: 'PROGRAM_CLOSED', message: 'Registration for this program is closed.' },
  INVALID_SESSION_IDS: { status: 422, code: 'INVALID_SESSION_SELECTION', message: 'Choose at least one available program date.' },
  INVALID_SESSION_SELECTION: { status: 422, code: 'INVALID_SESSION_SELECTION', message: 'One or more selected dates are no longer available.' },
};

function response(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  try {
    const parsed = parseRegistrationRequest(await request.json());
    if (parsed.website) {
      return response({ receipt: { registrationId: crypto.randomUUID(), publicReference: `RR-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`, registrationStatus: 'confirmed', paymentStatus: 'waived' } }, 201);
    }
    const supabase = createServiceSupabaseClient();
    const result = await supabase.rpc('submit_registration', { payload: toRegistrationRpcPayload(parsed.submission), idempotency_key: parsed.idempotencyKey });
    if (result.error) {
      const known = Object.entries(safeErrors).find(([message]) => String(result.error.message).includes(message))?.[1];
      if (known) return response({ error: { code: known.code, message: known.message } }, known.status);
      return response({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Registration is temporarily unavailable. Your information is still in this form; please try again.' } }, 503);
    }
    const raw = Array.isArray(result.data) ? result.data[0] : result.data;
    const normalized = raw && typeof raw === 'object' && 'registration_id' in raw
      ? { registrationId: raw.registration_id, publicReference: raw.public_reference, registrationStatus: raw.registration_status, paymentStatus: raw.payment_status }
      : raw;
    const receipt = RegistrationReceiptSchema.parse(normalized);
    return response({ receipt }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      const fields = Object.fromEntries(error.issues.map((issue) => [issue.path.join('.'), issue.message]));
      return response({ error: { code: 'INVALID_INPUT', message: 'Check the registration information and try again.', fields } }, 400);
    }
    return response({ error: { code: 'INVALID_REQUEST', message: 'The registration request could not be read.' } }, 400);
  }
}
