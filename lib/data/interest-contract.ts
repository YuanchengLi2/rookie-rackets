import { z } from 'zod';

export const signupTypes = {
  workshop: 'Workshop participant',
  'adult-volunteer': 'Adult volunteer',
  'junior-volunteer': 'Junior volunteer',
  coach: 'Coach',
} as const;
export type SignupType = keyof typeof signupTypes;
export const juniorGrades = ['6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];
export const participantGrades = ['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', ...juniorGrades, 'College / Adult'];

export const InterestSubmissionSchema = z.object({
  signupType: z.enum(['workshop', 'adult-volunteer', 'junior-volunteer', 'coach']),
  fullName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(32),
  email: z.string().trim().email().max(254),
  grade: z.string().trim().max(40).default(''),
  age: z.number().int().min(3).max(99),
}).superRefine((value, context) => {
  if (value.signupType === 'junior-volunteer' && !juniorGrades.includes(value.grade)) {
    context.addIssue({ code: 'custom', path: ['grade'], message: 'Junior volunteers must be in middle school or high school (grades 6–12).' });
  }
  if (value.signupType === 'workshop' && !participantGrades.includes(value.grade)) {
    context.addIssue({ code: 'custom', path: ['grade'], message: 'Select your grade or College / Adult.' });
  }
  if (value.signupType === 'adult-volunteer' && value.age < 18) {
    context.addIssue({ code: 'custom', path: ['age'], message: 'Adult volunteers must be 18 or older. Students can sign up as junior volunteers.' });
  }
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
    parent_name: 'Not provided',
    phone: value.phone,
    email: value.email,
    child_name: value.fullName,
    grade: value.signupType === 'adult-volunteer' || value.signupType === 'coach' ? 'Not applicable' : value.grade,
    school: 'Not provided',
    workshop: signupTypes[value.signupType],
    referral: 'Website signup',
    comments: `Age: ${value.age}`,
  };
}
