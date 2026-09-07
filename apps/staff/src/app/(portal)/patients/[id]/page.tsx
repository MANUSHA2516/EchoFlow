import { PatientDetailScreen } from '@/components/patient-screens';

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientDetailScreen id={id} />;
}
