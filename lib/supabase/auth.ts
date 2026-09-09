import type { StaffProfile, StaffRole } from '../data/types';

interface StaffRow {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: StaffRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffLookupClient {
  auth: {
    getUser(): Promise<{ data: { user: { id: string } | null }; error: unknown }>;
  };
  from(table: 'staff_profiles'): {
    select(columns: string): {
      eq(column: 'id', value: string): {
        eq(column: 'active', value: true): {
          maybeSingle(): Promise<{ data: StaffRow | null; error: unknown }>;
        };
      };
    };
  };
}

export function safeReturnPath(value: string | null | undefined): string {
  if (!value || value.includes('\\') || value.includes('\n') || value.includes('\r')) return '/staff';
  if (value === '/staff' || value.startsWith('/staff/')) return value;
  return '/staff';
}

export async function getActiveStaff(client: unknown): Promise<StaffProfile | null> {
  const staffClient = client as StaffLookupClient;
  const { data: userData, error: userError } = await staffClient.auth.getUser();
  if (userError || !userData.user) return null;

  const { data, error } = await staffClient
    .from('staff_profiles')
    .select('id,email,name,initials,role,active,created_at,updated_at')
    .eq('id', userData.user.id)
    .eq('active', true)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    initials: data.initials,
    role: data.role,
    active: data.active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
