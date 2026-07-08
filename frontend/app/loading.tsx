export default function Loading() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f5f8fa_0%,_#eef6fc_50%,_#f8fafc_100%)] flex items-center justify-center px-4">
      <div className="state-card">
        <div className="loading-ring" />
        <h1 className="text-xl font-semibold text-slate-900">Chargement en cours</h1>
        <p className="mt-2 text-sm text-slate-600">Préparation de l’interface en cours…</p>
      </div>
    </div>
  );
}
