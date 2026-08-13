'use client';

import { useInventory } from '@/lib/hooks/useInventory';
import ItemForm from '@/components/forms/ItemForm';
import { useRouter } from 'next/navigation';

export default function NewItemPage() {
  const { createItem, categories } = useInventory();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await createItem(data);
    router.push('/dashboard/inventory');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Item</h1>
      <ItemForm categories={categories} onSubmit={handleSubmit} />
    </div>
  );
}
