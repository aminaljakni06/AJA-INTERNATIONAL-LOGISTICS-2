/**
 * AJA INTERNATIONAL LOGISTICS — Supply Chain & Logistics Validation Suite
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Validation Framework
 * Version: 1.0
 */

import { ValidationRule, ContainerCheckResult, AWBCheckResult } from '../types/validationFramework';

/**
 * ISO 6346 Freight Container Number Validation (with Modulo 11 Check Digit Algorithm).
 */
export const validateISOContainerNumber = (containerNo: string): ContainerCheckResult => {
  if (!containerNo) {
    return { isValid: false, errorEn: 'Container number is empty.', errorAr: 'رقم الحاوية فارغ.' };
  }

  const cleaned = containerNo.trim().toUpperCase().replace(/[\s-]/g, '');

  if (cleaned.length !== 11) {
    return {
      isValid: false,
      errorEn: 'ISO Container number must be exactly 11 characters (e.g. MSKU1234567).',
      errorAr: 'رقم الحاوية القياسي ISO يجب أن يتكون من 11 حرفاً (مثال MSKU1234567).',
    };
  }

  const ownerCode = cleaned.substring(0, 3);
  const categoryId = cleaned.substring(3, 4); // U, J, Z
  const serialNumber = cleaned.substring(4, 10);
  const checkDigit = parseInt(cleaned.substring(10, 11), 10);

  if (!/^[A-Z]{4}$/.test(cleaned.substring(0, 4))) {
    return {
      isValid: false,
      errorEn: 'Container owner code & category must be 4 uppercase letters.',
      errorAr: 'رمز مالك الحاوية والفئة يجب أن يتكون من 4 أحرف كبيرة.',
    };
  }

  if (!/^\d{6}$/.test(serialNumber)) {
    return {
      isValid: false,
      errorEn: 'Container serial number must be 6 digits.',
      errorAr: 'الرقم التسلسلي للحاوية يجب أن يتكون من 6 أرقام.',
    };
  }

  // ISO 6346 Modulo 11 Check Digit calculation
  const charValues: Record<string, number> = {
    A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20,
    K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31,
    U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
  };

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const char = cleaned[i];
    let val: number;
    if (/[A-Z]/.test(char)) {
      val = charValues[char];
    } else {
      val = parseInt(char, 10);
    }
    const weight = Math.pow(2, i);
    sum += val * weight;
  }

  let calculatedCheckDigit = sum % 11;
  if (calculatedCheckDigit === 10) calculatedCheckDigit = 0;

  const isValid = checkDigit === calculatedCheckDigit;

  return {
    isValid,
    ownerCode,
    categoryIdentifier: categoryId,
    serialNumber,
    checkDigit,
    calculatedCheckDigit,
    errorEn: isValid ? undefined : `Container check digit mismatch. Expected ${calculatedCheckDigit}, got ${checkDigit}.`,
    errorAr: isValid ? undefined : `عدم تطابق رقم التحقق للحاوية. المتوقع ${calculatedCheckDigit} والمكتوب ${checkDigit}.`,
  };
};

/**
 * ISO Container Rule Wrapper
 */
export const isoContainerRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'isoContainer',
  validator: (val) => {
    if (!val) return null;
    const res = validateISOContainerNumber(String(val));
    if (!res.isValid) {
      return {
        field,
        rule: 'isoContainer',
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
 * Air Waybill (AWB) 11-digit Validation (with Modulo 7 check).
 */
export const validateAirWaybill = (awbNo: string): AWBCheckResult => {
  if (!awbNo) {
    return { isValid: false, errorEn: 'AWB number is empty.', errorAr: 'رقم بوليصة الشحن الجوي فارغ.' };
  }

  const cleaned = awbNo.trim().replace(/[\s-]/g, '');

  if (cleaned.length !== 11 || !/^\d{11}$/.test(cleaned)) {
    return {
      isValid: false,
      errorEn: 'Air Waybill (AWB) must be 11 digits (3-digit airline prefix + 8-digit serial e.g. 057-12345675).',
      errorAr: 'بوليصة الشحن الجوي يجب أن تتكون من 11 رقماً (3 بادئة الطيران + 8 الرقم التسلسلي).',
    };
  }

  const prefix = cleaned.substring(0, 3);
  const serial7 = cleaned.substring(3, 10);
  const checkDigit = parseInt(cleaned.substring(10, 11), 10);

  const calculatedCheckDigit = parseInt(serial7, 10) % 7;
  const isValid = checkDigit === calculatedCheckDigit;

  return {
    isValid,
    prefix,
    serialNumber: serial7,
    checkDigit,
    calculatedCheckDigit,
    errorEn: isValid ? undefined : `AWB Modulo 7 check digit mismatch. Expected ${calculatedCheckDigit}, got ${checkDigit}.`,
    errorAr: isValid ? undefined : `عدم تطابق رقم التحقق Modulo 7 لبوليصة الشحن الجوي. المتوقع ${calculatedCheckDigit}.`,
  };
};

/**
 * Air Waybill Rule Wrapper
 */
export const airWaybillRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'airWaybill',
  validator: (val) => {
    if (!val) return null;
    const res = validateAirWaybill(String(val));
    if (!res.isValid) {
      return {
        field,
        rule: 'airWaybill',
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
 * Harmonized System (HS Code) Validator (6 to 10 digits).
 */
export const hsCodeRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'hsCode',
  validator: (val) => {
    if (!val) return null;
    const cleaned = String(val).replace(/[\s.]/g, '');
    if (!/^\d{6,10}$/.test(cleaned)) {
      return {
        field,
        rule: 'hsCode',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a valid 6-to-10 digit Customs HS Commodity Code.`,
        messageAr: `${labelAr} يجب أن يكون رمز النظام المنسق الجمركي (HS Code) مكوناً من 6 إلى 10 أرقام.`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * Incoterms 2020 Standard Rule.
 */
export const INCOTERMS_2020 = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];

export const incotermRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'incoterm',
  validator: (val) => {
    if (!val) return null;
    const code = String(val).trim().toUpperCase();
    if (!INCOTERMS_2020.includes(code)) {
      return {
        field,
        rule: 'incoterm',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a standard Incoterms 2020 code (${INCOTERMS_2020.join(', ')}).`,
        messageAr: `${labelAr} يجب أن يكون أحد رموز قواعد الإنكوتيرمز 2020 المعتمدة (${INCOTERMS_2020.join(', ')}).`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * IATA Airport Code (3 uppercase letters).
 */
export const iataAirportRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'iataAirport',
  validator: (val) => {
    if (!val) return null;
    const code = String(val).trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      return {
        field,
        rule: 'iataAirport',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a 3-letter IATA Airport Code (e.g. RUH, JED, DXB, LHR).`,
        messageAr: `${labelAr} يجب أن يكون رمز مطار إياتا مكوناً من 3 أحرف (مثل RUH, JED, DXB).`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * UN/LOCODE Sea Port Code (5 alphanumeric e.g. SAJED, AEDXB).
 */
export const unLocodeRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'unLocode',
  validator: (val) => {
    if (!val) return null;
    const code = String(val).trim().toUpperCase().replace(/[\s-]/g, '');
    if (!/^[A-Z]{2}[A-Z0-9]{3}$/.test(code)) {
      return {
        field,
        rule: 'unLocode',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a 5-character UN/LOCODE port identifier (e.g. SAJED, AEDXB).`,
        messageAr: `${labelAr} يجب أن يكون معرف ميناء UN/LOCODE مكوناً من 5 خانات (مثل SAJED, AEDXB).`,
        currentValue: val,
      };
    }
    return null;
  },
});

/**
 * IMO Dangerous Goods (DG) Class Validator (1.1 through 9).
 */
export const IMO_DG_CLASSES = [
  '1.1', '1.2', '1.3', '1.4', '1.5', '1.6',
  '2.1', '2.2', '2.3',
  '3', '4.1', '4.2', '4.3', '5.1', '5.2',
  '6.1', '6.2', '7', '8', '9'
];

export const imoDangerousGoodsRule = (field: string, labelEn: string, labelAr: string): ValidationRule => ({
  name: 'imoDangerousGoods',
  validator: (val) => {
    if (!val) return null;
    const str = String(val).trim();
    if (!IMO_DG_CLASSES.includes(str)) {
      return {
        field,
        rule: 'imoDangerousGoods',
        severity: 'ERROR',
        messageEn: `${labelEn} must be a valid IMO Hazardous Goods Class (e.g. 3 for Flammable Liquids, 8 for Corrosives).`,
        messageAr: `${labelAr} يجب أن تكون فئة مواد خطرة معتمدة حسب المنظمة البحرية الدولية IMO.`,
        currentValue: val,
      };
    }
    return null;
  },
});
