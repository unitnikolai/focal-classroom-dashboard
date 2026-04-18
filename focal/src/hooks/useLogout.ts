'use client';

import { signOut } from '@/lib/auth-client';
import { useState } from 'react';

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
}
