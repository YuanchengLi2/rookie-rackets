import type { Metadata } from 'next';
import { Suspense } from 'react';
import { StaffSignIn } from '../../components/auth/staff-sign-in';

export const metadata: Metadata = {
  title: 'Staff access | Rookie Rackets',
  description: 'Secure access to the Rookie Rackets operations desk.',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <Suspense fallback={<main className="sign-in-page demo-app" aria-busy="true"><div className="demo-gate-card"><span className="demo-kicker">Rookie Rackets</span><h1>Opening staff access…</h1></div></main>}><StaffSignIn /></Suspense>;
}
