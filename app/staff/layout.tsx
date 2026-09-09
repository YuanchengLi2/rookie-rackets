import type { Metadata } from 'next';
import { StaffShell } from '../../components/staff/staff-shell';
import { OperationsProvider } from '../../components/data/operations-provider';
import { DemoProvider } from '../../components/demo/demo-provider';

export const metadata: Metadata = { title: 'Operations desk · Rookie Rackets', robots: { index: false, follow: false } };

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <OperationsProvider><DemoProvider persistent><StaffShell>{children}</StaffShell></DemoProvider></OperationsProvider>;
}
