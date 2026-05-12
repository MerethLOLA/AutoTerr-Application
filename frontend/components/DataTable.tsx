'use client';

import { useState } from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  onEdit,
  onDelete,
  emptyMessage = 'Aucune donnee trouvee',
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(String(column.key))}
                      className="flex items-center gap-1 transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                      {column.header}
                      {sortColumn === column.key && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr
                  key={index}
                  className={onRowClick ? 'cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800' : ''}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-4 text-slate-900 dark:text-white">
                      {column.render
                        ? column.render(item[column.key as keyof T], item)
                        : String(item[column.key as keyof T] ?? '')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="space-x-2 px-6 py-4 text-right">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          className="transition-colors text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Editer
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item);
                          }}
                          className="transition-colors text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
