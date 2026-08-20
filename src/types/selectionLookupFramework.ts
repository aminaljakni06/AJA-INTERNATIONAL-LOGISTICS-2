/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Selection, Lookup & Autocomplete System Types
 * Phase: Enterprise UI System
 * Module: Enterprise Selection, Lookup & Autocomplete System
 * Version: 1.0
 */

export type LookupType =
  | 'customer'
  | 'company'
  | 'branch'
  | 'department'
  | 'user'
  | 'employee'
  | 'role'
  | 'shipment'
  | 'quote'
  | 'booking'
  | 'container'
  | 'warehouse'
  | 'inventory_item'
  | 'product'
  | 'supplier'
  | 'vendor'
  | 'carrier'
  | 'driver'
  | 'vehicle'
  | 'route'
  | 'port'
  | 'airport'
  | 'country'
  | 'city'
  | 'currency'
  | 'language'
  | 'document'
  | 'ai_template';

export interface LookupItem {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  category?: string;
  avatarUrl?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'IN_TRANSIT' | 'COMPLETED';
  tags?: string[];
  metadata?: Record<string, any>;
  isFavorite?: boolean;
  isRecent?: boolean;
  canSelect?: boolean;
}

export interface EntityPreview {
  id: string;
  lookupType: LookupType;
  primaryTitleEn: string;
  primaryTitleAr: string;
  secondarySubtitleEn?: string;
  secondarySubtitleAr?: string;
  badgeStatus?: string;
  badgeColor?: 'emerald' | 'amber' | 'sky' | 'rose' | 'slate';
  metadataMap?: { labelEn: string; labelAr: string; value: string }[];
  avatarUrl?: string;
  updatedAt?: string;
  permissionKey?: string;
}

export interface LookupFilter {
  searchKeyword?: string;
  category?: string;
  status?: string;
  branchId?: string;
  departmentId?: string;
  countryCode?: string;
  tags?: string[];
  customAttributes?: Record<string, any>;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LookupRequest {
  lookupType: LookupType;
  filter: LookupFilter;
  debounceMs?: number;
  isAsync?: boolean;
}

export interface LookupResponse {
  items: LookupItem[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  searchDurationMs: number;
}

export interface SelectionState {
  selectedIds: string[];
  selectedItems: LookupItem[];
  maxSelectionLimit?: number;
  minSelectionLimit?: number;
  isAllSelected?: boolean;
}

export interface AutocompleteOption {
  item: LookupItem;
  highlightedTextEn: string;
  highlightedTextAr: string;
}

export interface SearchMetadata {
  searchCount: number;
  lookupUsageCount: number;
  recentSearches: string[];
  favoriteIds: string[];
  lastSearchTime?: string;
}

export interface LookupConfiguration {
  lookupType: LookupType;
  titleEn: string;
  titleAr: string;
  searchable: boolean;
  filterable: boolean;
  allowMultiple: boolean;
  allowFavorites: boolean;
  enableAsync: boolean;
  pageSize?: number;
  defaultFilter?: LookupFilter;
}
