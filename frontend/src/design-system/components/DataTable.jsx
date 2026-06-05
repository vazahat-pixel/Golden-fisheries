import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { Card } from './Card';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './Skeleton';
import { Button } from './Button';
import { SearchInput } from './Input';

/**
 * Enterprise data table — compact rows, sticky header, sort + pagination.
 * API: columns [{ key, label, render?, sortable? }], rows[], loading, onRowClick
 */
export const DataTable = ({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = 'No records found',
  emptyDescription,
  onRowClick,
  stickyHeader = true,
  pageSize = 25,
  showPagination = true,
  searchable = false,
  searchPlaceholder = 'Search…',
  className,
  compact = true,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const tableColumns = useMemo(
    () =>
      columns.map((col) => ({
        id: col.key,
        accessorKey: col.key,
        header: col.label,
        cell: col.render
          ? ({ row }) => col.render(row.original)
          : ({ getValue }) => {
              const v = getValue();
              return v ?? '—';
            },
        enableSorting: col.sortable !== false,
      })),
    [columns]
  );

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row, i) => row._id || row.id || String(i),
    initialState: { pagination: { pageSize } },
  });

  const cellPy = compact ? 'py-2' : 'py-2.5';
  const headPy = compact ? 'py-2' : 'py-2.5';

  return (
    <Card padding="none" className={cn('overflow-hidden', className)}>
      {searchable && (
        <div className="erp-toolbar px-3 pt-3">
          <SearchInput
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="max-w-sm"
          />
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={Math.min(columns.length || 4, 6)} />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyMessage} description={emptyDescription} compact />
      ) : (
        <>
          <div className={cn(stickyHeader && 'erp-table-wrap')}>
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-card-border bg-surface-muted">
                    {hg.headers.map((header) => {
                      const sorted = header.column.getIsSorted();
                      const canSort = header.column.getCanSort();
                      return (
                        <th
                          key={header.id}
                          className={cn(
                            'px-3 erp-table-header whitespace-nowrap',
                            headPy,
                            canSort && 'cursor-pointer select-none hover:text-text-primary'
                          )}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          <span className="inline-flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort &&
                              (sorted === 'asc' ? (
                                <ChevronUp size={12} />
                              ) : sorted === 'desc' ? (
                                <ChevronDown size={12} />
                              ) : (
                                <ChevronsUpDown size={12} className="opacity-40" />
                              ))}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      'border-b border-card-border last:border-0 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-surface-hover'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn('px-3 erp-table-cell whitespace-nowrap', cellPy)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showPagination && table.getPageCount() > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-card-border bg-surface-muted text-xs text-text-muted">
              <span>
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ·{' '}
                {table.getFilteredRowModel().rows.length} rows
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="xs"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                >
                  <ChevronLeft size={14} className="mr-0.5" /> Prev
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                >
                  Next <ChevronRight size={14} className="ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
