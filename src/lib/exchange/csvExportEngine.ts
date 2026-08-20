/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise CSV Export Engine
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Data Export & Import (STEP 05.18.04)
 * Version: 1.0
 */

import { ExportFieldDefinition, DATA_EXCHANGE_LIMITS } from '../../types/dataTransferFramework';
import { ResolvedExportPolicy } from './exportPolicyResolver';
import { sanitizeCSVValue } from './fieldAllowlist';

/**
 * UTF-8 Byte Order Mark (BOM) for Excel Arabic / Unicode CSV Compatibility
 */
export const UTF8_BOM = '\uFEFF';

/**
 * Centralized Filename Sanitizer
 * Removes path traversal characters, control characters, CR/LF, and forces .csv extension
 */
export function sanitizeFilename(fileName?: string, defaultResource = 'export'): string {
  if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
    return `AJA_${defaultResource}_export_${Date.now()}.csv`;
  }

  let cleaned = fileName.trim();

  // Strip path traversal attempts (\ and /) and control characters
  cleaned = cleaned.replace(/[\/\\]/g, '_').replace(/[\r\n\0]/g, '');

  // Strip non-printable ASCII / unsafe characters except letters, numbers, hyphens, underscores, dots, spaces
  cleaned = cleaned.replace(/[^\w\s\.-]/g, '_');

  // Strip existing extension if present
  cleaned = cleaned.replace(/\.[a-zA-Z0-9]+$/i, '');

  if (cleaned.length === 0) {
    cleaned = `AJA_${defaultResource}_export_${Date.now()}`;
  }

  return `${cleaned}.csv`;
}

/**
 * Cell Value CSV Formatter & Escaper
 * Pipelines: Raw Value -> Formatter -> Formula Sanitizer -> CSV Quoting
 */
export function serializeValue(value: any, fieldDef?: ExportFieldDefinition): string {
  if (value === null || value === undefined) {
    return '';
  }

  let formatted: string;

  if (typeof value === 'boolean') {
    formatted = value ? 'true' : 'false';
  } else if (value instanceof Date) {
    formatted = value.toISOString();
  } else if (typeof value === 'number') {
    formatted = String(value);
  } else {
    formatted = String(value);
  }

  // Enforce cell character length limit
  if (formatted.length > DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH) {
    formatted = formatted.slice(0, DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH);
  }

  // Formula injection sanitization (prepend ' if starting with =, +, -, @, \t, \r)
  const sanitized = sanitizeCSVValue(formatted);

  // CSV Escaping Rules:
  // If value contains double quote, comma, newline (\n), or carriage return (\r), wrap in quotes and double internal quotes
  if (/[",\r\n]/.test(sanitized)) {
    const escaped = sanitized.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return sanitized;
}

/**
 * Header Row Serialization
 * Generates CSV header line based on resolved export fields and requested locale
 */
export function serializeHeader(
  fields: ExportFieldDefinition[],
  locale: 'en' | 'ar' = 'en',
  includeHeaders = true
): string {
  if (!includeHeaders || fields.length === 0) {
    return '';
  }

  const headerLabels = fields.map((field) => {
    let label = locale === 'ar' ? field.labelAr || field.labelEn : field.labelEn || field.labelAr;
    if (!label) label = field.key;

    // Escape header label if needed
    if (/[",\r\n]/.test(label)) {
      label = `"${label.replace(/"/g, '""')}"`;
    }
    return label;
  });

  return headerLabels.join(',');
}

/**
 * Record Row Serialization
 * Preserves deterministic field order defined in policy.allowedFields
 */
export function serializeRow(record: Record<string, any>, fields: ExportFieldDefinition[]): string {
  const cellValues = fields.map((field) => {
    const rawVal = record[field.key];
    return serializeValue(rawVal, field);
  });

  return cellValues.join(',');
}

/**
 * Complete CSV String Generator
 * Produces UTF-8 BOM prepended CSV output
 */
export function serializeCSVContent(
  records: Record<string, any>[],
  policy: ResolvedExportPolicy,
  locale: 'en' | 'ar' = 'en'
): string {
  const lines: string[] = [];

  // 1. Header Line
  if (policy.includeHeaders) {
    const headerLine = serializeHeader(policy.allowedFields, locale, true);
    if (headerLine) {
      lines.push(headerLine);
    }
  }

  // 2. Data Rows
  records.forEach((record) => {
    lines.push(serializeRow(record, policy.allowedFields));
  });

  // UTF-8 BOM prepended to ensure Excel properly parses Unicode / Arabic CSV
  return UTF8_BOM + lines.join('\n');
}

/**
 * Trigger CSV Download in Browser
 */
export function exportToCsv(records: Record<string, any>[], filename: string) {
  if (!records || records.length === 0) return;
  const keys = Object.keys(records[0]);
  const header = keys.join(',');
  const rows = records.map((r) => keys.map((k) => `"${sanitizeCSVValue(String(r[k] ?? '')).replace(/"/g, '""')}"`).join(','));
  const csvStr = UTF8_BOM + [header, ...rows].join('\n');
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Incremental Streaming CSV Response Writer
 * Writes CSV chunks directly to an Express Writable Stream handling backpressure and disconnects
 */
export async function streamCSVResponse(
  records: Record<string, any>[],
  policy: ResolvedExportPolicy,
  writable: NodeJS.WritableStream & { clientAborted?: boolean },
  locale: 'en' | 'ar' = 'en'
): Promise<{ recordCount: number; bytesWritten: number }> {
  let bytesWritten = 0;
  let recordCount = 0;

  const writeChunk = async (chunk: string): Promise<boolean> => {
    if (writable.clientAborted) {
      return false;
    }

    const buf = Buffer.from(chunk, 'utf-8');
    bytesWritten += buf.length;

    const canContinue = writable.write(buf);
    if (!canContinue) {
      // Handle backpressure
      await new Promise<void>((resolve) => {
        const onDrain = () => {
          writable.removeListener('drain', onDrain);
          resolve();
        };
        writable.on('drain', onDrain);
      });
    }
    return true;
  };

  // 1. Write UTF-8 BOM
  await writeChunk(UTF8_BOM);

  // 2. Write Header Line
  if (policy.includeHeaders) {
    const headerLine = serializeHeader(policy.allowedFields, locale, true);
    if (headerLine) {
      const ok = await writeChunk(headerLine + '\n');
      if (!ok) return { recordCount, bytesWritten };
    }
  }

  // 3. Write Data Rows in Batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    if (writable.clientAborted) {
      break;
    }

    const batch = records.slice(i, i + BATCH_SIZE);
    const chunkLines = batch.map((rec) => serializeRow(rec, policy.allowedFields)).join('\n');
    const isLastBatch = i + BATCH_SIZE >= records.length;
    const chunkWithEnding = isLastBatch ? chunkLines : chunkLines + '\n';

    const ok = await writeChunk(chunkWithEnding);
    if (!ok) break;

    recordCount += batch.length;
  }

  return { recordCount, bytesWritten };
}
