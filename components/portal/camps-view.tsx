'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, ListFilter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDemoDate, getFamilyRegistrations, getProgram, getRegistrationSessions } from '../../lib/demo/selectors';
import { useDemo } from '../demo/demo-provider';
import { EmptyState, StatusBadge } from '../demo/demo-ui';

const filters = [
  { id: 'current', label: 'Current', statuses: ['incomplete', 'confirmed', 'waitlisted', 'offer-sent'] },
  { id: 'past', label: 'Past', statuses: ['completed', 'canceled', 'refunded'] },
];

export function CampsView() {
  const { state } = useDemo();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const registrations = getFamilyRegistrations(state, 'family-demo');
  const visible = useMemo(() => registrations.filter((registration) => {
    const program = getProgram(state, registration.programId);
    const matchesFilter = filter === 'all' || filters.find((item) => item.id === filter)?.statuses.includes(registration.registrationStatus);
    return matchesFilter && `${registration.childFirstName} ${registration.childLastName} ${program?.name ?? ''}`.toLowerCase().includes(query.toLowerCase());
  }), [filter, query, registrations, state]);

  return <div className="portal-view"><div className="view-intro"><div><p className="eyebrow">Everything in one place</p><h2>My Camps</h2><p>Open a camp to see its dates, forms, payment, and player details.</p></div><Link className="button button-outline" href="/events"><CalendarDays size={16} /> Find a camp</Link></div><div className="portal-filter-row"><label className="search-field"><Search size={16} /><span className="sr-only">Search camps</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search camps" /></label><div className="filter-tabs" role="group" aria-label="Camp filters"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')} type="button"><ListFilter size={15} /> All</button>{filters.map((item) => <button className={filter === item.id ? 'active' : ''} onClick={() => setFilter(item.id)} type="button" key={item.id}>{item.label}</button>)}</div></div><div className="registration-record-list">{visible.length ? visible.map((registration) => { const program = getProgram(state, registration.programId); const dates = getRegistrationSessions(state, registration); const firstDate = dates[0]?.date; return <Link className="registration-record card" href={`/portal/camps/${registration.id}`} key={registration.id}><div className="record-leading"><span className="record-avatar">{registration.childFirstName.slice(0, 1)}{registration.childLastName.slice(0, 1)}</span><div><p className="eyebrow">{program?.name}</p><h3>{registration.childFirstName} {registration.childLastName}</h3><p>{program?.venue}{firstDate ? ` · Starts ${formatDemoDate(firstDate)}` : ''}</p></div></div><div className="record-meta"><StatusBadge status={registration.registrationStatus} /><span>{dates.length} {dates.length === 1 ? 'date' : 'dates'}</span></div><ArrowRight size={17} /></Link>; }) : <EmptyState title="No camps here" description="Try another filter or find a camp." action={<button className="button button-outline" type="button" onClick={() => setFilter('all')}>Clear filters</button>} />}</div></div>;
}
