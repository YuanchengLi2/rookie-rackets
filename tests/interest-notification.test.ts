import { afterEach, expect, it, vi } from 'vitest';
import { sendInterestNotification } from '../lib/email/interest-notification';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it('sends the signup type and contact fields to the requested inbox with an idempotency key', async () => {
  vi.stubEnv('RESEND_API_KEY', 'test-key');
  vi.stubEnv('ROOKIE_SIGNUP_FROM_EMAIL', 'Rookie Rackets <onboarding@resend.dev>');
  const send = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', send);
  const submission = { signupType: 'workshop' as const, fullName: 'Sam Lee', email: 'guardian@example.com', phone: '919-555-0110', grade: '5th Grade', age: 10 };

  expect(await sendInterestNotification(submission, 'RI-ABC12345', '70000000-0000-4000-8000-000000000001')).toBe(true);
  const [url, options] = send.mock.calls[0];
  expect(url).toBe('https://api.resend.com/emails');
  expect(options.headers['Idempotency-Key']).toBe('rookie-interest/70000000-0000-4000-8000-000000000001');
  const message = JSON.parse(options.body);
  expect(message.to).toEqual(['yuanchengli612@gmail.com']);
  expect(message.subject).toBe('New Rookie Rackets signup: Workshop participant RI-ABC12345');
  expect(message.text).toContain('Full name: Sam Lee');
  expect(message.text).toContain('Age: 10');
});
