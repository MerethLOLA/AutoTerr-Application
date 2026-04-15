'use client';

import EdgeLayout from '@/components/EdgeLayout';

export default function AnalyticsPage() {
  return (
    <EdgeLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Budget & Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Analyse détaillée de vos finances</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Revenus Mois', value: '€15,450', color: 'from-emerald-500', trend: '+12%' },
          { label: 'Dépenses', value: '€4,230', color: 'from-red-500', trend: '-3%' },
          { label: 'Profit Net', value: '€11,220', color: 'from-teal-500', trend: '+15%' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} to-cyan-500 bg-clip-text text-transparent mt-2`}>
              {stat.value}
            </p>
            <p className="text-xs text-green-600 font-bold mt-2">{stat.trend} vs mois dernier</p>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenus par Catégorie</h3>
          <div className="h-64 bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg flex items-center justify-center text-slate-400">
            📊 Chart
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Tendance Annuelle</h3>
          <div className="h-64 bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg flex items-center justify-center text-slate-400">
            📈 Chart
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Comparaison Périodes</h3>
        <div className="h-64 bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg flex items-center justify-center text-slate-400">
          📊 Comparison Chart
        </div>
      </div>
    </EdgeLayout>
  );
}
