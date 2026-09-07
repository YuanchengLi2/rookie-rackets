import type { Metadata } from 'next';
import { SessionGuard } from '../../components/demo/session-guard';
import { PortalShell } from '../../components/portal/portal-shell';

export const metadata: Metadata = { title: 'Family portal · Rookie Rackets', robots: { index: false, follow: false } };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <SessionGuard role="family"><PortalShell>{children}</PortalShell></SessionGuard>;
}
