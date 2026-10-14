'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { InterestSubmissionSchema, juniorGrades, participantGrades, signupTypes, type SignupType } from '../lib/data/interest-contract';

export type Photo = { src: string; alt: string; caption: string };
export type Quote = { quote: string; name: string; role: string };
export type FaqItem = { question: string; answer: string; href?: string; linkLabel?: string };

export function GalleryLightbox({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowRight') setActive((value) => (value + 1) % photos.length);
      if (event.key === 'ArrowLeft') setActive((value) => (value - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, photos.length]);

  const move = (direction: number) => setActive((value) => (value + direction + photos.length) % photos.length);

  return (
    <>
      <button className="button button-outline" onClick={() => setOpen(true)} type="button">
        View all photos <span aria-hidden="true">↗</span>
      </button>
      {open && createPortal(
        <div aria-label="Badminton in action" aria-modal="true" className="lightbox" role="dialog">
          <div className="lightbox-top">
            <div><strong>ROOKIE RACKETS</strong><span>Badminton in action</span></div>
            <span>{String(active + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
            <button aria-label="Close gallery" className="lightbox-close" onClick={() => setOpen(false)} ref={closeRef} type="button">Close ×</button>
          </div>
          <div className="lightbox-stage">
            <button aria-label="Previous image" onClick={() => move(-1)} type="button">←</button>
            <figure><img alt={photos[active].alt} src={photos[active].src} /><figcaption>{photos[active].caption}</figcaption></figure>
            <button aria-label="Next image" onClick={() => move(1)} type="button">→</button>
          </div>
          <div className="lightbox-thumbs">
            {photos.map((photo, index) => (
              <button aria-label={`Show ${photo.alt}`} className={index === active ? 'active' : ''} key={photo.src} onClick={() => setActive(index)} type="button"><img alt="" src={photo.src} /></button>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

export function Testimonials({ quotes }: { quotes: Quote[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const reducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || reducedMotion || quotes.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % quotes.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused, quotes.length]);
  const move = (direction: number) => { setActive((value) => (value + direction + quotes.length) % quotes.length); setPaused(true); };
  return (
    <div className="testimonial-body">
      <div aria-live="polite" className="testimonial-copy" key={active}>
        <span className="quote-mark" aria-hidden="true">“</span><blockquote>{quotes[active].quote}</blockquote><strong>{quotes[active].name}</strong><span>{quotes[active].role}</span>
      </div>
      <div className="testimonial-controls">
        <span>{String(active + 1).padStart(2, '0')} / {String(quotes.length).padStart(2, '0')}</span>
        <div className="testimonial-progress"><i style={{ width: `${((active + 1) / quotes.length) * 100}%` }} /></div>
        <button aria-label="Previous testimonial" onClick={() => move(-1)} type="button">←</button>
        <button aria-label={paused ? 'Resume testimonials' : 'Pause testimonials'} onClick={() => setPaused((value) => !value)} type="button">{paused ? '▶' : 'Ⅱ'}</button>
        <button aria-label="Next testimonial" onClick={() => move(1)} type="button">→</button>
      </div>
    </div>
  );
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0);
  return <div className="faq-list">{items.map((item, index) => (
    <div className={`faq-item ${open === index ? 'open' : ''}`} key={item.question}>
      <h3><button aria-expanded={open === index} onClick={() => setOpen(index)} type="button">{item.question}<span aria-hidden="true">{open === index ? '−' : '+'}</span></button></h3>
      {open === index && <div className="faq-answer"><p>{item.answer}</p>{item.href && item.linkLabel && <a className="under-link" href={item.href}>{item.linkLabel} →</a>}</div>}
    </div>
  ))}</div>;
}

export function SignupForm() {
  const [signupType, setSignupType] = useState<SignupType | ''>('');
  const needsGrade = signupType === 'workshop' || signupType === 'junior-volunteer';
  const gradeOptions = signupType === 'junior-volunteer' ? juniorGrades : participantGrades;
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = useRef(crypto.randomUUID());
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const invalid = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[required]')).find((field) => !field.checkValidity());
    if (invalid) {
      setError('Please check each field and try again.');
      invalid.focus();
      return;
    }
    const data = new FormData(form);
    const parsed = InterestSubmissionSchema.safeParse({
      signupType,
      fullName: String(data.get('fullName') ?? ''),
      phone: String(data.get('phone') ?? ''),
      email: String(data.get('email') ?? ''),
      grade: String(data.get('grade') ?? ''),
      age: Number(data.get('age')),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(''); setSubmitting(true);
    try {
      const response = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          website: String(data.get('website') ?? ''),
          submission: parsed.data,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? 'Sign-up could not be saved.');
      setReceipt(body.receipt.publicReference);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign-up could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };
  if (receipt) return <div className="form-success" role="status"><span aria-hidden="true">✓</span><p className="eyebrow">Signup received · {receipt}</p><h2>Thanks for signing up.</h2><p>We received your details and notified the Rookie Rackets team. {signupType === 'workshop' ? 'We’ll be in touch about workshop opportunities. This interest signup does not reserve a place at a specific event.' : 'We’ll be in touch about ways to get involved.'}</p><button className="text-link" onClick={() => { idempotencyKey.current = crypto.randomUUID(); setReceipt(''); setSignupType(''); }} type="button">Add another signup →</button></div>;
  return (
    <form className="signup-form" noValidate onSubmit={(event) => void submit(event)}>
      <div className="form-heading"><div><p className="eyebrow">Play, volunteer, or coach</p><h2>Sign up</h2><p>Tell us how you’d like to get involved. If you’re under 18, please provide a parent or guardian’s contact details.</p></div><span>All fields required</span></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <div className="signup-fields">
        <label className="full-field">Sign up as<select name="signupType" required value={signupType} onChange={(event) => { setSignupType(event.target.value as SignupType); setError(''); }}><option disabled value="">Choose how to get involved</option>{Object.entries(signupTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="full-field">Full name<input autoComplete="name" maxLength={160} name="fullName" placeholder="First and last name" required /></label>
        <label>Email address<input autoComplete="email" maxLength={254} name="email" placeholder="you@example.com" required type="email" /></label>
        <label>Phone number<input autoComplete="tel" minLength={7} maxLength={32} name="phone" placeholder="(919) 555-0123" required type="tel" /></label>
        {needsGrade && <label>Grade<select key={signupType} name="grade" required defaultValue=""><option disabled value="">Select grade</option>{gradeOptions.map((option) => <option key={option}>{option}</option>)}</select></label>}
        <label>Age<input inputMode="numeric" max={99} min={signupType === 'adult-volunteer' ? 18 : 3} name="age" placeholder="Age" required type="number" /></label>
      </div>
      {signupType === 'junior-volunteer' && <p>Junior volunteers must be in middle school or high school (grades 6–12).</p>}
      {signupType === 'workshop' && <p>Sign up to hear about workshops. Event availability and host eligibility apply; this form does not reserve a place.</p>}
      <button className="button form-submit" disabled={submitting} type="submit">{submitting ? 'Sending signup…' : 'Sign up →'}</button>
      <p className="privacy-note">We’ll use your details only to follow up about your Rookie Rackets signup.</p>
    </form>
  );
}
