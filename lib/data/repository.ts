import type {
  AttendanceStatus,
  Coach,
  CoachAssignment,
  CoachDraft,
  ConsentRecord,
  FinanceEntry,
  FinanceEntryDraft,
  InteractionDraft,
  InterestSignup,
  OperationsState,
  Organization,
  OrganizationDraft,
  PaymentRecord,
  Program,
  ProgramDraft,
  Project,
  ProjectDraft,
  Registration,
  RegistrationPatch,
  SessionDraft,
  SessionRecord,
  StaffProfile,
  Task,
  TaskDraft,
  WorkspaceSettings,
} from './types';

export interface ManualRegistrationDraft extends RegistrationPatch {
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
  selectedSessionIds: string[];
}

export interface PaymentDraft {
  registrationId: string;
  amountCents: number;
  status: PaymentRecord['status'];
  receivedAt: string | null;
  method: string;
  note: string;
  externalReference: string;
}

export interface FileUploadDraft {
  file: File;
  category: 'document' | 'receipt' | 'curriculum' | 'notes';
  programId?: string | null;
  organizationId?: string | null;
  projectId?: string | null;
  registrationId?: string | null;
}

export interface OperationsRepository {
  loadWorkspace(): Promise<OperationsState>;
  subscribe(onInvalidate: () => void): () => void;
  createProgram(draft: ProgramDraft): Promise<Program>;
  updateProgram(id: string, patch: Partial<ProgramDraft>): Promise<Program>;
  archiveProgram(id: string): Promise<void>;
  createSession(draft: SessionDraft): Promise<SessionRecord>;
  updateSession(id: string, patch: Partial<SessionDraft>): Promise<SessionRecord>;
  createCoach(draft: CoachDraft): Promise<Coach>;
  updateCoach(id: string, patch: Partial<CoachDraft>): Promise<Coach>;
  archiveCoach(id: string): Promise<void>;
  assignCoach(sessionId: string, slot: CoachAssignment['slot'], coachId: string | null): Promise<void>;
  createManualRegistration(draft: ManualRegistrationDraft): Promise<Registration>;
  updateRegistration(id: string, patch: RegistrationPatch): Promise<Registration>;
  replaceRegistrationSessions(id: string, sessionIds: string[]): Promise<void>;
  upsertConsent(registrationId: string, consent: Pick<ConsentRecord, 'type' | 'version' | 'accepted' | 'respondedAt'>): Promise<ConsentRecord>;
  upsertAttendance(registrationId: string, sessionId: string, status: AttendanceStatus, note?: string): Promise<void>;
  recordPayment(draft: PaymentDraft): Promise<PaymentRecord>;
  archiveRegistration(id: string): Promise<void>;
  updateInterestSignup(id: string, status: InterestSignup['status']): Promise<InterestSignup>;
  createOrganization(draft: OrganizationDraft): Promise<Organization>;
  updateOrganization(id: string, patch: Partial<OrganizationDraft>): Promise<Organization>;
  archiveOrganization(id: string): Promise<void>;
  addOrganizationInteraction(draft: InteractionDraft): Promise<void>;
  createProject(draft: ProjectDraft): Promise<Project>;
  updateProject(id: string, patch: Partial<ProjectDraft>): Promise<Project>;
  archiveProject(id: string): Promise<void>;
  createTask(draft: TaskDraft): Promise<Task>;
  updateTask(id: string, patch: Partial<TaskDraft>): Promise<Task>;
  archiveTask(id: string): Promise<void>;
  createFinanceEntry(draft: FinanceEntryDraft): Promise<FinanceEntry>;
  updateFinanceEntry(id: string, patch: Partial<FinanceEntryDraft>): Promise<FinanceEntry>;
  archiveFinanceEntry(id: string): Promise<void>;
  updateSettings(patch: Partial<WorkspaceSettings>): Promise<WorkspaceSettings>;
  updateStaffProfile(id: string, patch: Partial<Pick<StaffProfile, 'name' | 'initials' | 'active' | 'role'>>): Promise<StaffProfile>;
  logActivity(action: string, entityType: string, entityId: string | null, summary: string, metadata?: Record<string, unknown>): Promise<void>;
  uploadFile(draft: FileUploadDraft): Promise<void>;
  createSignedFileUrl(storagePath: string): Promise<string>;
}
