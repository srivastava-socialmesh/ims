import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Item, Category } from '@/types/database.types';
import { useOrganization } from '@/lib/context/OrganizationContext';

export function useInventory() {
  const supabase = createClient();
  const { orgId } = useOrganization();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (search?: string) => {
    if (!orgId) return;
    setLoading(true);
    try {
      let query = supabase
        .from('items')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('organization_id', orgId);

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query.order('name');
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const fetchCategories = useCallback(async () => {
    if (!orgId) return;
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('organization_id', orgId)
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, [orgId]);

  const createItem = async (item: Omit<Item, 'id' | 'created_at'>) => {
    if (!orgId) throw new Error('No organization');
    try {
      const { data, error } = await supabase
        .from('items')
        .insert({ ...item, organization_id: orgId })
        .select()
        .single();
      if (error) throw error;
      setItems(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    if (!orgId) throw new Error('No organization');
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single();
      if (error) throw error;
      setItems(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    if (!orgId) throw new Error('No organization');
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);
      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchItems();
      fetchCategories();
    }
  }, [orgId, fetchItems, fetchCategories]);

  return {
    items,
    categories,
    loading,
    error,
    fetchItems,
    fetchCategories,
    createItem,
    updateItem,
    deleteItem,
  };
}
