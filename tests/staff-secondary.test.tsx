import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RegistrationsView } from '../components/staff/registrations-view';
import { FinanceView } from '../components/staff/finance-view';
import { SettingsView } from '../components/staff/settings-view';
import { CoachesView } from '../components/staff/coaches-view';
import { renderWithOperations } from './test-utils';

vi.mock('next/navigation', () => ({ usePathname: () => '/staff', useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

describe('staff secondary operations', () => {
  it('filters and opens registration detail', async () => {
    const user = userEvent.setup();
    renderWithOperations(<RegistrationsView />);
    await user.click(await screen.findByRole('button', { name: /jamie lee/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/internal staff notes/i)).toBeInTheDocument();
  });

  it('adds a ledger entry and exposes settings boundaries', async () => {
    const user = userEvent.setup();
    const { repository } = renderWithOperations(<FinanceView />);
    await user.click(screen.getByRole('button', { name: /add entry/i }));
    await user.type(screen.getByLabelText(/description/i), 'Program supplies');
    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '10');
    await user.type(screen.getByLabelText(/paid by/i), 'Yuancheng');
    await user.click(screen.getByRole('button', { name: /save entry/i }));
    expect(repository.createFinanceEntry).toHaveBeenCalledWith(expect.objectContaining({ description: 'Program supplies', amountCents: 1000 }));
    cleanup();
    renderWithOperations(<SettingsView />);
    expect(await screen.findByText(/persistent workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/stored in supabase/i)).toBeInTheDocument();
  });

  it('keeps coach profiles view-only while showing hours and programs', async () => {
    const user = userEvent.setup();
    renderWithOperations(<CoachesView />);
    await user.click(await screen.findByRole('button', { name: /adithya/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(/assigned sessions/i);
    expect(screen.getByLabelText(/volunteer hours/i)).toHaveValue(18.5);
    expect(screen.getByRole('button', { name: /save coach/i })).toBeInTheDocument();
  });
});
