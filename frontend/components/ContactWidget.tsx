'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

const NAVY = '#185FA5';

export default function ContactWidget() {
  const [open, setOpen]       = useState(false);
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [form, setForm]       = useState({ nom: '', telephone: '', email: '', message: '' });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiClient.post('/contact', form);
      setSent(true);
      setForm({ nom: '', telephone: '', email: '', message: '' });
    } catch {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => setSent(false), 400);
  }

  const inputCls = 'w-full rounded-lg border border-[#dfe3eb] bg-[#f5f8fa] px-3 py-2 text-sm text-[#374151] placeholder:text-[#9ca3af] outline-none focus:border-[#1d6fb8] focus:bg-white focus:ring-2 focus:ring-[#1d6fb8]/20 transition';

  return (
    <>
      {/* Panneau */}
      <div className={`fixed bottom-20 right-20 z-50 w-[300px] max-w-[calc(100vw-2rem)] transition-all duration-300 ${
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`} style={{ maxHeight: 'calc(100vh - 9rem)' }}>
        <div className="rounded-xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden flex flex-col" style={{ maxHeight: 'inherit' }}>

          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3" style={{ backgroundColor: NAVY }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-white">Nous contacter</p>
                <p className="text-xs text-white/60">Réponse sous 24h</p>
              </div>
            </div>
            <button onClick={handleClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Corps */}
          <div className="p-4 overflow-y-auto flex-1">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-black text-[#111827]">Message envoyé !</p>
                <p className="text-sm text-[#6b7280]">Notre équipe vous répondra dans les plus brefs délais.</p>
                <button onClick={handleClose}
                  className="mt-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ backgroundColor: NAVY }}>
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
                )}

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#374151]">Nom complet *</label>
                  <input className={inputCls} placeholder="Votre nom" required
                    value={form.nom} onChange={(e) => set('nom', e.target.value)} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#374151]">Téléphone</label>
                  <input className={inputCls} placeholder="+221 77 000 00 00" type="tel"
                    value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#374151]">Email</label>
                  <input className={inputCls} placeholder="vous@exemple.com" type="email"
                    value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#374151]">Message *</label>
                  <textarea className={`${inputCls} h-20 resize-none`}
                    placeholder="Comment pouvons-nous vous aider ?"
                    required value={form.message} onChange={(e) => set('message', e.target.value)} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-black text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: NAVY }}>
                  {loading ? 'Envoi en cours…' : 'Envoyer le message'}
                </button>

                <p className="text-center text-[10px] text-[#9ca3af]">
                  Aucune identification requise
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bouton flottant */}
      <button
        onClick={() => { setOpen((v) => !v); if (sent) setSent(false); }}
        className="fixed bottom-5 right-20 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
        style={{ backgroundColor: NAVY }}
        aria-label="Nous contacter">
        {open ? (
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z" />
          </svg>
        )}
        {/* Indicateur "en ligne" */}
        <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
      </button>
    </>
  );
}
