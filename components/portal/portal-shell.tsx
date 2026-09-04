'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, CalendarDays, UserRound, Menu, X, RotateCcw, LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DemoNotice } from '../demo/demo-ui';
import { useDemo } from '../demo/demo-provider';

const nav = [
  { href: '/portal', label: 'Home', icon: Home },
  { href: '/portal/camps', label: 'My Camps', icon: CalendarDays },
  { href: '/portal/account', label: 'Account', icon: UserRound },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { getCurrentFamily, signOut, resetDemoData } = useDemo();
  const [open, setOpen] = useState(false);
  const family = getCurrentFamily();
  const close = () => setOpen(false);
  const leave = () => { signOut(); router.replace('/sign-in'); };
  return <div className="portal-app">
    <aside className={`portal-sidebar ${open ? 'is-open' : ''}`} aria-label="Family portal navigation">
      <div className="portal-brand"><Link href="/portal" onClick={close}><span className="brand-mark">RR</span><span><b>Rookie Rackets</b><small>Family portal</small></span></Link><button className="portal-close" aria-label="Close navigation" onClick={close}><X size={20} /></button></div>
      <div className="portal-mode"><span className="status-dot" /> Demo mode</div>
      <nav>{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={close} className={pathname === href || (href !== '/portal' && pathname.startsWith(href)) ? 'active' : ''}><Icon size={18} /><span>{label}</span></Link>)}</nav>
      <div className="portal-profile"><div className="avatar">{family?.firstName.slice(0, 1)}{family?.lastName.slice(0, 1)}</div><div><b>{family?.firstName} {family?.lastName}</b><small>{family?.email}</small></div></div>
      <div className="portal-sidebar-actions"><button type="button" onClick={() => resetDemoData()}><RotateCcw size={15} /> Reset demo</button><button type="button" onClick={leave}><LogOut size={15} /> Sign out</button></div>
    </aside>
    {open && <button className="portal-backdrop" aria-label="Close navigation" onClick={close} />}
    <div className="portal-main">
      <header className="portal-topbar"><button className="portal-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={21} /></button><h1>{nav.find((item) => pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href)))?.label ?? 'My Camps'}</h1><Link href="/portal/account" className="portal-top-profile" aria-label="Account"><span className="avatar">{family?.firstName.slice(0, 1)}{family?.lastName.slice(0, 1)}</span><ChevronRight size={16} /></Link></header>
      <main className="portal-content"><DemoNotice />{children}</main>
    </div>
  </div>;
}
