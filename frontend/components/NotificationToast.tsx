'use client';

import { useRealtime, type RealtimeNotif } from '@/components/RealtimeProvider';
import Link from 'next/link';

const ICONS: Record<string, string> = {
  danger:  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  warning: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const COLORS: Record<string, { bg: string; border: string; icon: string; title: string }> = {
  danger:  { bg: '#fff5f5', border: '#fed7d7', icon: '#e53e3e', title: '#c53030' },
  warning: { bg: '#fffaf0', border: '#fbd38d', icon: '#d97706', title: '#92400e' },
  info:    { bg: '#ebf8ff', border: '#bee3f8', icon: '#3182ce', title: '#1a365d' },
};

function Toast({ toast, onDismiss }: { toast: RealtimeNotif; onDismiss: () => void }) {
  const c = COLORS[toast.niveau] ?? COLORS.info;
  const iconPath = ICONS[toast.niveau] ?? ICONS.info;

  const inner = (
    <div
      style={{
        display: 'flex', gap: 12, padding: '12px 14px',
        background: c.bg, borderRadius: 10,
        border: `1px solid ${c.border}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        cursor: toast.url ? 'pointer' : 'default',
        transition: 'transform .15s',
        maxWidth: 360,
        width: '100%',
      }}
    >
      {/* Icône */}
      <svg width={20} height={20} fill="none" stroke={c.icon} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={iconPath} />
      </svg>

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: c.title, lineHeight: 1.3 }}>
          {toast.titre}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4a5568', lineHeight: 1.4, wordBreak: 'break-word' }}>
          {toast.message}
        </p>
      </div>

      {/* Fermer */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss(); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 2, color: '#9ca3af', flexShrink: 0, alignSelf: 'flex-start',
        }}
        aria-label="Fermer"
      >
        <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  if (toast.url) {
    return (
      <Link href={toast.url} style={{ textDecoration: 'none' }} onClick={onDismiss}>
        {inner}
      </Link>
    );
  }

  return inner;
}

export function NotificationToast() {
  const { toasts, dismissToast } = useRealtime();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto', animation: 'toast-in .25s ease' }}>
          <Toast toast={toast} onDismiss={() => dismissToast(toast.id)} />
        </div>
      ))}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
