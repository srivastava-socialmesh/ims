'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, MapPin, MoveRight, ClipboardList, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login');
    });
  }, []);

  const stats = [
    { label: 'Total Items', value: '1,234', icon: Package, color: 'bg-blue-500' },
    { label: 'Areas', value: '12', icon: MapPin, color: 'bg-emerald-500' },
    { label: 'Movements (30d)', value: '342', icon: MoveRight, color: 'bg-purple-500' },
    { label: 'Open Orders', value: '18', icon: ClipboardList, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome message as page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, Admin 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your inventory today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.color} rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon size={36} className="text-white/30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <TrendingUp size={20} className="text-blue-500" />
            Quick Actions
          </h2>
          <div className="mt-4 space-y-2">
            <Link href="/dashboard/inventory/new" className="block p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-gray-700">
              ➕ Add New Item
            </Link>
            <Link href="/dashboard/movements/new" className="block p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-gray-700">
              📦 Record Movement
            </Link>
            <Link href="/dashboard/orders/new" className="block p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors text-gray-700">
              📋 Create Order
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <AlertCircle size={20} className="text-amber-500" />
            Stock Alerts
          </h2>
          <div className="mt-4 text-sm text-gray-600">
            <p>No critical low stock alerts today. ✅</p>
            <p className="mt-2 text-xs text-gray-400">Check Reports for detailed analysis.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
