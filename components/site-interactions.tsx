'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DemoNotice } from './demo/demo-ui';

export type Photo = { src: string; alt: string; caption: string };
export type Quote = { quote: string; name: string; role: string };
export type FaqItem = { question: string; answer: string };

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
      {open === index && <div className="faq-answer"><p>{item.answer}</p></div>}
    </div>
  ))}</div>;
}

const gradeOptions = ['Kindergarten','1st Grade','2nd Grade','3rd Grade','4th Grade','5th Grade','6th Grade','7th Grade','8th Grade','9th Grade','10th Grade','11th Grade','12th Grade','17+'];
const workshopOptions = ['Beginner Fundamentals','Intermediate Skills','Open Play / Practice','Not sure yet'];

export function SignupForm() {
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const required = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[required]'));
    if (required.some((field) => !field.value.trim())) {
      setError('Please complete the required fields.');
      required.find((field) => !field.value.trim())?.focus();
      return;
    }
    setError(''); setSubmitted(true);
  };
  if (submitted) return <div className="form-success" role="status"><span aria-hidden="true">✓</span><p className="eyebrow">Demo submission saved locally</p><h2>You’re on the list.</h2><p>No email was sent. This prototype only keeps the confirmation in this browser.</p><button className="text-link" onClick={() => setSubmitted(false)} type="button">Add another participant →</button></div>;
  return (
    <form className="signup-form" noValidate onSubmit={submit}>
      <div className="form-heading"><div><p className="eyebrow">Parent contact</p><h2>Sign Up for Updates</h2></div><span>Required fields *</span></div>
      <DemoNotice />
      {error && <p className="form-error" role="alert">{error}</p>}
      <fieldset><legend>Parent or guardian</legend>
        <label>Parent / Guardian Name *<input name="parentName" required /></label>
        <label>Phone Number *<input inputMode="tel" name="phone" required /></label>
        <label>Email Address *<input inputMode="email" name="email" required type="email" /></label>
      </fieldset>
      <fieldset><legend>Participant</legend>
        <label>Child&apos;s Name *<input name="childName" required /></label>
        <label>Age / Grade *<select name="grade" required defaultValue=""><option disabled value="">Select…</option>{gradeOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label>School *<input name="school" required /></label>
      </fieldset>
      <fieldset><legend>Preferences</legend>
        <label>Which workshops are you interested in? *<select name="workshop" required defaultValue=""><option disabled value="">Select a workshop type…</option>{workshopOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label>How did you hear about us? *<input name="referral" placeholder="Friend, social media, school…" required /></label>
        <label className="full-field">Questions or comments <span>(optional)</span><textarea name="comments" placeholder="Anything you’d like us to know…" rows={4} /></label>
      </fieldset>
      <button className="button form-submit" type="submit">Sign Me Up →</button>
      <p className="privacy-note">Your information stays private. We only use it to notify you about Rookie Rackets sessions.</p>
    </form>
  );
}
