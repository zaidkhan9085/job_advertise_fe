import { useState, useCallback } from "react";
import type { BulkDeletePayload } from "@/lib/api";

// Gmail-style row selection: either an explicit set of selected ids, or
// "every row matching the current filters" (selectAllMatching) with an
// exclude set for rows the admin deselected afterward. Shared by every
// admin table that supports bulk delete (Candidates, Jobs, Employers).
export function useTableSelection<TId extends string | number>() {
  const [selectedIds, setSelectedIds] = useState<Set<TId>>(new Set());
  const [selectAllMatching, setSelectAllMatching] = useState(false);
  const [excludeIds, setExcludeIds] = useState<Set<TId>>(new Set());

  const isSelected = useCallback(
    (id: TId) => (selectAllMatching ? !excludeIds.has(id) : selectedIds.has(id)),
    [selectAllMatching, excludeIds, selectedIds]
  );

  const toggleRow = useCallback(
    (id: TId) => {
      if (selectAllMatching) {
        setExcludeIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    [selectAllMatching]
  );

  const togglePage = useCallback(
    (pageIds: TId[]) => {
      if (selectAllMatching) {
        setExcludeIds((prev) => {
          const allExcluded = pageIds.every((id) => prev.has(id));
          const next = new Set(prev);
          pageIds.forEach((id) => (allExcluded ? next.delete(id) : next.add(id)));
          return next;
        });
        return;
      }
      setSelectedIds((prev) => {
        const allSelected = pageIds.length > 0 && pageIds.every((id) => prev.has(id));
        const next = new Set(prev);
        pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
        return next;
      });
    },
    [selectAllMatching]
  );

  const selectAll = useCallback(() => {
    setSelectAllMatching(true);
    setExcludeIds(new Set());
    setSelectedIds(new Set());
  }, []);

  const clear = useCallback(() => {
    setSelectAllMatching(false);
    setExcludeIds(new Set());
    setSelectedIds(new Set());
  }, []);

  const count = useCallback(
    (totalMatching: number) => (selectAllMatching ? Math.max(0, totalMatching - excludeIds.size) : selectedIds.size),
    [selectAllMatching, excludeIds, selectedIds]
  );

  const isPageFullySelected = useCallback(
    (pageIds: TId[]) => pageIds.length > 0 && pageIds.every((id) => isSelected(id)),
    [isSelected]
  );

  // The payload shape the bulk-delete endpoints expect.
  const toBulkDeletePayload = useCallback(
    (filters: Record<string, unknown>): BulkDeletePayload =>
      selectAllMatching
        ? { selectAllMatching: true, filters, excludeIds: Array.from(excludeIds) }
        : { ids: Array.from(selectedIds) },
    [selectAllMatching, excludeIds, selectedIds]
  );

  return {
    selectedIds,
    selectAllMatching,
    excludeIds,
    isSelected,
    toggleRow,
    togglePage,
    selectAll,
    clear,
    count,
    isPageFullySelected,
    toBulkDeletePayload,
  };
}
