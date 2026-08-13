'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const OrganizationContext = createContext<{ orgId: string | null }>({ orgId: null });

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrg = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
        setOrgId(data?.organization_id || null);
      }
    };
    fetchOrg();
  }, []);

  return (
    <OrganizationContext.Provider value={{ orgId }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  return useContext(OrganizationContext);
}
