/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Table & Data Grid Framework Types
 * Phase: Enterprise UI System
 * Module: Enterprise Tables & Data Grid (STEP 05.14)
 * Version: 1.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TableStateType, TableStateAction } from '../components/common/EnterpriseTableStatesSystem';

export type TableDensity = 'compact' | 'comfortable' | 'spacious';

export type ColumnAlign = 'left' | 'center' | 'right';

export type ColumnStickyPosition = 'none' | 'left' | 'right';

export type ResponsivePriority = 'always' | 'desktop' | 'tablet' | 'never';

export type CellValueType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'status'
  | 'badge'
  | 'progress'
  | 'avatar'
  | 'actions'
  | 'custom';

/**
 * Column Definition Interface
 */
export interface EnterpriseColumnDef<T = any> {
  /** Stable unique identifier for the column */
  id: string;
  /** English header label */
  labelEn: string;
  /** Arabic header label */
  labelAr: string;
  /** Field property accessor key or function */
  accessor?: keyof T | ((row: T) => any);
  /** Custom Cell Render Function */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Is column sortable */
  sortable?: boolean;
  /** Is column filterable */
  filterable?: boolean;
  /** Is column searchable in quick filter */
  searchable?: boolean;
  /** Column layout width e.g. "150px" or "15%" */
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  /** Cell text alignment */
  align?: ColumnAlign;
  /** Initial hidden state */
  hidden?: boolean;
  /** Sticky position e.g. left or right pinned */
  sticky?: ColumnStickyPosition;
  /** Can column be exported to Excel/CSV/PDF */
  exportable?: boolean;
  /** Responsive display priority */
  responsivePriority?: ResponsivePriority;
  /** Built-in formatting cell type hint */
  cellType?: CellValueType;
  /** Tooltip or header explanation */
  descriptionEn?: string;
  descriptionAr?: string;
}

/**
 * Row Action Interface
 */
export interface EnterpriseRowAction<T = any> {
  id: string;
  labelEn: string;
  labelAr: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
  permission?: string;
  requiresConfirmation?: boolean;
  confirmationTitleEn?: string;
  confirmationTitleAr?: string;
  confirmationMessageEn?: string;
  confirmationMessageAr?: string;
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
  onClick: (row: T, index: number) => void;
}

/**
 * Sort State
 */
export interface TableSortState {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter State
 */
export interface TableFilterRule {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'in' | 'between' | 'greaterThan' | 'lessThan';
  value: any;
  labelEn?: string;
  labelAr?: string;
}

/**
 * Pagination Configuration & State
 */
export interface TablePaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  cursor?: string;
  nextCursor?: string;
  prevCursor?: string;
  hasMore?: boolean;
}

/**
 * Selection Mode
 */
export type SelectionMode = 'none' | 'single' | 'multiple';

/**
 * Master Enterprise Data Table Component Props
 */
export interface EnterpriseDataTableProps<T extends Record<string, any> = any> {
  /** Dataset rows array */
  data: T[];
  /** Column definitions */
  columns: EnterpriseColumnDef<T>[];
  /** Unique key extractor field for each row e.g. "id" or "trackingNumber" */
  rowKeyField?: keyof T | ((row: T) => string);
  /** Primary table title */
  titleEn?: string;
  titleAr?: string;
  /** Secondary subtitle / description */
  subtitleEn?: string;
  subtitleAr?: string;
  /** Current table state (loading, empty, error, etc.) */
  stateType?: TableStateType;
  /** Density spacing preset */
  density?: TableDensity;
  /** Selection configuration */
  selectionMode?: SelectionMode;
  selectedKeys?: Set<string>;
  onSelectionChange?: (selectedKeys: Set<string>, selectedRows: T[]) => void;
  /** Total matching records count (for server-side pagination) */
  totalCount?: number;
  /** Server-side or Controlled Pagination */
  pagination?: TablePaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  /** Controlled Search Query */
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  /** Controlled Sort State */
  sortState?: TableSortState | null;
  onSortChange?: (sort: TableSortState | null) => void;
  /** Active Column Filters */
  filters?: TableFilterRule[];
  onFiltersChange?: (filters: TableFilterRule[]) => void;
  /** Row Action Menu Items */
  rowActions?: EnterpriseRowAction<T>[];
  /** Primary Action Button for header */
  primaryHeaderAction?: TableStateAction;
  /** Expandable Row Component */
  expandableRowRender?: (row: T) => React.ReactNode;
  /** On Row Click Handler */
  onRowClick?: (row: T, index: number) => void;
  /** Enable column visibility toggle menu */
  enableColumnVisibility?: boolean;
  /** Enable column reordering & resizing */
  enableColumnReorder?: boolean;
  /** Enable export button (CSV, Excel, PDF) */
  enableExport?: boolean;
  /** Enable print functionality */
  enablePrint?: boolean;
  /** Custom export file name prefix */
  exportFileName?: string;
  /** RTL / Language Mode */
  isAr?: boolean;
  /** Custom Class Name */
  className?: string;
  /** Is table data refreshing in background */
  isRefreshing?: boolean;
  /** On Refresh Callback */
  onRefresh?: () => void;
}
