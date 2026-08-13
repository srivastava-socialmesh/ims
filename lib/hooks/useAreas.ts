import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Area, Profile } from '@/types/database.types';
import { useOrganization } from '@/lib/context/OrganizationContext';

export function useAreas() {
  const supabase = createClient();
  const { orgId } = useOrganization();
  const [areas, setAreas] = useState<Area[]>([]);
  const [managers, setManagers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('areas')
        .select(`
          *,
          manager:profiles(id, full_name)
        `)
        .eq('organization_id', orgId)
        .order('name');
      if (error) throw error;
      setAreas(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const fetchManagers = useCallback(async () => {
    if (!orgId) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('organization_id', orgId)
        .in('role', ['admin', 'manager'])
        .order('full_name');
      if (error) throw error;
      setManagers(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, [orgId]);

  const createArea = async (area: Omit<Area, 'id' | 'created_at'>) => {
    if (!orgId) throw new Error('No organization');
    try {
      const { data, error } = await supabase
        .from('areas')
        .insert({ ...area, organization_id: orgId })
        .select()
        .single();
      if (error) throw error;
      setAreas(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateArea = async (id: string, updates: Partial<Area>) => {
    if (!orgId) throw new Error('No organization');
    try {
      const { data, error } = await supabase
        .from('areas')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single();
      if (error) throw error;
      setAreas(prev => prev.map(area => area.id === id ? data : area));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteArea = async (id: string) => {
    if (!orgId) throw new Error('No organization');
    try {
      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);
      if (error) throw error;
      setAreas(prev => prev.filter(area => area.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchAreas();
      fetchManagers();
    }
  }, [orgId, fetchAreas, fetchManagers]);

  return {
    areas,
    managers,
    loading,
    error,
    fetchAreas,
    fetchManagers,
    createArea,
    updateArea,
    deleteArea,
  };
}
