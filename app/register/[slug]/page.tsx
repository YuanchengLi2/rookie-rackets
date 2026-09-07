import type { Metadata } from 'next';
import { RegistrationWizard } from '../../../components/public/registration-wizard';
import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import { createSeedState } from '../../../lib/demo/seed';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = createSeedState().programs.find((item) => item.slug === slug);
  return { title: program ? `Register · ${program.name} | Rookie Rackets` : 'Register | Rookie Rackets', robots: { index: false, follow: false } };
}

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // The client provider is the source of truth after hydration. Passing the
  // slug through lets a staff-created public demo program use this same route;
  // the wizard resolves it from shared state and renders a branded not-found
  // state when the record is unknown.
  return <main className="register-page"><SiteHeader active="/events" /><RegistrationWizard programId={slug} /><SiteFooter /></main>;
}
