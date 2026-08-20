/**
 * AJA INTERNATIONAL LOGISTICS — Financial & Treasury Validation Suite
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Validation Framework
 * Version: 1.0
 */

import { ValidationRule, ValidationErrorItem } from '../types/validationFramework';

/**
 * ISO 13616 IBAN Checksum Validator (Modulo 97 algorithm).
 */
export const validateIBAN = (iban: string): { isValid: boolean; errorEn?: string; errorAr?: string } => {
  if (!iban) {
    return { isValid: false, errorEn: 'IBAN is empty.', errorAr: 'رقم الآيبان فارغ.' };
  }

  const cleaned = iban.trim().toUpperCase().replace(/[\s-]/g, '');

  if (cleaned.length < 15 || cleaned.length > 34) {
    return {
      isValid: false,
      errorEn: 'IBAN must be between 15 and 34 alphanumeric characters.',
      errorAr: 'رقم IBAN يجب أن يتكون من 15 إلى 34 خانة.',
    };
  }

  // Rearrange: move first 4 characters to the end
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);

  // Replace letters with digits: A=10, B=11 ... Z=35
  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      numericString += (code - 55).toString();
    } else if (code >= 48 && code <= 57) {
      numericString += rearranged[i];
    } else {
      return {
        isValid: false,
        errorEn: 'IBAN contains invalid characters.',
        errorAr: 'رقم IBAN يحتوي على رموز غير صالحة.',
      };
    }
  }

  // Modulo 97 on large numbers using piece-by-piece division
  let remainder = 0;
  for (let i = 0; i < numericString.length; i += 7) {
    const part = remainder.toString() + numericString.substring(i, i + 7);
    remainder = parseInt(part, 10) % 97;
  }

  const isValid = remainder === 1;

  return {
    isValid,
    errorEn: isValid ? undefined : 'IBAN failed Modulo 97 checksum calculation check.',
    errorAr: isValid ? undefined : 'رقم IBAN غير صحيح وفق خوارزمية التحقق الدولية Modulo 97.',
  };
};

/**
 * IBAN Rule Wrapper
 */
export const ibanRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'iban',
  validator: (val) => {
    if (!val) return null;
    const res = validateIBAN(String(val));
    if (!res.isValid) {
      return {
        field,
        rule: 'iban',
        severity: 'ERROR',
        messageEn: `${labelEn}: ${res.errorEn}`,
        messageAr: `${labelAr}: ${res.errorAr}`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * SWIFT / BIC Code Validation (8 or 11 characters).
 */
export const swiftBicRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'swiftBic',
  validator: (val) => {
    if (!val) return null;
    const code = String(val).trim().toUpperCase();
    const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    if (!swiftRegex.test(code)) {
      return {
        field,
        rule: 'swiftBic',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a valid 8 or 11 character SWIFT/BIC code (e.g. NCBKSAJE, SABBSAJEXXX).`,
        messageAr: `${labelAr} يجب أن يكون رمز SWIFT/BIC صحيح مكون من 8 أو 11 حرفاً (مثل NCBKSAJE).`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * ISO 4217 Currency Code Validator.
 */
export const SUPPORTED_CURRENCIES = ['SAR', 'USD', 'AED', 'EUR', 'GBP', 'KWD', 'BHD', 'QAR', 'OMR', 'EGP', 'CNY'];

export const currencyCodeRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'currencyCode',
  validator: (val) => {
    if (!val) return null;
    const code = String(val).trim().toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(code)) {
      return {
        field,
        rule: 'currencyCode',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a supported 3-letter currency code (${SUPPORTED_CURRENCIES.join(', ')}).`,
        messageAr: `${labelAr} يجب أن يكون كود عملة مدعوم (${SUPPORTED_CURRENCIES.join(', ')}).`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * Cross-Field Invoice Calculation Validator.
 */
export const validateInvoiceTotalsCrossField = (invoiceData: {
  subtotal: number;
  vatAmount: number;
  discountAmount?: number;
  totalAmount: number;
}): ValidationErrorItem[] => {
  const errors: ValidationErrorItem[] = [];
  const subtotal = Number(invoiceData.subtotal) || 0;
  const vat = Number(invoiceData.vatAmount) || 0;
  const discount = Number(invoiceData.discountAmount) || 0;
  const total = Number(invoiceData.totalAmount) || 0;

  const expectedTotal = Math.round((subtotal + vat - discount) * 100) / 100;
  const actualTotal = Math.round(total * 100) / 100;

  if (Math.abs(expectedTotal - actualTotal) > 0.05) {
    errors.push({
      field: 'totalAmount',
      rule: 'invoiceTotalsMismatch',
      severity: 'ERROR',
      messageEn: `Invoice Total Mismatch. Expected ${expectedTotal} (Subtotal ${subtotal} + VAT ${vat} - Discount ${discount}), but got ${actualTotal}.`,
      messageAr: `عدم تطابق إجمالي الفاتورة. المجموع المتوقع ${expectedTotal}، بينما الإجمالي المكتوب ${actualTotal}.`,
      currentValue: total,
      expectedValue: expectedTotal,
    });
  }

  return errors;
};
