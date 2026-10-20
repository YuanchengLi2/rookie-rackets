import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ContactRequestSchema } from '../../../lib/data/contact-contract';
import { sendContactNotification } from '../../../lib/email/contact-notification';

function response(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  try {
    const parsed = ContactRequestSchema.parse(await request.json());
    if (parsed.website) return response({ sent: true }, 201);
    const sent = await sendContactNotification(parsed.message, parsed.idempotencyKey);
    if (!sent) {
      return response({ error: { code: 'EMAIL_UNAVAILABLE', message: 'Your message could not be sent right now. It is still in this form; please try again, or email teamrookierackets@gmail.com.' } }, 503);
    }
    return response({ sent: true }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return response({ error: { code: 'INVALID_INPUT', message: 'Check your message and try again.' } }, 400);
    }
    return response({ error: { code: 'INVALID_REQUEST', message: 'The message could not be read.' } }, 400);
  }
}
