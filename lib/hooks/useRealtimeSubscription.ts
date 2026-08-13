import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription<T>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void
) {
  const supabase = createClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const newChannel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        {
          event: event,
          schema: 'public',
          table: table,
        },
        callback
      )
      .subscribe((status) => {
        console.log(`Realtime subscription for ${table} status:`, status);
      });

    setChannel(newChannel);

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [table, event]);

  return channel;
}
