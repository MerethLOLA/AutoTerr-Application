export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  super_admin: 'Super administrateur',
  manager: 'Manager',
  commercial: 'Commercial',
  agent_location: 'Agent Location',
  sav: 'Conseiller SAV',
  atelier: 'Technicien Atelier',
  stock: 'Responsable Parc',
  assurance: 'Assureur',
  accountant: 'Comptable',
  client: 'Client',
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

export const ROLE_COLORS: Record<string, string> = {
  admin:          'bg-red-100 text-red-700',
  super_admin:    'bg-red-100 text-red-700',
  manager:        'bg-sky-100 text-sky-700',
  commercial:     'bg-blue-100 text-blue-700',
  agent_location: 'bg-indigo-100 text-indigo-700',
  sav:            'bg-amber-100 text-amber-700',
  atelier:        'bg-orange-100 text-orange-700',
  stock:          'bg-purple-100 text-purple-700',
  assurance:      'bg-teal-100 text-teal-700',
  accountant:     'bg-cyan-100 text-cyan-700',
  client:         'bg-emerald-100 text-emerald-700',
};

export const DEFAULT_ROLE_BADGE_CLASS = 'bg-slate-100 text-slate-600';

export function getRoleBadgeClass(role?: string): string {
  return ROLE_COLORS[role ?? ''] ?? DEFAULT_ROLE_BADGE_CLASS;
}

export function getRoleLabel(role?: string): string {
  if (!role) return 'Rôle';
  return ROLE_LABELS[role] ?? role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
