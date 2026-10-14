import { ProgramDetail } from '../../../../components/staff/program-detail';
import { ProgramManagement } from '../../../../components/staff/program-management';

export default async function StaffProgramDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  return <><ProgramManagement programId={id} /><ProgramDetail programId={id} initialTab={query?.tab} /></>;
}
