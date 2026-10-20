'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const navigation = [
  ['Home', '/'],
  ['About Us', '/about'],
  ['Events', '/events'],
  ['FAQ', '/faq'],
];

export function SiteHeader({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const eventsRef = useRef<HTMLDivElement>(null);
  const eventsButton = useRef<HTMLButtonElement>(null);
  const closeNavigation = () => { setOpen(false); setEventsOpen(false); };
  useEffect(() => {
    if (!eventsOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!eventsRef.current?.contains(event.target as Node)) setEventsOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [eventsOpen]);
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Rookie Rackets home">
        <img src="/images/logo.png" alt="Rookie Rackets" />
      </Link>
      <button aria-expanded={open} aria-label="Toggle navigation" className="menu-toggle" onClick={() => { setOpen((value) => !value); setEventsOpen(false); }} type="button">
        <span /><span />
      </button>
      <nav aria-label="Primary navigation" className={open ? 'open' : ''}>
        {navigation.map(([label, href]) => label === 'Events' ? (
          <div className="events-navigation" key={href} ref={eventsRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEventsOpen(false); }} onKeyDown={(event) => { if (event.key === 'Escape') { setEventsOpen(false); eventsButton.current?.focus(); } }}>
            <button ref={eventsButton} type="button" className={`events-toggle ${active.startsWith('/events') || active === '/completed-events' ? 'active' : ''}`} aria-expanded={eventsOpen} aria-controls="events-navigation-links" onClick={() => setEventsOpen((value) => !value)}>Events <svg aria-hidden="true" width="10" height="7" viewBox="0 0 10 7"><path d="m1 1 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></button>
            <div id="events-navigation-links" className="events-dropdown" hidden={!eventsOpen}>
              <Link href="/events#current-events" onClick={closeNavigation}>Current Events</Link>
              <Link href="/events#upcoming-events" onClick={closeNavigation}>Upcoming Events</Link>
              <Link href="/completed-events" onClick={closeNavigation}>Past Events</Link>
            </div>
          </div>
        ) : <Link className={active === href ? 'active' : ''} href={href} key={href} onClick={closeNavigation}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <Link className={`header-sign-in ${active === '/contact-us' ? 'active' : ''}`} href="/contact-us">Contact us</Link>
        <Link className="button button-small button-blue header-cta" href="/contact">Sign up</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand"><img src="/images/logo.png" alt="" /><div><strong>Rookie Rackets</strong><span>Free Badminton in Triangle, NC.</span></div></div>
        <nav aria-label="Footer navigation">
          <Link href="/about">About Us</Link><Link href="/events">Events</Link><Link href="/completed-events">Our impact</Link><Link href="/faq">FAQ</Link><Link href="/contact">Sign up</Link><Link href="/contact-us">Contact us</Link>
        </nav>
        <div className="footer-contact"><span>Cary, North Carolina</span><a href="mailto:teamrookierackets@gmail.com">teamrookierackets@gmail.com</a></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Rookie Rackets</span><span>Student-led • Registered 501(c)(3)</span></div>
    </footer>
  );
}

export function PageCta({ title = 'Find your place in the game.', copy = 'Join a workshop, volunteer with our team, or share your skills as a coach.' }: { title?: string; copy?: string }) {
  return <section className="page-cta"><div className="shell"><div><p className="eyebrow">Get involved</p><h2>{title}</h2><p>{copy}</p></div><Link className="button" href="/contact">Sign up →</Link></div></section>;
}
