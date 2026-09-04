import type { DemoState, Organization, Program, Registration, SessionRecord } from './types';

export function getFamilyRegistrations(state: DemoState, familyId: string): Registration[] {
  return state.registrations.filter((registration) => registration.familyId === familyId);
}

export function getProgram(state: DemoState, idOrSlug: string): Program | undefined {
  return state.programs.find((program) => program.id === idOrSlug || program.slug === idOrSlug);
}

export function getProgramSessions(state: DemoState, programId: string): SessionRecord[] {
  return state.sessions.filter((session) => session.programId === programId).sort((a, b) => a.date.localeCompare(b.date));
}

export function getRegistrationSessions(state: DemoState, registration: Registration): SessionRecord[] {
  const selected = new Set(registration.selectedSessionIds);
  return getProgramSessions(state, registration.programId).filter((session) => selected.has(session.id));
}

export function getRegistrationAttendance(state: DemoState, registrationId: string) {
  return state.attendance.filter((entry) => entry.registrationId === registrationId);
}

export function getRegistrationConsents(state: DemoState, registrationId: string) {
  return state.consents.filter((entry) => entry.registrationId === registrationId);
}

export function getUpcomingPrograms(state: DemoState): Program[] {
  return state.programs.filter((program) => ['registration-open', 'active', 'planning', 'full'].includes(program.status));
}

export function getActivePrograms(state: DemoState): Program[] {
  return state.programs.filter((program) => ['active', 'registration-open', 'full'].includes(program.status));
}

export function getNextFamilySession(state: DemoState, familyId: string): { registration: Registration; program: Program; session: SessionRecord } | undefined {
  const registrations = getFamilyRegistrations(state, familyId).filter((registration) => ['confirmed', 'offer-sent'].includes(registration.registrationStatus));
  const candidates = registrations.flatMap((registration) => getRegistrationSessions(state, registration).map((session) => ({ registration, program: getProgram(state, registration.programId), session })));
  return candidates.filter((item): item is { registration: Registration; program: Program; session: SessionRecord } => Boolean(item.program) && item.session.date >= state.demoDate && item.session.status === 'scheduled').sort((a, b) => a.session.date.localeCompare(b.session.date))[0];
}

export interface FamilyRequiredAction {
  id: string;
  registrationId: string;
  kind: 'required-forms' | 'waitlist-offer';
  label: string;
  detail: string;
  href: string;
}

export function getFamilyRequiredActions(state: DemoState, familyId: string): FamilyRequiredAction[] {
  return getFamilyRegistrations(state, familyId).flatMap((registration) => {
    const program = getProgram(state, registration.programId);
    const href = `/portal/camps/${registration.id}`;
    const actions: FamilyRequiredAction[] = [];
    const requiredConsents = getRegistrationConsents(state, registration.id).filter((consent) => consent.type !== 'photo-video');
    if (requiredConsents.some((consent) => !consent.accepted)) {
      actions.push({ id: `${registration.id}-forms`, registrationId: registration.id, kind: 'required-forms', label: 'Finish required forms', detail: program?.name ?? 'Camp', href });
    }
    if (registration.registrationStatus === 'offer-sent') {
      actions.push({ id: `${registration.id}-offer`, registrationId: registration.id, kind: 'waitlist-offer', label: 'Accept your available spot', detail: program?.name ?? 'Camp', href });
    }
    return actions;
  });
}

export interface AttentionItem { id: string; label: string; detail: string; href: string; kind: 'registration' | 'program' | 'organization' | 'task' | 'finance'; }

export function getNeedsAttention(state: DemoState): AttentionItem[] {
  const items: AttentionItem[] = [];
  state.registrations.filter((registration) => registration.registrationStatus === 'confirmed').forEach((registration) => {
    const missingPhoto = state.consents.some((consent) => consent.registrationId === registration.id && consent.type === 'photo-video' && !consent.accepted);
    if (missingPhoto) items.push({ id: registration.id, label: 'Photo consent missing', detail: `${registration.childFirstName} ${registration.childLastName}`, href: `/staff/registrations?registration=${registration.id}`, kind: 'registration' });
  });
  state.organizations.filter((organization) => organization.status === 'follow-up-due').forEach((organization) => items.push({ id: organization.id, label: 'Partner follow-up due', detail: organization.nextStep, href: `/staff/organizations/${organization.id}`, kind: 'organization' }));
  state.tasks.filter((task) => task.status !== 'done' && task.status !== 'canceled' && task.dueDate <= state.demoDate).forEach((task) => items.push({ id: task.id, label: 'Task needs attention', detail: task.title, href: task.projectId ? `/staff/projects/${task.projectId}` : '/staff', kind: 'task' }));
  return items;
}

export function getStaffingGaps(state: DemoState): Array<{ session: SessionRecord; program: Program | undefined; reason: string }> {
  return getStaffSchedule(state).flatMap(({ session, program }) => {
    if (!session.leadCoachId) return [{ session, program, reason: 'Lead coach needed' }];
    if (session.coachIds.filter(Boolean).length < 2) return [{ session, program, reason: 'Add a second coach' }];
    return [];
  });
}

export function getOverdueFollowUps(state: DemoState): Organization[] {
  const organizationIds = new Set(state.tasks.filter((task) => task.organizationId && !['done', 'canceled'].includes(task.status) && task.dueDate < state.demoDate).map((task) => task.organizationId as string));
  return state.organizations.filter((organization) => organization.status === 'follow-up-due' || organizationIds.has(organization.id));
}

export function getRecentActivity(state: DemoState, limit = 10) {
  return [...state.activity].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

export function getProgramCapacity(state: DemoState, programId: string) {
  const program = getProgram(state, programId);
  const count = state.registrations.filter((registration) => registration.programId === programId && ['confirmed', 'offer-sent'].includes(registration.registrationStatus)).length;
  return { used: count, capacity: program?.capacity ?? 0, remaining: Math.max((program?.capacity ?? 0) - count, 0), percent: program?.capacity ? Math.round((count / program.capacity) * 100) : 0 };
}

export function getProjectProgress(state: DemoState, projectId: string) {
  const tasks = state.tasks.filter((task) => task.projectId === projectId);
  const complete = tasks.filter((task) => task.status === 'done').length;
  return { complete, total: tasks.length, percent: tasks.length ? Math.round((complete / tasks.length) * 100) : 0 };
}

export function getStaffSchedule(state: DemoState): Array<{ session: SessionRecord; program: Program | undefined }> {
  return state.sessions.filter((session) => session.date >= state.demoDate && session.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date)).map((session) => ({ session, program: getProgram(state, session.programId) }));
}

export function getFinanceTotals(state: DemoState) {
  const revenue = state.financeEntries.filter((entry) => entry.kind === 'revenue').reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = state.financeEntries.filter((entry) => entry.kind === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  return { revenue, expenses, net: revenue - expenses };
}

export function getCoachAssignments(state: DemoState, coachId: string) {
  return state.sessions.filter((session) => session.coachIds.includes(coachId) && session.date >= state.demoDate && session.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date));
}

export function formatDemoDate(date: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

export function getOwnerName(state: DemoState, ownerId: string): string {
  return state.staffProfiles.find((profile) => profile.id === ownerId)?.name ?? 'Unassigned';
}

export function getTaskCounts(state: DemoState) {
  return { open: state.tasks.filter((task) => !['done', 'canceled'].includes(task.status)).length, overdue: state.tasks.filter((task) => !['done', 'canceled'].includes(task.status) && task.dueDate < state.demoDate).length };
}
