import { z } from 'zod';
import type {
  ActivityRecord, AttendanceRecord, Coach, CoachAssignment, ConsentRecord, FinanceEntry, OperationsState,
  InterestSignup, Organization, OrganizationInteraction, PaymentRecord, Program, Project, Registration, SessionCurriculum,
  SessionRecord, StaffProfile, StoredFile, Task, WorkspaceSettings,
} from './types';

type Row = Record<string, unknown>;
const text = (row: Row, key: string) => String(row[key] ?? '');
const nullableText = (row: Row, key: string) => row[key] == null ? null : String(row[key]);
const number = (row: Row, key: string) => Number(row[key] ?? 0);
const boolean = (row: Row, key: string) => Boolean(row[key]);
const strings = (row: Row, key: string) => Array.isArray(row[key]) ? (row[key] as unknown[]).map(String) : [];

const curriculumSchema = z.object({
  objective: z.string().default(''),
  activities: z.array(z.object({
    id: z.string(), kind: z.enum(['warm-up', 'skill', 'game', 'cool-down']), title: z.string(), minutes: z.number(), instructions: z.string(),
  })).default([]),
  coachNotes: z.string().default(''),
  updatedAt: z.string().nullable().default(null),
});

function curriculum(value: unknown): SessionCurriculum {
  const parsed = curriculumSchema.safeParse(value);
  return parsed.success ? parsed.data : { objective: '', activities: [], coachNotes: '', updatedAt: null };
}

export interface WorkspaceRows {
  staffProfiles: Row[]; settings: Row[]; programs: Row[]; sessions: Row[]; coaches: Row[]; assignments: Row[];
  registrations: Row[]; registrationSessions: Row[]; consents: Row[]; payments: Row[]; attendance: Row[];
  organizations: Row[]; organizationSupport: Row[]; interactions: Row[]; projects: Row[]; projectContributors: Row[];
  tasks: Row[]; financeEntries: Row[]; files: Row[]; activity: Row[]; interestSignups: Row[];
}

export function mapWorkspaceRows(rows: WorkspaceRows): OperationsState {
  const registrationSessions = new Map<string, string[]>();
  for (const row of rows.registrationSessions) registrationSessions.set(text(row, 'registration_id'), [...(registrationSessions.get(text(row, 'registration_id')) ?? []), text(row, 'session_id')]);
  const organizationSupport = new Map<string, string[]>();
  for (const row of rows.organizationSupport) organizationSupport.set(text(row, 'organization_id'), [...(organizationSupport.get(text(row, 'organization_id')) ?? []), text(row, 'staff_id')]);
  const projectContributors = new Map<string, string[]>();
  for (const row of rows.projectContributors) projectContributors.set(text(row, 'project_id'), [...(projectContributors.get(text(row, 'project_id')) ?? []), text(row, 'staff_id')]);

  return {
    staffProfiles: rows.staffProfiles.map((row): StaffProfile => ({ id: text(row, 'id'), email: text(row, 'email'), name: text(row, 'name'), initials: text(row, 'initials'), role: text(row, 'role') as StaffProfile['role'], active: boolean(row, 'active'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at') })),
    settings: rows.settings[0] ? { organizationName: text(rows.settings[0], 'organization_name'), contactEmail: text(rows.settings[0], 'contact_email'), participationWaiverVersion: text(rows.settings[0], 'participation_waiver_version'), photoVideoVersion: text(rows.settings[0], 'photo_video_version'), programAcknowledgmentVersion: text(rows.settings[0], 'program_acknowledgment_version'), pickupPolicyVersion: text(rows.settings[0], 'pickup_policy_version'), confirmationCopy: text(rows.settings[0], 'confirmation_copy') } as WorkspaceSettings : null,
    programs: rows.programs.map((row): Program => ({ id: text(row, 'id'), slug: text(row, 'slug'), name: text(row, 'name'), organizationId: nullableText(row, 'organization_id'), type: text(row, 'type') as Program['type'], description: text(row, 'description'), venue: text(row, 'venue'), skillLevel: text(row, 'skill_level') as Program['skillLevel'], eligibility: text(row, 'eligibility'), capacity: number(row, 'capacity'), leadCoachId: nullableText(row, 'lead_coach_id'), status: text(row, 'status') as Program['status'], visibility: text(row, 'visibility') as Program['visibility'], priceCents: number(row, 'price_cents'), registrationDeadline: text(row, 'registration_deadline'), whatToBring: strings(row, 'what_to_bring'), equipmentProvided: boolean(row, 'equipment_provided'), image: text(row, 'image'), contact: text(row, 'contact'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at'), archivedAt: nullableText(row, 'archived_at') })),
    sessions: rows.sessions.map((row): SessionRecord => ({ id: text(row, 'id'), programId: text(row, 'program_id'), date: text(row, 'date'), startTime: text(row, 'start_time'), endTime: text(row, 'end_time'), arrivalTime: text(row, 'arrival_time'), location: text(row, 'location'), leadCoachId: nullableText(row, 'lead_coach_id'), curriculum: curriculum(row.curriculum), status: text(row, 'status') as SessionRecord['status'], notes: text(row, 'notes'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at') })),
    coaches: rows.coaches.map((row): Coach => ({ id: text(row, 'id'), name: text(row, 'name'), email: text(row, 'email'), role: text(row, 'role') as Coach['role'], active: boolean(row, 'active'), experience: text(row, 'experience'), availability: text(row, 'availability') as Coach['availability'], volunteerMinutes: number(row, 'volunteer_minutes'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at'), archivedAt: nullableText(row, 'archived_at') })),
    assignments: rows.assignments.map((row): CoachAssignment => ({ id: text(row, 'id'), sessionId: text(row, 'session_id'), coachId: text(row, 'coach_id'), slot: text(row, 'slot') as CoachAssignment['slot'], accepted: boolean(row, 'accepted'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at') })),
    registrations: rows.registrations.map((row): Registration => ({ id: text(row, 'id'), publicReference: text(row, 'public_reference'), source: text(row, 'source') as Registration['source'], programId: text(row, 'program_id'), childFirstName: text(row, 'child_first_name'), childLastName: text(row, 'child_last_name'), dateOfBirth: text(row, 'date_of_birth'), grade: text(row, 'grade'), skillLevel: text(row, 'skill_level'), guardianFirstName: text(row, 'guardian_first_name'), guardianLastName: text(row, 'guardian_last_name'), guardianEmail: text(row, 'guardian_email'), guardianPhone: text(row, 'guardian_phone'), emergencyName: text(row, 'emergency_name'), emergencyRelationship: text(row, 'emergency_relationship'), emergencyPhone: text(row, 'emergency_phone'), supportNotes: text(row, 'support_notes'), internalNotes: text(row, 'internal_notes'), needsRacket: boolean(row, 'needs_racket'), parentOnsite: boolean(row, 'parent_onsite'), selectedSessionIds: registrationSessions.get(text(row, 'id')) ?? [], registrationStatus: text(row, 'registration_status') as Registration['registrationStatus'], paymentStatus: text(row, 'payment_status') as Registration['paymentStatus'], submittedAt: text(row, 'submitted_at'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at'), archivedAt: nullableText(row, 'archived_at') })),
    consents: rows.consents.map((row): ConsentRecord => ({ id: text(row, 'id'), registrationId: text(row, 'registration_id'), type: text(row, 'type') as ConsentRecord['type'], version: text(row, 'version'), accepted: boolean(row, 'accepted'), respondedAt: nullableText(row, 'responded_at'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at') })),
    payments: rows.payments.map((row): PaymentRecord => ({ id: text(row, 'id'), registrationId: text(row, 'registration_id'), amountCents: number(row, 'amount_cents'), status: text(row, 'status') as PaymentRecord['status'], receivedAt: nullableText(row, 'received_at'), method: text(row, 'method'), note: text(row, 'note'), externalReference: text(row, 'external_reference'), receiptFileId: nullableText(row, 'receipt_file_id'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at') })),
    attendance: rows.attendance.map((row): AttendanceRecord => ({ id: text(row, 'id'), registrationId: text(row, 'registration_id'), sessionId: text(row, 'session_id'), status: text(row, 'status') as AttendanceRecord['status'], note: text(row, 'note'), recordedBy: nullableText(row, 'recorded_by'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at') })),
    organizations: rows.organizations.map((row): Organization => ({ id: text(row, 'id'), name: text(row, 'name'), type: text(row, 'type') as Organization['type'], website: text(row, 'website'), address: text(row, 'address'), leadStaffId: nullableText(row, 'lead_staff_id'), supportStaffIds: organizationSupport.get(text(row, 'id')) ?? [], primaryContact: text(row, 'primary_contact'), primaryContactEmail: text(row, 'primary_contact_email'), status: text(row, 'status') as Organization['status'], lastUpdate: text(row, 'last_update'), nextStep: text(row, 'next_step'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at'), archivedAt: nullableText(row, 'archived_at') })),
    interactions: rows.interactions.map((row): OrganizationInteraction => ({ id: text(row, 'id'), organizationId: text(row, 'organization_id'), occurredOn: text(row, 'occurred_on'), ownerId: nullableText(row, 'owner_id'), kind: text(row, 'kind') as OrganizationInteraction['kind'], outcome: text(row, 'outcome'), notes: text(row, 'notes'), nextAction: text(row, 'next_action'), createdAt: text(row, 'created_at') })),
    projects: rows.projects.map((row): Project => ({ id: text(row, 'id'), name: text(row, 'name'), ownerId: nullableText(row, 'owner_id'), contributorIds: projectContributors.get(text(row, 'id')) ?? [], status: text(row, 'status') as Project['status'], priority: text(row, 'priority') as Project['priority'], startDate: text(row, 'start_date'), targetDate: text(row, 'target_date'), description: text(row, 'description'), organizationId: nullableText(row, 'organization_id'), programId: nullableText(row, 'program_id'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at'), archivedAt: nullableText(row, 'archived_at') })),
    tasks: rows.tasks.map((row): Task => ({ id: text(row, 'id'), title: text(row, 'title'), ownerId: nullableText(row, 'owner_id'), dueDate: text(row, 'due_date'), status: text(row, 'status') as Task['status'], priority: text(row, 'priority') as Task['priority'], projectId: nullableText(row, 'project_id'), programId: nullableText(row, 'program_id'), organizationId: nullableText(row, 'organization_id'), notes: text(row, 'notes'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at'), archivedAt: nullableText(row, 'archived_at') })),
    financeEntries: rows.financeEntries.map((row): FinanceEntry => ({ id: text(row, 'id'), kind: text(row, 'kind') as FinanceEntry['kind'], programId: nullableText(row, 'program_id'), projectId: nullableText(row, 'project_id'), date: text(row, 'date'), description: text(row, 'description'), category: text(row, 'category'), amountCents: number(row, 'amount_cents'), paidBy: text(row, 'paid_by'), receiptFileId: nullableText(row, 'receipt_file_id'), reimbursementStatus: text(row, 'reimbursement_status') as FinanceEntry['reimbursementStatus'], createdBy: nullableText(row, 'created_by'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at'), archivedAt: nullableText(row, 'archived_at') })),
    files: rows.files.map((row): StoredFile => ({ id: text(row, 'id'), storagePath: text(row, 'storage_path'), name: text(row, 'name'), mediaType: text(row, 'media_type'), sizeBytes: number(row, 'size_bytes'), category: text(row, 'category') as StoredFile['category'], uploadedBy: nullableText(row, 'uploaded_by'), programId: nullableText(row, 'program_id'), organizationId: nullableText(row, 'organization_id'), projectId: nullableText(row, 'project_id'), registrationId: nullableText(row, 'registration_id'), createdAt: text(row, 'created_at') })),
    activity: rows.activity.map((row): ActivityRecord => ({ id: text(row, 'id'), actorId: nullableText(row, 'actor_id'), action: text(row, 'action'), entityType: text(row, 'entity_type'), entityId: nullableText(row, 'entity_id'), summary: text(row, 'summary'), metadata: (row.metadata && typeof row.metadata === 'object' ? row.metadata : {}) as Record<string, unknown>, createdAt: text(row, 'created_at') })),
    interestSignups: rows.interestSignups.map((row): InterestSignup => ({ id: text(row, 'id'), publicReference: text(row, 'public_reference'), parentName: text(row, 'parent_name'), phone: text(row, 'phone'), email: text(row, 'email'), childName: text(row, 'child_name'), grade: text(row, 'grade'), school: text(row, 'school'), workshop: text(row, 'workshop'), referral: text(row, 'referral'), comments: text(row, 'comments'), status: text(row, 'status') as InterestSignup['status'], submittedAt: text(row, 'submitted_at'), createdAt: text(row, 'created_at'), updatedAt: text(row, 'updated_at'), archivedAt: nullableText(row, 'archived_at') })),
  };
}

export function toSnakeCaseRecord(value: Record<string, unknown>): Row {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), item]));
}
