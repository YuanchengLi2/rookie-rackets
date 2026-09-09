import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StaffSignIn } from '../components/auth/staff-sign-in';
import { getActiveStaff, safeReturnPath } from '../lib/supabase/auth';

const auth = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
  search: 'next=%2Fstaff%2Fregistrations',
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(auth.search),
}));

vi.mock('../lib/supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({ auth: { signInWithOtp: auth.signInWithOtp } }),
}));

describe('staff authentication', () => {
  beforeEach(() => {
    auth.search = 'next=%2Fstaff%2Fregistrations';
    auth.signInWithOtp.mockReset().mockResolvedValue({ error: null });
  });

  it('allows only local staff return paths', () => {
    expect(safeReturnPath('/staff/registrations')).toBe('/staff/registrations');
    expect(safeReturnPath('/staff')).toBe('/staff');
    expect(safeReturnPath('/portal')).toBe('/staff');
    expect(safeReturnPath('https://evil.example/staff')).toBe('/staff');
    expect(safeReturnPath('//evil.example/staff')).toBe('/staff');
  });

  it('sends a magic link without creating unapproved users', async () => {
    const user = userEvent.setup();
    render(<StaffSignIn />);

    await user.type(screen.getByLabelText(/staff email/i), ' YuanchengLi612@gmail.com ');
    await user.click(screen.getByRole('button', { name: /email sign-in link/i }));

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'yuanchengli612@gmail.com',
      options: {
        shouldCreateUser: false,
        emailRedirectTo: 'http://localhost:3000/auth/callback?next=%2Fstaff%2Fregistrations',
      },
    });
    expect(screen.getByText(/check your email/i)).toBeInTheDocument();
  });

  it('keeps the form available when Supabase rejects the request', async () => {
    auth.signInWithOtp.mockResolvedValue({ error: new Error('rate limited') });
    const user = userEvent.setup();
    render(<StaffSignIn />);

    await user.type(screen.getByLabelText(/staff email/i), 'yuanchengli612@gmail.com');
    await user.click(screen.getByRole('button', { name: /email sign-in link/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/could not send/i);
    expect(screen.getByLabelText(/staff email/i)).toHaveValue('yuanchengli612@gmail.com');
  });

  it('recovers when the authentication request cannot reach Supabase', async () => {
    auth.signInWithOtp.mockRejectedValue(new Error('network offline'));
    const user = userEvent.setup();
    render(<StaffSignIn />);

    await user.type(screen.getByLabelText(/staff email/i), 'yuanchengli612@gmail.com');
    await user.click(screen.getByRole('button', { name: /email sign-in link/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/could not send/i);
    expect(screen.getByRole('button', { name: /email sign-in link/i })).toBeEnabled();
  });

  it('returns only active staff profiles', async () => {
    const active = {
      id: 'b0000000-0000-4000-8000-000000000001',
      email: 'yuanchengli612@gmail.com',
      name: 'Yuancheng Li',
      initials: 'YL',
      role: 'admin' as const,
      active: true,
      createdAt: '2026-09-08T00:00:00Z',
      updatedAt: '2026-09-08T00:00:00Z',
    };
    const activeRow = {
      id: active.id,
      email: active.email,
      name: active.name,
      initials: active.initials,
      role: active.role,
      active: active.active,
      created_at: active.createdAt,
      updated_at: active.updatedAt,
    };
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: active.id } }, error: null }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: activeRow, error: null }) }),
          }),
        }),
      }),
    };

    await expect(getActiveStaff(client)).resolves.toEqual(active);
  });
});
