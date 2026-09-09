import { z } from 'zod';

export const InterestSubmissionSchema = z.object({
  parentName: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(7).max(32),
  email: z.string().trim().email().max(254),
  childName: z.string().trim().min(1).max(160),
  grade: z.string().trim().min(1).max(40),
  school: z.string().trim().min(1).max(160),
  workshop: z.string().trim().min(1).max(120),
  referral: z.string().trim().min(1).max(160),
  comments: z.string().trim().max(2000).default(''),
});

export const InterestRequestSchema = z.object({
  idempotencyKey: z.string().uuid(),
  website: z.string().max(0).default(''),
  submission: InterestSubmissionSchema,
});

export const InterestReceiptSchema = z.object({
  interestId: z.string().uuid(),
  publicReference: z.string().regex(/^RI-[A-Z0-9]{8}$/),
});

export type InterestSubmission = z.infer<typeof InterestSubmissionSchema>;

export function toInterestRpcPayload(value: InterestSubmission) {
  return {
    parent_name: value.parentName,
    phone: value.phone,
    email: value.email,
    child_name: value.childName,
    grade: value.grade,
    school: value.school,
    workshop: value.workshop,
    referral: value.referral,
    comments: value.comments,
  };
}
