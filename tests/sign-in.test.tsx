import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SignIn from '../app/sign-in/page';
import { SiteHeader } from '../components/site-shell';

const redirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect,
}));

describe('dashboard entry', () => {
  it('links to the dashboard from the public header', () => {
    render(<SiteHeader active="/" />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/staff');
  });

  it('sends legacy sign in visits straight to the dashboard', () => {
    SignIn();
    expect(redirect).toHaveBeenCalledWith('/staff');
  });
});
