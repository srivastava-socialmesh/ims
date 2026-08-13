'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInventory } from '@/lib/hooks/useInventory';
import ItemForm from '@/components/forms/ItemForm';
import { useEffect, useState } from 'react';
import { Item } from '@/types/database.types';

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { items, categories, updateItem, loading } = useInventory();
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    const found = items.find(i => i.id === id);
    if (found) setItem(found);
  }, [items, id]);

  const handleSubmit = async (data: any) => {
    await updateItem(id, data);
    router.push('/dashboard/inventory');
  };

  if (loading) return <div>Loading...</div>;
  if (!item) return <div>Item not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Item: {item.name}</h1>
      <ItemForm
        initialData={item}
        categories={categories}
        onSubmit={handleSubmit}
        isEditing
      />
    </div>
  );
}
