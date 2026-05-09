'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('LEARNER' | 'HR_ADMIN' | 'SUPER_ADMIN')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their respective default dashboard if they have the wrong role
        if (user.role === 'LEARNER') {
          router.push('/dashboard/learner');
        } else {
          router.push('/login');
        }
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-brand-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
