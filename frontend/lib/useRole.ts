﻿'use client';

import { useEffect, useState } from 'react';

export type AppRole =
  | 'admin'
  | 'super_admin'
  | 'commercial'
  | 'agent_location'
  | 'sav'
  | 'atelier'
  | 'stock'
  | 'client'
  | '';

// Quelles hrefs sont visibles par rôle (null = toutes)
const ROLE_NAV_ACCESS: Record<string, string[] | null> = {
  admin:          null,
  super_admin:    null,
  commercial:     [
    '/dashboard', '/voitures', '/clients', '/ventes', '/locations',
    '/facturations', '/paiements', '/payments', '/documents',
    '/reporting', '/analytics', '/catalogue',
  ],
  agent_location: [
    '/dashboard', '/voitures', '/clients', '/locations', '/documents',
  ],
  sav: [
    '/dashboard', '/voitures', '/clients', '/sav', '/atelier',
    '/planning', '/entretiens', '/garanties', '/documents',
  ],
  atelier: [
    '/dashboard', '/atelier', '/planning', '/stock', '/entretiens',
  ],
  stock: [
    '/dashboard', '/stock', '/fournisseurs', '/documents', '/alertes',
  ],
  client: ['/espace-client'],
};

// Quels modules autorisent l'écriture (create/edit/delete)
const ROLE_WRITE_ACCESS: Record<string, string[] | null> = {
  admin:          null,
  super_admin:    null,
  commercial:     [
    'ventes', 'locations', 'facturations', 'paiements', 'documents',
    'clients', 'garanties',
  ],
  agent_location: ['locations', 'clients'],
  sav:            ['sav', 'garanties', 'entretiens'],
  atelier:        ['atelier', 'entretiens', 'stock'],
  stock:          ['stock', 'fournisseurs'],
  client:         [],
};

const ADMIN_ROLES: AppRole[] = ['admin', 'super_admin'];
const EMPLOYEE_ROLES: AppRole[] = [
  'admin', 'super_admin', 'commercial', 'agent_location', 'sav', 'atelier', 'stock',
];

export function useRole() {
  const [role, setRole] = useState<AppRole>('');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) setRole((JSON.parse(raw)?.role as AppRole) ?? '');
    } catch { /* ignore */ }
  }, []);

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

