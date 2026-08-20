/**
 * AJA INTERNATIONAL LOGISTICS — Express Centralized Error Handling Middleware
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Error Handling Framework
 * Version: 1.0
 */

import { Request, Response, NextFunction } from 'express';
import {
  EnterpriseAppError,
  EnterpriseValidationError,
  ErrorCategory,
  ErrorSeverity,
} from '../../types/errors';
import { EnterpriseErrorCode } from '../../types/apiResponse';
import { buildErrorResponse } from '../utils/apiResponseBuilder';
import { EnterpriseErrorLogger } from '../utils/errorHandler';

/**
 * Express error-handling middleware (4 parameters required by Express syntax)
 */
export function expressErrorMiddleware(
  err: Error | EnterpriseAppError | any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // 1. Log error through enterprise logger
  const logEntry = EnterpriseErrorLogger.log(err, req);

  const reqId = req.requestId || (req.headers['x-request-id'] as string) || 'req_unknown';
  const isProduction = process.env.NODE_ENV === 'production';

  // 2. Handle Known Enterprise App Error
  if (err instanceof EnterpriseAppError) {
    const responsePayload = buildErrorResponse(
      err.code,
      err.messageEn,
      err.messageAr,
      err.details,
      isProduction ? undefined : err.stack,
      {
        requestId: reqId,
        executionTimeMs: req.startTime ? Date.now() - req.startTime : undefined,
        locale: req.headers['accept-language']?.includes('ar') ? 'ar' : 'en',
      }
    );

    return res.status(err.httpStatusCode).json(responsePayload);
  }

  // 3. Handle Express JSON Body Parsing Errors (e.g. malformed JSON in POST)
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    const responsePayload = buildErrorResponse(
      EnterpriseErrorCode.VALIDATION_FAILED,
      'Malformed JSON payload in request body',
      'نسق غير صالح لبيانات طلب JSON',
      { error: 'SyntaxError: Invalid JSON' },
      isProduction ? undefined : err.stack,
      { requestId: reqId }
    );
    return res.status(400).json(responsePayload);
  }

  // 4. Handle Default / Unhandled System Exceptions
  const defaultCode = EnterpriseErrorCode.INTERNAL_SERVER_ERROR;
  const defaultMsgEn = isProduction
    ? 'An unexpected internal server error occurred'
    : err.message || 'Internal server error';
  const defaultMsgAr = 'حدث خطأ غير متوقع في الخادم الداخلي';

  const responsePayload = buildErrorResponse(
    defaultCode,
    defaultMsgEn,
    defaultMsgAr,
    isProduction ? undefined : { originalError: err.name || 'Error' },
    isProduction ? undefined : err.stack,
    { requestId: reqId }
  );

  return res.status(500).json(responsePayload);
}

/**
 * 404 Route Not Found Fallback Handler
 */
export function expressNotFoundMiddleware(req: Request, res: Response) {
  const reqId = req.requestId || (req.headers['x-request-id'] as string) || 'req_unknown';
  const path = req.originalUrl || req.url;

  const responsePayload = buildErrorResponse(
    EnterpriseErrorCode.ROUTE_NOT_FOUND,
    `API Route '${path}' was not found on this server`,
    `المسار المطلوب '${path}' غير موجود في النظام`,
    { path, method: req.method },
    undefined,
    { requestId: reqId }
  );

  return res.status(404).json(responsePayload);
}
