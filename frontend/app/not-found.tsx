import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f5f8fa_0%,_#eef6fc_50%,_#f8fafc_100%)] flex items-center justify-center px-4">
      <div className="state-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.203-2.47M12 7v14" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Page non trouvée</h1>
        <p className="mt-3 text-sm text-slate-600">
          La page recherchée n’existe pas ou a été déplacée. Vous pouvez revenir à l’accueil ou au tableau de bord.
        </p>
        <Link href="/dashboard" className="auth-button mt-6">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
