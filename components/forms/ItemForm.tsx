'use client';

import { useState } from 'react';
import { Item, Category } from '@/types/database.types';

type ItemFormData = Omit<Item, 'id' | 'created_at' | 'category'> & {
  category_id: string | null;
};

interface ItemFormProps {
  initialData?: Partial<ItemFormData>;
  categories: Category[];
  onSubmit: (data: ItemFormData) => Promise<void>;
  isEditing?: boolean;
}

export default function ItemForm({ initialData, categories, onSubmit, isEditing }: ItemFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    sku: initialData?.sku || '',
    category_id: initialData?.category_id || null,
    unit_of_measure: initialData?.unit_of_measure || 'pcs',
    reorder_level: initialData?.reorder_level || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reorder_level' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow max-w-2xl">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">SKU *</label>
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          required
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          name="category_id"
          value={formData.category_id || ''}
          onChange={handleChange}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">None</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Unit of Measure *</label>
        <select
          name="unit_of_measure"
          value={formData.unit_of_measure}
          onChange={handleChange}
          required
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="kg">kg</option>
          <option value="m">m</option>
          <option value="pcs">pcs</option>
          <option value="tons">tons</option>
          <option value="l">l</option>
          <option value="m2">m2</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reorder Level</label>
        <input
          type="number"
          name="reorder_level"
          value={formData.reorder_level}
          onChange={handleChange}
          step="0.01"
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
