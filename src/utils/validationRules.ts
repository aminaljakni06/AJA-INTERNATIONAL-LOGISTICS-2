/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Core Validation Rules Library
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Validation Framework
 * Version: 1.0
 */

import { ValidationRule, ValidationErrorItem } from '../types/validationFramework';

/**
 * Creates a required field validator rule.
 */
export const requiredRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'required',
  validator: (val) => {
    const isEmpty =
      val === null ||
      val === undefined ||
      (typeof val === 'string' && val.trim() === '') ||
      (Array.isArray(val) && val.length === 0);

    if (isEmpty) {
      return {
        field,
        rule: 'required',
        severity: 'ERROR',
        messageEn: `${labelEn} is required and cannot be left empty.`,
        messageAr: `${labelAr} مطلوب ولا يمكن تركه فارغاً.`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * Email address validator rule.
 */
export const emailRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'email',
  validator: (val) => {
    if (!val) return null; // Allow empty if not required
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(String(val).trim())) {
      return {
        field,
        rule: 'email',
        severity: 'ERROR',
        messageEn: `Please enter a valid email address for ${labelEn}.`,
        messageAr: `يرجى إدخال عنوان بريد إلكتروني صحيح لـ ${labelAr}.`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * Phone number validator rule (E.164 or GCC standard format).
 */
export const phoneRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'phone',
  validator: (val) => {
    if (!val) return null;
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    const cleaned = String(val).replace(/[\s-()]/g, '');
    if (!phoneRegex.test(cleaned)) {
      return {
        field,
        rule: 'phone',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a valid international phone number (e.g. +966501234567).`,
        messageAr: `${labelAr} يجب أن يكون رقم هاتف دولي صحيح (مثال +966501234567).`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * Minimum length rule.
 */
export const minLengthRule = (
  field: string,
  min: number,
  labelEn: string,
  labelAr: string
): ValidationRule => ({
  name: 'minLength',
  validator: (val) => {
    if (!val) return null;
    if (String(val).length < min) {
      return {
        field,
        rule: 'minLength',
        severity: 'ERROR',
        messageEn: `${labelEn} must be at least ${min} characters long.`,
        messageAr: `${labelAr} يجب أن يتكون من ${min} أحرف على الأقل.`,
        currentValue: val,
        expectedValue: min,
      };
    }
    return null;
  },
});

/**
 * Maximum length rule.
 */
export const maxLengthRule = (
  field: string,
  max: number,
  labelEn: string,
  labelAr: string
): ValidationRule => ({
  name: 'maxLength',
  validator: (val) => {
    if (!val) return null;
    if (String(val).length > max) {
      return {
        field,
        rule: 'maxLength',
        severity: 'ERROR',
        messageEn: `${labelEn} cannot exceed ${max} characters.`,
        messageAr: `${labelAr} لا يمكن أن يتجاوز ${max} حرفاً.`,
        currentValue: val,
        expectedValue: max,
      };
    }
    return null;
  },
});

/**
 * Numeric range rule (Min/Max).
 */
export const numericRangeRule = (
  field: string,
  min: number,
  max: number,
  labelEn: string,
  labelAr: string
): ValidationRule => ({
  name: 'numericRange',
  validator: (val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    if (isNaN(num) || num < min || num > max) {
      return {
        field,
        rule: 'numericRange',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a number between ${min} and ${max}.`,
        messageAr: `${labelAr} يجب أن يكون رقماً بين ${min} و ${max}.`,
        currentValue: val,
        expectedValue: { min, max },
      };
    }
    return null;
  },
});

/**
 * Regex pattern rule.
 */
export const regexRule = (
  field: string,
  pattern: RegExp,
  customMsgEn: string,
  customMsgAr: string
): ValidationRule => ({
  name: 'regex',
  validator: (val) => {
    if (!val) return null;
    if (!pattern.test(String(val))) {
      return {
        field,
        rule: 'regex',
        severity: 'ERROR',
        messageEn: customMsgEn,
        messageAr: customMsgAr,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * GCC Tax / VAT ID (ZATCA 15-digit or UAE FTA 15-digit) rule.
 */
export const taxIdRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'taxId',
  validator: (val) => {
    if (!val) return null;
    const cleaned = String(val).replace(/[\s-]/g, '');
    // 15 digits starting with 3 (KSA ZATCA) or 100 (UAE FTA)
    const vatRegex = /^\d{15}$/;
    if (!vatRegex.test(cleaned)) {
      return {
        field,
        rule: 'taxId',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a valid 15-digit GCC Tax Identification Number (TIN/VAT).`,
        messageAr: `${labelAr} يجب أن يكون رقم ضريبي صحيح مكون من 15 رقماً (TIN/VAT).`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * GCC Commercial Registration (CR) Number (10 digits).
 */
export const commercialRegistrationRule = (
  field: string,
  labelEn: string,
  labelAr: string
): ValidationRule => ({
  name: 'commercialRegistration',
  validator: (val) => {
    if (!val) return null;
    const cleaned = String(val).replace(/[\s-]/g, '');
    const crRegex = /^\d{10}$/;
    if (!crRegex.test(cleaned)) {
      return {
        field,
        rule: 'commercialRegistration',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a valid 10-digit Commercial Registration (CR) number.`,
        messageAr: `${labelAr} يجب أن يكون رقم سجل تجاري صحيح مكون من 10 أرقام.`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * URL Validator Rule.
 */
export const urlRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'url',
  validator: (val) => {
    if (!val) return null;
    try {
      new URL(String(val));
      return null;
    } catch {
      return {
        field,
        rule: 'url',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a valid web URL starting with http:// or https://.`,
        messageAr: `${labelAr} يجب أن يكون رابط ويب صحيح يبدأ بـ http:// أو https://.`,
        currentValue: val,
      };
    }
  },
});

/**
 * Date Format & Validity Rule (ISO 8601).
 */
export const dateRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'date',
  validator: (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      return {
        field,
        rule: 'date',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a valid date.`,
        messageAr: `${labelAr} يجب أن يكون تاريخاً صحيحاً.`,
        currentValue: val,
      };
    }
    return null;
  },
});
