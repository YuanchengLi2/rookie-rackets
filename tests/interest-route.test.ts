import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn();
vi.mock('../lib/supabase/server', () => ({ createServiceSupabaseClient: () => ({ rpc }) }));

import { POST } from '../app/api/interests/route';

const validBody = {
  idempotencyKey: '11111111-1111-4111-8111-111111111111',
  website: '',
  submission: {
    parentName: 'Jordan Lee', phone: '919-555-0110', email: 'jordan@example.com', childName: 'Sam Lee',
    grade: '5th Grade', school: 'Carpenter Elementary', workshop: 'Beginner Fundamentals', referral: 'School', comments: '',
  },
};

describe('POST /api/interests', () => {
  beforeEach(() => rpc.mockReset());

  it('stores one idempotent interest signup', async () => {
    rpc.mockResolvedValue({ data: { interestId: '70000000-0000-4000-8000-000000000001', publicReference: 'RI-ABC12345' }, error: null });
    const response = await POST(new Request('http://localhost/api/interests', { method: 'POST', body: JSON.stringify(validBody) }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ receipt: { interestId: '70000000-0000-4000-8000-000000000001', publicReference: 'RI-ABC12345' } });
    expect(rpc).toHaveBeenCalledWith('submit_interest_signup', expect.objectContaining({ idempotency_key: validBody.idempotencyKey }));
  });

  it('rejects invalid email without calling Supabase', async () => {
    const response = await POST(new Request('http://localhost/api/interests', { method: 'POST', body: JSON.stringify({ ...validBody, submission: { ...validBody.submission, email: 'bad' } }) }));
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
});
