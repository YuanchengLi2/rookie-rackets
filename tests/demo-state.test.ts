import { describe, expect, it } from 'vitest';
import { createSeedState } from '../lib/demo/seed';
import { demoReducer } from '../lib/demo/reducer';
import { getFamilyRegistrations, getFamilyRequiredActions, getNeedsAttention, getNextFamilySession, getProjectProgress, getRegistrationSessions } from '../lib/demo/selectors';

describe('Rookie Rackets demo state', () => {
  it('creates the seeded walkthrough records without sharing mutable arrays', () => {
    const first = createSeedState();
    const second = createSeedState();

    expect(first.version).toBe(2);
    expect(first.demoDate).toBe('2026-09-02');
    expect(first.programs.some((program) => program.slug === 'boys-club-fall')).toBe(true);
    expect(first.organizations.some((organization) => organization.name === 'White Oak')).toBe(true);
    expect(first.projects.some((project) => project.name === 'Family Portal')).toBe(true);
    expect(first.registrations.every((registration) => Array.isArray(registration.selectedSessionIds))).toBe(true);

    first.programs[0].name = 'Changed locally';
    expect(second.programs[0].name).not.toBe('Changed locally');
  });

  it('registers a family and exposes the record to staff selectors', () => {
    const state = createSeedState();
    const next = demoReducer(state, {
      type: 'REGISTER_FOR_PROGRAM',
      registration: {
        id: 'registration-new',
        familyId: 'family-demo',
        programId: 'program-boys-club',
        childFirstName: 'Jamie',
        childLastName: 'Lee',
        dateOfBirth: '2015-05-12',
        grade: '5th Grade',
        skillLevel: 'beginner',
        guardianFirstName: 'Jordan',
        guardianLastName: 'Lee',
        guardianEmail: 'jordan@example.test',
        guardianPhone: '919-555-0110',
        emergencyName: 'Taylor Lee',
        emergencyRelationship: 'Parent',
        emergencyPhone: '919-555-0111',
        supportNotes: '',
        needsRacket: true,
        parentOnsite: false,
        selectedSessionIds: ['session-boys-sep-11'],
        registrationStatus: 'confirmed',
        paymentStatus: 'waived',
        createdAt: '2026-09-02',
      },
    });

    expect(getFamilyRegistrations(next, 'family-demo').some((registration) => registration.id === 'registration-new')).toBe(true);
    expect(next.activity[0].message).toMatch(/Jamie Lee/);
  });

  it('uses only the dates selected for a family registration', () => {
    const state = createSeedState();
    const registration = state.registrations.find((item) => item.id === 'registration-family-boys');
    expect(registration).toBeDefined();

    registration!.selectedSessionIds = ['session-boys-sep-11', 'session-boys-sep-18'];

    expect(getRegistrationSessions(state, registration!).map((session) => session.id)).toEqual([
      'session-boys-sep-11',
      'session-boys-sep-18',
    ]);
    expect(getNextFamilySession(state, 'family-demo')?.session.id).toBe('session-boys-sep-11');
  });

  it('does not treat optional camera consent as required family work', () => {
    const state = createSeedState();

    expect(getFamilyRequiredActions(state, 'family-demo')).toEqual([
      expect.objectContaining({ registrationId: 'registration-family-tmsa', kind: 'waitlist-offer' }),
    ]);
  });

  it('propagates an absence, coach assignment, organization update, and task completion', () => {
    let state = createSeedState();
    state = demoReducer(state, {
      type: 'REPORT_ABSENCE',
      registrationId: 'registration-family-boys',
      sessionId: 'session-boys-sep-11',
      note: 'Family trip',
    });
    state = demoReducer(state, {
      type: 'ASSIGN_COACH',
      sessionId: 'session-boys-sep-11',
      slot: 'coach-2',
      coachId: 'coach-nathan',
    });
    state = demoReducer(state, {
      type: 'UPDATE_ORGANIZATION',
      organizationId: 'organization-white-oak',
      patch: { nextStep: 'Call Sep 7', status: 'interested' },
    });
    state = demoReducer(state, {
      type: 'UPDATE_TASK',
      taskId: 'task-family-portal-proposal',
      patch: { status: 'done' },
    });

    expect(state.attendance.find((entry) => entry.sessionId === 'session-boys-sep-11')?.status).toBe('parent-reported-absence');
    expect(state.sessions.find((session) => session.id === 'session-boys-sep-11')?.coachIds).toContain('coach-nathan');
    expect(state.organizations.find((organization) => organization.id === 'organization-white-oak')?.nextStep).toBe('Call Sep 7');
    expect(getProjectProgress(state, 'project-family-portal')).toEqual({ complete: 1, total: 2, percent: 50 });
    expect(getNeedsAttention(state).some((item) => item.id === 'organization-white-oak')).toBe(false);
  });

  it('restores the seed on reset while preserving the current role', () => {
    let state = createSeedState();
    state = demoReducer(state, { type: 'SET_SESSION', session: { role: 'staff', profileId: 'staff-demo' } });
    state = demoReducer(state, { type: 'UPDATE_TASK', taskId: 'task-family-portal-proposal', patch: { status: 'done' } });
    state = demoReducer(state, { type: 'RESET_DATA' });

    expect(state.session).toEqual({ role: 'staff', profileId: 'staff-demo' });
    expect(state.tasks.find((task) => task.id === 'task-family-portal-proposal')?.status).toBe('in-progress');
  });

  it('saves a structured curriculum on the canonical session record', () => {
    const state = createSeedState();
    const originalObjective = state.sessions.find((session) => session.id === 'session-boys-sep-04')?.curriculum.objective;
    const next = demoReducer(state, {
      type: 'UPDATE_SESSION_CURRICULUM',
      sessionId: 'session-boys-sep-04',
      curriculum: {
        objective: 'Build a consistent underhand serve',
        coachNotes: 'Keep groups moving through two short stations.',
        updatedAt: '2026-09-02',
        activities: [
          { id: 'activity-serve', kind: 'skill', title: 'Serve targets', minutes: 18, instructions: 'Serve toward the large floor targets.' },
        ],
      },
    });

    expect(next.sessions.find((session) => session.id === 'session-boys-sep-04')?.curriculum.objective).toBe('Build a consistent underhand serve');
    expect(state.sessions.find((session) => session.id === 'session-boys-sep-04')?.curriculum.objective).toBe(originalObjective);
    expect(next.activity[0].message).toMatch(/curriculum/i);
  });
});
