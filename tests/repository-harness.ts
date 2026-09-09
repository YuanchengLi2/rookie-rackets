import { vi } from 'vitest';
import type { OperationsRepository } from '../lib/data/repository';
import type { OperationsState } from '../lib/data/types';
import { emptyOperationsState } from '../lib/data/types';

export function createTestOperationsState(): OperationsState {
  const state = emptyOperationsState();
  state.settings = { organizationName: 'Rookie Rackets', contactEmail: 'team@example.com', participationWaiverVersion: '2026.1', photoVideoVersion: '2026.1', programAcknowledgmentVersion: '2026.1', pickupPolicyVersion: '2026.1', confirmationCopy: 'Received.' };
  state.staffProfiles = [{ id: 'staff-1', email: 'yuanchengli612@gmail.com', name: 'Yuancheng', initials: 'YC', role: 'admin', active: true, createdAt: '', updatedAt: '' }];
  state.programs = [{ id: '30000000-0000-4000-8000-000000000001', slug: 'fall', name: 'Fall Program', organizationId: null, type: 'camp', description: '', venue: 'Gym', skillLevel: 'mixed', eligibility: '', capacity: 20, leadCoachId: 'coach-1', status: 'registration-open', visibility: 'public', priceCents: 0, registrationDeadline: '2026-12-01', whatToBring: [], equipmentProvided: true, image: '', contact: '', createdAt: '', updatedAt: '', archivedAt: null }];
  state.sessions = [{ id: '40000000-0000-4000-8000-000000000001', programId: state.programs[0].id, date: '2026-10-01', startTime: '16:00', endTime: '17:00', arrivalTime: '15:45', location: 'Gym', leadCoachId: 'coach-1', curriculum: { objective: '', activities: [], coachNotes: '', updatedAt: null }, status: 'scheduled', notes: '', createdAt: '', updatedAt: '' }];
  state.coaches = [{ id: 'coach-1', name: 'Adithya', email: 'adithya@example.com', role: 'program-lead', active: true, experience: 'Youth coach', availability: 'available', volunteerMinutes: 1110, createdAt: '', updatedAt: '', archivedAt: null }];
  state.assignments = [{ id: 'assignment-1', sessionId: state.sessions[0].id, coachId: 'coach-1', slot: 'lead', accepted: true, createdAt: '', updatedAt: '' }];
  state.registrations = [{ id: '60000000-0000-4000-8000-000000000001', publicReference: 'RR-ONLINE01', source: 'online', programId: state.programs[0].id, childFirstName: 'Jamie', childLastName: 'Lee', dateOfBirth: '2015-05-12', grade: '5th', skillLevel: 'beginner', guardianFirstName: 'Jordan', guardianLastName: 'Lee', guardianEmail: 'jordan@example.com', guardianPhone: '919-555-0110', emergencyName: 'Taylor', emergencyRelationship: 'Parent', emergencyPhone: '919-555-0111', supportNotes: '', internalNotes: '', needsRacket: true, parentOnsite: false, selectedSessionIds: [state.sessions[0].id], registrationStatus: 'confirmed', paymentStatus: 'waived', submittedAt: '2026-09-08T12:00:00Z', createdAt: '', updatedAt: '1', archivedAt: null }];
  state.financeEntries = [{ id: 'finance-1', kind: 'expense', programId: state.programs[0].id, projectId: null, date: '2026-09-01', description: 'Shuttles', category: 'Equipment', amountCents: 2500, paidBy: 'Yuancheng', receiptFileId: null, reimbursementStatus: 'not-applicable', createdBy: 'staff-1', createdAt: '', updatedAt: '', archivedAt: null }];
  return state;
}

export function createRepositoryHarness(initial: OperationsState) {
  let state = structuredClone(initial);
  const subscribers = new Set<() => void>();
  const base = {
    loadWorkspace: vi.fn(async () => structuredClone(state)),
    subscribe: vi.fn((callback: () => void) => { subscribers.add(callback); return () => subscribers.delete(callback); }),
    createManualRegistration: vi.fn(async (draft: import('../lib/data/repository').ManualRegistrationDraft) => {
      const now = new Date().toISOString();
      const registration = { ...draft, supportNotes: draft.supportNotes ?? '', internalNotes: draft.internalNotes ?? '', needsRacket: draft.needsRacket ?? false, parentOnsite: draft.parentOnsite ?? false, registrationStatus: draft.registrationStatus ?? 'confirmed', paymentStatus: draft.paymentStatus ?? 'waived', id: crypto.randomUUID(), publicReference: 'RR-MANUAL01', source: 'staff' as const, submittedAt: now, createdAt: now, updatedAt: now, archivedAt: null } as import('../lib/data/types').Registration;
      state.registrations = [registration, ...state.registrations];
      return registration;
    }),
    updateRegistration: vi.fn(async (id: string, patch: Record<string, unknown>) => { const index = state.registrations.findIndex((item) => item.id === id); state.registrations[index] = { ...state.registrations[index], ...patch, updatedAt: new Date().toISOString() }; return state.registrations[index]; }),
    upsertConsent: vi.fn(async (registrationId: string, consent: import('../lib/data/types').ConsentRecord) => ({ ...consent, id: crypto.randomUUID(), registrationId, createdAt: '', updatedAt: '' })),
    recordPayment: vi.fn(async (draft: import('../lib/data/repository').PaymentDraft) => ({ ...draft, id: crypto.randomUUID(), receiptFileId: null, createdAt: '', updatedAt: '' })),
    archiveRegistration: vi.fn(async (id: string) => { state.registrations = state.registrations.map((item) => item.id === id ? { ...item, registrationStatus: 'archived', archivedAt: new Date().toISOString() } : item); }),
    createProgram: vi.fn(async (draft: import('../lib/data/types').ProgramDraft) => { const program = { ...draft, id: crypto.randomUUID(), createdAt: '', updatedAt: '', archivedAt: null }; state.programs = [...state.programs, program]; return program; }),
    createFinanceEntry: vi.fn(async (draft: import('../lib/data/types').FinanceEntryDraft) => { const entry = { ...draft, id: crypto.randomUUID(), receiptFileId: null, createdBy: 'staff-1', createdAt: '', updatedAt: '', archivedAt: null }; state.financeEntries = [...state.financeEntries, entry]; return entry; }),
    updateSettings: vi.fn(async (patch: Partial<import('../lib/data/types').WorkspaceSettings>) => { state.settings = { ...state.settings!, ...patch }; return state.settings; }),
    updateCoach: vi.fn(async (id: string, patch: Partial<import('../lib/data/types').CoachDraft>) => { const index = state.coaches.findIndex((item) => item.id === id); state.coaches[index] = { ...state.coaches[index], ...patch }; return state.coaches[index]; }),
    emit: () => subscribers.forEach((callback) => callback()),
  };
  return new Proxy(base, { get(target, property) { if (property in target) return target[property as keyof typeof target]; return vi.fn(async () => undefined); } }) as unknown as OperationsRepository & typeof base;
}
