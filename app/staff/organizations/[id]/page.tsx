import { OrganizationDetail } from '../../../../components/staff/organization-detail';
import { OrganizationManagement } from '../../../../components/staff/organization-management';

export default async function StaffOrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <><OrganizationManagement organizationId={id} /><OrganizationDetail organizationId={id} /></>; }
