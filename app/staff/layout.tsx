import type { Metadata } from 'next';
import { StaffGuard } from '../../components/auth/staff-guard';
import { StaffShell } from '../../components/staff/staff-shell';
import { OperationsProvider } from '../../components/data/operations-provider';
import { DemoProvider } from '../../components/demo/demo-provider';

export const metadata: Metadata = { title: 'Operations desk · Rookie Rackets', robots: { index: false, follow: false } };

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <StaffGuard><OperationsProvider><DemoProvider persistent><StaffShell>{children}</StaffShell></DemoProvider></OperationsProvider></StaffGuard>;
}
