import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OperationsProvider, useOperations } from '../components/data/operations-provider';
import { emptyOperationsState, type OperationsState } from '../lib/data/types';
import type { OperationsRepository } from '../lib/data/repository';

function Probe() {
  const operations = useOperations();
  return (
    <div>
      <span data-testid="status">{operations.status}</span>
      <span data-testid="programs">{operations.state.programs.length}</span>
      <span data-testid="error">{operations.error?.message ?? ''}</span>
      <button onClick={() => operations.refresh()}>Refresh</button>
    </div>
  );
}

function repository(loadWorkspace: () => Promise<OperationsState>) {
  let invalidate: (() => void) | null = null;
  return {
    loadWorkspace: vi.fn(loadWorkspace),
    subscribe: vi.fn((callback: () => void) => {
      invalidate = callback;
      return () => { invalidate = null; };
    }),
    emit: () => invalidate?.(),
  } as unknown as OperationsRepository & { emit: () => void };
}

describe('OperationsProvider', () => {
  it('loads the authoritative workspace and reacts to subscription invalidation', async () => {
    const first = emptyOperationsState();
    const second = { ...emptyOperationsState(), programs: [{ id: 'program-1' }] } as OperationsState;
    const repo = repository(vi.fn().mockResolvedValueOnce(first).mockResolvedValue(second));

    const view = render(<OperationsProvider repository={repo}><Probe /></OperationsProvider>);
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'));
    expect(screen.getByTestId('programs')).toHaveTextContent('0');

    act(() => repo.emit());
    await waitFor(() => expect(screen.getByTestId('programs')).toHaveTextContent('1'));
    expect(repo.loadWorkspace).toHaveBeenCalledTimes(2);

    view.unmount();
    expect(repo.subscribe).toHaveBeenCalledOnce();
  });

  it('keeps the last good snapshot when a refresh fails and can retry', async () => {
    const stable = { ...emptyOperationsState(), programs: [{ id: 'program-1' }] } as OperationsState;
    const repo = repository(vi.fn()
      .mockResolvedValueOnce(stable)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(stable));
    render(<OperationsProvider repository={repo}><Probe /></OperationsProvider>);
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'));

    await act(async () => { await screen.getByRole('button', { name: 'Refresh' }).click(); });
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('stale'));
    expect(screen.getByTestId('programs')).toHaveTextContent('1');
    expect(screen.getByTestId('error')).toHaveTextContent('Something went wrong');

    await act(async () => { await screen.getByRole('button', { name: 'Refresh' }).click(); });
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'));
  });
});
