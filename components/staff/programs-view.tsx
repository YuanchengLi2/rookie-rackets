'use client';

import Link from 'next/link';
import { CalendarPlus, ChevronRight, Filter, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ProgramDraft, ProgramStatus, ProgramType } from '../../lib/demo/types';
import { formatDemoDate, getProgramCapacity } from '../../lib/demo/selectors';
import { useDemo } from '../demo/demo-provider';
import { DemoModal } from '../demo/overlay';
import { EmptyState, StatusBadge } from '../demo/demo-ui';
import { useOperations } from '../data/operations-provider';

const statuses: ProgramStatus[] = [
  'active',
  'registration-open',
  'planning',
  'full',
  'completed',
  'canceled',
  'draft',
];
const types: ProgramType[] = [
  'recurring-partner-program',
  'multiweek-school-program',
  'one-day-workshop',
  'camp',
  'community-event',
  'tournament',
  'clinic',
];

export function ProgramsView() {
  const { state } = useDemo();
  const operations = useOperations();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProgramDraft>(() => ({
    name: '',
    organizationId: state.organizations[0]?.id ?? '',
    type: 'one-day-workshop',
    venue: '',
    capacity: 20,
    leadCoachId: state.coaches[0]?.id ?? '',
    status: 'planning',
    visibility: 'private',
    price: 0,
    registrationDeadline: state.demoDate,
    description: '',
  }));
  const programs = useMemo(
    () =>
      state.programs.filter(
        (program) =>
          `${program.name} ${program.venue}`.toLowerCase().includes(query.toLowerCase()) &&
          (status === 'all' || program.status === status) &&
          (type === 'all' || program.type === type),
      ),
    [query, state.programs, status, type],
  );
  const set = (key: keyof ProgramDraft, value: string | number) =>
    setDraft((current) => ({ ...current, [key]: value } as ProgramDraft));
  const resetDraft = () =>
    setDraft({
      name: '',
      organizationId: state.organizations[0]?.id ?? '',
      type: 'one-day-workshop',
      venue: '',
      capacity: 20,
      leadCoachId: state.coaches[0]?.id ?? '',
      status: 'planning',
      visibility: 'private',
      price: 0,
      registrationDeadline: state.demoDate,
      description: '',
    });
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.venue.trim()) return;
    try {
      await operations.mutate('program:create', (repository) => repository.createProgram({ slug: `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${crypto.randomUUID().slice(0, 5)}`, name: draft.name, organizationId: draft.organizationId || null, type: draft.type, description: draft.description, venue: draft.venue, skillLevel: 'mixed', eligibility: '', capacity: draft.capacity, leadCoachId: draft.leadCoachId || null, status: draft.status, visibility: draft.visibility, priceCents: Math.round(draft.price * 100), registrationDeadline: draft.registrationDeadline, whatToBring: [], equipmentProvided: true, image: '', contact: operations.state.settings?.contactEmail ?? '' }), 'Program created.');
      setOpen(false);
      resetDraft();
    } catch { /* Keep draft open for retry. */ }
  };

  return (
    <div className="staff-page">
      <div className="staff-page-heading">
        <h1>Programs</h1>
        <button className="staff-button" type="button" onClick={() => setOpen(true)}>
          <Plus size={16} /> Create program
        </button>
      </div>
      <div className="staff-filter-bar">
        <label>
          <Search size={15} />
          <span className="sr-only">Search programs</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or venue" />
        </label>
        <label>
          <Filter size={14} />
          <span className="sr-only">Filter by status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll('-', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">All types</option>
            {types.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll('-', ' ')}
              </option>
            ))}
          </select>
        </label>
        {(query || status !== 'all' || type !== 'all') && (
          <button
            className="staff-clear"
            type="button"
            onClick={() => {
              setQuery('');
              setStatus('all');
              setType('all');
            }}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
      <div className="staff-record-table">
        <div className="staff-table-head">
          <span>Program</span>
          <span>Status</span>
          <span>Dates / venue</span>
          <span>Capacity</span>
          <span />
        </div>
        {programs.length ? (
          programs.map((program) => {
            const capacity = getProgramCapacity(state, program.id);
            return (
              <Link className="staff-table-row" href={`/staff/programs/${program.id}`} key={program.id}>
                <div className="table-primary">
                  <span className="table-icon">
                    <CalendarPlus size={16} />
                  </span>
                  <span>
                    <b>{program.name}</b>
                    <small>
                      {program.visibility} · {program.type.replaceAll('-', ' ')}
                    </small>
                  </span>
                </div>
                <StatusBadge status={program.status} />
                <span>
                  <b>{formatDemoDate(program.registrationDeadline)}</b>
                  <small>{program.venue}</small>
                </span>
                <span className="capacity-bar">
                  <i style={{ width: `${Math.min(capacity.percent, 100)}%` }} />
                  <b>
                    {capacity.used}/{capacity.capacity}
                  </b>
                </span>
                <span className="row-chevron" aria-hidden="true"><ChevronRight size={17} /></span>
              </Link>
            );
          })
        ) : (
          <EmptyState
            title="No programs match"
            description="Try clearing a filter or create a private planning record."
            action={
              <button
                type="button"
                className="staff-button staff-button-outline"
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                  setType('all');
                }}
              >
                Clear filters
              </button>
            }
          />
        )}
      </div>
      <DemoModal open={open} title="Create program" onClose={() => setOpen(false)}>
        <form className="staff-form" onSubmit={(event) => void save(event)}>
          <p className="modal-description">
            New programs start private and in planning, so they will not unexpectedly appear on the public site.
          </p>
          <div className="staff-form-grid">
            <label htmlFor="demo-program-name">
              Program name *
              <input id="demo-program-name" required value={draft.name} onChange={(event) => set('name', event.target.value)} />
            </label>
            <label htmlFor="demo-program-venue">
              Venue *
              <input id="demo-program-venue" required value={draft.venue} onChange={(event) => set('venue', event.target.value)} />
            </label>
            <label htmlFor="demo-program-organization">
              Organization
              <select id="demo-program-organization" value={draft.organizationId} onChange={(event) => set('organizationId', event.target.value)}>
                {state.organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="demo-program-type">
              Type
              <select id="demo-program-type" value={draft.type} onChange={(event) => set('type', event.target.value as ProgramType)}>
                {types.map((item) => (
                  <option value={item} key={item}>
                    {item.replaceAll('-', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="demo-program-lead">
              Lead
              <select id="demo-program-lead" value={draft.leadCoachId} onChange={(event) => set('leadCoachId', event.target.value)}>
                {state.coaches.map((coach) => (
                  <option value={coach.id} key={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="demo-program-status">
              Status
              <select id="demo-program-status" value={draft.status} onChange={(event) => set('status', event.target.value as ProgramStatus)}>
                {statuses.map((item) => <option value={item} key={item}>{item.replaceAll('-', ' ')}</option>)}
              </select>
            </label>
            <label htmlFor="demo-program-visibility">
              Visibility
              <select id="demo-program-visibility" value={draft.visibility} onChange={(event) => set('visibility', event.target.value as ProgramDraft['visibility'])}>
                <option value="private">Private · staff only</option>
                <option value="public">Public · events page</option>
              </select>
            </label>
            <label htmlFor="demo-program-capacity">
              Capacity
              <input id="demo-program-capacity" type="number" min="1" value={draft.capacity} onChange={(event) => set('capacity', Number(event.target.value))} />
            </label>
            <label htmlFor="demo-program-deadline">
              Registration deadline
              <input id="demo-program-deadline" type="date" value={draft.registrationDeadline} onChange={(event) => set('registrationDeadline', event.target.value)} />
            </label>
            <label htmlFor="demo-program-price">
              Price
              <input id="demo-program-price" type="number" min="0" value={draft.price} onChange={(event) => set('price', Number(event.target.value))} />
            </label>
            <label className="full-field" htmlFor="demo-program-description">
              Description
              <textarea id="demo-program-description" value={draft.description} onChange={(event) => set('description', event.target.value)} placeholder="What should families know?" />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="staff-button staff-button-outline" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="staff-button" disabled={operations.isSaving('program:create')}>
              {operations.isSaving('program:create') ? 'Creating…' : 'Create program'}
            </button>
          </div>
        </form>
      </DemoModal>
    </div>
  );
}
