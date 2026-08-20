/**
 * AJA INTERNATIONAL LOGISTICS — Centralized Enterprise Server Error Handler & Logger
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Error Handling Framework
 * Version: 1.0
 */

import { Request, Response, NextFunction } from 'express';
import {
  EnterpriseAppError,
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
} from '../../types/errors';
import { EnterpriseErrorCode } from '../../types/apiResponse';
import { buildErrorResponse } from '../utils/apiResponseBuilder';

export interface EnterpriseLogEntry {
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  errorCode: EnterpriseErrorCode;
  messageEn: string;
  messageAr?: string;
  details?: unknown;
  context?: ErrorContext;
  stack?: string;
}

export class EnterpriseErrorLogger {
  private static logEntries: EnterpriseLogEntry[] = [];
  private static MAX_LOG_HISTORY = 500;

  public static log(error: EnterpriseAppError | Error, req?: Request): EnterpriseLogEntry {
    const isAppError = error instanceof EnterpriseAppError;
    const isProduction = process.env.NODE_ENV === 'production';

    const severity = isAppError ? error.severity : ErrorSeverity.ERROR;
    const category = isAppError ? error.category : ErrorCategory.UNEXPECTED;
    const errorCode = isAppError ? error.code : EnterpriseErrorCode.INTERNAL_SERVER_ERROR;
    const messageEn = isAppError ? error.messageEn : error.message || 'An unexpected error occurred';
    const messageAr = isAppError ? error.messageAr : 'حدث خطأ غير متوقع في النظام';

    const context: ErrorContext = {
      requestId: req?.requestId || (isAppError ? error.context?.requestId : undefined),
      correlationId: (req?.headers['x-correlation-id'] as string) || (isAppError ? error.context?.correlationId : undefined),
      userId: (req as any)?.user?.id || (isAppError ? error.context?.userId : undefined),
      tenantId: (req as any)?.user?.tenantId || (isAppError ? error.context?.tenantId : undefined),
      endpoint: req ? `${req.method} ${req.originalUrl || req.url}` : isAppError ? error.context?.endpoint : undefined,
      timestamp: new Date().toISOString(),
      userAgent: req?.headers['user-agent'],
      ipAddress: req?.ip || req?.socket.remoteAddress,
    };

    const entry: EnterpriseLogEntry = {
      timestamp: new Date().toISOString(),
      severity,
      category,
      errorCode,
      messageEn,
      messageAr,
      details: isAppError ? error.details : undefined,
      context,
      stack: isProduction ? undefined : error.stack,
    };

    // Console output formatted for enterprise observability engines (Cloud Logging / OpenTelemetry)
    const logFormatted = `[${entry.timestamp}] [${entry.severity}] [${entry.errorCode}] [${entry.category}] reqId=${entry.context?.requestId || 'N/A'} path=${entry.context?.endpoint || 'N/A'} - ${entry.messageEn}`;

    if (severity === ErrorSeverity.FATAL || severity === ErrorSeverity.CRITICAL) {
      console.error(`🚨 CRITICAL SYS ERROR: ${logFormatted}`, entry.details || '', error.stack || '');
    } else if (severity === ErrorSeverity.ERROR) {
      console.error(`❌ ERROR: ${logFormatted}`, entry.details || '');
    } else if (severity === ErrorSeverity.WARNING) {
      console.warn(`⚠️ WARNING: ${logFormatted}`);
    } else {
      console.info(`ℹ️ INFO: ${logFormatted}`);
    }

    // In-memory ring buffer for diagnostics
    this.logEntries.unshift(entry);
    if (this.logEntries.length > this.MAX_LOG_HISTORY) {
      this.logEntries.pop();
    }

    return entry;
  }

  public static getRecentLogs(limit = 50): EnterpriseLogEntry[] {
    return this.logEntries.slice(0, limit);
  }
}
