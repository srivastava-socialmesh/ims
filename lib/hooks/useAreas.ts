import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Area, Profile } from '@/types/database.types';

export function useAreas() {
  const supabase = createClient();
  const [areas, setAreas] = useState<Area[]>([]);
  const [managers, setManagers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('areas')
        .select(`
          *,
          manager:profiles(id, full_name)
        `)
        .order('name');
      if (error) throw error;
      setAreas(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['admin', 'manager'])
        .order('full_name');
      if (error) throw error;
      setManagers(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const createArea = async (area: Omit<Area, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .insert(area)
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
    try {
      const { data, error } = await supabase
        .from('areas')
        .update(updates)
        .eq('id', id)
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
    try {
      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setAreas(prev => prev.filter(area => area.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchAreas();
    fetchManagers();
  }, []);

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
