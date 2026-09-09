import { redirect } from 'next/navigation';
import { getActiveStaff } from '../../lib/supabase/auth';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export async function StaffGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const staff = await getActiveStaff(supabase);
  if (!staff) redirect('/sign-in?next=%2Fstaff');
  return <>{children}</>;
}
