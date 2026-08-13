'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Category } from '@/types/database.types';

export default function NewCategoryPage() {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => setCategories(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name, parent_id: parentId || null });
      if (error) throw error;
      router.push('/dashboard/inventory/categories');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Category</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-md space-y-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
        <div>
          <label className="block text-sm font-medium">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Parent Category</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">None</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
