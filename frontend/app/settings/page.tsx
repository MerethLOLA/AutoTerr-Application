'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { UserProfile } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';

interface PasswordForm {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

type SettingsSection = 'generalite' | 'compte' | 'confidentialite';

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SettingsSection>('generalite');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [loggingOutDevices, setLoggingOutDevices] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({ theme: 'dark', locale: 'fr' });
  const [editProfile, setEditProfile] = useState({ name: '', email: '', username: '' });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiClient.getMe()
      .then((response) => {
        if (!mounted) return;
        setUser(response.user);
        setPreferences({
          theme: response.user?.theme || 'dark',
          locale: response.user?.locale || 'fr',
        });
        setEditProfile({
          name: response.user?.name || '',
          email: response.user?.email || '',
          username: response.user?.username || '',
        });
      })
      .catch(() => {
        if (mounted) setError('Impossible de charger les paramètres');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const sections = useMemo(() => ([
    { key: 'generalite' as const, label: 'Généralité', hint: 'Thème, langue et affichage' },
    { key: 'compte' as const, label: 'Compte', hint: 'Identité et informations du profil' },
    { key: 'confidentialite' as const, label: 'Confidentialité', hint: 'Mot de passe, session et accès' },
  ]), []);

  function flash(msg: string, isError = false) {
    setFeedback(isError ? null : msg);
    setError(isError ? msg : null);
    setTimeout(() => { setFeedback(null); setError(null); }, 4000);
  }

  async function savePreferences() {
    setSavingPrefs(true);
    try {
      const response = await apiClient.put<{ user: UserProfile }>('/user/preferences', preferences);
      setUser(response.user);
      const stored = localStorage.getItem('user');
      if (stored) localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...preferences }));
      flash('Préférences mises à jour.');
    } catch (err: any) {
      flash(err?.message || 'Impossible de sauvegarder les préférences.', true);
    } finally {
      setSavingPrefs(false);
    }
  }

  async function updateProfile() {
    setUpdatingProfile(true);
    try {
      const response = await apiClient.put<{ user: UserProfile }>('/user/profile', editProfile);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      flash('Profil mis à jour.');
    } catch (err: any) {
      flash(err?.message || 'Impossible de mettre à jour le profil.', true);
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function updatePassword() {
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      return flash('La confirmation du mot de passe ne correspond pas.', true);
    }
    if (passwordForm.new_password.length < 8) {
      return flash('Le mot de passe doit contenir au moins 8 caractères.', true);
    }
    setUpdatingPassword(true);
    try {
      await apiClient.put('/user/password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      flash('Mot de passe mis à jour.');
    } catch (err: any) {
      flash(err?.message || 'Impossible de changer le mot de passe.', true);
    } finally {
      setUpdatingPassword(false);
    }
  }

  async function logoutAllDevices() {
    setLoggingOutDevices(true);
    try {
      await apiClient.post('/user/logout-all-devices', {});
      flash('Les autres appareils ont été déconnectés.');
    } catch (err: any) {
      flash(err?.message || 'Impossible de déconnecter les autres appareils.', true);
    } finally {
      setLoggingOutDevices(false);
    }
  }

  async function deleteAccount() {
    setDeletingAccount(true);
    try {
      await apiClient.delete('/user/account');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (err: any) {
      flash(err?.message || 'Impossible de supprimer le compte.', true);
      setDeletingAccount(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Paramètres</h1>
            <p className="page-subtitle">Gérez votre profil, vos préférences et la sécurité de votre compte.</p>
          </div>
        </div>

        {/* Feedback / Erreur */}
        {feedback && (
          <div className="flex items-center gap-3 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feedback}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">

          {/* Nav latérale */}
          <aside className="surface-panel p-3">
            {/* Avatar utilisateur */}
            <div className="mb-3 flex items-center gap-3 rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff6b35] text-sm font-bold text-white">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#33475b]">{user?.name || 'Utilisateur'}</p>
                <p className="truncate text-xs text-[#516f90]">{user?.role || '-'}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full rounded px-3 py-2.5 text-left transition ${
                    activeSection === section.key
                      ? 'bg-[#ff6b35]/[0.08] text-[#ff6b35]'
                      : 'text-[#33475b] hover:bg-[#f5f8fa]'
                  }`}
                >
                  <p className="text-sm font-semibold">{section.label}</p>
                  <p className={`mt-0.5 text-xs ${activeSection === section.key ? 'text-[#ff6b35]/70' : 'text-[#516f90]'}`}>
                    {section.hint}
                  </p>
                </button>
              ))}
            </nav>
          </aside>

          {/* Contenu */}
          <section className="surface-panel p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-[#f5f8fa]" />
                ))}
              </div>
            ) : (
              <>
                {/* ── Généralité ── */}
                {activeSection === 'generalite' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#dfe3eb] pb-4">
                      <h2 className="text-base font-bold text-[#33475b]">Apparence et langue</h2>
                      <p className="mt-1 text-sm text-[#516f90]">
                        Réglez le thème d'interface, la langue et les options d'affichage du compte.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#33475b]">Thème</label>
                        <select
                          className="field-control"
                          value={preferences.theme}
                          onChange={(e) => setPreferences((p) => ({ ...p, theme: e.target.value }))}
                        >
                          <option value="dark">Sombre</option>
                          <option value="light">Clair</option>
                          <option value="system">Système</option>
                        </select>
                        <p className="mt-1 text-xs text-[#516f90]">Définit le rendu général de l'application.</p>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#33475b]">Langue</label>
                        <select
                          className="field-control"
                          value={preferences.locale}
                          onChange={(e) => setPreferences((p) => ({ ...p, locale: e.target.value }))}
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                        </select>
                        <p className="mt-1 text-xs text-[#516f90]">Contrôle la langue des libellés et messages affichés.</p>
                      </div>
                    </div>

                    {/* Résumé actuel */}
                    <div className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#516f90]">Résumé actuel</p>
                      <div className="grid gap-4 sm:grid-cols-3 text-sm">
                        <div>
                          <p className="text-xs text-[#516f90]">Utilisateur</p>
                          <p className="mt-0.5 font-semibold text-[#33475b]">{user?.name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#516f90]">Thème</p>
                          <p className="mt-0.5 font-semibold text-[#33475b] capitalize">{preferences.theme}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#516f90]">Langue</p>
                          <p className="mt-0.5 font-semibold text-[#33475b]">
                            {preferences.locale === 'fr' ? 'Français' : preferences.locale === 'en' ? 'English' : 'Español'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button className="btn-primary min-w-[160px]" disabled={savingPrefs} onClick={savePreferences} type="button">
                        {savingPrefs ? 'Sauvegarde…' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Compte ── */}
                {activeSection === 'compte' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#dfe3eb] pb-4">
                      <h2 className="text-base font-bold text-[#33475b]">Informations du profil</h2>
                      <p className="mt-1 text-sm text-[#516f90]">
                        Mettez à jour votre identité, vos coordonnées et votre nom d'utilisateur.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#33475b]">Nom complet</label>
                        <input
                          className="field-control"
                          type="text"
                          value={editProfile.name}
                          onChange={(e) => setEditProfile((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#33475b]">Nom d'utilisateur</label>
                        <input
                          className="field-control"
                          type="text"
                          value={editProfile.username}
                          onChange={(e) => setEditProfile((p) => ({ ...p, username: e.target.value }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-[#33475b]">Adresse e-mail</label>
                        <input
                          className="field-control"
                          type="email"
                          value={editProfile.email}
                          onChange={(e) => setEditProfile((p) => ({ ...p, email: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Infos lecture seule */}
                    <div className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#516f90]">Informations du compte</p>
                      <div className="grid gap-4 sm:grid-cols-3 text-sm">
                        <div>
                          <p className="text-xs text-[#516f90]">Rôle</p>
                          <p className="mt-0.5 font-semibold text-[#33475b] capitalize">{user?.role || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#516f90]">Thème actif</p>
                          <p className="mt-0.5 font-semibold text-[#33475b] capitalize">{user?.theme || preferences.theme}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#516f90]">Langue active</p>
                          <p className="mt-0.5 font-semibold text-[#33475b]">{user?.locale || preferences.locale}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button className="btn-primary min-w-[160px]" disabled={updatingProfile} onClick={updateProfile} type="button">
                        {updatingProfile ? 'Sauvegarde…' : 'Enregistrer le profil'}
                      </button>
                    </div>

                    {/* Zone danger */}
                    <div className="rounded border border-red-200 bg-red-50 px-4 py-4">
                      <p className="text-sm font-bold text-red-800">Zone dangereuse</p>
                      <p className="mt-1 text-xs text-red-600">
                        La suppression du compte est irréversible. Toutes vos données seront effacées.
                      </p>
                      {!confirmDelete ? (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          className="mt-3 rounded border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Supprimer mon compte…
                        </button>
                      ) : (
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={deleteAccount}
                            disabled={deletingAccount}
                            className="btn-danger"
                          >
                            {deletingAccount ? 'Suppression…' : 'Confirmer la suppression'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="btn-secondary"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Confidentialité ── */}
                {activeSection === 'confidentialite' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#dfe3eb] pb-4">
                      <h2 className="text-base font-bold text-[#33475b]">Sécurité et accès</h2>
                      <p className="mt-1 text-sm text-[#516f90]">
                        Gérez le mot de passe, la session et les informations sensibles du compte.
                      </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                      {/* Changement de mot de passe */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#33475b]">Changer le mot de passe</h3>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-[#33475b]">Mot de passe actuel</label>
                          <input
                            className="field-control"
                            type="password"
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-[#33475b]">Nouveau mot de passe</label>
                          <input
                            className="field-control"
                            type="password"
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-[#33475b]">Confirmation</label>
                          <input
                            className="field-control"
                            type="password"
                            value={passwordForm.new_password_confirmation}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="btn-primary min-w-[160px]"
                            disabled={updatingPassword}
                            onClick={updatePassword}
                            type="button"
                          >
                            {updatingPassword ? 'Changement…' : 'Changer le mot de passe'}
                          </button>
                        </div>
                      </div>

                      {/* Sessions & confidentialité */}
                      <div className="space-y-4">
                        <div className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-4">
                          <h3 className="text-sm font-bold text-[#33475b]">Sessions actives</h3>
                          <p className="mt-1 text-xs text-[#516f90]">
                            Votre compte est connecté sur cette session. Déconnectez les autres appareils si nécessaire.
                          </p>
                          <button
                            type="button"
                            onClick={logoutAllDevices}
                            disabled={loggingOutDevices}
                            className="btn-secondary mt-3 w-full"
                          >
                            {loggingOutDevices ? 'Déconnexion…' : 'Déconnecter les autres appareils'}
                          </button>
                        </div>

                        <div className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-4">
                          <h3 className="text-sm font-bold text-[#33475b]">Confidentialité</h3>
                          <ul className="mt-2 space-y-1.5 text-xs text-[#516f90]">
                            <li>• Les identifiants ne sont visibles qu'au propriétaire de la session.</li>
                            <li>• Le mot de passe n'est jamais affiché ni stocké en clair.</li>
                            <li>• La langue et le thème sont rattachés au profil utilisateur.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
