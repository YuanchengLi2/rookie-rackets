import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProgramDetail } from '../components/public/program-detail';
import { RegistrationWizard } from '../components/public/registration-wizard';
import { canPublicRegister, type PublicProgramBundle } from '../lib/data/public-programs';

const bundle: PublicProgramBundle = {
  program: { id: '30000000-0000-4000-8000-000000000001', slug: 'boys-club-fall', name: 'Raleigh Boys Club Workshops', organizationId: '10000000-0000-4000-8000-000000000001', type: 'camp', description: 'Beginner badminton.', venue: 'Raleigh Boys Club', skillLevel: 'beginner', eligibility: 'Raleigh Boys Club participants in grades 3–6', capacity: 24, leadCoachId: null, status: 'registration-open', visibility: 'public', priceCents: 0, registrationDeadline: '2026-12-18', whatToBring: ['Athletic non-marking shoes'], equipmentProvided: true, image: '', contact: 'team@example.com', createdAt: '', updatedAt: '', archivedAt: null },
  sessions: [{ id: '40000000-0000-4000-8000-000000000001', programId: '30000000-0000-4000-8000-000000000001', date: '2026-10-09', startTime: '16:00:00', endTime: '17:00:00', arrivalTime: '15:40:00', location: 'Boys Club', leadCoachId: null, curriculum: { objective: '', activities: [], coachNotes: '', updatedAt: null }, status: 'scheduled', notes: '', createdAt: '', updatedAt: '' }],
  partner: { name: 'Raleigh Boys Club', website: 'https://wakejohnstonbgc.org/raleigh-boys-club/' },
};

afterEach(() => vi.unstubAllGlobals());

async function fillAndAdvance(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/child first name/i), 'Jamie');
  await user.type(screen.getByLabelText(/child last name/i), 'Lee');
  await user.type(screen.getByLabelText(/date of birth/i), '2015-05-12');
  await user.selectOptions(screen.getByLabelText(/^grade/i), '5th Grade');
  await user.selectOptions(screen.getByLabelText(/skill level/i), 'beginner');
  await user.type(screen.getByLabelText(/guardian first name/i), 'Jordan');
  await user.type(screen.getByLabelText(/guardian last name/i), 'Lee');
  await user.type(screen.getByLabelText(/guardian email/i), 'jordan@example.com');
  await user.type(screen.getByLabelText(/guardian phone/i), '919-555-0199');
  await user.type(screen.getByLabelText(/emergency contact name/i), 'Taylor Lee');
  await user.type(screen.getByLabelText(/relationship to child/i), 'Parent');
  await user.type(screen.getByLabelText(/emergency phone/i), '919-555-0111');
  await user.click(screen.getByRole('button', { name: /continue to dates/i }));
  await user.click(screen.getByRole('checkbox', { name: /oct 9/i }));
  await user.click(screen.getByRole('button', { name: /continue to forms/i }));
  await user.click(screen.getByLabelText(/participation waiver/i));
  await user.click(screen.getByLabelText(/program acknowledgment/i));
  await user.click(screen.getByLabelText(/pickup policy/i));
}

describe('public registration', () => {
  it('shows the form immediately with no family account gate', () => {
    render(<RegistrationWizard bundle={bundle} />);
    expect(screen.getByLabelText(/child first name/i)).toBeInTheDocument();
    expect(screen.queryByText(/create a family account/i)).not.toBeInTheDocument();
  });

  it('submits selected dates and shows the persistent receipt reference', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ receipt: { registrationId: '60000000-0000-4000-8000-000000000001', publicReference: 'RR-ABC12345', registrationStatus: 'confirmed', paymentStatus: 'waived' } }) });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup(); render(<RegistrationWizard bundle={bundle} />);
    await fillAndAdvance(user);
    expect(screen.getByLabelText(/photo.*video.*optional/i)).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: /review registration/i }));
    await user.click(screen.getByRole('button', { name: /submit registration/i }));
    expect(await screen.findByRole('heading', { name: /registration confirmed/i })).toBeInTheDocument();
    expect(screen.getByText('RR-ABC12345')).toBeInTheDocument();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.submission.selectedSessionIds).toEqual(['40000000-0000-4000-8000-000000000001']);
    expect(body.submission.consents.photoVideo).toBe(false);
  });

  it('preserves the completed form and allows retry after a network failure', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce({ ok: true, json: async () => ({ receipt: { registrationId: '60000000-0000-4000-8000-000000000001', publicReference: 'RR-ABC12345', registrationStatus: 'confirmed', paymentStatus: 'waived' } }) });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup(); render(<RegistrationWizard bundle={bundle} />);
    await fillAndAdvance(user); await user.click(screen.getByRole('button', { name: /review registration/i }));
    await user.click(screen.getByRole('button', { name: /submit registration/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/network unavailable/i);
    expect(screen.getByText('Jamie Lee')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /submit registration/i }));
    await waitFor(() => expect(screen.getByText('RR-ABC12345')).toBeInTheDocument());
    const keys = fetchMock.mock.calls.map((call) => JSON.parse(call[1].body as string).idempotencyKey);
    expect(new Set(keys).size).toBe(1);
  });

  it('shows Zelle instructions in review without a payment step or card fields', async () => {
    const user = userEvent.setup(); render(<RegistrationWizard bundle={{ ...bundle, program: { ...bundle.program, priceCents: 4500 } }} />);
    await fillAndAdvance(user); await user.click(screen.getByRole('button', { name: /review registration/i }));
    expect(screen.getByRole('group', { name: /review registration/i })).toBeInTheDocument();
    expect(screen.getAllByText('$45.00').length).toBeGreaterThan(0);
    expect(screen.getByText('teamrookierackets@gmail.com')).toBeInTheDocument();
    expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument();
    expect(within(screen.getByLabelText(/registration progress/i)).queryByText(/payment/i)).not.toBeInTheDocument();
  });

  it('links program details directly to online registration', () => {
    render(<ProgramDetail bundle={bundle} />);
    expect(screen.getByRole('link', { name: /register for this program/i })).toHaveAttribute('href', '/register/boys-club-fall');
    expect(screen.queryByText(/family account/i)).not.toBeInTheDocument();
  });

  it('allows public registration only for camps with sessions', () => {
    expect(canPublicRegister(bundle.program, bundle.sessions)).toBe(true);
    expect(canPublicRegister({ ...bundle.program, type: 'recurring-partner-program' }, bundle.sessions)).toBe(false);
    expect(canPublicRegister({ ...bundle.program, type: 'multiweek-school-program' }, bundle.sessions)).toBe(false);
    expect(canPublicRegister(bundle.program, [])).toBe(false);
  });

  it('does not offer registration for a partner-managed program', () => {
    const partnerBundle = { ...bundle, program: { ...bundle.program, type: 'recurring-partner-program' as const } };
    render(<ProgramDetail bundle={partnerBundle} />);
    expect(screen.queryByRole('link', { name: /register for this program/i })).not.toBeInTheDocument();
    expect(screen.getByText(/partner manages participation directly/i)).toBeInTheDocument();
    expect(screen.getByText(/raleigh boys club participants in grades 3–6/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /visit raleigh boys club website/i })).toHaveAttribute('href', 'https://wakejohnstonbgc.org/raleigh-boys-club/');
  });
});
