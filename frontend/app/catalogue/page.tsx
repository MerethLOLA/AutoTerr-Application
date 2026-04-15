'use client';

import EdgeLayout from '@/components/EdgeLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Voiture {
  id: number;
  marque: string;
  modele: string;
  annee: number;
  prix_location_jour: number;
  statut: string;
  kilometrage?: number;
  energie?: string;
  couleur?: string;
  images?: Array<{ url: string }>;
}

export default function CataloguePage() {
  const router = useRouter();
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<string>('');
  const [filterMarque, setFilterMarque] = useState<string>('');

  // KPI Stats
  const [stats] = useState({
    incoming: 473154.25,
    outgoing: 273154.25,
    myBalance: 1073154.64,
    locations: 12,
    disponibles: 8,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login/employee');
      return;
    }
    fetchVoitures();
  }, [router]);

  const fetchVoitures = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const voituresRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/voitures`,
        { headers }
      );
      setVoitures(voituresRes.data?.data || voituresRes.data || []);
    } catch (error) {
      console.error('Erreur API:', error);
      // Données mockées
      setVoitures([
        {
          id: 1,
          marque: 'Toyota',
          modele: 'Corolla',
          annee: 2020,
          prix_location_jour: 45,
          statut: 'disponible',
          kilometrage: 50000,
          energie: 'Essence',
          couleur: 'Blanc'
        },
        {
          id: 2,
          marque: 'Renault',
          modele: 'Clio',
          annee: 2019,
          prix_location_jour: 35,
          statut: 'location',
          kilometrage: 75000,
          energie: 'Diesel',
          couleur: 'Bleu'
        },
        {
          id: 3,
          marque: 'Peugeot',
          modele: '208',
          annee: 2021,
          prix_location_jour: 42,
          statut: 'maintenance',
          kilometrage: 30000,
          energie: 'Essence',
          couleur: 'Rouge'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVoitures = voitures.filter(v => {
    if (filtreStatut && v.statut !== filtreStatut) return false;
    if (filterMarque && !v.marque.toLowerCase().includes(filterMarque.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <EdgeLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </EdgeLayout>
    );
  }

  return (
    <EdgeLayout>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Home</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's your financial overview</p>
      </div>

      {/* KPI Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Incoming */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 text-sm font-medium">Incoming</p>
            <button className="p-1 hover:bg-slate-100 rounded-lg">⋮</button>
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-2">
            ₹ {stats.incoming.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-teal-600 font-medium">Incoming transfers</p>
        </div>

        {/* Outgoing */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 text-sm font-medium">Outgoing</p>
            <button className="p-1 hover:bg-slate-100 rounded-lg">⋮</button>
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-2">
            ₹ {stats.outgoing.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 font-medium">Outgoing transfers</p>
        </div>

        {/* My Balance */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-4">My Balance</p>
          <p className="text-4xl font-bold text-teal-600 mb-2">
            ₹ {stats.myBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-teal-600">Account balance</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Summary / Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Locations Overview</h3>
            <Link href="#" className="text-teal-600 text-sm font-medium hover:text-teal-700">
              View All →
            </Link>
          </div>

          {/* Chart Placeholder */}
          <div className="h-64 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl flex items-center justify-center text-slate-400">
            <div className="text-center">
              <p className="text-sm">📊 Chart Visualization</p>
              <p className="text-xs text-slate-500 mt-2">Locations par mois</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-200">
            {[
              { label: 'Travel', color: 'bg-blue-400' },
              { label: 'Shopping', color: 'bg-slate-400' },
              { label: 'Services', color: 'bg-teal-400' },
              { label: 'Payments', color: 'bg-cyan-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-xs text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account Statements */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Account Statements</h3>
            <Link href="#" className="text-teal-600 text-sm hover:text-teal-700">
              View
            </Link>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg hover:from-teal-100 hover:to-cyan-100 transition-all">
              <span className="text-sm font-medium text-teal-600">Download Statement</span>
              <span>⬇️</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-medium mb-4">Recent Transactions</p>
            <div className="space-y-3">
              {[
                { name: 'Location #1', amount: '-€450', status: 'Completed' },
                { name: 'Location #2', amount: '-€320', status: 'Pending' },
                { name: 'Paiement facture', amount: '+€1200', status: 'Completed' },
              ].map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-900">{tx.name}</p>
                    <p className="text-xs text-slate-500">{tx.status}</p>
                  </div>
                  <p className={`text-xs font-bold ${tx.amount.startsWith('-') ? 'text-red-500' : 'text-green-600'}`}>
                    {tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={filterMarque}
            onChange={(e) => setFilterMarque(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
          />
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
          >
            <option value="">All Status</option>
            <option value="disponible">Available</option>
            <option value="location">Rented</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Véhicules Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Our Fleet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVoitures.map((voiture) => (
            <div
              key={voiture.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                {voiture.images && voiture.images[0] ? (
                  <img
                    src={voiture.images[0].url}
                    alt={`${voiture.marque} ${voiture.modele}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    🚗
                  </div>
                )}

                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm ${
                      voiture.statut === 'disponible'
                        ? 'bg-green-500/80'
                        : voiture.statut === 'location'
                        ? 'bg-orange-500/80'
                        : 'bg-red-500/80'
                    }`}
                  >
                    {voiture.statut === 'disponible'
                      ? 'Available'
                      : voiture.statut === 'location'
                      ? 'Rented'
                      : 'Maintenance'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className="font-bold text-slate-900 mb-1">
                  {voiture.marque} {voiture.modele}
                </h4>
                <p className="text-xs text-slate-500 mb-4">{voiture.annee}</p>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Per day</p>
                    <p className="text-2xl font-bold text-teal-600 ">
                      €{voiture.prix_location_jour}
                    </p>
                  </div>
                  <Link
                    href={`/voitures/${voiture.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredVoitures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No vehicles match your criteria</p>
        </div>
      )}
    </EdgeLayout>
  );
}
