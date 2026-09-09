'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getPublicSupabaseEnv } from './env';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function createOperationsFetch(supabaseUrl: string): typeof fetch {
  const origin = new URL(supabaseUrl).origin;
  return async (input, init) => {
    const request = input instanceof Request ? input : null;
    const target = new URL(request?.url ?? String(input), window.location.origin);
    const isOperationsRequest = target.origin === origin
      && (target.pathname.startsWith('/rest/v1/') || target.pathname.startsWith('/storage/v1/object/'));
    if (!isOperationsRequest) return globalThis.fetch(input, init);

    const headers = new Headers(request?.headers);
    if (init?.headers) new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    return globalThis.fetch(`/api/operations?path=${encodeURIComponent(`${target.pathname}${target.search}`)}`, {
      ...init,
      method: init?.method ?? request?.method,
      headers,
      body: init?.body ?? request?.body,
    });
  };
}

export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient;
  const { url, anonKey } = getPublicSupabaseEnv();
  browserClient = createBrowserClient(url, anonKey, {
    isSingleton: true,
    global: { fetch: createOperationsFetch(url) },
  });
  return browserClient;
}
