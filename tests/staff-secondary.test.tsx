import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RegistrationsView } from '../components/staff/registrations-view';
import { FinanceView } from '../components/staff/finance-view';
import { SettingsView } from '../components/staff/settings-view';
import { CoachesView } from '../components/staff/coaches-view';
import { renderWithDemo } from './test-utils';

vi.mock('next/navigation', () => ({ usePathname: () => '/staff', useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

describe('staff secondary mock', () => {
  it('filters and opens registration detail', async () => {
    const user = userEvent.setup();
    renderWithDemo(<RegistrationsView />);
    await user.click(screen.getAllByRole('button', { name: /sam lee/i })[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/safety information/i)).toBeInTheDocument();
  });

  it('adds a ledger entry and exposes settings boundaries', async () => {
    const user = userEvent.setup();
    renderWithDemo(<FinanceView />);
    await user.click(screen.getByRole('button', { name: /add entry/i }));
    await user.type(screen.getByLabelText(/description/i), 'Demo supplies');
    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '10');
    await user.click(screen.getByRole('button', { name: /save entry/i }));
    expect(screen.getByText(/demo supplies/i)).toBeInTheDocument();
    cleanup();
    renderWithDemo(<SettingsView />);
    expect(screen.getByText(/no database/i)).toBeInTheDocument();
  });

  it('keeps coach profiles view-only while showing hours and programs', async () => {
    const user = userEvent.setup();
    renderWithDemo(<CoachesView />);
    await user.click(screen.getByRole('button', { name: /adithya/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(/18.5 volunteer hours/i);
    expect(dialog).toHaveTextContent(/programs/i);
    expect(dialog).toHaveTextContent(/boys club fall/i);
    expect(dialog).not.toHaveTextContent(/edit assignment/i);
    expect(dialog).not.toHaveTextContent(/save assignment/i);
  });
});
