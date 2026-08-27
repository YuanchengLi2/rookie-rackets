import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RevealMotion } from '../components/motion';

const routeState = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => routeState.pathname,
}));

describe('RevealMotion', () => {
  const observe = vi.fn();

  beforeEach(() => {
    routeState.pathname = '/';
    observe.mockClear();
    class MockIntersectionObserver {
      observe = observe;
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  it('observes reveal sections added during client-side navigation', async () => {
    render(<RevealMotion />);
    const nextPageSection = document.createElement('section');
    nextPageSection.dataset.reveal = '';
    document.body.appendChild(nextPageSection);

    await waitFor(() => expect(observe).toHaveBeenCalledWith(nextPageSection));
    nextPageSection.remove();
  });

  it('rescans the current document when the client pathname changes', async () => {
    const section = document.createElement('section');
    section.dataset.reveal = '';
    document.body.appendChild(section);
    const view = render(<RevealMotion />);
    await waitFor(() => expect(observe).toHaveBeenCalledWith(section));

    observe.mockClear();
    routeState.pathname = '/about';
    view.rerender(<RevealMotion />);

    await waitFor(() => expect(observe).toHaveBeenCalledWith(section));
    section.remove();
  });
});
