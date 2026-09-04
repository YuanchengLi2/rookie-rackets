'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { demoReducer } from '../../lib/demo/reducer';
import { createSeedState } from '../../lib/demo/seed';
import { getProgramCapacity } from '../../lib/demo/selectors';
import { loadDemoState, saveDemoState } from '../../lib/demo/storage';
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

export function DemoProvider({ children }: { children: React.ReactNode }) {
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
