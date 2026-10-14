import { createServiceSupabaseClient } from '../supabase/server';
import { DomainError } from './errors';
import type { Program, SessionRecord } from './types';

export interface PublicProgramBundle {
  program: Program;
  sessions: SessionRecord[];
  partner?: { name: string; website: string } | null;
}
type Row = Record<string, unknown>;
const value = (row: Row, key: string) => String(row[key] ?? '');

function mapProgram(row: Row): Program {
  return { id: value(row, 'id'), slug: value(row, 'slug'), name: value(row, 'name'), organizationId: row.organization_id ? value(row, 'organization_id') : null, type: value(row, 'type') as Program['type'], description: value(row, 'description'), venue: value(row, 'venue'), skillLevel: value(row, 'skill_level') as Program['skillLevel'], eligibility: value(row, 'eligibility'), capacity: Number(row.capacity), leadCoachId: row.lead_coach_id ? value(row, 'lead_coach_id') : null, status: value(row, 'status') as Program['status'], visibility: 'public', priceCents: Number(row.price_cents), registrationDeadline: value(row, 'registration_deadline'), whatToBring: Array.isArray(row.what_to_bring) ? row.what_to_bring.map(String) : [], equipmentProvided: Boolean(row.equipment_provided), image: value(row, 'image'), contact: value(row, 'contact'), createdAt: value(row, 'created_at'), updatedAt: value(row, 'updated_at'), archivedAt: null };
}

function mapSession(row: Row): SessionRecord {
  const fallback = { objective: '', activities: [], coachNotes: '', updatedAt: null };
  return { id: value(row, 'id'), programId: value(row, 'program_id'), date: value(row, 'date'), startTime: value(row, 'start_time'), endTime: value(row, 'end_time'), arrivalTime: value(row, 'arrival_time'), location: value(row, 'location'), leadCoachId: row.lead_coach_id ? value(row, 'lead_coach_id') : null, curriculum: row.curriculum && typeof row.curriculum === 'object' ? row.curriculum as SessionRecord['curriculum'] : fallback, status: value(row, 'status') as SessionRecord['status'], notes: '', createdAt: value(row, 'created_at'), updatedAt: value(row, 'updated_at') };
}

export function canPublicRegister(program: Program, sessions: SessionRecord[]) {
  return program.type === 'camp'
    && ['registration-open', 'active', 'full'].includes(program.status)
    && sessions.length > 0;
}

export async function getPublicPrograms(): Promise<PublicProgramBundle[]> {
  const supabase = createServiceSupabaseClient();
  const [programResult, sessionResult, organizationResult] = await Promise.all([
    supabase.from('programs').select('*').eq('visibility', 'public').is('archived_at', null).not('status', 'in', '(draft,archived)').order('registration_deadline'),
    supabase.from('program_sessions').select('*').in('status', ['scheduled', 'completed']).order('date').order('start_time'),
    supabase.from('organizations').select('id,name,website').is('archived_at', null),
  ]);
  if (programResult.error || sessionResult.error || organizationResult.error) throw new DomainError('SERVICE_UNAVAILABLE');
  const rows = (programResult.data ?? []) as Row[];
  const organizations = (organizationResult.data ?? []) as Row[];
  const programs = rows.map(mapProgram).filter((program) => !['completed', 'canceled'].includes(program.status));
  const sessions = ((sessionResult.data ?? []) as Row[]).map(mapSession);
  return programs.map((program) => {
    const organization = organizations.find((item) => value(item, 'id') === program.organizationId);
    const partnerName = organization ? value(organization, 'name') : '';
    const partnerWebsite = organization ? value(organization, 'website') : '';
    return {
      program,
      sessions: sessions.filter((session) => session.programId === program.id),
      partner: partnerName || partnerWebsite ? { name: partnerName, website: partnerWebsite } : null,
    };
  });
}

export async function getPublicProgramBySlug(slug: string): Promise<PublicProgramBundle | null> {
  const programs = await getPublicPrograms();
  return programs.find((item) => item.program.slug === slug) ?? null;
}
