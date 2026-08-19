'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileContext } from '@/context/ProfileContext';

// Client-side gate only — UX, not the security boundary. Every /admin/* Lambda
// independently checks focal_admin against the DB before doing anything, so
// bypassing this component grants no real access.
export function FocalAdminGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfileContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile?.focalAdmin) {
      router.replace('/');
    }
  }, [loading, profile, router]);

  if (loading || !profile?.focalAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
