'use client';

import { useAreas } from '@/lib/hooks/useAreas';
import AreaForm from '@/components/forms/AreaForm';
import { useRouter } from 'next/navigation';

export default function NewAreaPage() {
  const { managers, createArea } = useAreas();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await createArea(data);
    router.push('/dashboard/areas');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Site/Location</h1>
      <AreaForm managers={managers} onSubmit={handleSubmit} />
    </div>
  );
}
