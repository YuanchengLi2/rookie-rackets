import { ProjectDetail } from '../../../../components/staff/project-detail';

export default async function StaffProjectDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ProjectDetail projectId={id} />; }
