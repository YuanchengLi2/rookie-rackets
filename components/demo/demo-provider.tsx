'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { demoReducer } from '../../lib/demo/reducer';
import { createSeedState } from '../../lib/demo/seed';
import { getProgramCapacity } from '../../lib/demo/selectors';
import { loadDemoState, saveDemoState } from '../../lib/demo/storage';
import { useOperations } from '../data/operations-provider';
import { createBrowserSupabaseClient } from '../../lib/supabase/browser';
import type {
  CoachSlot,
  ConsentType,
  DemoRole,
  DemoState,
  FamilyProfilePatch,
  FinanceEntryDraft,
  FamilyProfile,
  InteractionDraft,
  OrganizationPatch,
  ProgramDraft,
  ProgramPatch,
  ProjectPatch,
  RegistrationDraft,
  Registration,
  SessionCurriculum,
  TaskDraft,
  TaskPatch,
} from '../../lib/demo/types';

interface DemoContextValue {
  state: DemoState;
  hydrated: boolean;
  toast: string | null;
  dismissToast: () => void;
  signInAs: (role: DemoRole) => void;
  signOut: () => void;
  resetDemoData: () => void;
  registerForProgram: (draft: RegistrationDraft) => string;
  reportAbsence: (registrationId: string, sessionId: string, note?: string) => void;
  acceptWaitlistOffer: (registrationId: string) => void;
  updateFamilyProfile: (patch: FamilyProfilePatch) => void;
  updateConsent: (registrationId: string, consentType: ConsentType, accepted: boolean) => void;
  createProgram: (draft: ProgramDraft) => string;
  updateProgram: (programId: string, patch: ProgramPatch) => void;
  updateSessionStatus: (sessionId: string, status: import('../../lib/demo/types').SessionRecord['status']) => void;
  updateSessionCurriculum: (sessionId: string, curriculum: SessionCurriculum) => void;
  updateProject: (projectId: string, patch: ProjectPatch) => void;
  assignCoach: (sessionId: string, slot: CoachSlot, coachId: string | null) => void;
  setAttendance: (registrationId: string, sessionId: string, status: import('../../lib/demo/types').AttendanceStatus, note?: string) => void;
  updateRegistrationStatus: (registrationId: string, status: import('../../lib/demo/types').RegistrationStatus) => void;
  updateOrganization: (organizationId: string, patch: OrganizationPatch) => void;
  addOrganizationInteraction: (organizationId: string, draft: InteractionDraft) => void;
  addTask: (draft: TaskDraft) => string;
  updateTask: (taskId: string, patch: TaskPatch) => void;
  addFinanceEntry: (draft: FinanceEntryDraft) => string;
  logActivity: (message: string, kind?: import('../../lib/demo/types').ActivityRecord['kind']) => void;
  getCurrentFamily: () => FamilyProfile | undefined;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function makeId(prefix: string): string {
  const randomUuid = typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomUuid}`;
}

function LocalDemoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, createSeedState);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadDemoState(window.localStorage);
    const timer = window.setTimeout(() => {
      dispatch({ type: 'LOAD_DATA', state: loaded.state });
      setHydrated(true);
      if (loaded.recovered) setToast('Demo data was reset because saved local data was invalid.');
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) saveDemoState(window.localStorage, state);
  }, [hydrated, state]);

  const notify = useCallback((message: string) => setToast(message), []);
  const signInAs = useCallback((role: DemoRole) => {
    dispatch({ type: 'SET_SESSION', session: { role, profileId: role === 'family' ? 'family-demo' : 'staff-demo' } });
    notify(`Signed in to the ${role === 'family' ? 'family portal' : 'staff hub'} demo.`);
  }, [notify]);
  const signOut = useCallback(() => {
    dispatch({ type: 'SET_SESSION', session: null });
    notify('You signed out of the demo.');
  }, [notify]);
  const resetDemoData = useCallback(() => {
    dispatch({ type: 'RESET_DATA' });
    notify('Demo data restored to the original walkthrough.');
  }, [notify]);
  const registerForProgram = useCallback((draft: RegistrationDraft) => {
    const id = makeId('registration');
    const program = state.programs.find((item) => item.id === draft.programId || item.slug === draft.programId);
    if (!program || ['completed', 'canceled', 'archived', 'draft'].includes(program.status)) {
      notify('This program is not accepting demo registrations.');
      return '';
    }
    const selectedSessionIds = [...new Set(draft.selectedSessionIds)].filter((sessionId) => state.sessions.some((session) => session.id === sessionId && session.programId === program.id && session.status === 'scheduled'));
    if (selectedSessionIds.length === 0) {
      notify('Choose at least one available date.');
      return '';
    }
    const capacity = getProgramCapacity(state, program.id);
    const registrationStatus = program.status === 'full' || capacity.remaining <= 0 ? 'waitlisted' : 'confirmed';
    const paymentStatus = program.price === 0 ? 'waived' as const : 'paid' as const;
    const registration: Registration = {
      id, familyId: 'family-demo', programId: program.id, childFirstName: draft.childFirstName, childLastName: draft.childLastName,
      dateOfBirth: draft.dateOfBirth, grade: draft.grade, skillLevel: draft.skillLevel, guardianFirstName: draft.guardianFirstName,
      guardianLastName: draft.guardianLastName, guardianEmail: draft.guardianEmail, guardianPhone: draft.guardianPhone, emergencyName: draft.emergencyName,
      emergencyRelationship: draft.emergencyRelationship, emergencyPhone: draft.emergencyPhone, supportNotes: draft.supportNotes, needsRacket: draft.needsRacket,
      parentOnsite: draft.parentOnsite, selectedSessionIds, registrationStatus, paymentStatus, createdAt: state.demoDate,
    };
    const consentTypes: Array<[ConsentType, boolean]> = [
      ['participation-waiver', draft.participationAccepted], ['photo-video', draft.photoConsent], ['program-acknowledgment', draft.acknowledgmentAccepted], ['pickup-policy', draft.pickupAccepted],
    ];
    const consents = consentTypes.map(([type, accepted]) => ({ id: `${id}-${type}`, registrationId: id, type, version: '2026.1', accepted, acceptedAt: accepted ? state.demoDate : null }));
    const attendance = selectedSessionIds.map((sessionId) => ({ id: `${id}-${sessionId}`, registrationId: id, sessionId, status: 'not-marked' as const, note: '', updatedAt: null }));
    dispatch({ type: 'REGISTER_FOR_PROGRAM', registration, consents, payment: { id: `${id}-payment`, registrationId: id, programId: program.id, amount: program.price, status: paymentStatus, paymentDate: state.demoDate, receiptNumber: `RR-DEMO-${Date.now().toString().slice(-5)}`, note: program.price === 0 ? 'Free community program' : 'Fictional demo payment' }, attendance });
    notify(registrationStatus === 'confirmed' ? 'Registration confirmed in the demo.' : 'The program is full, so this demo registration joined the waitlist.');
    return id;
  }, [notify, state]);
  const reportAbsence = useCallback((registrationId: string, sessionId: string, note?: string) => { dispatch({ type: 'REPORT_ABSENCE', registrationId, sessionId, note }); notify('The parent-reported absence is now visible to staff.'); }, [notify]);
  const acceptWaitlistOffer = useCallback((registrationId: string) => { dispatch({ type: 'ACCEPT_WAITLIST_OFFER', registrationId }); notify('The demo spot is now confirmed.'); }, [notify]);
  const updateFamilyProfile = useCallback((patch: FamilyProfilePatch) => { dispatch({ type: 'UPDATE_FAMILY_PROFILE', familyId: 'family-demo', patch }); notify('Family contact details saved locally.'); }, [notify]);
  const updateConsent = useCallback((registrationId: string, consentType: ConsentType, accepted: boolean) => { dispatch({ type: 'UPDATE_CONSENT', registrationId, consentType, accepted }); notify('Form response saved locally.'); }, [notify]);
  const createProgram = useCallback((draft: ProgramDraft) => { const id = makeId('program'); const slug = `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${id.slice(-5)}`; dispatch({ type: 'CREATE_PROGRAM', id, slug, draft }); notify('Demo program created.'); return id; }, [notify]);
  const updateProgram = useCallback((programId: string, patch: ProgramPatch) => { dispatch({ type: 'UPDATE_PROGRAM', programId, patch }); notify('Program changes saved locally.'); }, [notify]);
  const updateSessionStatus = useCallback((sessionId: string, status: import('../../lib/demo/types').SessionRecord['status']) => { dispatch({ type: 'UPDATE_SESSION_STATUS', sessionId, status }); notify('Session status updated locally.'); }, [notify]);
  const updateSessionCurriculum = useCallback((sessionId: string, curriculum: SessionCurriculum) => { dispatch({ type: 'UPDATE_SESSION_CURRICULUM', sessionId, curriculum: { ...curriculum, updatedAt: state.demoDate } }); notify('Curriculum saved locally.'); }, [notify, state.demoDate]);
  const updateProject = useCallback((projectId: string, patch: ProjectPatch) => { dispatch({ type: 'UPDATE_PROJECT', projectId, patch }); notify('Project changes saved locally.'); }, [notify]);
  const assignCoach = useCallback((sessionId: string, slot: CoachSlot, coachId: string | null) => { dispatch({ type: 'ASSIGN_COACH', sessionId, slot, coachId }); notify('Coach assignment updated.'); }, [notify]);
  const setAttendance = useCallback((registrationId: string, sessionId: string, status: import('../../lib/demo/types').AttendanceStatus, note?: string) => { dispatch({ type: 'SET_ATTENDANCE', registrationId, sessionId, status, note }); notify('Attendance updated in the demo roster.'); }, [notify]);
  const updateRegistrationStatus = useCallback((registrationId: string, status: import('../../lib/demo/types').RegistrationStatus) => { dispatch({ type: 'UPDATE_REGISTRATION_STATUS', registrationId, status }); notify('Registration status updated.'); }, [notify]);
  const updateOrganization = useCallback((organizationId: string, patch: OrganizationPatch) => { dispatch({ type: 'UPDATE_ORGANIZATION', organizationId, patch }); notify('Organization update saved locally.'); }, [notify]);
  const addOrganizationInteraction = useCallback((organizationId: string, draft: InteractionDraft) => { dispatch({ type: 'ADD_ORGANIZATION_INTERACTION', id: makeId('interaction'), organizationId, ownerId: 'staff-demo', date: state.demoDate, draft }); notify('Partner update added to the timeline.'); }, [notify, state.demoDate]);
  const addTask = useCallback((draft: TaskDraft) => { const id = makeId('task'); dispatch({ type: 'ADD_TASK', id, draft }); notify('Task added to the demo workboard.'); return id; }, [notify]);
  const updateTask = useCallback((taskId: string, patch: TaskPatch) => { dispatch({ type: 'UPDATE_TASK', taskId, patch }); notify('Task updated.'); }, [notify]);
  const addFinanceEntry = useCallback((draft: FinanceEntryDraft) => { const id = makeId('finance'); dispatch({ type: 'ADD_FINANCE_ENTRY', id, draft }); notify('Finance entry added locally.'); return id; }, [notify]);
  const logActivity = useCallback((message: string, kind: import('../../lib/demo/types').ActivityRecord['kind'] = 'system') => { dispatch({ type: 'LOG_ACTIVITY', id: makeId('activity'), date: state.demoDate, message, kind }); notify('Demo activity recorded locally.'); }, [notify, state.demoDate]);
  const getCurrentFamily = useCallback(() => state.familyProfiles.find((profile) => profile.id === 'family-demo'), [state.familyProfiles]);

  const value = useMemo<DemoContextValue>(() => ({ state, hydrated, toast, dismissToast: () => setToast(null), signInAs, signOut, resetDemoData, registerForProgram, reportAbsence, acceptWaitlistOffer, updateFamilyProfile, updateConsent, createProgram, updateProgram, updateSessionStatus, updateSessionCurriculum, updateProject, assignCoach, setAttendance, updateRegistrationStatus, updateOrganization, addOrganizationInteraction, addTask, updateTask, addFinanceEntry, logActivity, getCurrentFamily }), [state, hydrated, toast, signInAs, signOut, resetDemoData, registerForProgram, reportAbsence, acceptWaitlistOffer, updateFamilyProfile, updateConsent, createProgram, updateProgram, updateSessionStatus, updateSessionCurriculum, updateProject, assignCoach, setAttendance, updateRegistrationStatus, updateOrganization, addOrganizationInteraction, addTask, updateTask, addFinanceEntry, logActivity, getCurrentFamily]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

function toLegacyState(state: import('../../lib/data/types').OperationsState): DemoState {
  const assignmentsBySession = new Map<string, string[]>();
  for (const assignment of state.assignments) assignmentsBySession.set(assignment.sessionId, [...(assignmentsBySession.get(assignment.sessionId) ?? []), assignment.coachId]);
  return {
    version: 2,
    demoDate: new Date().toISOString().slice(0, 10),
    session: { role: 'staff', profileId: state.staffProfiles[0]?.id ?? '' },
    familyProfiles: [],
    staffProfiles: state.staffProfiles.map(({ id, name, role, email, initials }) => ({ id, name, role, email, initials })),
    programs: state.programs.map((program) => ({ ...program, organizationId: program.organizationId ?? '', leadCoachId: program.leadCoachId ?? '', price: program.priceCents / 100 })),
    sessions: state.sessions.map((session) => ({ ...session, coachIds: assignmentsBySession.get(session.id) ?? [], curriculumFileId: state.files.find((file) => file.programId === session.programId && file.category === 'curriculum')?.id ?? '' })),
    coaches: state.coaches.map((coach) => ({ ...coach, volunteerHours: Math.round((coach.volunteerMinutes / 60) * 100) / 100, assignmentIds: state.assignments.filter((assignment) => assignment.coachId === coach.id).map((assignment) => assignment.id) })),
    assignments: state.assignments.map(({ id, sessionId, coachId, slot, accepted }) => ({ id, sessionId, coachId, slot, accepted })),
    registrations: state.registrations.map((registration) => ({ ...registration, familyId: '', createdAt: registration.submittedAt })),
    consents: state.consents.map((consent) => ({ ...consent, acceptedAt: consent.respondedAt })),
    payments: state.payments.map((payment) => ({ id: payment.id, registrationId: payment.registrationId, programId: state.registrations.find((registration) => registration.id === payment.registrationId)?.programId ?? '', amount: payment.amountCents / 100, status: payment.status, paymentDate: payment.receivedAt, receiptNumber: payment.externalReference, note: payment.note, receiptFileId: payment.receiptFileId })),
    attendance: state.attendance.map((record) => ({ id: record.id, registrationId: record.registrationId, sessionId: record.sessionId, status: record.status, note: record.note, updatedAt: record.updatedAt })),
    organizations: state.organizations.map((organization) => ({ ...organization, leadStaffId: organization.leadStaffId ?? '', supportStaff: organization.supportStaffIds, programIds: state.programs.filter((program) => program.organizationId === organization.id).map((program) => program.id), projectIds: state.projects.filter((project) => project.organizationId === organization.id).map((project) => project.id), driveFileIds: state.files.filter((file) => file.organizationId === organization.id).map((file) => file.id) })),
    interactions: state.interactions.map((interaction) => ({ id: interaction.id, organizationId: interaction.organizationId, date: interaction.occurredOn, ownerId: interaction.ownerId ?? '', kind: interaction.kind, outcome: interaction.outcome, notes: interaction.notes, nextAction: interaction.nextAction })),
    projects: state.projects.map((project) => ({ ...project, ownerId: project.ownerId ?? '', driveFileIds: state.files.filter((file) => file.projectId === project.id).map((file) => file.id) })),
    tasks: state.tasks.map((task) => ({ ...task, ownerId: task.ownerId ?? '' })),
    financeEntries: state.financeEntries.map((entry) => ({ ...entry, amount: entry.amountCents / 100 })),
    files: state.files.map((file) => ({ id: file.id, name: file.name, kind: file.category === 'curriculum' ? 'document' : file.category, description: file.mediaType, updatedAt: file.createdAt })),
    activity: state.activity.map((item) => ({ id: item.id, date: item.createdAt, message: item.summary, kind: (['registration', 'program', 'coach', 'organization', 'project', 'finance'].includes(item.entityType) ? item.entityType : 'system') as import('../../lib/demo/types').ActivityRecord['kind'] })),
  };
}

function PersistentDemoProvider({ children }: { children: React.ReactNode }) {
  const operations = useOperations();
  const state = useMemo(() => toLegacyState(operations.state), [operations.state]);
  const run = useCallback((key: string, operation: (repository: import('../../lib/data/repository').OperationsRepository) => Promise<unknown>, message: string) => {
    void operations.mutate(key, operation, message).catch(() => undefined);
  }, [operations]);
  const value = useMemo<DemoContextValue>(() => ({
    state,
    hydrated: operations.status !== 'loading',
    toast: operations.toast,
    dismissToast: operations.dismissToast,
    signInAs: () => undefined,
    signOut: () => { void createBrowserSupabaseClient().auth.signOut(); },
    resetDemoData: () => operations.refresh(),
    registerForProgram: () => '',
    reportAbsence: (registrationId, sessionId, note) => run(`attendance:${registrationId}:${sessionId}`, (repository) => repository.upsertAttendance(registrationId, sessionId, 'parent-reported-absence', note), 'Absence saved.'),
    acceptWaitlistOffer: (registrationId) => run(`registration:${registrationId}`, (repository) => repository.updateRegistration(registrationId, { registrationStatus: 'confirmed' }), 'Registration confirmed.'),
    updateFamilyProfile: () => undefined,
    updateConsent: (registrationId, consentType, accepted) => run(`consent:${registrationId}:${consentType}`, (repository) => repository.upsertConsent(registrationId, { type: consentType, accepted, version: operations.state.settings?.participationWaiverVersion ?? '2026.1', respondedAt: new Date().toISOString() }), 'Form response saved.'),
    createProgram: (draft) => { run('program:create', (repository) => repository.createProgram({ slug: `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${crypto.randomUUID().slice(0, 5)}`, name: draft.name, organizationId: draft.organizationId || null, type: draft.type, description: draft.description, venue: draft.venue, skillLevel: 'mixed', eligibility: '', capacity: draft.capacity, leadCoachId: draft.leadCoachId || null, status: draft.status, visibility: draft.visibility, priceCents: Math.round(draft.price * 100), registrationDeadline: draft.registrationDeadline, whatToBring: [], equipmentProvided: true, image: '', contact: operations.state.settings?.contactEmail ?? '' }), 'Program created.'); return ''; },
    updateProgram: (programId, patch) => run(`program:${programId}`, (repository) => repository.updateProgram(programId, patch), 'Program saved.'),
    updateSessionStatus: (sessionId, status) => run(`session:${sessionId}`, (repository) => repository.updateSession(sessionId, { status }), 'Session status saved.'),
    updateSessionCurriculum: (sessionId, curriculum) => run(`session:${sessionId}:curriculum`, (repository) => repository.updateSession(sessionId, { curriculum }), 'Curriculum saved.'),
    updateProject: (projectId, patch) => run(`project:${projectId}`, (repository) => repository.updateProject(projectId, patch), 'Project saved.'),
    assignCoach: (sessionId, slot, coachId) => run(`assignment:${sessionId}:${slot}`, (repository) => repository.assignCoach(sessionId, slot, coachId), 'Coach assignment saved.'),
    setAttendance: (registrationId, sessionId, status, note) => run(`attendance:${registrationId}:${sessionId}`, (repository) => repository.upsertAttendance(registrationId, sessionId, status, note), 'Attendance saved.'),
    updateRegistrationStatus: (registrationId, registrationStatus) => run(`registration:${registrationId}`, (repository) => repository.updateRegistration(registrationId, { registrationStatus }), 'Registration saved.'),
    updateOrganization: (organizationId, patch) => run(`organization:${organizationId}`, (repository) => repository.updateOrganization(organizationId, patch), 'Organization saved.'),
    addOrganizationInteraction: (organizationId, draft) => run(`organization:${organizationId}:interaction`, (repository) => repository.addOrganizationInteraction({ organizationId, occurredOn: new Date().toISOString().slice(0, 10), ownerId: operations.staff?.id ?? null, ...draft }), 'Partner update added.'),
    addTask: (draft) => { run('task:create', (repository) => repository.createTask({ title: draft.title, ownerId: draft.ownerId || null, dueDate: draft.dueDate, status: draft.status, priority: draft.priority, projectId: draft.projectId ?? null, programId: draft.programId ?? null, organizationId: draft.organizationId ?? null, notes: draft.notes ?? '' }), 'Task added.'); return ''; },
    updateTask: (taskId, patch) => run(`task:${taskId}`, (repository) => repository.updateTask(taskId, patch), 'Task saved.'),
    addFinanceEntry: (draft) => { run('finance:create', (repository) => repository.createFinanceEntry({ kind: draft.kind, programId: draft.programId ?? null, projectId: draft.projectId ?? null, date: draft.date, description: draft.description, category: draft.category, amountCents: Math.round(draft.amount * 100), paidBy: draft.paidBy, reimbursementStatus: 'not-applicable' }), 'Finance entry added.'); return ''; },
    logActivity: (message, kind = 'system') => run('activity:create', (repository) => repository.logActivity(`${kind}.note`, kind, null, message), 'Activity recorded.'),
    getCurrentFamily: () => undefined,
  }), [operations, run, state]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function DemoProvider({ children, persistent = false }: { children: React.ReactNode; persistent?: boolean }) {
  return persistent ? <PersistentDemoProvider>{children}</PersistentDemoProvider> : <LocalDemoProvider>{children}</LocalDemoProvider>;
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used inside DemoProvider');
  return context;
}

/**
 * Optional companion to useDemo for public pages that can render both inside
 * the application shell and in isolated route tests. Unlike useDemo it does
 * not throw when a page is rendered without the provider.
 */
export function useOptionalDemo(): DemoContextValue | null {
  return useContext(DemoContext);
}
