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

// Define types for the data structures
interface MovementTrendItem {
  date: string;
  count: number;
  quantity: number;
}

interface AreaStockItem {
  name: string;
  value: number;
}

export default function ReportsPage() {
  const supabase = createClient();
  const { orgId } = useOrganization();
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'worker'>('admin');
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalMovements: 0,
    totalOrders: 0,
    lowStockItems: 0,
    completionRate: 0
  });

  const [movementTrend, setMovementTrend] = useState<MovementTrendItem[]>([]);
  const [areaStock, setAreaStock] = useState<AreaStockItem[]>([]);

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, []);

  // Auto-generate AI insights when orgId and userRole are available
  useEffect(() => {
    const generateInsights = async () => {
      if (!orgId || !userRole || (userRole !== 'admin' && userRole !== 'manager')) {
        return;
      }

      setGeneratingInsights(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const { data, error } = await supabase.functions.invoke('ai-insights', {
          body: { 
            orgId, 
            userType: userRole 
          },
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });

        if (error) {
          console.error('Error generating insights:', error);
        } else {
          console.log('AI Insights generated successfully:', data);
        }
      } catch (err) {
        console.error('Failed to generate insights:', err);
      } finally {
        setGeneratingInsights(false);
      }
    };

    generateInsights();
  }, [orgId, userRole]);

  // Fetch stats and charts data
  useEffect(() => {
    const fetchStats = async () => {
      if (!orgId) return;
      
      try {
        // Fetch total items
        const { count: itemsCount } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId);
        
        // Fetch total movements (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: movementsCount } = await supabase
          .from('movements')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .gte('created_at', thirtyDaysAgo.toISOString());
        
        // Fetch total orders
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId);
        
        // Fetch low stock items - fetch all stock with item details and filter client-side
        const { data: stockData } = await supabase
          .from('stock')
          .select(`
            quantity,
            items!inner (
              id,
              name,
              reorder_level
            )
          `)
          .eq('items.organization_id', orgId);
        
        // Filter low stock items in JavaScript
        const lowStockItems = (stockData || []).filter(
          (s: any) => s.items && s.quantity < s.items.reorder_level
        );
        
        // Fetch movement trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: trendData } = await supabase
          .from('movements')
          .select('created_at, quantity')
          .eq('organization_id', orgId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true });
        
        // Process trend data
        const trendMap: Record<string, { count: number; quantity: number }> = {};
        trendData?.forEach((m: any) => {
          const date = new Date(m.created_at).toISOString().split('T')[0];
          if (!trendMap[date]) {
            trendMap[date] = { count: 0, quantity: 0 };
          }
          trendMap[date].count += 1;
          trendMap[date].quantity += m.quantity || 0;
        });
        
        const trend: MovementTrendItem[] = Object.entries(trendMap).map(([date, data]) => ({
          date,
          count: data.count,
          quantity: data.quantity
        }));
        
        // Fetch area stock distribution
        const { data: areaStockData } = await supabase
          .from('stock')
          .select(`
            quantity,
            areas!inner (
              name
            )
          `)
          .eq('areas.organization_id', orgId);
        
        const areaMap: Record<string, number> = {};
        areaStockData?.forEach((s: any) => {
          const name = s.areas?.name || 'Unknown';
          areaMap[name] = (areaMap[name] || 0) + (s.quantity || 0);
        });
        
        const areaData: AreaStockItem[] = Object.entries(areaMap).map(([name, value]) => ({
          name,
          value
        }));

        // Calculate completion rate from orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('status')
          .eq('organization_id', orgId);
        
        const completedOrders = (ordersData || []).filter(o => o.status === 'completed').length;
        const totalOrders = ordersData?.length || 0;
        const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

        setStats({
          totalItems: itemsCount || 0,
          totalMovements: movementsCount || 0,
          totalOrders: totalOrders,
          lowStockItems: lowStockItems.length,
          completionRate: Math.round(completionRate)
        });
        
        setMovementTrend(trend);
        setAreaStock(areaData);
        
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, [orgId]);

  // AI insights only for admin and manager
  const showAIInsights = userRole === 'admin' || userRole === 'manager';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Panel - Full Width */}
      {showAIInsights && (
        <div className="lg:col-span-3">
          <AIInsightsPanel userType={userRole} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalItems}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Package size={20} className="text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Movements (30d)</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalMovements}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <Users size={20} className="text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.lowStockItems}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <AlertCircle size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Movement Trend Chart */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Movement Trend</h2>
          {movementTrend.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No movement data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={movementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Area Stock Distribution */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Stock by Area</h2>
          {areaStock.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No stock data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={areaStock}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
