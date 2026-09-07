import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DemoSignIn } from '../../components/demo/demo-sign-in';

export const metadata: Metadata = {
  title: 'Demo access | Rookie Rackets',
  description: 'Choose a fictional Rookie Rackets family or staff demo workspace.',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <Suspense fallback={<main className="sign-in-page demo-app" aria-busy="true"><div className="demo-gate-card"><span className="demo-kicker">Rookie Rackets demo</span><h1>Opening demo access…</h1></div></main>}><DemoSignIn /></Suspense>;
}
