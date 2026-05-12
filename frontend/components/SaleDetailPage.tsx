// components/SaleDetailPage.tsx
'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SaleDetail {
    id: number;
    reference_vente: string;
    date_vente: string;
    prix_final: number;
    statut: string;
    mode_paiement: string;
    observations?: string;
    client: { nom: string; prenom?: string; telephone?: string; email?: string };
    voiture: { marque: string; modele: string; annee?: number; numero_chassis: string };
    facture?: { numero_facture: string; montant_ttc: number; statut: string };
}

export default function SaleDetailPage({ saleId }: { saleId: string }) {
    const [sale, setSale] = useState<SaleDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get<SaleDetail>(`/ventes/${saleId}`)
            .then(setSale)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [saleId]);

    if (loading) return <DashboardLayout><div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600"/></div></DashboardLayout>;
    if (!sale) return <DashboardLayout><div className="text-center py-12 text-red-600">Vente non trouvée</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <Link href="/ventes/historique" className="text-teal-600 text-sm">← Retour à l'historique</Link>

                <div className="rounded-2xl border bg-white overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 text-white"><h1 className="text-2xl font-black">Vente {sale.reference_vente}</h1><p className="text-teal-100 text-sm">Crée le {new Date(sale.date_vente).toLocaleDateString('fr-FR')}</p></div>

                    <div className="p-6 grid gap-6 md:grid-cols-2">
                        <div><h3 className="font-bold text-slate-900 mb-3">Client</h3><div className="space-y-2 text-sm"><p><span className="text-slate-500">Nom :</span> {sale.client.nom} {sale.client.prenom || ''}</p><p><span className="text-slate-500">Tél :</span> {sale.client.telephone || '-'}</p><p><span className="text-slate-500">Email :</span> {sale.client.email || '-'}</p></div></div>
                        <div><h3 className="font-bold text-slate-900 mb-3">Véhicule</h3><div className="space-y-2 text-sm"><p><span className="text-slate-500">Modèle :</span> {sale.voiture.marque} {sale.voiture.modele} ({sale.voiture.annee || 'N/C'})</p><p><span className="text-slate-500">Châssis :</span> {sale.voiture.numero_chassis}</p><p><span className="text-slate-500">Prix :</span> <span className="font-bold text-teal-600">{sale.prix_final.toLocaleString('fr-FR')} FCFA</span></p></div></div>
                    </div>

                    <div className="border-t p-6"><h3 className="font-bold mb-3">Informations transaction</h3><div className="grid grid-cols-2 gap-4 text-sm"><div><span className="text-slate-500">Statut :</span> <span className={`inline-block rounded-full px-2 py-1 text-xs font-bold ml-2 ${sale.statut === 'termine' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{sale.statut}</span></div><div><span className="text-slate-500">Mode paiement :</span> {sale.mode_paiement}</div>{sale.facture && (<><div><span className="text-slate-500">Facture :</span> {sale.facture.numero_facture}</div><div><span className="text-slate-500">Statut facture :</span> {sale.facture.statut}</div></>)}</div></div>

                    <div className="border-t bg-slate-50 px-6 py-4 flex gap-3 justify-end"><button className="rounded-lg border px-4 py-2 text-sm">Annuler la vente</button><button className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white">Imprimer le contrat</button></div>
                </div>
            </div>
        </DashboardLayout>
    );
}
