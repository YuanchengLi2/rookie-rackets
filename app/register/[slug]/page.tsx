import type { Metadata } from 'next';
import Link from 'next/link';
import { RegistrationWizard } from '../../../components/public/registration-wizard';
import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import { getPublicProgramBySlug } from '../../../lib/data/public-programs';

export const metadata: Metadata = { title: 'Register | Rookie Rackets', robots: { index: false, follow: false } };

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let bundle = null;
  try { bundle = await getPublicProgramBySlug(slug); } catch { /* Wizard renders a retry-safe service state. */ }
  if (bundle && bundle.program.type !== 'camp') {
    return <main className="register-page"><SiteHeader active="/events" /><section className="register-shell shell"><h1>Registration is managed by the program partner</h1><p className="event-detail-disabled">Public registration through Rookie Rackets is only available for camps we host. Contact the partner organization for participation details.</p><Link className="button" href={`/events/${bundle.program.slug}`}>View program details</Link></section><SiteFooter /></main>;
  }
  return <main className="register-page"><SiteHeader active="/events" /><RegistrationWizard bundle={bundle} /><SiteFooter /></main>;
}
