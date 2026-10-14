'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import type { ProgramStatus, ProgramType } from '../../lib/data/types';
import { useOperations } from '../data/operations-provider';

const statuses: ProgramStatus[] = ['draft', 'planning', 'registration-open', 'active', 'full', 'completed', 'canceled'];
const types: ProgramType[] = ['one-day-workshop', 'multiweek-school-program', 'recurring-partner-program', 'camp', 'community-event', 'tournament', 'clinic'];

export function ProgramManagement({ programId }: { programId: string }) {
  const router = useRouter();
  const { state, mutate, isSaving } = useOperations();
  const program = state.programs.find((item) => item.id === programId && !item.archivedAt);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [status, setStatus] = useState<ProgramStatus>('planning');
  const [type, setType] = useState<ProgramType>('one-day-workshop');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [capacity, setCapacity] = useState(20);
  const [price, setPrice] = useState(0);
  const [deadline, setDeadline] = useState('');
  useEffect(() => {
    if (!program || editing) return;
    setName(program.name); setDescription(program.description); setVenue(program.venue);
    setEligibility(program.eligibility); setStatus(program.status); setType(program.type);
    setVisibility(program.visibility); setCapacity(program.capacity);
    setPrice(program.priceCents / 100); setDeadline(program.registrationDeadline);
  }, [program, editing]);
  if (!program) return null;
  const participants = state.registrations.filter((item) => item.programId === programId && !item.archivedAt && !['canceled', 'refunded'].includes(item.registrationStatus)).length;
  const years = [...new Set(state.sessions.filter((item) => item.programId === programId).map((item) => item.date.slice(0, 4)))];
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !venue.trim() || capacity < 1 || price < 0) return;
    try {
      await mutate(`program:${programId}:edit`, (repository) => repository.updateProgram(programId, {
        name: name.trim(), description: description.trim(), venue: venue.trim(), eligibility: eligibility.trim(),
        status, type, visibility, capacity, priceCents: Math.round(price * 100), registrationDeadline: deadline,
      }), 'Program saved.');
      setEditing(false);
    } catch { /* The operations toast shows the error and the form stays open. */ }
  };
  const archive = async () => {
    if (!window.confirm(`Archive ${program.name}? Its registrations will be preserved, but the program will leave active lists.`)) return;
    try {
      await mutate(`program:${programId}:archive`, (repository) => repository.archiveProgram(programId), 'Program archived.');
      router.push('/staff/programs');
    } catch { /* The operations toast shows the error. */ }
  };
  return <section className="staff-panel record-management" aria-label="Program management">
    <div className="staff-panel-heading"><div><span className="staff-kicker">Program record</span><h2>{years.length ? years.join(', ') : 'Year not scheduled'} · {participants} participants</h2><p>Keep each annual workshop as its own program record so registrations and participant totals stay distinct.</p></div><div className="staff-heading-actions"><button className="staff-button staff-button-outline" type="button" onClick={() => setEditing((value) => !value)}>{editing ? 'Cancel edit' : 'Edit program'}</button><button className="staff-danger-button" type="button" disabled={isSaving(`program:${programId}:archive`)} onClick={() => void archive()}>Archive program</button></div></div>
    {editing && <form className="staff-form" onSubmit={(event) => void save(event)}><div className="staff-form-grid">
      <label>Name<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Venue<input required value={venue} onChange={(event) => setVenue(event.target.value)} /></label>
      <label>Type<select value={type} onChange={(event) => setType(event.target.value as ProgramType)}>{types.map((value) => <option key={value} value={value}>{value.replaceAll('-', ' ')}</option>)}</select></label>
      <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as ProgramStatus)}>{statuses.map((value) => <option key={value} value={value}>{value.replaceAll('-', ' ')}</option>)}</select></label>
      <label>Visibility<select value={visibility} onChange={(event) => setVisibility(event.target.value as 'public' | 'private')}><option value="private">Private</option><option value="public">Public</option></select></label>
      <label>Capacity<input type="number" min="1" required value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} /></label>
      <label>Camp fee ($)<input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(Number(event.target.value))} /></label>
      <label>Registration deadline<input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
      <label className="full-field">Eligibility<input value={eligibility} onChange={(event) => setEligibility(event.target.value)} /></label>
      <label className="full-field">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
    </div><button className="staff-button" type="submit" disabled={isSaving(`program:${programId}:edit`)}>{isSaving(`program:${programId}:edit`) ? 'Saving…' : 'Save program'}</button></form>}
  </section>;
}
