'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Package, 
  MapPin, 
  MoveRight, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
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
    { 
      label: 'Total Items', 
      value: '1,234', 
      icon: Package, 
      change: '+12%',
      changeType: 'up',
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Areas', 
      value: '12', 
      icon: MapPin, 
      change: '+2',
      changeType: 'up',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Movements (30d)', 
      value: '342', 
      icon: MoveRight, 
      change: '-5%',
      changeType: 'down',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      label: 'Open Orders', 
      value: '18', 
      icon: ClipboardList, 
      change: '+3',
      changeType: 'up',
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50'
    },
  ];

  // Recent activity data
  const recentActivities = [
    { action: 'New item added', item: 'MS Plate 6mm', time: '2 minutes ago', user: 'Sushant' },
    { action: 'Stock movement', item: 'Cement 50kg', time: '15 minutes ago', user: 'Ankita' },
    { action: 'Order created', item: 'PO-2024-001', time: '1 hour ago', user: 'Sushant' },
    { action: 'Stock alert', item: 'Welding Rod E6013', time: '3 hours ago', user: 'System' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-2xl font-bold">Welcome back, Admin 👋</h1>
        <p className="text-blue-100 mt-1">Here's what's happening with your inventory today.</p>
      </div>

      {/* Stats Grid with Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.changeType === 'up';
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-110 transition-transform duration-500`} />
              
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs font-medium ${isUp ? 'text-emerald-600' : 'text-red-600'} flex items-center gap-0.5`}>
                    {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <TrendingUp size={20} className="text-blue-500" />
            Quick Actions
          </h2>
          <div className="mt-4 space-y-2.5">
            <Link 
              href="/dashboard/inventory/new" 
              className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100/50"
            >
              <div className="p-2 rounded-lg bg-blue-500/10 group-hover:scale-110 transition-transform">
                <Package size={18} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Add New Item</span>
              <ArrowUpRight size={16} className="ml-auto text-gray-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <Link 
              href="/dashboard/movements/new" 
              className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 border border-emerald-100/50"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:scale-110 transition-transform">
                <MoveRight size={18} className="text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Record Movement</span>
              <ArrowUpRight size={16} className="ml-auto text-gray-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <Link 
              href="/dashboard/orders/new" 
              className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100/50"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 group-hover:scale-110 transition-transform">
                <ClipboardList size={18} className="text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Create Order</span>
              <ArrowUpRight size={16} className="ml-auto text-gray-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <Activity size={20} className="text-blue-500" />
            Recent Activity
          </h2>
          <div className="mt-4 space-y-3">
            {recentActivities.map((activity, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-all duration-200 border border-transparent hover:border-gray-100"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.item} • by {activity.user}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Alerts Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <AlertCircle size={20} className="text-amber-500" />
          Stock Alerts
        </h2>
        <div className="mt-4 flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">No critical low stock alerts today</p>
              <p className="text-xs text-gray-500">Check Reports for detailed analysis</p>
            </div>
          </div>
          <Link 
            href="/dashboard/reports" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View Reports
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
