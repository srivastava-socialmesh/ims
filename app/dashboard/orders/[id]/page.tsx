'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useOrders } from '@/lib/hooks/useOrders';
import { useEffect, useState } from 'react';
import { formatDateShort } from '@/lib/utils/formatDate';
import { createClient } from '@/lib/supabase/client';
import { OrderWithDetails } from '@/lib/hooks/useOrders';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders, fetchOrders, updateOrderStatus, receiveOrderItems } = useOrders();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [receiveData, setReceiveData] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const found = orders.find(o => o.id === id);
    setOrder(found || null);
    if (found) {
      // Initialize receive quantities
      const initial: Record<string, number> = {};
      found.items.forEach(item => {
        initial[item.id] = item.received_quantity || 0;
      });
      setReceiveData(initial);
    }
  }, [orders, id]);

  const handleReceive = async () => {
    // Build received items list with only items that have additional quantity
    const itemsToReceive = order?.items
      .filter(item => {
        const current = receiveData[item.id] || 0;
        return current > (item.received_quantity || 0);
      })
      .map(item => ({
        order_item_id: item.id,
        quantity: receiveData[item.id] - (item.received_quantity || 0),
      })) || [];

    if (itemsToReceive.length === 0) {
      setMessage('No new quantities to receive.');
      return;
    }

    try {
      await receiveOrderItems(id, itemsToReceive);
      setMessage('Items received successfully!');
      setTimeout(() => router.push('/dashboard/orders'), 1500);
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    }
  };

  if (!order) return <div>Loading or order not found...</div>;

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-gray-500">Created: {formatDateShort(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
            {order.status}
          </span>
          {order.order_type === 'purchase' && order.status === 'approved' && (
            <button
              onClick={handleReceive}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
            >
              Receive Items
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-medium">Type:</span> {order.order_type}</div>
          <div><span className="font-medium">Area:</span> {order.area?.name || '-'}</div>
          <div><span className="font-medium">Supplier/Customer:</span> {order.supplier_customer}</div>
          <div><span className="font-medium">Expected Delivery:</span> {order.expected_delivery_date ? formatDateShort(order.expected_delivery_date) : '-'}</div>
        </div>
      </div>

      {/* Line items */}
      <h2 className="text-xl font-semibold mb-3">Items</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Ordered</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
              {order.status === 'approved' && order.order_type === 'purchase' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Receive Now</th>
              )}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.item?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.received_quantity || 0}</td>
                {order.status === 'approved' && order.order_type === 'purchase' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input
                      type="number"
                      min={item.received_quantity || 0}
                      max={item.quantity}
                      step="0.01"
                      value={receiveData[item.id] || item.received_quantity || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setReceiveData(prev => ({ ...prev, [item.id]: Math.min(val, item.quantity) }));
                      }}
                      className="w-24 p-1 border rounded text-sm"
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message && <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded">{message}</div>}

      <div className="mt-6">
        <button onClick={() => router.back()} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
          Back
        </button>
      </div>
    </div>
  );
}
