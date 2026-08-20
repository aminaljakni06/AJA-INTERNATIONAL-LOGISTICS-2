/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Lookup Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Selection, Lookup & Autocomplete System
 * Version: 1.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LookupType,
  LookupFilter,
  LookupItem,
  LookupResponse,
} from '../types/selectionLookupFramework';
import { EnterpriseLookupEngine } from '../services/selection/lookupEngine';

export interface UseEnterpriseLookupOptions {
  lookupType: LookupType;
  initialFilter?: LookupFilter;
  debounceMs?: number;
  autoFetch?: boolean;
}

export function useEnterpriseLookup({
  lookupType,
  initialFilter = {},
  debounceMs = 250,
  autoFetch = true,
}: UseEnterpriseLookupOptions) {
  const [filter, setFilter] = useState<LookupFilter>(initialFilter);
  const [items, setItems] = useState<LookupItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchDurationMs, setSearchDurationMs] = useState<number>(0);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLookup = useCallback(
    async (overrideFilter?: LookupFilter) => {
      setLoading(true);
      setError(null);
      try {
        const reqFilter = overrideFilter || filter;
        const res: LookupResponse = await EnterpriseLookupEngine.executeLookup({
          lookupType,
          filter: reqFilter,
        });

        setItems(res.items);
        setTotalCount(res.totalCount);
        setHasMore(res.hasMore);
        setSearchDurationMs(res.searchDurationMs);
      } catch (err: any) {
        setError(err?.message || 'Failed to execute enterprise lookup');
      } finally {
        setLoading(false);
      }
    },
    [lookupType, filter]
  );

  // Trigger search with debouncing
  useEffect(() => {
    if (!autoFetch) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchLookup();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [filter, autoFetch, debounceMs, fetchLookup]);

  const updateSearchKeyword = (keyword: string) => {
    setFilter((prev) => ({ ...prev, searchKeyword: keyword, page: 1 }));
    if (keyword.trim()) {
      EnterpriseLookupEngine.addRecentSearch(keyword.trim());
    }
  };

  const updateCategory = (category: string) => {
    setFilter((prev) => ({ ...prev, category, page: 1 }));
  };

  const updateStatus = (status: string) => {
    setFilter((prev) => ({ ...prev, status, page: 1 }));
  };

  const toggleFavorite = (itemId: string) => {
    EnterpriseLookupEngine.toggleFavorite(itemId);
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  return {
    items,
    totalCount,
    hasMore,
    loading,
    error,
    searchDurationMs,
    filter,
    setFilter,
    updateSearchKeyword,
    updateCategory,
    updateStatus,
    toggleFavorite,
    refetch: fetchLookup,
  };
}
