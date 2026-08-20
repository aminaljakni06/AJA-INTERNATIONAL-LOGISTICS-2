/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Validation Framework Types
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Validation Framework
 * Version: 1.0
 */

export type ValidationSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface ValidationErrorItem {
  field: string;
  rule: string;
  messageEn: string;
  messageAr: string;
  severity: ValidationSeverity;
  currentValue?: any;
  expectedValue?: any;
  meta?: Record<string, any>;
}

export interface ValidationResult<T = any> {
  isValid: boolean;
  hasWarnings: boolean;
  errors: ValidationErrorItem[];
  warnings: ValidationErrorItem[];
  sanitizedValue?: T;
  executionTimeMs?: number;
}

export type ValidatorFunction<T = any> = (
  value: T,
  context?: ValidationContext
) => ValidationErrorItem | ValidationErrorItem[] | null | Promise<ValidationErrorItem | ValidationErrorItem[] | null>;

export interface ValidationRule<T = any> {
  name: string;
  validator: ValidatorFunction<T>;
  severity?: ValidationSeverity;
  messageEn?: string;
  messageAr?: string;
}

export interface FieldValidationSchema {
  field: string;
  labelEn: string;
  labelAr: string;
  rules: ValidationRule[];
  sanitize?: boolean;
}

export interface ObjectValidationSchema<T = any> {
  schemaName: string;
  fields: Record<keyof T | string, FieldValidationSchema>;
  crossFieldValidators?: ((data: T, context?: ValidationContext) => ValidationErrorItem[] | Promise<ValidationErrorItem[]>)[];
}

export interface ValidationContext {
  isAr?: boolean;
  userRole?: string;
  companyId?: string;
  branchId?: string;
  locale?: 'en' | 'ar';
  strictMode?: boolean;
  customData?: Record<string, any>;
}

export interface ContainerCheckResult {
  isValid: boolean;
  ownerCode?: string;
  categoryIdentifier?: string;
  serialNumber?: string;
  checkDigit?: number;
  calculatedCheckDigit?: number;
  errorEn?: string;
  errorAr?: string;
}

export interface AWBCheckResult {
  isValid: boolean;
  prefix?: string;
  serialNumber?: string;
  checkDigit?: number;
  calculatedCheckDigit?: number;
  errorEn?: string;
  errorAr?: string;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  minSizeBytes?: number;
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
  maxWidthPx?: number;
  maxHeightPx?: number;
}
