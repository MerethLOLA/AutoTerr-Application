'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { ModuleDefinition, ModuleFormField } from '@/lib/modules';
import { useEffect, useState } from 'react';
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
    { label: 'Annee', value: data.year },
    { label: 'Ventes mensuelles', value: data.salesMonthly?.reduce?.((sum: number, item: any) => sum + Number(item.count || 0), 0) },
    { label: 'Encaissements du mois', value: data.financeStats?.encaissements_mois },
    { label: 'Factures impayees', value: data.financeStats?.factures_impayees },
    { label: 'Alertes stock', value: data.stockStats?.alertes },
    { label: 'Tickets SAV ouverts', value: data.savStats?.tickets_ouverts },
  ].filter((metric) => metric.value !== undefined && metric.value !== null);
}

function normalizeFieldValue(value: any, type?: ModuleFormField['type']) {
  if (value === null || value === undefined) return '';
  if (type === 'number') return String(value);
  return String(value);
}

function getOptionText(field: ModuleFormField, option: any) {
  if (field.optionFormatter) return field.optionFormatter(option);
  return formatValue(getValue(option, field.optionLabel ?? 'nom'));
}

function getInitialFormValues(module: ModuleDefinition) {
  return (module.formFields ?? []).reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.name] = field.defaultValue === undefined || field.defaultValue === null
      ? ''
      : String(field.defaultValue);

    return accumulator;
  }, {});
}

export default function ModulePage({ module }: ModulePageProps) {
  const [items, setItems] = useState<any[]>([]);
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(module.endpoint && module.status === 'api-ready'));
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formErrorDetails, setFormErrorDetails] = useState<Record<string, string[]> | null>(null);
  const [options, setOptions] = useState<Record<string, any[]>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>(getInitialFormValues(module));
  const [fileValues, setFileValues] = useState<Record<string, FileList | null | undefined>>({});
  const [editingItemId, setEditingItemId] = useState<number | string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | string | null>(null);

  const visibleFormFields = module.formFields?.filter((field) => !field.hidden) ?? [];
  const columns = module.columns ?? module.fields.slice(0, 5).map((field) => ({
    label: field,
    key: field.toLowerCase().split(' ').join('_'),
  }));
  const isEditing = editingItemId !== null;

  function resetForm() {
    setFormValues(getInitialFormValues(module));
    setFileValues({});
    setEditingItemId(null);
    setFormError(null);
    setFormErrorDetails(null);
    setShowForm(false);
  }

  function beginCreate() {
    setEditingItemId(null);
    setFormValues(getInitialFormValues(module));
    setFormError(null);
    setFormErrorDetails(null);
    setShowForm((current) => !current || isEditing);
  }

  function beginEdit(item: any) {
    if (!module.formFields) return;

    const nextValues = module.formFields.reduce<Record<string, string>>((accumulator, field) => {
      const currentValue = getValue(item, field.name);
      accumulator[field.name] = currentValue === undefined
        ? normalizeFieldValue(field.defaultValue, field.type)
        : normalizeFieldValue(currentValue, field.type);
      return accumulator;
    }, {});

    setFileValues({});
    setEditingItemId(item.id);
    setFormValues(nextValues);
    setFormError(null);
    setFormErrorDetails(null);
    setShowForm(true);
  }

  async function loadData() {
    if (!module.endpoint || module.status !== 'api-ready') return;

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = { page: currentPage };

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      const response = await apiClient.get<any>(module.endpoint, params);
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
      setError(err?.message || 'Impossible de charger les donnees');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [module.endpoint, module.status, currentPage, debouncedSearchQuery]);

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
          loaded[field.name] = asCollection(response);
        } catch {
          loaded[field.name] = [];
        }
      }));

      if (mounted) {
        setOptions(loaded);
      }
    }

    loadOptions();

    return () => {
      mounted = false;
    };
  }, [module.formFields]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

    async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!module.endpoint || !module.formFields) return;

        const data = Object.fromEntries(
            module.formFields
                .filter((field) => field.type !== 'file')
                .map((field) => {
                    const value = formValues[field.name] ?? '';
                    if (value === null || value === '') return null;
                    return [field.name, field.type === 'number' ? Number(value) : value];
                })
                .filter(Boolean) as Array<[string, string | number]>
        );

        const requestPayload = module.transformOnSubmit
            ? module.transformOnSubmit(data, { isEditing })
            : data;

        const fileFields = module.formFields.filter((field) => field.type === 'file');
        const hasFiles   = fileFields.some((field) => fileValues[field.name]?.length);

        // ✅ submitPayload — jamais confondu avec le state payload
        const submitPayload: FormData | Record<string, any> = hasFiles
            ? new FormData()
            : requestPayload;

        if (hasFiles && submitPayload instanceof FormData) {
            // Ajouter les champs texte
            Object.entries(requestPayload).forEach(([key, value]) => {
                (submitPayload as FormData).append(key, String(value));
            });
            // Ajouter les fichiers
            fileFields.forEach((field) => {
                const files = fileValues[field.name];
                if (!files) return;
                Array.from(files).forEach((file) => {
                    const fieldName = field.multiple ? `${field.name}[]` : field.name;
                    (submitPayload as FormData).append(fieldName, file);
                });
            });
        }

        setSaving(true);
        setFormError(null);
        setFormErrorDetails(null);

        try {
            if (editingItemId !== null) {
                // ✅ submitPayload — correct
                await apiClient.put(`${module.endpoint}/${editingItemId}`, submitPayload);
            } else {
                // ✅ submitPayload — correct
                await apiClient.post(module.endpoint, submitPayload);
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

  async function handleDelete(id: number | string) {
    if (!module.endpoint) return;

    setError(null);

    try {
      await apiClient.delete(`${module.endpoint}/${id}`);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Suppression impossible');
    }
  }

  async function handleExport(item: any) {
    if (!module.exportRoute || !module.exportFilename) return;
    setDownloadingId(item.id);
    try {
      await apiClient.download(
        `/${module.exportRoute}/${item.id}/export`,
        module.exportFilename(item),
      );
    } catch {
      // silently ignore — user can retry
    } finally {
      setDownloadingId(null);
    }
  }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* En-tête de page style HubSpot */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{module.title}</h1>
                        {module.description && (
                            <p className="page-subtitle">{module.description}</p>
                        )}
                    </div>
                </div>

                {/* Section principale */}
                <section className="surface-panel">
                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 px-5 py-4 md:flex-row md:items-center md:justify-between rounded-t-xl">
                        <div>
                            <h2 className="section-title">{module.title}</h2>
                            {totalItems > 0 && (
                                <p className="mt-0.5 text-xs text-slate-500">{totalItems} enregistrement{totalItems > 1 ? 's' : ''}</p>
                            )}
                        </div>
                        <button
                            className="btn-primary disabled:cursor-not-allowed disabled:bg-slate-300 shrink-0"
                            disabled={!module.formFields}
                            onClick={beginCreate}
                            type="button"
                        >
                            {showForm && isEditing ? 'Ajouter un nouvel élément' : module.primaryAction}
                        </button>
                    </div>

                    <div className="p-5">
                        {showForm && module.formFields && (
                            <form className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-5" onSubmit={handleCreate}>
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <h3 className="text-sm font-bold text-[#002d54]">
                                        {isEditing ? 'Modifier l\'élément' : 'Nouvel élément'}
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
                                                    onChange={(event) => setFormValues((current) => ({ ...current, [field.name]: event.target.value }))}
                                                    disabled={field.readOnly}
                                                    required={field.required}
                                                    value={formValues[field.name] ?? ''}
                                                >
                                                    <option value="">Selectionner</option>
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
                                                    onChange={(event) => setFormValues((current) => ({ ...current, [field.name]: event.target.value }))}
                                                    readOnly={field.readOnly}
                                                    required={field.required}
                                                    value={formValues[field.name] ?? ''}
                                                />
                                            ) : field.type === 'file' ? (
                                                <div className="mt-2">
                                                    <input
                                                        className="field-control"
                                                        name={field.name}
                                                        type="file"
                                                        accept={field.accept ?? 'image/*'}
                                                        multiple={field.multiple}
                                                        onChange={(event) => {
                                                            setFileValues((current) => ({
                                                                ...current,
                                                                [field.name]: event.target.files,
                                                            }));
                                                        }}
                                                        disabled={field.readOnly}
                                                    />
                                                    {(fileValues[field.name]?.length ?? 0) > 0 && (
                                                        <p className="mt-2 text-sm text-slate-500">
                                                            {Array.from(fileValues[field.name] ?? []).map((file) => file.name).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    className="field-control mt-2"
                                                    name={field.name}
                                                    onChange={(event) => setFormValues((current) => ({ ...current, [field.name]: event.target.value }))}
                                                    readOnly={field.readOnly}
                                                    required={field.required}
                                                    type={field.type ?? 'text'}
                                                    value={formValues[field.name] ?? ''}
                                                />
                                            )}
                                        </label>
                                    ))}
                                </div>
                                {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
                                {formErrorDetails && (
                                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                        {Object.entries(formErrorDetails).map(([field, messages]) => (
                                            <p key={field}>
                                                <strong>{field}:</strong> {messages.join(' ')}
                                            </p>
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

                        {loading && <p className="text-sm text-slate-500">Chargement des donnees...</p>}
                        {error && <p className="text-sm text-red-600">{error}</p>}

                        {!loading && !error && module.status === 'api-ready' && module.kind === 'analytics' && (
                            <div className="grid gap-4 md:grid-cols-3">
                                {metricCards(payload?.data ?? payload).map((metric) => (
                                    <div key={metric.label} className="surface-muted p-5">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1A3C5E]">{metric.label}</p>
                                        <p className="mt-2 text-2xl font-black text-[#002D54]">{formatValue(metric.value)}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && !error && module.status === 'api-ready' && module.kind !== 'analytics' && (
                            <>
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

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr>
                                                {columns.map((column, ci) => (
                                                    <th key={column.key} className={`table-header ${ci === 0 ? 'pl-5' : ''}`}>{column.label}</th>
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
                                                        {columns.map((column, ci) => (
                                                            <td key={column.key} className={`table-cell ${ci === 0 ? 'pl-5 font-medium text-slate-800' : ''}`}>
                                                                {column.key === 'image_principale' || column.key.includes('chemin') ? (
                                                                    getValue(item, column.key) ? (
                                                                        <img
                                                                            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${getValue(item, column.key)}`}
                                                                            alt="photo"
                                                                            className="h-10 w-14 rounded-lg object-cover border border-slate-200"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400">—</div>
                                                                    )
                                                                ) : (
                                                                    formatValue(getValue(item, column.key))
                                                                )}
                                                            </td>
                                                        ))}
                                                        <td className="table-cell">
                                                            <div className="flex items-center gap-3">
                                                                {module.detailRoute && (
                                                                    <Link
                                                                        href={`/${module.detailRoute}/${item.id}`}
                                                                        className="text-xs font-semibold text-[#002d54] hover:text-[#ff6b35] transition-colors"
                                                                    >
                                                                        Voir
                                                                    </Link>
                                                                )}
                                                                {module.exportRoute && (
                                                                    <button
                                                                        className="text-xs font-semibold text-[#516f90] hover:text-[#33475b] transition-colors disabled:opacity-40"
                                                                        onClick={() => handleExport(item)}
                                                                        disabled={downloadingId === item.id}
                                                                        type="button"
                                                                        title="Télécharger PDF"
                                                                    >
                                                                        {downloadingId === item.id ? '…' : 'PDF'}
                                                                    </button>
                                                                )}
                                                                {module.formFields && (
                                                                    <button
                                                                        className="text-xs font-semibold text-slate-500 hover:text-[#002d54] transition-colors"
                                                                        onClick={() => beginEdit(item)}
                                                                        type="button"
                                                                    >
                                                                        Modifier
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                                                                    onClick={() => handleDelete(item.id)}
                                                                    type="button"
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
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((page) => page - 1)}
                                            >
                                                ← Précédent
                                            </button>
                                            <span className="text-xs text-slate-500">Page {currentPage} / {totalPages}</span>
                                            <button
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage((page) => page + 1)}
                                            >
                                                Suivant →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {!loading && !error && module.status !== 'api-ready' && (
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
