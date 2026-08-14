'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface OrganizationContextType {
  orgId: string | null;
  orgName: string | null;
}

const OrganizationContext = createContext<OrganizationContextType>({ 
  orgId: null, 
  orgName: null 
});

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrg = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get the user's profile with organization
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            organization_id,
            organizations:organization_id (
              name
            )
          `)
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setOrgId(profile.organization_id);
          // @ts-ignore - organizations is a joined object
          setOrgName(profile.organizations?.name || null);
        }
      }
    };
    fetchOrg();
  }, []);

  return (
    <OrganizationContext.Provider value={{ orgId, orgName }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  return useContext(OrganizationContext);
}
