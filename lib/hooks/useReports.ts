import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { subDays, format } from 'date-fns';
import { useOrganization } from '@/lib/context/OrganizationContext';

type MovementTrend = { date: string; count: number };
type AreaStock = { area_name: string; total_quantity: number };
type LowStockItem = { item_id: string; item_name: string; sku: string; area_name: string; quantity: number; reorder_level: number };

export function useReports() {
  const supabase = createClient();
  const { orgId } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalItems, setTotalItems] = useState(0);
  const [totalAreas, setTotalAreas] = useState(0);
  const [totalMovements30d, setTotalMovements30d] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [movementTrend, setMovementTrend] = useState<MovementTrend[]>([]);
  const [areaStock, setAreaStock] = useState<AreaStock[]>([]);

  const fetchReports = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const { count: itemsCount, error: itemsErr } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      if (itemsErr) throw itemsErr;
      setTotalItems(itemsCount || 0);

      const { count: areasCount, error: areasErr } = await supabase
        .from('areas')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      if (areasErr) throw areasErr;
      setTotalAreas(areasCount || 0);

      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { count: movCount, error: movErr } = await supabase
        .from('movements')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .gte('created_at', thirtyDaysAgo);
      if (movErr) throw movErr;
      setTotalMovements30d(movCount || 0);

      const { data: stockData, error: stockErr } = await supabase
        .from('stock')
        .select(`
          quantity,
          items ( id, name, sku, reorder_level ),
          areas ( name )
        `)
        .eq('organization_id', orgId);
      if (stockErr) throw stockErr;
      const lowItems = (stockData || [])
        .filter((s: any) => s.items && s.quantity < s.items.reorder_level)
        .map((s: any) => ({
          item_id: s.items.id,
          item_name: s.items.name,
          sku: s.items.sku,
          area_name: s.areas?.name || 'Unknown',
          quantity: s.quantity,
          reorder_level: s.items.reorder_level,
        }));
      setLowStockItems(lowItems);

      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { data: trendData, error: trendErr } = await supabase
        .from('movements')
        .select('created_at')
        .eq('organization_id', orgId)
        .gte('created_at', sevenDaysAgo);
      if (trendErr) throw trendErr;
      const dateCounts: Record<string, number> = {};
      trendData?.forEach((m: any) => {
        const d = format(new Date(m.created_at), 'yyyy-MM-dd');
        dateCounts[d] = (dateCounts[d] || 0) + 1;
      });
      const trend: MovementTrend[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
        trend.push({ date: d, count: dateCounts[d] || 0 });
      }
      setMovementTrend(trend);

      const { data: areaData, error: areaErr } = await supabase
        .from('stock')
        .select(`
          areas ( name ),
          quantity
        `)
        .eq('organization_id', orgId);
      if (areaErr) throw areaErr;
      const areaMap: Record<string, number> = {};
      areaData?.forEach((s: any) => {
        const name = s.areas?.name || 'Unknown';
        areaMap[name] = (areaMap[name] || 0) + s.quantity;
      });
      const areaStockData = Object.entries(areaMap).map(([name, total]) => ({
        area_name: name,
        total_quantity: total,
      }));
      setAreaStock(areaStockData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) fetchReports();
  }, [orgId, fetchReports]);

  return {
    loading,
    error,
    totalItems,
    totalAreas,
    totalMovements30d,
    lowStockItems,
    movementTrend,
    areaStock,
    refresh: fetchReports,
  };
}
