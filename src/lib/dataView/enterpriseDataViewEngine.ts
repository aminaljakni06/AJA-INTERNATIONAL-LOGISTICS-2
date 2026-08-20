/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Data View Engine
 * Phase: Enterprise UI System
 * Module: Data Views, Saved Views & Personalization (STEP 05.16)
 * Version: 1.0
 */

import {
  EnterpriseDataView,
  PersistedQueryConfig,
  TablePersonalizationConfig,
  DataViewResourceAdapter,
} from '../../types/dataViewFramework';
import { EnterpriseQueryState } from '../../types/queryFramework';
import { TableDensity } from '../../types/tableFramework';
import { normalizeQueryState } from '../query/enterpriseQueryEngine';
import { getResourceAdapter } from './resourceAdapters';

/**
 * Normalizes and sanitizes a raw or persisted EnterpriseDataView
 */
export function normalizeDataView(
  rawView: Partial<EnterpriseDataView>,
  adapterInput?: DataViewResourceAdapter
): EnterpriseDataView {
  const resource = rawView.resource || 'default';
  const adapter = adapterInput || getResourceAdapter(resource);

  const nowISO = new Date().toISOString();

  // 1. Normalize Query Config (Reuse STEP 05.15 normalizeQueryState)
  const queryDefaults = {
    allowedFilterKeys: adapter.allowedFilters,
    allowedSortFields: adapter.allowedSortFields,
    defaultPageSize: adapter.defaultPageSize,
  };

  const rawQueryState: Partial<EnterpriseQueryState> = {
    search: rawView.query?.search || '',
    filters: rawView.query?.filters || {},
    sort: rawView.query?.sort || null,
    pagination: {
      page: 1, // Saved views always reset to page 1
      pageSize: rawView.query?.pageSize || adapter.defaultPageSize,
    },
    cursor: undefined, // Saved views NEVER persist database cursor tokens (Cursor Safety)
  };

  const normalizedQuery = normalizeQueryState(rawQueryState, queryDefaults);

  const persistedQuery: PersistedQueryConfig = {
    search: normalizedQuery.search,
    filters: normalizedQuery.filters,
    sort: normalizedQuery.sort,
    pageSize: normalizedQuery.pagination.pageSize,
    ...(rawView.query?.analytics ? { analytics: rawView.query.analytics } : {}),
  };

  // 2. Sanitize Table Personalization Config
  const availableColumnIds = new Set(adapter.availableColumns.map((col) => col.id));
  const requiredColumnIds = new Set(adapter.requiredColumns);

  let rawVisibleCols = rawView.table?.visibleColumns || adapter.defaultColumns;
  // Filter out unknown column IDs
  let cleanVisibleCols = rawVisibleCols.filter((colId) => availableColumnIds.has(colId));

  // Ensure all required columns are present
  requiredColumnIds.forEach((reqId) => {
    if (!cleanVisibleCols.includes(reqId)) {
      cleanVisibleCols.unshift(reqId);
    }
  });

  // Ensure at least one column is visible
  if (cleanVisibleCols.length === 0) {
    cleanVisibleCols = [...adapter.defaultColumns];
  }

  // Sanitize Column Order
  let columnOrder = rawView.table?.columnOrder || cleanVisibleCols;
  columnOrder = columnOrder.filter((colId) => availableColumnIds.has(colId));
  // Append any missing visible columns to columnOrder
  cleanVisibleCols.forEach((colId) => {
    if (!columnOrder.includes(colId)) {
      columnOrder.push(colId);
    }
  });

  // Sanitize Density
  const validDensities: TableDensity[] = ['compact', 'comfortable', 'spacious'];
  const density: TableDensity =
    rawView.table?.density && validDensities.includes(rawView.table.density)
      ? rawView.table.density
      : adapter.defaultDensity;

  const tableConfig: TablePersonalizationConfig = {
    visibleColumns: cleanVisibleCols,
    columnOrder,
    columnWidths: rawView.table?.columnWidths || {},
    density,
  };

  return {
    id: rawView.id || `view-${Date.now()}`,
    schemaVersion: 1,
    resource,
    nameEn: (rawView.nameEn || 'Custom View').trim(),
    nameAr: (rawView.nameAr || 'عرض مخصص').trim(),
    descriptionEn: rawView.descriptionEn || '',
    descriptionAr: rawView.descriptionAr || '',
    ownerType: rawView.ownerType || 'USER',
    ownerId: rawView.ownerId,
    visibility: rawView.visibility || 'PRIVATE',
    isDefault: Boolean(rawView.isDefault),
    isSystem: Boolean(rawView.isSystem),
    query: persistedQuery,
    table: tableConfig,
    createdAt: rawView.createdAt || nowISO,
    updatedAt: rawView.updatedAt || nowISO,
    createdBy: rawView.createdBy,
    updatedBy: rawView.updatedBy,
  };
}

/**
 * Detects if the current active state differs from the active saved view (Unsaved Change Detection)
 */
export function isDataViewModified(
  activeView: EnterpriseDataView,
  currentQuery: EnterpriseQueryState,
  currentTable: TablePersonalizationConfig
): boolean {
  // Compare Search
  if ((activeView.query.search || '') !== (currentQuery.search || '')) {
    return true;
  }

  // Compare Page Size
  if ((activeView.query.pageSize || 25) !== (currentQuery.pagination?.pageSize || 25)) {
    return true;
  }

  // Compare Sort
  const viewSortKey = activeView.query.sort
    ? `${activeView.query.sort.field}:${activeView.query.sort.direction}`
    : 'none';
  const currSortKey = currentQuery.sort ? `${currentQuery.sort.field}:${currentQuery.sort.direction}` : 'none';
  if (viewSortKey !== currSortKey) {
    return true;
  }

  // Compare Filters
  const viewFilterJson = JSON.stringify(activeView.query.filters || {});
  const currFilterJson = JSON.stringify(currentQuery.filters || {});
  if (viewFilterJson !== currFilterJson) {
    return true;
  }

  // Compare Table Density
  if (activeView.table.density !== currentTable.density) {
    return true;
  }

  // Compare Visible Columns
  const viewCols = [...(activeView.table.visibleColumns || [])].sort().join(',');
  const currCols = [...(currentTable.visibleColumns || [])].sort().join(',');
  if (viewCols !== currCols) {
    return true;
  }

  // Compare Column Order
  const viewOrder = (activeView.table.columnOrder || []).join(',');
  const currOrder = (currentTable.columnOrder || []).join(',');
  if (viewOrder !== currOrder) {
    return true;
  }

  return false;
}
