import { ProgramDetail } from '../../../../components/staff/program-detail';

export default async function StaffProgramDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  return <ProgramDetail programId={id} initialTab={query?.tab} />;
}
