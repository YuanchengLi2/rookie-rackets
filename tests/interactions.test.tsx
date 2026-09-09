import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FaqAccordion,
  GalleryLightbox,
  SignupForm,
  Testimonials,
} from '../components/site-interactions';

describe('site interactions', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('opens and closes the full-screen photo gallery', async () => {
    const user = userEvent.setup();
    render(<GalleryLightbox photos={[
      { src: '/one.png', alt: 'First workshop', caption: 'First' },
      { src: '/two.png', alt: 'Second workshop', caption: 'Second' },
      { src: '/three.png', alt: 'Third workshop', caption: 'Third' },
    ]} />);

    await user.click(screen.getByRole('button', { name: /view all photos/i }));
    expect(screen.getByRole('dialog', { name: /badminton in action/i })).toBeInTheDocument();
    expect(screen.getByText('01 / 03')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close gallery/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves between testimonials', async () => {
    const user = userEvent.setup();
    render(<Testimonials quotes={[
      { quote: 'First story', name: 'Kim', role: 'Principal' },
      { quote: 'Second story', name: 'Megh', role: 'Parent' },
    ]} />);

    expect(screen.getByText('First story')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next testimonial/i }));
    expect(screen.getByText('Second story')).toBeInTheDocument();
  });

  it('keeps one FAQ answer open at a time', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={[
      { question: 'Who can attend?', answer: 'Everyone can attend.' },
      { question: 'What does it cost?', answer: 'Nothing at all.' },
    ]} />);

    expect(screen.getByText('Everyone can attend.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'What does it cost?' }));
    expect(screen.getByText('Nothing at all.')).toBeVisible();
    expect(screen.queryByText('Everyone can attend.')).not.toBeInTheDocument();
  });

  it('validates and confirms a complete waitlist form', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ receipt: { publicReference: 'RI-ABC12345' } }) });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(screen.getByRole('button', { name: /sign me up/i }));
    expect(screen.getByText(/complete the required fields/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/parent.*name/i), 'Jordan Lee');
    await user.type(screen.getByLabelText(/phone number/i), '919-555-0110');
    await user.type(screen.getByLabelText(/email address/i), 'jordan@example.com');
    await user.type(screen.getByLabelText(/child.*name/i), 'Sam Lee');
    await user.selectOptions(screen.getByLabelText(/age.*grade/i), '5th Grade');
    await user.type(screen.getByLabelText(/^school/i), 'Carpenter Elementary');
    await user.selectOptions(screen.getByLabelText(/workshops are you interested/i), 'Beginner Fundamentals');
    await user.type(screen.getByLabelText(/how did you hear/i), 'School');
    await user.click(screen.getByRole('button', { name: /sign me up/i }));

    expect(screen.getByRole('heading', { name: /you.*on the list/i })).toBeInTheDocument();
    expect(screen.getByText(/RI-ABC12345/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/interests', expect.objectContaining({ method: 'POST' }));
  });
});
