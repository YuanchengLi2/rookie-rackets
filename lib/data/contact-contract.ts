import { z } from 'zod';

export const contactTopics = {
  general: 'General question',
  events: 'Events & workshops',
  partnership: 'Partnerships & hosting',
  donations: 'Donations & sponsorship',
  media: 'Media & press',
} as const;
export type ContactTopic = keyof typeof contactTopics;

export const ContactMessageSchema = z.object({
  topic: z.enum(['general', 'events', 'partnership', 'donations', 'media'], { message: 'Choose a topic.' }),
  fullName: z.string().trim().min(2, 'Enter your full name.').max(160),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  message: z.string().trim().min(10, 'Your message should be at least 10 characters.').max(4000, 'Your message must be 4,000 characters or fewer.'),
});

export const ContactRequestSchema = z.object({
  idempotencyKey: z.string().uuid(),
  website: z.string().max(500).default(''),
  message: ContactMessageSchema,
});

export type ContactMessage = z.infer<typeof ContactMessageSchema>;
