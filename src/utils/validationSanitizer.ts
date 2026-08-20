/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Input Normalization & Sanitization Engine
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Validation Framework
 * Version: 1.0
 */

/**
 * Escapes unsafe HTML characters to prevent XSS attacks.
 */
export const escapeHtml = (input: string): string => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Trims and normalizes Unicode characters (NFC format).
 */
export const normalizeText = (input: string): string => {
  if (typeof input !== 'string') return input;
  return input.trim().normalize('NFC');
};

/**
 * Normalizes phone numbers to standard E.164 format or cleaned digits.
 */
export const normalizePhoneNumber = (input: string): string => {
  if (typeof input !== 'string') return input;
  // Keep leading +, remove space, dash, parenthesis, dots
  let cleaned = input.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }
  return cleaned;
};

/**
 * Normalizes GCC Commercial Registration or VAT ID numbers (removes spaces/dashes).
 */
export const normalizeTaxId = (input: string): string => {
  if (typeof input !== 'string') return input;
  return input.toUpperCase().replace(/[\s-]/g, '');
};

/**
 * Normalizes Container / Shipping Reference Numbers (Uppercase, no spaces/hyphens).
 */
export const normalizeShippingReference = (input: string): string => {
  if (typeof input !== 'string') return input;
  return input.toUpperCase().replace(/[\s-]/g, '');
};

/**
 * Normalizes currency numeric values.
 */
export const normalizeCurrencyValue = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.round(num * 100) / 100;
  }
  return 0;
};

/**
 * Deep payload sanitizer for objects and arrays.
 */
export const sanitizePayload = <T = any>(payload: T): T => {
  if (payload === null || payload === undefined) return payload;

  if (typeof payload === 'string') {
    return normalizeText(escapeHtml(payload)) as unknown as T;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item)) as unknown as T;
  }

  if (typeof payload === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
      sanitizedObj[key] = sanitizePayload(value);
    }
    return sanitizedObj as T;
  }

  return payload;
};
