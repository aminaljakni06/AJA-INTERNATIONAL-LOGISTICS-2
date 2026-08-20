/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Selection Engine Hook
 * Phase: Enterprise UI System
 * Module: Bulk Actions, Selection & Mass Operations (STEP 05.17)
 * Version: 1.0
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  BulkSelectionMode,
  BulkSelectionState,
  BulkSelectionDescriptor,
} from '../types/bulkFramework';
import { EnterpriseQueryState } from '../types/queryFramework';

export interface UseEnterpriseSelectionOptions {
  resource: string;
  pageRowIds: string[];
  totalMatchingCount?: number;
  currentQuery?: EnterpriseQueryState | null;
  resetOnQueryChange?: boolean;
  onSelectionChange?: (state: BulkSelectionState, descriptor: BulkSelectionDescriptor | null) => void;
}

export function useEnterpriseSelection({
  resource,
  pageRowIds = [],
  totalMatchingCount = 0,
  currentQuery = null,
  resetOnQueryChange = true,
  onSelectionChange,
}: UseEnterpriseSelectionOptions) {
  const [mode, setMode] = useState<BulkSelectionMode>('NONE');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [querySnapshot, setQuerySnapshot] = useState<EnterpriseQueryState | null>(null);
  const [version, setVersion] = useState<number>(0);

  // Invalidate selection when Query or Resource changes
  const prevQueryRef = useRef<string>('');
  useEffect(() => {
    const currentQueryKey = currentQuery
      ? `${resource}:${currentQuery.search}:${JSON.stringify(currentQuery.filters || {})}`
      : resource;

    if (prevQueryRef.current && prevQueryRef.current !== currentQueryKey) {
      if (resetOnQueryChange && mode !== 'NONE') {
        setMode('NONE');
        setSelectedIds(new Set());
        setExcludedIds(new Set());
        setQuerySnapshot(null);
        setVersion((v) => v + 1);
      }
    }
    prevQueryRef.current = currentQueryKey;
  }, [resource, currentQuery, resetOnQueryChange, mode]);

  // Check if a specific row ID is selected
  const isRowSelected = useCallback(
    (id: string): boolean => {
      if (!id) return false;
      if (mode === 'NONE') return false;
      if (mode === 'EXPLICIT' || mode === 'PAGE') {
        return selectedIds.has(id);
      }
      if (mode === 'QUERY') {
        return !excludedIds.has(id);
      }
      return false;
    },
    [mode, selectedIds, excludedIds]
  );

  // Toggle selection for a single row ID
  const toggleRow = useCallback(
    (id: string) => {
      if (!id) return;

      if (mode === 'NONE') {
        setMode('EXPLICIT');
        setSelectedIds(new Set([id]));
        setExcludedIds(new Set());
        setVersion((v) => v + 1);
        return;
      }

      if (mode === 'EXPLICIT') {
        const next = new Set(selectedIds);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        if (next.size === 0) {
          setMode('NONE');
        }
        setSelectedIds(next);
        setVersion((v) => v + 1);
        return;
      }

      if (mode === 'PAGE') {
        const next = new Set(selectedIds);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        setMode('EXPLICIT');
        setSelectedIds(next);
        setVersion((v) => v + 1);
        return;
      }

      if (mode === 'QUERY') {
        const nextExclusions = new Set(excludedIds);
        if (nextExclusions.has(id)) {
          nextExclusions.delete(id);
        } else {
          nextExclusions.add(id);
        }
        setExcludedIds(nextExclusions);
        setVersion((v) => v + 1);
        return;
      }
    },
    [mode, selectedIds, excludedIds]
  );

  // Toggle selection for all visible rows on current page
  const togglePage = useCallback(() => {
    if (pageRowIds.length === 0) return;

    const allPageSelected = pageRowIds.every((id) => isRowSelected(id));

    if (allPageSelected) {
      if (mode === 'PAGE' || mode === 'EXPLICIT') {
        const next = new Set(selectedIds);
        pageRowIds.forEach((id) => next.delete(id));
        if (next.size === 0) {
          setMode('NONE');
        } else {
          setMode('EXPLICIT');
        }
        setSelectedIds(next);
      } else if (mode === 'QUERY') {
        const nextExclusions = new Set(excludedIds);
        pageRowIds.forEach((id) => nextExclusions.add(id));
        setExcludedIds(nextExclusions);
      }
    } else {
      if (mode === 'QUERY') {
        const nextExclusions = new Set(excludedIds);
        pageRowIds.forEach((id) => nextExclusions.delete(id));
        setExcludedIds(nextExclusions);
      } else {
        const next = new Set(selectedIds);
        pageRowIds.forEach((id) => next.add(id));
        setMode('PAGE');
        setSelectedIds(next);
      }
    }
    setVersion((v) => v + 1);
  }, [pageRowIds, isRowSelected, mode, selectedIds, excludedIds]);

  // Select all matching records for current query scope
  const selectAllMatching = useCallback(() => {
    setMode('QUERY');
    setSelectedIds(new Set());
    setExcludedIds(new Set());
    setQuerySnapshot(currentQuery);
    setVersion((v) => v + 1);
  }, [currentQuery]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setMode('NONE');
    setSelectedIds(new Set());
    setExcludedIds(new Set());
    setQuerySnapshot(null);
    setVersion((v) => v + 1);
  }, []);

  // Compute total selected count
  const effectiveCount = useMemo(() => {
    if (mode === 'NONE') return 0;
    if (mode === 'EXPLICIT' || mode === 'PAGE') return selectedIds.size;
    if (mode === 'QUERY') {
      const base = totalMatchingCount || 0;
      return Math.max(0, base - excludedIds.size);
    }
    return 0;
  }, [mode, selectedIds, totalMatchingCount, excludedIds]);

  // Page selection states
  const isAllPageSelected = useMemo(() => {
    if (pageRowIds.length === 0) return false;
    return pageRowIds.every((id) => isRowSelected(id));
  }, [pageRowIds, isRowSelected]);

  const isPageIndeterminate = useMemo(() => {
    if (pageRowIds.length === 0) return false;
    const selectedOnPage = pageRowIds.filter((id) => isRowSelected(id)).length;
    return selectedOnPage > 0 && selectedOnPage < pageRowIds.length;
  }, [pageRowIds, isRowSelected]);

  // Server-safe Bulk Selection Descriptor
  const selectionDescriptor = useMemo((): BulkSelectionDescriptor | null => {
    if (mode === 'NONE' || effectiveCount === 0) return null;

    if (mode === 'EXPLICIT') {
      return {
        mode: 'EXPLICIT',
        ids: Array.from(selectedIds),
      };
    }

    if (mode === 'PAGE') {
      return {
        mode: 'PAGE',
        ids: Array.from(selectedIds),
        page: currentQuery?.pagination?.page || 1,
      };
    }

    if (mode === 'QUERY') {
      return {
        mode: 'QUERY',
        resource,
        query: querySnapshot || currentQuery || {
          search: '',
          filters: {},
          sort: null,
          pagination: { page: 1, pageSize: 25 },
        },
        excludedIds: Array.from(excludedIds),
      };
    }

    return null;
  }, [mode, effectiveCount, selectedIds, currentQuery, resource, querySnapshot, excludedIds]);

  // Notify listener on state updates
  useEffect(() => {
    if (onSelectionChange) {
      const state: BulkSelectionState = {
        mode,
        selectedIds,
        excludedIds,
        resource,
        querySnapshot,
        pageIds: pageRowIds,
        totalMatchingCount,
        visibleCount: pageRowIds.length,
        version,
      };
      onSelectionChange(state, selectionDescriptor);
    }
  }, [mode, selectedIds, excludedIds, resource, querySnapshot, pageRowIds, totalMatchingCount, version, selectionDescriptor, onSelectionChange]);

  return {
    mode,
    selectedIds,
    excludedIds,
    effectiveCount,
    isAllPageSelected,
    isPageIndeterminate,
    selectionDescriptor,
    // Operations
    isRowSelected,
    toggleRow,
    togglePage,
    selectAllMatching,
    clearSelection,
  };
}
