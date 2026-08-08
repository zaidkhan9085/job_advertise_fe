"use client";

import Table, { type ColumnType } from "rc-table";
import { Search, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

export interface CommonTableColumn<T> {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number | string;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  align?: "left" | "right" | "center";
}

export interface CommonTablePagination {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export interface CommonTableSelection<TId extends string | number> {
  pageIds: TId[];
  totalMatching: number;
  isSelected: (id: TId) => boolean;
  isPageFullySelected: (pageIds: TId[]) => boolean;
  onToggleRow: (id: TId) => void;
  onTogglePage: (pageIds: TId[]) => void;
  onSelectAllMatching: () => void;
  onClearSelection: () => void;
  selectedCount: number;
  selectAllMatching: boolean;
  bulkDeleteLabel?: string;
  onBulkDelete: () => void;
  isBulkDeleting?: boolean;
}

// Matches rc-table's own DefaultRecordType constraint (Record<string, any>);
// a stricter `unknown` constraint rejects plain interfaces without an index
// signature, which is exactly what every page here passes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CommonTableProps<T extends Record<string, any>, TId extends string | number> {
  columns: CommonTableColumn<T>[];
  data: T[];
  rowKey: (record: T) => TId;
  loading?: boolean;
  emptyMessage?: string;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  filters?: ReactNode;
  pagination?: CommonTablePagination;
  selection?: CommonTableSelection<TId>;
  exportButton?: { label?: string; onClick: () => void; disabled?: boolean };
}

// Header/body cell + row renderers reimplement the exact Tailwind classes
// the admin tables already used as plain <table> markup, so switching to
// rc-table doesn't change how anything looks — rc-table only supplies
// structure, not styling, which is why it's a safe fit here.
function HeaderCell(props: ThHTMLAttributes<HTMLTableCellElement>) {
  const { className, ...rest } = props;
  return (
    <th
      {...rest}
      className={`px-6 py-4 font-black uppercase tracking-widest text-[10px] ${className ?? ""}`}
    />
  );
}

function BodyCell(props: TdHTMLAttributes<HTMLTableCellElement>) {
  const { className, ...rest } = props;
  return <td {...rest} className={`px-6 py-5 ${className ?? ""}`} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
export default function CommonTable<T extends Record<string, any>, TId extends string | number>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = "No records found.",
  search,
  filters,
  pagination,
  selection,
  exportButton,
}: CommonTableProps<T, TId>) {
  const rcColumns: ColumnType<T>[] = [];

  if (selection) {
    const pageFullySelected = selection.isPageFullySelected(selection.pageIds);
    rcColumns.push({
      key: "__select",
      width: 44,
      title: (
        <input
          type="checkbox"
          checked={pageFullySelected}
          onChange={() => selection.onTogglePage(selection.pageIds)}
          className="w-4 h-4 rounded border-border/60 accent-brand-blue"
        />
      ),
      render: (_: unknown, record: T) => {
        const id = rowKey(record);
        return (
          <input
            type="checkbox"
            checked={selection.isSelected(id)}
            onChange={() => selection.onToggleRow(id)}
            className="w-4 h-4 rounded border-border/60 accent-brand-blue"
          />
        );
      },
    });
  }

  columns.forEach((col) => {
    rcColumns.push({
      key: col.key,
      title: col.title,
      dataIndex: col.dataIndex,
      width: col.width,
      align: col.align,
      render: col.render
        ? (value: unknown, record: T, index: number) => col.render!(value, record, index)
        : undefined,
    });
  });

  const showSelectionBar = selection && (selection.selectedCount > 0 || selection.selectAllMatching);
  const pageFullySelectedForBanner = selection?.isPageFullySelected(selection.pageIds);

  return (
    <div className="space-y-4">
      {(search || filters || exportButton) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            {search && (
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-blue transition-colors" />
                <input
                  type="text"
                  placeholder={search.placeholder ?? "Search..."}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm font-medium"
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                />
              </div>
            )}
            {filters}
          </div>
          {exportButton && (
            <button
              onClick={exportButton.onClick}
              disabled={exportButton.disabled}
              className="inline-flex items-center justify-center gap-2 bg-white border border-border/60 hover:bg-secondary px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shrink-0"
            >
              <Download className="w-4 h-4" /> {exportButton.label ?? "Export CSV"}
            </button>
          )}
        </div>
      )}

      {showSelectionBar && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-blue/5 border border-brand-blue/20 rounded-xl px-4 py-3">
          <div className="text-sm font-bold text-brand-blue">
            {selection!.selectAllMatching
              ? `All ${selection!.selectedCount} matching selected.`
              : `${selection!.selectedCount} selected.`}{" "}
            {!selection!.selectAllMatching && pageFullySelectedForBanner && selection!.totalMatching > selection!.pageIds.length && (
              <button onClick={selection!.onSelectAllMatching} className="underline hover:no-underline">
                Select all {selection!.totalMatching} matching filters
              </button>
            )}
            {selection!.selectAllMatching && (
              <button onClick={selection!.onClearSelection} className="underline hover:no-underline ml-1">
                Clear selection
              </button>
            )}
          </div>
          <button
            onClick={selection!.onBulkDelete}
            disabled={selection!.isBulkDeleting}
            className="inline-flex items-center justify-center gap-2 bg-rose-600 text-white hover:bg-rose-700 px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            {selection!.bulkDeleteLabel ?? `Delete Selected (${selection!.selectedCount})`}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table<T>
            columns={rcColumns}
            data={loading ? [] : data}
            rowKey={(record) => rowKey(record)}
            className="w-full text-sm text-left whitespace-nowrap"
            emptyText={loading ? "Loading..." : emptyMessage}
            onHeaderRow={() => ({ className: "bg-muted/30 text-muted-foreground border-b border-border/60" })}
            rowClassName={() => "hover:bg-muted/30 transition-colors group border-b border-border/60 last:border-b-0"}
            components={{
              header: { cell: HeaderCell },
              body: { cell: BodyCell },
            }}
          />
        </div>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground font-medium">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-border/60 hover:bg-secondary disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-border/60 hover:bg-secondary disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
