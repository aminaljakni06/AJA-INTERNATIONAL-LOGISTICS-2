/**
 * AJA INTERNATIONAL LOGISTICS — Value Normalization Engine
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Schema Mapping & Validation Engine (STEP 05.18.08)
 * Version: 1.0
 */

import { ImportColumnDefinition, DATA_EXCHANGE_LIMITS } from '../../types/dataTransferFramework';

export interface NormalizationResult {
  normalizedValue: any;
  error?: {
    code: string;
    messageEn: string;
    messageAr: string;
  };
}

/**
 * Normalize and validate individual cell input against ImportColumnDefinition type and constraints
 */
export function normalizeCellValue(
  rawValue: unknown,
  colDef: ImportColumnDefinition
): NormalizationResult {
  // 1. Handle Empty / Null / Missing Input
  const isNullOrUndefined = rawValue === null || rawValue === undefined;
  const isWhitespaceString = typeof rawValue === 'string' && rawValue.trim() === '';

  if (isNullOrUndefined || isWhitespaceString) {
    if (colDef.required) {
      return {
        normalizedValue: null,
        error: {
          code: 'REQUIRED_FIELD',
          messageEn: `Field "${colDef.labelEn}" (${colDef.field}) is required and cannot be empty.`,
          messageAr: `الحقل "${colDef.labelAr}" (${colDef.field}) مطلوب ولا يمكن أن يكون فارغاً.`,
        },
      };
    }
    return { normalizedValue: null };
  }

  const maxLen = DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH;

  // 2. Type-Specific Normalization
  switch (colDef.type) {
    case 'string': {
      let strVal = String(rawValue).trim();

      // Formula injection protection check (preserve safe text, never execute formula)
      if (strVal.startsWith("'") && /^[=+\-@\t\r]/.test(strVal.slice(1))) {
        strVal = strVal.slice(1);
      }

      if (strVal.length > maxLen) {
        return {
          normalizedValue: strVal.slice(0, maxLen),
          error: {
            code: 'VALUE_TOO_LONG',
            messageEn: `Value length (${strVal.length}) exceeds maximum limit of ${maxLen} characters.`,
            messageAr: `طول القيمة (${strVal.length}) يتجاوز الحد الأقصى المسموح به وهو ${maxLen} حرفاً.`,
          },
        };
      }

      return { normalizedValue: strVal };
    }

    case 'number': {
      if (typeof rawValue === 'number') {
        if (!Number.isFinite(rawValue)) {
          return {
            normalizedValue: null,
            error: {
              code: 'INVALID_NUMBER',
              messageEn: `Field "${colDef.labelEn}" must be a valid finite number.`,
              messageAr: `الحقل "${colDef.labelAr}" يجب أن يكون رقماً محددًا وصحيحًا.`,
            },
          };
        }
        return { normalizedValue: rawValue };
      }

      const strNum = String(rawValue).trim().replace(/,/g, ''); // Remove thousands commas
      const parsedNum = Number(strNum);

      if (isNaN(parsedNum) || !Number.isFinite(parsedNum) || strNum === '') {
        return {
          normalizedValue: null,
          error: {
            code: 'INVALID_NUMBER',
            messageEn: `Value "${rawValue}" is not a valid number for field "${colDef.labelEn}".`,
            messageAr: `القيمة "${rawValue}" ليست رقماً صالحاً للحقل "${colDef.labelAr}".`,
          },
        };
      }

      return { normalizedValue: parsedNum };
    }

    case 'boolean': {
      if (typeof rawValue === 'boolean') {
        return { normalizedValue: rawValue };
      }

      const strBool = String(rawValue).trim().toLowerCase();
      if (['true', '1', 'yes', 'y', 'نعم', 'صح', 'صحيح'].includes(strBool)) {
        return { normalizedValue: true };
      }
      if (['false', '0', 'no', 'n', 'لا', 'خطأ', 'غير صحيح'].includes(strBool)) {
        return { normalizedValue: false };
      }

      return {
        normalizedValue: null,
        error: {
          code: 'INVALID_BOOLEAN',
          messageEn: `Value "${rawValue}" is not a valid boolean (true/false) for field "${colDef.labelEn}".`,
          messageAr: `القيمة "${rawValue}" ليست قيمة منطقية صالحة (صواب/خطأ) للحقل "${colDef.labelAr}".`,
        },
      };
    }

    case 'date': {
      if (rawValue instanceof Date) {
        if (isNaN(rawValue.getTime())) {
          return {
            normalizedValue: null,
            error: {
              code: 'INVALID_DATE',
              messageEn: `Invalid date object for field "${colDef.labelEn}".`,
              messageAr: `تاريخ غير صالح للحقل "${colDef.labelAr}".`,
            },
          };
        }
        return { normalizedValue: rawValue.toISOString().split('T')[0] };
      }

      const strDate = String(rawValue).trim();
      const parsedTimestamp = Date.parse(strDate);

      if (isNaN(parsedTimestamp)) {
        return {
          normalizedValue: null,
          error: {
            code: 'INVALID_DATE',
            messageEn: `Value "${rawValue}" is not a valid date (expected YYYY-MM-DD) for field "${colDef.labelEn}".`,
            messageAr: `القيمة "${rawValue}" ليست تاريخاً صالحاً (الصيغة المتوقعة YYYY-MM-DD) للحقل "${colDef.labelAr}".`,
          },
        };
      }

      const d = new Date(parsedTimestamp);
      const isoDate = d.toISOString().split('T')[0];
      return { normalizedValue: isoDate };
    }

    case 'enum': {
      const strVal = String(rawValue).trim();
      const allowed = colDef.allowedEnumValues || [];

      if (allowed.length === 0) {
        return { normalizedValue: strVal };
      }

      const match = allowed.find(
        (e) => e.toLowerCase() === strVal.toLowerCase() || e.replace(/_/g, ' ').toLowerCase() === strVal.replace(/_/g, ' ').toLowerCase()
      );

      if (match) {
        return { normalizedValue: match };
      }

      return {
        normalizedValue: null,
        error: {
          code: 'INVALID_ENUM',
          messageEn: `Value "${strVal}" is not an allowed enum option for field "${colDef.labelEn}". Allowed values: [${allowed.join(', ')}].`,
          messageAr: `القيمة "${strVal}" ليست خياراً محددًا ومسموحًا به للحقل "${colDef.labelAr}". القيم المسموحة: [${allowed.join(', ')}].`,
        },
      };
    }

    default:
      return { normalizedValue: String(rawValue).trim() };
  }
}
