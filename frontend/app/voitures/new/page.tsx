'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SelectOption { id: number; nom: string; }
interface FormOptions {
  types_vehicules: SelectOption[];
  origines_marques: SelectOption[];
}

const STATUTS = ['disponible', 'reserve', 'en_reparation'];
const ETATS   = ['neuf', 'occasion', 'accidente'];
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

export default function NewVoiturePage() {
  const router = useRouter();

  const [options, setOptions] = useState<FormOptions>({ types_vehicules: [], origines_marques: [] });
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  // Photos
  const [pendingFiles, setPendingFiles]     = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [dragging, setDragging]             = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulaire
  const [form, setForm] = useState({
    marque: '', modele: '', annee: '', couleur: '', prix: '',
    prix_vente: '', type_usage: 'les_deux',
    kilometrage: '', numero_chassis: '', date_acquisition: '',
    statut: 'disponible', etat: '', energie: '', type_boite: '',
    type_vehicule_id: '', origine_marque_id: '',
    description: '',
  });

  useEffect(() => {
    apiClient.get<FormOptions>('/voitures/form-options').then(setOptions).catch(() => {});
  }, []);

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

  function removeFile(i: number) {
    setPendingFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPendingPreviews((prev) => prev.filter((_, idx) => idx !== i));
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
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'prix' || k === 'prix_vente') return; // gérés séparément
      if (v) fd.append(k, v);
    });
    fd.append('prix',       isLocation ? (form.prix       || '') : '');
    fd.append('prix_vente', isVente    ? (form.prix_vente || '') : '');
    pendingFiles.forEach((f) => fd.append('images[]', f));

    try {
      const res: any = await apiClient.postForm('/voitures', fd);
      const id = res?.data?.id ?? res?.id;
      router.push(id ? `/voitures/${id}` : '/voitures');
    } catch (err: any) {
      if (err?.details) {
        const mapped: Record<string, string> = {};
        Object.entries(err.details).forEach(([k, v]) => { mapped[k] = (v as string[])[0]; });
        setErrors(mapped);
      }
      setGlobalError(err?.message || 'Erreur lors de la création');
      setSaving(false);
    }
  }

  return (
    <DashboardLayout allowedRoles={['admin', 'super_admin', 'manager']}>
      <div className="mx-auto max-w-4xl space-y-6">

        <div className="page-header">
          <div>
            <h1 className="page-title">Ajouter un véhicule</h1>
            <p className="page-subtitle">Renseignez les caractéristiques du nouveau véhicule à intégrer à la flotte.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/voitures" className="btn-secondary">Annuler</Link>
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
                <input className="field-control" value={form.marque} onChange={(e) => set('marque', e.target.value)} placeholder="Toyota, Renault…" required />
              </Field>
              <Field label="Modèle *" error={errors.modele}>
                <input className="field-control" value={form.modele} onChange={(e) => set('modele', e.target.value)} placeholder="Corolla, Clio…" required />
              </Field>
              <Field label="Année" error={errors.annee}>
                <input className="field-control" type="number" min="1900" max={new Date().getFullYear() + 1}
                  value={form.annee} onChange={(e) => set('annee', e.target.value)} placeholder="2022" />
              </Field>
              <Field label="Couleur" error={errors.couleur}>
                <input className="field-control" value={form.couleur} onChange={(e) => set('couleur', e.target.value)} placeholder="Blanc, Noir…" />
              </Field>
              <Field label="Statut *" error={errors.statut}>
                <select className="field-control" value={form.statut} onChange={(e) => set('statut', e.target.value)} required>
                  {STATUTS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </Field>
              <Field label="État" error={errors.etat}>
                <select className="field-control" value={form.etat} onChange={(e) => set('etat', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {ETATS.map((e) => (
                    <option key={e} value={e}>{e.replace(/^\w/, (c) => c.toUpperCase())}</option>
                  ))}
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
                  {ENERGIES.map((e) => (
                    <option key={e} value={e}>{e.replace(/^\w/, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </Field>
              <Field label="Boîte de vitesses" error={errors.type_boite}>
                <select className="field-control" value={form.type_boite} onChange={(e) => set('type_boite', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {BOITES.map((b) => (
                    <option key={b} value={b}>{b.replace(/^\w/, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </Field>
              <Field label="Kilométrage (km)" error={errors.kilometrage}>
                <input className="field-control" type="number" min="0"
                  value={form.kilometrage} onChange={(e) => set('kilometrage', e.target.value)} placeholder="0" />
              </Field>
              <Field label="Numéro de châssis" error={errors.numero_chassis}>
                <input className="field-control" value={form.numero_chassis} onChange={(e) => set('numero_chassis', e.target.value)}
                  placeholder="Généré automatiquement" />
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

              {/* Type d'usage — toujours visible en premier */}
              <Field label="Usage du véhicule *" error={errors.type_usage}>
                <select className="field-control" value={form.type_usage}
                  onChange={(e) => setTypeUsage(e.target.value)} required>
                  {TYPE_USAGES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>

              {/* Tarif journalier — visible si location ou les_deux */}
              {(form.type_usage === 'location' || form.type_usage === 'les_deux') && (
                <Field label="Tarif location (XOF / jour)" error={errors.prix}>
                  <input className="field-control" type="number" min="0"
                    value={form.prix} onChange={(e) => set('prix', e.target.value)} placeholder="0" />
                </Field>
              )}

              {/* Prix de vente — visible si vente ou les_deux */}
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
            </div>
          </section>

          {/* ── Section 4 : Description ── */}
          <section className="surface-panel p-6">
            <h2 className="section-title mb-5">Description</h2>
            <textarea
              className="field-control h-28 resize-none"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Informations complémentaires sur le véhicule…"
            />
          </section>

          {/* ── Section 5 : Photos ── */}
          <section className="surface-panel p-6">
            <h2 className="section-title mb-1">Photos du véhicule</h2>
            <p className="mb-4 text-xs text-[#6b7280]">JPEG, PNG, GIF · Max 5 Mo par photo · La première photo sera l&apos;image principale</p>

            {/* Zone de dépôt */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded border-2 border-dashed p-8 text-center transition
                ${dragging
                  ? 'border-[#374151] bg-[#f5f8fa]'
                  : 'border-[#e8ecf0] bg-[#f5f8fa] hover:border-[#374151]/50'
                }`}
            >
              <svg className="mx-auto mb-3 h-10 w-10 text-[#e8ecf0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-[#111827]">
                {dragging ? 'Déposez les photos ici' : 'Cliquez ou déposez vos photos ici'}
              </p>
              <p className="mt-1 text-xs text-[#6b7280]">Plusieurs fichiers acceptés</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)} />
            </div>

            {/* Aperçus */}
            {pendingPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {pendingPreviews.map((src, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded border border-[#dfe3eb] bg-[#f5f8fa]">
                    <img src={src} alt={`photo ${i + 1}`} className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-slate-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        Principale
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition group-hover:flex"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <Link href="/voitures" className="btn-secondary">Annuler</Link>
            <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
              {saving ? 'Enregistrement…' : 'Enregistrer le véhicule'}
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
