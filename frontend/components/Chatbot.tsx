'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

const NAVY = '#185FA5';
const BLUE = '#1d6fb8';
const API  = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  role:    'user' | 'assistant';
  content: string;
}

interface Message {
  id:      string;
  from:    'bot' | 'user';
  text:    string;
  links?:  { label: string; href: string }[];
  error?:  boolean;
}

// ── Extraction des liens (/path) depuis la réponse ────────────────────────────

const ROUTE_MAP: Record<string, string> = {
  '/dashboard':          'Tableau de bord',
  '/voitures':           'Véhicules',
  '/voitures/new':       'Ajouter un véhicule',
  '/locations':          'Locations',
  '/ventes/historique':  'Ventes',
  '/clients':            'Clients',
  '/facturations':       'Facturation',
  '/paiements':          'Paiements',
  '/demandes':           'Demandes',
  '/stock':              'Stock',
  '/employes':           'Employés',
  '/sav':                'SAV',
  '/atelier':            'Atelier',
  '/planning':           'Planning',
  '/reporting':          'Reporting',
  '/alertes':            'Alertes',
  '/settings':           'Paramètres',
  '/catalogue':          'Catalogue',
  '/espace-client':      'Espace client',
  '/inscription':        'Inscription',
  '/assurances':         'Assurances',
  '/garanties':          'Garanties',
  '/entretiens':         'Entretiens',
  '/documents':          'Documents',
};

function extractLinks(text: string): { label: string; href: string }[] {
  const found: { label: string; href: string }[] = [];
  const seen = new Set<string>();

  for (const [route, label] of Object.entries(ROUTE_MAP)) {
    if (text.includes(route) && !seen.has(route)) {
      found.push({ label, href: route });
      seen.add(route);
    }
  }

  return found.slice(0, 4);
}

// ── Rendu du texte avec **gras** ──────────────────────────────────────────────

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isBot = msg.from === 'bot';

  return (
    <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end' }}>
      <div style={{ maxWidth: '88%' }}>
        <div style={{
          padding: '9px 13px',
          borderRadius: isBot ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
          background: isBot ? (msg.error ? '#fff5f5' : '#f0f4fb') : NAVY,
          color: isBot ? (msg.error ? '#c53030' : '#1f2937') : '#fff',
          fontSize: 13, lineHeight: 1.55,
          border: msg.error ? '1px solid #fed7d7' : 'none',
        }}>
          <RichText text={msg.text} />
        </div>

        {msg.links && msg.links.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {msg.links.map((l) => (
              <Link key={l.href} href={l.href} style={{
                fontSize: 11, fontWeight: 600, padding: '3px 9px',
                borderRadius: 20, background: '#ebf1fb', color: BLUE,
                textDecoration: 'none', border: `1px solid ${BLUE}33`,
                whiteSpace: 'nowrap',
              }}>
                {l.label} →
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Indicateur "en train d'écrire" ────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{
        padding: '10px 14px', borderRadius: '12px 12px 12px 2px',
        background: '#f0f4fb', display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#9ca3af',
            animation: 'bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
        <style>{`
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

const WELCOME: Message = {
  id:   'welcome',
  from: 'bot',
  text: 'Bonjour ! Je suis l\'assistant IA d\'AutoTerr. Comment puis-je vous aider ?',
};

export function Chatbot() {
  const { data: session } = useSession();
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState('');
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [loading,  setLoading]  = useState(false);
  const [history,  setHistory]  = useState<HistoryEntry[]>([]);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), from: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = (session as any)?.token;
      const res = await fetch(`${API}/api/chatbot/message`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body:    JSON.stringify({ message: text, history }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error ?? 'Erreur inconnue');
      }

      const reply     = json.reply as string;
      const links     = extractLinks(reply);
      const botMsg: Message = { id: crypto.randomUUID(), from: 'bot', text: reply, links };

      setMessages((prev) => [...prev, botMsg]);
      setHistory((prev) => {
        const next: HistoryEntry[] = [
          ...prev,
          { role: 'user',      content: text  },
          { role: 'assistant', content: reply },
        ];
        return next.slice(-20);
      });

    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id:    crypto.randomUUID(),
        from:  'bot',
        text:  err.message?.includes('configuré')
          ? err.message
          : 'Une erreur est survenue. Vérifiez votre connexion et réessayez.',
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fermer l\'assistant' : 'Ouvrir l\'assistant IA'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
          width: 54, height: 54, borderRadius: '50%',
          background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`,
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(26,52,97,0.40)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform .2s, box-shadow .2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}
      >
        {open ? (
          <svg width={20} height={20} fill="none" stroke="#fff" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.svg" alt="AutoTerr" width={20} height={20} />
          </div>
        )}
      </button>

      {/* Panneau chat */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 9999,
          width: 348, maxHeight: 500,
          background: '#fff', borderRadius: 16,
          boxShadow: '0 12px 48px rgba(26,52,97,0.18)',
          display: 'flex', flexDirection: 'column',
          border: '1px solid #e5eaf2', overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
            padding: '13px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.svg" alt="AutoTerr" width={20} height={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>
                Assistant AutoTerr IA
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                Propulsé par Claude · {loading ? 'En train de répondre…' : 'En ligne'}
              </p>
            </div>
            <button
              onClick={() => { setMessages([WELCOME]); setHistory([]); }}
              title="Nouvelle conversation"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,0.7)', borderRadius: 6 }}
            >
              <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px 14px 8px',
            display: 'flex', flexDirection: 'column', gap: 10,
            scrollbarWidth: 'thin', scrollbarColor: '#e5eaf2 transparent',
          }}>
            {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions rapides (si 1 seul message) */}
          {messages.length === 1 && !loading && (
            <div style={{ padding: '0 14px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                'Comment créer une location ?',
                'Voir les alertes actives',
                'Générer une facture',
                'Stock de pièces',
              ].map((q) => (
                <button key={q}
                  onClick={() => { setInput(q); setTimeout(send, 50); }}
                  style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 20,
                    border: `1px solid #dde5f0`, background: '#f8fafc',
                    cursor: 'pointer', color: '#374151', fontWeight: 500,
                    transition: 'background .15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#ebf1fb')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#f8fafc')}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '10px 12px 12px',
            borderTop: '1px solid #f0f4fb',
            display: 'flex', gap: 8, alignItems: 'flex-end',
            background: '#fafbfd',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Posez votre question…"
              rows={1}
              disabled={loading}
              style={{
                flex: 1, resize: 'none', border: '1px solid #dfe3eb',
                borderRadius: 10, padding: '8px 11px', fontSize: 13,
                outline: 'none', fontFamily: 'inherit', lineHeight: 1.45,
                background: loading ? '#f5f7fa' : '#fff', color: '#1f2937',
                transition: 'border-color .15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = BLUE)}
              onBlur={(e)  => (e.target.style.borderColor = '#dfe3eb')}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none',
                background: input.trim() && !loading
                  ? `linear-gradient(135deg, ${NAVY}, ${BLUE})`
                  : '#e5eaf2',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background .2s',
              }}
              aria-label="Envoyer"
            >
              <svg width={16} height={16} fill="none"
                stroke={input.trim() && !loading ? '#fff' : '#9ca3af'}
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
