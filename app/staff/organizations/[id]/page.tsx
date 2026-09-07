import { OrganizationDetail } from '../../../../components/staff/organization-detail';

export default async function StaffOrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <OrganizationDetail organizationId={id} />; }
