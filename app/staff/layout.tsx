import type { Metadata } from 'next';
import { SessionGuard } from '../../components/demo/session-guard';
import { StaffShell } from '../../components/staff/staff-shell';

export const metadata: Metadata = { title: 'Operations desk · Rookie Rackets', robots: { index: false, follow: false } };

export default function StaffLayout({ children }: { children: React.ReactNode }) { return <SessionGuard role="staff"><StaffShell>{children}</StaffShell></SessionGuard>; }
