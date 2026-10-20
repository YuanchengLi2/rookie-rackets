import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { sendContactNotification } = vi.hoisted(() => ({ sendContactNotification: vi.fn() }));
vi.mock('../lib/email/contact-notification', () => ({ sendContactNotification }));

import { POST } from '../app/api/contact/route';

const validBody = {
  idempotencyKey: '22222222-2222-4222-8222-222222222222',
  website: '',
  message: { topic: 'partnership', fullName: 'Jordan Lee', email: 'jordan@example.com', message: 'We would love to host a workshop at our school.' },
};
const post = (body: unknown) => POST(new Request('http://localhost/api/contact', { method: 'POST', body: JSON.stringify(body) }));

describe('POST /api/contact', () => {
  beforeEach(() => { sendContactNotification.mockReset().mockResolvedValue(true); });

  it('emails a valid message to the team', async () => {
    const response = await post(validBody);
    expect(response.status).toBe(201);
    expect(sendContactNotification).toHaveBeenCalledWith(validBody.message, validBody.idempotencyKey);
  });

  it('rejects a short message without sending email', async () => {
    const response = await post({ ...validBody, message: { ...validBody.message, message: 'Hi' } });
    expect(response.status).toBe(400);
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it('silently accepts honeypot submissions without sending email', async () => {
    const response = await post({ ...validBody, website: 'spam' });
    expect(response.status).toBe(201);
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it('asks for a retry when email delivery fails', async () => {
    sendContactNotification.mockResolvedValue(false);
    const response = await post(validBody);
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe('EMAIL_UNAVAILABLE');
  });
});

describe('sendContactNotification', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('sends the message to the team inbox with reply-to set to the sender', async () => {
    const { sendContactNotification: send } = await vi.importActual<typeof import('../lib/email/contact-notification')>('../lib/email/contact-notification');
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('ROOKIE_SIGNUP_FROM_EMAIL', 'Rookie Rackets <onboarding@resend.dev>');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    expect(await send(validBody.message as never, validBody.idempotencyKey)).toBe(true);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(options.headers['Idempotency-Key']).toBe(`rookie-contact/${validBody.idempotencyKey}`);
    const email = JSON.parse(options.body);
    expect(email.reply_to).toBe('jordan@example.com');
    expect(email.subject).toBe('New Rookie Rackets message: Partnerships & hosting from Jordan Lee');
    expect(email.text).toContain('We would love to host a workshop at our school.');
  });
});
