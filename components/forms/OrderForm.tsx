'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Item, Area } from '@/types/database.types';
import { Plus, Trash2 } from 'lucide-react';

interface OrderFormProps {
  onSubmit: (data: any) => Promise<void>;
}

type OrderLineItem = {
  item_id: string;
  quantity: number;
  unit_price?: number;
};

export default function OrderForm({ onSubmit }: OrderFormProps) {
  const supabase = createClient();
  const [areas, setAreas] = useState<Area[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    order_type: 'purchase',
    area_id: '',
    supplier_customer: '',
    expected_delivery_date: '',
  });
  const [lineItems, setLineItems] = useState<OrderLineItem[]>([
    { item_id: '', quantity: 1, unit_price: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const [areasRes, itemsRes] = await Promise.all([
        supabase.from('areas').select('id, name, type').order('name'),
        supabase.from('items').select('id, name, sku, unit_of_measure').order('name'),
      ]);
      if (areasRes.data) setAreas(areasRes.data);
      if (itemsRes.data) setItems(itemsRes.data);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof OrderLineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, { item_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Validate line items
      const validItems = lineItems.filter(item => item.item_id && item.quantity > 0);
      if (validItems.length === 0) {
        throw new Error('Add at least one valid line item');
      }
      await onSubmit({
        ...formData,
        items: validItems,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow max-w-4xl">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Order Type *</label>
          <select
            name="order_type"
            value={formData.order_type}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="purchase">Purchase Order</option>
            <option value="work">Work Order</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Area *</label>
          <select
            name="area_id"
            value={formData.area_id}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier / Customer *</label>
          <input
            type="text"
            name="supplier_customer"
            value={formData.supplier_customer}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Expected Delivery Date</label>
          <input
            type="date"
            name="expected_delivery_date"
            value={formData.expected_delivery_date}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Line items section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Order Items</h3>
          <button
            type="button"
            onClick={addLineItem}
            className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 flex items-center gap-1"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={index} className="flex gap-2 items-end border-b pb-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600">Item</label>
                <select
                  value={item.item_id}
                  onChange={(e) => handleItemChange(index, 'item_id', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                  required
                >
                  <option value="">Select</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>{it.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-gray-600">Qty</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  min="0.01"
                  step="0.01"
                  className="w-full p-1 border rounded text-sm"
                  required
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-600">Unit Price</label>
                <input
                  type="number"
                  value={item.unit_price || ''}
                  onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeLineItem(index)}
                className="text-red-500 hover:text-red-700 p-1"
                disabled={lineItems.length === 1}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Order'}
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
