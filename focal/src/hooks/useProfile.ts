'use client';

import { useState, useEffect } from 'react';
import { UserProfile, ProfileApiResponse } from '@/types/profile';

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

/**
 * Hook to fetch and manage user profile data
 * 
 * Usage:
 * const { profile, loading, error, refetch } = useProfile();
 * 
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 * return <User email={profile?.personalInfo.email} />;
 */
export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
      });

      const data: ProfileApiResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      if (data.success && data.data) {
        setProfile(data.data);
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching profile';
      setError(errorMessage);
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<UserProfile>): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data: ProfileApiResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      if (data.success && data.data) {
        setProfile(data.data);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating profile';
      setError(errorMessage);
      console.error('Profile update error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
