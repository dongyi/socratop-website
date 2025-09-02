'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
}

export default function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await getSupabase()
          .from('users_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Load user profile failed:', error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const getDisplayName = () => {
    if (profile?.display_name) {
      return profile.display_name;
    }
    
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  return {
    profile,
    loading,
    displayName: getDisplayName(),
    user
  };
}