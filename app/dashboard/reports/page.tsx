'use client';

import { useEffect, useState } from 'react';
import AIInsightsPanel from '@/components/ai-bi/AIInsightsPanel';
import { useOrganization } from '@/lib/context/OrganizationContext';
import { createClient } from '@/lib/supabase/client';
import { Brain, TrendingUp, Package, Users, AlertCircle, Sparkles } from 'lucide-react';
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
  Bar
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export default function ReportsPage() {
  const supabase = createClient();
  const { orgId } = useOrganization();
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'worker'>('admin');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalMovements: 0,
    totalOrders: 0,
    lowStockItems: 0,
    completionRate: 0
  });

  const [movementTrend, setMovementTrend] = useState([]);
  const [areaStock, setAreaStock] = useState([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserRole(profile.role as 'admin' | 'manager' | 'worker');
        }
      }
    };
    fetchUserRole();
  }, []);

  // AI insights only for admin and manager
  const showAIInsights = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="space-y-6">
      {/* AI Insights Panel - Full Width */}
      {showAIInsights && (
        <div className="lg:col-span-3">
          <AIInsightsPanel userType={userRole} />
        </div>
      )}
      // app/dashboard/reports/page.tsx (add this effect)
useEffect(() => {
  const generateInsights = async () => {
    if (orgId) {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { orgId, userType: userRole }
      })
      // Insights will be stored in the database automatically
      // Refresh the page to see them
    }
  }
  generateInsights()
}, [orgId]) 
      {/* Worker view shows simplified insights */}
      {userRole === 'worker' && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Your Inventory Overview</h2>
              <p className="text-xs text-gray-500">Real-time updates for your assigned areas</p>
            </div>
          </div>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>Track inventory movements at your assigned sites</p>
            <p className="text-xs mt-1">Contact your manager for full analytics access</p>
          </div>
        </div>
      )}
    </div>
  );
}
