'use client';

import { useSession } from 'next-auth/react';

export type AppRole =
  | 'admin'
  | 'super_admin'
  | 'manager'
  | 'commercial'
  | 'sav'
  | 'atelier'
  | 'accountant'
  | 'client'
  | '';

// Quelles hrefs sont visibles par rôle (null = toutes)
const ROLE_NAV_ACCESS: Record<string, string[] | null> = {
  admin:          null,
  super_admin:    null,
  manager: [
    '/dashboard', '/voitures', '/clients', '/ventes', '/locations',
    '/facturations', '/paiements', '/documents', '/atelier',
    '/reporting', '/analytics', '/catalogue', '/employes', '/demandes',
    '/assurances', '/sinistres', '/controles-techniques', '/alertes', '/garanties',
  ],
  commercial:     [
    '/dashboard', '/voitures', '/clients', '/ventes', '/locations',
    '/facturations', '/paiements', '/documents', '/alertes',
    '/reporting', '/analytics', '/catalogue',
  ],
  sav: [
    '/dashboard', '/voitures', '/clients', '/sav', '/atelier',
    '/planning', '/entretiens', '/garanties', '/documents',
  ],
  atelier: [
    '/dashboard', '/atelier', '/planning', '/stock', '/entretiens',
  ],
  accountant: [
    '/dashboard', '/paiements', '/facturations', '/reporting', '/documents',
  ],
  client: ['/espace-client'],
};

// Quels modules autorisent l'écriture (create/edit/delete)
const ROLE_WRITE_ACCESS: Record<string, string[] | null> = {
  admin:          null,
  super_admin:    null,
  manager: [
    'voitures', 'ventes', 'locations', 'facturations', 'paiements', 'documents',
    'clients', 'garanties', 'assurances', 'sinistres', 'atelier',
  ],
  commercial:     [
    'ventes', 'locations', 'facturations', 'paiements', 'documents',
    'clients', 'garanties',
  ],
  sav:            ['sav', 'garanties', 'entretiens'],
  atelier:        ['atelier', 'entretiens', 'stock'],
  accountant:     ['paiements', 'facturations'],
  client:         [],
};

const ADMIN_ROLES: AppRole[] = ['admin', 'super_admin'];
const EMPLOYEE_ROLES: AppRole[] = [
  'admin', 'super_admin', 'manager', 'commercial', 'sav', 'atelier', 'accountant',
];

export function useRole() {
  const { data: session } = useSession();
  const role = ((session?.user as any)?.role as AppRole) ?? '';

  const isAdmin     = (ADMIN_ROLES as string[]).includes(role);
  const isEmployee  = (EMPLOYEE_ROLES as string[]).includes(role);
  const isClient    = role === 'client';

  /** Vérifie si le rôle peut voir une route */
  function canAccessRoute(href: string): boolean {
    if (!role) return false;
    const allowed = ROLE_NAV_ACCESS[role];
    if (allowed === null || allowed === undefined) return true;
    return allowed.some((prefix) => href === prefix || href.startsWith(prefix + '/'));
  }

  /** Vérifie si le rôle peut écrire sur un module (slug ex: 'ventes', 'stock') */
  function canWrite(module: string): boolean {
    if (!role) return false;
    const allowed = ROLE_WRITE_ACCESS[role];
    if (allowed === null || allowed === undefined) return true;
    return allowed.includes(module);
  }

  /** Rôles autorisés pour les pages employé standard */
  const employeeRoles = EMPLOYEE_ROLES;

  return { role, isAdmin, isEmployee, isClient, canAccessRoute, canWrite, employeeRoles };
}

