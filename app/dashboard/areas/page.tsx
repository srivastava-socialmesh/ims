'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAreas } from '@/lib/hooks/useAreas';
import { formatDateShort } from '@/lib/utils/formatDate';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

export default function AreasPage() {
  const { areas, loading, error, deleteArea } = useAreas();
  const [search, setSearch] = useState('');

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(search.toLowerCase()) ||
    area.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Delete this area? This will also remove stock records. Continue?')) {
      try {
        await deleteArea(id);
      } catch (err) {
        alert('Failed to delete area');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Areas</h1>
        <Link
          href="/dashboard/areas/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Area
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAreas.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No areas found</div>
          ) : (
            filteredAreas.map((area) => {
              const areaWithManager = area as any;
              return (
                <div key={area.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{area.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={14} />
                        {area.location || 'No location'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Type: <span className="capitalize">{area.type}</span>
                      </p>
                      {areaWithManager.manager && (
                        <p className="text-sm text-gray-500 mt-1">
                          Manager: {areaWithManager.manager.full_name || 'Unassigned'}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Created: {formatDateShort(area.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/areas/${area.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(area.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
