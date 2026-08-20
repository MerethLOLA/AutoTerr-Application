'use client';

import ConfirmDialog from '@/components/ConfirmDialog';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { useRealtime } from '@/components/RealtimeProvider';
import { useEffect, useState } from 'react';
import { ROLE_OPTIONS, getRoleBadgeClass, getRoleLabel } from '@/lib/roleLabels';

const ROLES = ROLE_OPTIONS;

interface Employe { id: number; nom: string; prenom?: string; poste?: string; }
interface User {
  id: number; name: string; username: string; email: string;
  role: string; statut: string; last_login?: string;
  employe?: { id: number; nom: string; prenom?: string; poste?: string };
}

const emptyForm = { name: '', username: '', email: '', password: '', role: 'commercial', id_employe: '' };

export default function UtilisateursPage() {
  const [users, setUsers]           = useState<User[]>([]);
  const [employes, setEmployes]     = useState<Employe[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<User | null>(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const { addToast } = useRealtime();

  async function load() {
    setLoading(true);
    try {
      const [usersRes, empRes] = await Promise.all([
        apiClient.get<any>('/admin/users'),
        apiClient.get<Employe[]>('/admin/employes-sans-compte'),
      ]);
      setUsers(usersRes.data ?? []);
      setEmployes(empRes);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setError('');
    setFieldErrors({});
    setShowForm(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, username: u.username, email: u.email, password: '', role: u.role, id_employe: u.employe ? String(u.employe.id) : '' });
    // L'employé déjà lié à cet utilisateur n'apparaît pas dans /admin/employes-sans-compte (il a déjà un compte) :
    // on l'ajoute manuellement à la liste pour qu'il reste sélectionnable dans le formulaire.
    if (u.employe && !employes.some((e) => e.id === u.employe!.id)) {
      setEmployes((prev) => [...prev, u.employe as Employe]);
    }
    setError('');
    setFieldErrors({});
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      const payload: any = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.id_employe) delete payload.id_employe;
      if (editing) {
        await apiClient.put(`/admin/users/${editing.id}`, payload);
      } else {
        await apiClient.post('/admin/users', payload);
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      if (err?.details) {
        const mapped: Record<string, string> = {};
        Object.entries(err.details).forEach(([k, v]) => { mapped[k] = (v as string[])[0]; });
        setFieldErrors(mapped);
      }
      setError(err?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(u: User) {
    const nextStatut = u.statut === 'actif' ? 'inactif' : 'actif';
    setTogglingStatus(u.id);
    try {
      await apiClient.put(`/admin/users/${u.id}`, { statut: nextStatut });
      await load();
      addToast({
        niveau: 'success',
        titre: nextStatut === 'actif' ? 'Compte activé' : 'Compte désactivé',
        message: `${u.name} est maintenant ${nextStatut === 'actif' ? 'actif' : 'inactif'}.`,
      });
    } catch (err: any) {
      addToast({ niveau: 'danger', titre: 'Échec', message: err?.message || 'Erreur lors du changement de statut' });
    } finally {
      setTogglingStatus(null);
    }
  }

  async function confirmDeleteUser() {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await apiClient.delete(`/admin/users/${deleteTarget.id}`);
      await load();
      addToast({ niveau: 'success', titre: 'Compte supprimé', message: `Le compte de ${deleteTarget.name} a été supprimé.` });
      setDeleteTarget(null);
    } catch (err: any) {
      addToast({ niveau: 'danger', titre: 'Échec de la suppression', message: err?.message || 'Erreur suppression' });
    } finally {
      setDeleting(null);
    }
  }

  function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
      <div>
        <label className="mb-1 block text-xs font-semibold text-[#111827]">{label}</label>
        {children}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <DashboardLayout allowedRoles={['admin', 'super_admin']}>
      <div className="mx-auto max-w-5xl space-y-6">

        <div className="page-header">
          <div>
            <h1 className="page-title mt-1">Utilisateurs</h1>
            <p className="page-subtitle">Gestion des comptes et des accès.</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            + Ajouter un utilisateur
          </button>
        </div>

        {/* Liste */}
        <div className="surface-panel overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#6b7280]">Chargement…</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#6b7280]">
              <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>Aucun utilisateur</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-[#f8fafc] text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Identifiant</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Employé lié</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Dernière connexion</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#111827]">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#374151]">{u.username}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${getRoleBadgeClass(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {u.employe ? `${u.employe.prenom ?? ''} ${u.employe.nom}`.trim() : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        disabled={togglingStatus === u.id}
                        title="Cliquer pour changer le statut"
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold transition hover:opacity-75 disabled:opacity-40 ${u.statut === 'actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}
                      >
                        {togglingStatus === u.id ? '…' : u.statut}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9ca3af]">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="text-xs text-[#1d6fb8] hover:underline">Modifier</button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          disabled={deleting === u.id}
                          className="text-xs text-red-500 hover:underline disabled:opacity-40"
                        >
                          {deleting === u.id ? '…' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal formulaire */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-base font-bold text-[#111827]">
                  {editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-[#9ca3af] hover:text-[#374151]">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                {error && (
                  <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nom complet *" error={fieldErrors.name}>
                    <input
                      className="field-control"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Prénom Nom"
                      required
                    />
                  </Field>
                  <Field label="Identifiant (username) *" error={fieldErrors.username}>
                    <input
                      className="field-control font-mono"
                      value={form.username}
                      onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                      placeholder="ex: dupont_marie"
                      required
                    />
                  </Field>
                </div>

                <Field label="Email *" error={fieldErrors.email}>
                  <input
                    className="field-control"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="email@autoterr.sn"
                    required
                  />
                </Field>

                <Field label={editing ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'} error={fieldErrors.password}>
                  <input
                    className="field-control"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Minimum 6 caractères"
                    required={!editing}
                    autoComplete="new-password"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Rôle *" error={fieldErrors.role}>
                    <select
                      className="field-control"
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                      required
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Lier à un employé (optionnel)" error={fieldErrors.id_employe}>
                    <select
                      className="field-control"
                      value={form.id_employe}
                      onChange={(e) => setForm((f) => ({ ...f, id_employe: e.target.value }))}
                    >
                      <option value="">— Aucun —</option>
                      {employes.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.prenom ? `${emp.prenom} ${emp.nom}` : emp.nom}{emp.poste ? ` · ${emp.poste}` : ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                    {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer le compte'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteUser}
        title="Supprimer ce compte"
        message={`Supprimer le compte de ${deleteTarget?.name ?? ''} (${deleteTarget?.username ?? ''}) ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleting === deleteTarget?.id}
        type="danger"
      />
    </DashboardLayout>
  );
}
