'use client';

import { useRole } from '@/lib/useRole';

interface RoleGuardProps {
  roles?: string[];
  module?: string;
  children: React.ReactNode;
}

export function RoleGuard({ roles, module, children }: RoleGuardProps) {
  const { role, canWrite } = useRole();
  if (!role) return null;
  if (module && !canWrite(module)) return null;
  if (roles && !roles.includes(role)) return null;
  return <>{children}</>;
}
