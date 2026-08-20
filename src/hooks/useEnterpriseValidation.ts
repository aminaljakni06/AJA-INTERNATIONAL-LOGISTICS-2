/**
 * AJA INTERNATIONAL LOGISTICS — React Enterprise Validation Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Validation Framework
 * Version: 1.0
 */

import { useState, useCallback } from 'react';
import {
  ObjectValidationSchema,
  ValidationErrorItem,
  ValidationResult,
  ValidationContext,
} from '../types/validationFramework';
import { validateObject, validateField, getFieldError } from '../utils/validationEngine';

export interface UseEnterpriseValidationOptions<T = any> {
  schema: ObjectValidationSchema<T>;
  isAr?: boolean;
  context?: ValidationContext;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export function useEnterpriseValidation<T = any>({
  schema,
  isAr = false,
  context,
}: UseEnterpriseValidationOptions<T>) {
  const [errors, setErrors] = useState<ValidationErrorItem[]>([]);
  const [warnings, setWarnings] = useState<ValidationErrorItem[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  /**
   * Validate entire form data object
   */
  const validateForm = useCallback(
    async (formData: T): Promise<ValidationResult<T>> => {
      setIsValidating(true);
      const result = await validateObject(schema, formData, { isAr, ...context });
      setErrors(result.errors);
      setWarnings(result.warnings);
      setIsValidating(false);
      return result;
    },
    [schema, isAr, context]
  );

  /**
   * Validate a single form field
   */
  const validateSingleField = useCallback(
    async (fieldName: keyof T | string, value: any): Promise<ValidationErrorItem[]> => {
      const fieldSchema = schema.fields[fieldName as string];
      if (!fieldSchema) return [];

      const fieldErrors = await validateField(fieldSchema, value, { isAr, ...context });

      setErrors((prev) => {
        // Remove previous errors for this specific field and add new ones
        const filtered = prev.filter((e) => e.field !== fieldName);
        return [...filtered, ...fieldErrors];
      });

      setTouchedFields((prev) => ({ ...prev, [fieldName as string]: true }));
      return fieldErrors;
    },
    [schema, isAr, context]
  );

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((fieldName: keyof T | string) => {
    setErrors((prev) => prev.filter((e) => e.field !== fieldName));
  }, []);

  /**
   * Clear all errors and warnings
   */
  const resetValidation = useCallback(() => {
    setErrors([]);
    setWarnings([]);
    setTouchedFields({});
  }, []);

  /**
   * Helper to retrieve error message for a field
   */
  const getErrorMessage = useCallback(
    (fieldName: keyof T | string): string | undefined => {
      return getFieldError(errors, fieldName as string, isAr);
    },
    [errors, isAr]
  );

  /**
   * Check if a field has an active error
   */
  const hasFieldError = useCallback(
    (fieldName: keyof T | string): boolean => {
      return errors.some((e) => e.field === fieldName);
    },
    [errors]
  );

  return {
    errors,
    warnings,
    isValid: errors.length === 0,
    isValidating,
    touchedFields,
    validateForm,
    validateSingleField,
    clearFieldError,
    resetValidation,
    getErrorMessage,
    hasFieldError,
  };
}
