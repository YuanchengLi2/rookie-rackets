'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { formatDemoDate, getProgramSessions } from '../../lib/demo/selectors';
import { useOptionalDemo } from '../demo/demo-provider';
import { StatusBadge } from '../demo/demo-ui';

const staticPublicSlugs = new Set(['boys-club-fall', 'tmsa-fall', 'carpenter-elementary']);

/**
 * Shows public programs created or edited in the local staff demo. The
 * approved static event page remains unchanged when rendered outside the demo
 * provider (for example, in the existing public route tests).
 */
export function DynamicPublicPrograms() {
  const demo = useOptionalDemo();
  if (!demo) return null;

  const programs = demo.state.programs.filter(
    (program) =>
      program.visibility === 'public' &&
      ['planning', 'registration-open', 'full', 'active'].includes(program.status) &&
      !staticPublicSlugs.has(program.slug),
  );
  if (!programs.length) return null;

  return (
    <section className="demo-public-sessions shell" data-reveal>
      <div className="home-section-title">
        <div>
          <p className="eyebrow">Demo schedule</p>
          <h2>More ways to play</h2>
        </div>
        <p>New public records created in the staff workspace appear here in this browser.</p>
      </div>
      <div className="demo-public-session-list">
        {programs.map((program) => {
          const sessions = getProgramSessions(demo.state, program.id);
          const firstSession = sessions[0];
          return (
            <article className="demo-public-session" key={program.id}>
              <div className="demo-public-session-copy">
                <StatusBadge status={program.status} />
                <h3>{program.name}</h3>
                <p>{program.description}</p>
                <div className="demo-public-session-meta">
                  <span>
                    <MapPin size={14} /> {program.venue}
                  </span>
                  <span>
                    <CalendarDays size={14} />{' '}
                    {firstSession ? formatDemoDate(firstSession.date) : 'Dates coming soon'}
                  </span>
                </div>
              </div>
              <div className="demo-public-session-actions">
                {['registration-open', 'active', 'full'].includes(program.status) && <Link className="button button-small" href={`/register/${program.slug}`}>{program.status === 'full' ? 'Join waitlist' : 'Register'}</Link>}
                <Link className="under-link" href={`/events/${program.slug}`}>
                  View details <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
