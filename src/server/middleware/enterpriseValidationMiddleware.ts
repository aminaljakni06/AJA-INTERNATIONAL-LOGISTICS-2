/**
 * AJA INTERNATIONAL LOGISTICS — Express API Request Validation Middleware
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Validation Framework
 * Version: 1.0
 */

import { Request, Response, NextFunction } from 'express';
import { ObjectValidationSchema } from '../../types/validationFramework';
import { validateObject } from '../../utils/validationEngine';

/**
 * Validates Express req.body against an ObjectValidationSchema.
 */
export function validateRequestBody<T = any>(schema: ObjectValidationSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isAr = req.headers['accept-language']?.includes('ar') || false;
      const result = await validateObject(schema, req.body, { isAr });

      if (!result.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation Failed. Please review the submitted payload errors.',
          errorAr: 'فشل الفحص والتحقق. يرجى مراجعة الأخطاء المحددة بالطلب.',
          code: 'VALIDATION_FAILED',
          errors: result.errors.map((e) => ({
            field: e.field,
            rule: e.rule,
            messageEn: e.messageEn,
            messageAr: e.messageAr,
            severity: e.severity,
          })),
          executionTimeMs: result.executionTimeMs,
        });
        return;
      }

      // Replace req.body with sanitized clean payload
      req.body = result.sanitizedValue;
      next();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: `Server validation internal failure: ${err.message}`,
        code: 'VALIDATION_INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Validates Express req.query parameters.
 */
export function validateQueryParams<T = any>(schema: ObjectValidationSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isAr = req.headers['accept-language']?.includes('ar') || false;
      const result = await validateObject(schema, req.query as unknown as T, { isAr });

      if (!result.isValid) {
        res.status(400).json({
          success: false,
          error: 'Query parameter validation failed.',
          errorAr: 'فشل الفحص لوسائط الاستعلام.',
          code: 'QUERY_VALIDATION_FAILED',
          errors: result.errors,
        });
        return;
      }

      req.query = result.sanitizedValue as any;
      next();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: `Query validation internal failure: ${err.message}`,
        code: 'VALIDATION_INTERNAL_ERROR',
      });
    }
  };
}
