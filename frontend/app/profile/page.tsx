'use client';

import EdgeLayout from '@/components/EdgeLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface UserProfile {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_profil?: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login/employee');
      return;
    }
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.getMe();
      const payload = response.user;
      const normalizedProfile = {
        id: payload.id,
        nom: payload.name,
        email: payload.email,
        role: payload.role,
        photo_profil: payload.profile_photo_url,
      };

      setProfile(normalizedProfile);
      setFormData(normalizedProfile);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setProfile((current) => current ? { ...current, ...formData } as UserProfile : current);
    setEditing(false);
  };

  if (loading) {
    return (
      <EdgeLayout>
        <div className="text-center py-12">Chargement...</div>
      </EdgeLayout>
    );
  }

  return (
    <EdgeLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mon Profil</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez vos informations personnelles</p>
      </div>

      {profile && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header with Avatar */}
          <div className="h-32 bg-gradient-to-r from-teal-500 to-cyan-500"></div>

          <div className="px-8 py-6">
            {/* Profile Info */}
            <div className="flex items-end gap-6 mb-8 -mt-16 relative z-10">
              <div className="w-32 h-32 rounded-2xl bg-slate-200 border-4 border-white shadow-lg flex items-center justify-center text-5xl">
                {profile.photo_profil ? '📸' : '👤'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{profile.nom}</h2>
                <p className="text-slate-500 text-sm mt-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                    {profile.role}
                  </span>
                </p>
              </div>
            </div>

            {/* Edit Button */}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="mb-8 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all"
              >
                Modifier le Profil
              </button>
            )}

            {/* Form */}
            {editing ? (
              <div className="space-y-6">
                {[
                  { label: 'Nom Complet', key: 'nom' as const },
                  { label: 'Email', key: 'email' as const },
                  { label: 'Téléphone', key: 'telephone' as const },
                  { label: 'Adresse', key: 'adresse' as const },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-2 bg-slate-300 text-slate-900 font-bold rounded-lg hover:bg-slate-400 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Nom', value: profile.nom },
                  { label: 'Email', value: profile.email },
                  { label: 'Téléphone', value: profile.telephone },
                  { label: 'Adresse', value: profile.adresse },
                  { label: 'Rôle', value: profile.role },
                ].map((item, idx) => (
                  <div key={idx}>
                    <p className="text-slate-500 text-sm font-medium">{item.label}</p>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mt-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Sécurité</h3>
        <button className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-all">
          Changer le Mot de Passe
        </button>
      </div>
    </EdgeLayout>
  );
}
