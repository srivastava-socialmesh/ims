'use client';

import { useMovements } from '@/lib/hooks/useMovements';
import MovementForm from '@/components/forms/MovementForm';
import { useRouter } from 'next/navigation';

export default function NewMovementPage() {
  const { createMovement } = useMovements();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await createMovement(data);
    router.push('/dashboard/movements');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Record New Movement</h1>
      <MovementForm onSubmit={handleSubmit} />
    </div>
  );
}
