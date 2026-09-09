'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { emptyOperationsState, type OperationsState, type StaffProfile } from '../../lib/data/types';
import { toDomainError, type DomainError } from '../../lib/data/errors';
import type { OperationsRepository } from '../../lib/data/repository';
import { createSupabaseOperationsRepository } from '../../lib/data/supabase-repository';

export type OperationsStatus = 'loading' | 'ready' | 'stale' | 'error';

interface OperationsContextValue {
  state: OperationsState;
  status: OperationsStatus;
  error: DomainError | null;
  staff: StaffProfile | null;
  toast: string | null;
  dismissToast(): void;
  refresh(): Promise<void>;
  isSaving(key: string): boolean;
  mutate<T>(key: string, operation: (repository: OperationsRepository) => Promise<T>, successMessage?: string): Promise<T>;
  repository: OperationsRepository;
}

const OperationsContext = createContext<OperationsContextValue | null>(null);

export function OperationsProvider({ children, repository: providedRepository }: { children: React.ReactNode; repository?: OperationsRepository }) {
  const repositoryRef = useRef<OperationsRepository | null>(null);
  if (!repositoryRef.current) repositoryRef.current = providedRepository ?? createSupabaseOperationsRepository();
  const repository = repositoryRef.current;
  const [state, setState] = useState<OperationsState>(emptyOperationsState);
  const [status, setStatus] = useState<OperationsStatus>('loading');
  const [error, setError] = useState<DomainError | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState<Set<string>>(() => new Set());
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await repository.loadWorkspace();
      if (!mounted.current) return;
      setState(next);
      setError(null);
      setStatus('ready');
    } catch (cause) {
      if (!mounted.current) return;
      setError(toDomainError(cause));
      setStatus((current) => current === 'loading' ? 'error' : 'stale');
    }
  }, [repository]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = repository.subscribe(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { void refresh(); }, 120);
    });
    return () => {
      mounted.current = false;
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh, repository]);

  const mutate = useCallback(async <T,>(key: string, operation: (target: OperationsRepository) => Promise<T>, successMessage?: string) => {
    setSaving((current) => new Set(current).add(key));
    setError(null);
    try {
      const result = await operation(repository);
      const next = await repository.loadWorkspace();
      if (mounted.current) {
        setState(next);
        setStatus('ready');
        if (successMessage) setToast(successMessage);
      }
      return result;
    } catch (cause) {
      const nextError = toDomainError(cause);
      if (mounted.current) {
        setError(nextError);
        setToast(nextError.message);
      }
      throw nextError;
    } finally {
      if (mounted.current) setSaving((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  }, [repository]);

  const value = useMemo<OperationsContextValue>(() => ({
    state,
    status,
    error,
    staff: state.staffProfiles[0] ?? null,
    toast,
    dismissToast: () => setToast(null),
    refresh,
    isSaving: (key) => saving.has(key),
    mutate,
    repository,
  }), [error, mutate, refresh, repository, saving, state, status, toast]);

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

export function useOperations(): OperationsContextValue {
  const value = useContext(OperationsContext);
  if (!value) throw new Error('useOperations must be used inside OperationsProvider');
  return value;
}

export function useOptionalOperations(): OperationsContextValue | null {
  return useContext(OperationsContext);
}
