import type { DemoState } from './types';
import { createSeedState } from './seed';

export const DEMO_STORAGE_KEY = 'rookie-rackets:demo:v2';

function isState(value: unknown): value is DemoState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DemoState>;
  return candidate.version === 2
    && candidate.demoDate === '2026-09-02'
    && Array.isArray(candidate.programs)
    && Array.isArray(candidate.sessions)
    && candidate.sessions.every((session) => Boolean(session?.curriculum) && typeof session.curriculum.objective === 'string' && Array.isArray(session.curriculum.activities))
    && Array.isArray(candidate.familyProfiles)
    && Array.isArray(candidate.staffProfiles)
    && Array.isArray(candidate.coaches)
    && Array.isArray(candidate.assignments)
    && Array.isArray(candidate.registrations)
    && candidate.registrations.every((registration) => Array.isArray(registration?.selectedSessionIds))
    && Array.isArray(candidate.consents)
    && Array.isArray(candidate.attendance)
    && Array.isArray(candidate.payments)
    && Array.isArray(candidate.organizations)
    && Array.isArray(candidate.interactions)
    && Array.isArray(candidate.projects)
    && Array.isArray(candidate.tasks)
    && Array.isArray(candidate.financeEntries)
    && Array.isArray(candidate.files)
    && Array.isArray(candidate.activity);
}

export function loadDemoState(storage: Pick<Storage, 'getItem'> | null | undefined): { state: DemoState; recovered: boolean } {
  if (!storage) return { state: createSeedState(), recovered: false };
  try {
    const raw = storage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return { state: createSeedState(), recovered: false };
    const parsed: unknown = JSON.parse(raw);
  return isState(parsed) ? { state: parsed, recovered: false } : { state: createSeedState(), recovered: true };
  } catch {
    return { state: createSeedState(), recovered: true };
  }
}

export function saveDemoState(storage: Pick<Storage, 'setItem'> | null | undefined, state: DemoState): void {
  if (!storage) return;
  try {
    storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // A private browsing quota failure should never break the demo UI.
  }
}

export function clearDemoState(storage: Pick<Storage, 'removeItem'> | null | undefined): void {
  try { storage?.removeItem(DEMO_STORAGE_KEY); } catch { /* local-only best effort */ }
}

export function resetDemoState(storage: (Pick<Storage, 'removeItem' | 'setItem'> | null | undefined)): DemoState {
  const state = createSeedState();
  clearDemoState(storage);
  saveDemoState(storage, state);
  return state;
}
