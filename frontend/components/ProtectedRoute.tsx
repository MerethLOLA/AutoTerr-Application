'use client';

import { readStoredAuth } from '@/lib/auth-storage';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  guestRedirect?: string;
  unauthorizedRedirect?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  guestRedirect = '/login/employee',
  unauthorizedRedirect = '/dashboard',
}: ProtectedRouteProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const { token, user } = readStoredAuth();

    if (!token || !user) {
      return false;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    const { token, user } = readStoredAuth();

    if (!token || !user) {
      setAllowed(false);
      router.push(guestRedirect);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      setAllowed(false);
      router.push(user.role === 'client' ? '/espace-client' : unauthorizedRedirect);
      return;
    }

    setAllowed(true);
  }, [router, allowedRoles, guestRedirect, unauthorizedRedirect]);

  if (allowed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
          Verification de la session...
        </div>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
