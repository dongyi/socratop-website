import EquipmentDetailClient from './EquipmentDetailClient';

// Generate static params for build
export async function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EquipmentDetailPage({ params }: Props) {
  const { id } = await params;
  return <EquipmentDetailClient equipmentId={id} />;
}