import { beforeEach, describe, expect, it, vi } from 'vitest';

const { rpc, sendInterestNotification } = vi.hoisted(() => ({ rpc: vi.fn(), sendInterestNotification: vi.fn() }));
vi.mock('../lib/supabase/server', () => ({ createServiceSupabaseClient: () => ({ rpc }) }));
vi.mock('../lib/email/interest-notification', () => ({ sendInterestNotification }));

import { POST } from '../app/api/interests/route';

const validBody = {
  idempotencyKey: '11111111-1111-4111-8111-111111111111',
  website: '',
  submission: {
    signupType: 'workshop', fullName: 'Sam Lee', phone: '919-555-0110', email: 'jordan@example.com', grade: '5th Grade', age: 10,
  },
};

describe('POST /api/interests', () => {
  beforeEach(() => { rpc.mockReset(); sendInterestNotification.mockReset().mockResolvedValue(true); });

  it('stores one idempotent workshop signup', async () => {
    rpc.mockResolvedValue({ data: { interestId: '70000000-0000-4000-8000-000000000001', publicReference: 'RI-ABC12345' }, error: null });
    const response = await POST(new Request('http://localhost/api/interests', { method: 'POST', body: JSON.stringify(validBody) }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ receipt: { interestId: '70000000-0000-4000-8000-000000000001', publicReference: 'RI-ABC12345' } });
    expect(rpc).toHaveBeenCalledWith('submit_interest_signup', expect.objectContaining({
      idempotency_key: validBody.idempotencyKey,
      payload: expect.objectContaining({ child_name: 'Sam Lee', grade: '5th Grade', comments: 'Age: 10', workshop: 'Workshop participant', referral: 'Website signup' }),
    }));
    expect(sendInterestNotification).toHaveBeenCalledWith(validBody.submission, 'RI-ABC12345', '70000000-0000-4000-8000-000000000001');
  });

  it('rejects invalid email without calling Supabase', async () => {
    const response = await POST(new Request('http://localhost/api/interests', { method: 'POST', body: JSON.stringify({ ...validBody, submission: { ...validBody.submission, email: 'bad' } }) }));
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('asks for a retry when the signup is saved but email delivery fails', async () => {
    rpc.mockResolvedValue({ data: { interestId: '70000000-0000-4000-8000-000000000001', publicReference: 'RI-ABC12345' }, error: null });
    sendInterestNotification.mockResolvedValue(false);
    const response = await POST(new Request('http://localhost/api/interests', { method: 'POST', body: JSON.stringify(validBody) }));
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe('EMAIL_UNAVAILABLE');
  });
});
