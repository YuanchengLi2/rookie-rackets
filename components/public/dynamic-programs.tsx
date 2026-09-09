import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import type { PublicProgramBundle } from '../../lib/data/public-programs';

function dateLabel(date: string) { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)); }

export function DynamicPublicPrograms({ programs }: { programs: PublicProgramBundle[] }) {
  if (!programs.length) return <section className="demo-public-sessions shell"><div className="home-section-title"><div><p className="eyebrow">Programs</p><h2>New dates are coming</h2></div><p>Contact us to hear when the next free workshop opens.</p></div></section>;
  return <section className="demo-public-sessions shell" data-reveal><div className="home-section-title"><div><p className="eyebrow">Upcoming programs</p><h2>Find a place to play</h2></div><p>Programs shown here are maintained by the Rookie Rackets team.</p></div><div className="demo-public-session-list">{programs.map(({ program, sessions }) => <article className="demo-public-session" key={program.id}><div className="demo-public-session-copy"><span className={`status-badge status-${program.status}`}>{program.status.replaceAll('-', ' ')}</span><h3>{program.name}</h3><p>{program.description}</p><div className="demo-public-session-meta"><span><MapPin size={14} /> {program.venue}</span><span><CalendarDays size={14} /> {sessions[0] ? dateLabel(sessions[0].date) : 'Dates coming soon'}</span></div></div><div className="demo-public-session-actions">{['registration-open', 'active', 'full'].includes(program.status) && sessions.length > 0 && <Link className="button button-small" href={`/register/${program.slug}`}>{program.status === 'full' ? 'Join waitlist' : 'Register'}</Link>}<Link className="under-link" href={`/events/${program.slug}`}>View details <ArrowRight size={15} /></Link></div></article>)}</div></section>;
}
