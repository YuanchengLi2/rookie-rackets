import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from '../app/page';

describe('homepage', () => {
  it('introduces the program and exposes the primary actions', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /rookie rackets/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/where birdies take flight/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /join waitlist/i })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: /view events/i })).toHaveAttribute(
      'href',
      '/events',
    );
  });

  it('uses a slow automatic crossfade without visible carousel arrows', () => {
    vi.useFakeTimers();
    render(<Home />);

    const gallery = screen.getByRole('region', { name: /workshop photos/i });
    expect(gallery.querySelectorAll('img')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: /previous photo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next photo/i })).not.toBeInTheDocument();
    expect(gallery.querySelectorAll('img')[0]).toHaveClass('is-active');

    act(() => vi.advanceTimersByTime(6000));
    expect(gallery.querySelectorAll('img')[0]).toHaveClass('is-active');
    act(() => vi.advanceTimersByTime(2000));
    expect(gallery.querySelectorAll('img')[1]).toHaveClass('is-active');
    vi.useRealTimers();
  });

  it('preserves every approved homepage section and animated impact value', () => {
    render(<Home />);

    expect(screen.getByText('40').closest('[data-count-up]')).toBeInTheDocument();
    expect(screen.getAllByText('6')[0].closest('[data-count-up]')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what we.ve done so far/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /badminton in action/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /coaching for all ages in nc/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what people are saying/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /our growing network/i })).toBeInTheDocument();
    expect(document.querySelectorAll('[data-reveal]').length).toBeGreaterThanOrEqual(6);
  });

  it('includes every supplied photo in the fullscreen gallery', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: /view all photos/i }));

    const gallery = screen.getByRole('dialog', { name: /badminton in action/i });
    expect(gallery).toBeInTheDocument();
    expect(gallery.parentElement).toBe(document.body);
    for (const photoNumber of ['7320', '7937', '7953', '7956', '8786', '8787', '8789', '8790']) {
      expect(screen.getByRole('button', { name: new RegExp(`show rookie rackets photo ${photoNumber}`, 'i') })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button', { name: /show rookie rackets photo collage/i })).toHaveLength(3);
  });
});
