import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Item, Category } from '@/types/database.types';

export function useInventory() {
  const supabase = createClient();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('items')
        .select(`
          *,
          category:categories(*)
        `);

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
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const createItem = async (item: Omit<Item, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert(item)
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
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
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
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

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
