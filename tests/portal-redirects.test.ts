import { beforeEach, describe, expect, it, vi } from 'vitest';
import FormsPage from '../app/portal/forms/page';
import PaymentsPage from '../app/portal/payments/page';
import RegistrationsPage from '../app/portal/registrations/page';
import RegistrationDetailPage from '../app/portal/registrations/[id]/page';

const navigation = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock('next/navigation', () => navigation);

describe('legacy family portal routes', () => {
  beforeEach(() => navigation.redirect.mockClear());

  it.each([
    ['registrations', RegistrationsPage],
    ['forms', FormsPage],
    ['payments', PaymentsPage],
  ])('redirects %s to My Camps', (_name, page) => {
    page();
    expect(navigation.redirect).toHaveBeenCalledWith('/portal/camps');
  });

  it('keeps the camp id when redirecting an old registration detail link', async () => {
    await RegistrationDetailPage({ params: Promise.resolve({ id: 'registration-family-boys' }) });
    expect(navigation.redirect).toHaveBeenCalledWith('/portal/camps/registration-family-boys');
  });
});
