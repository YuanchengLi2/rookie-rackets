export type StaffRole = 'admin' | 'staff';
export type ProgramStatus = 'draft' | 'planning' | 'registration-open' | 'full' | 'active' | 'completed' | 'canceled' | 'archived';
export type ProgramType = 'one-day-workshop' | 'multiweek-school-program' | 'camp' | 'recurring-partner-program' | 'community-event' | 'tournament' | 'clinic';
export type RegistrationStatus = 'incomplete' | 'confirmed' | 'waitlisted' | 'offer-sent' | 'canceled' | 'completed' | 'refunded' | 'archived';
export type RegistrationSource = 'online' | 'staff';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded' | 'partial-refund' | 'waived';
export type TaskStatus = 'not-started' | 'in-progress' | 'awaiting-reply' | 'blocked' | 'done' | 'canceled';
export type AttendanceStatus = 'not-marked' | 'present' | 'late' | 'absent' | 'parent-reported-absence' | 'canceled' | 'walk-in';
export type OrganizationStatus = 'researching' | 'not-contacted' | 'contacted' | 'follow-up-due' | 'meeting-scheduled' | 'interested' | 'planning' | 'active-partner' | 'paused' | 'declined' | 'dormant';
export type OrganizationType = 'school' | 'nonprofit' | 'sports-facility' | 'community-center' | 'college' | 'sponsor' | 'government' | 'other';
export type CoachSlot = 'lead' | 'coach-2' | 'coach-3' | 'coach-4' | 'backup';
export type ConsentType = 'participation-waiver' | 'photo-video' | 'program-acknowledgment' | 'pickup-policy';
export type FinanceKind = 'revenue' | 'expense';
export type CurriculumActivityKind = 'warm-up' | 'skill' | 'game' | 'cool-down';

export interface CurriculumActivity { id: string; kind: CurriculumActivityKind; title: string; minutes: number; instructions: string; }
export interface SessionCurriculum { objective: string; activities: CurriculumActivity[]; coachNotes: string; updatedAt: string | null; }
export interface StaffProfile { id: string; email: string; name: string; initials: string; role: StaffRole; active: boolean; createdAt: string; updatedAt: string; }
export interface WorkspaceSettings { organizationName: string; contactEmail: string; participationWaiverVersion: string; photoVideoVersion: string; programAcknowledgmentVersion: string; pickupPolicyVersion: string; confirmationCopy: string; }

export interface Program {
  id: string; slug: string; name: string; organizationId: string | null; type: ProgramType; description: string; venue: string;
  skillLevel: 'beginner' | 'intermediate' | 'mixed' | 'advanced'; eligibility: string; capacity: number; leadCoachId: string | null;
  status: ProgramStatus; visibility: 'public' | 'private'; priceCents: number; registrationDeadline: string; whatToBring: string[];
  equipmentProvided: boolean; image: string; contact: string; createdAt: string; updatedAt: string; archivedAt: string | null;
}

export interface SessionRecord {
  id: string; programId: string; date: string; startTime: string; endTime: string; arrivalTime: string; location: string;
  leadCoachId: string | null; curriculum: SessionCurriculum; status: 'scheduled' | 'completed' | 'canceled'; notes: string;
  createdAt: string; updatedAt: string;
}

export interface Coach { id: string; name: string; email: string; role: 'program-lead' | 'coach' | 'assistant' | 'volunteer'; active: boolean; experience: string; availability: 'available' | 'tentative' | 'unavailable' | 'informational'; volunteerMinutes: number; createdAt: string; updatedAt: string; archivedAt: string | null; }
export interface CoachAssignment { id: string; sessionId: string; coachId: string; slot: CoachSlot; accepted: boolean; createdAt: string; updatedAt: string; }

export interface Registration {
  id: string; publicReference: string; source: RegistrationSource; programId: string; childFirstName: string; childLastName: string;
  dateOfBirth: string; grade: string; skillLevel: string; guardianFirstName: string; guardianLastName: string; guardianEmail: string;
  guardianPhone: string; emergencyName: string; emergencyRelationship: string; emergencyPhone: string; supportNotes: string;
  internalNotes: string; needsRacket: boolean; parentOnsite: boolean; selectedSessionIds: string[]; registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus; submittedAt: string; createdAt: string; updatedAt: string; archivedAt: string | null;
}

export interface ConsentRecord { id: string; registrationId: string; type: ConsentType; version: string; accepted: boolean; respondedAt: string | null; createdAt: string; updatedAt: string; }
export interface PaymentRecord { id: string; registrationId: string; amountCents: number; status: PaymentStatus; receivedAt: string | null; method: string; note: string; externalReference: string; receiptFileId: string | null; createdAt: string; updatedAt: string; }
export interface AttendanceRecord { id: string; registrationId: string; sessionId: string; status: AttendanceStatus; note: string; recordedBy: string | null; createdAt: string; updatedAt: string; }

export interface Organization { id: string; name: string; type: OrganizationType; website: string; address: string; leadStaffId: string | null; supportStaffIds: string[]; primaryContact: string; primaryContactEmail: string; status: OrganizationStatus; lastUpdate: string; nextStep: string; createdAt: string; updatedAt: string; archivedAt: string | null; }
export interface OrganizationInteraction { id: string; organizationId: string; occurredOn: string; ownerId: string | null; kind: 'email' | 'call' | 'visit' | 'meeting'; outcome: string; notes: string; nextAction: string; createdAt: string; }
export interface Project { id: string; name: string; ownerId: string | null; contributorIds: string[]; status: 'planning' | 'in-progress' | 'blocked' | 'done'; priority: 'low' | 'medium' | 'high'; startDate: string; targetDate: string; description: string; organizationId: string | null; programId: string | null; createdAt: string; updatedAt: string; archivedAt: string | null; }
export interface Task { id: string; title: string; ownerId: string | null; dueDate: string; status: TaskStatus; priority: 'low' | 'medium' | 'high'; projectId: string | null; programId: string | null; organizationId: string | null; notes: string; createdAt: string; updatedAt: string; archivedAt: string | null; }
export interface FinanceEntry { id: string; kind: FinanceKind; programId: string | null; projectId: string | null; date: string; description: string; category: string; amountCents: number; paidBy: string; receiptFileId: string | null; reimbursementStatus: 'not-applicable' | 'requested' | 'approved' | 'paid'; createdBy: string | null; createdAt: string; updatedAt: string; archivedAt: string | null; }
export interface StoredFile { id: string; storagePath: string; name: string; mediaType: string; sizeBytes: number; category: 'document' | 'receipt' | 'curriculum' | 'notes'; uploadedBy: string | null; programId: string | null; organizationId: string | null; projectId: string | null; registrationId: string | null; createdAt: string; }
export interface ActivityRecord { id: string; actorId: string | null; action: string; entityType: string; entityId: string | null; summary: string; metadata: Record<string, unknown>; createdAt: string; }

export interface OperationsState {
  staffProfiles: StaffProfile[]; settings: WorkspaceSettings | null; programs: Program[]; sessions: SessionRecord[]; coaches: Coach[];
  assignments: CoachAssignment[]; registrations: Registration[]; consents: ConsentRecord[]; payments: PaymentRecord[];
  attendance: AttendanceRecord[]; organizations: Organization[]; interactions: OrganizationInteraction[]; projects: Project[];
  tasks: Task[]; financeEntries: FinanceEntry[]; files: StoredFile[]; activity: ActivityRecord[];
}

export type ProgramDraft = Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'archivedAt'>;
export type SessionDraft = Omit<SessionRecord, 'id' | 'createdAt' | 'updatedAt'>;
export type CoachDraft = Omit<Coach, 'id' | 'createdAt' | 'updatedAt' | 'archivedAt'>;
export type RegistrationPatch = Partial<Omit<Registration, 'id' | 'publicReference' | 'source' | 'submittedAt' | 'createdAt' | 'updatedAt'>>;
export type OrganizationDraft = Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'archivedAt'>;
export type InteractionDraft = Omit<OrganizationInteraction, 'id' | 'ownerId' | 'createdAt'> & { ownerId?: string | null };
export type ProjectDraft = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archivedAt'>;
export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'archivedAt'>;
export type FinanceEntryDraft = Omit<FinanceEntry, 'id' | 'receiptFileId' | 'createdBy' | 'createdAt' | 'updatedAt' | 'archivedAt'>;

export const emptyOperationsState = (): OperationsState => ({
  staffProfiles: [], settings: null, programs: [], sessions: [], coaches: [], assignments: [], registrations: [], consents: [], payments: [],
  attendance: [], organizations: [], interactions: [], projects: [], tasks: [], financeEntries: [], files: [], activity: [],
});
