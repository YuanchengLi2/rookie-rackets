import type { Metadata } from 'next';
import { ProgramDetail } from '../../../components/public/program-detail';
import { createSeedState } from '../../../lib/demo/seed';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = createSeedState().programs.find((item) => item.slug === slug);
  return { title: program ? `${program.name} | Rookie Rackets` : 'Program | Rookie Rackets', description: program?.description ?? 'Rookie Rackets program details.' };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!createSeedState().programs.some((program) => program.slug === slug)) return <ProgramDetail programId={slug} />;
  return <ProgramDetail programId={slug} />;
}
