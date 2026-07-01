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
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
          Vérification de la session…
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;
  if (allowedRoles && !allowedRoles.includes(role)) return null;

  return <>{children}</>;
}
