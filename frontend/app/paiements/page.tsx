'use client';

import ConfirmDialog from '@/components/ConfirmDialog';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { useRealtime } from '@/components/RealtimeProvider';
import { useEffect, useRef, useState } from 'react';

interface Paiement {
  id: number;
  date: string;
  mode_paiement: string;
  reference_paiement?: string;
  banque?: string;
  montant: number;
  reste?: number;
  id_facture?: number;
  facturation?: { id: number; numero_facture: string };
  vente?: { reference_vente: string };
  client?: { nom: string; prenom?: string };
}

function money(v?: number | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v || 0));
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const MODE_LABEL: Record<string, string> = {
  especes:  'Espèces',
  virement: 'Virement',
  cheque:   'Chèque',
  carte:    'Carte bancaire',
  mobile:   'Mobile Money',
};

const MODE_COLOR: Record<string, string> = {
  especes:  'bg-emerald-100 text-emerald-700',
  virement: 'bg-blue-100 text-blue-700',
  cheque:   'bg-amber-100 text-amber-700',
  carte:    'bg-purple-100 text-purple-700',
  mobile:   'bg-teal-100 text-teal-700',
};

interface Facture { id: number; numero_facture: string; reste_a_payer?: number; montant_ttc?: number; }

export default function PaymentsPage() {
  const _initPay = apiClient.getCached<any>('/paiements', { page: 1, per_page: 20 });
  const [items, setItems]           = useState<Paiement[]>(_initPay?.data ?? []);
  const [loading, setLoading]       = useState(_initPay === null);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey]         = useState(0);

  // Formulaire création / édition
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [factures, setFactures]   = useState<Facture[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Paiement | null>(null);
  const { addToast } = useRealtime();
  const emptyForm = { id_facture: '', date: new Date().toISOString().slice(0, 10), mode_paiement: 'especes', montant: '', reference_paiement: '', banque: '' };
  const [form, setForm] = useState(emptyForm);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm && factures.length === 0) {
      apiClient.get<any>('/facturations').then((res) => {
        const data = res?.data ?? (Array.isArray(res) ? res : []);
        setFactures(data.filter((f: any) => f.statut !== 'payee'));
      }).catch(() => {});
    }
  }, [showForm, factures.length]);

  // Auto-remplissage du montant depuis le reste à payer — uniquement à la création,
  // pour ne pas écraser le montant réel d'un paiement existant en édition.
  useEffect(() => {
    if (showForm && !editingId) {
      const selectedFacture = factures.find((f) => String(f.id) === form.id_facture);
      if (selectedFacture) {
        const reste = selectedFacture.reste_a_payer ?? selectedFacture.montant_ttc ?? 0;
        setForm((f) => ({ ...f, montant: String(Math.round(Number(reste))) }));
      }
    }
  }, [form.id_facture, showForm, editingId, factures]);

  function beginCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function beginEdit(p: Paiement) {
    setEditingId(p.id);
    setFormError(null);
    // La facture peut déjà être "payée" (grâce à ce paiement) et donc absente
    // de la liste filtrée — on l'ajoute pour que le select ait une option valide.
    if (p.facturation && !factures.some((f) => f.id === p.facturation!.id)) {
      setFactures((cur) => [{ id: p.facturation!.id, numero_facture: p.facturation!.numero_facture }, ...cur]);
    }
    setForm({
      id_facture: p.id_facture ? String(p.id_facture) : '',
      date: p.date.slice(0, 10),
      mode_paiement: p.mode_paiement,
      montant: String(p.montant),
      reference_paiement: p.reference_paiement ?? '',
      banque: p.banque ?? '',
    });
    setShowForm(true);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        montant: Number(form.montant),
        id_facture: form.id_facture ? Number(form.id_facture) : undefined,
      };
      if (editingId) {
        await apiClient.put(`/paiements/${editingId}`, payload);
      } else {
        await apiClient.post('/paiements', payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setPage(1);
      setReloadKey((k) => k + 1);
    } catch (err: any) {
      setFormError(err?.message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeletePaiement() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await apiClient.delete(`/paiements/${deleteTarget.id}`);
      setReloadKey((k) => k + 1);
      addToast({ niveau: 'success', titre: 'Paiement supprimé', message: 'Le reste à payer de la facture a été recalculé.' });
      setDeleteTarget(null);
    } catch (err: any) {
      addToast({ niveau: 'danger', titre: 'Échec de la suppression', message: err?.message || 'Suppression impossible.' });
    } finally {
      setDeletingId(null);
    }
  }

  async function downloadRecu(id: number) {
    setDownloadingId(id);
    setDownloadError(null);
    try {
      await apiClient.openPdf(`/paiements/${id}/export`);
    } catch (err: any) {
      setDownloadError(err?.message || 'Impossible de télécharger le reçu.');
    } finally {
      setDownloadingId(null);
    }
  }

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = { page, per_page: 20 };
    if (search)     params.search = search;
    if (modeFilter) params.mode_paiement = modeFilter;

    apiClient.get<any>('/paiements', params)
      .then((res) => {
        const data = res?.data ?? res ?? [];
        setItems(Array.isArray(data) ? data : []);
        if (res?.meta) {
          setTotal(res.meta.total);
          setTotalPages(res.meta.last_page);
        }
      })
      .catch(() => setError('Impossible de charger les paiements'))
      .finally(() => setLoading(false));
  }, [page, search, modeFilter, reloadKey]);

  // KPIs calculés côté frontend sur les données reçues
  const totalEncaisse   = items.reduce((s, p) => s + Number(p.montant), 0);
  const byMode = items.reduce<Record<string, number>>((acc, p) => {
    const k = p.mode_paiement ?? 'autre';
    acc[k] = (acc[k] ?? 0) + Number(p.montant);
    return acc;
  }, {});
  const maxMode = Math.max(...Object.values(byMode), 1);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="page-header">
          <div>
            <h1 className="page-title mt-0.5">Paiements</h1>
            <p className="page-subtitle">Suivi des encaissements et modes de règlement.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => { if (showForm) { setShowForm(false); setEditingId(null); } else { beginCreate(); } }}
              className="btn-primary shrink-0"
            >
              {showForm ? '✕ Annuler' : '+ Nouveau paiement'}
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Total affiché</p>
            <p className="mt-2 text-2xl font-black text-[#111827]">{money(totalEncaisse)} XOF</p>
            <p className="mt-0.5 text-xs text-[#6b7280]">{items.length} paiements sur cette page</p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Total enregistrements</p>
            <p className="mt-2 text-2xl font-black text-[#111827]">{total}</p>
            <p className="mt-0.5 text-xs text-[#6b7280]">paiements au total</p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Modes utilisés</p>
            <p className="mt-2 text-2xl font-black text-[#111827]">{Object.keys(byMode).length}</p>
            <p className="mt-0.5 text-xs text-[#6b7280]">sur cette page</p>
          </div>
        </div>

        {/* Formulaire création inline */}
        {showForm && (
          <div ref={formRef} className="surface-panel p-6">
            <h2 className="section-title mb-4">{editingId ? 'Modifier le paiement' : 'Enregistrer un paiement'}</h2>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Facture */}
              <label className="flex flex-col gap-1 text-xs font-semibold text-[#374151]">
                Facture *
                <select
                  required
                  className="field-control"
                  value={form.id_facture}
                  onChange={(e) => setForm((f) => ({ ...f, id_facture: e.target.value }))}
                >
                  <option value="">Sélectionner une facture</option>
                  {factures.map((fc) => (
                    <option key={fc.id} value={fc.id}>
                      {fc.numero_facture}
                      {fc.reste_a_payer != null ? ` — ${new Intl.NumberFormat('fr-FR').format(fc.reste_a_payer)} XOF` : ''}
                    </option>
                  ))}
                </select>
              </label>

              {/* Date */}
              <label className="flex flex-col gap-1 text-xs font-semibold text-[#374151]">
                Date *
                <input
                  type="date"
                  required
                  className="field-control"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </label>

              {/* Mode */}
              <label className="flex flex-col gap-1 text-xs font-semibold text-[#374151]">
                Mode de paiement *
                <select
                  required
                  className="field-control"
                  value={form.mode_paiement}
                  onChange={(e) => setForm((f) => ({ ...f, mode_paiement: e.target.value, reference_paiement: '', banque: '' }))}
                >
                  {Object.entries(MODE_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>

              {/* Montant */}
              <label className="flex flex-col gap-1 text-xs font-semibold text-[#374151]">
                Montant (XOF) *
                <input
                  type="number"
                  required
                  min={0}
                  className="field-control"
                  value={form.montant}
                  onChange={(e) => setForm((f) => ({ ...f, montant: e.target.value }))}
                  placeholder="Auto-rempli depuis la facture"
                />
              </label>

              {/* Référence (chèque / carte / virement) */}
              {form.mode_paiement !== 'especes' && (
                <label className="flex flex-col gap-1 text-xs font-semibold text-[#374151]">
                  {form.mode_paiement === 'cheque' && 'N° chèque'}
                  {form.mode_paiement === 'carte' && '4 derniers chiffres carte'}
                  {form.mode_paiement === 'virement' && 'Référence virement'}
                  {form.mode_paiement === 'mobile' && 'Référence transaction'}
                  <input
                    type="text"
                    className="field-control"
                    value={form.reference_paiement}
                    onChange={(e) => setForm((f) => ({ ...f, reference_paiement: e.target.value }))}
                    placeholder={form.mode_paiement === 'carte' ? 'ex: 4242' : 'ex: REF-00123'}
                  />
                </label>
              )}

              {/* Banque (chèque / virement) */}
              {(form.mode_paiement === 'cheque' || form.mode_paiement === 'virement') && (
                <label className="flex flex-col gap-1 text-xs font-semibold text-[#374151]">
                  Banque
                  <input
                    type="text"
                    className="field-control"
                    value={form.banque}
                    onChange={(e) => setForm((f) => ({ ...f, banque: e.target.value }))}
                    placeholder="ex: CBAO"
                  />
                </label>
              )}

              {formError && (
                <div className="sm:col-span-2 lg:col-span-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Valider le paiement'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); setFormError(null); }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mode breakdown */}
        {Object.keys(byMode).length > 0 && (
          <section className="surface-panel p-5">
            <h2 className="section-title mb-4">Répartition par mode de paiement</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(byMode).sort((a, b) => b[1] - a[1]).map(([mode, montant]) => (
                <div key={mode} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${MODE_COLOR[mode] ?? 'bg-slate-100 text-slate-600'}`}>
                      {MODE_LABEL[mode] ?? mode}
                    </span>
                    <span className="font-bold text-[#111827]">{money(montant)} XOF</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#dfe3eb]">
                    <div className="h-full rounded-full bg-[#185FA5] transition-all"
                      style={{ width: `${(montant / maxMode) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {downloadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {downloadError}
          </div>
        )}

        {/* Tableau */}
        <section className="surface-panel">
          <div className="flex flex-col gap-3 border-b border-[#dfe3eb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="section-title">Historique des paiements</h2>
            <div className="flex flex-wrap gap-2">
              {/* Recherche */}
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher…"
                  className="field-control py-1.5 pl-8 text-xs"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              {/* Filtre mode */}
              <select
                className="field-control py-1.5 text-xs"
                value={modeFilter}
                onChange={(e) => { setModeFilter(e.target.value); setPage(1); }}
              >
                <option value="">Tous les modes</option>
                {Object.entries(MODE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {loading && <p className="px-5 py-6 text-sm text-[#6b7280]">Chargement…</p>}
          {error   && <p className="px-5 py-4 text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="table-header pl-5">Date</th>
                      <th className="table-header">Mode</th>
                      <th className="table-header">Référence</th>
                      <th className="table-header">Montant</th>
                      <th className="table-header">Reste</th>
                      <th className="table-header">Facture</th>
                      <th className="table-header">Client</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-sm text-[#6b7280]">Aucun paiement trouvé.</td>
                      </tr>
                    ) : items.map((p) => (
                      <tr key={p.id} className="table-row">
                        <td className="table-cell pl-5 font-medium text-[#111827]">{fmtDate(p.date)}</td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${MODE_COLOR[p.mode_paiement] ?? 'bg-slate-100 text-slate-600'}`}>
                            {MODE_LABEL[p.mode_paiement] ?? p.mode_paiement}
                          </span>
                        </td>
                        <td className="table-cell text-[#6b7280]">
                          {p.reference_paiement || p.banque
                            ? [p.reference_paiement, p.banque].filter(Boolean).join(' · ')
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="table-cell font-bold text-[#111827]">{money(p.montant)} XOF</td>
                        <td className="table-cell">
                          {p.reste != null && Number(p.reste) > 0
                            ? <span className="font-semibold text-amber-600">{money(p.reste)} XOF</span>
                            : <span className="text-emerald-600">—</span>}
                        </td>
                        <td className="table-cell text-[#6b7280]">
                          {p.facturation?.numero_facture ?? '—'}
                        </td>
                        <td className="table-cell text-[#6b7280]">
                          {p.client ? `${p.client.nom}${p.client.prenom ? ' ' + p.client.prenom : ''}` : '—'}
                        </td>
                        <td className="table-cell">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => beginEdit(p)}
                              className="inline-flex items-center gap-1 rounded border border-[#dfe3eb] bg-white px-2 py-1 text-xs font-semibold text-[#111827] transition hover:border-[#185FA5] hover:bg-[#185FA5] hover:text-white"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === p.id}
                              onClick={() => setDeleteTarget(p)}
                              className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 transition hover:border-red-500 hover:bg-red-500 hover:text-white disabled:opacity-40"
                            >
                              {deletingId === p.id ? '…' : 'Supprimer'}
                            </button>
                            <button
                              type="button"
                              disabled={downloadingId === p.id}
                              onClick={() => downloadRecu(p.id)}
                              className="inline-flex items-center gap-1 rounded border border-[#dfe3eb] bg-white px-2 py-1 text-xs font-semibold text-[#111827] transition hover:border-[#185FA5] hover:bg-[#185FA5] hover:text-white disabled:opacity-40"
                            >
                              {downloadingId === p.id ? '…' : 'Imprimer'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#dfe3eb] px-5 py-3">
                  <span className="text-xs text-[#6b7280]">{total} paiement{total > 1 ? 's' : ''} au total</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded border border-[#dfe3eb] px-3 py-1 text-xs font-medium text-[#111827] disabled:opacity-40 hover:bg-[#f5f8fa]"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ← Préc.
                    </button>
                    <span className="text-xs text-[#6b7280]">Page {page} / {totalPages}</span>
                    <button
                      className="rounded border border-[#dfe3eb] px-3 py-1 text-xs font-medium text-[#111827] disabled:opacity-40 hover:bg-[#f5f8fa]"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Suiv. →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeletePaiement}
        title="Supprimer ce paiement"
        message={`Confirmer la suppression du paiement de ${deleteTarget ? money(deleteTarget.montant) : ''} XOF${deleteTarget?.reference_paiement ? ` (${deleteTarget.reference_paiement})` : ''} ? Le reste à payer de la facture sera recalculé.`}
        confirmLabel="Supprimer"
        loading={deletingId === deleteTarget?.id}
        type="danger"
      />
    </DashboardLayout>
  );
}
