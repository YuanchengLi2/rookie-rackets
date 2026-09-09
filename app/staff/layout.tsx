import type { Metadata } from 'next';
import { StaffGuard } from '../../components/auth/staff-guard';
import { StaffShell } from '../../components/staff/staff-shell';

export const metadata: Metadata = { title: 'Operations desk · Rookie Rackets', robots: { index: false, follow: false } };

export default function StaffLayout({ children }: { children: React.ReactNode }) { return <StaffGuard><StaffShell>{children}</StaffShell></StaffGuard>; }
