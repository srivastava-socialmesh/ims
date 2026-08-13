'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, MapPin, MoveRight, ClipboardList } from 'lucide-react';

// Placeholder stats – will be replaced with real data later
export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Example: check session, but already protected by middleware
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login');
    });
  }, []);

  const stats = [
    { label: 'Total Items', value: '1,234', icon: Package },
    { label: 'Areas', value: '12', icon: MapPin },
    { label: 'Movements (30d)', value: '342', icon: MoveRight },
    { label: 'Open Orders', value: '18', icon: ClipboardList },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder chart – will be Recharts later */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Stock Movement (Last 7 Days)</h2>
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
          Chart coming soon (Recharts)
        </div>
      </div>
    </div>
  );
}
