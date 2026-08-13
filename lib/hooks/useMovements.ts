import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Movement, Item, Area, Profile } from '@/types/database.types';
import { useOrganization } from '@/lib/context/OrganizationContext';

export type MovementWithDetails = Movement & {
  item: Item | null;
  from_area: Area | null;
  to_area: Area | null;
  performer: Profile | null;
};

export function useMovements() {
  const supabase = createClient();
  const { orgId } = useOrganization();
  const [movements, setMovements] = useState<MovementWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async (filters?: { item_id?: string; area_id?: string; type?: string }) => {
    if (!orgId) return;
    setLoading(true);
    try {
      let query = supabase
        .from('movements')
        .select(`
          *,
          item:items(*),
          from_area:areas!from_area_id(*),
          to_area:areas!to_area_id(*),
          performer:profiles(*)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.item_id) query = query.eq('item_id', filters.item_id);
      if (filters?.area_id) {
        query = query.or(`from_area_id.eq.${filters.area_id},to_area_id.eq.${filters.area_id}`);
      }
      if (filters?.type) query = query.eq('movement_type', filters.type);

      const { data, error } = await query;
      if (error) throw error;
      setMovements(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const createMovement = async (movementData: {
    item_id: string;
    from_area_id?: string | null;
    to_area_id?: string | null;
    quantity: number;
    movement_type: string;
    reference?: string;
    note?: string;
  }) => {
    if (!orgId) throw new Error('No organization');
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      const { data, error } = await supabase.rpc('record_movement', {
        p_item_id: movementData.item_id,
        p_from_area_id: movementData.from_area_id || null,
        p_to_area_id: movementData.to_area_id || null,
        p_quantity: movementData.quantity,
        p_movement_type: movementData.movement_type,
        p_reference: movementData.reference || null,
        p_performed_by: userId,
        p_note: movementData.note || null,
        p_organization_id: orgId, // we'll add this parameter to the function
      });
      if (error) throw error;
      await fetchMovements();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (orgId) fetchMovements();
  }, [orgId, fetchMovements]);

  return {
    movements,
    loading,
    error,
    fetchMovements,
    createMovement,
  };
}
