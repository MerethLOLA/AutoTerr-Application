'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f5f8fa_0%,_#eef6fc_50%,_#f8fafc_100%)] flex items-center justify-center px-4">
      <div className="state-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Une erreur est survenue</h1>
        <p className="mt-3 text-sm text-slate-600">
          Quelque chose s’est mal passé. Vous pouvez réessayer pour reprendre là où vous en étiez.
        </p>
        <button onClick={reset} className="auth-button mt-6">
          Réessayer
        </button>
      </div>
    </div>
  );
}
