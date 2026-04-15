'use client';

import EdgeLayout from '@/components/EdgeLayout';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    type: 'income',
    description: 'Location Voiture A',
    amount: 450,
    date: '2026-04-08',
    status: 'completed',
  },
  {
    id: 2,
    type: 'expense',
    description: 'Maintenance voiture',
    amount: -150,
    date: '2026-04-07',
    status: 'completed',
  },
  {
    id: 3,
    type: 'income',
    description: 'Location Voiture B',
    amount: 320,
    date: '2026-04-06',
    status: 'pending',
  },
];

export default function PaymentsPage() {
  return (
    <EdgeLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-500 text-sm mt-1">Gestion de vos paiements et transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Revenus', value: '€15,450', color: 'from-green-500', icon: '📥' },
          { label: 'Dépenses', value: '€4,230', color: 'from-red-500', icon: '📤' },
          { label: 'Solde', value: '€11,220', color: 'from-teal-500', icon: '💰' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} to-cyan-500 bg-clip-text text-transparent mt-2`}>
                  {stat.value}
                </p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Transactions Récentes</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Statut</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{tx.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : ''} €{Math.abs(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tx.status === 'completed' ? 'Complété' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </EdgeLayout>
  );
}
