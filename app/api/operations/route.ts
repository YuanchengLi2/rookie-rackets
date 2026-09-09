import { NextResponse } from 'next/server';
import { getPublicSupabaseEnv, getServiceRoleKey } from '../../../lib/supabase/env';

const forwardedHeaders = [
  'accept',
  'accept-profile',
  'content-profile',
  'content-type',
  'prefer',
  'range',
  'x-client-info',
  'x-upsert',
] as const;

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

function allowedPath(path: string) {
  return path.startsWith('/rest/v1/') || path.startsWith('/storage/v1/object/');
}

async function proxyOperationsRequest(request: Request) {
  const path = new URL(request.url).searchParams.get('path');
  if (!path || !allowedPath(path)) return error('Unsupported operations request.', 400);

  const { url } = getPublicSupabaseEnv();
  const serviceRoleKey = getServiceRoleKey();
  const headers = new Headers();
  for (const name of forwardedHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('apikey', serviceRoleKey);
  headers.set('authorization', `Bearer ${serviceRoleKey}`);
  if (path.startsWith('/rest/v1/')) {
    headers.set('accept-profile', 'public');
    headers.set('content-profile', 'public');
  }

  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();
  const upstream = await fetch(`${url}${path}`, {
    method,
    headers,
    body,
    cache: 'no-store',
    redirect: 'manual',
  });

  const responseHeaders = new Headers({ 'Cache-Control': 'no-store' });
  for (const name of ['accept-ranges', 'content-range', 'content-type', 'location']) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export const GET = proxyOperationsRequest;
export const POST = proxyOperationsRequest;
export const PUT = proxyOperationsRequest;
export const PATCH = proxyOperationsRequest;
export const DELETE = proxyOperationsRequest;
