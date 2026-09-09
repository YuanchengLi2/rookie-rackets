import { NextResponse, type NextRequest } from 'next/server';
import { getActiveStaff, safeReturnPath } from '../../../lib/supabase/auth';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = safeReturnPath(request.nextUrl.searchParams.get('next'));
  const supabase = await createServerSupabaseClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const staff = await getActiveStaff(supabase);
      if (staff) return NextResponse.redirect(new URL(next, request.url));
    }
  }

  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/sign-in?error=unauthorized', request.url));
}
