import { describe, expect, it, vi } from 'vitest';
import SignIn from '../app/sign-in/page';

const redirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect,
}));

describe('legacy sign in route', () => {
  it('opens the staff dashboard directly', () => {
    SignIn();
    expect(redirect).toHaveBeenCalledWith('/staff');
  });
});
