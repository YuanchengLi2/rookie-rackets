'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, TriangleAlert } from 'lucide-react';
import { formatDemoDate, getFamilyRegistrations, getFamilyRequiredActions, getNextFamilySession, getProgram } from '../../lib/demo/selectors';
import { useDemo } from '../demo/demo-provider';
import { StatusBadge } from '../demo/demo-ui';

const currentStatuses = new Set(['incomplete', 'confirmed', 'waitlisted', 'offer-sent']);

export function PortalHome() {
  const { state, getCurrentFamily } = useDemo();
  const family = getCurrentFamily();
  const next = getNextFamilySession(state, 'family-demo');
  const camps = getFamilyRegistrations(state, 'family-demo').filter((registration) => currentStatuses.has(registration.registrationStatus));
  const actions = getFamilyRequiredActions(state, 'family-demo');

  return <div className="portal-view">
    <div className="portal-welcome"><div><p className="eyebrow">Family portal</p><h2>Your family</h2><p>Hi {family?.firstName ?? 'there'} — here is everything you need for your camps.</p></div><Link className="button button-outline" href="/events"><CalendarDays size={16} /> Find a camp</Link></div>

    {next ? <section className="card portal-next">
      <div className="section-heading"><div><p className="eyebrow">Next session</p><h2>{next.program.name}</h2></div><StatusBadge status={next.registration.registrationStatus} /></div>
      <div className="next-session-detail"><div className="next-date"><b>{formatDemoDate(next.session.date, { month: 'short' })}</b><strong>{formatDemoDate(next.session.date, { day: 'numeric' })}</strong></div><div><p><Clock3 size={15} /> {next.session.startTime}–{next.session.endTime}</p><p><MapPin size={15} /> {next.session.location}</p></div><Link className="text-link" href={`/portal/camps/${next.registration.id}`}>Open camp <ArrowRight size={15} /></Link></div>
    </section> : <section className="card portal-empty-next"><h3>No upcoming dates</h3><p>When you join a camp, its next date will show here.</p></section>}

    <div className="portal-home-grid">
      <section className="card"><div className="section-heading"><h3>My Camps</h3><Link className="text-link" href="/portal/camps">See all <ArrowRight size={15} /></Link></div><div className="portal-camp-list">{camps.map((registration) => { const program = getProgram(state, registration.programId); return <Link key={registration.id} href={`/portal/camps/${registration.id}`}><span><b>{program?.name}</b><small>{registration.childFirstName} {registration.childLastName}</small></span><StatusBadge status={registration.registrationStatus} /></Link>; })}</div></section>
      <section className="card"><div className="section-heading"><h3>To do</h3>{actions.length > 0 && <TriangleAlert className="attention-icon" size={19} />}</div>{actions.length ? <div className="action-list">{actions.map((action) => <Link key={action.id} href={action.href}><span><b>{action.label}</b><small>{action.detail}</small></span><ArrowRight size={15} /></Link>)}</div> : <div className="all-set"><CheckCircle2 size={19} /><div><b>You’re all set</b><p>There are no required actions right now.</p></div></div>}</section>
    </div>
  </div>;
}
