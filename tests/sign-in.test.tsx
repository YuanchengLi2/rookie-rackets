import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SignIn from '../app/sign-in/page';
import { SiteHeader } from '../components/site-shell';

const redirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect,
}));

describe('dashboard entry', () => {
  it('shows Contact us instead of a dashboard link in the public header', () => {
    render(<SiteHeader active="/" />);
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', '/contact-us');
  });

  it('sends legacy sign in visits straight to the dashboard', () => {
    SignIn();
    expect(redirect).toHaveBeenCalledWith('/staff');
  });
});
