'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Item, Area } from '@/types/database.types';

interface MovementFormProps {
  onSubmit: (data: any) => Promise<void>;
}

export default function MovementForm({ onSubmit }: MovementFormProps) {
  const supabase = createClient();
  const [items, setItems] = useState<Item[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    item_id: '',
    from_area_id: '',
    to_area_id: '',
    quantity: 1,
    movement_type: 'receipt',
    reference: '',
    note: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [itemsRes, areasRes] = await Promise.all([
        supabase.from('items').select('id, name, sku, unit_of_measure').order('name'),
        supabase.from('areas').select('id, name, type').order('name'),
      ]);
      if (itemsRes.data) setItems(itemsRes.data as any);
      if (areasRes.data) setAreas(areasRes.data as any);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to record movement');
    } finally {
      setLoading(false);
    }
  };

  const isReceipt = formData.movement_type === 'receipt';
  const isIssue = formData.movement_type === 'issue';
  const isTransfer = formData.movement_type === 'transfer';
  const isAdjustment = formData.movement_type === 'adjustment';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow max-w-2xl">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Movement Type *</label>
        <select
          name="movement_type"
          value={formData.movement_type}
          onChange={handleChange}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="receipt">Receipt (into a location)</option>
          <option value="issue">Issue (out of a location)</option>
          <option value="transfer">Transfer (between locations)</option>
          <option value="adjustment">Adjustment (manual stock correction)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Item *</label>
        <select
          name="item_id"
          value={formData.item_id}
          onChange={handleChange}
          required
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Select an item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.sku} - {item.name} ({item.unit_of_measure})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Quantity *</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
          min="0.01"
          step="0.01"
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {(isReceipt || isTransfer || isAdjustment) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Destination Area {isReceipt || isTransfer ? '*' : ''}
          </label>
          <select
            name="to_area_id"
            value={formData.to_area_id}
            onChange={handleChange}
            required={isReceipt || isTransfer}
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select destination</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
      )}

      {(isIssue || isTransfer || (isAdjustment && !formData.to_area_id)) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Source Area {isIssue || isTransfer ? '*' : ''}
          </label>
          <select
            name="from_area_id"
            value={formData.from_area_id}
            onChange={handleChange}
            required={isIssue || isTransfer}
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select source</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Reference (Order #, etc.)</label>
        <input
          type="text"
          name="reference"
          value={formData.reference}
          onChange={handleChange}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Note</label>
        <input
          type="text"
          name="note"
          value={formData.note}
          onChange={handleChange}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Recording...' : 'Record Movement'}
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
