import type { Metadata } from 'next';
import { ProgramDetail } from '../../../components/public/program-detail';
import { getPublicProgramBySlug } from '../../../lib/data/public-programs';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try { const bundle = await getPublicProgramBySlug(slug); return { title: bundle ? `${bundle.program.name} | Rookie Rackets` : 'Program | Rookie Rackets', description: bundle?.program.description ?? 'Rookie Rackets program details.' }; } catch { return { title: 'Program | Rookie Rackets' }; }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let bundle = null;
  try { bundle = await getPublicProgramBySlug(slug); } catch { /* ProgramDetail renders a safe unavailable state. */ }
  return <ProgramDetail bundle={bundle} />;
}
