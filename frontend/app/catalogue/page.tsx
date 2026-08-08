'use client';

import PublicLayout from '@/components/PublicLayout';
import { apiClient } from '@/lib/api';
import { useReveal } from '@/lib/useReveal';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface VoitureImage { id: number; chemin: string; ordre?: number; }
interface Voiture {
  id: number; marque: string; modele: string; annee?: number;
  prix?: number; prix_vente?: number; energie?: string; kilometrage?: number;
  statut?: string; type_usage?: string; image_principale?: string;
  images?: VoitureImage[]; likes_count?: number;
}
interface Meta { current_page: number; last_page: number; total: number; per_page: number; }

const ENERGIES   = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'];
const SORT_OPTS  = ['Les plus récents', 'Prix croissant', 'Prix décroissant', 'Kilométrage'];

function money(v?: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0);
}
function imgUrl(p?: string | null) {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  return `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/storage/${p}`;
}
function buildPhotos(v: Voiture): string[] {
  const fromGallery = (v.images ?? [])
    .slice().sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
    .map((img) => imgUrl(img.chemin)).filter(Boolean) as string[];
  if (fromGallery.length > 0) return fromGallery.slice(0, 4);
  const main = imgUrl(v.image_principale);
  return main ? [main] : [];
}

// ── Car Card ──────────────────────────────────────────────────────────────────
function VehicleCard({ v }: { v: Voiture }) {
  const photos = buildPhotos(v);
  const [idx, setIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(v.likes_count ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), 2500);
    return () => clearInterval(t);
  }, [photos.length]);

  useEffect(() => {
    try {
      if (localStorage.getItem(`sp_like_${v.id}`) === '1') setLiked(true);
    } catch {}
  }, [v.id]);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL ?? '/api');
      const res = await fetch(`${base}/voitures/${v.id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikesCount(data.likes_count);
        try {
          if (data.liked) localStorage.setItem(`sp_like_${v.id}`, '1');
          else localStorage.removeItem(`sp_like_${v.id}`);
        } catch {}
      }
    } catch {}
    setLikeLoading(false);
  }

  const isLocation = v.type_usage === 'location' || v.type_usage === 'les_deux';
  const isVente    = v.type_usage === 'vente'    || v.type_usage === 'les_deux';
  const badge = v.type_usage === 'les_deux' ? null
    : v.type_usage === 'location' ? { label: 'Location', style: { background: '#FAEEDA', color: '#854F0B' } }
    : { label: 'Vente', style: { background: '#EAF3DE', color: '#3B6D11' } };

  return (
    <Link
      href={`/catalogue/${v.id}`}
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff', border: '0.5px solid #e8ecf0', borderRadius: 8, textDecoration: 'none', transition: 'box-shadow .15s' }}
      className="hover:shadow-md"
    >
      {/* Image */}
      <div style={{ height: 110, background: '#E6F1FB', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {photos.length === 0 ? (
          <svg width={36} height={36} fill="none" stroke="#378ADD" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
              d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
          </svg>
        ) : photos.map((src, i) => (
          <Image key={i} src={src} alt={`${v.marque} ${v.modele}`} fill
            className="object-cover transition-opacity duration-500"
            style={{ opacity: i === idx ? 1 : 0 }} />
        ))}

        {/* Badge type */}
        {badge && (
          <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, ...badge.style }}>
            {badge.label}
          </span>
        )}
        {v.type_usage === 'les_deux' && (
          <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#E6F1FB', color: '#185FA5' }}>
            Location · Vente
          </span>
        )}
        {/* Heart */}
        <button
          onClick={toggleLike}
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          style={{
            position: 'absolute', top: 8, right: 8,
            minWidth: 24, height: 24,
            borderRadius: 12,
            background: liked ? '#FEF2F2' : '#fff',
            border: `0.5px solid ${liked ? '#FECACA' : '#e8ecf0'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: likeLoading ? 'default' : 'pointer',
            color: liked ? '#EF4444' : '#9ca3af',
            padding: '0 5px', gap: 3,
            opacity: likeLoading ? 0.6 : 1,
            transition: 'all .15s',
          }}
        >
          <svg width={12} height={12} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likesCount > 0 && <span style={{ fontSize: 10, fontWeight: 500 }}>{likesCount}</span>}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>{v.marque} {v.modele} {v.annee}</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
          {v.type_usage === 'location' ? 'Location' : v.type_usage === 'vente' ? 'Vente' : 'Location · Vente'}{v.energie ? ` · ${v.energie}` : ''}
        </div>

        {/* Specs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {v.energie && (
            <span style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              {v.energie}
            </span>
          )}
          {v.kilometrage !== undefined && (
            <span style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {money(v.kilometrage)} km
            </span>
          )}
        </div>

        {/* Prix */}
        <div style={{ marginBottom: 8, marginTop: 'auto' }}>
          {isLocation && v.prix && (
            <div style={{ fontSize: 15, fontWeight: 500, color: '#185FA5' }}>{money(v.prix)} XOF<span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>/j</span></div>
          )}
          {isVente && v.prix_vente && (
            <div style={{ fontSize: isLocation ? 13 : 15, fontWeight: 500, color: isLocation ? '#3B6D11' : '#185FA5' }}>{money(v.prix_vente)} XOF{isLocation && <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}> achat</span>}</div>
          )}
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ flex: 1, fontSize: 11, padding: '5px 0', borderRadius: 6, cursor: 'pointer', border: '0.5px solid #e8ecf0', background: 'transparent', color: '#374151' }}>
            Voir détails
          </button>
          <button style={{ flex: 1, fontSize: 11, padding: '5px 0', borderRadius: 6, cursor: 'pointer', border: '0.5px solid #185FA5', background: '#185FA5', color: '#E6F1FB' }}>
            Contacter
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CataloguePage() {
  const _initCat = apiClient.getCached<any>('/voitures/public', { page: 1, per_page: 12 });
  const [voitures, setVoitures] = useState<Voiture[]>(_initCat?.data ?? []);
  const [meta, setMeta]         = useState<Meta | null>(_initCat?.meta ?? null);
  const [loading, setLoading]   = useState(_initCat === null);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [energie, setEnergie]   = useState('');
  const [typeUsage, setTypeUsage] = useState('');
  const [sortVal, setSortVal]   = useState(SORT_OPTS[0]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useReveal([voitures]);

  const load = useCallback(async (p: number, q: string, e: string, t: string) => {
    setLoading(true);
    try {
      const res: any = await apiClient.getPublicVoitures({ page: p, search: q || undefined, energie: e || undefined, type_usage: t || undefined, per_page: 12 });
      setVoitures(res?.data ?? []);
      setMeta(res?.meta ?? null);
    } catch { setVoitures([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1, '', '', ''); }, [load]);

  function onSearch(v: string) {
    setSearch(v); setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, v, energie, typeUsage), 400);
  }
  function onEnergie(v: string)    { setEnergie(v);    setPage(1); load(1, search, v, typeUsage); }
  function onTypeUsage(v: string)  { setTypeUsage(v);  setPage(1); load(1, search, energie, v); }
  function goPage(p: number)       { setPage(p); load(p, search, energie, typeUsage); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function reset()                 { setSearch(''); setEnergie(''); setTypeUsage(''); setPage(1); load(1, '', '', ''); }

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <div style={{ background: '#E6F1FB', padding: '28px 20px', textAlign: 'center' }}>
        <h1 className="reveal" style={{ fontSize: 22, fontWeight: 500, color: '#0C447C', marginBottom: 6 }}>
          Trouvez votre véhicule idéal
        </h1>
        <p className="reveal d-100" style={{ fontSize: 13, color: '#185FA5', marginBottom: 16 }}>
          {meta ? `Plus de ${meta.total} véhicule${meta.total > 1 ? 's' : ''} disponible${meta.total > 1 ? 's' : ''} au Sénégal` : 'Parcourez notre flotte disponible'}
        </p>
        {/* Search bar */}
        <div className="reveal d-200" style={{ display: 'flex', gap: 8, maxWidth: 560, margin: '0 auto', background: '#fff', border: '0.5px solid #B5D4F4', borderRadius: 8, padding: '8px 12px', alignItems: 'center' }}>
          <svg width={16} height={16} fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Marque, modèle, mot-clé..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: '#111827' }}
          />
          <div style={{ width: '0.5px', height: 20, background: '#dfe3eb' }} />
          <select
            value={typeUsage}
            onChange={(e) => onTypeUsage(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: '#6b7280', cursor: 'pointer' }}
          >
            <option value="">Location & Vente</option>
            <option value="location">Location</option>
            <option value="vente">Vente</option>
          </select>
          <div style={{ width: '0.5px', height: 20, background: '#dfe3eb' }} />
          <select
            value={energie}
            onChange={(e) => onEnergie(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: '#6b7280', cursor: 'pointer' }}
          >
            <option value="">Toutes énergies</option>
            {ENERGIES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <button
            onClick={() => load(page, search, energie, typeUsage)}
            style={{ background: '#185FA5', color: '#E6F1FB', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, padding: '14px 20px', borderBottom: '0.5px solid #e8ecf0' }}>
        {[
          { num: meta?.total ?? '—', lbl: 'Véhicules disponibles' },
          { num: voitures.filter((v) => v.type_usage === 'vente' || v.type_usage === 'les_deux').length || '—', lbl: 'À la vente' },
          { num: voitures.filter((v) => v.type_usage === 'location' || v.type_usage === 'les_deux').length || '—', lbl: 'À la location' },
        ].map((s) => (
          <div key={s.lbl} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#185FA5' }}>{s.num}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Body (sidebar + main) ── */}
      <div style={{ display: 'flex' }}>

        {/* Sidebar filtres */}
        <aside style={{ width: 200, minWidth: 200, borderRight: '0.5px solid #e8ecf0', padding: 16, fontSize: 12 }}>

          <p style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Carburant</p>
          {ENERGIES.map((e) => (
            <label key={e} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#111827', marginBottom: 5, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={energie === '' || energie === e}
                onChange={() => onEnergie(energie === e ? '' : e)}
                style={{ accentColor: '#185FA5' }}
              />
              {e}
            </label>
          ))}

          <p style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', margin: '14px 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type</p>
          {[{ v: '', l: 'Tous' }, { v: 'location', l: 'Location' }, { v: 'vente', l: 'Vente' }].map((o) => (
            <label key={o.v} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#111827', marginBottom: 5, cursor: 'pointer' }}>
              <input type="radio" name="typeUsage" checked={typeUsage === o.v} onChange={() => onTypeUsage(o.v)} style={{ accentColor: '#185FA5' }} />
              {o.l}
            </label>
          ))}

          <p style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', margin: '14px 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Kilométrage</p>
          {[{ l: 'Moins de 50 000 km', v: '50000' }, { l: '50 000 – 150 000', v: '150000' }, { l: 'Plus de 150 000', v: 'all' }].map((o) => (
            <label key={o.v} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#111827', marginBottom: 5, cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#185FA5' }} />
              {o.l}
            </label>
          ))}

          {(search || energie || typeUsage) && (
            <button
              onClick={reset}
              style={{ width: '100%', marginTop: 16, padding: '6px 0', fontSize: 12, border: '0.5px solid #dfe3eb', borderRadius: 6, background: 'transparent', color: '#6b7280', cursor: 'pointer' }}
            >
              Réinitialiser les filtres
            </button>
          )}
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, padding: 16 }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              {meta ? `${meta.total} véhicule${meta.total > 1 ? 's' : ''} trouvé${meta.total > 1 ? 's' : ''}` : 'Chargement…'}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={sortVal}
                onChange={(e) => setSortVal(e.target.value)}
                style={{ fontSize: 12, padding: '4px 8px', border: '0.5px solid #dfe3eb', borderRadius: 6, background: 'transparent', color: '#374151', cursor: 'pointer' }}
              >
                {SORT_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Grille */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 240, background: '#E6F1FB', borderRadius: 8, border: '0.5px solid #e8ecf0' }} className="animate-pulse" />
              ))}
            </div>
          ) : voitures.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <svg style={{ width: 48, height: 48, color: '#9ca3af', margin: '0 auto 12px', display: 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
              </svg>
              <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Aucun véhicule trouvé</p>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Modifiez vos filtres ou revenez plus tard.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
              {voitures.map((v, i) => (
                <div key={v.id} className={`reveal-scale ${['d-100','d-200','d-300','d-400'][i % 4]}`}>
                  <VehicleCard v={v} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
              <button
                onClick={() => goPage(page - 1)}
                disabled={page <= 1}
                style={{ width: 30, height: 30, border: '0.5px solid #dfe3eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: page <= 1 ? 'not-allowed' : 'pointer', background: 'transparent', color: '#374151', opacity: page <= 1 ? 0.4 : 1 }}
              >
                ‹
              </button>
              {Array.from({ length: Math.min(meta.last_page, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goPage(p)}
                  style={{ width: 30, height: 30, border: '0.5px solid', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer', borderColor: p === page ? '#185FA5' : '#dfe3eb', background: p === page ? '#185FA5' : 'transparent', color: p === page ? '#E6F1FB' : '#374151' }}
                >
                  {p}
                </button>
              ))}
              {meta.last_page > 7 && <button style={{ width: 30, height: 30, border: '0.5px solid #dfe3eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'default', background: 'transparent', color: '#9ca3af' }}>…</button>}
              <button
                onClick={() => goPage(page + 1)}
                disabled={page >= meta.last_page}
                style={{ width: 30, height: 30, border: '0.5px solid #dfe3eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: page >= meta.last_page ? 'not-allowed' : 'pointer', background: 'transparent', color: '#374151', opacity: page >= meta.last_page ? 0.4 : 1 }}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
