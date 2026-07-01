'use client';

import { useEffect, useRef, useState } from 'react';

const NAVY  = '#185FA5';
const LIGHT = '#E6F1FB';
const API   = (process.env.NEXT_PUBLIC_API_URL ?? '/api');

interface Message { role: 'user' | 'assistant'; content: string; }

const WELCOME: Message = {
  role: 'assistant',
  content: 'Bonjour ! Je suis l\'assistant IA d\'AutoTerr. Posez-moi vos questions sur nos véhicules, nos services ou comment utiliser l\'application.',
};

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center', padding: '2px 0' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: '#9ca3af',
          animation: 'chatDot 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </span>
  );
}

export default function ChatbotWidget() {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState<Message[]>([WELCOME]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError(null);

    const history = msgs.slice(1); // exclude welcome
    setMsgs((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setMsgs((m) => m.slice(0, -1)); // remove user msg
        setInput(text);
      } else {
        setMsgs((m) => [...m, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      setError('Erreur de connexion. Vérifiez votre réseau.');
      setMsgs((m) => m.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <>
      {/* CSS for dot animation */}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Chat panel */}
      <div
        style={{
          position: 'fixed', bottom: 80, right: 16, zIndex: 50,
          width: 340, maxWidth: 'calc(100vw - 2rem)',
          maxHeight: 'calc(100vh - 120px)',
          display: 'flex', flexDirection: 'column',
          background: '#fff', borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          border: '0.5px solid #e8ecf0',
          transition: 'opacity .2s, transform .2s',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: open ? 'auto' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ background: NAVY, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width={16} height={16} fill="none" stroke={NAVY} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Assistant AutoTerr</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>IA · Répond en quelques secondes</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}
          >
            <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: m.role === 'user' ? NAVY : '#f5f8fa',
                color: m.role === 'user' ? '#fff' : '#111827',
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '8px 12px', borderRadius: '12px 12px 12px 2px', background: '#f5f8fa' }}>
                <TypingDots />
              </div>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: '0.5px solid #e8ecf0', padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'; }}
            onKeyDown={onKey}
            placeholder="Posez votre question…"
            disabled={loading}
            style={{
              flex: 1, resize: 'none', border: '0.5px solid #dfe3eb', borderRadius: 8,
              padding: '7px 10px', fontSize: 13, outline: 'none',
              background: '#f5f8fa', color: '#111827', lineHeight: 1.4,
              transition: 'border-color .15s',
              minHeight: 36, maxHeight: 80, overflowY: 'auto',
            }}
            onFocus={(e) => (e.target.style.borderColor = NAVY)}
            onBlur={(e)  => (e.target.style.borderColor = '#dfe3eb')}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              width: 36, height: 36, borderRadius: 8, border: 'none',
              background: (!input.trim() || loading) ? '#e8ecf0' : NAVY,
              color: (!input.trim() || loading) ? '#9ca3af' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (!input.trim() || loading) ? 'default' : 'pointer',
              flexShrink: 0, transition: 'background .15s',
            }}
          >
            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bubble button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir l\'assistant IA'}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 50,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: NAVY,
          boxShadow: '0 4px 16px rgba(24,95,165,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'transform .2s, box-shadow .2s',
          color: '#fff',
        }}
        className="hover:scale-110 hover:shadow-xl"
      >
        {open ? (
          <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </>
  );
}
