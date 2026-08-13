'use client';

import { useState } from 'react';
import { Area, Profile } from '@/types/database.types';

type AreaFormData = Omit<Area, 'id' | 'created_at'>;

interface AreaFormProps {
  initialData?: Partial<AreaFormData>;
  managers: Profile[];
  onSubmit: (data: AreaFormData) => Promise<void>;
  isEditing?: boolean;
}

export default function AreaForm({ initialData, managers, onSubmit, isEditing }: AreaFormProps) {
  const [formData, setFormData] = useState<AreaFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'warehouse',
    location: initialData?.location || '',
    manager_id: initialData?.manager_id || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save area');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow max-w-2xl">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

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
        <label className="block text-sm font-medium text-gray-700">Type *</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="warehouse">Warehouse</option>
          <option value="site">Construction Site</option>
          <option value="workshop">Workshop</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location || ''}
          onChange={handleChange}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Address or GPS coordinates"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Manager</label>
        <select
          name="manager_id"
          value={formData.manager_id || ''}
          onChange={handleChange}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">None</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name || m.id}</option>
          ))}
        </select>
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
