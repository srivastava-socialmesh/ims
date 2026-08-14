import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';
import { useOrganization } from '@/lib/context/OrganizationContext';

export interface UserWithAuth extends Profile {
  auth_user?: {
    email: string;
    last_sign_in_at: string | null;
    confirmed_at: string | null;
  };
}

export function useUsers() {
  const supabase = createClient();
  const { orgId } = useOrganization();
  const [users, setUsers] = useState<UserWithAuth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      // Fetch all profiles in the organization
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get auth users data for email and confirmation status
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        // If we can't get auth users (might be permission issue), still show profiles
        setUsers(profiles || []);
      } else {
        // Merge profile data with auth data
        const merged = (profiles || []).map((profile: any) => {
          const authUser = authUsers.users.find((u: any) => u.id === profile.id);
          return {
            ...profile,
            auth_user: authUser ? {
              email: authUser.email,
              last_sign_in_at: authUser.last_sign_in_at,
              confirmed_at: authUser.confirmed_at,
            } : null,
          };
        });
        setUsers(merged);
      }

      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUser(currentProfile);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const inviteUser = async (email: string, role: string, fullName: string) => {
    if (!orgId) throw new Error('No organization');

    try {
      // Check if user already exists in the organization
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .eq('organization_id', orgId)
        .single();

      if (existing) {
        throw new Error('User already exists in this organization');
      }

      // Invite the user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
          role: role,
          organization_id: orgId,
          invited_by: currentUser?.id,
          invited_at: new Date().toISOString(),
          status: 'invited',
        },
      });

      if (authError) throw authError;

      // Fetch updated users list
      await fetchUsers();
      return authData;

    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    if (!orgId) throw new Error('No organization');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    if (!orgId) throw new Error('No organization');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)
        .eq('organization_id', orgId);

      if (error) throw error;

      // If status is 'active', update the auth user's confirmed_at
      if (status === 'active') {
        // Note: This is a simplified approach. In production, you might want to 
        // use a more sophisticated user management flow.
      }

      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeUser = async (userId: string) => {
    if (!orgId) throw new Error('No organization');

    // Prevent removing yourself
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === userId) {
      throw new Error('You cannot remove yourself');
    }

    try {
      // Remove the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .eq('organization_id', orgId);

      if (error) throw error;

      // Optional: Also remove or disable the auth user
      // This requires admin privileges
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchUsers();
    }
  }, [orgId, fetchUsers]);

  return {
    users,
    loading,
    error,
    currentUser,
    fetchUsers,
    inviteUser,
    updateUserRole,
    updateUserStatus,
    removeUser,
  };
}
