import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SignIn from '../app/sign-in/page';

const state = vi.hoisted(() => ({ search: 'mode=signup&next=%2Fregister%2Fboys-club-fall' }));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(state.search),
}));

vi.mock('../lib/supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({ auth: { signInWithOtp: vi.fn() } }),
}));

describe('staff sign in page', () => {
  it('renders staff-only access even when an old family URL is opened', () => {
    render(<SignIn />);

    expect(screen.getByRole('heading', { name: /sign in to the operations desk/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/staff email/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue as family/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create account/i })).not.toBeInTheDocument();
  });
});
