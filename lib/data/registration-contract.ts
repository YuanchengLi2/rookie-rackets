import { z } from 'zod';

const trimmed = (minimum: number, maximum: number) => z.string().trim().min(minimum).max(maximum);
const uuid = z.string().uuid();
const phone = trimmed(7, 32).regex(/^\+?[\d\s().-]{7,}$/u, 'Enter a valid phone number.');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, 'Use a valid date.').superRefine((value, context) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    context.addIssue({ code: 'custom', message: 'Use a valid date.' });
  }
});

export const RegistrationSubmissionSchema = z.object({
  programId: uuid,
  childFirstName: trimmed(1, 80),
  childLastName: trimmed(1, 80),
  dateOfBirth: isoDate,
  grade: trimmed(1, 40),
  skillLevel: z.enum(['beginner', 'intermediate', 'mixed', 'advanced']),
  guardianFirstName: trimmed(1, 80),
  guardianLastName: trimmed(1, 80),
  guardianEmail: z.string().trim().toLowerCase().email().max(254),
  guardianPhone: phone,
  emergencyName: trimmed(1, 160),
  emergencyRelationship: trimmed(1, 80),
  emergencyPhone: phone,
  supportNotes: z.string().trim().max(2000),
  needsRacket: z.boolean(),
  parentOnsite: z.boolean(),
  selectedSessionIds: z.array(uuid).min(1).max(40).transform((values) => [...new Set(values)]),
  consents: z.object({
    participationWaiver: z.literal(true),
    photoVideo: z.boolean(),
    programAcknowledgment: z.literal(true),
    pickupPolicy: z.literal(true),
  }).strict(),
}).strict();

export const RegistrationRequestSchema = z.object({
  submission: RegistrationSubmissionSchema,
  idempotencyKey: uuid,
  website: z.string().max(200).default(''),
}).strict();

export const RegistrationReceiptSchema = z.object({
  registrationId: uuid,
  publicReference: z.string().regex(/^RR-[A-Z0-9]{8}$/u),
  registrationStatus: z.enum(['incomplete', 'confirmed', 'waitlisted', 'offer-sent', 'canceled', 'completed', 'refunded', 'archived']),
  paymentStatus: z.enum(['unpaid', 'pending', 'paid', 'failed', 'refunded', 'partial-refund', 'waived']),
}).strict();

export type RegistrationSubmission = z.infer<typeof RegistrationSubmissionSchema>;
export type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>;
export type RegistrationReceipt = z.infer<typeof RegistrationReceiptSchema>;

export interface RegistrationRpcPayload {
  program_id: string;
  child_first_name: string;
  child_last_name: string;
  date_of_birth: string;
  grade: string;
  skill_level: RegistrationSubmission['skillLevel'];
  guardian_first_name: string;
  guardian_last_name: string;
  guardian_email: string;
  guardian_phone: string;
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  support_notes: string;
  needs_racket: boolean;
  parent_onsite: boolean;
  selected_session_ids: string[];
  consents: {
    participation_waiver: true;
    photo_video: boolean;
    program_acknowledgment: true;
    pickup_policy: true;
  };
}

export function parseRegistrationRequest(value: unknown): RegistrationRequest {
  return RegistrationRequestSchema.parse(value);
}

export function toRegistrationRpcPayload(submission: RegistrationSubmission): RegistrationRpcPayload {
  return {
    program_id: submission.programId,
    child_first_name: submission.childFirstName,
    child_last_name: submission.childLastName,
    date_of_birth: submission.dateOfBirth,
    grade: submission.grade,
    skill_level: submission.skillLevel,
    guardian_first_name: submission.guardianFirstName,
    guardian_last_name: submission.guardianLastName,
    guardian_email: submission.guardianEmail,
    guardian_phone: submission.guardianPhone,
    emergency_name: submission.emergencyName,
    emergency_relationship: submission.emergencyRelationship,
    emergency_phone: submission.emergencyPhone,
    support_notes: submission.supportNotes,
    needs_racket: submission.needsRacket,
    parent_onsite: submission.parentOnsite,
    selected_session_ids: submission.selectedSessionIds,
    consents: {
      participation_waiver: submission.consents.participationWaiver,
      photo_video: submission.consents.photoVideo,
      program_acknowledgment: submission.consents.programAcknowledgment,
      pickup_policy: submission.consents.pickupPolicy,
    },
  };
}
