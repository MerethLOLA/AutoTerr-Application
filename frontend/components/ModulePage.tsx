'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { ModuleColumn, ModuleDefinition, ModuleFormField } from '@/lib/modules';
import { useRole } from '@/lib/useRole';
import { Fragment, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
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

const BADGE_MAP: Record<string, { bg: string; text: string; label: string }> = {
  disponible:   { bg: '#dcfce7', text: '#166534', label: 'Disponible' },
  vendue:       { bg: '#ede9fe', text: '#5b21b6', label: 'Vendue' },
  reservee:     { bg: '#fef9c3', text: '#854d0e', label: 'Réservée' },
  en_location:  { bg: '#ffedd5', text: '#9a3412', label: 'En location' },
  hors_service: { bg: '#fee2e2', text: '#991b1b', label: 'Hors service' },
  en_cours:     { bg: '#dbeafe', text: '#1e40af', label: 'En cours' },
  en_retard:    { bg: '#fee2e2', text: '#991b1b', label: 'En retard' },
  planifie:     { bg: '#fef9c3', text: '#854d0e', label: 'Planifié' },
  planifiee:    { bg: '#fef9c3', text: '#854d0e', label: 'Planifiée' },
  terminee:     { bg: '#dcfce7', text: '#166534', label: 'Terminée' },
  realise:      { bg: '#dcfce7', text: '#166534', label: 'Réalisé' },
  resolu:       { bg: '#dcfce7', text: '#166534', label: 'Résolu' },
  payee:        { bg: '#dcfce7', text: '#166534', label: 'Payée' },
  active:       { bg: '#dcfce7', text: '#166534', label: 'Active' },
  clos:         { bg: '#f1f5f9', text: '#475569', label: 'Clos' },
  annule:       { bg: '#fee2e2', text: '#991b1b', label: 'Annulé' },
  annulee:      { bg: '#fee2e2', text: '#991b1b', label: 'Annulée' },
  rejete:       { bg: '#fee2e2', text: '#991b1b', label: 'Rejeté' },
  expiree:      { bg: '#fee2e2', text: '#991b1b', label: 'Expirée' },
  ouvert:       { bg: '#ffedd5', text: '#9a3412', label: 'Ouvert' },
  impayee:      { bg: '#fee2e2', text: '#991b1b', label: 'Impayée' },
  partielle:    { bg: '#fef9c3', text: '#854d0e', label: 'Partielle' },
  haute:        { bg: '#fee2e2', text: '#991b1b', label: 'Haute' },
  urgente:      { bg: '#fecdd3', text: '#9f1239', label: 'Urgente' },
  moyenne:      { bg: '#fef9c3', text: '#854d0e', label: 'Moyenne' },
  normale:      { bg: '#dbeafe', text: '#1e40af', label: 'Normale' },
  basse:        { bg: '#dcfce7', text: '#166534', label: 'Basse' },
  favorable:    { bg: '#dcfce7', text: '#166534', label: 'Favorable' },
  defavorable:  { bg: '#fee2e2', text: '#991b1b', label: 'Défavorable' },
  actif:        { bg: '#dcfce7', text: '#166534', label: 'Actif' },
  inactif:      { bg: '#fee2e2', text: '#991b1b', label: 'Inactif' },
  conge:        { bg: '#fef9c3', text: '#854d0e', label: 'En congé' },
  effectue:     { bg: '#dcfce7', text: '#166534', label: 'Effectué' },
};

function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'number') return new Intl.NumberFormat('fr-FR').format(value);
  if (typeof value === 'object') return String(value.nom || value.reference || value.id || '-');
  return String(value);
}

function renderCell(value: any, type?: ModuleColumn['type']) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-300">—</span>;
  }

  if (type === 'date') {
    const d = new Date(String(value));
    return isNaN(d.getTime())
      ? String(value)
      : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  if (type === 'money') {
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num) + ' XOF';
  }

  if (type === 'km') {
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num) + ' km';
  }

  if (type === 'number') {
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num);
  }

  if (type === 'badge') {
    const key = String(value).toLowerCase();
    const entry = BADGE_MAP[key];
    return (
      <span
        style={{ backgroundColor: entry?.bg ?? '#f1f5f9', color: entry?.text ?? '#475569' }}
        className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      >
        {entry?.label ?? String(value)}
      </span>
    );
  }

  if (typeof value === 'number') return new Intl.NumberFormat('fr-FR').format(value);
  if (typeof value === 'object') return String(value.nom || value.reference || value.id || '-');

  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }
  return str;
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

function normalizeFieldValue(value: any) {
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
  const { canWrite } = useRole();
  const moduleSlug = mod.endpoint?.replace(/^\//, '') ?? '';
  const hasWriteAccess = canWrite(moduleSlug);

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
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});
  const [quickCreateField, setQuickCreateField] = useState<string | null>(null);
  const [quickCreateValues, setQuickCreateValues] = useState<Record<string, string>>({});
  const [quickCreateSaving, setQuickCreateSaving] = useState(false);
  const [quickCreateError, setQuickCreateError] = useState<string | null>(null);

  const visibleFormFields = mod.formFields?.filter((f) => {
    if (f.hidden) return false;
    if (f.visibleWhen && !f.visibleWhen.in.includes(formValues[f.visibleWhen.field] ?? '')) return false;
    return true;
  }) ?? [];
  const columns: ModuleColumn[] = mod.columns ?? mod.fields.slice(0, 5).map((f) => ({
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
  const loadOptions = useCallback(async () => {
    const fields = mod.formFields?.filter((f) => f.type === 'select' && f.optionsEndpoint) ?? [];
    if (fields.length === 0) return;
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
    setOptions((cur) => ({ ...cur, ...loaded }));
  }, [mod.formFields]);

  useEffect(() => { loadOptions(); }, [loadOptions]);

  // ── Création rapide d'une option manquante (ex: nouveau client) ───────────
  async function submitQuickCreate(field: ModuleFormField) {
    if (!field.quickCreate) return;
    setQuickCreateSaving(true);
    setQuickCreateError(null);
    try {
      const created = await apiClient.post<any>(field.quickCreate.endpoint, quickCreateValues);
      const item = created?.data ?? created;
      await loadOptions();
      setFormValues((cur) => ({ ...cur, [field.name]: String(item.id) }));
      setQuickCreateField(null);
      setQuickCreateValues({});
    } catch (err: any) {
      setQuickCreateError(err?.message || 'Création impossible');
    } finally {
      setQuickCreateSaving(false);
    }
  }

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
    setLockedFields({});
    setFormError(null);
    setFormErrorDetails(null);
    setShowForm(false);
  }

  function beginCreate() {
    setEditingItemId(null);
    setFormValues(getInitialFormValues(mod));
    setLockedFields({});
    setFormError(null);
    setFormErrorDetails(null);
    setShowForm((cur) => !cur || isEditing);
  }

  function beginEdit(item: any) {
    if (!mod.formFields) return;
    const nextValues = mod.formFields.reduce<Record<string, string>>((acc, field) => {
      const val = getValue(item, field.name);
      acc[field.name] = val === undefined
        ? normalizeFieldValue(field.defaultValue)
        : normalizeFieldValue(val);
      return acc;
    }, {});
    const initialLocks = mod.formFields.reduce<Record<string, boolean>>((acc, field) => {
      if (field.lockOnceSet && nextValues[field.name]) {
        acc[field.name] = true;
      }
      return acc;
    }, {});
    setFileValues({});
    setEditingItemId(item.id);
    setFormValues(nextValues);
    setLockedFields(initialLocks);
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
        .filter((f) => !f.visibleWhen || f.visibleWhen.in.includes(formValues[f.visibleWhen.field] ?? ''))
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
        if (hasFiles && submitPayload instanceof FormData) {
          submitPayload.append('_method', 'PUT');
          await apiClient.post(`${mod.endpoint}/${editingItemId}`, submitPayload);
        } else {
          await apiClient.put(`${mod.endpoint}/${editingItemId}`, submitPayload);
        }
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
      await apiClient.openPdf(`/${mod.exportRoute}/${item.id}/export`);
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
            {hasWriteAccess && (
              <button
                className="btn-primary disabled:cursor-not-allowed disabled:bg-slate-300 shrink-0"
                disabled={!mod.formFields}
                onClick={beginCreate}
                type="button"
              >
                {showForm && isEditing ? 'Ajouter un nouvel élément' : mod.primaryAction}
              </button>
            )}
          </div>

          <div className="p-5">

            {/* Formulaire création / édition */}
            {showForm && mod.formFields && hasWriteAccess && (
              <form className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-5" onSubmit={handleCreate}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-[#111827]">
                    {isEditing ? "Modifier l'élément" : 'Nouvel élément'}
                  </h3>
                  {isEditing && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                      Édition
                    </span>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {visibleFormFields.map((field) => (
                    <Fragment key={field.name}>
                    <label className="text-sm font-semibold text-[#111827]">
                      <span className="flex items-center justify-between gap-2">
                        {field.label}
                        {field.quickCreate && (
                          <button
                            type="button"
                            onClick={() => {
                              setQuickCreateError(null);
                              setQuickCreateValues({});
                              setQuickCreateField((cur) => (cur === field.name ? null : field.name));
                            }}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                              quickCreateField === field.name
                                ? 'border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'border-[#185FA5]/30 bg-[#185FA5]/[0.06] text-[#185FA5] hover:bg-[#185FA5]/[0.12]'
                            }`}
                          >
                            {quickCreateField === field.name ? (
                              <>
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Annuler
                              </>
                            ) : (
                              <>
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Nouveau
                              </>
                            )}
                          </button>
                        )}
                      </span>
                      {field.type === 'select' ? (
                        <select
                          className="field-control mt-2"
                          name={field.name}
                          disabled={field.readOnly || lockedFields[field.name]}
                          required={field.required}
                          value={formValues[field.name] ?? ''}
                          onChange={(e) => {
                            const nextValue = e.target.value;
                            setFormValues((cur) => {
                              const next = { ...cur, [field.name]: nextValue };
                              const dependents = mod.formFields?.filter((f) => f.deriveFrom?.field === field.name) ?? [];
                              if (dependents.length > 0) {
                                const chosen = (options[field.name] ?? []).find((opt) => String(opt.id) === nextValue);
                                setLockedFields((curLocks) => {
                                  const nextLocks = { ...curLocks };
                                  dependents.forEach((dep) => {
                                    if (dep.lockOnceSet) {
                                      nextLocks[dep.name] = false;
                                    }
                                  });
                                  return nextLocks;
                                });
                                dependents.forEach((dep) => {
                                  const derived = chosen ? getValue(chosen, dep.deriveFrom!.path) : '';
                                  next[dep.name] = normalizeFieldValue(derived);
                                  if (dep.lockOnceSet && derived) {
                                    setLockedFields((curLocks) => ({ ...curLocks, [dep.name]: true }));
                                  }
                                });
                              }
                              return next;
                            });
                          }}
                        >
                          <option value="">Sélectionner</option>
                          {field.staticOptions
                            ? field.staticOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))
                            : (options[field.name] ?? []).map((option) => (
                                <option key={option.id} value={option.id}>
                                  {getOptionText(field, option)}
                                </option>
                              ))
                          }
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
                          readOnly={field.readOnly || lockedFields[field.name]}
                          required={field.required}
                          value={formValues[field.name] ?? ''}
                          onChange={(e) => setFormValues((cur) => ({ ...cur, [field.name]: e.target.value }))}
                        />
                      )}
                      {field.type === 'select' && field.helperFrom && (() => {
                        const chosen = (options[field.name] ?? []).find((opt) => String(opt.id) === formValues[field.name]);
                        if (!chosen) return null;
                        const raw = getValue(chosen, field.helperFrom.path);
                        if (raw === undefined || raw === null || raw === '') return null;
                        const displayed = field.helperFrom!.format === 'money'
                          ? `${new Intl.NumberFormat('fr-FR').format(Number(raw))} XOF`
                          : String(raw);
                        return (
                          <p className="mt-1.5 text-xs font-semibold text-slate-500">
                            {field.helperFrom!.label} : <span className="text-[#185FA5]">{displayed}</span>
                          </p>
                        );
                      })()}
                      {field.lockOnceSet && lockedFields[field.name] && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-slate-400">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Déjà enregistré, non modifiable
                        </p>
                      )}
                    </label>
                    {quickCreateField === field.name && field.quickCreate && (
                      <div className="md:col-span-2 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#185FA5]/10 text-[#185FA5]">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-[#111827]">Nouveau {field.label.toLowerCase()}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {field.quickCreate.fields.map((qf) => (
                            <label key={qf.name} className="text-xs font-semibold text-slate-600">
                              {qf.label}
                              {qf.type === 'select' ? (
                                <select
                                  className="field-control mt-1.5"
                                  value={quickCreateValues[qf.name] ?? ''}
                                  onChange={(e) => setQuickCreateValues((cur) => ({ ...cur, [qf.name]: e.target.value }))}
                                >
                                  <option value="">Sélectionner</option>
                                  {qf.staticOptions?.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  className="field-control mt-1.5"
                                  type={qf.type ?? 'text'}
                                  value={quickCreateValues[qf.name] ?? ''}
                                  onChange={(e) => setQuickCreateValues((cur) => ({ ...cur, [qf.name]: e.target.value }))}
                                />
                              )}
                            </label>
                          ))}
                        </div>
                        {quickCreateError && <p className="text-xs font-semibold text-red-600">{quickCreateError}</p>}
                        <div className="flex justify-end gap-2">
                          <button type="button" className="btn-secondary text-xs" onClick={() => { setQuickCreateField(null); setQuickCreateValues({}); }}>
                            Annuler
                          </button>
                          <button
                            type="button"
                            disabled={quickCreateSaving}
                            className="btn-primary text-xs disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => submitQuickCreate(field)}
                          >
                            {quickCreateSaving ? 'Création…' : 'Créer et sélectionner'}
                          </button>
                        </div>
                      </div>
                    )}
                    </Fragment>
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
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#111827]">{metric.label}</p>
                    <p className="mt-2 text-2xl font-black text-[#111827]">{formatValue(metric.value)}</p>
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
                                {col.type === 'image' || col.key === 'image_principale' || col.key.includes('chemin') ? (
                                  getValue(item, col.key) ? (
                                    <Image
                                      src={`${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/storage/${getValue(item, col.key)}`}
                                      alt="photo"
                                      width={56} height={40}
                                      className="h-10 w-14 rounded-lg object-cover border border-slate-200"
                                    />
                                  ) : (
                                    <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400">—</div>
                                  )
                                ) : (
                                  renderCell(getValue(item, col.key), col.type)
                                )}
                              </td>
                            ))}
                            <td className="table-cell">
                              <div className="flex items-center gap-3">
                                {mod.detailRoute && (
                                  <Link
                                    href={`/${mod.detailRoute}/${item.id}`}
                                    className="text-xs font-semibold text-[#111827] hover:text-slate-900 transition-colors"
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
                                    className="inline-flex items-center gap-1 rounded border border-[#dfe3eb] bg-white px-2 py-1 text-xs font-semibold text-[#111827] transition hover:border-[#185FA5] hover:bg-[#185FA5] hover:text-white disabled:opacity-40"
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
                                {hasWriteAccess && mod.formFields && (
                                  <button
                                    type="button"
                                    className="text-xs font-semibold text-slate-500 hover:text-[#111827] transition-colors"
                                    onClick={() => beginEdit(item)}
                                  >
                                    Modifier
                                  </button>
                                )}
                                {hasWriteAccess && (
                                  <button
                                    type="button"
                                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    Supprimer
                                  </button>
                                )}
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
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#374151]"
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
