'use client';

import EdgeLayout from '@/components/EdgeLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface Location {
  id: number;
  voiture_id: number;
  date_debut: string;
  date_fin: string;
  cout_total: number;
  statut: string;
}

interface Profile {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  type_client: string;
}

export default function EspaceClientPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login/client');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const authRes = await apiClient.getMe();
      const profileData = {
        id: authRes.user.id,
        nom: authRes.user.name,
        email: authRes.user.email,
        type_client: authRes.user.role,
      };

      const locationsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/locations`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }));

      setProfile(profileData);
      setLocations(locationsRes.data?.data || locationsRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    locationsActuelles: locations.filter(l => l.statut === 'en cours').length,
    locationsTerminees: locations.filter(l => l.statut === 'terminée').length,
    depenseTotal: locations.reduce((sum, l) => sum + l.cout_total, 0),
  };

  return (
    <EdgeLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mon Espace</h1>
        <p className="text-slate-500 text-sm mt-1">Gestion de vos locations et informations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Locations Actuelles', value: stats.locationsActuelles, icon: '📋', color: 'from-blue-500' },
          { label: 'Locations Passées', value: stats.locationsTerminees, icon: '✅', color: 'from-green-500' },
          { label: 'Dépense Totale', value: `€${stats.depenseTotal.toLocaleString('fr-FR')}`, icon: '💰', color: 'from-purple-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} to-cyan-500 bg-clip-text text-transparent mt-2`}>
                  {stat.value}
                </p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Card */}
      {profile && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Profil Client</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-500 text-sm">Nom Complet</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{profile.nom}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Email</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{profile.email}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Téléphone</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{profile.telephone}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Type Client</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{profile.type_client}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-slate-500 text-sm">Adresse</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{profile.adresse}</p>
            </div>
          </div>
        </div>
      )}

      {/* Locations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Historique des Locations</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-500">Chargement...</div>
        ) : locations.length === 0 ? (
          <div className="p-6 text-center text-slate-500">Aucune location pour le moment</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Début</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Fin</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Coût</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Statut</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">{new Date(loc.date_debut).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{new Date(loc.date_fin).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-sm font-bold text-teal-600">€{loc.cout_total.toLocaleString('fr-FR')}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        loc.statut === 'en cours' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {loc.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </EdgeLayout>
  );
}
