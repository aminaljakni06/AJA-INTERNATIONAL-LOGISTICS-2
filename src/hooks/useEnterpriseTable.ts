/**
 * AJA INTERNATIONAL LOGISTICS — Standardized Enterprise Table & Grid Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { useState, useMemo, useCallback } from 'react';
import { TableState, TableSortOption, TableFilterItem } from '../types/sharedServices';

export interface UseEnterpriseTableOptions<T = any> {
  initialData?: T[];
  pageSize?: number;
  searchFields?: (keyof T)[];
}

export function useEnterpriseTable<T extends { id?: string | number } = any>({
  initialData = [],
  pageSize = 10,
  searchFields = [],
}: UseEnterpriseTableOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState<number>(1);
  const [currentPageSize, setCurrentPageSize] = useState<number>(pageSize);
  const [sort, setSort] = useState<TableSortOption | null>(null);
  const [filters, setFilters] = useState<TableFilterItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
      // 1. Text Search Filter
      if (searchQuery.trim() !== '') {
        const queryLower = searchQuery.toLowerCase().trim();
        const matchesSearch = searchFields.length > 0
          ? searchFields.some((field) => String(item[field] ?? '').toLowerCase().includes(queryLower))
          : Object.values(item).some((val) => String(val ?? '').toLowerCase().includes(queryLower));

        if (!matchesSearch) return false;
      }

      // 2. Multi-column filters
      for (const filter of filters) {
        const itemValue = item[filter.field];
        if (filter.operator === 'equals' && itemValue !== filter.value) return false;
        if (filter.operator === 'contains' && !String(itemValue).toLowerCase().includes(String(filter.value).toLowerCase())) return false;
        if (filter.operator === 'greaterThan' && Number(itemValue) <= Number(filter.value)) return false;
        if (filter.operator === 'lessThan' && Number(itemValue) >= Number(filter.value)) return false;
      }

      return true;
    });
  }, [data, searchQuery, searchFields, filters]);

  // Sorting Logic
  const sortedData = useMemo(() => {
    if (!sort) return filteredData;
    const { field, direction } = sort;

    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[field];
      const valB = b[field];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return direction === 'asc' ? (valA < valB ? -1 : 1) : valA < valB ? 1 : -1;
    });
  }, [filteredData, sort]);

  // Pagination Logic
  const totalRecords = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / currentPageSize));

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * currentPageSize;
    return sortedData.slice(startIndex, startIndex + currentPageSize);
  }, [sortedData, page, currentPageSize]);

  // Selection handlers
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      const ids = paginatedData.map((d: any) => String(d.id || d.shipmentId || d.number));
      setSelectedIds(ids);
    }
  }, [paginatedData, selectedIds]);

  const toggleSelectRow = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Sort toggle handler
  const handleSort = useCallback((field: string) => {
    setSort((prev) => {
      if (prev?.field === field) {
        if (prev.direction === 'asc') return { field, direction: 'desc' };
        return null; // Toggle off
      }
      return { field, direction: 'asc' };
    });
  }, []);

  return {
    data: paginatedData,
    allFilteredData: sortedData,
    tableState: {
      data: paginatedData,
      pagination: {
        page,
        pageSize: currentPageSize,
        totalRecords,
        totalPages,
      },
      sort,
      filters,
      searchQuery,
      selectedIds,
    } as TableState<T>,
    setRawData: setData,
    setPage,
    setPageSize: setCurrentPageSize,
    setSearchQuery,
    setFilters,
    handleSort,
    selectedIds,
    toggleSelectAll,
    toggleSelectRow,
    clearSelection,
  };
}
