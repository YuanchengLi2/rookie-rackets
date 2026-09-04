import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SignIn from '../app/sign-in/page';
import { DemoProvider } from '../components/demo/demo-provider';

const navigation = vi.hoisted(() => ({ replace: vi.fn(), search: 'next=%2Fportal' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navigation.replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

describe('demo sign in', () => {
  beforeEach(() => { navigation.replace.mockClear(); navigation.search = 'next=%2Fportal'; localStorage.clear(); });

  it('offers family and staff demo roles and routes family to the requested destination', async () => {
    const user = userEvent.setup();
    render(<DemoProvider><SignIn /></DemoProvider>);
    expect(screen.getByRole('heading', { name: /choose a demo workspace/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue as family/i }));
    expect(navigation.replace).toHaveBeenCalledWith('/portal');
  });

  it.each([
    ['login', 'Sign in and continue'],
    ['signup', 'Create account and continue'],
  ])('returns family %s access to the selected camp', async (mode, actionName) => {
    navigation.search = `mode=${mode}&next=%2Fregister%2Fboys-club-fall`;
    const user = userEvent.setup();
    render(<DemoProvider><SignIn /></DemoProvider>);

    await user.click(screen.getByRole('button', { name: actionName }));

    expect(navigation.replace).toHaveBeenCalledWith('/register/boys-club-fall');
  });

  it('rejects an external family return path', async () => {
    navigation.search = 'mode=login&next=https%3A%2F%2Fevil.example%2Fregister%2Ffake';
    const user = userEvent.setup();
    render(<DemoProvider><SignIn /></DemoProvider>);

    await user.click(screen.getByRole('button', { name: /sign in and continue/i }));

    expect(navigation.replace).toHaveBeenCalledWith('/portal');
  });
});
