import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, PATCH } from '../app/api/operations/route';

vi.mock('../lib/supabase/env', () => ({
  getPublicSupabaseEnv: () => ({ url: 'https://project.supabase.co', anonKey: 'anon-test' }),
  getServiceRoleKey: () => 'service-role-test',
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('open dashboard operations proxy', () => {
  it('rejects access outside database and storage operations', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await GET(new Request('http://localhost/api/operations?path=%2Fauth%2Fv1%2Fadmin%2Fusers'));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the service key server-side while forwarding workspace mutations', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('[]', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await PATCH(new Request(
      'http://localhost/api/operations?path=%2Frest%2Fv1%2Ftasks%3Fid%3Deq.1',
      { method: 'PATCH', headers: { 'content-type': 'application/json', authorization: 'Bearer anon-test' }, body: '{"status":"done"}' },
    ));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith('https://project.supabase.co/rest/v1/tasks?id=eq.1', expect.objectContaining({
      method: 'PATCH',
      headers: expect.any(Headers),
    }));
    const forwarded = fetchMock.mock.calls[0][1].headers as Headers;
    expect(forwarded.get('authorization')).toBe('Bearer service-role-test');
    expect(forwarded.get('accept-profile')).toBe('public');
    expect(forwarded.get('content-profile')).toBe('public');
  });
});
