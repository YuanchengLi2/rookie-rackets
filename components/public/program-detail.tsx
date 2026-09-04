'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarDays, Check, MapPin, Users } from 'lucide-react';
import { SiteFooter, SiteHeader } from '../site-shell';
import { getProgram, getProgramCapacity, getProgramSessions, formatDemoDate } from '../../lib/demo/selectors';
import { useDemo } from '../demo/demo-provider';
import { DemoNotice, StatusBadge } from '../demo/demo-ui';

export function ProgramDetail({ programId }: { programId: string }) {
  const { state } = useDemo();
  const program = getProgram(state, programId);
  if (!program) return <main className="event-detail-page"><SiteHeader active="/events" /><section className="shell section"><p className="eyebrow">Rookie Rackets</p><h1>Program not found</h1><Link className="button" href="/events">Back to events</Link></section><SiteFooter /></main>;
  const organization = state.organizations.find((item) => item.id === program.organizationId);
  const capacity = getProgramCapacity(state, program.id);
  const sessions = getProgramSessions(state, program.id);
  const canRegister = ['registration-open', 'active', 'full'].includes(program.status);
  return <main className="event-detail-page">
    <SiteHeader active="/events" />
    <section className="event-detail-hero shell"><Link className="event-detail-back" href="/events"><ArrowLeft size={15} /> Back to upcoming events</Link></section>
    <section className="event-detail-grid shell">
      <div><img className="event-detail-photo" src={program.image} alt={`${program.name} workshop`} /><div className="event-detail-schedule"><h2>Schedule</h2>{sessions.length ? sessions.map((session) => <div className="event-detail-session" key={session.id}><strong>{formatDemoDate(session.date, { weekday: 'short', month: 'short', day: 'numeric' })}</strong><span>{session.startTime}–{session.endTime}</span></div>) : <p className="event-detail-disabled">Dates will be shared when this program is confirmed.</p>}</div></div>
      <div className="event-detail-copy"><StatusBadge status={program.status} /><h1>{program.name}</h1><p>{program.description}</p><dl className="event-detail-meta"><div><dt><CalendarDays size={13} /> Dates</dt><dd>{sessions.length ? `${formatDemoDate(sessions[0].date)} – ${formatDemoDate(sessions[sessions.length - 1].date)}` : 'Dates coming soon'}</dd></div><div><dt><MapPin size={13} /> Location</dt><dd>{program.venue}</dd></div><div><dt><Users size={13} /> Who can join</dt><dd>{program.eligibility}</dd></div><div><dt><Check size={13} /> Cost</dt><dd>{program.price === 0 ? 'Free' : `$${program.price}`}</dd></div></dl><p className="eyebrow">Partner · {organization?.name ?? 'Rookie Rackets'}</p><p>Led by the Rookie Rackets team. No previous experience or equipment is required.</p>
        <aside className="event-detail-side"><h2>Ready to play?</h2><p>Reserve a place for this demo program. This form is local-only and does not submit anything.</p><div className="event-detail-capacity"><span>Places</span><strong>{capacity.remaining > 0 ? `${capacity.remaining} open` : 'Waitlist available'}</strong></div><div className="event-detail-actions">{canRegister ? <Link className="button" href={`/register/${program.slug}`}>{capacity.remaining > 0 ? 'Register for this program' : 'Join the waitlist'} <span aria-hidden="true">→</span></Link> : <span className="event-detail-disabled">Registration is closed for this program.</span>}<Link className="event-account-link" href="/sign-in?next=/portal/camps">Open family account</Link></div><ul>{program.whatToBring.map((item) => <li key={item}>{item}</li>)}{program.equipmentProvided && <li>Rackets and equipment provided</li>}</ul><small>Registration deadline · {formatDemoDate(program.registrationDeadline)}</small></aside>
      </div>
    </section>
    <DemoNotice>Demo program details · fictional data only. Registration changes are saved in this browser and never sent to Rookie Rackets.</DemoNotice>
    <SiteFooter />
  </main>;
}
