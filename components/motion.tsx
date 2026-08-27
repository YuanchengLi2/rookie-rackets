'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type Slide = { src: string; alt: string };

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (slides.length < 2 || reducedMotion) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 8000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div
      aria-label="Workshop photos"
      aria-roledescription="carousel"
      className="hero-media hero-media-bleed-left hero-media-photo-fade"
      role="region"
    >
      <div className="hero-slides" aria-live="off">
        {slides.map((slide, index) => (
          <img
            alt={slide.alt}
            aria-hidden={index !== active}
            className={index === active ? 'is-active' : ''}
            key={slide.src}
            src={slide.src}
          />
        ))}
      </div>
      <div className="hero-dots" aria-hidden="true">{slides.map((slide, index) => <span className={index === active ? 'active' : ''} key={slide.src} />)}</div>
    </div>
  );
}

export function RevealMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.add('motion-ready');
    const seen = new WeakSet<Element>();
    const observer = !reducedMotion && 'IntersectionObserver' in window ? new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;
    const register = (node: Element) => {
      if (seen.has(node)) return;
      seen.add(node);
      if (observer) observer.observe(node);
      else node.classList.add('is-revealed');
    };
    const scan = (root: ParentNode) => {
      if (root instanceof Element && root.matches('[data-reveal]')) register(root);
      root.querySelectorAll('[data-reveal]').forEach(register);
    };
    scan(document);
    const mutationObserver = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node instanceof Element) scan(node);
    })));
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer?.disconnect();
      mutationObserver.disconnect();
      document.body.classList.remove('motion-ready');
    };
  }, [pathname]);
  return null;
}

export function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(end);

  useEffect(() => {
    const node = ref.current;
    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!node || reducedMotion) return;
    const start = () => {
      setValue(0);
      const began = performance.now();
      const duration = 1100;
      const tick = (time: number) => {
        const progress = Math.min((time - began) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(end * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        start();
        observer.disconnect();
      }
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref} aria-label={`${end}${suffix}`} data-count-up>{value}{suffix}</span>;
}
