import { describe, expect, it } from 'vitest';
import {
  parseRegistrationRequest,
  toRegistrationRpcPayload,
} from '../lib/data/registration-contract';

const validRequest = {
  submission: {
    programId: '11111111-1111-4111-8111-111111111111',
    childFirstName: '  Jamie  ',
    childLastName: 'Lee',
    dateOfBirth: '2015-05-12',
    grade: '5th Grade',
    skillLevel: 'beginner',
    guardianFirstName: ' Jordan ',
    guardianLastName: 'Lee',
    guardianEmail: ' Parent@Example.COM ',
    guardianPhone: '(919) 555-0199',
    emergencyName: 'Taylor Lee',
    emergencyRelationship: 'Parent',
    emergencyPhone: '919-555-0111',
    supportNotes: '',
    needsRacket: true,
    parentOnsite: false,
    selectedSessionIds: ['22222222-2222-4222-8222-222222222222'],
    consents: {
      participationWaiver: true,
      photoVideo: false,
      programAcknowledgment: true,
      pickupPolicy: true,
    },
  },
  idempotencyKey: '33333333-3333-4333-8333-333333333333',
  website: '',
};

describe('public registration contract', () => {
  it('normalizes safe text and email fields', () => {
    const parsed = parseRegistrationRequest(validRequest);

    expect(parsed.submission.childFirstName).toBe('Jamie');
    expect(parsed.submission.guardianFirstName).toBe('Jordan');
    expect(parsed.submission.guardianEmail).toBe('parent@example.com');
  });

  it('rejects unknown fields and malformed contact values', () => {
    expect(() => parseRegistrationRequest({
      ...validRequest,
      submission: { ...validRequest.submission, unexpected: true },
    })).toThrow();
    expect(() => parseRegistrationRequest({
      ...validRequest,
      submission: { ...validRequest.submission, guardianEmail: 'not-an-email' },
    })).toThrow();
    expect(() => parseRegistrationRequest({
      ...validRequest,
      submission: { ...validRequest.submission, guardianPhone: '12' },
    })).toThrow();
  });

  it('requires at least one session and every required consent', () => {
    expect(() => parseRegistrationRequest({
      ...validRequest,
      submission: { ...validRequest.submission, selectedSessionIds: [] },
    })).toThrow();
    expect(() => parseRegistrationRequest({
      ...validRequest,
      submission: {
        ...validRequest.submission,
        consents: { ...validRequest.submission.consents, pickupPolicy: false },
      },
    })).toThrow();
  });

  it('rejects oversized notes and invalid dates', () => {
    expect(() => parseRegistrationRequest({
      ...validRequest,
      submission: { ...validRequest.submission, supportNotes: 'x'.repeat(2001) },
    })).toThrow();
    expect(() => parseRegistrationRequest({
      ...validRequest,
      submission: { ...validRequest.submission, dateOfBirth: '2015-02-31' },
    })).toThrow();
  });

  it('requires a UUID idempotency key and preserves the honeypot separately', () => {
    expect(() => parseRegistrationRequest({ ...validRequest, idempotencyKey: 'duplicate-1' })).toThrow();
    expect(parseRegistrationRequest({ ...validRequest, website: 'bot.example' }).website).toBe('bot.example');
  });

  it('maps the validated request to the database RPC contract', () => {
    const request = parseRegistrationRequest(validRequest);

    expect(toRegistrationRpcPayload(request.submission)).toEqual({
      program_id: validRequest.submission.programId,
      child_first_name: 'Jamie',
      child_last_name: 'Lee',
      date_of_birth: '2015-05-12',
      grade: '5th Grade',
      skill_level: 'beginner',
      guardian_first_name: 'Jordan',
      guardian_last_name: 'Lee',
      guardian_email: 'parent@example.com',
      guardian_phone: '(919) 555-0199',
      emergency_name: 'Taylor Lee',
      emergency_relationship: 'Parent',
      emergency_phone: '919-555-0111',
      support_notes: '',
      needs_racket: true,
      parent_onsite: false,
      selected_session_ids: validRequest.submission.selectedSessionIds,
      consents: {
        participation_waiver: true,
        photo_video: false,
        program_acknowledgment: true,
        pickup_policy: true,
      },
    });
  });
});
