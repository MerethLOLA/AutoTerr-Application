import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.203-2.47M12 7v14" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page non trouvée</h1>
        <p className="text-slate-600 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          href="/catalogue"
          className="inline-block px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
