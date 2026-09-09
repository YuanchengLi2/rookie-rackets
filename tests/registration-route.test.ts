import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn();
vi.mock('../lib/supabase/server', () => ({ createServiceSupabaseClient: () => ({ rpc }) }));

import { POST } from '../app/api/registrations/route';

const validBody = {
  idempotencyKey: '11111111-1111-4111-8111-111111111111', website: '',
  submission: {
    programId: '30000000-0000-4000-8000-000000000001', childFirstName: 'Sam', childLastName: 'Lee', dateOfBirth: '2015-05-12', grade: '5th Grade', skillLevel: 'beginner',
    guardianFirstName: 'Jordan', guardianLastName: 'Lee', guardianEmail: 'jordan@example.com', guardianPhone: '919-555-0110', emergencyName: 'Taylor Lee', emergencyRelationship: 'Parent', emergencyPhone: '919-555-0111', supportNotes: '', needsRacket: true, parentOnsite: false,
    selectedSessionIds: ['40000000-0000-4000-8000-000000000001'], consents: { participationWaiver: true, photoVideo: false, programAcknowledgment: true, pickupPolicy: true },
  },
};

describe('POST /api/registrations', () => {
  beforeEach(() => rpc.mockReset());

  it('validates and submits one idempotent registration', async () => {
    rpc.mockResolvedValue({ data: [{ registration_id: '60000000-0000-4000-8000-000000000001', public_reference: 'RR-ABC12345', registration_status: 'confirmed', payment_status: 'waived' }], error: null });
    const response = await POST(new Request('http://localhost/api/registrations', { method: 'POST', body: JSON.stringify(validBody) }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ receipt: { registrationId: '60000000-0000-4000-8000-000000000001', publicReference: 'RR-ABC12345', registrationStatus: 'confirmed', paymentStatus: 'waived' } });
    expect(rpc).toHaveBeenCalledWith('submit_registration', expect.objectContaining({ idempotency_key: validBody.idempotencyKey }));
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects invalid data without calling Supabase', async () => {
    const response = await POST(new Request('http://localhost/api/registrations', { method: 'POST', body: JSON.stringify({ ...validBody, submission: { ...validBody.submission, guardianEmail: 'bad' } }) }));
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('returns a service-safe conflict when the program changed', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'PROGRAM_CLOSED', code: 'P0001' } });
    const response = await POST(new Request('http://localhost/api/registrations', { method: 'POST', body: JSON.stringify(validBody) }));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: { code: 'PROGRAM_CLOSED', message: 'Registration for this program is closed.' } });
  });
});
