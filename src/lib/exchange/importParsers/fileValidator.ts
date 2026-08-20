/**
 * AJA INTERNATIONAL LOGISTICS — Import File Validator & Security Guard
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Upload & Parser Framework (STEP 05.18.07)
 * Version: 1.0
 */

import crypto from 'crypto';
import { DATA_EXCHANGE_LIMITS, ImportFileMetadata } from '../../../types/dataTransferFramework';
import { ImportParserError } from './importParserInterface';

const ALLOWED_CSV_MIMES = new Set([
  'text/csv',
  'text/plain',
  'application/csv',
  'text/x-csv',
  'application/x-csv',
  'text/comma-separated-values',
  'application/vnd.ms-excel', // Legacy Excel CSV association
]);

const ALLOWED_XLSX_MIMES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

/**
 * Sanitize input filename to prevent path traversal, null bytes, and script injection
 */
export function sanitizeImportFilename(rawFileName: string): string {
  if (!rawFileName) return 'import_file';

  // 1. Remove null bytes and control characters
  let clean = rawFileName.replace(/[\x00-\x1F\x7F]/g, '');

  // 2. Remove path traversal sequences and separators
  clean = clean.replace(/\\/g, '/');
  clean = clean.split('/').pop() || 'import_file';
  clean = clean.replace(/\.\.+/g, '.');

  // 3. Remove dangerous shell/FS characters
  clean = clean.replace(/[^a-zA-Z0-9_\-\.\u0600-\u06FF\s]/g, '_');

  // 4. Truncate if too long while preserving extension
  if (clean.length > 100) {
    const extIdx = clean.lastIndexOf('.');
    if (extIdx > 0 && extIdx > clean.length - 10) {
      const ext = clean.slice(extIdx);
      const name = clean.slice(0, 90);
      clean = `${name}${ext}`;
    } else {
      clean = clean.slice(0, 100);
    }
  }

  return clean.trim() || 'import_file';
}

/**
 * Calculate SHA-256 checksum of buffer
 */
export function calculateBufferChecksum(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Perform server-authoritative security & metadata validation on uploaded import file
 */
export function validateImportFile(
  buffer: Buffer,
  rawMetadata: Partial<ImportFileMetadata>
): ImportFileMetadata {
  // 1. Zero-byte check
  if (!buffer || buffer.length === 0) {
    throw new ImportParserError(
      'EMPTY_FILE',
      'Uploaded file is empty (0 bytes).',
      'الملف المرفوع فارغ (0 بايت).'
    );
  }

  // 2. File Size Limit
  if (buffer.length > DATA_EXCHANGE_LIMITS.MAX_FILE_SIZE_BYTES) {
    const maxMb = (DATA_EXCHANGE_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    throw new ImportParserError(
      'FILE_TOO_LARGE',
      `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of ${maxMb} MB.`,
      `حجم الملف يتجاوز الحد الأقصى المسموح به وهو ${maxMb} ميجابايت.`
    );
  }

  // 3. Filename & Extension Normalization
  const cleanName = sanitizeImportFilename(rawMetadata.name || 'import');
  const dotIndex = cleanName.lastIndexOf('.');
  const extension = (dotIndex >= 0 ? cleanName.slice(dotIndex + 1) : rawMetadata.extension || '').toLowerCase();

  if (extension !== 'csv' && extension !== 'xlsx') {
    throw new ImportParserError(
      'INVALID_FILE_TYPE',
      `Unsupported file extension ".${extension}". Only .csv and .xlsx files are allowed.`,
      `صيغة الملف ".${extension}" غير مدعومة. يسمح فقط بملفات .csv و .xlsx.`
    );
  }

  // 4. MIME Type Check
  const rawMime = (rawMetadata.mimeType || '').toLowerCase();
  if (extension === 'csv') {
    if (rawMime && !ALLOWED_CSV_MIMES.has(rawMime) && rawMime !== 'application/octet-stream') {
      throw new ImportParserError(
        'INVALID_FILE_TYPE',
        `Invalid MIME type "${rawMime}" for CSV file.`,
        `نوع MIME غير صالح "${rawMime}" لملف CSV.`
      );
    }
  } else if (extension === 'xlsx') {
    if (rawMime && !ALLOWED_XLSX_MIMES.has(rawMime) && rawMime !== 'application/octet-stream') {
      throw new ImportParserError(
        'INVALID_FILE_TYPE',
        `Invalid MIME type "${rawMime}" for XLSX file.`,
        `نوع MIME غير صالح "${rawMime}" لملف Excel.`
      );
    }
  }

  // 5. Magic Bytes / File Signature Check
  if (extension === 'xlsx') {
    // ZIP magic bytes: PK\x03\x04 -> 0x50 0x4B 0x03 0x04
    if (
      buffer.length < 4 ||
      buffer[0] !== 0x50 ||
      buffer[1] !== 0x4b ||
      buffer[2] !== 0x03 ||
      buffer[3] !== 0x04
    ) {
      throw new ImportParserError(
        'MALFORMED_FILE_SIGNATURE',
        'File extension is .xlsx but file signature does not match a valid ZIP/XLSX workbook.',
        'امتداد الملف .xlsx ولكن التوقيع الرقمي للملف لا يطابق جدول بيانات Excel صالح.'
      );
    }
  } else if (extension === 'csv') {
    // Check first 512 bytes for binary nulls (executables / zip / image binary renamed to csv)
    const checkLength = Math.min(buffer.length, 512);
    let nullByteCount = 0;
    for (let i = 0; i < checkLength; i++) {
      if (buffer[i] === 0x00) nullByteCount++;
    }
    if (nullByteCount > 0) {
      throw new ImportParserError(
        'MALFORMED_FILE_SIGNATURE',
        'File extension is .csv but file contains binary content.',
        'امتداد الملف .csv ولكن يحتوي الملف على محتوى ثنائي غير نصي.'
      );
    }
  }

  const checksum = calculateBufferChecksum(buffer);

  return {
    name: cleanName,
    size: buffer.length,
    mimeType: extension === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension,
    checksum,
  };
}
