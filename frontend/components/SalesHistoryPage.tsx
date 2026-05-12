// components/SalesHistoryPage.tsx
'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';

interface Sale {
    id: number;
    reference_vente: string;
    date_vente: string;
    prix_final: number;
    statut: string;
    client?: { nom: string };
    voiture?: { marque: string; modele: string };
}

export default function SalesHistoryPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get<{ data: Sale[] }>('/ventes')
            .then(res => setSales(res.data || []))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-8 text-white">
                    <h1 className="text-4xl font-black">Historique des ventes</h1>
                    <p className="mt-2 text-slate-300">Consultez l ensemble des transactions realisees.</p>
                </section>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600"/></div>
                ) : (
                    <div className="rounded-2xl border bg-white overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold uppercase">Référence</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase">Client</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase">Véhicule</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase text-right">Montant</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase">Statut</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sales.map(sale => (
                                <tr key={sale.id} className="border-t">
                                    <td className="px-6 py-4 font-mono text-sm">{sale.reference_vente}</td>
                                    <td className="px-6 py-4 text-sm">{new Date(sale.date_vente).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4 text-sm">{sale.client?.nom || '-'}</td>
                                    <td className="px-6 py-4 text-sm">{sale.voiture?.marque} {sale.voiture?.modele}</td>
                                    <td className="px-6 py-4 text-right font-medium">{sale.prix_final.toLocaleString('fr-FR')} FCFA</td>
                                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                          sale.statut === 'termine' ? 'bg-green-100 text-green-700' :
                              sale.statut === 'en_cours' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{sale.statut}</span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
