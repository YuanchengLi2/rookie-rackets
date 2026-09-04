'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getProgram, getProgramCapacity } from '../../lib/demo/selectors';
import type { RegistrationDraft } from '../../lib/demo/types';
import { useDemo } from '../demo/demo-provider';
import { DemoNotice, FieldError } from '../demo/demo-ui';

const emptyDraft: RegistrationDraft = {
  programId: '',
  childFirstName: '',
  childLastName: '',
  dateOfBirth: '',
  grade: '',
  skillLevel: '',
  guardianFirstName: '',
  guardianLastName: '',
  guardianEmail: '',
  guardianPhone: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  supportNotes: '',
  needsRacket: true,
  parentOnsite: false,
  selectedSessionIds: [],
  photoConsent: false,
  participationAccepted: false,
  acknowledgmentAccepted: false,
  pickupAccepted: false,
};

type FieldName = keyof RegistrationDraft;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isPhone(value: string): boolean {
  return /^\+?[\d\s().-]{7,}$/.test(value.trim());
}

function Field({ label, invalid, children }: { label: string; invalid?: boolean; children: ReactNode }) {
  return (
    <label className={invalid ? 'has-error' : undefined}>
      {label}
      {children}
      {invalid && <small className="field-inline-error">Required field</small>}
    </label>
  );
}

export function RegistrationWizard({ programId }: { programId: string }) {
  const { state, registerForProgram } = useDemo();
  const router = useRouter();
  const program = getProgram(state, programId);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<RegistrationDraft>({ ...emptyDraft, programId });
  const [error, setError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const focusRequest = useRef<FieldName | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [submittedStatus, setSubmittedStatus] = useState<'confirmed' | 'waitlisted' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (patch: Partial<RegistrationDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const setField = (field: FieldName, value: string | boolean) => update({ [field]: value } as Partial<RegistrationDraft>);

  const firstInvalidField = useMemo<FieldName | null>(() => {
    if (step === 0) {
      const fields: FieldName[] = [
        'childFirstName',
        'childLastName',
        'dateOfBirth',
        'grade',
        'skillLevel',
        'guardianFirstName',
        'guardianLastName',
        'guardianEmail',
        'guardianPhone',
      ];
      return fields.find((field) => {
        const value = String(draft[field] ?? '');
        return !value.trim() || (field === 'guardianEmail' && !isEmail(value)) || (field === 'guardianPhone' && !isPhone(value));
      }) ?? null;
    }
    if (step === 1) {
      const fields: FieldName[] = ['emergencyName', 'emergencyRelationship', 'emergencyPhone'];
      return fields.find((field) => {
        const value = String(draft[field] ?? '');
        return !value.trim() || (field === 'emergencyPhone' && !isPhone(value));
      }) ?? null;
    }
    return null;
  }, [draft, step]);

  const isInvalid = (field: FieldName): boolean => {
    if (!showErrors) return false;
    if (firstInvalidField === field) return true;
    const value = String(draft[field] ?? '');
    return !value.trim() || (field === 'guardianEmail' && !isEmail(value)) || ((field === 'guardianPhone' || field === 'emergencyPhone') && !isPhone(value));
  };

  const valid = useMemo(() => {
    if (step === 0 || step === 1) return firstInvalidField === null;
    if (step === 2) return draft.participationAccepted && draft.acknowledgmentAccepted && draft.pickupAccepted;
    return true;
  }, [draft, firstInvalidField, step]);

  useEffect(() => {
    const field = focusRequest.current;
    if (!field) return;
    const element = document.querySelector<HTMLElement>(`[name="${field}"]`);
    element?.focus();
    focusRequest.current = null;
  }, [focusTick]);

  const next = () => {
    if (!valid) {
      setShowErrors(true);
      setError('Complete the highlighted fields before continuing.');
      focusRequest.current = firstInvalidField;
      setFocusTick((value) => value + 1);
      return;
    }
    setShowErrors(false);
    setError('');
    setStep((current) => Math.min(3, current + 1));
  };

  const previous = () => {
    setShowErrors(false);
    setError('');
    setStep((current) => Math.max(0, current - 1));
  };

  const submit = () => {
    if (submitting) return;
    setSubmitting(true);
    const capacity = program ? getProgramCapacity(state, program.id) : { remaining: 0 };
    const expectedStatus = program && (program.status === 'full' || capacity.remaining <= 0) ? 'waitlisted' : 'confirmed';
    const id = registerForProgram(draft);
    if (!id) {
      setError('This program is no longer accepting demo registrations.');
      setSubmitting(false);
      return;
    }
    setRegistrationId(id);
    setSubmittedStatus(expectedStatus);
  };

  if (!program) {
    return (
      <section className="register-shell shell">
        <h1>Program not found</h1>
        <p className="event-detail-disabled">This demo record may have been reset or removed.</p>
        <Link className="button" href="/events">
          Back to events
        </Link>
      </section>
    );
  }

  const canRegister = ['registration-open', 'active', 'full'].includes(program.status);
  if (!canRegister) {
    return (
      <section className="register-shell shell">
        <Link className="event-detail-back" href={`/events/${program.slug}`}>
          <ArrowLeft size={15} /> {program.name}
        </Link>
        <h1>Registration is closed</h1>
        <p className="event-detail-disabled">This program is {program.status.replaceAll('-', ' ')} in the demo. No registration was created.</p>
        <Link className="button" href="/events">
          Back to events
        </Link>
      </section>
    );
  }

  if (state.session?.role !== 'family') {
    const nextPath = `/register/${program.slug}`;
    return (
      <section className="register-shell shell">
        <Link className="event-detail-back" href={`/events/${program.slug}`}><ArrowLeft size={15} /> {program.name}</Link>
        <div className="registration-access-card">
          <p className="eyebrow">Family access</p>
          <h1>Start your camp registration</h1>
          <p>Sign in or create a family account first. Your dates, forms, and payment details will stay together in My Camps.</p>
          <DemoNotice />
          <div className="registration-access-actions">
            <Link className="button" href={`/sign-in?mode=login&next=${encodeURIComponent(nextPath)}`}>Sign in to my account <ArrowRight size={16} /></Link>
            <Link className="button button-outline" href={`/sign-in?mode=signup&next=${encodeURIComponent(nextPath)}`}>Create a family account</Link>
          </div>
        </div>
      </section>
    );
  }

  if (submittedStatus) {
    return (
      <section className="registration-success shell">
        <span>
          <CheckCircle2 size={30} />
        </span>
        <p className="eyebrow">Demo submission saved locally</p>
        <h1>{submittedStatus === 'confirmed' ? 'Registration confirmed' : 'You’re on the waitlist'}</h1>
        <p>
          {submittedStatus === 'confirmed'
            ? `There’s a place for ${draft.childFirstName} at ${program.name}.`
            : `${program.name} is currently full, so we saved a waitlist request for ${draft.childFirstName}.`}
        </p>
        <div>
          <button
            className="button"
            type="button"
            onClick={() => router.push(`/sign-in?next=${encodeURIComponent(`/portal/registrations/${registrationId ?? ''}`)}`)}
          >
            Open My Rookie Rackets <ArrowRight size={16} />
          </button>
          <Link className="text-link" href="/events">
            Back to events
          </Link>
        </div>
      </section>
    );
  }

  const labels = ['Player details', 'Safety', 'Agreements', 'Review'];
  return (
    <section className="register-shell shell">
      <div className="register-header">
        <div>
          <Link className="event-detail-back" href={`/events/${program.slug}`}>
            <ArrowLeft size={15} /> {program.name}
          </Link>
          <h1>Register for a session</h1>
          <p>A short demo registration for a fictional family. No information leaves this browser.</p>
        </div>
        <span className="register-program-pill">{program.price === 0 ? 'Free program' : `$${program.price}`}</span>
      </div>
      <div className="registration-card">
        <DemoNotice />
        <div className="registration-progress" aria-label="Registration progress">
          {labels.map((label, index) => (
            <span className={index <= step ? 'active' : ''} key={label}>
              {String(index + 1).padStart(2, '0')} · {label}
            </span>
          ))}
        </div>
        {error && <FieldError>{error}</FieldError>}

        {step === 0 && (
          <fieldset>
            <legend>Player and guardian</legend>
            <div className="registration-grid">
              <Field label="Child first name *" invalid={isInvalid('childFirstName')}>
                <input name="childFirstName" value={draft.childFirstName} aria-invalid={isInvalid('childFirstName')} onChange={(event) => setField('childFirstName', event.target.value)} />
              </Field>
              <Field label="Child last name *" invalid={isInvalid('childLastName')}>
                <input name="childLastName" value={draft.childLastName} aria-invalid={isInvalid('childLastName')} onChange={(event) => setField('childLastName', event.target.value)} />
              </Field>
              <Field label="Date of birth *" invalid={isInvalid('dateOfBirth')}>
                <input name="dateOfBirth" type="date" value={draft.dateOfBirth} aria-invalid={isInvalid('dateOfBirth')} onChange={(event) => setField('dateOfBirth', event.target.value)} />
              </Field>
              <Field label="Grade *" invalid={isInvalid('grade')}>
                <select name="grade" aria-label="Grade" value={draft.grade} aria-invalid={isInvalid('grade')} onChange={(event) => setField('grade', event.target.value)}>
                  <option value="">Select…</option>
                  {['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map((grade) => <option key={grade}>{grade}</option>)}
                </select>
              </Field>
              <Field label="Skill level *" invalid={isInvalid('skillLevel')}>
                <select name="skillLevel" value={draft.skillLevel} aria-invalid={isInvalid('skillLevel')} onChange={(event) => setField('skillLevel', event.target.value)}>
                  <option value="">Select…</option>
                  <option value="never-played">Never played</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </Field>
              <Field label="Guardian first name *" invalid={isInvalid('guardianFirstName')}>
                <input name="guardianFirstName" value={draft.guardianFirstName} aria-invalid={isInvalid('guardianFirstName')} onChange={(event) => setField('guardianFirstName', event.target.value)} />
              </Field>
              <Field label="Guardian last name *" invalid={isInvalid('guardianLastName')}>
                <input name="guardianLastName" value={draft.guardianLastName} aria-invalid={isInvalid('guardianLastName')} onChange={(event) => setField('guardianLastName', event.target.value)} />
              </Field>
              <Field label="Guardian email *" invalid={isInvalid('guardianEmail')}>
                <input name="guardianEmail" type="email" value={draft.guardianEmail} aria-invalid={isInvalid('guardianEmail')} onChange={(event) => setField('guardianEmail', event.target.value)} />
              </Field>
              <Field label="Guardian phone *" invalid={isInvalid('guardianPhone')}>
                <input name="guardianPhone" value={draft.guardianPhone} aria-invalid={isInvalid('guardianPhone')} onChange={(event) => setField('guardianPhone', event.target.value)} />
              </Field>
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend>Safety and session questions</legend>
            <div className="registration-grid">
              <Field label="Emergency contact name *" invalid={isInvalid('emergencyName')}>
                <input name="emergencyName" value={draft.emergencyName} aria-invalid={isInvalid('emergencyName')} onChange={(event) => setField('emergencyName', event.target.value)} />
              </Field>
              <Field label="Relationship to child *" invalid={isInvalid('emergencyRelationship')}>
                <input name="emergencyRelationship" value={draft.emergencyRelationship} aria-invalid={isInvalid('emergencyRelationship')} onChange={(event) => setField('emergencyRelationship', event.target.value)} />
              </Field>
              <Field label="Emergency phone *" invalid={isInvalid('emergencyPhone')}>
                <input name="emergencyPhone" value={draft.emergencyPhone} aria-invalid={isInvalid('emergencyPhone')} onChange={(event) => setField('emergencyPhone', event.target.value)} />
              </Field>
              <Field label="Does the child need a racket?">
                <select value={draft.needsRacket ? 'yes' : 'no'} onChange={(event) => setField('needsRacket', event.target.value === 'yes')}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>
              <Field label="Will a parent remain onsite?">
                <select value={draft.parentOnsite ? 'yes' : 'no'} onChange={(event) => setField('parentOnsite', event.target.value === 'yes')}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>
              <label className="full-field">
                Anything coaches should know? <span>(optional; do not enter real medical information)</span>
                <textarea value={draft.supportNotes} onChange={(event) => setField('supportNotes', event.target.value)} />
              </label>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend>Agreements</legend>
            <div className="registration-checks">
              <label className="registration-check">
                <input type="checkbox" checked={draft.participationAccepted} onChange={(event) => setField('participationAccepted', event.target.checked)} />
                <span>Participation waiver *<br /><small>I understand this is a fictional demo acknowledgment.</small></span>
              </label>
              <label className="registration-check">
                <input type="checkbox" checked={draft.photoConsent} onChange={(event) => setField('photoConsent', event.target.checked)} />
                <span>Photo and video consent<br /><small>This separate choice can be accepted or declined.</small></span>
              </label>
              <label className="registration-check">
                <input type="checkbox" checked={draft.acknowledgmentAccepted} onChange={(event) => setField('acknowledgmentAccepted', event.target.checked)} />
                <span>Program acknowledgment *</span>
              </label>
              <label className="registration-check">
                <input type="checkbox" checked={draft.pickupAccepted} onChange={(event) => setField('pickupAccepted', event.target.checked)} />
                <span>Pickup policy acknowledgment *</span>
              </label>
            </div>
            {showErrors && !valid && <p className="field-inline-error agreement-error">Accept each required agreement to continue.</p>}
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend>Review registration</legend>
            <dl className="registration-review">
              <div><dt>Player</dt><dd>{draft.childFirstName} {draft.childLastName}</dd></div>
              <div><dt>Guardian</dt><dd>{draft.guardianFirstName} {draft.guardianLastName}</dd></div>
              <div><dt>Program</dt><dd>{program.name}</dd></div>
              <div><dt>Photo consent</dt><dd>{draft.photoConsent ? 'Accepted' : 'Declined'}</dd></div>
              <div><dt>Payment</dt><dd>{program.price === 0 ? 'Waived · free program' : 'Demo payment only'}</dd></div>
            </dl>
          </fieldset>
        )}

        <div className="registration-actions">
          {step > 0 ? <button className="button button-outline" type="button" onClick={previous}><ArrowLeft size={16} /> Back</button> : <span />}
          {step < 3 ? (
            <button className="button" type="button" onClick={next}>
              {step === 0 ? 'Continue to safety' : step === 1 ? 'Continue to agreements' : 'Review registration'} <ArrowRight size={16} />
            </button>
          ) : (
            <button className="button" type="button" onClick={submit} disabled={submitting}>
              {submitting ? 'Saving…' : 'Confirm demo registration'} <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
