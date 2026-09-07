import { createSeedState } from './seed';
import type {
  ActivityRecord,
  AttendanceRecord,
  CoachAssignment,
  CoachSlot,
  ConsentRecord,
  DemoSession,
  DemoState,
  FamilyProfilePatch,
  FinanceEntry,
  FinanceEntryDraft,
  InteractionDraft,
  OrganizationPatch,
  ProgramDraft,
  ProgramPatch,
  ProjectPatch,
  Registration,
  SessionRecord,
  SessionCurriculum,
  TaskDraft,
  TaskPatch,
} from './types';

export type DemoAction =
  | { type: 'LOAD_DATA'; state: DemoState }
  | { type: 'SET_SESSION'; session: DemoSession | null }
  | { type: 'REGISTER_FOR_PROGRAM'; registration: Registration; consents?: ConsentRecord[]; payment?: import('./types').PaymentRecord; attendance?: AttendanceRecord[] }
  | { type: 'REPORT_ABSENCE'; registrationId: string; sessionId: string; note?: string }
  | { type: 'ACCEPT_WAITLIST_OFFER'; registrationId: string }
  | { type: 'UPDATE_FAMILY_PROFILE'; familyId: string; patch: FamilyProfilePatch }
  | { type: 'UPDATE_CONSENT'; registrationId: string; consentType: ConsentRecord['type']; accepted: boolean }
  | { type: 'CREATE_PROGRAM'; id: string; slug: string; draft: ProgramDraft }
  | { type: 'UPDATE_PROGRAM'; programId: string; patch: ProgramPatch }
  | { type: 'UPDATE_SESSION_STATUS'; sessionId: string; status: SessionRecord['status'] }
  | { type: 'UPDATE_SESSION_CURRICULUM'; sessionId: string; curriculum: SessionCurriculum }
  | { type: 'UPDATE_PROJECT'; projectId: string; patch: ProjectPatch }
  | { type: 'ASSIGN_COACH'; sessionId: string; slot: CoachSlot; coachId: string | null }
  | { type: 'SET_ATTENDANCE'; registrationId: string; sessionId: string; status: AttendanceRecord['status']; note?: string }
  | { type: 'UPDATE_REGISTRATION_STATUS'; registrationId: string; status: Registration['registrationStatus'] }
  | { type: 'UPDATE_ORGANIZATION'; organizationId: string; patch: OrganizationPatch }
  | { type: 'ADD_ORGANIZATION_INTERACTION'; id: string; organizationId: string; ownerId: string; date: string; draft: InteractionDraft }
  | { type: 'ADD_TASK'; id: string; draft: TaskDraft }
  | { type: 'UPDATE_TASK'; taskId: string; patch: TaskPatch }
  | { type: 'ADD_FINANCE_ENTRY'; id: string; draft: FinanceEntryDraft }
  | { type: 'LOG_ACTIVITY'; id: string; date: string; message: string; kind: ActivityRecord['kind'] }
  | { type: 'RESET_DATA' };

function addActivity(state: DemoState, activity: Omit<ActivityRecord, 'id'>, id: string): DemoState {
  return { ...state, activity: [{ id, ...activity }, ...state.activity].slice(0, 30) };
}

function slotIndex(slot: CoachSlot): number {
  return slot === 'lead' ? 0 : slot === 'coach-2' ? 1 : slot === 'coach-3' ? 2 : slot === 'coach-4' ? 3 : 4;
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.state;
    case 'SET_SESSION':
      return { ...state, session: action.session };
    case 'REGISTER_FOR_PROGRAM': {
      const program = state.programs.find((item) => item.id === action.registration.programId);
      const registrations = [...state.registrations.filter((item) => item.id !== action.registration.id), action.registration];
      const consents = action.consents ? [...state.consents.filter((item) => item.registrationId !== action.registration.id), ...action.consents] : state.consents;
      const payments = action.payment ? [...state.payments.filter((item) => item.id !== action.payment?.id), action.payment] : state.payments;
      const attendance = action.attendance ? [...state.attendance.filter((item) => item.registrationId !== action.registration.id), ...action.attendance] : state.attendance;
      const confirmedCount = registrations.filter((item) => item.programId === program?.id && ['confirmed', 'offer-sent'].includes(item.registrationStatus)).length;
      const programs = program && confirmedCount >= program.capacity && ['active', 'registration-open', 'full'].includes(program.status)
        ? state.programs.map((item) => item.id === program.id ? { ...item, status: 'full' as const } : item)
        : state.programs;
      const next = { ...state, programs, registrations, consents, payments, attendance };
      return addActivity(next, { date: state.demoDate, message: `${action.registration.childFirstName} ${action.registration.childLastName} registered for ${program?.name ?? 'a program'}.`, kind: 'registration' }, `activity-registration-${action.registration.id}`);
    }
    case 'REPORT_ABSENCE': {
      const id = state.attendance.find((item) => item.registrationId === action.registrationId && item.sessionId === action.sessionId)?.id ?? `attendance-${action.registrationId}-${action.sessionId}`;
      const record: AttendanceRecord = { id, registrationId: action.registrationId, sessionId: action.sessionId, status: 'parent-reported-absence', note: action.note ?? '', updatedAt: state.demoDate };
      const next = { ...state, attendance: [...state.attendance.filter((item) => item.id !== id), record] };
      return addActivity(next, { date: state.demoDate, message: 'A parent-reported absence was added to the session roster.', kind: 'registration' }, `activity-absence-${id}`);
    }
    case 'ACCEPT_WAITLIST_OFFER': {
      const registration = state.registrations.find((item) => item.id === action.registrationId);
      if (!registration) return state;
      const next: DemoState = { ...state, registrations: state.registrations.map((item) => item.id === action.registrationId ? { ...item, registrationStatus: 'confirmed' as const } : item) };
      return addActivity(next, { date: state.demoDate, message: `${registration.childFirstName} ${registration.childLastName} accepted a demo waitlist offer.`, kind: 'registration' }, `activity-waitlist-${action.registrationId}`);
    }
    case 'UPDATE_FAMILY_PROFILE':
      return { ...state, familyProfiles: state.familyProfiles.map((profile) => profile.id === action.familyId ? { ...profile, ...action.patch } : profile) };
    case 'UPDATE_CONSENT': {
      const consents = state.consents.map((consent) => consent.registrationId === action.registrationId && consent.type === action.consentType ? { ...consent, accepted: action.accepted, acceptedAt: action.accepted ? state.demoDate : null } : consent);
      const registration = state.registrations.find((item) => item.id === action.registrationId);
      const requiredComplete = consents.filter((item) => item.registrationId === action.registrationId && item.type !== 'photo-video').every((item) => item.accepted);
      const registrations = registration && ['incomplete', 'confirmed'].includes(registration.registrationStatus)
        ? state.registrations.map((item) => item.id === action.registrationId ? { ...item, registrationStatus: requiredComplete ? 'confirmed' as const : 'incomplete' as const } : item)
        : state.registrations;
      const next = { ...state, consents, registrations };
      return addActivity(next, { date: state.demoDate, message: `A ${action.consentType.replaceAll('-', ' ')} response was updated.`, kind: 'registration' }, `activity-consent-${action.registrationId}-${action.consentType}`);
    }
    case 'CREATE_PROGRAM': {
      const program = { ...action.draft, id: action.id, slug: action.slug, description: action.draft.description, skillLevel: 'mixed' as const, eligibility: 'All ages', registrationDeadline: action.draft.registrationDeadline, whatToBring: ['Athletic shoes'], equipmentProvided: true, image: '/images/story.webp', contact: 'Rookie Rackets team · teamrookierackets@gmail.com' };
      const next = { ...state, programs: [...state.programs, program] };
      return addActivity(next, { date: state.demoDate, message: `Created the ${program.name} demo program.`, kind: 'program' }, `activity-program-${action.id}`);
    }
    case 'UPDATE_PROGRAM': {
      const program = state.programs.find((item) => item.id === action.programId);
      if (!program) return state;
      const next = { ...state, programs: state.programs.map((item) => item.id === action.programId ? { ...item, ...action.patch } : item) };
      return addActivity(next, { date: state.demoDate, message: `Updated ${program.name}.`, kind: 'program' }, `activity-program-update-${action.programId}-${state.activity.length}`);
    }
    case 'UPDATE_SESSION_STATUS': {
      const session = state.sessions.find((item) => item.id === action.sessionId);
      if (!session) return state;
      const next = { ...state, sessions: state.sessions.map((item) => item.id === action.sessionId ? { ...item, status: action.status } : item) };
      return addActivity(next, { date: state.demoDate, message: `Session on ${session.date} is now ${action.status}.`, kind: 'program' }, `activity-session-status-${action.sessionId}-${state.activity.length}`);
    }
    case 'UPDATE_SESSION_CURRICULUM': {
      const session = state.sessions.find((item) => item.id === action.sessionId);
      if (!session) return state;
      const next = { ...state, sessions: state.sessions.map((item) => item.id === action.sessionId ? { ...item, curriculum: action.curriculum } : item) };
      return addActivity(next, { date: state.demoDate, message: `Updated curriculum for the ${session.date} session.`, kind: 'program' }, `activity-curriculum-${action.sessionId}-${state.activity.length}`);
    }
    case 'UPDATE_PROJECT': {
      const project = state.projects.find((item) => item.id === action.projectId);
      if (!project) return state;
      const next = { ...state, projects: state.projects.map((item) => item.id === action.projectId ? { ...item, ...action.patch } : item) };
      return addActivity(next, { date: state.demoDate, message: `Updated ${project.name}.`, kind: 'project' }, `activity-project-update-${action.projectId}-${state.activity.length}`);
    }
    case 'ASSIGN_COACH': {
      const session = state.sessions.find((item) => item.id === action.sessionId);
      if (!session) return state;
      const index = slotIndex(action.slot);
      const coachIds = [...session.coachIds];
      const previousCoachId = coachIds[index] ?? null;
      coachIds[index] = action.coachId ?? '';
      const assignmentId = `assignment-${action.sessionId}-${action.slot}`;
      const assignments: CoachAssignment[] = [
        ...state.assignments.filter((assignment) => assignment.id !== assignmentId),
        ...(action.coachId ? [{ id: assignmentId, sessionId: action.sessionId, coachId: action.coachId, slot: action.slot, accepted: true }] : []),
      ];
      const coachAssignmentIds = new Map<string, string[]>();
      assignments.forEach((assignment) => coachAssignmentIds.set(assignment.coachId, [...(coachAssignmentIds.get(assignment.coachId) ?? []), assignment.id]));
      const next = {
        ...state,
        sessions: state.sessions.map((item) => item.id === action.sessionId ? { ...item, coachIds, leadCoachId: action.slot === 'lead' ? action.coachId : item.leadCoachId } : item),
        assignments,
        coaches: state.coaches.map((coach) => ({ ...coach, assignmentIds: coachAssignmentIds.get(coach.id) ?? [] })),
      };
      const coach = action.coachId ? state.coaches.find((item) => item.id === action.coachId)?.name : 'No coach';
      return addActivity(next, { date: state.demoDate, message: `${coach ?? 'Coach'} was assigned to a session${previousCoachId ? ' in place of an existing assignment' : ''}.`, kind: 'coach' }, `activity-coach-${action.sessionId}-${action.slot}-${state.activity.length}`);
    }
    case 'SET_ATTENDANCE': {
      const id = state.attendance.find((item) => item.registrationId === action.registrationId && item.sessionId === action.sessionId)?.id ?? `attendance-${action.registrationId}-${action.sessionId}`;
      const record: AttendanceRecord = { id, registrationId: action.registrationId, sessionId: action.sessionId, status: action.status, note: action.note ?? '', updatedAt: state.demoDate };
      return { ...state, attendance: [...state.attendance.filter((item) => item.id !== id), record] };
    }
    case 'UPDATE_REGISTRATION_STATUS': {
      const registration = state.registrations.find((item) => item.id === action.registrationId);
      if (!registration) return state;
      const next = { ...state, registrations: state.registrations.map((item) => item.id === action.registrationId ? { ...item, registrationStatus: action.status } : item) };
      return addActivity(next, { date: state.demoDate, message: `${registration.childFirstName} ${registration.childLastName}'s registration is now ${action.status.replaceAll('-', ' ')}.`, kind: 'registration' }, `activity-registration-status-${action.registrationId}-${state.activity.length}`);
    }
    case 'UPDATE_ORGANIZATION': {
      const organization = state.organizations.find((item) => item.id === action.organizationId);
      if (!organization) return state;
      const next = { ...state, organizations: state.organizations.map((item) => item.id === action.organizationId ? { ...item, ...action.patch } : item) };
      return addActivity(next, { date: state.demoDate, message: `Updated ${organization.name}: ${action.patch.nextStep ?? organization.nextStep}.`, kind: 'organization' }, `activity-org-update-${action.organizationId}-${state.activity.length}`);
    }
    case 'ADD_ORGANIZATION_INTERACTION': {
      const interaction = { id: action.id, organizationId: action.organizationId, ownerId: action.ownerId, date: action.date, ...action.draft };
      const next = { ...state, interactions: [interaction, ...state.interactions], organizations: state.organizations.map((organization) => organization.id === action.organizationId ? { ...organization, lastUpdate: action.draft.outcome, nextStep: action.draft.nextAction } : organization) };
      return addActivity(next, { date: action.date, message: `Logged a ${action.draft.kind} update for ${state.organizations.find((item) => item.id === action.organizationId)?.name ?? 'an organization'}.`, kind: 'organization' }, `activity-org-interaction-${action.id}`);
    }
    case 'ADD_TASK': {
      const task = { id: action.id, ...action.draft, projectId: action.draft.projectId ?? null, programId: action.draft.programId ?? null, organizationId: action.draft.organizationId ?? null, notes: action.draft.notes ?? '' };
      const next = { ...state, tasks: [...state.tasks, task] };
      return addActivity(next, { date: state.demoDate, message: `Added task: ${task.title}.`, kind: 'project' }, `activity-task-${action.id}`);
    }
    case 'UPDATE_TASK': {
      const task = state.tasks.find((item) => item.id === action.taskId);
      if (!task) return state;
      const next = { ...state, tasks: state.tasks.map((item) => item.id === action.taskId ? { ...item, ...action.patch } : item) };
      return addActivity(next, { date: state.demoDate, message: `${task.title} is now ${action.patch.status ?? task.status}.`, kind: 'project' }, `activity-task-update-${action.taskId}-${state.activity.length}`);
    }
    case 'ADD_FINANCE_ENTRY': {
      const entry: FinanceEntry = { id: action.id, ...action.draft, programId: action.draft.programId ?? null, projectId: action.draft.projectId ?? null, receiptFileId: null, reimbursementStatus: 'not-applicable' };
      const next = { ...state, financeEntries: [...state.financeEntries, entry] };
      return addActivity(next, { date: action.draft.date, message: `Added a ${action.draft.kind}: ${action.draft.description}.`, kind: 'finance' }, `activity-finance-${action.id}`);
    }
    case 'LOG_ACTIVITY':
      return addActivity(state, { date: action.date, message: action.message, kind: action.kind }, action.id);
    case 'RESET_DATA': {
      const fresh = createSeedState();
      return { ...fresh, session: state.session };
    }
    default:
      return state;
  }
}
