import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from '../app/page';

describe('homepage', () => {
  it('introduces the program and exposes the primary actions', () => {
    render(<Home />);

    const heading = screen.getByRole('heading', { name: /rookie rackets/i, level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.parentElement).toHaveClass('hero-copy-contrast');
    expect(heading.parentElement).not.toHaveClass('hero-copy-panel');
    expect(screen.getByText(/where birdies take flight/i)).toBeInTheDocument();
    expect(screen.getByText(/making badminton accessible across the triangle/i)).toBeInTheDocument();
    expect(screen.getByText(/coached by nationally trained players in triangle, nc/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /join waitlist/i })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: /view events/i })).toHaveAttribute(
      'href',
      '/events',
    );
  });

  it('gives homepage calls to action distinct primary and secondary treatments', () => {
    render(<Home />);

    expect(screen.getByRole('link', { name: /join waitlist/i })).toHaveClass('home-button-primary');
    expect(screen.getByRole('link', { name: /view events/i })).toHaveClass('home-button-secondary');
    expect(screen.getByRole('link', { name: /^sign up →$/i })).toHaveClass('home-button-primary');
  });

  it('uses a slow automatic crossfade without visible carousel arrows', () => {
    vi.useFakeTimers();
    render(<Home />);

    const gallery = screen.getByRole('region', { name: /workshop photos/i });
    expect(gallery).toHaveClass('hero-media-bleed-left');
    expect(gallery).toHaveClass('hero-media-photo-fade');
    expect(gallery).toHaveClass('hero-media-copy-safe');
    const rotationBar = gallery.querySelector('.hero-rotation-bar');
    expect(rotationBar?.querySelectorAll('span')).toHaveLength(2);
    expect(rotationBar?.querySelectorAll('span')[0]).toHaveClass('active');
    expect(gallery.querySelectorAll('img')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /previous photo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next photo/i })).not.toBeInTheDocument();
    expect(gallery.querySelectorAll('img')[0]).toHaveClass('is-active');

    act(() => vi.advanceTimersByTime(6000));
    expect(gallery.querySelectorAll('img')[0]).toHaveClass('is-active');
    act(() => vi.advanceTimersByTime(2000));
    expect(gallery.querySelectorAll('img')[1]).toHaveClass('is-active');
    expect(rotationBar?.querySelectorAll('span')[1]).toHaveClass('active');
    vi.useRealTimers();
  });

  it('shows the updated impact record and removes the all-ages coaching section', () => {
    render(<Home />);

    for (const value of ['100', '8', '7', '2', '60']) {
      expect(screen.getAllByText(value)[0].closest('[data-count-up]')).toBeInTheDocument();
    }
    expect(screen.getByText(/introduced to badminton/i)).toBeInTheDocument();
    expect(screen.getByText(/events.*workshops.*camps.*awareness booth/i)).toBeInTheDocument();
    expect(screen.queryByText(/events.*since 2025/i)).not.toBeInTheDocument();
    expect(screen.getByText(/partnered with schools.*organizations in the triangle/i)).toBeInTheDocument();
    expect(screen.getByText(/years of operations/i)).toBeInTheDocument();
    expect(screen.getByText(/free all.inclusive workshops/i)).toBeInTheDocument();
    expect(screen.getByText(/combined tournament wins/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what we.ve done so far/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /badminton in action/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /coaching for all ages/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what people are saying/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /our growing network/i })).toBeInTheDocument();
    expect(document.querySelectorAll('[data-reveal]').length).toBeGreaterThanOrEqual(5);
  });

  it('adds the supplied testimonials and presents the network as a visual map', () => {
    render(<Home />);

    const next = screen.getByRole('button', { name: /next testimonial/i });
    expect(screen.getByText(/maturity, organization, and professionalism/i)).toBeInTheDocument();
    fireEvent.click(next);
    expect(screen.getByText(/dhruva liked the camp so much/i)).toBeInTheDocument();
    for (let index = 0; index < 3; index += 1) fireEvent.click(next);
    expect(screen.getByText(/my daughter participated in the rookie rackets camp/i)).toBeInTheDocument();
    for (let index = 0; index < 3; index += 1) fireEvent.click(next);
    expect(screen.getByText(/one-week summer camp for kids on the autism spectrum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rookie rackets partner network/i)).toBeInTheDocument();
    for (const partner of ['Carpenter Elementary', 'TMSA Elementary', 'Vibha', 'Anurag Foundation', 'Raleigh Boys Club', 'RJourney', 'Peak Sports']) {
      expect(screen.getAllByText(partner).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(/nonprofit organizations.*neurodivergent kids.*underserved populations.*community events/i)).toBeInTheDocument();
  });

  it('includes every supplied photo in the fullscreen gallery', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: /view all photos/i }));

    const gallery = screen.getByRole('dialog', { name: /badminton in action/i });
    expect(gallery).toBeInTheDocument();
    expect(gallery.parentElement).toBe(document.body);
    for (const photoName of ['carpenter elementary', 'community smash', 'a coach sparring during the rjourney summer camp', 'rookie rackets at the vibha pickleball', 'a participant at the raleigh boys club', 'young players practicing at the rookie rackets peak sports camp', 'players and coaches at the vibha rookie rackets summer camp', 'community badminton demonstration', 'young players gathered during a school gym workshop', 'a coach helping a student practice by the net']) {
      expect(screen.getByRole('button', { name: new RegExp(`show ${photoName}`, 'i') })).toBeInTheDocument();
    }
  });
});
