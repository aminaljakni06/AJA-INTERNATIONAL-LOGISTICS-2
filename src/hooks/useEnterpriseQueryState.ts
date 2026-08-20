/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Query State Hook
 * Phase: Enterprise UI System
 * Module: Query State Management (STEP 05.15)
 * Version: 1.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  EnterpriseQueryState,
  UseEnterpriseQueryStateOptions,
  SortRule,
} from '../types/queryFramework';
import {
  normalizeQueryState,
  serializeToURLSearchParams,
  deserializeFromURLSearchParams,
  generateQueryKey,
  isQueryStateEqual,
} from '../lib/query/enterpriseQueryEngine';

export function useEnterpriseQueryState<TFilter extends Record<string, any> = Record<string, any>>(
  options: UseEnterpriseQueryStateOptions<TFilter>
) {
  const {
    resourceName,
    defaults,
    syncWithUrl = true,
    historyMode = 'replace',
    debounceMs = 300,
    serializerConfig,
    onQueryChange,
  } = options;

  // Initialize Query State from URL or Defaults
  const [queryState, setQueryState] = useState<EnterpriseQueryState<TFilter>>(() => {
    if (syncWithUrl && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return deserializeFromURLSearchParams<TFilter>(urlParams, defaults, serializerConfig);
    }
    return normalizeQueryState<TFilter>({}, defaults);
  });

  // Local Search Input value (for debouncing)
  const [searchInput, setSearchInput] = useState<string>(queryState.search);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize Query State with URL
  const syncToUrl = useCallback(
    (newState: EnterpriseQueryState<TFilter>) => {
      if (!syncWithUrl || typeof window === 'undefined') return;

      const params = serializeToURLSearchParams(newState, serializerConfig);
      const queryString = params.toString();
      const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`;

      const currentSearch = window.location.search.replace(/^\?/, '');
      if (currentSearch !== queryString) {
        if (historyMode === 'push') {
          window.history.pushState({ resourceName, state: newState }, '', newUrl);
        } else {
          window.history.replaceState({ resourceName, state: newState }, '', newUrl);
        }
      }
    },
    [syncWithUrl, serializerConfig, historyMode, resourceName]
  );

  // Core State Updater with Normalization
  const updateQueryState = useCallback(
    (updater: (prev: EnterpriseQueryState<TFilter>) => Partial<EnterpriseQueryState<TFilter>>) => {
      setQueryState((prev) => {
        const partial = updater(prev);
        const nextState = normalizeQueryState<TFilter>({ ...prev, ...partial }, defaults);

        if (isQueryStateEqual(prev, nextState)) {
          return prev;
        }

        syncToUrl(nextState);

        if (onQueryChange) {
          onQueryChange(nextState);
        }

        return nextState;
      });
    },
    [defaults, syncToUrl, onQueryChange]
  );

  // Handle Browser Back / Forward Button Navigation
  useEffect(() => {
    if (!syncWithUrl || typeof window === 'undefined') return;

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const newState = deserializeFromURLSearchParams<TFilter>(urlParams, defaults, serializerConfig);
      setQueryState(newState);
      setSearchInput(newState.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncWithUrl, defaults, serializerConfig]);

  // Debounce Search Updates
  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchInput(term);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        updateQueryState((prev) => ({
          search: term,
          pagination: { ...prev.pagination, page: 1 }, // Reset to page 1 on search change
        }));
      }, debounceMs);
    },
    [debounceMs, updateQueryState]
  );

  // Immediate Search Clear (Bypasses debounce)
  const handleSearchClear = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchInput('');
    updateQueryState((prev) => ({
      search: '',
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, [updateQueryState]);

  // Set Single Filter
  const setFilter = useCallback(
    <K extends keyof TFilter>(key: K, value: TFilter[K]) => {
      updateQueryState((prev) => {
        const nextFilters = { ...prev.filters, [key]: value };
        if (value === undefined || value === null || value === '') {
          delete nextFilters[key];
        }
        return {
          filters: nextFilters,
          pagination: { ...prev.pagination, page: 1 }, // Reset to page 1 on filter change
        };
      });
    },
    [updateQueryState]
  );

  // Set Multiple Filters
  const setFilters = useCallback(
    (newFilters: Partial<TFilter>) => {
      updateQueryState((prev) => ({
        filters: { ...prev.filters, ...newFilters },
        pagination: { ...prev.pagination, page: 1 },
      }));
    },
    [updateQueryState]
  );

  // Remove Single Filter
  const removeFilter = useCallback(
    <K extends keyof TFilter>(key: K) => {
      updateQueryState((prev) => {
        const nextFilters = { ...prev.filters };
        delete nextFilters[key];
        return {
          filters: nextFilters,
          pagination: { ...prev.pagination, page: 1 },
        };
      });
    },
    [updateQueryState]
  );

  // Set Sort Rule
  const setSort = useCallback(
    (field: string, direction?: 'asc' | 'desc') => {
      updateQueryState((prev) => {
        let nextSort: SortRule | null = null;

        if (direction) {
          nextSort = { field, direction };
        } else if (prev.sort?.field === field) {
          // Toggle direction: asc -> desc -> null
          if (prev.sort.direction === 'asc') {
            nextSort = { field, direction: 'desc' };
          } else {
            nextSort = null;
          }
        } else {
          nextSort = { field, direction: 'asc' };
        }

        return { sort: nextSort };
      });
    },
    [updateQueryState]
  );

  // Set Page
  const setPage = useCallback(
    (page: number) => {
      updateQueryState((prev) => ({
        pagination: { ...prev.pagination, page: Math.max(1, page) },
      }));
    },
    [updateQueryState]
  );

  // Set Page Size
  const setPageSize = useCallback(
    (pageSize: number) => {
      updateQueryState((prev) => ({
        pagination: { ...prev.pagination, pageSize, page: 1 }, // Reset to page 1 on page size change
      }));
    },
    [updateQueryState]
  );

  // Set Cursor (For Firestore cursor pagination)
  const setCursor = useCallback(
    (cursor?: string) => {
      updateQueryState((prev) => ({
        cursor: cursor ? { cursor } : undefined,
      }));
    },
    [updateQueryState]
  );

  // Reset Query State to Defaults
  const resetQueryState = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const defaultState = normalizeQueryState<TFilter>({}, defaults);
    setSearchInput(defaultState.search);
    setQueryState(defaultState);
    syncToUrl(defaultState);
    if (onQueryChange) onQueryChange(defaultState);
  }, [defaults, syncToUrl, onQueryChange]);

  // Derived Query Key
  const queryKey = generateQueryKey(resourceName, queryState);

  // Cleanup Timer on Unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    queryState,
    queryKey,
    searchInput,
    search: queryState.search,
    filters: queryState.filters,
    sort: queryState.sort,
    pagination: queryState.pagination,
    cursor: queryState.cursor,
    // Actions
    handleSearchChange,
    handleSearchClear,
    setFilter,
    setFilters,
    removeFilter,
    setSort,
    setPage,
    setPageSize,
    setCursor,
    resetQueryState,
    updateQueryState,
  };
}
