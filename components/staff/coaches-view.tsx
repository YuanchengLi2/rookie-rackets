'use client';

import Link from 'next/link';
import { CalendarDays, ChevronRight, Clock3, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { formatDemoDate, getCoachAssignments, getProgram } from '../../lib/demo/selectors';
import { useDemo } from '../demo/demo-provider';
import { DemoDrawer } from '../demo/overlay';
import { EmptyState, StatusBadge } from '../demo/demo-ui';

export function CoachesView() {
  const { state } = useDemo();
  const [selected, setSelected] = useState<string | null>(null);
  const selectedCoach = state.coaches.find((coach) => coach.id === selected);
  const selectedSessions = selectedCoach ? getCoachAssignments(state, selectedCoach.id) : [];
  const selectedProgramIds = [...new Set(selectedSessions.map((session) => session.programId))];
  const selectedPrograms = selectedProgramIds.map((id) => getProgram(state, id)).filter(Boolean);

  return (
    <div className="staff-page">
      <div className="staff-page-heading">
        <h1>Coaches</h1>
        <div className="staff-summary-pill"><UsersRound size={16} /> {state.coaches.filter((coach) => coach.active).length} active coaches</div>
      </div>

      <div className="coach-grid">
        {state.coaches.map((coach) => {
          const assignments = getCoachAssignments(state, coach.id);
          const programCount = new Set(assignments.map((session) => session.programId)).size;
          return (
            <button className="coach-card" type="button" onClick={() => setSelected(coach.id)} key={coach.id} aria-label={`View ${coach.name}`}>
              <div className="coach-card-top">
                <span className="coach-avatar">{coach.name.slice(0, 2).toUpperCase()}</span>
                <span><b>{coach.name}</b><small>{coach.role.replaceAll('-', ' ')}</small></span>
                <ChevronRight size={17} />
              </div>
              <p>{coach.experience}</p>
              <div className="coach-card-stats">
                <span><strong>{coach.volunteerHours}</strong><small>volunteer hours</small></span>
                <span><strong>{programCount}</strong><small>program{programCount === 1 ? '' : 's'}</small></span>
                <span><strong>{assignments.length}</strong><small>sessions</small></span>
              </div>
            </button>
          );
        })}
      </div>

      <DemoDrawer open={Boolean(selectedCoach)} title={selectedCoach ? `${selectedCoach.name} · coach profile` : 'Coach profile'} onClose={() => setSelected(null)}>
        {selectedCoach && (
          <div className="drawer-content coach-profile-drawer">
            <div className="drawer-coach-head">
              <span className="coach-avatar coach-avatar-large">{selectedCoach.name.slice(0, 2).toUpperCase()}</span>
              <div><h3>{selectedCoach.name}</h3><p>{selectedCoach.role.replaceAll('-', ' ')} · {selectedCoach.volunteerHours} volunteer hours</p></div>
            </div>
            <div className="coach-profile-summary">
              <span><Clock3 size={17} /><strong>{selectedCoach.volunteerHours}</strong><small>Total hours</small></span>
              <span><UsersRound size={17} /><strong>{selectedPrograms.length}</strong><small>Programs</small></span>
              <span><CalendarDays size={17} /><strong>{selectedSessions.length}</strong><small>Upcoming sessions</small></span>
            </div>

            <section className="drawer-section">
              <div className="drawer-section-heading"><h3>Programs</h3><StatusBadge status={selectedCoach.active ? 'active' : 'inactive'} /></div>
              {selectedPrograms.length ? selectedPrograms.map((program) => program && (
                <Link className="coach-program-row" href={`/staff/programs/${program.id}`} key={program.id}>
                  <span><b>{program.name}</b><small>{program.venue}</small></span><ChevronRight size={16} />
                </Link>
              )) : <EmptyState title="No programs yet" description="This coach does not have a current program assignment." />}
            </section>

            <section className="drawer-section">
              <div className="drawer-section-heading"><h3>Upcoming sessions</h3></div>
              {selectedSessions.length ? selectedSessions.map((session) => {
                const program = getProgram(state, session.programId);
                return (
                  <div className="assignment-row" key={session.id}>
                    <div><b>{program?.name}</b><small>{formatDemoDate(session.date, { weekday: 'short', month: 'short', day: 'numeric' })} · {session.startTime}–{session.endTime}</small></div>
                    <StatusBadge status={session.status} />
                  </div>
                );
              }) : <EmptyState title="No upcoming sessions" description="There are no scheduled sessions for this coach." />}
            </section>
          </div>
        )}
      </DemoDrawer>
    </div>
  );
}
