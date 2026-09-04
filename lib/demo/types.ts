export type DemoRole = 'family' | 'staff';

export type ProgramStatus =
  | 'draft'
  | 'planning'
  | 'registration-open'
  | 'full'
  | 'active'
  | 'completed'
  | 'canceled'
  | 'archived';

export type ProgramType =
  | 'one-day-workshop'
  | 'multiweek-school-program'
  | 'camp'
  | 'recurring-partner-program'
  | 'community-event'
  | 'tournament'
  | 'clinic';

export type RegistrationStatus =
  | 'incomplete'
  | 'confirmed'
  | 'waitlisted'
  | 'offer-sent'
  | 'canceled'
  | 'completed'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partial-refund'
  | 'waived';

export type TaskStatus =
  | 'not-started'
  | 'in-progress'
  | 'awaiting-reply'
  | 'blocked'
  | 'done'
  | 'canceled';

export type AttendanceStatus =
  | 'not-marked'
  | 'present'
  | 'late'
  | 'absent'
  | 'parent-reported-absence'
  | 'canceled'
  | 'walk-in';

export type OrganizationStatus =
  | 'researching'
  | 'not-contacted'
  | 'contacted'
  | 'follow-up-due'
  | 'meeting-scheduled'
  | 'interested'
  | 'planning'
  | 'active-partner'
  | 'paused'
  | 'declined'
  | 'dormant';

export type OrganizationType =
  | 'school'
  | 'nonprofit'
  | 'sports-facility'
  | 'community-center'
  | 'college'
  | 'sponsor'
  | 'government'
  | 'other';

export type CoachSlot = 'lead' | 'coach-2' | 'coach-3' | 'coach-4' | 'backup';
export type ConsentType = 'participation-waiver' | 'photo-video' | 'program-acknowledgment' | 'pickup-policy';
export type FinanceKind = 'revenue' | 'expense';
export type CurriculumActivityKind = 'warm-up' | 'skill' | 'game' | 'cool-down';

export interface CurriculumActivity {
  id: string;
  kind: CurriculumActivityKind;
  title: string;
  minutes: number;
  instructions: string;
}

export interface SessionCurriculum {
  objective: string;
  activities: CurriculumActivity[];
  coachNotes: string;
  updatedAt: string | null;
}

export interface DemoSession {
  role: DemoRole;
  profileId: string;
}

export interface FamilyProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailUpdates: boolean;
}

export interface StaffProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  organizationId: string;
  type: ProgramType;
  description: string;
  venue: string;
  skillLevel: 'beginner' | 'intermediate' | 'mixed' | 'advanced';
  eligibility: string;
  capacity: number;
  leadCoachId: string;
  status: ProgramStatus;
  visibility: 'public' | 'private';
  price: number;
  registrationDeadline: string;
  whatToBring: string[];
  equipmentProvided: boolean;
  image: string;
  contact: string;
}

export interface SessionRecord {
  id: string;
  programId: string;
  date: string;
  startTime: string;
  endTime: string;
  arrivalTime: string;
  location: string;
  coachIds: string[];
  leadCoachId: string | null;
  curriculumFileId: string;
  curriculum: SessionCurriculum;
  status: 'scheduled' | 'completed' | 'canceled';
  notes: string;
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  role: 'program-lead' | 'coach' | 'assistant' | 'volunteer';
  active: boolean;
  experience: string;
  availability: 'available' | 'tentative' | 'unavailable' | 'informational';
  volunteerHours: number;
  assignmentIds: string[];
}

export interface CoachAssignment {
  id: string;
  sessionId: string;
  coachId: string;
  slot: CoachSlot;
  accepted: boolean;
}

export interface Registration {
  id: string;
  familyId: string;
  programId: string;
  childFirstName: string;
  childLastName: string;
  dateOfBirth: string;
  grade: string;
  skillLevel: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail: string;
  guardianPhone: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  supportNotes: string;
  needsRacket: boolean;
  parentOnsite: boolean;
  selectedSessionIds: string[];
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  registrationId: string;
  type: ConsentType;
  version: string;
  accepted: boolean;
  acceptedAt: string | null;
}

export interface PaymentRecord {
  id: string;
  registrationId: string;
  programId: string;
  amount: number;
  status: PaymentStatus;
  paymentDate: string | null;
  receiptNumber: string;
  note: string;
  receiptFileId?: string | null;
}

export interface AttendanceRecord {
  id: string;
  registrationId: string;
  sessionId: string;
  status: AttendanceStatus;
  note: string;
  updatedAt: string | null;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  website: string;
  address: string;
  leadStaffId: string;
  supportStaff: string[];
  primaryContact: string;
  primaryContactEmail: string;
  status: OrganizationStatus;
  lastUpdate: string;
  nextStep: string;
  programIds: string[];
  projectIds: string[];
  driveFileIds: string[];
}

export interface OrganizationInteraction {
  id: string;
  organizationId: string;
  date: string;
  ownerId: string;
  kind: 'email' | 'call' | 'visit' | 'meeting';
  outcome: string;
  notes: string;
  nextAction: string;
}

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  contributorIds: string[];
  status: 'planning' | 'in-progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  targetDate: string;
  description: string;
  organizationId: string | null;
  programId: string | null;
  driveFileIds: string[];
}

export type ProjectPatch = Partial<Pick<Project, 'ownerId' | 'status' | 'targetDate' | 'description'>>;

export interface Task {
  id: string;
  title: string;
  ownerId: string;
  dueDate: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  projectId: string | null;
  programId: string | null;
  organizationId: string | null;
  notes: string;
}

export interface FinanceEntry {
  id: string;
  kind: FinanceKind;
  programId: string | null;
  projectId: string | null;
  date: string;
  description: string;
  category: string;
  amount: number;
  paidBy: string;
  receiptFileId: string | null;
  reimbursementStatus: 'not-applicable' | 'requested' | 'approved' | 'paid';
}

export interface DemoFile {
  id: string;
  name: string;
  kind: 'drive-folder' | 'document' | 'receipt' | 'sheet' | 'notes';
  description: string;
  updatedAt: string;
}

export interface ActivityRecord {
  id: string;
  date: string;
  message: string;
  kind: 'registration' | 'program' | 'coach' | 'organization' | 'project' | 'finance' | 'system';
}

export interface DemoState {
  version: 2;
  demoDate: '2026-09-02';
  session: DemoSession | null;
  familyProfiles: FamilyProfile[];
  staffProfiles: StaffProfile[];
  programs: Program[];
  sessions: SessionRecord[];
  coaches: Coach[];
  assignments: CoachAssignment[];
  registrations: Registration[];
  consents: ConsentRecord[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  organizations: Organization[];
  interactions: OrganizationInteraction[];
  projects: Project[];
  tasks: Task[];
  financeEntries: FinanceEntry[];
  files: DemoFile[];
  activity: ActivityRecord[];
}

export interface RegistrationDraft {
  programId: string;
  childFirstName: string;
  childLastName: string;
  dateOfBirth: string;
  grade: string;
  skillLevel: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail: string;
  guardianPhone: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  supportNotes: string;
  needsRacket: boolean;
  parentOnsite: boolean;
  selectedSessionIds: string[];
  photoConsent: boolean;
  participationAccepted: boolean;
  acknowledgmentAccepted: boolean;
  pickupAccepted: boolean;
}

export type FamilyProfilePatch = Partial<Pick<FamilyProfile, 'firstName' | 'lastName' | 'email' | 'phone' | 'emailUpdates'>>;
export type ProgramDraft = Pick<Program, 'name' | 'organizationId' | 'type' | 'venue' | 'capacity' | 'leadCoachId' | 'status' | 'visibility' | 'price' | 'registrationDeadline'> & { description: string };
export type ProgramPatch = Partial<Pick<Program, 'name' | 'description' | 'venue' | 'capacity' | 'leadCoachId' | 'status' | 'visibility' | 'registrationDeadline'>>;
export type OrganizationPatch = Partial<Pick<Organization, 'status' | 'nextStep' | 'lastUpdate' | 'primaryContact' | 'primaryContactEmail'>>;
export interface InteractionDraft { kind: OrganizationInteraction['kind']; outcome: string; notes: string; nextAction: string; }
export interface TaskDraft { title: string; ownerId: string; dueDate: string; status: TaskStatus; priority: Task['priority']; projectId?: string | null; programId?: string | null; organizationId?: string | null; notes?: string; }
export type TaskPatch = Partial<Pick<Task, 'title' | 'ownerId' | 'dueDate' | 'status' | 'priority' | 'notes'>>;
export interface FinanceEntryDraft { kind: FinanceKind; programId?: string | null; projectId?: string | null; date: string; description: string; category: string; amount: number; paidBy: string; }
