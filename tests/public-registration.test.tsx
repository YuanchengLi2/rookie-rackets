import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DemoProvider } from '../components/demo/demo-provider';
import { ProgramDetail } from '../components/public/program-detail';
import { RegistrationWizard } from '../components/public/registration-wizard';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));

describe('public mock registration', () => {
  it('requires family access before showing registration fields', () => {
    render(<DemoProvider><RegistrationWizard programId="program-boys-club" /></DemoProvider>);

    expect(screen.queryByLabelText(/child first name/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in to my account/i })).toHaveAttribute('href', '/sign-in?mode=login&next=%2Fregister%2Fboys-club-fall');
    expect(screen.getByRole('link', { name: /create a family account/i })).toHaveAttribute('href', '/sign-in?mode=signup&next=%2Fregister%2Fboys-club-fall');
  });

  it('shows a register action on the Boys Club detail page', () => {
    render(<DemoProvider><ProgramDetail programId="program-boys-club" /></DemoProvider>);
    expect(screen.getByRole('heading', { name: /boys club fall/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register/boys-club-fall');
    expect(screen.getByRole('link', { name: /open family account/i })).toHaveAttribute('href', '/sign-in?next=/portal/registrations');
  });

  it('validates and confirms a free registration through the local store', async () => {
    const user = userEvent.setup();
    render(<DemoProvider><RegistrationWizard programId="program-boys-club" /></DemoProvider>);
    await user.click(screen.getByRole('button', { name: /continue to safety/i }));
    expect(screen.getByText(/complete the highlighted fields/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/child first name/i), 'Jamie');
    await user.type(screen.getByLabelText(/child last name/i), 'Lee');
    await user.type(screen.getByLabelText(/date of birth/i), '2015-05-12');
    await user.selectOptions(screen.getByLabelText(/^grade/i), '5th Grade');
    await user.selectOptions(screen.getByLabelText(/skill level/i), 'beginner');
    expect(screen.getByLabelText(/skill level/i)).toHaveValue('beginner');
    await user.type(screen.getByLabelText(/guardian first name/i), 'Jordan');
    await user.type(screen.getByLabelText(/guardian last name/i), 'Lee');
    await user.type(screen.getByLabelText(/guardian email/i), 'jordan-new@example.test');
    await user.type(screen.getByLabelText(/guardian phone/i), '919-555-0199');
    await user.click(screen.getByRole('button', { name: /continue to safety/i }));
    await user.type(screen.getByLabelText(/emergency contact name/i), 'Taylor Lee');
    await user.type(screen.getByLabelText(/emergency phone/i), '919-555-0111');
    await user.type(screen.getByLabelText(/relationship to child/i), 'Parent');
    await user.click(screen.getByRole('button', { name: /continue to agreements/i }));
    await user.click(screen.getByLabelText(/participation waiver/i));
    await user.click(screen.getByLabelText(/program acknowledgment/i));
    await user.click(screen.getByLabelText(/pickup policy/i));
    await user.click(screen.getByRole('button', { name: /review registration/i }));
    await user.click(screen.getByRole('button', { name: /confirm demo registration/i }));
    expect(await screen.findByRole('heading', { name: /registration confirmed/i })).toBeInTheDocument();
  });
});
