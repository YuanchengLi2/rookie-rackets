'use client';

import Link from 'next/link';
import { useState } from 'react';

const navigation = [
  ['Home', '/'],
  ['About', '/about'],
  ['Upcoming Events', '/events'],
  ['Completed Events', '/completed-events'],
  ['FAQ', '/faq'],
];

export function SiteHeader({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Rookie Rackets home">
        <img src="/images/logo.png" alt="Rookie Rackets" />
      </Link>
      <button aria-expanded={open} aria-label="Toggle navigation" className="menu-toggle" onClick={() => setOpen((value) => !value)} type="button">
        <span /><span />
      </button>
      <nav aria-label="Primary navigation" className={open ? 'open' : ''}>
        {navigation.map(([label, href]) => (
          <Link className={active === href ? 'active' : ''} href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link className="header-sign-in" href="/sign-in">Sign In</Link>
        <Link className="button button-small header-cta" href="/contact">Sign Up</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand"><img src="/images/logo.png" alt="" /><div><strong>Rookie Rackets</strong><span>Free badminton in North Carolina.</span></div></div>
        <nav aria-label="Footer navigation">
          <Link href="/about">About</Link><Link href="/events">Events</Link><Link href="/completed-events">Our impact</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link><Link href="/sign-in">Sign In</Link>
        </nav>
        <div className="footer-contact"><span>Cary, North Carolina</span><a href="mailto:teamrookierackets@gmail.com">teamrookierackets@gmail.com</a></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Rookie Rackets</span><span>Student-led • Registered 501(c)(3)</span></div>
    </footer>
  );
}

export function PageCta({ title = 'Ready to pick up a racket?', copy = 'Join the list and we’ll let you know when the next free session opens.' }: { title?: string; copy?: string }) {
  return <section className="page-cta"><div className="shell"><div><p className="eyebrow">Come play with us</p><h2>{title}</h2><p>{copy}</p></div><Link className="button" href="/contact">Join the waitlist →</Link></div></section>;
}
