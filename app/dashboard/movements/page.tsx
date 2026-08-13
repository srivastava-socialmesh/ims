'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMovements } from '@/lib/hooks/useMovements';
import { formatDate } from '@/lib/utils/formatDate';
import { Plus, Filter } from 'lucide-react';

export default function MovementsPage() {
  const { movements, loading, error, fetchMovements } = useMovements();
  const [filters, setFilters] = useState({ item_id: '', area_id: '', type: '' });

  useEffect(() => {
    fetchMovements(filters);
  }, [filters]);

  const typeColors: Record<string, string> = {
    receipt: 'bg-green-100 text-green-800',
    issue: 'bg-red-100 text-red-800',
    transfer: 'bg-blue-100 text-blue-800',
    adjustment: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Movements</h1>
        <Link
          href="/dashboard/movements/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          New Movement
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          className="p-2 border rounded-md text-sm"
        >
          <option value="">All Types</option>
          <option value="receipt">Receipt</option>
          <option value="issue">Issue</option>
          <option value="transfer">Transfer</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <input
          type="text"
          placeholder="Item ID (optional)"
          value={filters.item_id}
          onChange={(e) => setFilters(prev => ({ ...prev, item_id: e.target.value }))}
          className="p-2 border rounded-md text-sm w-48"
        />
        <input
          type="text"
          placeholder="Area ID (optional)"
          value={filters.area_id}
          onChange={(e) => setFilters(prev => ({ ...prev, area_id: e.target.value }))}
          className="p-2 border rounded-md text-sm w-48"
        />
        <button
          onClick={() => setFilters({ item_id: '', area_id: '', type: '' })}
          className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300"
        >
          Clear
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">No movements</td></tr>
              ) : (
                movements.map((mov) => (
                  <tr key={mov.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(mov.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[mov.movement_type]}`}>
                        {mov.movement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mov.item?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mov.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mov.from_area?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mov.to_area?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mov.reference || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mov.performer?.full_name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
