import { CampDetail } from '../../../../components/portal/camp-detail';

export default async function CampPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampDetail registrationId={id} />;
}
