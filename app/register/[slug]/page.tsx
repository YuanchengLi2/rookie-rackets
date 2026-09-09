import type { Metadata } from 'next';
import { RegistrationWizard } from '../../../components/public/registration-wizard';
import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import { getPublicProgramBySlug } from '../../../lib/data/public-programs';

export const metadata: Metadata = { title: 'Register | Rookie Rackets', robots: { index: false, follow: false } };

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let bundle = null;
  try { bundle = await getPublicProgramBySlug(slug); } catch { /* Wizard renders a retry-safe service state. */ }
  return <main className="register-page"><SiteHeader active="/events" /><RegistrationWizard bundle={bundle} /><SiteFooter /></main>;
}
