/**
 * AJA INTERNATIONAL LOGISTICS — Server-Authoritative Import Schema Resolver
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Schema Mapping & Validation Engine (STEP 05.18.08)
 * Version: 1.0
 */

import { ImportSchema, ImportColumnDefinition } from '../../types/dataTransferFramework';
import { getResourceAllowlistSchema } from './fieldAllowlist';
import { ImportParserError } from './importParsers/importParserInterface';

/**
 * System Internal Fields strictly prohibited from being mapped or imported via client files
 */
export const PROHIBITED_INTERNAL_FIELDS = new Set([
  'tenantid',
  'companyid',
  'branchid',
  'password',
  'passwordhash',
  'permissions',
  'userpermissions',
  'role',
  'createdat',
  'updatedat',
  'deletedat',
  'createdby',
  'updatedby',
  'internalmetadata',
  'systemmetadata',
  'authtoken',
  'apikey',
]);

/**
 * Allowed initial importable resources
 */
const KNOWN_IMPORT_RESOURCES = new Set(['shipments', 'customers', 'quotes']);

/**
 * Resolve server-authoritative ImportSchema for a target resource
 */
export function resolveImportSchema(resource: string): ImportSchema {
  if (!resource) {
    throw new ImportParserError(
      'UNAUTHORIZED_RESOURCE',
      'Resource identifier is required for import schema resolution.',
      'معرف المورد مطلوب لتحديد مخطط الاستيراد.'
    );
  }

  const normalizedResource = resource.toLowerCase().trim();

  if (!KNOWN_IMPORT_RESOURCES.has(normalizedResource)) {
    throw new ImportParserError(
      'UNAUTHORIZED_RESOURCE',
      `Unknown or unsupported resource "${resource}" for import operations.`,
      `المورد "${resource}" غير معروف أو غير مدعوم لعمليات الاستيراد.`
    );
  }

  const allowlistSchema = getResourceAllowlistSchema(normalizedResource);

  const columns: ImportColumnDefinition[] = [];
  const requiredFields: string[] = [];
  const optionalFields: string[] = [];

  for (const entry of allowlistSchema.allowedFields) {
    const isProhibited = PROHIBITED_INTERNAL_FIELDS.has(entry.key.toLowerCase());
    if (isProhibited) continue;

    const isRequired = !!entry.isRequiredForImport;

    let allowedEnumValues: string[] | undefined = undefined;
    let referenceResource: string | undefined = undefined;

    if (entry.type === 'enum') {
      if (normalizedResource === 'shipments' && entry.key === 'currentStatus') {
        allowedEnumValues = ['BOOKED', 'RECEIVED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'CANCELLED'];
      } else if (normalizedResource === 'customers' && entry.key === 'accountStatus') {
        allowedEnumValues = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
      } else if (normalizedResource === 'quotes' && entry.key === 'status') {
        allowedEnumValues = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'];
      }
    }

    if (normalizedResource === 'shipments' && entry.key === 'carrierPartner') {
      referenceResource = 'carriers';
    } else if (normalizedResource === 'quotes' && entry.key === 'customerName') {
      referenceResource = 'customers';
    }

    // Default aliases
    const aliases: string[] = [entry.labelEn, entry.labelAr, entry.key];
    if (entry.key === 'trackingNumber') {
      aliases.push('Tracking Number', 'Tracking #', 'TrackingNo', 'رقم التتبع', 'رقم الشحنة');
    } else if (entry.key === 'companyName') {
      aliases.push('Company Name', 'Company', 'اسم الشركة', 'اسم المؤسسة');
    } else if (entry.key === 'email') {
      aliases.push('Email Address', 'Email', 'البريد الإلكتروني', 'البريد');
    } else if (entry.key === 'quoteNumber') {
      aliases.push('Quote Number', 'Quote #', 'رقم عرض السعر', 'رقم العرض');
    } else if (entry.key === 'originCity') {
      aliases.push('Origin City', 'Origin', 'مدينة المبدأ', 'مدينة المصدر');
    } else if (entry.key === 'destinationCity') {
      aliases.push('Destination City', 'Destination', 'مدينة الوصول', 'مدينة الوجهة');
    } else if (entry.key === 'weightKg') {
      aliases.push('Weight', 'Weight (kg)', 'الوزن', 'الوزن كجم');
    } else if (entry.key === 'declaredValueSar') {
      aliases.push('Declared Value', 'Declared Value (SAR)', 'القيمة المصرحة', 'القيمة المصرح بها');
    } else if (entry.key === 'currentStatus' || entry.key === 'status' || entry.key === 'accountStatus') {
      aliases.push('Status', 'الحالة');
    }

    const colDef: ImportColumnDefinition = {
      field: entry.key,
      labelEn: entry.labelEn,
      labelAr: entry.labelAr,
      required: isRequired,
      type: entry.type,
      aliases: Array.from(new Set(aliases)),
      allowImport: !isProhibited,
      requiredPermission: entry.requiredPermission,
      duplicateKeyParticipation: allowlistSchema.uniqueLookupKeys.includes(entry.key),
      allowedEnumValues,
      referenceResource,
    };

    columns.push(colDef);

    if (colDef.allowImport) {
      if (colDef.required) {
        requiredFields.push(colDef.field);
      } else {
        optionalFields.push(colDef.field);
      }
    }
  }

  return {
    resource: normalizedResource,
    templateVersion: '1.0',
    columns,
    requiredFields,
    optionalFields,
    primaryKey: allowlistSchema.primaryKey,
    uniqueLookupKeys: allowlistSchema.uniqueLookupKeys,
  };
}
