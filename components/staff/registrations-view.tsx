'use client';

import { Download, FileCheck2, Filter, Search, ShieldCheck, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { downloadCsv } from '../../lib/demo/csv';
import { formatDemoDate, getProgram, getRegistrationAttendance, getRegistrationConsents } from '../../lib/demo/selectors';
import type { Registration, RegistrationStatus } from '../../lib/demo/types';
import { useDemo } from '../demo/demo-provider';
import { DemoDrawer } from '../demo/overlay';
import { EmptyState, StatusBadge } from '../demo/demo-ui';

const statuses: RegistrationStatus[] = ['confirmed', 'offer-sent', 'waitlisted', 'incomplete', 'completed', 'canceled', 'refunded'];

export function RegistrationsView() {
  const { state, updateRegistrationStatus } = useDemo();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [program, setProgram] = useState('all');
  const [formState, setFormState] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const rows = useMemo(() => state.registrations.filter((registration) => {
    const target = `${registration.childFirstName} ${registration.childLastName} ${registration.guardianEmail}`.toLowerCase();
    const programRecord = getProgram(state, registration.programId);
    const consents = getRegistrationConsents(state, registration.id);
    const requiredComplete = consents.filter((item) => item.type !== 'photo-video').every((item) => item.accepted);
    return Boolean(programRecord) && target.includes(query.toLowerCase()) && (status === 'all' || registration.registrationStatus === status) && (program === 'all' || registration.programId === program) && (formState === 'all' || (formState === 'complete' ? requiredComplete : !requiredComplete));
  }), [formState, program, query, state, status]);
  const record = selected ? state.registrations.find((item) => item.id === selected) : undefined;
  const selectedProgram = record ? getProgram(state, record.programId) : undefined;
  const clear = () => { setQuery(''); setStatus('all'); setProgram('all'); setFormState('all'); };
  const exportRows = () => downloadCsv('rookie-rackets-registrations.csv', [
    ['Player', 'Program', 'Guardian email', 'Status', 'Payment', 'Forms'],
    ...rows.map((registration) => {
      const programRecord = getProgram(state, registration.programId);
      const complete = getRegistrationConsents(state, registration.id).filter((item) => item.type !== 'photo-video').every((item) => item.accepted);
      return [`${registration.childFirstName} ${registration.childLastName}`, programRecord?.name ?? '', registration.guardianEmail, registration.registrationStatus, registration.paymentStatus, complete ? 'Complete' : 'Needs attention'];
    }),
  ]);
  return <div className="staff-page">
    <div className="staff-page-heading"><div><p className="staff-kicker">Family records</p><h1>Registrations</h1><p>Review rosters and update safe operational statuses without exposing support details in the list.</p></div><button className="staff-button staff-button-outline" type="button" onClick={exportRows}><Download size={16} /> Export CSV</button></div>
    <div className="staff-filter-bar"><label><Search size={15} /><span className="sr-only">Search registrations</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search player or guardian" /></label><label><Filter size={14} /><span className="sr-only">Registration status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>)}</select></label><label><span className="sr-only">Program</span><select value={program} onChange={(event) => setProgram(event.target.value)}><option value="all">All programs</option>{state.programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span className="sr-only">Form state</span><select value={formState} onChange={(event) => setFormState(event.target.value)}><option value="all">All form states</option><option value="complete">Forms complete</option><option value="attention">Needs form attention</option></select></label>{(query || status !== 'all' || program !== 'all' || formState !== 'all') && <button type="button" className="staff-clear" onClick={clear}><X size={14} /> Clear</button>}</div>
    <div className="staff-record-table"><div className="staff-table-head"><span>Player / guardian</span><span>Program</span><span>Status</span><span>Forms & safety</span><span>Attendance</span></div>{rows.length ? rows.map((registration) => <RegistrationRow key={registration.id} registration={registration} state={state} onOpen={() => setSelected(registration.id)} />) : <EmptyState title="No registrations match" description="Clear a filter to see the full demo roster." action={<button type="button" className="staff-button staff-button-outline" onClick={clear}>Clear filters</button>} />}</div>
    <DemoDrawer open={Boolean(record)} title={record ? `${record.childFirstName} ${record.childLastName}` : 'Registration detail'} onClose={() => setSelected(null)}>{record && <div className="drawer-content"><p className="staff-kicker">{selectedProgram?.name}</p><StatusBadge status={record.registrationStatus} /><dl className="detail-list"><div><dt>Guardian</dt><dd>{record.guardianFirstName} {record.guardianLastName}<br />{record.guardianEmail}<br />{record.guardianPhone}</dd></div><div><dt>Player</dt><dd>{record.grade} · {record.skillLevel}</dd></div><div><dt>Safety information</dt><dd>On file for this fictional demo record. Detailed support text is intentionally hidden from operational lists.</dd></div></dl><label>Update status<select value={record.registrationStatus} onChange={(event) => updateRegistrationStatus(record.id, event.target.value as RegistrationStatus)}>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>)}</select></label><div className="drawer-note"><ShieldCheck size={16} /><span>Staff edits here are shared with family status views on this browser.</span></div></div>}</DemoDrawer>
  </div>;
}

function RegistrationRow({ registration, state, onOpen }: { registration: Registration; state: import('../../lib/demo/types').DemoState; onOpen: () => void }) {
  const program = getProgram(state, registration.programId);
  const consents = getRegistrationConsents(state, registration.id);
  const complete = consents.filter((item) => item.type !== 'photo-video').every((item) => item.accepted);
  const attendance = getRegistrationAttendance(state, registration.id);
  return <button className="staff-table-row staff-click-row" type="button" onClick={onOpen}><div className="table-primary"><span className="record-avatar">{registration.childFirstName.slice(0, 1)}{registration.childLastName.slice(0, 1)}</span><span><b>{registration.childFirstName} {registration.childLastName}</b><small>{registration.guardianFirstName} {registration.guardianLastName} · {registration.guardianEmail}</small></span></div><span>{program?.name}<small>{formatDemoDate(registration.createdAt)}</small></span><StatusBadge status={registration.registrationStatus} /><span className="safety-indicator">{complete ? <><ShieldCheck size={15} /> Forms on file</> : <><FileCheck2 size={15} /> Needs attention</>}</span><span>{attendance.filter((item) => item.status === 'present').length}/{attendance.length || '—'} present</span></button>;
}
