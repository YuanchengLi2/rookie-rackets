import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../lib/data/public-programs', () => ({ getPublicPrograms: async () => [{ program: { id: 'p', slug: 'fall-program', name: 'Fall Program', description: 'A live program', venue: 'Community gym', status: 'registration-open', priceCents: 0, whatToBring: [], equipmentProvided: true, registrationDeadline: '2026-12-01' }, sessions: [{ id: 's', date: '2026-10-01' }] }] }));
import About from '../app/about/page';
import Contact from '../app/contact/page';
import CompletedEvents from '../app/completed-events/page';
import Events from '../app/events/page';
import Faq from '../app/faq/page';

describe('site routes', () => {
  it('tells the student-led story on About', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /built by high school students/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/eight volunteers/i)).toBeInTheDocument();
  });

  it('keeps the coaching band full width with one centered layout container', () => {
    render(<About />);

    const heading = screen.getByRole('heading', { name: /competitive experience/i });
    const section = heading.closest('section');
    expect(section).toHaveClass('about-coaching');
    expect(section).not.toHaveClass('approved-split');
    expect(section?.firstElementChild).toHaveClass('about-coaching-inner', 'shell');
  });

  it('shows the next real session on Upcoming Events', async () => {
    render(await Events());
    expect(screen.getByRole('heading', { name: /upcoming events/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /fall program/i })).toBeInTheDocument();
  });

  it('preserves the completed event history', () => {
    render(<CompletedEvents />);
    expect(screen.getByRole('heading', { name: /every session leaves a story behind/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /community smash/i })).toBeInTheDocument();
  });

  it('presents all common questions on FAQ', () => {
    render(<Faq />);
    expect(screen.getByRole('heading', { name: /frequently asked questions/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /who can attend/i })).toBeInTheDocument();
  });

  it('contains the complete signup flow', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: /get notified when spots open up/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/parent.*name/i)).toBeInTheDocument();
  });

  it.each([
    ['About', <About key="about" />],
    ['Completed Events', <CompletedEvents key="completed" />],
    ['FAQ', <Faq key="faq" />],
    ['Contact', <Contact key="contact" />],
  ])('adds section-entry motion hooks throughout %s', (_name, page) => {
    render(page);
    expect(document.querySelectorAll('[data-reveal]').length).toBeGreaterThanOrEqual(2);
  });

  it('adds section-entry motion hooks throughout Upcoming Events', async () => {
    render(await Events());
    expect(document.querySelectorAll('[data-reveal]').length).toBeGreaterThanOrEqual(2);
  });
});
