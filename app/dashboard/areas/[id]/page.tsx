'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAreas } from '@/lib/hooks/useAreas';
import AreaForm from '@/components/forms/AreaForm';
import { useEffect, useState } from 'react';
import { Area, Stock } from '@/types/database.types';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function EditAreaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const { areas, managers, updateArea, loading } = useAreas();
  const [area, setArea] = useState<Area | null>(null);
  const [stock, setStock] = useState<Stock[]>([]);
  const [stockLoading, setStockLoading] = useState(true);

  useEffect(() => {
    const found = areas.find(a => a.id === id);
    if (found) setArea(found);
  }, [areas, id]);

  useEffect(() => {
    if (!id) return;
    const fetchStock = async () => {
      setStockLoading(true);
      try {
        const { data, error } = await supabase
          .from('stock')
          .select(`
            id,
            quantity,
            last_updated,
            item:items(id, name, sku, unit_of_measure)
          `)
          .eq('area_id', id)
          .order('item->name');
        if (error) throw error;
        setStock(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setStockLoading(false);
      }
    };
    fetchStock();
  }, [id]);

  const handleSubmit = async (data: any) => {
    await updateArea(id, data);
    router.push('/dashboard/areas');
  };

  if (loading) return <div>Loading...</div>;
  if (!area) return <div>Area not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Area: {area.name}</h1>

      <AreaForm
        initialData={area}
        managers={managers}
        onSubmit={handleSubmit}
        isEditing
      />

      {/* Stock in this area */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Stock in this Area</h2>
        {stockLoading ? (
          <div>Loading stock...</div>
        ) : stock.length === 0 ? (
          <div className="bg-white p-4 rounded shadow text-gray-500">No stock records for this area</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.item?.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{s.item?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.item?.unit_of_measure}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(s.last_updated).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
