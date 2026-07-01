'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';

interface ContactMessage {
  id: number;
  nom: string;
  telephone?: string;
  email?: string;
  message: string;
  lu: boolean;
  created_at: string;
}

interface Pagination {
  data: ContactMessage[];
  current_page: number;
  last_page: number;
  total: number;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export default function MessagesPage() {
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<ContactMessage | null>(null);
  const [filter, setFilter]         = useState<'tous' | 'non_lus'>('tous');

  async function load() {
    setLoading(true);
    try {
      const data = await apiClient.get<Pagination>('/contact');
      setPagination(data);
    } catch {
      /* silencieux */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markRead(msg: ContactMessage) {
    if (!msg.lu) {
      await apiClient.patch(`/contact/${msg.id}/read`, {});
      setPagination((prev) => prev ? {
        ...prev,
        data: prev.data.map((m) => m.id === msg.id ? { ...m, lu: true } : m),
      } : null);
    }
    setSelected({ ...msg, lu: true });
  }

  const messages = pagination?.data ?? [];
  const filtered = filter === 'non_lus' ? messages.filter((m) => !m.lu) : messages;
  const nonLusCount = messages.filter((m) => !m.lu).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="page-header">
          <div>
            <h1 className="page-title mt-1">Messages</h1>
            <p className="page-subtitle">Demandes de contact reçues depuis le site.</p>
          </div>
        </div>

        {nonLusCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-bold text-amber-700">{nonLusCount} non lu{nonLusCount > 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">

          {/* Liste */}
          <div className="flex-1 min-w-0">
            {/* Filtres */}
            <div className="mb-4 flex gap-2">
              {(['tous', 'non_lus'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                    filter === f ? 'bg-[#185FA5] text-white' : 'bg-white text-[#6b7280] ring-1 ring-[#dfe3eb] hover:ring-[#185FA5]'
                  }`}>
                  {f === 'tous' ? `Tous (${messages.length})` : `Non lus (${nonLusCount})`}
                </button>
              ))}
              <button onClick={load}
                className="ml-auto flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#6b7280] ring-1 ring-[#dfe3eb] transition hover:ring-[#185FA5]">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#dfe3eb] bg-white text-center">
                <svg className="h-10 w-10 text-[#dfe3eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z" />
                </svg>
                <p className="text-sm font-semibold text-[#9ca3af]">Aucun message</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((msg) => (
                  <button key={msg.id} onClick={() => markRead(msg)}
                    className={`w-full rounded-xl border p-4 text-left transition hover:shadow-sm ${
                      selected?.id === msg.id
                        ? 'border-[#185FA5] bg-[#eff6ff]'
                        : msg.lu
                          ? 'border-[#dfe3eb] bg-white'
                          : 'border-[#1d6fb8]/30 bg-[#eff6ff]/50'
                    }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar initiales */}
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                          msg.lu ? 'bg-slate-100 text-slate-500' : 'bg-[#185FA5] text-white'
                        }`}>
                          {msg.nom.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold truncate ${msg.lu ? 'text-[#374151]' : 'text-[#111827]'}`}>
                              {msg.nom}
                            </p>
                            {!msg.lu && (
                              <span className="shrink-0 h-2 w-2 rounded-full bg-[#1d6fb8]" />
                            )}
                          </div>
                          <p className="text-xs text-[#9ca3af] truncate">{msg.message}</p>
                        </div>
                      </div>
                      <p className="shrink-0 text-[10px] text-[#9ca3af] whitespace-nowrap">
                        {formatDate(msg.created_at)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détail */}
          <div className="lg:w-96 shrink-0">
            {selected ? (
              <div className="rounded-2xl border border-[#dfe3eb] bg-white p-6">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#185FA5] text-lg font-black text-white">
                    {selected.nom.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-[#111827]">{selected.nom}</p>
                    <p className="text-xs text-[#9ca3af]">{formatDate(selected.created_at)}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {selected.telephone && (
                    <div className="flex items-center gap-2 text-[#374151]">
                      <svg className="h-4 w-4 shrink-0 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${selected.telephone}`} className="hover:text-[#185FA5] hover:underline">
                        {selected.telephone}
                      </a>
                    </div>
                  )}
                  {selected.email && (
                    <div className="flex items-center gap-2 text-[#374151]">
                      <svg className="h-4 w-4 shrink-0 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${selected.email}`} className="hover:text-[#185FA5] hover:underline truncate">
                        {selected.email}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-xl bg-[#f5f8fa] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Message</p>
                  <p className="text-sm leading-6 text-[#374151] whitespace-pre-wrap">{selected.message}</p>
                </div>

                {selected.telephone && (
                  <a href={`tel:${selected.telephone}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90"
                    style={{ backgroundColor: '#185FA5' }}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Rappeler {selected.nom}
                  </a>
                )}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#dfe3eb] bg-white text-center">
                <svg className="h-10 w-10 text-[#dfe3eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z" />
                </svg>
                <p className="text-sm text-[#9ca3af]">Sélectionnez un message</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
