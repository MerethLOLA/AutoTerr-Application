'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/login/employee');
      return;
    }

    if (requiredRole) {
      try {
        const userData = JSON.parse(user);
        if (userData.role !== requiredRole) {
          router.push('/dashboard');
          return;
        }
      } catch {
        router.push('/login/employee');
        return;
      }
    }

    setAllowed(true);
  }, [router, requiredRole]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
          Verification de la session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
