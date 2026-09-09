'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getPublicSupabaseEnv } from './env';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient;
  const { url, anonKey } = getPublicSupabaseEnv();
  browserClient = createBrowserClient(url, anonKey, { isSingleton: true });
  return browserClient;
}
