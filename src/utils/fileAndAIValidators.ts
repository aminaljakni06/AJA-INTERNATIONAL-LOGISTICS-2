/**
 * AJA INTERNATIONAL LOGISTICS — File & AI Payload Validation Suite
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Validation Framework
 * Version: 1.0
 */

import { ValidationErrorItem, FileValidationOptions } from '../types/validationFramework';

/**
 * File Upload Constraint Validator.
 */
export const validateFileObject = (
  file: File | { name: string; size: number; type: string },
  options: FileValidationOptions
): ValidationErrorItem[] => {
  const errors: ValidationErrorItem[] = [];

  const maxSizeBytes = options.maxSizeBytes || 15 * 1024 * 1024; // 15MB default
  const minSizeBytes = options.minSizeBytes || 10;

  // Size Check
  if (file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    errors.push({
      field: 'file',
      rule: 'maxFileSize',
      severity: 'ERROR',
      messageEn: `File "${file.name}" exceeds maximum allowed size of ${maxMb}MB.`,
      messageAr: `الحجم المسموح به للملف "${file.name}" هو ${maxMb} ميجابايت كحد أقصى.`,
      currentValue: file.size,
      expectedValue: maxSizeBytes,
    });
  }

  if (file.size < minSizeBytes) {
    errors.push({
      field: 'file',
      rule: 'minFileSize',
      severity: 'ERROR',
      messageEn: `File "${file.name}" is corrupted or empty (0 bytes).`,
      messageAr: `الملف "${file.name}" فارغ أو تالف.`,
      currentValue: file.size,
    });
  }

  // Extension Check
  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const normalizedAllowed = options.allowedExtensions.map((e) => e.toLowerCase().replace('.', ''));
    if (!normalizedAllowed.includes(ext)) {
      errors.push({
        field: 'file',
        rule: 'allowedFileExtension',
        severity: 'ERROR',
        messageEn: `File extension ".${ext}" is not permitted. Allowed extensions: ${normalizedAllowed.join(', ')}.`,
        messageAr: `امتداد الملف ".${ext}" غير مسموح به. الامتدادات المسموحة: ${normalizedAllowed.join(', ')}.`,
        currentValue: ext,
      });
    }
  }

  // MIME Type Check
  if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
    if (!options.allowedMimeTypes.includes(file.type)) {
      errors.push({
        field: 'file',
        rule: 'allowedMimeType',
        severity: 'ERROR',
        messageEn: `File format "${file.type}" is unsupported.`,
        messageAr: `صيغة الملف "${file.type}" غير مدعومة.`,
        currentValue: file.type,
      });
    }
  }

  return errors;
};

/**
 * AI Prompt & Response Payload Validator.
 */
export const validateAIPayload = (prompt: string, maxTokens: number = 4000): ValidationErrorItem[] => {
  const errors: ValidationErrorItem[] = [];

  if (!prompt || prompt.trim() === '') {
    errors.push({
      field: 'prompt',
      rule: 'requiredPrompt',
      severity: 'ERROR',
      messageEn: 'AI prompt string cannot be empty.',
      messageAr: 'نص استعلام الذكاء الاصطناعي لا يمكن أن يكون فارغاً.',
    });
    return errors;
  }

  // Approximate token length (4 chars per token average)
  const approxTokens = Math.ceil(prompt.length / 4);
  if (approxTokens > maxTokens) {
    errors.push({
      field: 'prompt',
      rule: 'tokenLimitExceeded',
      severity: 'ERROR',
      messageEn: `AI prompt length (~${approxTokens} tokens) exceeds context limit of ${maxTokens} tokens.`,
      messageAr: `طول النص المرسل للذكاء الاصطناعي يتجاوز حد السياق المسموح به (${maxTokens} رمز).`,
      currentValue: approxTokens,
      expectedValue: maxTokens,
    });
  }

  return errors;
};
