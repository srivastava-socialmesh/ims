'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders } from '@/lib/hooks/useOrders';
import { formatDateShort } from '@/lib/utils/formatDate';
import { Plus, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function OrdersPage() {
  const { orders, loading, error, updateOrderStatus, deleteOrder } = useOrders();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const filtered = orders.filter(o => {
    if (filterStatus && o.status !== filterStatus) return false;
    if (filterType && o.order_type !== filterType) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateOrderStatus(id, status as any);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link
          href="/dashboard/orders/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-md text-sm"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border rounded-md text-sm"
        >
          <option value="">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="work">Work</option>
        </select>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier/Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No orders</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{order.order_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.supplier_customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.area?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.expected_delivery_date ? formatDateShort(order.expected_delivery_date) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:text-blue-800">
                          <Eye size={18} />
                        </Link>
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <>
                            {order.status === 'draft' && (
                              <button onClick={() => handleStatusChange(order.id, 'pending')} className="text-yellow-600 hover:text-yellow-800" title="Mark Pending">
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {order.status === 'pending' && (
                              <button onClick={() => handleStatusChange(order.id, 'approved')} className="text-blue-600 hover:text-blue-800" title="Approve">
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {order.status === 'approved' && order.order_type === 'purchase' && (
                              <button onClick={() => window.location.href = `/dashboard/orders/${order.id}?action=receive`} className="text-green-600 hover:text-green-800" title="Receive">
                                <CheckCircle size={18} />
                              </button>
                            )}
                            <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="text-red-600 hover:text-red-800" title="Cancel">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button onClick={() => { if (confirm('Delete order?')) deleteOrder(order.id); }} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
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
