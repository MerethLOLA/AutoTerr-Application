'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { ModuleDefinition, ModuleFormField } from '@/lib/modules';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface ModulePageProps {
  module: ModuleDefinition;
}

function asCollection<T>(response: T[] | { data?: T[] } | null | undefined): T[] {
  if (Array.isArray(response)) return response;
  return response?.data ?? [];
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
    { label: 'Année', value: data.year },
    { label: 'Ventes mensuelles', value: data.salesMonthly?.reduce?.((sum: number, item: any) => sum + Number(item.count || 0), 0) },
    { label: 'Encaissements du mois', value: data.financeStats?.encaissements_mois },
    { label: 'Factures impayées', value: data.financeStats?.factures_impayees },
    { label: 'Alertes stock', value: data.stockStats?.alertes },
    { label: 'Tickets SAV ouverts', value: data.savStats?.tickets_ouverts },
  ].filter((metric) => metric.value !== undefined && metric.value !== null);
}

function normalizeFieldValue(value: any, type?: ModuleFormField['type']) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function getOptionText(field: ModuleFormField, option: any) {
  if (field.optionFormatter) return field.optionFormatter(option);
  return formatValue(getValue(option, field.optionLabel ?? 'nom'));
}

function getInitialFormValues(mod: ModuleDefinition) {
  return (mod.formFields ?? []).reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = field.defaultValue === undefined || field.defaultValue === null
      ? ''
      : String(field.defaultValue);
    return acc;
  }, {});
}

export default function ModulePage({ module: mod }: ModulePageProps) {
  const [items, setItems]               = useState<any[]>([]);
  const [payload, setPayload]           = useState<any>(null);
  const [loading, setLoading]           = useState(Boolean(mod.endpoint && mod.status === 'api-ready'));
  const [error, setError]               = useState<string | null>(null);
  const [showForm, setShowForm]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState<string | null>(null);
  const [formErrorDetails, setFormErrorDetails] = useState<Record<string, string[]> | null>(null);
  const [options, setOptions]           = useState<Record<string, any[]>>({});
  const [formValues, setFormValues]     = useState<Record<string, string>>(getInitialFormValues(mod));
  const [fileValues, setFileValues]     = useState<Record<string, FileList | null | undefined>>({});
  const [editingItemId, setEditingItemId] = useState<number | string | null>(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const [perPage, setPerPage]           = useState(15);
  const [totalItems, setTotalItems]     = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [searchQuery, setSearchQuery]   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | string | null>(null);

  const visibleFormFields = mod.formFields?.filter((f) => !f.hidden) ?? [];
  const columns = mod.columns ?? mod.fields.slice(0, 5).map((f) => ({
    label: f,
    key: f.toLowerCase().split(' ').join('_'),
  }));
  const isEditing = editingItemId !== null;

  // ── Chargement des données ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!mod.endpoint || mod.status !== 'api-ready') return;
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page: currentPage };
      if (debouncedSearch) params.search = debouncedSearch;
      const response = await apiClient.get<any>(mod.endpoint, params);
      const data = asCollection(response);
      if (response && typeof response === 'object' && 'meta' in response) {
        setTotalItems(response.meta.total || 0);
        setTotalPages(response.meta.last_page || 1);
        setPerPage(response.meta.per_page || perPage);
      } else {
        setTotalItems(data.length);
        setTotalPages(1);
      }
      setPayload(response);
      setItems(data);
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }, [mod.endpoint, mod.status, currentPage, debouncedSearch, perPage]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Chargement des options pour les selects ───────────────────────────────
  useEffect(() => {
    const fields = mod.formFields?.filter((f) => f.type === 'select' && f.optionsEndpoint) ?? [];
    if (fields.length === 0) return;
    let mounted = true;
    async function loadOptions() {
      const loaded: Record<string, any[]> = {};
      await Promise.all(fields.map(async (field) => {
        if (!field.optionsEndpoint) return;
        try {
          const response = await apiClient.get<any>(field.optionsEndpoint);
          loaded[field.name] = asCollection(response);
        } catch {
          loaded[field.name] = [];
        }
      }));
      if (mounted) setOptions(loaded);
    }
    loadOptions();
    return () => { mounted = false; };
  }, [mod.formFields]);

  // ── Debounce de la recherche ──────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Helpers formulaire ────────────────────────────────────────────────────
  function resetForm() {
    setFormValues(getInitialFormValues(mod));
    setFileValues({});
    setEditingItemId(null);
    setFormError(null);
    setFormErrorDetails(null);
    setShowForm(false);
  }

  function beginCreate() {
    setEditingItemId(null);
    setFormValues(getInitialFormValues(mod));
    setFormError(null);
    setFormErrorDetails(null);
    setShowForm((cur) => !cur || isEditing);
  }

  function beginEdit(item: any) {
    if (!mod.formFields) return;
    const nextValues = mod.formFields.reduce<Record<string, string>>((acc, field) => {
      const val = getValue(item, field.name);
      acc[field.name] = val === undefined
        ? normalizeFieldValue(field.defaultValue, field.type)
        : normalizeFieldValue(val, field.type);
      return acc;
    }, {});
    setFileValues({});
    setEditingItemId(item.id);
    setFormValues(nextValues);
    setFormError(null);
    setFormErrorDetails(null);
    setShowForm(true);
  }

  // ── Soumission du formulaire ──────────────────────────────────────────────
  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mod.endpoint || !mod.formFields) return;

    const data = Object.fromEntries(
      mod.formFields
        .filter((f) => f.type !== 'file')
        .map((f) => {
          const value = formValues[f.name] ?? '';
          if (value === '') return null;
          return [f.name, f.type === 'number' ? Number(value) : value];
        })
        .filter(Boolean) as Array<[string, string | number]>
    );

    const requestPayload = mod.transformOnSubmit
      ? mod.transformOnSubmit(data, { isEditing })
      : data;

    const fileFields = mod.formFields.filter((f) => f.type === 'file');
    const hasFiles   = fileFields.some((f) => fileValues[f.name]?.length);

    const submitPayload: FormData | Record<string, any> = hasFiles ? new FormData() : requestPayload;

    if (hasFiles && submitPayload instanceof FormData) {
      Object.entries(requestPayload).forEach(([key, value]) => {
        (submitPayload as FormData).append(key, String(value));
      });
      fileFields.forEach((f) => {
        const files = fileValues[f.name];
        if (!files) return;
        Array.from(files).forEach((file) => {
          (submitPayload as FormData).append(f.multiple ? `${f.name}[]` : f.name, file);
        });
      });
    }

    setSaving(true);
    setFormError(null);
    setFormErrorDetails(null);

    try {
      if (editingItemId !== null) {
        await apiClient.put(`${mod.endpoint}/${editingItemId}`, submitPayload);
      } else {
        await apiClient.post(mod.endpoint, submitPayload);
      }
      resetForm();
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Enregistrement impossible');
      setFormErrorDetails(err?.details || null);
    } finally {
      setSaving(false);
    }
  }

  // ── Suppression avec confirmation ─────────────────────────────────────────
  async function handleDelete(id: number | string) {
    if (!mod.endpoint) return;
    if (!window.confirm('Confirmer la suppression de cet élément ?')) return;
    setError(null);
    try {
      await apiClient.delete(`${mod.endpoint}/${id}`);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Suppression impossible');
    }
  }

  // ── Export PDF ────────────────────────────────────────────────────────────
  async function handleExport(item: any) {
    if (!mod.exportRoute || !mod.exportFilename) return;
    setDownloadingId(item.id);
    try {
      await apiClient.download(`/${mod.exportRoute}/${item.id}/export`, mod.exportFilename(item));
    } catch {
      // l'utilisateur peut réessayer
    } finally {
      setDownloadingId(null);
    }
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{mod.title}</h1>
            {mod.description && <p className="page-subtitle">{mod.description}</p>}
          </div>
        </div>

        {/* Section principale */}
        <section className="surface-panel">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 px-5 py-4 md:flex-row md:items-center md:justify-between rounded-t-xl">
            <div>
              <h2 className="section-title">{mod.title}</h2>
              {totalItems > 0 && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {totalItems} enregistrement{totalItems > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              className="btn-primary disabled:cursor-not-allowed disabled:bg-slate-300 shrink-0"
              disabled={!mod.formFields}
              onClick={beginCreate}
              type="button"
            >
              {showForm && isEditing ? 'Ajouter un nouvel élément' : mod.primaryAction}
            </button>
          </div>

          <div className="p-5">

            {/* Formulaire création / édition */}
            {showForm && mod.formFields && (
              <form className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-5" onSubmit={handleCreate}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-[#002d54]">
                    {isEditing ? "Modifier l'élément" : 'Nouvel élément'}
                  </h3>
                  {isEditing && (
                    <span className="rounded-full bg-[#ff6b35]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#ff6b35]">
                      Édition
                    </span>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {visibleFormFields.map((field) => (
                    <label key={field.name} className="text-sm font-semibold text-[#1A3C5E]">
                      {field.label}
                      {field.type === 'select' ? (
                        <select
                          className="field-control mt-2"
                          name={field.name}
                          disabled={field.readOnly}
                          required={field.required}
                          value={formValues[field.name] ?? ''}
                          onChange={(e) => setFormValues((cur) => ({ ...cur, [field.name]: e.target.value }))}
                        >
                          <option value="">Sélectionner</option>
                          {(options[field.name] ?? []).map((option) => (
                            <option key={option.id} value={option.id}>
                              {getOptionText(field, option)}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          className="field-control mt-2 min-h-24"
                          name={field.name}
                          readOnly={field.readOnly}
                          required={field.required}
                          value={formValues[field.name] ?? ''}
                          onChange={(e) => setFormValues((cur) => ({ ...cur, [field.name]: e.target.value }))}
                        />
                      ) : field.type === 'file' ? (
                        <div className="mt-2">
                          <input
                            className="field-control"
                            name={field.name}
                            type="file"
                            accept={field.accept ?? 'image/*'}
                            multiple={field.multiple}
                            disabled={field.readOnly}
                            onChange={(e) => setFileValues((cur) => ({ ...cur, [field.name]: e.target.files }))}
                          />
                          {(fileValues[field.name]?.length ?? 0) > 0 && (
                            <p className="mt-2 text-sm text-slate-500">
                              {Array.from(fileValues[field.name] as FileList).map((f) => f.name).join(', ')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <input
                          className="field-control mt-2"
                          name={field.name}
                          type={field.type ?? 'text'}
                          readOnly={field.readOnly}
                          required={field.required}
                          value={formValues[field.name] ?? ''}
                          onChange={(e) => setFormValues((cur) => ({ ...cur, [field.name]: e.target.value }))}
                        />
                      )}
                    </label>
                  ))}
                </div>

                {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
                {formErrorDetails && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {Object.entries(formErrorDetails).map(([field, messages]) => (
                      <p key={field}><strong>{field}:</strong> {messages.join(' ')}</p>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button className="btn-primary" disabled={saving} type="submit">
                    {saving ? 'Enregistrement…' : isEditing ? 'Enregistrer les modifications' : 'Enregistrer'}
                  </button>
                  <button className="btn-secondary" onClick={resetForm} type="button">
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {loading && <p className="text-sm text-slate-500">Chargement des données…</p>}
            {error   && <p className="text-sm text-red-600">{error}</p>}

            {/* Vue analytique */}
            {!loading && !error && mod.status === 'api-ready' && mod.kind === 'analytics' && (
              <div className="grid gap-4 md:grid-cols-3">
                {metricCards(payload?.data ?? payload).map((metric) => (
                  <div key={metric.label} className="surface-muted p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1A3C5E]">{metric.label}</p>
                    <p className="mt-2 text-2xl font-black text-[#002D54]">{formatValue(metric.value)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Vue tableau CRUD */}
            {!loading && !error && mod.status === 'api-ready' && mod.kind !== 'analytics' && (
              <>
                {/* Recherche */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative max-w-sm flex-1">
                    <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Rechercher…"
                      className="field-control py-2 pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tableau */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        {columns.map((col, ci) => (
                          <th key={col.key} className={`table-header ${ci === 0 ? 'pl-5' : ''}`}>{col.label}</th>
                        ))}
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td className="px-5 py-10 text-sm text-slate-400" colSpan={columns.length + 1}>
                            Aucune donnée pour le moment.
                          </td>
                        </tr>
                      ) : (
                        items.map((item, index) => (
                          <tr key={item.id || index} className="table-row">
                            {columns.map((col, ci) => (
                              <td key={col.key} className={`table-cell ${ci === 0 ? 'pl-5 font-medium text-slate-800' : ''}`}>
                                {col.key === 'image_principale' || col.key.includes('chemin') ? (
                                  getValue(item, col.key) ? (
                                    <img
                                      src={`${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/storage/${getValue(item, col.key)}`}
                                      alt="photo"
                                      className="h-10 w-14 rounded-lg object-cover border border-slate-200"
                                    />
                                  ) : (
                                    <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400">—</div>
                                  )
                                ) : (
                                  formatValue(getValue(item, col.key))
                                )}
                              </td>
                            ))}
                            <td className="table-cell">
                              <div className="flex items-center gap-3">
                                {mod.detailRoute && (
                                  <Link
                                    href={`/${mod.detailRoute}/${item.id}`}
                                    className="text-xs font-semibold text-[#002d54] hover:text-[#ff6b35] transition-colors"
                                  >
                                    Voir
                                  </Link>
                                )}
                                {mod.exportRoute && (
                                  <button
                                    type="button"
                                    title="Imprimer / Télécharger PDF"
                                    disabled={downloadingId === item.id}
                                    onClick={() => handleExport(item)}
                                    className="inline-flex items-center gap-1 rounded border border-[#dfe3eb] bg-white px-2 py-1 text-xs font-semibold text-[#33475b] transition hover:border-[#2d1b3d] hover:bg-[#2d1b3d] hover:text-white disabled:opacity-40"
                                  >
                                    {downloadingId === item.id ? (
                                      '…'
                                    ) : (
                                      <>
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        Imprimer
                                      </>
                                    )}
                                  </button>
                                )}
                                {mod.formFields && (
                                  <button
                                    type="button"
                                    className="text-xs font-semibold text-slate-500 hover:text-[#002d54] transition-colors"
                                    onClick={() => beginEdit(item)}
                                  >
                                    Modifier
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Lignes par page :</span>
                      <select
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#ff6b35]"
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        ← Précédent
                      </button>
                      <span className="text-xs text-slate-500">Page {currentPage} / {totalPages}</span>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Module non connecté */}
            {!loading && !error && mod.status !== 'api-ready' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                Ce module n&apos;a pas encore d&apos;endpoint API connecté.
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
