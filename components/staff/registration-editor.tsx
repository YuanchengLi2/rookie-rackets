'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { ConsentType, Registration, RegistrationStatus } from '../../lib/data/types';
import type { ManualRegistrationDraft } from '../../lib/data/repository';
import { useOperations } from '../data/operations-provider';

const statuses: RegistrationStatus[] = ['incomplete', 'confirmed', 'waitlisted', 'offer-sent', 'canceled', 'completed', 'refunded'];
const formTypes: Array<{ type: ConsentType; label: string; required: boolean }> = [
  { type: 'participation-waiver', label: 'Guardian-signed participation waiver received', required: true },
  { type: 'program-acknowledgment', label: 'Guardian-signed program acknowledgment received', required: true },
  { type: 'pickup-policy', label: 'Guardian-signed pickup policy received', required: true },
  { type: 'photo-video', label: 'Optional photo and video permission received', required: false },
];
const required = ['programId', 'childFirstName', 'childLastName', 'dateOfBirth', 'grade', 'skillLevel', 'guardianFirstName', 'guardianLastName', 'guardianEmail', 'guardianPhone', 'emergencyName', 'emergencyRelationship', 'emergencyPhone'] as const;

export function RegistrationEditor({ registration, onSaved, onCancel }: { registration?: Registration; onSaved(): void; onCancel(): void }) {
  const { state, mutate, isSaving } = useOperations();
  const first = state.programs.find((program) => !program.archivedAt);
  const [draft, setDraft] = useState<Partial<Registration>>(() => registration ? { ...registration } : {
    programId: first?.id ?? '', childFirstName: '', childLastName: '', dateOfBirth: '', grade: '', skillLevel: 'beginner',
    guardianFirstName: '', guardianLastName: '', guardianEmail: '', guardianPhone: '', emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
    supportNotes: '', internalNotes: '', needsRacket: true, parentOnsite: false, selectedSessionIds: [], registrationStatus: 'incomplete',
    paymentStatus: first?.priceCents ? 'unpaid' : 'waived',
  });
  const [forms, setForms] = useState<Record<ConsentType, boolean>>(() => Object.fromEntries(formTypes.map(({ type }) => [type, state.consents.find((item) => item.registrationId === registration?.id && item.type === type)?.accepted ?? false])) as Record<ConsentType, boolean>);
  const [error, setError] = useState('');
  const sessions = useMemo(() => state.sessions.filter((session) => session.programId === draft.programId && session.status === 'scheduled'), [draft.programId, state.sessions]);
  const set = <K extends keyof Registration>(key: K, value: Registration[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const version = (type: ConsentType) => type === 'photo-video' ? state.settings?.photoVideoVersion : type === 'program-acknowledgment' ? state.settings?.programAcknowledgmentVersion : type === 'pickup-policy' ? state.settings?.pickupPolicyVersion : state.settings?.participationWaiverVersion;
  const save = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    if (required.some((key) => !String(draft[key] ?? '').trim()) || !draft.selectedSessionIds?.length) { setError('Complete all required fields and choose a session.'); return; }
    if (draft.registrationStatus !== 'incomplete' && formTypes.some(({ type, required }) => required && !forms[type])) { setError('Record all required guardian forms, or save the registration as Incomplete.'); return; }
    try {
      const id = registration ? (await mutate(`registration:${registration.id}`, (repository) => repository.updateRegistration(registration.id, draft), 'Registration saved.')).id : (await mutate('registration:create', (repository) => repository.createManualRegistration(draft as ManualRegistrationDraft), 'Registration added.')).id;
      await mutate(`registration:${id}:forms`, async (repository) => { await Promise.all(formTypes.map(({ type }) => repository.upsertConsent(id, { type, version: version(type) ?? '2026.1', accepted: forms[type], respondedAt: forms[type] ? new Date().toISOString() : null }))); }, 'Form records saved.');
      onSaved();
    } catch { /* Keep the form open; the operations provider shows the error. */ }
  };
  const field = (label: string, key: keyof Registration, type = 'text') => <label key={key}>{label} *<input type={type} value={String(draft[key] ?? '')} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} /></label>;
  return <form className="staff-form registration-editor" onSubmit={(event) => void save(event)}>
    {error && <p role="alert" className="form-error">{error}</p>}
    <div className="staff-form-grid">
      <label>Program *<select value={draft.programId ?? ''} onChange={(event) => { const programId = event.target.value; const program = state.programs.find((item) => item.id === programId); setDraft((current) => ({ ...current, programId, selectedSessionIds: [], paymentStatus: program?.priceCents ? 'unpaid' : 'waived' })); }}>{state.programs.filter((item) => !item.archivedAt).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Source<input value={registration?.source ?? 'staff'} disabled /></label>
      {field('Child first name', 'childFirstName')}{field('Child last name', 'childLastName')}{field('Date of birth', 'dateOfBirth', 'date')}{field('Grade', 'grade')}
      <label>Skill level *<select value={draft.skillLevel ?? 'beginner'} onChange={(event) => set('skillLevel', event.target.value)}>{['beginner', 'intermediate', 'mixed', 'advanced'].map((value) => <option key={value}>{value}</option>)}</select></label>
      {field('Guardian first name', 'guardianFirstName')}{field('Guardian last name', 'guardianLastName')}{field('Guardian email', 'guardianEmail', 'email')}{field('Guardian phone', 'guardianPhone', 'tel')}
      {field('Emergency contact', 'emergencyName')}{field('Emergency relationship', 'emergencyRelationship')}{field('Emergency phone', 'emergencyPhone', 'tel')}
      <label>Registration status<select value={draft.registrationStatus ?? 'incomplete'} onChange={(event) => set('registrationStatus', event.target.value as RegistrationStatus)}>{statuses.map((value) => <option key={value} value={value}>{value.replaceAll('-', ' ')}</option>)}</select></label>
      <label>Needs racket<select value={draft.needsRacket ? 'yes' : 'no'} onChange={(event) => set('needsRacket', event.target.value === 'yes')}><option value="yes">Yes</option><option value="no">No</option></select></label>
      <label>Parent onsite<select value={draft.parentOnsite ? 'yes' : 'no'} onChange={(event) => set('parentOnsite', event.target.value === 'yes')}><option value="no">No</option><option value="yes">Yes</option></select></label>
      <label className="full-field">Support notes<textarea value={draft.supportNotes ?? ''} onChange={(event) => set('supportNotes', event.target.value)} /></label>
      <label className="full-field">Internal staff notes<textarea value={draft.internalNotes ?? ''} onChange={(event) => set('internalNotes', event.target.value)} /></label>
    </div>
    <fieldset><legend>Sessions *</legend><div className="registration-editor-checks">{sessions.map((session) => <label key={session.id}><input type="checkbox" checked={draft.selectedSessionIds?.includes(session.id) ?? false} onChange={(event) => set('selectedSessionIds', event.target.checked ? [...new Set([...(draft.selectedSessionIds ?? []), session.id])] : (draft.selectedSessionIds ?? []).filter((id) => id !== session.id))} />{session.date} · {session.startTime} · {session.location}</label>)}</div></fieldset>
    <fieldset><legend>Guardian forms received</legend><p className="settings-copy">Check only after receiving the guardian-completed form. These staff records do not replace signed documents.</p><div className="registration-editor-checks">{formTypes.map(({ type, label, required }) => <label key={type}><input type="checkbox" checked={forms[type]} onChange={(event) => setForms((current) => ({ ...current, [type]: event.target.checked }))} />{label}{required ? ' · required to confirm' : ' · optional'}</label>)}</div></fieldset>
    <div className="modal-actions"><button className="staff-button staff-button-outline" type="button" onClick={onCancel}>Cancel</button><button className="staff-button" type="submit" disabled={isSaving(registration ? `registration:${registration.id}` : 'registration:create')}>Save registration</button></div>
  </form>;
}
