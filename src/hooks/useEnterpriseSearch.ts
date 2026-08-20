/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Search Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { useState, useCallback, useEffect } from 'react';
import { SearchResultGroup, RequestContext } from '../types/sharedServices';
import { enterpriseSearchService } from '../services/searchService';

export function useEnterpriseSearch(context?: RequestContext, debounceMs: number = 300) {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      const res = await enterpriseSearchService.globalSearch(query, context);
      setIsSearching(false);

      if (res.success && res.data) {
        setResults(res.data);
      } else {
        setError(res.error || 'Search failed');
        setResults([]);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, context, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearSearch,
  };
}
