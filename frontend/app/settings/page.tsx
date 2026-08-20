﻿'use client';

import DashboardLayout, { employeeRoles } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { AUTH_CHANGED_EVENT } from '@/lib/auth-storage';
import type { UserProfile } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation, setLocale } from '@/lib/i18n';
import { useSession } from 'next-auth/react';
import { useRealtime } from '@/components/RealtimeProvider';

interface PasswordForm {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

type SettingsSection = 'generalite' | 'compte' | 'confidentialite';

export default function SettingsPage() {
  const _initUser: UserProfile | null = (() => {
    try { const s = sessionStorage.getItem('user'); return s ? JSON.parse(s) : null; } catch { return null; }
  })();
  const [user, setUser] = useState<UserProfile | null>(_initUser);
  const [loading, setLoading] = useState(_initUser === null);
  const { t } = useTranslation();
  const { addToast } = useRealtime();
  const [activeSection, setActiveSection] = useState<SettingsSection>('generalite');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
  const { update: updateSession } = useSession();

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
    { key: 'generalite' as const, labelKey: 'settings.sections.general', hintKey: 'settings.sections.generalHint' },
    { key: 'compte' as const, labelKey: 'settings.sections.account', hintKey: 'settings.sections.accountHint' },
    { key: 'confidentialite' as const, labelKey: 'settings.sections.privacy', hintKey: 'settings.sections.privacyHint' },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ]), []);

  function flash(msg: string, isError = false) {
    setFeedback(isError ? null : msg);
    setError(isError ? msg : null);
    setTimeout(() => { setFeedback(null); setError(null); }, 4000);
  }

  function applyTheme(theme: string) {
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolved = theme === 'system' ? sys : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }

  async function savePreferences() {
    setSavingPrefs(true);
    try {
      const response = await apiClient.put<{ data: { user: UserProfile }; message: string }>('/user/preferences', preferences);
      const updatedUser = response.data?.user;
      if (updatedUser) setUser(updatedUser);
      const stored = sessionStorage.getItem('user');
      if (stored) {
        sessionStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...preferences }));
        window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
      }
      applyTheme(preferences.theme);
      setLocale(preferences.locale);
      flash('Préférences mises à jour.');
    } catch (err: any) {
      flash(err?.message || 'Impossible de sauvegarder les préférences.', true);
    } finally {
      setSavingPrefs(false);
    }
  }

  async function uploadPhoto(file: File) {
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const response = await apiClient.postForm<{ data: { profile_photo_url: string }; message: string }>('/user/photo', fd);
      const url = response.data?.profile_photo_url;
      setUser((u) => u ? { ...u, profile_photo_url: url } : u);
      const stored = sessionStorage.getItem('user');
      if (stored) {
        sessionStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), profile_photo_url: url }));
        window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
      }
      await updateSession({ profile_photo_url: url });
      flash('Photo de profil mise à jour.');
      addToast({ niveau: 'success', titre: 'Photo mise à jour', message: 'Votre nouvelle photo de profil est bien enregistrée.' });
    } catch (err: any) {
      const message = err?.message || 'Impossible de mettre à jour la photo.';
      flash(message, true);
      addToast({ niveau: 'danger', titre: 'Échec de l\'upload', message });
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function updateProfile() {
    setUpdatingProfile(true);
    try {
      const response = await apiClient.put<{ data: { user: UserProfile }; message: string }>('/user/profile', editProfile);
      const updatedUser = response.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
        await updateSession({ name: updatedUser.name, profile_photo_url: updatedUser.profile_photo_url });
      }
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
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      window.location.href = '/';
    } catch (err: any) {
      flash(err?.message || 'Impossible de supprimer le compte.', true);
      setDeletingAccount(false);
    }
  }

  const isClient = user?.role === 'client';

  return (
    <DashboardLayout
      allowedRoles={[...employeeRoles, 'client']}
      menuVariant={isClient ? 'client' : 'employee'}
    >
      <div className="space-y-6">

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
            <div className="mb-3 flex items-center gap-3 rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6b7280] text-sm font-bold text-white">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111827] dark:text-slate-100">{user?.name || 'Utilisateur'}</p>
                <p className="truncate text-xs text-[#6b7280] dark:text-slate-400">{user?.role || '-'}</p>
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
                      ? 'bg-[#f5f8fa] text-[#111827] dark:bg-slate-700 dark:text-slate-100'
                      : 'text-[#111827] hover:bg-[#f5f8fa] dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <p className="text-sm font-semibold">{t(section.labelKey)}</p>
                  <p className={`mt-0.5 text-xs ${activeSection === section.key ? 'text-[#111827]/70' : 'text-[#6b7280]'}`}>
                    {t(section.hintKey)}
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
                  <div key={i} className="h-16 animate-pulse rounded bg-[#f5f8fa] dark:bg-slate-700" />
                ))}
              </div>
            ) : (
              <>
                {/* â”€â”€ Généralité â”€â”€ */}
                {activeSection === 'generalite' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#dfe3eb] pb-4 dark:border-slate-700">
                      <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Apparence et langue</h2>
                      <p className="mt-1 text-sm text-[#6b7280] dark:text-slate-400">
                        Réglez le thème d'interface, la langue et les options d'affichage du compte.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#111827] dark:text-slate-200">Thème</label>
                        <select
                          className="field-control"
                          value={preferences.theme}
                          onChange={(e) => { const val = e.target.value; setPreferences((p) => ({ ...p, theme: val })); applyTheme(val); }}
                        >
                          <option value="dark">{t('settings.appearance.dark')}</option>
                          <option value="light">{t('settings.appearance.light')}</option>
                          <option value="system">{t('settings.appearance.system')}</option>
                        </select>
                        <p className="mt-1 text-xs text-[#6b7280] dark:text-slate-400 dark:text-slate-400">Définit le rendu général de l'application.</p>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#111827] dark:text-slate-200">{t('settings.appearance.language')}</label>
                        <select
                          className="field-control"
                          value={preferences.locale}
                          onChange={(e) => {
                            const loc = e.target.value;
                            setPreferences((p) => ({ ...p, locale: loc }));
                            setLocale(loc);
                          }}
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                        </select>
                        <p className="mt-1 text-xs text-[#6b7280] dark:text-slate-400">{t('settings.appearance.languageHint')}</p>
                      </div>
                    </div>

                    {/* Résumé actuel */}
                    <div className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Résumé actuel</p>
                      <div className="grid gap-4 sm:grid-cols-3 text-sm">
                        <div>
                          <p className="text-xs text-[#6b7280] dark:text-slate-400">Utilisateur</p>
                          <p className="mt-0.5 font-semibold text-[#111827]">{user?.name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6b7280] dark:text-slate-400">Thème</p>
                          <p className="mt-0.5 font-semibold text-[#111827] capitalize dark:text-slate-100">{preferences.theme}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6b7280] dark:text-slate-400">Langue</p>
                          <p className="mt-0.5 font-semibold text-[#111827]">Français</p>
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

                {/* â”€â”€ Compte â”€â”€ */}
                {activeSection === 'compte' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#dfe3eb] pb-4 dark:border-slate-700">
                      <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Informations du profil</h2>
                      <p className="mt-1 text-sm text-[#6b7280] dark:text-slate-400">
                        Mettez à jour votre identité, vos coordonnées et votre nom d'utilisateur.
                      </p>
                    </div>

                    {/* Photo de profil */}
                    <div className="flex items-center gap-5">
                      <div className="relative shrink-0">
                        {user?.profile_photo_url ? (
                          <img
                            src={user.profile_photo_url}
                            alt={user.name}
                            width={80} height={80}
                            className="h-20 w-20 rounded-full object-cover border border-[#dfe3eb]"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#6b7280] text-2xl font-black text-white">
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        {uploadingPhoto && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                            <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">{user?.name}</p>
                        <p className="text-xs text-[#6b7280] dark:text-slate-400">JPG ou PNG · max 2 Mo</p>
                        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded border border-[#dfe3eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] dark:text-slate-200 transition hover:bg-[#f5f8fa]">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Changer la photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingPhoto}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadPhoto(file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#111827] dark:text-slate-200">Nom complet</label>
                        <input
                          className="field-control"
                          type="text"
                          value={editProfile.name}
                          onChange={(e) => setEditProfile((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#111827] dark:text-slate-200">Nom d'utilisateur</label>
                        <input
                          className="field-control"
                          type="text"
                          value={editProfile.username}
                          onChange={(e) => setEditProfile((p) => ({ ...p, username: e.target.value }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-[#111827] dark:text-slate-200">Adresse e-mail</label>
                        <input
                          className="field-control"
                          type="email"
                          value={editProfile.email}
                          onChange={(e) => setEditProfile((p) => ({ ...p, email: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Infos lecture seule */}
                    <div className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Informations du compte</p>
                      <div className="grid gap-4 sm:grid-cols-3 text-sm">
                        <div>
                          <p className="text-xs text-[#6b7280] dark:text-slate-400">Rôle</p>
                          <p className="mt-0.5 font-semibold text-[#111827] capitalize dark:text-slate-100">{user?.role || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6b7280] dark:text-slate-400">Thème actif</p>
                          <p className="mt-0.5 font-semibold text-[#111827] capitalize dark:text-slate-100">{user?.theme || preferences.theme}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6b7280] dark:text-slate-400">Langue active</p>
                          <p className="mt-0.5 font-semibold text-[#111827]">{user?.locale || preferences.locale}</p>
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

                {/* â”€â”€ Confidentialité â”€â”€ */}
                {activeSection === 'confidentialite' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#dfe3eb] pb-4 dark:border-slate-700">
                      <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Sécurité et accès</h2>
                      <p className="mt-1 text-sm text-[#6b7280] dark:text-slate-400">
                        Gérez le mot de passe, la session et les informations sensibles du compte.
                      </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                      {/* Changement de mot de passe */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100">Changer le mot de passe</h3>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-[#111827] dark:text-slate-200">Mot de passe actuel</label>
                          <input
                            className="field-control"
                            type="password"
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-[#111827] dark:text-slate-200">Nouveau mot de passe</label>
                          <input
                            className="field-control"
                            type="password"
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-[#111827] dark:text-slate-200">Confirmation</label>
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
                        <div className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100">Double authentification</h3>
                              <p className="mt-1 text-xs text-[#6b7280] dark:text-slate-400">
                                Obligatoire pour tous les comptes : un code à 6 chiffres vous est envoyé par e-mail à chaque connexion.
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Activée
                            </span>
                          </div>
                        </div>

                        <div className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                          <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100">Sessions actives</h3>
                          <p className="mt-1 text-xs text-[#6b7280] dark:text-slate-400 dark:text-slate-400">
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

                        <div className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                          <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100">Confidentialité</h3>
                          <ul className="mt-2 space-y-1.5 text-xs text-[#6b7280] dark:text-slate-400">
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

