'use client';

import { useProfileContext } from '@/context/ProfileContext';

/**
 * Hook to access shared profile data.
 * Fetched once by ProfileProvider, shared across all components.
 *
 * Usage:
 * const { profile, loading, error, refetch } = useProfile();
 */
export function useProfile() {
  return useProfileContext();
}
