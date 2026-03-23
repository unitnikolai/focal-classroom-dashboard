'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

function getCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const check = await fetch('/api/auth/check', { credentials: 'include' });

        if (check.ok) {
          if (!cancelled) setAuthState('authenticated');
          return;
        }

        const body = await check.json().catch(() => ({}));

        if (check.status === 401 && body.error === 'TOKEN_EXPIRED') {
          const refresh = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-csrf-token': getCookie('csrfToken') ?? '' },
          });

          if (refresh.ok) {
            if (!cancelled) setAuthState('authenticated');
            return;
          }
        }
      } catch {
        // network failure — fall through to unauthenticated
      }

      if (!cancelled) setAuthState('unauthenticated');
    };

    checkAuth();
    return () => { cancelled = true; };
  }, []); // runs once on mount only

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.replace('/signin');
    }
  }, [authState, router]);

  if (authState === 'loading' || authState === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}