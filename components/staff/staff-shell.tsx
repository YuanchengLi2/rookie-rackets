'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarRange, ClipboardList, UsersRound, Building2, FolderKanban, WalletCards, Settings, Menu, X, RefreshCw, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useDemo } from '../demo/demo-provider';
import { ToastRegion } from '../demo/demo-ui';
import { useOperations } from '../data/operations-provider';

const nav = [
  { href: '/staff', label: 'Home', icon: LayoutDashboard },
  { href: '/staff/programs', label: 'Programs', icon: CalendarRange },
  { href: '/staff/registrations', label: 'Registrations', icon: ClipboardList },
  { href: '/staff/coaches', label: 'Coaches', icon: UsersRound },
  { href: '/staff/organizations', label: 'Organizations', icon: Building2 },
  { href: '/staff/projects', label: 'Projects', icon: FolderKanban },
  { href: '/staff/finance', label: 'Finance', icon: WalletCards },
  { href: '/staff/settings', label: 'Settings', icon: Settings },
];

export function StaffShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, signOut } = useDemo();
  const operations = useOperations();
  const profile = state.staffProfiles[0];
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const leave = async () => { await signOut(); router.replace('/sign-in'); router.refresh(); };
  return <div className="staff-app"><aside className={`staff-sidebar ${open ? 'is-open' : ''}`} aria-label="Staff dashboard navigation"><div className="staff-brand"><Link href="/staff" onClick={close}><span className="brand-mark">RR</span><span><b>Rookie Rackets</b><small>Operations desk</small></span></Link><button className="staff-close" aria-label="Close navigation" onClick={close}><X size={20} /></button></div><div className="staff-demo-chip"><span className="status-dot" /> Live workspace</div><nav>{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={close} className={pathname === href || (href !== '/staff' && pathname.startsWith(href)) ? 'active' : ''}><Icon size={17} /><span>{label}</span></Link>)}</nav><div className="staff-sidebar-bottom"><div className="staff-identity"><span className="staff-avatar">{profile?.initials}</span><span><b>{profile?.name || profile?.email}</b><small>{profile?.role}</small></span></div><button type="button" onClick={() => void operations.refresh()}><RefreshCw size={14} /> Refresh data</button><button type="button" onClick={() => void leave()}><LogOut size={14} /> Sign out</button></div></aside>{open && <button className="staff-backdrop" aria-label="Close navigation" onClick={close} />}<div className="staff-main"><header className="staff-topbar"><button className="staff-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={20} /></button><div className="staff-breadcrumb"><span>Rookie Rackets</span><b>/</b><strong>{nav.find((item) => pathname === item.href || (item.href !== '/staff' && pathname.startsWith(item.href)))?.label ?? 'Record'}</strong></div><div className="staff-top-profile"><span className="staff-avatar">{profile?.initials}</span><span>{profile?.name || profile?.email}</span></div></header>{operations.status === 'loading' && <div className="operations-banner" role="status">Loading live operations data…</div>}{operations.status === 'stale' && <div className="operations-banner operations-banner-warning" role="alert">Showing the last loaded data. <button type="button" onClick={() => void operations.refresh()}>Try again</button></div>}{operations.status === 'error' ? <main className="staff-content"><div className="staff-panel"><h1>Operations data is unavailable</h1><p>{operations.error?.message}</p><button className="staff-button" type="button" onClick={() => void operations.refresh()}>Retry</button></div></main> : <main className="staff-content">{children}</main>}</div><ToastRegion /></div>;
}
