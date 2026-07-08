'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
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
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role ?? '';

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push(guestRedirect);
      return;
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      router.push(role === 'client' ? '/espace-client' : unauthorizedRedirect);
    }
  }, [status, role, router, allowedRoles, guestRedirect, unauthorizedRedirect]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#f5f8fa_0%,_#eef6fc_50%,_#f8fafc_100%)] px-4">
        <div className="state-card">
          <div className="loading-ring" />
          <p className="text-sm font-semibold text-slate-700">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;
  if (allowedRoles && !allowedRoles.includes(role)) return null;

  return <>{children}</>;
}
