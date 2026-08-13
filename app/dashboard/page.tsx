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
    { label: 'Total Items', value: '1,234', icon: Package, color: 'from-blue-500 to-blue-600' },
    { label: 'Areas', value: '12', icon: MapPin, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Movements (30d)', value: '342', icon: MoveRight, color: 'from-purple-500 to-purple-600' },
    { label: 'Open Orders', value: '18', icon: ClipboardList, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero welcome */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold">Welcome back, Admin 👋</h1>
        <p className="text-indigo-100 mt-2">Here's what's happening with your inventory today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg hover:scale-[1.02] transition-transform duration-200`}
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
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Quick Actions
          </h2>
          <div className="mt-4 space-y-2">
            <Link href="/dashboard/inventory/new" className="block p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              ➕ Add New Item
            </Link>
            <Link href="/dashboard/movements/new" className="block p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              📦 Record Movement
            </Link>
            <Link href="/dashboard/orders/new" className="block p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              📋 Create Order
            </Link>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            Stock Alerts
          </h2>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            <p>No critical low stock alerts today. ✅</p>
            <p className="mt-2 text-xs text-gray-400">Check Reports for detailed analysis.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
