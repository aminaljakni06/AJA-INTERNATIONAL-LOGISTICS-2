/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Validation Pipeline Engine
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Validation Framework
 * Version: 1.0
 */

import {
  ObjectValidationSchema,
  FieldValidationSchema,
  ValidationResult,
  ValidationErrorItem,
  ValidationContext,
} from '../types/validationFramework';
import { sanitizePayload } from './validationSanitizer';

/**
 * Validates a single input field against a set of rules in a FieldValidationSchema.
 */
export const validateField = async (
  schema: FieldValidationSchema,
  value: any,
  context?: ValidationContext
): Promise<ValidationErrorItem[]> => {
  const errors: ValidationErrorItem[] = [];

  // Sanitize value if requested
  const sanitizedVal = schema.sanitize && typeof value === 'string' ? value.trim() : value;

  for (const rule of schema.rules) {
    try {
      const res = await rule.validator(sanitizedVal, context);
      if (res) {
        if (Array.isArray(res)) {
          errors.push(...res);
        } else {
          errors.push(res);
        }
      }
    } catch (err: any) {
      errors.push({
        field: schema.field,
        rule: rule.name || 'exception',
        severity: 'CRITICAL',
        messageEn: `Validation rule exception: ${err.message || 'Unknown error'}`,
        messageAr: `حدث خطأ غير متوقع أثناء الفحص: ${err.message || 'خطأ غير معروف'}`,
        currentValue: value,
      });
    }
  }

  return errors;
};

/**
 * Validates an entire Object Payload against an ObjectValidationSchema.
 * Runs input sanitization, field-level validators, and cross-field rules.
 */
export const validateObject = async <T = any>(
  schema: ObjectValidationSchema<T>,
  data: T,
  context?: ValidationContext
): Promise<ValidationResult<T>> => {
  const startTime = performance.now();
  const allErrors: ValidationErrorItem[] = [];
  const allWarnings: ValidationErrorItem[] = [];

  // Step 1: Input Payload Deep Sanitization
  const sanitizedData = sanitizePayload(data);

  // Step 2: Field Level Validation Pipeline
  if (schema.fields) {
    for (const [fieldName, fieldSchema] of Object.entries(schema.fields)) {
      const fieldValue = (sanitizedData as any)?.[fieldName];
      const fieldErrors = await validateField(fieldSchema as FieldValidationSchema, fieldValue, context);

      fieldErrors.forEach((err) => {
        if (err.severity === 'WARNING' || err.severity === 'INFO') {
          allWarnings.push(err);
        } else {
          allErrors.push(err);
        }
      });
    }
  }

  // Step 3: Cross-Field Business Rules Validation Pipeline
  if (schema.crossFieldValidators && schema.crossFieldValidators.length > 0) {
    for (const crossValidator of schema.crossFieldValidators) {
      try {
        const crossErrors = await crossValidator(sanitizedData, context);
        if (crossErrors && crossErrors.length > 0) {
          crossErrors.forEach((err) => {
            if (err.severity === 'WARNING' || err.severity === 'INFO') {
              allWarnings.push(err);
            } else {
              allErrors.push(err);
            }
          });
        }
      } catch (err: any) {
        allErrors.push({
          field: '_object',
          rule: 'crossFieldException',
          severity: 'CRITICAL',
          messageEn: `Cross-field rule exception: ${err.message || 'Error'}`,
          messageAr: `حدث خطأ أثناء فحص القواعد المتقاطعة: ${err.message || 'خطأ'}`,
        });
      }
    }
  }

  const endTime = performance.now();

  return {
    isValid: allErrors.length === 0,
    hasWarnings: allWarnings.length > 0,
    errors: allErrors,
    warnings: allWarnings,
    sanitizedValue: sanitizedData,
    executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
  };
};

/**
 * Helper to extract error message by field name for UI forms.
 */
export const getFieldError = (
  errors: ValidationErrorItem[],
  field: string,
  isAr: boolean = false
): string | undefined => {
  const item = errors.find((e) => e.field === field);
  if (!item) return undefined;
  return isAr ? item.messageAr : item.messageEn;
};
