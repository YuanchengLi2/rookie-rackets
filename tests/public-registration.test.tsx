'use client';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DemoProvider, useDemo } from '../components/demo/demo-provider';
import { ProgramDetail } from '../components/public/program-detail';
import { RegistrationWizard } from '../components/public/registration-wizard';
import { createSeedState } from '../lib/demo/seed';
import { DEMO_STORAGE_KEY } from '../lib/demo/storage';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

function signInFamily(setup?: (state: ReturnType<typeof createSeedState>) => void) {
  const state = createSeedState();
  state.session = { role: 'family', profileId: 'family-demo' };
  setup?.(state);
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
}

function RegistrationProbe() {
  const { state } = useDemo();
  const registration = state.registrations.find((item) => item.childFirstName === 'Jamie');
  const attendance = registration ? state.attendance.filter((item) => item.registrationId === registration.id) : [];
  return <output data-testid="registration-probe">{registration ? [registration.selectedSessionIds.join(','), attendance.map((item) => item.sessionId).join(','), registration.paymentStatus].join('|') : 'none'}</output>;
}

function renderRegistration() {
  return render(<DemoProvider><RegistrationWizard programId="program-boys-club" /><RegistrationProbe /></DemoProvider>);
}

async function fillPlayerStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText(/child first name/i), 'Jamie');
  await user.type(screen.getByLabelText(/child last name/i), 'Lee');
  await user.type(screen.getByLabelText(/date of birth/i), '2015-05-12');
  await user.selectOptions(screen.getByLabelText(/^grade/i), '5th Grade');
  await user.selectOptions(screen.getByLabelText(/skill level/i), 'beginner');
  await user.type(screen.getByLabelText(/guardian first name/i), 'Jordan');
  await user.type(screen.getByLabelText(/guardian last name/i), 'Lee');
  await user.type(screen.getByLabelText(/guardian email/i), 'jordan-new@example.test');
  await user.type(screen.getByLabelText(/guardian phone/i), '919-555-0199');
  await user.type(screen.getByLabelText(/emergency contact name/i), 'Taylor Lee');
  await user.type(screen.getByLabelText(/emergency phone/i), '919-555-0111');
  await user.type(screen.getByLabelText(/relationship to child/i), 'Parent');
  await user.click(screen.getByRole('button', { name: /continue to dates/i }));
}

async function selectOneDateAndCompleteForms(user: ReturnType<typeof userEvent.setup>, paid = false) {
  await user.click(screen.getByRole('button', { name: /continue to forms/i }));
  expect(screen.getByText(/choose at least one available date/i)).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: /sep 11/i }));
  await user.click(screen.getByRole('button', { name: /continue to forms/i }));
  await user.click(screen.getByLabelText(/participation waiver/i));
  await user.click(screen.getByLabelText(/program acknowledgment/i));
  await user.click(screen.getByLabelText(/pickup policy/i));
  expect(screen.getByLabelText(/photo.*video.*optional/i)).not.toBeChecked();
  await user.click(screen.getByRole('button', { name: paid ? /continue to payment/i : /review registration/i }));
}

describe('public mock registration', () => {
  it('requires family access before showing registration fields', () => {
    renderRegistration();
    expect(screen.queryByLabelText(/child first name/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in to my account/i })).toHaveAttribute('href', '/sign-in?mode=login&next=%2Fregister%2Fboys-club-fall');
    expect(screen.getByRole('link', { name: /create a family account/i })).toHaveAttribute('href', '/sign-in?mode=signup&next=%2Fregister%2Fboys-club-fall');
  });

  it('shows a register action on the Boys Club detail page', () => {
    render(<DemoProvider><ProgramDetail programId="program-boys-club" /></DemoProvider>);
    expect(screen.getByRole('heading', { name: /boys club fall/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register/boys-club-fall');
    expect(screen.getByRole('link', { name: /open family account/i })).toHaveAttribute('href', '/sign-in?next=/portal/camps');
  });

  it('registers only the selected dates and lets camera consent stay declined', async () => {
    signInFamily();
    const user = userEvent.setup();
    renderRegistration();
    await fillPlayerStep(user);
    await selectOneDateAndCompleteForms(user);
    expect(within(screen.getByLabelText(/registration progress/i)).queryByText(/payment/i)).not.toBeInTheDocument();
    expect(screen.getByText(/sep 11/i)).toBeInTheDocument();
    expect(screen.getByText(/photo.*video/i)).toBeInTheDocument();
    expect(screen.getByText(/declined.*optional/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /confirm registration/i }));
    expect(await screen.findByRole('heading', { name: /registration confirmed/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('registration-probe')).toHaveTextContent('session-boys-sep-11|session-boys-sep-11|waived'));
  });

  it('shows a fictional payment step only for a paid camp', async () => {
    signInFamily((state) => {
      const program = state.programs.find((item) => item.id === 'program-boys-club');
      if (program) program.price = 45;
    });
    const user = userEvent.setup();
    renderRegistration();
    await fillPlayerStep(user);
    await selectOneDateAndCompleteForms(user, true);
    expect(screen.getByRole('heading', { name: /payment/i })).toBeInTheDocument();
    expect(screen.getAllByText('$45').length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue to review/i }));
    await user.click(screen.getByRole('button', { name: /confirm registration/i }));
    await waitFor(() => expect(screen.getByTestId('registration-probe')).toHaveTextContent('session-boys-sep-11|session-boys-sep-11|paid'));
  });
});
