'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { DemoRole } from '../../lib/demo/types';
import { useDemo } from './demo-provider';

export function SessionGuard({ role, children }: { role: DemoRole; children: React.ReactNode }) {
  const { state, hydrated } = useDemo();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = state.session?.role === role;

  useEffect(() => {
    if (hydrated && !allowed) router.replace(`/sign-in?next=${encodeURIComponent(pathname || `/${role}`)}`);
  }, [allowed, hydrated, pathname, role, router]);

  if (!hydrated || !allowed) return <main className="demo-gate" aria-live="polite"><div className="demo-gate-card"><span className="demo-kicker">Rookie Rackets demo</span><h1>Opening your workspace…</h1><p>Choose a demo role to continue.</p></div></main>;
  return <>{children}</>;
}

