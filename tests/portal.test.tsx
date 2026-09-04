import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AccountView } from '../components/portal/account-view';
import { CampDetail } from '../components/portal/camp-detail';
import { CampsView } from '../components/portal/camps-view';
import { PortalHome } from '../components/portal/portal-home';
import { PortalShell } from '../components/portal/portal-shell';
import { renderWithDemo } from './test-utils';

vi.mock('next/navigation', () => ({
  usePathname: () => '/portal',
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

describe('simplified family portal', () => {
  it('shows only Home, My Camps, and Account in the main navigation', () => {
    renderWithDemo(<PortalShell><div>Portal body</div></PortalShell>);

    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '/portal');
    expect(screen.getByRole('link', { name: /^my camps$/i })).toHaveAttribute('href', '/portal/camps');
    expect(screen.getAllByRole('link', { name: /^account$/i })[0]).toHaveAttribute('href', '/portal/account');
    expect(screen.queryByRole('link', { name: /payments/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /forms/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /registrations/i })).not.toBeInTheDocument();
  });

  it('keeps the homepage focused on the next session, camps, and required actions', () => {
    renderWithDemo(<PortalHome />);

    expect(screen.getByRole('heading', { name: /your family/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /boys club fall/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /my camps/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /accept your available spot/i })).toHaveAttribute('href', '/portal/camps/registration-family-tmsa');
    expect(screen.queryByText(/photo consent missing/i)).not.toBeInTheDocument();
  });

  it('lists current and past camps in one place', async () => {
    const user = userEvent.setup();
    renderWithDemo(<CampsView />);

    expect(screen.getByRole('heading', { name: /my camps/i })).toBeInTheDocument();
    expect(screen.getByText(/TMSA Fall Workshop/i)).toBeInTheDocument();
    expect(screen.getByText(/Peak Sports Camp/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^current$/i }));
    expect(screen.getByText(/TMSA Fall Workshop/i)).toBeInTheDocument();
    expect(screen.queryByText(/Peak Sports Camp/i)).not.toBeInTheDocument();
  });

  it('keeps dates, forms, payment, and absence reporting inside a camp', async () => {
    const user = userEvent.setup();
    renderWithDemo(<CampDetail registrationId="registration-family-boys" />);

    expect(screen.getByRole('heading', { name: /^dates$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^forms$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^payment$/i })).toBeInTheDocument();
    expect(screen.getByText(/free camp/i)).toBeInTheDocument();
    expect(screen.getByText(/photo and video permission/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /allow photos/i }));
    expect(screen.getByRole('button', { name: /decline photos/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /report an absence/i }));
    await user.click(screen.getByRole('button', { name: /save absence/i }));
    expect(screen.getByText(/parent-reported absence/i)).toBeInTheDocument();
  });

  it('saves guardian account changes locally', async () => {
    const user = userEvent.setup();
    cleanup();
    renderWithDemo(<AccountView />);
    const first = screen.getByLabelText(/first name/i);
    await user.clear(first);
    await user.type(first, 'Alex');
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(screen.getByText(/saved locally/i)).toBeInTheDocument();
  });
});
