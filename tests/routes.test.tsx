import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../lib/data/public-programs', () => ({
  getPublicPrograms: async () => [{ program: { id: 'p', slug: 'fall-program', name: 'Fall Program', description: 'A live partner program', venue: 'Community gym', type: 'recurring-partner-program', status: 'registration-open', priceCents: 0, whatToBring: [], equipmentProvided: true, registrationDeadline: '2026-12-01' }, sessions: [{ id: 's', date: '2026-10-01' }] }],
  canPublicRegister: () => false,
}));
import About from '../app/about/page';
import Contact from '../app/contact/page';
import CompletedEvents from '../app/completed-events/page';
import Events from '../app/events/page';
import Faq from '../app/faq/page';

describe('site routes', () => {
  it('tells the student-led story on About', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /built by high school students/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/accessible across the triangle, nc/i)).toBeInTheDocument();
    expect(screen.getByText(/founded 2024/i)).toBeInTheDocument();
    expect(screen.getAllByText(/nine volunteers.*growing.*one shared love for the sport/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /one student, one idea/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^our mission$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^our vision$/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /rookie rackets volunteer team/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /coach mark chandler/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /coach hendry/i })).toBeInTheDocument();
    expect(screen.getByText(/vp technology/i)).toBeInTheDocument();
    expect(screen.getAllByText(/vp programs/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/leads program delivery for rjourney/i)).toBeInTheDocument();
    expect(screen.getByText(/leads program delivery for vibha/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /srineet/i })).toBeInTheDocument();
  });

  it('keeps the coaching band full width with one centered layout container', () => {
    render(<About />);

    const heading = screen.getByRole('heading', { name: /competitive experience/i });
    const section = heading.closest('section');
    expect(section).toHaveClass('about-coaching');
    expect(section).not.toHaveClass('approved-split');
    expect(section?.firstElementChild).toHaveClass('about-coaching-inner', 'shell');
  });

  it('shows live partner programs as ongoing and upcoming', async () => {
    render(await Events());
    expect(screen.getByRole('heading', { name: /ongoing.*upcoming programs/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /fall program/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /register/i })).not.toBeInTheDocument();
    expect(screen.getByText(/managed directly by the partner/i)).toBeInTheDocument();
  });

  it('preserves the completed event history', () => {
    render(<CompletedEvents />);
    expect(screen.getByRole('heading', { name: /every session leaves a story behind/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /community smash/i })).toBeInTheDocument();
    expect(screen.getAllByText(/feb 22, 2026/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /vibha pickleball tournament/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /vibha dreammile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /raleigh boys club workshops/i })).toBeInTheDocument();
    expect(screen.getByText(/open singles and doubles fundraiser/i)).toBeInTheDocument();
    expect(screen.getAllByText(/awareness booth and badminton demonstration/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^200$/)).not.toBeInTheDocument();
    expect(screen.getAllByLabelText('100').length).toBeGreaterThan(0);
    expect(screen.getByText(/introduced to badminton/i)).toBeInTheDocument();
  });

  it('presents all common questions on FAQ', () => {
    render(<Faq />);
    expect(screen.getByRole('heading', { name: /frequently asked questions/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /who can attend/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /how much does it cost/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /how can i become a volunteer coach/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /different ways of volunteering/i })).toBeInTheDocument();
  });

  it('contains the complete signup flow', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: /get notified when public camp spots open up/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/partner organizations manage participation/i)).toBeInTheDocument();
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
