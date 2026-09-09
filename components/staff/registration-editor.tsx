'use client';

import { useMemo, useState } from 'react';
import type { Registration, RegistrationStatus, PaymentStatus, ConsentType } from '../../lib/data/types';
import { useOperations } from '../data/operations-provider';

const statuses: RegistrationStatus[] = ['incomplete', 'confirmed', 'waitlisted', 'offer-sent', 'canceled', 'completed', 'refunded'];
const paymentStatuses: PaymentStatus[] = ['unpaid', 'pending', 'paid', 'failed', 'refunded', 'partial-refund', 'waived'];
const consentTypes: Array<{ type: ConsentType; label: string; required: boolean }> = [
  { type: 'participation-waiver', label: 'Participation waiver', required: true },
  { type: 'program-acknowledgment', label: 'Program acknowledgment', required: true },
  { type: 'pickup-policy', label: 'Pickup policy', required: true },
  { type: 'photo-video', label: 'Photo and video permission', required: false },
];

function blank(programId: string): Partial<Registration> {
  return { programId, childFirstName: '', childLastName: '', dateOfBirth: '', grade: '', skillLevel: 'beginner', guardianFirstName: '', guardianLastName: '', guardianEmail: '', guardianPhone: '', emergencyName: '', emergencyRelationship: '', emergencyPhone: '', supportNotes: '', internalNotes: '', needsRacket: true, parentOnsite: false, selectedSessionIds: [], registrationStatus: 'confirmed', paymentStatus: 'waived' };
}

export function RegistrationEditor({ registration, onSaved, onCancel }: { registration?: Registration; onSaved(): void; onCancel(): void }) {
  const { state, mutate, isSaving } = useOperations();
  const [draft, setDraft] = useState<Partial<Registration>>(() => registration ? { ...registration } : blank(state.programs[0]?.id ?? ''));
  const initialConsents = Object.fromEntries(consentTypes.map(({ type }) => [type, state.consents.find((item) => item.registrationId === registration?.id && item.type === type)?.accepted ?? false])) as Record<ConsentType, boolean>;
  const [consents, setConsents] = useState(initialConsents);
  const [paymentAmount, setPaymentAmount] = useState(() => state.payments.find((item) => item.registrationId === registration?.id)?.amountCents ?? 0);
  const [paymentMethod, setPaymentMethod] = useState(() => state.payments.find((item) => item.registrationId === registration?.id)?.method ?? '');
  const [localError, setLocalError] = useState('');
  const sessions = useMemo(() => state.sessions.filter((session) => session.programId === draft.programId && session.status === 'scheduled'), [draft.programId, state.sessions]);
  const set = <K extends keyof Registration>(key: K, value: Registration[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const required = ['programId','childFirstName','childLastName','dateOfBirth','grade','skillLevel','guardianFirstName','guardianLastName','guardianEmail','guardianPhone','emergencyName','emergencyRelationship','emergencyPhone'] as const;

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setLocalError('');
    if (required.some((key) => !String(draft[key] ?? '').trim()) || !draft.selectedSessionIds?.length) { setLocalError('Complete all required fields and choose at least one session.'); return; }
    try {
      let id = registration?.id;
      if (registration) {
        await mutate(`registration:${registration.id}`, (repository) => repository.updateRegistration(registration.id, draft), 'Registration saved.');
      } else {
        const created = await mutate('registration:create', (repository) => repository.createManualRegistration(draft as import('../../lib/data/repository').ManualRegistrationDraft), 'Manual registration added.');
        id = created.id;
      }
      if (!id) return;
      await Promise.all(consentTypes.map(({ type }) => mutate(`consent:${id}:${type}`, (repository) => repository.upsertConsent(id!, { type, accepted: consents[type], version: type === 'photo-video' ? state.settings?.photoVideoVersion ?? '2026.1' : state.settings?.participationWaiverVersion ?? '2026.1', respondedAt: new Date().toISOString() }))));
      const latestPayment = state.payments.find((item) => item.registrationId === id);
      if (!latestPayment || latestPayment.status !== draft.paymentStatus || latestPayment.amountCents !== paymentAmount || latestPayment.method !== paymentMethod) {
        await mutate(`payment:${id}`, (repository) => repository.recordPayment({ registrationId: id!, amountCents: paymentAmount, status: draft.paymentStatus ?? 'unpaid', receivedAt: ['paid', 'waived'].includes(draft.paymentStatus ?? '') ? new Date().toISOString() : null, method: paymentMethod, note: '', externalReference: '' }), 'Payment record saved.');
      }
      onSaved();
    } catch { /* Provider presents the durable error and the form stays open. */ }
  };

  const saving = isSaving(registration ? `registration:${registration.id}` : 'registration:create');
  return <form className="staff-form registration-editor" onSubmit={(event) => void save(event)}>{localError && <p role="alert" className="form-error">{localError}</p>}<div className="staff-form-grid"><label>Program *<select value={draft.programId ?? ''} onChange={(event) => set('programId', event.target.value)}>{state.programs.filter((program) => !program.archivedAt).map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></label><label>Source<input value={registration?.source ?? 'staff'} disabled /></label><label>Child first name *<input value={draft.childFirstName ?? ''} onChange={(event) => set('childFirstName', event.target.value)} /></label><label>Child last name *<input value={draft.childLastName ?? ''} onChange={(event) => set('childLastName', event.target.value)} /></label><label>Date of birth *<input type="date" value={draft.dateOfBirth ?? ''} onChange={(event) => set('dateOfBirth', event.target.value)} /></label><label>Grade *<input value={draft.grade ?? ''} onChange={(event) => set('grade', event.target.value)} /></label><label>Skill level *<select value={draft.skillLevel ?? ''} onChange={(event) => set('skillLevel', event.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="mixed">Mixed</option><option value="advanced">Advanced</option></select></label><label>Guardian first name *<input value={draft.guardianFirstName ?? ''} onChange={(event) => set('guardianFirstName', event.target.value)} /></label><label>Guardian last name *<input value={draft.guardianLastName ?? ''} onChange={(event) => set('guardianLastName', event.target.value)} /></label><label>Guardian email *<input type="email" value={draft.guardianEmail ?? ''} onChange={(event) => set('guardianEmail', event.target.value)} /></label><label>Guardian phone *<input value={draft.guardianPhone ?? ''} onChange={(event) => set('guardianPhone', event.target.value)} /></label><label>Emergency contact *<input value={draft.emergencyName ?? ''} onChange={(event) => set('emergencyName', event.target.value)} /></label><label>Emergency relationship *<input value={draft.emergencyRelationship ?? ''} onChange={(event) => set('emergencyRelationship', event.target.value)} /></label><label>Emergency phone *<input value={draft.emergencyPhone ?? ''} onChange={(event) => set('emergencyPhone', event.target.value)} /></label><label>Registration status<select value={draft.registrationStatus ?? 'confirmed'} onChange={(event) => set('registrationStatus', event.target.value as RegistrationStatus)}>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>)}</select></label><label>Payment status<select value={draft.paymentStatus ?? 'unpaid'} onChange={(event) => set('paymentStatus', event.target.value as PaymentStatus)}>{paymentStatuses.map((item) => <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>)}</select></label><label>Payment amount<input type="number" min="0" step="0.01" value={paymentAmount / 100} onChange={(event) => setPaymentAmount(Math.round(Number(event.target.value) * 100))} /></label><label>Payment method<input value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} placeholder="Cash, check, online…" /></label><label>Needs racket<select value={draft.needsRacket ? 'yes' : 'no'} onChange={(event) => set('needsRacket', event.target.value === 'yes')}><option value="yes">Yes</option><option value="no">No</option></select></label><label>Parent onsite<select value={draft.parentOnsite ? 'yes' : 'no'} onChange={(event) => set('parentOnsite', event.target.value === 'yes')}><option value="no">No</option><option value="yes">Yes</option></select></label><label className="full-field">Support notes<textarea value={draft.supportNotes ?? ''} onChange={(event) => set('supportNotes', event.target.value)} /></label><label className="full-field">Internal staff notes<textarea value={draft.internalNotes ?? ''} onChange={(event) => set('internalNotes', event.target.value)} /></label></div><fieldset><legend>Sessions *</legend><div className="registration-editor-checks">{sessions.map((session) => <label key={session.id}><input type="checkbox" checked={draft.selectedSessionIds?.includes(session.id) ?? false} onChange={(event) => set('selectedSessionIds', event.target.checked ? [...new Set([...(draft.selectedSessionIds ?? []), session.id])] : (draft.selectedSessionIds ?? []).filter((id) => id !== session.id))} />{session.date} · {session.startTime} · {session.location}</label>)}</div></fieldset><fieldset><legend>Consent records</legend><div className="registration-editor-checks">{consentTypes.map(({ type, label, required }) => <label key={type}><input type="checkbox" checked={consents[type]} onChange={(event) => setConsents((current) => ({ ...current, [type]: event.target.checked }))} />{label}{required ? ' · required' : ' · optional'}</label>)}</div></fieldset><div className="modal-actions"><button className="staff-button staff-button-outline" type="button" onClick={onCancel}>Cancel</button><button className="staff-button" type="submit" disabled={saving}>{saving ? 'Saving…' : registration ? 'Save registration' : 'Add registration'}</button></div></form>;
}
