import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '../supabase/browser';
import { DomainError, toDomainError } from './errors';
import { mapWorkspaceRows, toSnakeCaseRecord, type WorkspaceRows } from './mappers';
import type {
  Coach, CoachDraft, FinanceEntry, FinanceEntryDraft, InteractionDraft, InterestSignup, OperationsState, Organization, OrganizationDraft,
  PaymentRecord, Program, ProgramDraft, Project, ProjectDraft, Registration, RegistrationPatch, SessionDraft, SessionRecord,
  StaffProfile, Task, TaskDraft, WorkspaceSettings,
} from './types';
import type { FileUploadDraft, ManualRegistrationDraft, OperationsRepository, PaymentDraft } from './repository';

type Row = Record<string, unknown>;

function clean(value: Record<string, unknown>): Row {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function databaseError(error: unknown): never {
  throw toDomainError(error);
}

export class SupabaseOperationsRepository implements OperationsRepository {
  constructor(private readonly supabase: SupabaseClient = createBrowserSupabaseClient()) {}

  private async rows(table: string, orderBy = 'created_at', ascending = true): Promise<Row[]> {
    const result = await this.supabase.from(table).select('*').order(orderBy, { ascending });
    if (result.error) databaseError(result.error);
    return (result.data ?? []) as Row[];
  }

  private async write(table: string, mode: 'insert' | 'update', payload: Row, id?: string): Promise<void> {
    const query = mode === 'insert'
      ? this.supabase.from(table).insert(payload)
      : this.supabase.from(table).update(payload).eq('id', id ?? '');
    const result = await query;
    if (result.error) databaseError(result.error);
  }

  private async findAfter<T>(collection: keyof OperationsState, id: string): Promise<T> {
    const state = await this.loadWorkspace();
    const record = (state[collection] as unknown as Array<{ id: string }>).find((item) => item.id === id);
    if (!record) throw new DomainError('NOT_FOUND');
    return record as T;
  }

  async loadWorkspace(): Promise<OperationsState> {
    const requests = await Promise.all([
      this.rows('staff_profiles'), this.rows('workspace_settings', 'updated_at'), this.rows('programs', 'name'),
      this.rows('program_sessions', 'date'), this.rows('coaches', 'name'), this.rows('session_coaches', 'created_at'),
      this.rows('registrations', 'submitted_at', false), this.rows('registration_sessions', 'created_at'),
      this.rows('consents', 'created_at'), this.rows('payments', 'created_at', false), this.rows('attendance', 'created_at'),
      this.rows('organizations', 'name'), this.rows('organization_support_staff', 'organization_id'),
      this.rows('organization_interactions', 'occurred_on', false), this.rows('projects', 'target_date'),
      this.rows('project_contributors', 'project_id'), this.rows('tasks', 'due_date'),
      this.rows('finance_entries', 'date', false), this.rows('files', 'created_at', false), this.rows('activity_log', 'created_at', false),
      this.rows('interest_signups', 'submitted_at', false),
    ]);
    const keys: Array<keyof WorkspaceRows> = ['staffProfiles', 'settings', 'programs', 'sessions', 'coaches', 'assignments', 'registrations', 'registrationSessions', 'consents', 'payments', 'attendance', 'organizations', 'organizationSupport', 'interactions', 'projects', 'projectContributors', 'tasks', 'financeEntries', 'files', 'activity', 'interestSignups'];
    return mapWorkspaceRows(Object.fromEntries(keys.map((key, index) => [key, requests[index]])) as unknown as WorkspaceRows);
  }

  subscribe(onInvalidate: () => void): () => void {
    const timer = window.setInterval(onInvalidate, 5000);
    return () => window.clearInterval(timer);
  }

  async createProgram(draft: ProgramDraft): Promise<Program> {
    const result = await this.supabase.from('programs').insert(toSnakeCaseRecord(draft as unknown as Row)).select('id').single();
    if (result.error) databaseError(result.error);
    return this.findAfter<Program>('programs', String(result.data.id));
  }
  async updateProgram(id: string, patch: Partial<ProgramDraft>): Promise<Program> { await this.write('programs', 'update', clean(toSnakeCaseRecord(patch as Row)), id); return this.findAfter('programs', id); }
  async archiveProgram(id: string): Promise<void> { await this.write('programs', 'update', { status: 'archived', archived_at: new Date().toISOString() }, id); }
  async createSession(draft: SessionDraft): Promise<SessionRecord> { const result = await this.supabase.from('program_sessions').insert(toSnakeCaseRecord(draft as unknown as Row)).select('id').single(); if (result.error) databaseError(result.error); return this.findAfter('sessions', String(result.data.id)); }
  async updateSession(id: string, patch: Partial<SessionDraft>): Promise<SessionRecord> { await this.write('program_sessions', 'update', clean(toSnakeCaseRecord(patch as Row)), id); return this.findAfter('sessions', id); }
  async createCoach(draft: CoachDraft): Promise<Coach> { const result = await this.supabase.from('coaches').insert(toSnakeCaseRecord(draft as unknown as Row)).select('id').single(); if (result.error) databaseError(result.error); return this.findAfter('coaches', String(result.data.id)); }
  async updateCoach(id: string, patch: Partial<CoachDraft>): Promise<Coach> { await this.write('coaches', 'update', clean(toSnakeCaseRecord(patch as Row)), id); return this.findAfter('coaches', id); }
  async archiveCoach(id: string): Promise<void> { await this.write('coaches', 'update', { active: false, archived_at: new Date().toISOString() }, id); }
  async assignCoach(sessionId: string, slot: 'lead' | 'coach-2' | 'coach-3' | 'coach-4' | 'backup', coachId: string | null): Promise<void> {
    if (!coachId) { const result = await this.supabase.from('session_coaches').delete().eq('session_id', sessionId).eq('slot', slot); if (result.error) databaseError(result.error); return; }
    const result = await this.supabase.from('session_coaches').upsert({ session_id: sessionId, coach_id: coachId, slot, accepted: true }, { onConflict: 'session_id,slot' });
    if (result.error) databaseError(result.error);
  }

  async createManualRegistration(draft: ManualRegistrationDraft): Promise<Registration> {
    const selectedSessionIds = draft.selectedSessionIds;
    const publicReference = `RR-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`;
    const payload = clean(toSnakeCaseRecord({ ...draft, selectedSessionIds: undefined, publicReference, idempotencyKey: crypto.randomUUID(), source: 'staff', submittedAt: new Date().toISOString() } as Row));
    const result = await this.supabase.from('registrations').insert(payload).select('id').single();
    if (result.error) databaseError(result.error);
    const id = String(result.data.id);
    await this.replaceRegistrationSessions(id, selectedSessionIds);
    return this.findAfter('registrations', id);
  }
  async updateRegistration(id: string, patch: RegistrationPatch): Promise<Registration> {
    const selected = patch.selectedSessionIds;
    const payload = clean(toSnakeCaseRecord({ ...patch, selectedSessionIds: undefined } as Row));
    if (Object.keys(payload).length) await this.write('registrations', 'update', payload, id);
    if (selected) await this.replaceRegistrationSessions(id, selected);
    return this.findAfter('registrations', id);
  }
  async replaceRegistrationSessions(id: string, sessionIds: string[]): Promise<void> {
    const clear = await this.supabase.from('registration_sessions').delete().eq('registration_id', id);
    if (clear.error) databaseError(clear.error);
    if (!sessionIds.length) return;
    const rows = sessionIds.map((sessionId) => ({ registration_id: id, session_id: sessionId }));
    const result = await this.supabase.from('registration_sessions').insert(rows);
    if (result.error) databaseError(result.error);
    const attendance = await this.supabase.from('attendance').upsert(sessionIds.map((sessionId) => ({ registration_id: id, session_id: sessionId, status: 'not-marked' })), { onConflict: 'registration_id,session_id', ignoreDuplicates: true });
    if (attendance.error) databaseError(attendance.error);
  }
  async upsertConsent(registrationId: string, consent: Pick<import('./types').ConsentRecord, 'type' | 'version' | 'accepted' | 'respondedAt'>) {
    const result = await this.supabase.from('consents').upsert({ registration_id: registrationId, type: consent.type, version: consent.version, accepted: consent.accepted, responded_at: consent.respondedAt }, { onConflict: 'registration_id,type' }).select('id').single();
    if (result.error) databaseError(result.error);
    return this.findAfter<import('./types').ConsentRecord>('consents', String(result.data.id));
  }
  async upsertAttendance(registrationId: string, sessionId: string, status: import('./types').AttendanceStatus, note = ''): Promise<void> { const result = await this.supabase.from('attendance').upsert({ registration_id: registrationId, session_id: sessionId, status, note }, { onConflict: 'registration_id,session_id' }); if (result.error) databaseError(result.error); }
  async recordPayment(draft: PaymentDraft): Promise<PaymentRecord> { const result = await this.supabase.from('payments').insert(toSnakeCaseRecord(draft as unknown as Row)).select('id').single(); if (result.error) databaseError(result.error); await this.write('registrations', 'update', { payment_status: draft.status }, draft.registrationId); return this.findAfter('payments', String(result.data.id)); }
  async archiveRegistration(id: string): Promise<void> { await this.write('registrations', 'update', { registration_status: 'archived', archived_at: new Date().toISOString() }, id); }
  async updateInterestSignup(id: string, status: InterestSignup['status']): Promise<InterestSignup> { await this.write('interest_signups', 'update', { status, archived_at: status === 'archived' ? new Date().toISOString() : null }, id); return this.findAfter('interestSignups', id); }

  async createOrganization(draft: OrganizationDraft): Promise<Organization> { const support = draft.supportStaffIds; const result = await this.supabase.from('organizations').insert(clean(toSnakeCaseRecord({ ...draft, supportStaffIds: undefined } as Row))).select('id').single(); if (result.error) databaseError(result.error); const id = String(result.data.id); await this.replaceJoin('organization_support_staff', 'organization_id', 'staff_id', id, support); return this.findAfter('organizations', id); }
  async updateOrganization(id: string, patch: Partial<OrganizationDraft>): Promise<Organization> { const support = patch.supportStaffIds; await this.write('organizations', 'update', clean(toSnakeCaseRecord({ ...patch, supportStaffIds: undefined } as Row)), id); if (support) await this.replaceJoin('organization_support_staff', 'organization_id', 'staff_id', id, support); return this.findAfter('organizations', id); }
  async archiveOrganization(id: string): Promise<void> { await this.write('organizations', 'update', { archived_at: new Date().toISOString() }, id); }
  async addOrganizationInteraction(draft: InteractionDraft): Promise<void> { await this.write('organization_interactions', 'insert', toSnakeCaseRecord(draft as unknown as Row)); }
  async createProject(draft: ProjectDraft): Promise<Project> { const contributors = draft.contributorIds; const result = await this.supabase.from('projects').insert(clean(toSnakeCaseRecord({ ...draft, contributorIds: undefined } as Row))).select('id').single(); if (result.error) databaseError(result.error); const id = String(result.data.id); await this.replaceJoin('project_contributors', 'project_id', 'staff_id', id, contributors); return this.findAfter('projects', id); }
  async updateProject(id: string, patch: Partial<ProjectDraft>): Promise<Project> { const contributors = patch.contributorIds; await this.write('projects', 'update', clean(toSnakeCaseRecord({ ...patch, contributorIds: undefined } as Row)), id); if (contributors) await this.replaceJoin('project_contributors', 'project_id', 'staff_id', id, contributors); return this.findAfter('projects', id); }
  async archiveProject(id: string): Promise<void> { await this.write('projects', 'update', { archived_at: new Date().toISOString() }, id); }
  async createTask(draft: TaskDraft): Promise<Task> { const result = await this.supabase.from('tasks').insert(toSnakeCaseRecord(draft as unknown as Row)).select('id').single(); if (result.error) databaseError(result.error); return this.findAfter('tasks', String(result.data.id)); }
  async updateTask(id: string, patch: Partial<TaskDraft>): Promise<Task> { await this.write('tasks', 'update', clean(toSnakeCaseRecord(patch as Row)), id); return this.findAfter('tasks', id); }
  async archiveTask(id: string): Promise<void> { await this.write('tasks', 'update', { archived_at: new Date().toISOString() }, id); }
  async createFinanceEntry(draft: FinanceEntryDraft): Promise<FinanceEntry> { const result = await this.supabase.from('finance_entries').insert(toSnakeCaseRecord(draft as unknown as Row)).select('id').single(); if (result.error) databaseError(result.error); return this.findAfter('financeEntries', String(result.data.id)); }
  async updateFinanceEntry(id: string, patch: Partial<FinanceEntryDraft>): Promise<FinanceEntry> { await this.write('finance_entries', 'update', clean(toSnakeCaseRecord(patch as Row)), id); return this.findAfter('financeEntries', id); }
  async archiveFinanceEntry(id: string): Promise<void> { await this.write('finance_entries', 'update', { archived_at: new Date().toISOString() }, id); }
  async updateSettings(patch: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> { const result = await this.supabase.from('workspace_settings').update(clean(toSnakeCaseRecord(patch as Row))).eq('id', true); if (result.error) databaseError(result.error); const state = await this.loadWorkspace(); if (!state.settings) throw new DomainError('NOT_FOUND'); return state.settings; }
  async updateStaffProfile(id: string, patch: Partial<Pick<StaffProfile, 'name' | 'initials' | 'active' | 'role'>>): Promise<StaffProfile> { await this.write('staff_profiles', 'update', clean(toSnakeCaseRecord(patch as Row)), id); return this.findAfter('staffProfiles', id); }
  async logActivity(action: string, entityType: string, entityId: string | null, summary: string, metadata: Record<string, unknown> = {}): Promise<void> { const result = await this.supabase.from('activity_log').insert({ actor_id: null, action, entity_type: entityType, entity_id: entityId, summary: summary.slice(0, 500), metadata }); if (result.error) databaseError(result.error); }

  private async replaceJoin(table: string, ownerKey: string, targetKey: string, ownerId: string, targetIds: string[]): Promise<void> {
    const removed = await this.supabase.from(table).delete().eq(ownerKey, ownerId);
    if (removed.error) databaseError(removed.error);
    if (!targetIds.length) return;
    const inserted = await this.supabase.from(table).insert(targetIds.map((targetId) => ({ [ownerKey]: ownerId, [targetKey]: targetId })));
    if (inserted.error) databaseError(inserted.error);
  }

  async uploadFile(draft: FileUploadDraft): Promise<void> {
    const safeName = draft.file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const storagePath = `${crypto.randomUUID()}/${safeName}`;
    const upload = await this.supabase.storage.from('operations-private').upload(storagePath, draft.file, { contentType: draft.file.type, upsert: false });
    if (upload.error) databaseError(upload.error);
    const row = { storage_path: storagePath, name: draft.file.name, media_type: draft.file.type || 'application/octet-stream', size_bytes: draft.file.size, category: draft.category, program_id: draft.programId ?? null, organization_id: draft.organizationId ?? null, project_id: draft.projectId ?? null, registration_id: draft.registrationId ?? null };
    const result = await this.supabase.from('files').insert(row);
    if (result.error) { await this.supabase.storage.from('operations-private').remove([storagePath]); databaseError(result.error); }
  }
  async createSignedFileUrl(storagePath: string): Promise<string> { const result = await this.supabase.storage.from('operations-private').createSignedUrl(storagePath, 60); if (result.error) databaseError(result.error); return result.data.signedUrl; }
}

export function createSupabaseOperationsRepository(): OperationsRepository {
  return new SupabaseOperationsRepository();
}
