import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { subDays, format } from 'date-fns';

type MovementTrend = { date: string; count: number };
type AreaStock = { area_name: string; total_quantity: number };
type LowStockItem = { item_id: string; item_name: string; sku: string; area_name: string; quantity: number; reorder_level: number };

export function useReports() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalItems, setTotalItems] = useState(0);
  const [totalAreas, setTotalAreas] = useState(0);
  const [totalMovements30d, setTotalMovements30d] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [movementTrend, setMovementTrend] = useState<MovementTrend[]>([]);
  const [areaStock, setAreaStock] = useState<AreaStock[]>([]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Total items
      const { count: itemsCount, error: itemsErr } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true });
      if (itemsErr) throw itemsErr;
      setTotalItems(itemsCount || 0);

      // 2. Total areas
      const { count: areasCount, error: areasErr } = await supabase
        .from('areas')
        .select('*', { count: 'exact', head: true });
      if (areasErr) throw areasErr;
      setTotalAreas(areasCount || 0);

      // 3. Total movements in last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { count: movCount, error: movErr } = await supabase
        .from('movements')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);
      if (movErr) throw movErr;
      setTotalMovements30d(movCount || 0);

      // 4. Low stock items: fetch stock with item and area, then filter in JS
      const { data: stockData, error: stockErr } = await supabase
        .from('stock')
        .select(`
          id,
          quantity,
          item:items(id, name, sku, reorder_level),
          area:areas(name)
        `);
      if (stockErr) throw stockErr;
      const lowItems = stockData
        ?.filter((s: any) => s.item && s.quantity < s.item.reorder_level)
        .map((s: any) => ({
          item_id: s.item.id,
          item_name: s.item.name,
          sku: s.item.sku,
          area_name: s.area?.name || 'Unknown',
          quantity: s.quantity,
          reorder_level: s.item.reorder_level,
        })) || [];
      setLowStockItems(lowItems);

      // 5. Movement trend: last 7 days
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { data: trendData, error: trendErr } = await supabase
        .from('movements')
        .select('created_at')
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

      // 6. Stock by area
      const { data: stockAreaData, error: areaErr } = await supabase
        .from('stock')
        .select(`
          area:areas(name),
          quantity
        `);
      if (areaErr) throw areaErr;
      const areaMap: Record<string, number> = {};
      stockAreaData?.forEach((s: any) => {
        const name = s.area?.name || 'Unknown';
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
  }, []);

  useEffect(() => {
    fetchReports();
  }, []);

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
