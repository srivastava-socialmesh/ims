import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order, OrderItem, Item, Area, Profile } from '@/types/database.types';
import { useOrganization } from '@/lib/context/OrganizationContext';

export type OrderWithDetails = Order & {
  area: Area | null;
  created_by_user: Profile | null;
  items: (OrderItem & { item: Item | null })[];
};

export function useOrders() {
  const supabase = createClient();
  const { orgId } = useOrganization();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (filters?: { status?: string; type?: string; area_id?: string }) => {
    if (!orgId) return;
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          area:areas(*),
          created_by_user:profiles(*),
          items:order_items(
            *,
            item:items(*)
          )
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.type) query = query.eq('order_type', filters.type);
      if (filters?.area_id) query = query.eq('area_id', filters.area_id);

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const createOrder = async (orderData: {
    order_type: 'purchase' | 'work';
    area_id: string;
    supplier_customer: string;
    expected_delivery_date: string;
    items: { item_id: string; quantity: number; unit_price?: number }[];
  }) => {
    if (!orgId) throw new Error('No organization');
    try {
      const orderNumber = `ORD-${String(Date.now()).slice(-6)}`;
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_type: orderData.order_type,
          order_number: orderNumber,
          area_id: orderData.area_id,
          supplier_customer: orderData.supplier_customer,
          expected_delivery_date: orderData.expected_delivery_date,
          status: 'draft',
          created_by: userId,
          organization_id: orgId,
        })
        .select()
        .single();
      if (orderError) throw orderError;

      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price || null,
        received_quantity: 0,
        organization_id: orgId,
      }));
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      if (itemsError) throw itemsError;

      await fetchOrders();
      return order;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!orgId) throw new Error('No organization');
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('organization_id', orgId);
      if (error) throw error;
      await fetchOrders();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const receiveOrderItems = async (orderId: string, receivedItems: { order_item_id: string; quantity: number }[]) => {
    if (!orgId) throw new Error('No organization');
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('area_id')
        .eq('id', orderId)
        .eq('organization_id', orgId)
        .single();
      if (orderError) throw orderError;

      for (const item of receivedItems) {
        const { data: orderItem, error: oiError } = await supabase
          .from('order_items')
          .select('item_id, received_quantity, quantity')
          .eq('id', item.order_item_id)
          .eq('organization_id', orgId)
          .single();
        if (oiError) throw oiError;

        const newReceived = (orderItem.received_quantity || 0) + item.quantity;
        if (newReceived > orderItem.quantity) {
          throw new Error(`Received quantity exceeds ordered quantity for item`);
        }

        const { error: movError } = await supabase.rpc('record_movement', {
          p_item_id: orderItem.item_id,
          p_from_area_id: null,
          p_to_area_id: order.area_id,
          p_quantity: item.quantity,
          p_movement_type: 'receipt',
          p_reference: `PO-${orderId}`,
          p_performed_by: userId,
          p_note: `Received from order ${orderId}`,
          p_organization_id: orgId,
        });
        if (movError) throw movError;

        const { error: updateError } = await supabase
          .from('order_items')
          .update({ received_quantity: newReceived })
          .eq('id', item.order_item_id)
          .eq('organization_id', orgId);
        if (updateError) throw updateError;
      }

      const { data: itemsData, error: itemsCheckError } = await supabase
        .from('order_items')
        .select('quantity, received_quantity')
        .eq('order_id', orderId)
        .eq('organization_id', orgId);
      if (itemsCheckError) throw itemsCheckError;
      const allReceived = itemsData.every(oi => oi.received_quantity >= oi.quantity);
      if (allReceived) {
        await updateOrderStatus(orderId, 'completed');
      }

      await fetchOrders();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!orgId) throw new Error('No organization');
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
        .eq('organization_id', orgId);
      if (error) throw error;
      await fetchOrders();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (orgId) fetchOrders();
  }, [orgId, fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    receiveOrderItems,
    deleteOrder,
  };
}
