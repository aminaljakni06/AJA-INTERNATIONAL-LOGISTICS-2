/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Export Client & Download Engine
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Export API & Table Integration (STEP 05.18.06)
 * Version: 1.0
 */

import {
  EnterpriseExportRequest,
  ExchangeFormat,
  ExchangeScope,
} from '../../types/dataTransferFramework';
import { BulkSelectionDescriptor } from '../../types/bulkFramework';
import { EnterpriseQueryState } from '../../types/queryFramework';

/**
 * Filter out non-exportable UI table column keys
 */
export const SYSTEM_UI_COLUMN_KEYS = new Set([
  'selection',
  'select',
  '_select',
  '__select__',
  'actions',
  'action',
  '_actions',
  '__actions__',
  'expand',
  'expander',
  '_expand',
  '__expand__',
]);

export interface BuildExportRequestOptions {
  resource: string;
  format: ExchangeFormat;
  selection?: BulkSelectionDescriptor | null;
  scope?: ExchangeScope;
  fieldMode?: 'DEFAULT_FIELDS' | 'VISIBLE_COLUMNS';
  visibleFieldKeys?: string[];
  includeHeaders?: boolean;
  fileName?: string;
  locale?: 'en' | 'ar';
  timezone?: string;
  queryState?: EnterpriseQueryState;
  excludedIds?: string[];
  selectedIds?: string[];
}

export interface DownloadExportResult {
  fileName: string;
  fileSize: number;
  format: ExchangeFormat;
}

export class ExportClientError extends Error {
  code: string;
  messageAr?: string;

  constructor(code: string, messageEn: string, messageAr?: string) {
    super(messageEn);
    this.name = 'ExportClientError';
    this.code = code;
    this.messageAr = messageAr;
  }
}

export function getStoredAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...customHeaders };

  if (!headers.Authorization && typeof window !== 'undefined') {
    const token = window.localStorage?.getItem('aja_auth_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Builds a standardized, server-authoritative EnterpriseExportRequest
 */
export function buildEnterpriseExportRequest(
  options: BuildExportRequestOptions
): EnterpriseExportRequest {
  const {
    resource,
    format,
    selection,
    scope,
    fieldMode = 'DEFAULT_FIELDS',
    visibleFieldKeys = [],
    includeHeaders = true,
    fileName,
    locale = 'en',
    timezone = 'Asia/Riyadh',
    queryState,
    excludedIds = [],
    selectedIds = [],
  } = options;

  // Normalize format
  const normalizedFormat: ExchangeFormat = format === 'excel' ? 'xlsx' : format;

  // Resolve Field Selection
  let selectedFields: string[] | undefined = undefined;
  if (fieldMode === 'VISIBLE_COLUMNS' && visibleFieldKeys.length > 0) {
    selectedFields = visibleFieldKeys.filter((k) => !SYSTEM_UI_COLUMN_KEYS.has(k.toLowerCase()));
  }

  // Resolve Selection Descriptor
  let effectiveSelection: BulkSelectionDescriptor | undefined = undefined;

  if (selection) {
    effectiveSelection = selection;
  } else if (scope === 'selected' && selectedIds.length > 0) {
    effectiveSelection = {
      mode: 'EXPLICIT',
      ids: selectedIds,
    };
  } else if (scope === 'query' || scope === 'all' || queryState) {
    effectiveSelection = {
      mode: 'QUERY',
      resource,
      query: queryState || {
        search: '',
        filters: {},
        sort: { field: 'createdAt', direction: 'desc' },
        pagination: { page: 1, pageSize: 25 },
      },
      excludedIds,
    };
  }

  return {
    resource,
    format: normalizedFormat,
    selection: effectiveSelection,
    scope,
    selectedFields,
    includeHeaders,
    fileName,
    locale,
    timezone,
  };
}

/**
 * Parses safe filename from HTTP Content-Disposition response header
 */
export function parseContentDispositionFilename(
  headerValue?: string | null,
  fallbackFilename = 'export.file'
): string {
  if (!headerValue || typeof headerValue !== 'string') {
    return fallbackFilename;
  }

  // Check UTF-8 filename*=UTF-8''... pattern first
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(headerValue);
  if (utf8Match && utf8Match[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      // Ignore decoding failure, fall through to quote match
    }
  }

  // Standard filename="..." or filename=... pattern
  const stdMatch = /filename="?([^";]+)"?/i.exec(headerValue);
  if (stdMatch && stdMatch[1]) {
    return stdMatch[1].trim();
  }

  return fallbackFilename;
}

/**
 * Central Download Client
 * Sends POST request to /api/data-exchange/export/download, parses binary/stream response,
 * and triggers browser direct file download with memory cleanup.
 */
export async function downloadEnterpriseExport(
  request: EnterpriseExportRequest,
  customHeaders: Record<string, string> = {}
): Promise<DownloadExportResult> {
  const response = await fetch('/api/data-exchange/export/download', {
    method: 'POST',
    headers: getStoredAuthHeaders({
      'Content-Type': 'application/json',
      ...customHeaders,
    }),
    body: JSON.stringify(request),
  });

  const contentType = response.headers.get('content-type') || '';

  // Handle API JSON error responses
  if (!response.ok || contentType.includes('application/json')) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parse failure
    }

    const code = errorData.error?.code || `HTTP_${response.status}`;
    const msgEn = errorData.error?.message || `Export download failed with HTTP status ${response.status}.`;
    const msgAr = errorData.error?.messageAr || 'فشل تنزيل ملف التصدير.';

    throw new ExportClientError(code, msgEn, msgAr);
  }

  // Response is binary / stream file payload
  const contentDisposition = response.headers.get('content-disposition');
  const defaultExt = request.format === 'xlsx' ? 'xlsx' : 'csv';
  const fallbackName = request.fileName || `AJA_${request.resource}_export.${defaultExt}`;
  const safeFilename = parseContentDispositionFilename(contentDisposition, fallbackName);

  const blob = await response.blob();
  const fileSize = blob.size;

  // Trigger browser programmatic file download in window context
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blobUrl = URL.createObjectURL(blob);
    const tempAnchor = document.createElement('a');
    tempAnchor.style.display = 'none';
    tempAnchor.href = blobUrl;
    tempAnchor.setAttribute('download', safeFilename);

    document.body.appendChild(tempAnchor);
    tempAnchor.click();

    // Cleanup DOM anchor and revoke blob object URL
    setTimeout(() => {
      if (document.body.contains(tempAnchor)) {
        document.body.removeChild(tempAnchor);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  }

  return {
    fileName: safeFilename,
    fileSize,
    format: request.format,
  };
}
