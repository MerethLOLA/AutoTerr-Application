'use client';

import ConfirmDialog from '@/components/ConfirmDialog';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRole } from '@/lib/useRole';

const STORAGE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '');
function imgUrl(p?: string | null) {
  return p ? `${STORAGE_URL}/storage/${p}` : null;
}
function money(v?: number | string | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v ?? 0));
}

const STATUT: Record<string, { label: string; cls: string }> = {
  disponible:    { label: 'Disponible',    cls: 'badge-active' },
  vendu:         { label: 'Vendu',         cls: 'badge-info' },
  en_location:   { label: 'En location',   cls: 'badge-pending' },
  reserve:       { label: 'Réservé',       cls: 'badge-pending' },
  en_reparation: { label: 'En réparation', cls: 'badge-neutral' },
};

export default function VoitureDetailPage() {
  const { canWrite } = useRole();
  const { id } = useParams();
  const router = useRouter();
  const _initV = id ? apiClient.getCached<any>(`/voitures/${id}`) : null;
  const [voiture, setVoiture] = useState<any>(_initV?.data ?? _initV ?? null);
  const [loading, setLoading] = useState(_initV === null);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  async function handleDelete() {
    if (!voiture) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/voitures/${voiture.id}`);
      router.push('/voitures');
    } catch (err: any) {
      alert(err?.message || 'Impossible de supprimer ce véhicule.');
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get(`/voitures/${id}`)
      .then((res: any) => setVoiture(res?.data ?? res))
      .catch(() => setVoiture(null))
      .finally(() => setLoading(false));
  }, [id]);

  const gallery: any[] = voiture?.images ?? [];
  const images: any[] = gallery.length > 0
    ? gallery
    : voiture?.image_principale
      ? [{ id: 'main', chemin: voiture.image_principale }]
      : [];
  const count = images.length;

  const goTo = useCallback((i: number) => {
    setSelected(i);
    const el = thumbsRef.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, []);

  const prev = useCallback(() => goTo((selected - 1 + count) % count), [goTo, selected, count]);
  const next = useCallback(() => goTo((selected + 1) % count), [goTo, selected, count]);

  // Auto-avance toutes les 4 secondes (pause au survol)
  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => setSelected((s) => (s + 1) % count), 4000);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 rounded-2xl" style={{ background: 'var(--color-border-tertiary)' }} />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="aspect-video rounded-2xl" style={{ background: 'var(--color-border-tertiary)' }} />
            <div className="space-y-4">
              <div className="h-8 w-48 rounded" style={{ background: 'var(--color-border-tertiary)' }} />
              <div className="h-24 rounded-2xl" style={{ background: 'var(--color-border-tertiary)' }} />
              <div className="h-40 rounded-2xl" style={{ background: 'var(--color-border-tertiary)' }} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!voiture) {
    return (
      <DashboardLayout>
        <div className="surface-panel py-20 text-center">
          <p className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Véhicule introuvable.</p>
          <Link href="/voitures" className="mt-4 inline-block text-sm font-bold hover:underline" style={{ color: 'var(--color-text-primary)' }}>
            ← Retour à la liste
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const st = STATUT[voiture.statut] ?? { label: voiture.statut, cls: 'badge-neutral' };
  const dispo = voiture.statut === 'disponible';

  const specs = [
    { label: 'Modèle', value: voiture.modele },
    { label: 'Kilométrage', value: voiture.kilometrage != null ? `${money(voiture.kilometrage)} km` : null },
    { label: 'Énergie', value: voiture.energie },
    { label: 'Boîte', value: voiture.type_boite },
    { label: 'Couleur', value: voiture.couleur },
    { label: 'Numéro de châssis', value: voiture.numero_chassis },
    { label: 'Type de véhicule', value: voiture.type_vehicule?.nom },
    { label: 'Origine', value: voiture.origine_marque?.nom },
    { label: "Date d'acquisition", value: voiture.date_acquisition },
  ].filter((s) => s.value);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <Link href="/voitures" className="font-semibold hover:underline" style={{ color: 'var(--color-text-secondary)' }}>Véhicules</Link>
          <span>/</span>
          <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{voiture.marque} {voiture.modele}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* ── Galerie carousel ── */}
          <div className="space-y-3">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border select-none"
              style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-secondary)' }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {images.length > 0 ? (
                images.map((img: any, i: number) => imgUrl(img.chemin) ? (
                  <Image
                    key={img.id ?? i}
                    src={imgUrl(img.chemin)!}
                    alt={`${voiture.marque} ${voiture.modele} — photo ${i + 1}`}
                    fill
                    className="object-cover"
                    style={{
                      opacity: i === selected ? 1 : 0,
                      transition: 'opacity 0.5s ease',
                      zIndex: i === selected ? 1 : 0,
                    }}
                  />
                ) : null)
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                      d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5M5 11H3a1 1 0 00-1 1v1a1 1 0 001 1h2m14-2h2a1 1 0 011 1v1a1 1 0 01-1 1h-2" />
                  </svg>
                  <span className="text-sm">Aucune photo disponible</span>
                </div>
              )}

              {/* Statut badge */}
              <span className={`status-badge absolute left-3 top-3 z-10 ${st.cls} font-bold uppercase tracking-wide`}>
                {st.label}
              </span>

              {/* Flèches de navigation */}
              {count > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Photo précédente"
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/65"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Photo suivante"
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/65"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Indicateurs */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {images.map((_: any, i: number) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Photo ${i + 1}`}
                        onClick={() => goTo(i)}
                        className={`rounded-full transition-all duration-300 ${
                          i === selected ? 'h-2 w-6 bg-white' : 'h-2 w-2 bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Compteur */}
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs font-bold text-white">
                    {selected + 1} / {count}
                  </span>
                </>
              )}
            </div>

            {/* Miniatures */}
            {count > 1 && (
              <div ref={thumbsRef} className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <button
                    key={img.id ?? i}
                    type="button"
                    onClick={() => goTo(i)}
                    className="shrink-0 overflow-hidden rounded-xl border-2 transition-all"
                    style={
                      selected === i
                        ? { borderColor: 'var(--color-accent)', transform: 'scale(1.05)', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }
                        : { borderColor: 'var(--color-border-tertiary)' }
                    }
                  >
                    {imgUrl(img.chemin) && <Image src={imgUrl(img.chemin)!} alt={`vue ${i + 1}`} width={80} height={64} className="object-cover" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Infos & Actions ── */}
          <div className="space-y-5">

            {/* Titre */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-secondary)' }}>
                {voiture.annee}{voiture.energie ? ` · ${voiture.energie}` : ''}
              </p>
              <h1 className="page-title mt-1">
                {voiture.marque} {voiture.modele}
              </h1>
            </div>

            {/* Prix */}
            <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-secondary)' }}>
              {voiture.type_usage !== 'vente' && voiture.prix != null && (
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Tarif location</p>
                  <p className="mt-1 text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                    {money(voiture.prix)}
                    <span className="ml-2 text-base font-bold" style={{ color: 'var(--color-text-secondary)' }}>XOF/jour</span>
                  </p>
                </div>
              )}
              {voiture.type_usage !== 'location' && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Prix de vente</p>
                  <p className="mt-1 text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                    {voiture.prix_vente != null ? money(voiture.prix_vente) : '—'}
                    <span className="ml-2 text-base font-bold" style={{ color: 'var(--color-text-secondary)' }}>XOF</span>
                  </p>
                </div>
              )}
              {voiture.garantie && (
                <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--color-success-text)' }}>
                  ✓ Garantie {voiture.garantie.type_garantie} jusqu&apos;au {voiture.garantie.date_fin}
                </p>
              )}
            </div>

            {/* Actions principales */}
            {dispo ? (
              <div className="space-y-2">
                <Link href={`/ventes?voiture_id=${voiture.id}`}
                  className="flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-sm font-black shadow-sm transition active:scale-95"
                  style={{ borderColor: 'var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-background-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-background-primary)'; }}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Créer une vente pour ce véhicule
                </Link>
                <Link href={`/locations?voiture_id=${voiture.id}`}
                  className="flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-sm font-bold transition"
                  style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-background-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-background-primary)'; }}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Mettre en location
                </Link>
              </div>
            ) : (
              <div className={`status-badge block rounded-2xl border-0 p-4 text-center text-sm font-semibold ${st.cls}`}>
                Ce véhicule n&apos;est pas disponible à la vente ({st.label.toLowerCase()}).
              </div>
            )}

            {/* Actions secondaires */}
            <div className="flex flex-wrap gap-2">
              {canWrite('voitures') && (
                <Link href={`/voitures/${voiture.id}/edit`}
                  className="flex-1 rounded-xl border py-2.5 text-center text-sm font-bold transition"
                  style={{ borderColor: 'var(--color-border-tertiary)', color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-background-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Modifier
                </Link>
              )}
              <Link href={`/voitures/${voiture.id}/historique`}
                className="flex-1 rounded-xl border py-2.5 text-center text-sm font-bold transition"
                style={{ borderColor: 'var(--color-accent)', background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-accent-light)'; }}
              >
                Historique
              </Link>
              <Link href={`/garanties?voiture_id=${voiture.id}`}
                className="flex-1 rounded-xl border py-2.5 text-center text-sm font-bold transition"
                style={{ borderColor: 'var(--color-border-tertiary)', color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-background-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Garantie
              </Link>
              <Link href={`/sav?voiture_id=${voiture.id}`}
                className="flex-1 rounded-xl border py-2.5 text-center text-sm font-bold transition"
                style={{ borderColor: 'var(--color-border-tertiary)', color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-background-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                SAV
              </Link>
              {canWrite('voitures') && (
                <button type="button" onClick={() => setConfirmOpen(true)} disabled={deleting}
                  className="flex-1 rounded-xl border py-2.5 text-center text-sm font-bold transition disabled:opacity-50"
                  style={{ borderColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-danger-bg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {deleting ? 'Suppression…' : 'Supprimer'}
                </button>
              )}
            </div>

            <ConfirmDialog
              isOpen={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={handleDelete}
              title="Supprimer ce véhicule"
              message={`Supprimer définitivement ${voiture.marque} ${voiture.modele} ? Cette action est irréversible.`}
              confirmLabel="Supprimer"
              loading={deleting}
              type="danger"
            />

            {/* Caractéristiques */}
            <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--color-border-tertiary)' }}>
              <h2 className="mb-4 text-sm font-black uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Caractéristiques</h2>
              <dl className="space-y-2.5">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
                    <dt className="shrink-0 font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</dt>
                    <dd className="text-right font-semibold" style={{ color: 'var(--color-text-primary)' }}>{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Description */}
            {voiture.description && (
              <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--color-border-tertiary)' }}>
                <h2 className="mb-3 text-sm font-black uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Description</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{voiture.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Historique des ventes */}
        {(voiture.ventes?.length ?? 0) > 0 && (
          <div className="surface-panel p-6">
            <h2 className="section-title mb-4">Historique des ventes</h2>
            <div className="divide-y" style={{ borderColor: 'var(--color-border-tertiary)' }}>
              {voiture.ventes.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{v.reference_vente}</span>
                  <span className="font-black" style={{ color: 'var(--color-text-primary)' }}>{money(v.prix_final)} XOF</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
