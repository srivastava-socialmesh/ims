'use client';

import { useReports } from '@/lib/hooks/useReports';
import { Package, MapPin, MoveRight, AlertTriangle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ReportsPage() {
  const {
    loading,
    error,
    totalItems,
    totalAreas,
    totalMovements30d,
    lowStockItems,
    movementTrend,
    areaStock,
    refresh,
  } = useReports();

  const stats = [
    { label: 'Total Items', value: totalItems, icon: Package },
    { label: 'Total Areas', value: totalAreas, icon: MapPin },
    { label: 'Movements (30d)', value: totalMovements30d, icon: MoveRight },
    { label: 'Low Stock Alerts', value: lowStockItems.length, icon: AlertTriangle },
  ];

  if (loading) return <div className="text-center py-8">Loading reports...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <button onClick={refresh} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon size={32} className="text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Movement trend */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Movement Trend (Last 7 Days)</h2>
          {movementTrend.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={movementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stock by area pie */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Stock Distribution by Area</h2>
          {areaStock.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">No stock data</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={areaStock}
                  dataKey="total_quantity"
                  nameKey="area_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ area_name, percent }) => `${area_name} ${(percent * 100).toFixed(0)}%`}
                >
                  {areaStock.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Low stock table */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Low Stock Alerts</h2>
        {lowStockItems.length === 0 ? (
          <div className="text-gray-500">All items are adequately stocked 👍</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStockItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.item_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.area_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.reorder_level}</td>
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
