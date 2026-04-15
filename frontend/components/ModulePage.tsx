'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { ModuleDefinition } from '@/lib/modules';
import { useEffect, useState } from 'react';

interface ModulePageProps {
  module: ModuleDefinition;
}

function statusLabel(status: ModuleDefinition['status']) {
  if (status === 'api-ready') return 'API connectee';
  if (status === 'api-needed') return 'API Laravel a exposer';
  return 'Interface a finaliser';
}

function getValue(item: any, key: string) {
  return key.split('.').reduce((value, segment) => value?.[segment], item);
}

function formatValue(value: any) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'number') return new Intl.NumberFormat('fr-FR').format(value);
  if (typeof value === 'object') return value.nom || value.reference || value.id || '-';
  return String(value);
}

function metricCards(data: any) {
  if (!data || Array.isArray(data)) return [];

  return [
    { label: 'Annee', value: data.year },
    { label: 'Ventes mensuelles', value: data.salesMonthly?.reduce?.((sum: number, item: any) => sum + Number(item.count || 0), 0) },
    { label: 'Encaissements du mois', value: data.financeStats?.encaissements_mois },
    { label: 'Factures impayees', value: data.financeStats?.factures_impayees },
    { label: 'Alertes stock', value: data.stockStats?.alertes },
    { label: 'Tickets SAV ouverts', value: data.savStats?.tickets_ouverts },
  ].filter((metric) => metric.value !== undefined && metric.value !== null);
}

export default function ModulePage({ module }: ModulePageProps) {
  const [items, setItems] = useState<any[]>([]);
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(module.endpoint && module.status === 'api-ready'));
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [options, setOptions] = useState<Record<string, any[]>>({});
  const columns = module.columns ?? module.fields.slice(0, 5).map((field) => ({
    label: field,
    key: field.toLowerCase().split(' ').join('_'),
  }));

  async function loadData() {
    if (!module.endpoint || module.status !== 'api-ready') return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<any>(module.endpoint);
      const data = Array.isArray(response) ? response : response?.data || [];
      setPayload(response);
      setItems(data);
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les donnees');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!module.endpoint || module.status !== 'api-ready') return;

    let mounted = true;

    async function load() {
      try {
        const response = await apiClient.get<any>(module.endpoint as string);
        const data = Array.isArray(response) ? response : response?.data || [];
        if (mounted) {
          setPayload(response);
          setItems(data);
        }
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Impossible de charger les donnees');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [module.endpoint, module.status]);

  useEffect(() => {
    const fields = module.formFields?.filter((field) => field.type === 'select' && field.optionsEndpoint) ?? [];
    if (fields.length === 0) return;

    let mounted = true;

    async function loadOptions() {
      const loaded: Record<string, any[]> = {};
      await Promise.all(fields.map(async (field) => {
        if (!field.optionsEndpoint) return;
        try {
          const response = await apiClient.get<any>(field.optionsEndpoint);
          loaded[field.name] = Array.isArray(response) ? response : response?.data || [];
        } catch {
          loaded[field.name] = [];
        }
      }));
      if (mounted) setOptions(loaded);
    }

    loadOptions();

    return () => {
      mounted = false;
    };
  }, [module.formFields]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!module.endpoint || !module.formFields) return;

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(
      module.formFields
        .map((field) => {
          const value = formData.get(field.name);
          if (value === null || value === '') return null;
          return [field.name, field.type === 'number' ? Number(value) : value];
        })
        .filter(Boolean) as Array<[string, FormDataEntryValue | number]>
    );

    setSaving(true);
    setFormError(null);
    try {
      await apiClient.post(module.endpoint, data);
      event.currentTarget.reset();
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number | string) {
    if (!module.endpoint) return;

    setError(null);
    try {
      await apiClient.delete(`${module.endpoint}/${id}`);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Suppression impossible');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-cyan-100">
                SunuPark back-office Next.js
              </p>
              <h1 className="text-4xl font-black tracking-tight">{module.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200">{module.description}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm">
              <p className="text-slate-300">Statut</p>
              <p className="mt-1 font-bold text-cyan-100">{statusLabel(module.status)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {module.fields.slice(0, 6).map((field, index) => (
            <div key={field} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Champ {index + 1}</p>
              <p className="mt-2 text-lg font-black text-slate-900">{field}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Donnees du module</h2>
              <p className="mt-1 text-sm text-slate-500">
                {module.endpoint ? `Endpoint cible: ${module.endpoint}` : 'Module calcule ou compose sans endpoint unique.'}
              </p>
            </div>
            <button
              className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!module.formFields}
              onClick={() => setShowForm((value) => !value)}
              type="button"
            >
              {module.primaryAction}
            </button>
          </div>

          <div className="p-6">
            {showForm && module.formFields && (
              <form className="mb-6 rounded-2xl border border-teal-100 bg-teal-50 p-5" onSubmit={handleCreate}>
                <div className="grid gap-4 md:grid-cols-2">
                  {module.formFields.map((field) => (
                    <label key={field.name} className="text-sm font-semibold text-slate-700">
                      {field.label}
                      {field.type === 'select' ? (
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-teal-500"
                          name={field.name}
                          required={field.required}
                        >
                          <option value="">Selectionner</option>
                          {(options[field.name] ?? []).map((option) => (
                            <option key={option.id} value={option.id}>
                              {formatValue(getValue(option, field.optionLabel ?? 'nom'))}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-teal-500"
                          name={field.name}
                          required={field.required}
                        />
                      ) : (
                        <input
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-teal-500"
                          name={field.name}
                          required={field.required}
                          type={field.type ?? 'text'}
                        />
                      )}
                    </label>
                  ))}
                </div>
                {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
                <div className="mt-5 flex gap-3">
                  <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:bg-slate-400" disabled={saving} type="submit">
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700" onClick={() => setShowForm(false)} type="button">
                    Annuler
                  </button>
                </div>
              </form>
            )}
            {loading && <p className="text-sm text-slate-500">Chargement des donnees...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && module.status !== 'api-ready' && (
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                Cette page remplace le back-office Laravel pour ce module. Il reste a exposer ou harmoniser l endpoint API Laravel correspondant.
              </div>
            )}
            {!loading && !error && module.status === 'api-ready' && (
              module.endpoint === '/reporting' ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {metricCards(payload).map((metric) => (
                    <div key={metric.label} className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">{formatValue(metric.value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
                        {columns.map((column) => (
                          <th key={column.key} className="py-3 pr-4">{column.label}</th>
                        ))}
                        <th className="py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td className="py-6 text-slate-500" colSpan={columns.length + 1}>Aucune donnee pour le moment.</td>
                        </tr>
                      ) : (
                        items.slice(0, 8).map((item, index) => (
                          <tr key={item.id || index} className="border-b border-slate-100">
                            {columns.map((column) => (
                              <td key={column.key} className="py-3 pr-4 text-slate-700">
                                {formatValue(getValue(item, column.key))}
                              </td>
                            ))}
                            <td className="py-3 pr-4">
                              <button
                                className="text-sm font-bold text-red-600 hover:text-red-800"
                                onClick={() => handleDelete(item.id)}
                                type="button"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
