/**
 * AJA INTERNATIONAL LOGISTICS — Field Allow-List & Formula Injection Protection
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Data Export & Import (STEP 05.18)
 * Version: 1.0
 */

import { ResourceAllowlistSchema, FieldAllowlistEntry } from '../../types/dataExchangeFramework';

// Default Resource Field Allow-Lists
const resourceAllowlistMap = new Map<string, ResourceAllowlistSchema>();

// Register Shipments Allow-List
resourceAllowlistMap.set('shipments', {
  resource: 'shipments',
  primaryKey: 'id',
  uniqueLookupKeys: ['trackingNumber', 'referenceNumber'],
  allowedFields: [
    { key: 'id', labelEn: 'Shipment ID', labelAr: 'معرف الشحنة', type: 'string', isDefault: true, isRequiredForImport: false },
    { key: 'trackingNumber', labelEn: 'Tracking Number', labelAr: 'رقم التتبع', type: 'string', isDefault: true, isRequiredForImport: true },
    { key: 'originCity', labelEn: 'Origin City', labelAr: 'مدينة المبدأ', type: 'string', isDefault: true },
    { key: 'destinationCity', labelEn: 'Destination City', labelAr: 'مدينة الوصول', type: 'string', isDefault: true },
    { key: 'currentStatus', labelEn: 'Status', labelAr: 'الحالة', type: 'enum', isDefault: true, isRequiredForImport: true },
    { key: 'carrierPartner', labelEn: 'Carrier Partner', labelAr: 'الناقل اللوجستي', type: 'string', isDefault: true },
    { key: 'senderName', labelEn: 'Sender Name', labelAr: 'اسم المرسل', type: 'string', isDefault: true },
    { key: 'recipientName', labelEn: 'Recipient Name', labelAr: 'اسم المستلم', type: 'string', isDefault: true },
    { key: 'recipientPhone', labelEn: 'Recipient Phone', labelAr: 'هاتف المستلم', type: 'string', isDefault: false },
    { key: 'weightKg', labelEn: 'Weight (kg)', labelAr: 'الوزن (كجم)', type: 'number', isDefault: true },
    { key: 'declaredValueSar', labelEn: 'Declared Value (SAR)', labelAr: 'القيمة المصرحة (ريال)', type: 'number', isDefault: true },
    { key: 'estimatedDeliveryDate', labelEn: 'Est. Delivery Date', labelAr: 'تاريخ التسليم المتوقع', type: 'date', isDefault: true },
    { key: 'serviceType', labelEn: 'Service Type', labelAr: 'نوع الخدمة', type: 'string', isDefault: true },
    { key: 'createdAt', labelEn: 'Created At', labelAr: 'تاريخ الإنشاء', type: 'date', isDefault: false },
  ],
});

// Register Customers Allow-List
resourceAllowlistMap.set('customers', {
  resource: 'customers',
  primaryKey: 'id',
  uniqueLookupKeys: ['email', 'vatNumber', 'commercialRegistration'],
  allowedFields: [
    { key: 'id', labelEn: 'Customer ID', labelAr: 'معرف العميل', type: 'string', isDefault: true, isRequiredForImport: false },
    { key: 'companyName', labelEn: 'Company Name', labelAr: 'اسم الشركة', type: 'string', isDefault: true, isRequiredForImport: true },
    { key: 'contactPerson', labelEn: 'Contact Person', labelAr: 'الشخص المسؤول', type: 'string', isDefault: true },
    { key: 'email', labelEn: 'Email Address', labelAr: 'البريد الإلكتروني', type: 'string', isDefault: true, isRequiredForImport: true },
    { key: 'phone', labelEn: 'Phone Number', labelAr: 'رقم الهاتف', type: 'string', isDefault: true },
    { key: 'vatNumber', labelEn: 'VAT Number', labelAr: 'الرقم الضريبي', type: 'string', isDefault: true },
    { key: 'accountStatus', labelEn: 'Account Status', labelAr: 'حالة الحساب', type: 'enum', isDefault: true },
    { key: 'city', labelEn: 'City', labelAr: 'المدينة', type: 'string', isDefault: true },
    { key: 'creditLimitSar', labelEn: 'Credit Limit (SAR)', labelAr: 'الحد الائتماني (ريال)', type: 'number', isDefault: true },
  ],
});

// Register Quotes Allow-List
resourceAllowlistMap.set('quotes', {
  resource: 'quotes',
  primaryKey: 'id',
  uniqueLookupKeys: ['quoteNumber'],
  allowedFields: [
    { key: 'id', labelEn: 'Quote ID', labelAr: 'معرف العرض', type: 'string', isDefault: true, isRequiredForImport: false },
    { key: 'quoteNumber', labelEn: 'Quote Number', labelAr: 'رقم عرض السعر', type: 'string', isDefault: true, isRequiredForImport: true },
    { key: 'customerName', labelEn: 'Customer Name', labelAr: 'اسم العميل', type: 'string', isDefault: true },
    { key: 'originPort', labelEn: 'Origin Port', labelAr: 'ميناء المبدأ', type: 'string', isDefault: true },
    { key: 'destinationPort', labelEn: 'Destination Port', labelAr: 'ميناء الوصول', type: 'string', isDefault: true },
    { key: 'quotedAmountSar', labelEn: 'Quoted Amount (SAR)', labelAr: 'المبلغ المعروض (ريال)', type: 'number', isDefault: true },
    { key: 'status', labelEn: 'Status', labelAr: 'الحالة', type: 'enum', isDefault: true },
    { key: 'validUntil', labelEn: 'Valid Until', labelAr: 'صالح حتى', type: 'date', isDefault: true },
  ],
});

/**
 * Get field allow-list schema for a resource
 */
export function getResourceAllowlistSchema(resource: string): ResourceAllowlistSchema {
  const schema = resourceAllowlistMap.get(resource);
  if (schema) return schema;

  // Generic fallback schema
  return {
    resource,
    primaryKey: 'id',
    uniqueLookupKeys: ['id', 'code'],
    allowedFields: [
      { key: 'id', labelEn: 'ID', labelAr: 'المعرف', type: 'string', isDefault: true, isRequiredForImport: true },
      { key: 'name', labelEn: 'Name', labelAr: 'الاسم', type: 'string', isDefault: true, isRequiredForImport: true },
      { key: 'code', labelEn: 'Code', labelAr: 'الرمز', type: 'string', isDefault: true },
      { key: 'status', labelEn: 'Status', labelAr: 'الحالة', type: 'enum', isDefault: true },
      { key: 'createdAt', labelEn: 'Created At', labelAr: 'تاريخ الإنشاء', type: 'date', isDefault: true },
    ],
  };
}

/**
 * CSV Formula Injection Sanitizer
 * Prepend single quote `'` if value starts with dangerous execution characters: =, +, -, @, \t, \r
 */
export function sanitizeCSVValue(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);

  // Check for leading dangerous characters (=, +, -, @, tab, carriage return)
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }

  return str;
}

/**
 * XLSX Formula Injection Sanitizer & Policy Integration Point (STEP 05.18.05 Requirement)
 * Ensures user-controlled string values starting with formula tokens (=, +, -, @, \t, \r)
 * are stored as raw text literals or prepended with a single quote (') to prevent executable cell calculations.
 */
export function sanitizeXLSXValue(val: any): { value: any; type: 'string' | 'number' | 'boolean' | 'date' } {
  if (val === null || val === undefined) {
    return { value: '', type: 'string' };
  }

  if (typeof val === 'number') {
    return { value: val, type: 'number' };
  }

  if (typeof val === 'boolean') {
    return { value: val, type: 'boolean' };
  }

  if (val instanceof Date) {
    return { value: val.toISOString(), type: 'date' };
  }

  const str = String(val);
  // Protect leading formula characters
  if (/^[=+\-@\t\r]/.test(str)) {
    return { value: `'${str}`, type: 'string' };
  }

  return { value: str, type: 'string' };
}

/**
 * Filter record properties against allowed field keys
 */
export function filterRecordByAllowlist(
  record: Record<string, any>,
  allowedFields: FieldAllowlistEntry[],
  selectedFieldKeys?: string[]
): Record<string, any> {
  const activeKeys = selectedFieldKeys && selectedFieldKeys.length > 0
    ? selectedFieldKeys
    : allowedFields.map((f) => f.key);

  const filtered: Record<string, any> = {};

  activeKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      filtered[key] = record[key];
    } else {
      filtered[key] = '';
    }
  });

  return filtered;
}
