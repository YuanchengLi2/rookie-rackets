'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { formatDemoDate, getProgram, getProgramCapacity, getProgramSessions } from '../../lib/demo/selectors';
import type { RegistrationDraft } from '../../lib/demo/types';
import { useDemo } from '../demo/demo-provider';
import { DemoNotice, FieldError } from '../demo/demo-ui';

const emptyDraft: RegistrationDraft = {
  programId: '', childFirstName: '', childLastName: '', dateOfBirth: '', grade: '', skillLevel: '',
  guardianFirstName: '', guardianLastName: '', guardianEmail: '', guardianPhone: '',
  emergencyName: '', emergencyRelationship: '', emergencyPhone: '', supportNotes: '',
  needsRacket: true, parentOnsite: false, selectedSessionIds: [], photoConsent: false,
  participationAccepted: false, acknowledgmentAccepted: false, pickupAccepted: false,
};

type FieldName = keyof RegistrationDraft;
type StepId = 'player' | 'dates' | 'forms' | 'payment' | 'review';

const playerFields: FieldName[] = [
  'childFirstName', 'childLastName', 'dateOfBirth', 'grade', 'skillLevel',
  'guardianFirstName', 'guardianLastName', 'guardianEmail', 'guardianPhone',
  'emergencyName', 'emergencyRelationship', 'emergencyPhone',
];

function isEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }
function isPhone(value: string) { return /^\+?[\d\s().-]{7,}$/.test(value.trim()); }

function Field({ label, invalid, children }: { label: string; invalid?: boolean; children: ReactNode }) {
  return <label className={invalid ? 'has-error' : undefined}>{label}{children}{invalid && <small className="field-inline-error">Required field</small>}</label>;
}

export function RegistrationWizard({ programId }: { programId: string }) {
  const { state, registerForProgram } = useDemo();
  const router = useRouter();
  const program = getProgram(state, programId);
  const steps = useMemo<StepId[]>(() => program?.price ? ['player', 'dates', 'forms', 'payment', 'review'] : ['player', 'dates', 'forms', 'review'], [program?.price]);
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex] ?? 'player';
  const [draft, setDraft] = useState<RegistrationDraft>({ ...emptyDraft, programId });
  const [error, setError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const focusRequest = useRef<FieldName | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [submittedStatus, setSubmittedStatus] = useState<'confirmed' | 'waitlisted' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availableSessions = useMemo(() => program ? getProgramSessions(state, program.id).filter((session) => session.status === 'scheduled' && session.date >= state.demoDate) : [], [program, state]);
  const selectedSessions = availableSessions.filter((session) => draft.selectedSessionIds.includes(session.id));
  const update = (patch: Partial<RegistrationDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const setField = (field: FieldName, value: string | boolean) => update({ [field]: value } as Partial<RegistrationDraft>);

  const firstInvalidField = useMemo<FieldName | null>(() => {
    if (currentStep !== 'player') return null;
    return playerFields.find((field) => {
      const value = String(draft[field] ?? '');
      return !value.trim() || (field === 'guardianEmail' && !isEmail(value)) || ((field === 'guardianPhone' || field === 'emergencyPhone') && !isPhone(value));
    }) ?? null;
  }, [currentStep, draft]);

  const isInvalid = (field: FieldName) => {
    if (!showErrors || currentStep !== 'player') return false;
    const value = String(draft[field] ?? '');
    return !value.trim() || (field === 'guardianEmail' && !isEmail(value)) || ((field === 'guardianPhone' || field === 'emergencyPhone') && !isPhone(value));
  };

  const valid = useMemo(() => {
    if (currentStep === 'player') return firstInvalidField === null;
    if (currentStep === 'dates') return draft.selectedSessionIds.length > 0;
    if (currentStep === 'forms') return draft.participationAccepted && draft.acknowledgmentAccepted && draft.pickupAccepted;
    return true;
  }, [currentStep, draft, firstInvalidField]);

  useEffect(() => {
    const field = focusRequest.current;
    if (!field) return;
    document.querySelector<HTMLElement>('[name="' + field + '"]')?.focus();
    focusRequest.current = null;
  }, [focusTick]);

  const next = () => {
    if (!valid) {
      setShowErrors(true);
      setError(currentStep === 'dates' ? 'Choose at least one available date.' : currentStep === 'forms' ? 'Accept each required agreement to continue.' : 'Complete the highlighted fields before continuing.');
      focusRequest.current = firstInvalidField;
      setFocusTick((value) => value + 1);
      return;
    }
    setShowErrors(false);
    setError('');
    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  };

  const previous = () => { setShowErrors(false); setError(''); setStepIndex((current) => Math.max(0, current - 1)); };
  const toggleSession = (id: string, selected: boolean) => update({ selectedSessionIds: selected ? [...draft.selectedSessionIds, id] : draft.selectedSessionIds.filter((value) => value !== id) });

  const submit = () => {
    if (submitting) return;
    setSubmitting(true);
    const capacity = program ? getProgramCapacity(state, program.id) : { remaining: 0 };
    const expectedStatus = program && (program.status === 'full' || capacity.remaining <= 0) ? 'waitlisted' : 'confirmed';
    const id = registerForProgram(draft);
    if (!id) {
      setError('This camp changed before registration finished. Review your dates and try again.');
      setSubmitting(false);
      return;
    }
    setRegistrationId(id);
    setSubmittedStatus(expectedStatus);
  };

  if (!program) return <section className="register-shell shell"><h1>Camp not found</h1><p className="event-detail-disabled">This demo camp may have been reset or removed.</p><Link className="button" href="/events">Back to events</Link></section>;

  const canRegister = ['registration-open', 'active', 'full'].includes(program.status);
  if (!canRegister) return <section className="register-shell shell"><Link className="event-detail-back" href={'/events/' + program.slug}><ArrowLeft size={15} /> {program.name}</Link><h1>Registration is closed</h1><p className="event-detail-disabled">This camp is {program.status.replaceAll('-', ' ')} in the demo.</p><Link className="button" href="/events">Back to events</Link></section>;

  if (state.session?.role !== 'family') {
    const nextPath = '/register/' + program.slug;
    return <section className="register-shell shell">
      <Link className="event-detail-back" href={'/events/' + program.slug}><ArrowLeft size={15} /> {program.name}</Link>
      <div className="registration-access-card">
        <p className="eyebrow">Family access</p><h1>Start your camp registration</h1>
        <p>Sign in or create a family account first. Your dates, forms, and payment details will stay together in My Camps.</p>
        <DemoNotice />
        <div className="registration-access-actions">
          <Link className="button" href={'/sign-in?mode=login&next=' + encodeURIComponent(nextPath)}>Sign in to my account <ArrowRight size={16} /></Link>
          <Link className="button button-outline" href={'/sign-in?mode=signup&next=' + encodeURIComponent(nextPath)}>Create a family account</Link>
        </div>
      </div>
    </section>;
  }

  if (submittedStatus) return <section className="registration-success shell">
    <span><CheckCircle2 size={30} /></span><p className="eyebrow">Saved to My Camps</p>
    <h1>{submittedStatus === 'confirmed' ? 'Registration confirmed' : 'You’re on the waitlist'}</h1>
    <p>{submittedStatus === 'confirmed' ? 'There’s a place for ' + draft.childFirstName + ' at ' + program.name + '.' : program.name + ' is currently full, so we saved a waitlist request.'}</p>
    <div><button className="button" type="button" onClick={() => router.push('/portal/camps/' + (registrationId ?? ''))}>Open this camp <ArrowRight size={16} /></button><Link className="text-link" href="/events">Back to events</Link></div>
  </section>;

  const stepLabels: Record<StepId, string> = { player: 'Player', dates: 'Dates', forms: 'Forms', payment: 'Payment', review: 'Review' };
  const nextId = steps[stepIndex + 1];
  const nextLabel = nextId === 'dates' ? 'Continue to dates' : nextId === 'forms' ? 'Continue to forms' : nextId === 'payment' ? 'Continue to payment' : 'Review registration';

  return <section className="register-shell shell">
    <div className="register-header"><div><Link className="event-detail-back" href={'/events/' + program.slug}><ArrowLeft size={15} /> {program.name}</Link><h1>Register for camp</h1><p>Choose the dates that work, finish the required forms, and you’re in.</p></div><span className="register-program-pill">{program.price === 0 ? 'Free camp' : '$' + program.price}</span></div>
    <div className="registration-card">
      <DemoNotice />
      <div className="registration-progress" aria-label="Registration progress">{steps.map((step, index) => <span className={index <= stepIndex ? 'active' : ''} key={step}>{String(index + 1).padStart(2, '0')} · {stepLabels[step]}</span>)}</div>
      {error && <FieldError>{error}</FieldError>}

      {currentStep === 'player' && <fieldset><legend>Player and family information</legend><div className="registration-grid">
        <Field label="Child first name *" invalid={isInvalid('childFirstName')}><input name="childFirstName" value={draft.childFirstName} aria-invalid={isInvalid('childFirstName')} onChange={(event) => setField('childFirstName', event.target.value)} /></Field>
        <Field label="Child last name *" invalid={isInvalid('childLastName')}><input name="childLastName" value={draft.childLastName} aria-invalid={isInvalid('childLastName')} onChange={(event) => setField('childLastName', event.target.value)} /></Field>
        <Field label="Date of birth *" invalid={isInvalid('dateOfBirth')}><input name="dateOfBirth" type="date" value={draft.dateOfBirth} aria-invalid={isInvalid('dateOfBirth')} onChange={(event) => setField('dateOfBirth', event.target.value)} /></Field>
        <Field label="Grade *" invalid={isInvalid('grade')}><select name="grade" aria-label="Grade" value={draft.grade} aria-invalid={isInvalid('grade')} onChange={(event) => setField('grade', event.target.value)}><option value="">Select…</option>{['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map((grade) => <option key={grade}>{grade}</option>)}</select></Field>
        <Field label="Skill level *" invalid={isInvalid('skillLevel')}><select name="skillLevel" value={draft.skillLevel} aria-invalid={isInvalid('skillLevel')} onChange={(event) => setField('skillLevel', event.target.value)}><option value="">Select…</option><option value="never-played">Never played</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></Field>
        <Field label="Guardian first name *" invalid={isInvalid('guardianFirstName')}><input name="guardianFirstName" value={draft.guardianFirstName} aria-invalid={isInvalid('guardianFirstName')} onChange={(event) => setField('guardianFirstName', event.target.value)} /></Field>
        <Field label="Guardian last name *" invalid={isInvalid('guardianLastName')}><input name="guardianLastName" value={draft.guardianLastName} aria-invalid={isInvalid('guardianLastName')} onChange={(event) => setField('guardianLastName', event.target.value)} /></Field>
        <Field label="Guardian email *" invalid={isInvalid('guardianEmail')}><input name="guardianEmail" type="email" value={draft.guardianEmail} aria-invalid={isInvalid('guardianEmail')} onChange={(event) => setField('guardianEmail', event.target.value)} /></Field>
        <Field label="Guardian phone *" invalid={isInvalid('guardianPhone')}><input name="guardianPhone" value={draft.guardianPhone} aria-invalid={isInvalid('guardianPhone')} onChange={(event) => setField('guardianPhone', event.target.value)} /></Field>
        <Field label="Emergency contact name *" invalid={isInvalid('emergencyName')}><input name="emergencyName" value={draft.emergencyName} aria-invalid={isInvalid('emergencyName')} onChange={(event) => setField('emergencyName', event.target.value)} /></Field>
        <Field label="Relationship to child *" invalid={isInvalid('emergencyRelationship')}><input name="emergencyRelationship" value={draft.emergencyRelationship} aria-invalid={isInvalid('emergencyRelationship')} onChange={(event) => setField('emergencyRelationship', event.target.value)} /></Field>
        <Field label="Emergency phone *" invalid={isInvalid('emergencyPhone')}><input name="emergencyPhone" value={draft.emergencyPhone} aria-invalid={isInvalid('emergencyPhone')} onChange={(event) => setField('emergencyPhone', event.target.value)} /></Field>
        <Field label="Does the child need a racket?"><select value={draft.needsRacket ? 'yes' : 'no'} onChange={(event) => setField('needsRacket', event.target.value === 'yes')}><option value="yes">Yes</option><option value="no">No</option></select></Field>
        <Field label="Will a parent remain onsite?"><select value={draft.parentOnsite ? 'yes' : 'no'} onChange={(event) => setField('parentOnsite', event.target.value === 'yes')}><option value="no">No</option><option value="yes">Yes</option></select></Field>
        <label className="full-field">Anything coaches should know? <span>(optional; do not enter real medical information)</span><textarea value={draft.supportNotes} onChange={(event) => setField('supportNotes', event.target.value)} /></label>
      </div></fieldset>}

      {currentStep === 'dates' && <fieldset><legend>Choose the dates you want</legend><p className="registration-step-copy">Pick one or more available sessions. You can report an absence later from My Camps.</p><div className="registration-date-options">{availableSessions.map((session) => {
        const selected = draft.selectedSessionIds.includes(session.id);
        return <label className={'registration-date-option' + (selected ? ' is-selected' : '')} key={session.id}><input type="checkbox" checked={selected} onChange={(event) => toggleSession(session.id, event.target.checked)} /><span><strong>{formatDemoDate(session.date, { weekday: 'short', month: 'short', day: 'numeric' })}</strong><small>{session.startTime}–{session.endTime} · {session.location}</small></span><CalendarDays size={18} /></label>;
      })}</div></fieldset>}

      {currentStep === 'forms' && <fieldset><legend>Forms and permissions</legend><div className="registration-checks">
        <label className="registration-check"><input type="checkbox" checked={draft.participationAccepted} onChange={(event) => setField('participationAccepted', event.target.checked)} /><span>Participation waiver *<br /><small>Required to take part in the camp.</small></span></label>
        <label className="registration-check"><input type="checkbox" checked={draft.acknowledgmentAccepted} onChange={(event) => setField('acknowledgmentAccepted', event.target.checked)} /><span>Program acknowledgment *<br /><small>Confirms you reviewed the camp details.</small></span></label>
        <label className="registration-check"><input type="checkbox" checked={draft.pickupAccepted} onChange={(event) => setField('pickupAccepted', event.target.checked)} /><span>Pickup policy acknowledgment *</span></label>
        <label className="registration-check registration-optional-consent"><input aria-label="Photo and video permission (optional)" type="checkbox" checked={draft.photoConsent} onChange={(event) => setField('photoConsent', event.target.checked)} /><span>Photo &amp; video permission · optional<br /><small>Saying no will not affect registration.</small></span></label>
      </div></fieldset>}

      {currentStep === 'payment' && <section className="registration-payment-demo" aria-labelledby="registration-payment-heading"><p className="eyebrow">Fictional demo checkout</p><h2 id="registration-payment-heading">Payment</h2><strong>{'$' + program.price}</strong><p>This prototype records a successful demo payment. It never asks for or stores card information.</p><DemoNotice>Do not enter real payment information. No payment processor is connected.</DemoNotice></section>}

      {currentStep === 'review' && <fieldset><legend>Review registration</legend><dl className="registration-review">
        <div><dt>Player</dt><dd>{draft.childFirstName} {draft.childLastName}</dd></div><div><dt>Camp</dt><dd>{program.name}</dd></div>
        <div className="registration-review-dates"><dt>Dates</dt><dd>{selectedSessions.map((session) => formatDemoDate(session.date, { month: 'short', day: 'numeric' })).join(' · ')}</dd></div>
        <div><dt>Required forms</dt><dd>Accepted</dd></div><div><dt>Photo &amp; video</dt><dd>{draft.photoConsent ? 'Accepted' : 'Declined (optional)'}</dd></div>
        <div><dt>Payment</dt><dd>{program.price === 0 ? 'Free' : '$' + program.price + ' · demo paid'}</dd></div>
      </dl></fieldset>}

      <div className="registration-actions">
        {stepIndex > 0 ? <button className="button button-outline" type="button" onClick={previous}><ArrowLeft size={16} /> Back</button> : <span />}
        {currentStep === 'review' ? <button className="button" type="button" onClick={submit} disabled={submitting}>{submitting ? 'Saving…' : 'Confirm registration'} <CheckCircle2 size={16} /></button> : <button className="button" type="button" onClick={next}>{currentStep === 'payment' ? 'Continue to review' : nextLabel} <ArrowRight size={16} /></button>}
      </div>
    </div>
  </section>;
}

