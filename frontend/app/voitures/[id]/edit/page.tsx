'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const STORAGE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '');
function imgUrl(p?: string | null) {
  return p ? `${STORAGE_URL}/storage/${p}` : null;
}

interface SelectOption { id: number; nom: string; }
interface FormOptions {
  types_vehicules: SelectOption[];
  origines_marques: SelectOption[];
  fournisseurs: SelectOption[];
}
interface ExistingImage { id: number; chemin: string; vue?: string; }

const STATUTS  = ['disponible', 'vendu', 'en_location', 'reserve', 'en_reparation'];
const ETATS    = ['neuf', 'occasion', 'accidente'];
const ENERGIES = ['essence', 'diesel', 'hybride', 'electrique', 'gaz'];
const BOITES   = ['manuelle', 'automatique', 'semi-automatique'];
const TYPE_USAGES = [
  { value: 'location', label: 'Location uniquement' },
  { value: 'vente',    label: 'Vente uniquement' },
  { value: 'les_deux', label: 'Location & Vente' },
];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#111827]">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function EditVoiturePage() {
  const { id }  = useParams();
  const router  = useRouter();

  const _initOpts = apiClient.getCached<FormOptions>('/voitures/form-options');
  const _initVoiture = id ? apiClient.getCached<any>(`/voitures/${id}`) : null;
  const [options, setOptions]         = useState<FormOptions>(_initOpts ?? { types_vehicules: [], origines_marques: [], fournisseurs: [] });
  const [loading, setLoading]         = useState(_initOpts === null || _initVoiture === null);
  const [saving, setSaving]           = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  // Photos existantes
  const [existingImages, setExistingImages]   = useState<ExistingImage[]>([]);
  const [deletingImg, setDeletingImg]         = useState<number | null>(null);

  // Nouvelles photos en attente
  const [pendingFiles, setPendingFiles]       = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [dragging, setDragging]               = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    marque: '', modele: '', annee: '', couleur: '', prix: '',
    prix_vente: '', type_usage: 'les_deux',
    kilometrage: '', numero_chassis: '', date_acquisition: '',
    statut: 'disponible', etat: '', energie: '', type_boite: '',
    type_vehicule_id: '', origine_marque_id: '', id_fournisseur: '',
    description: '',
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiClient.get<FormOptions>('/voitures/form-options'),
      apiClient.get<any>(`/voitures/${id}`),
    ]).then(([opts, res]) => {
      setOptions(opts);
      const v = res?.data ?? res;
      setForm({
        marque:            v.marque            ?? '',
        modele:            v.modele            ?? '',
        annee:             String(v.annee      ?? ''),
        couleur:           v.couleur           ?? '',
        prix:              String(v.prix       ?? ''),
        prix_vente:        String(v.prix_vente ?? ''),
        type_usage:        v.type_usage        ?? 'les_deux',
        kilometrage:       String(v.kilometrage ?? ''),
        numero_chassis:    v.numero_chassis    ?? '',
        date_acquisition:  v.date_acquisition  ?? '',
        statut:            v.statut            ?? 'disponible',
        etat:              v.etat              ?? '',
        energie:           v.energie           ?? '',
        type_boite:        v.type_boite        ?? '',
        type_vehicule_id:  String(v.type_vehicule_id  ?? ''),
        origine_marque_id: String(v.origine_marque_id ?? ''),
        id_fournisseur:    String(v.id_fournisseur    ?? ''),
        description:       v.description       ?? '',
      });
      setExistingImages(v.images ?? []);
    }).catch(() => setGlobalError('Impossible de charger le véhicule'))
      .finally(() => setLoading(false));
  }, [id]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function setTypeUsage(value: string) {
    setForm((f) => ({
      ...f,
      type_usage: value,
      prix:       value === 'vente'    ? '' : f.prix,
      prix_vente: value === 'location' ? '' : f.prix_vente,
    }));
    setErrors((e) => { const n = { ...e }; delete n.type_usage; return n; });
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (!arr.length) return;
    setPendingFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setPendingPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  }, []);

  function removePending(i: number) {
    setPendingFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPendingPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function deleteExistingImage(img: ExistingImage) {
    if (!window.confirm('Supprimer cette photo définitivement ?')) return;
    setDeletingImg(img.id);
    try {
      await apiClient.delete(`/voitures/${id}/images/${img.id}`);
      setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
    } catch {
      alert('Impossible de supprimer la photo.');
    } finally {
      setDeletingImg(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setGlobalError('');
    setErrors({});

    const isLocation = form.type_usage === 'location' || form.type_usage === 'les_deux';
    const isVente    = form.type_usage === 'vente'    || form.type_usage === 'les_deux';

    const fd = new FormData();
    fd.append('_method', 'PUT');
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'prix' || k === 'prix_vente') return; // gérés séparément
      if (v) fd.append(k, v);
    });
    fd.append('prix',       isLocation ? (form.prix       || '') : '');
    fd.append('prix_vente', isVente    ? (form.prix_vente || '') : '');
    pendingFiles.forEach((f) => fd.append('images[]', f));

    try {
      await apiClient.postForm(`/voitures/${id}`, fd);
      router.push(`/voitures/${id}`);
    } catch (err: any) {
      if (err?.details) {
        const mapped: Record<string, string> = {};
        Object.entries(err.details).forEach(([k, v]) => { mapped[k] = (v as string[])[0]; });
        setErrors(mapped);
      }
      setGlobalError(err?.message || 'Erreur lors de la mise à jour');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl animate-pulse space-y-5">
          <div className="h-10 w-64 rounded bg-slate-200" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-panel h-48 p-6">
              <div className="h-4 w-40 rounded bg-slate-200 mb-4" />
              <div className="grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((j) => <div key={j} className="h-9 rounded bg-slate-100" />)}
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const totalPhotos = existingImages.length + pendingPreviews.length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <nav className="mb-1 flex items-center gap-1.5 text-xs text-[#6b7280]">
              <Link href="/voitures" className="hover:text-[#111827]">Véhicules</Link>
              <span>/</span>
              <Link href={`/voitures/${id}`} className="hover:text-[#111827]">{form.marque} {form.modele}</Link>
              <span>/</span>
              <span className="font-semibold text-[#111827]">Modifier</span>
            </nav>
            <h1 className="page-title">Modifier le véhicule</h1>
            <p className="page-subtitle">Mettez à jour les informations et le statut du véhicule.</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/voitures/${id}`} className="btn-secondary">Annuler</Link>
          </div>
        </div>

        {globalError && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{globalError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Section 1 : Informations générales ── */}
          <section className="surface-panel p-6">
            <h2 className="section-title mb-5">Informations générales</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Marque *" error={errors.marque}>
                <input className="field-control" value={form.marque} onChange={(e) => set('marque', e.target.value)} required />
              </Field>
              <Field label="Modèle *" error={errors.modele}>
                <input className="field-control" value={form.modele} onChange={(e) => set('modele', e.target.value)} required />
              </Field>
              <Field label="Année" error={errors.annee}>
                <input className="field-control" type="number" min="1900" max={new Date().getFullYear() + 1}
                  value={form.annee} onChange={(e) => set('annee', e.target.value)} />
              </Field>
              <Field label="Couleur" error={errors.couleur}>
                <input className="field-control" value={form.couleur} onChange={(e) => set('couleur', e.target.value)} />
              </Field>
              <Field label="Statut *" error={errors.statut}>
                <select className="field-control" value={form.statut} onChange={(e) => set('statut', e.target.value)} required>
                  {STATUTS.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </Field>
              <Field label="État" error={errors.etat}>
                <select className="field-control" value={form.etat} onChange={(e) => set('etat', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {ETATS.map((e) => <option key={e} value={e}>{e.replace(/^\w/, (c) => c.toUpperCase())}</option>)}
                </select>
              </Field>
            </div>
          </section>

          {/* ── Section 2 : Caractéristiques techniques ── */}
          <section className="surface-panel p-6">
            <h2 className="section-title mb-5">Caractéristiques techniques</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Énergie" error={errors.energie}>
                <select className="field-control" value={form.energie} onChange={(e) => set('energie', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {ENERGIES.map((e) => <option key={e} value={e}>{e.replace(/^\w/, (c) => c.toUpperCase())}</option>)}
                </select>
              </Field>
              <Field label="Boîte de vitesses" error={errors.type_boite}>
                <select className="field-control" value={form.type_boite} onChange={(e) => set('type_boite', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {BOITES.map((b) => <option key={b} value={b}>{b.replace(/^\w/, (c) => c.toUpperCase())}</option>)}
                </select>
              </Field>
              <Field label="Kilométrage (km)" error={errors.kilometrage}>
                <input className="field-control" type="number" min="0"
                  value={form.kilometrage} onChange={(e) => set('kilometrage', e.target.value)} />
              </Field>
              <Field label="Numéro de châssis" error={errors.numero_chassis}>
                <input className="field-control" value={form.numero_chassis} onChange={(e) => set('numero_chassis', e.target.value)} />
              </Field>
              <Field label="Type de véhicule" error={errors.type_vehicule_id}>
                <select className="field-control" value={form.type_vehicule_id} onChange={(e) => set('type_vehicule_id', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {options.types_vehicules.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
              </Field>
              <Field label="Origine / Marque" error={errors.origine_marque_id}>
                <select className="field-control" value={form.origine_marque_id} onChange={(e) => set('origine_marque_id', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {options.origines_marques.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
                </select>
              </Field>
            </div>
          </section>

          {/* ── Section 3 : Usage & Prix ── */}
          <section className="surface-panel p-6">
            <h2 className="section-title mb-5">Usage & Prix</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <Field label="Usage du véhicule *" error={errors.type_usage}>
                <select className="field-control" value={form.type_usage}
                  onChange={(e) => setTypeUsage(e.target.value)} required>
                  {TYPE_USAGES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>

              {(form.type_usage === 'location' || form.type_usage === 'les_deux') && (
                <Field label="Tarif location (XOF / jour)" error={errors.prix}>
                  <input className="field-control" type="number" min="0"
                    value={form.prix} onChange={(e) => set('prix', e.target.value)} placeholder="0" />
                </Field>
              )}

              {(form.type_usage === 'vente' || form.type_usage === 'les_deux') && (
                <Field label="Prix de vente (XOF)" error={errors.prix_vente}>
                  <input className="field-control" type="number" min="0"
                    value={form.prix_vente} onChange={(e) => set('prix_vente', e.target.value)} placeholder="0" />
                </Field>
              )}

              <Field label="Date d'acquisition" error={errors.date_acquisition}>
                <input className="field-control" type="date"
                  value={form.date_acquisition} onChange={(e) => set('date_acquisition', e.target.value)} />
              </Field>
              <Field label="Fournisseur" error={errors.id_fournisseur}>
                <select className="field-control" value={form.id_fournisseur} onChange={(e) => set('id_fournisseur', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {options.fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </Field>
            </div>
          </section>

          {/* ── Section 4 : Description ── */}
          <section className="surface-panel p-6">
            <h2 className="section-title mb-5">Description</h2>
            <textarea
              className="field-control h-28 resize-none"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Informations complémentaires…"
            />
          </section>

          {/* ── Section 5 : Photos ── */}
          <section className="surface-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="section-title">Photos du véhicule</h2>
                <p className="mt-0.5 text-xs text-[#6b7280]">
                  {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''} · JPEG, PNG, GIF · Max 5 Mo
                </p>
              </div>
            </div>

            {/* Photos existantes */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Photos actuelles</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {existingImages.map((img, i) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded border border-[#dfe3eb] bg-[#f5f8fa]">
                      {imgUrl(img.chemin) && <Image src={imgUrl(img.chemin)!} alt={`photo ${i + 1}`} fill className="object-cover" />}
                      {i === 0 && existingImages[0] && (
                        <span className="absolute left-1 top-1 rounded bg-slate-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          Principale
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={deletingImg === img.id}
                        onClick={() => deleteExistingImage(img)}
                        className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700 group-hover:flex disabled:opacity-60"
                        title="Supprimer cette photo"
                      >
                        {deletingImg === img.id ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zone de dépôt nouvelles photos */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded border-2 border-dashed p-6 text-center transition
                ${dragging
                  ? 'border-[#374151] bg-slate-600/5'
                  : 'border-[#e8ecf0] bg-[#f5f8fa] hover:border-[#374151]/50'
                }`}
            >
              <svg className="mx-auto mb-2 h-8 w-8 text-[#e8ecf0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-sm font-semibold text-[#111827]">
                {dragging ? 'Déposez ici' : 'Ajouter de nouvelles photos'}
              </p>
              <p className="mt-0.5 text-xs text-[#6b7280]">Cliquez ou glissez-déposez</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)} />
            </div>

            {/* Aperçus nouvelles photos */}
            {pendingPreviews.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">
                  Nouvelles photos à ajouter ({pendingPreviews.length})
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {pendingPreviews.map((src, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded border border-[#374151]/40 bg-[#f5f8fa]">
                      <img src={src} alt={`nouvelle ${i + 1}`} className="h-full w-full object-cover" />
                      <span className="absolute left-1 top-1 rounded bg-[#185FA5]/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        Nouveau
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePending(i); }}
                        className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition group-hover:flex"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <Link href={`/voitures/${id}`} className="btn-secondary">Annuler</Link>
            <button type="submit" disabled={saving} className="btn-primary min-w-[160px]">
              {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
