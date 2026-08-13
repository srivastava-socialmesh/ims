import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'items' | 'areas' | 'movements' | 'orders' | 'stock' | 'categories';

export function useRealtimeSubscription(
  table: TableName,
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Subscribe to the table
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(payload.new);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old);
              break;
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [table, onInsert, onUpdate, onDelete]);
}
