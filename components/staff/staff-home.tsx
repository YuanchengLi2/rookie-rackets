'use client';

import Link from 'next/link';
import { ArrowRight, Building2, CalendarDays, CheckCircle2, CircleAlert, ClipboardList, Clock3, FolderKanban, MapPin } from 'lucide-react';
import { formatDemoDate, getNeedsAttention, getProgramCapacity, getStaffSchedule, getTaskCounts } from '../../lib/demo/selectors';
import { useDemo } from '../demo/demo-provider';
import { Metric, StatusBadge } from '../demo/demo-ui';

export function StaffHome() {
  const { state } = useDemo();
  const schedule = getStaffSchedule(state);
  const attention = getNeedsAttention(state);
  const counts = getTaskCounts(state);
  const activePrograms = state.programs.filter((program) => ['active', 'registration-open', 'planning'].includes(program.status));
  const currentRegistrations = state.registrations.filter((registration) => ['confirmed', 'offer-sent'].includes(registration.registrationStatus)).length;

  return <div className="staff-page staff-home-page">
    <div className="staff-page-heading staff-home-heading">
      <h1>Operations</h1>
      <time dateTime={state.demoDate}>{formatDemoDate(state.demoDate, { weekday: 'long', month: 'long', day: 'numeric' })}</time>
    </div>

    <nav className="staff-workspace-links" aria-label="Open a work area">
      <Link href="/staff/programs"><CalendarDays size={17} /><span><b>Open programs</b><small>Schedules, rosters, and curriculum</small></span><ArrowRight size={16} /></Link>
      <Link href="/staff/registrations"><ClipboardList size={17} /><span><b>Open registrations</b><small>Family records and attendance</small></span><ArrowRight size={16} /></Link>
      <Link href="/staff/organizations"><Building2 size={17} /><span><b>Open partners</b><small>Contacts and follow-ups</small></span><ArrowRight size={16} /></Link>
      <Link href="/staff/projects"><FolderKanban size={17} /><span><b>Open projects</b><small>Tasks and due dates</small></span><ArrowRight size={16} /></Link>
    </nav>

    <div className="staff-metric-grid staff-home-metrics">
      <Metric label="Programs underway" value={String(activePrograms.length)} detail={`${activePrograms.filter((program) => program.status === 'active').length} currently active`} />
      <Metric label="Current registrations" value={String(currentRegistrations)} detail="Confirmed or offered" />
      <Metric label="Upcoming sessions" value={String(schedule.length)} detail="On the current schedule" />
      <Metric label="Needs attention" value={String(attention.length)} detail={attention.length ? 'Open items to resolve' : 'Nothing waiting'} />
    </div>

    <div className="staff-home-columns staff-home-priority">
      <section className="staff-panel">
        <div className="staff-panel-heading"><h2>Needs attention</h2><CircleAlert size={18} /></div>
        {attention.length ? <div className="staff-attention-list">{attention.slice(0, 6).map((item) => <Link href={item.href} key={`${item.kind}-${item.id}`}><CircleAlert size={15} /><span><b>{item.label}</b><small>{item.detail}</small></span><ArrowRight size={14} /></Link>)}</div> : <div className="staff-empty-inline"><CheckCircle2 size={20} /><span>Nothing needs attention.</span></div>}
      </section>
      <section className="staff-panel">
        <div className="staff-panel-heading"><h2>Upcoming sessions</h2><Link href="/staff/programs" className="staff-text-link">View schedule <ArrowRight size={14} /></Link></div>
        <div className="staff-schedule-list">{schedule.slice(0, 5).map(({ session, program }) => <Link href={`/staff/programs/${session.programId}?tab=sessions`} key={session.id}><span className="schedule-date">{formatDemoDate(session.date, { weekday: 'short', day: 'numeric' })}</span><span><b>{program?.name}</b><small><Clock3 size={12} /> {session.startTime} · <MapPin size={12} /> {session.location}</small></span><ArrowRight size={14} /></Link>)}</div>
      </section>
    </div>

    <div className="staff-home-columns lower">
      <section className="staff-panel">
        <div className="staff-panel-heading"><h2>Programs underway</h2><Link href="/staff/programs" className="staff-text-link">View all <ArrowRight size={14} /></Link></div>
        <div className="staff-program-list">{activePrograms.map((program) => { const capacity = getProgramCapacity(state, program.id); return <Link className="staff-program-row" href={`/staff/programs/${program.id}`} key={program.id}><span className="program-dot" /><div><b>{program.name}</b><small>{program.venue}</small></div><div className="staff-row-end"><StatusBadge status={program.status} /><span>{capacity.used}/{capacity.capacity}</span><ArrowRight size={15} /></div></Link>; })}</div>
      </section>
      <section className="staff-panel">
        <div className="staff-panel-heading"><h2>My tasks</h2><Link href="/staff/projects" className="staff-text-link">{counts.open} open <ArrowRight size={14} /></Link></div>
        <div className="staff-task-list">{state.tasks.filter((task) => !['done', 'canceled'].includes(task.status)).slice(0, 5).map((task) => <Link href={task.projectId ? `/staff/projects/${task.projectId}` : '/staff/projects'} key={task.id}><span className={`task-priority ${task.priority}`} /><span><b>{task.title}</b><small>{task.dueDate <= state.demoDate ? 'Due now' : `Due ${formatDemoDate(task.dueDate)}`}</small></span><StatusBadge status={task.status} /></Link>)}</div>
      </section>
    </div>
  </div>;
}
