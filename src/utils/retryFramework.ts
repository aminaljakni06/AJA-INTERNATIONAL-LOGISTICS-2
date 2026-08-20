/**
 * AJA INTERNATIONAL LOGISTICS — Configurable Enterprise Retry & Recovery Framework
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Error Handling Framework
 * Version: 1.0
 */

import { EnterpriseAppError, ErrorCategory } from '../types/errors';
import { EnterpriseErrorCode } from '../types/apiResponse';

export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  useJitter?: boolean;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetryAttempt?: (error: unknown, attempt: number, nextDelayMs: number) => void;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffFactor: 2,
  useJitter: true,
  shouldRetry: defaultShouldRetryPolicy,
  onRetryAttempt: () => {},
};

export function defaultShouldRetryPolicy(error: unknown): boolean {
  if (error instanceof EnterpriseAppError) {
    return error.isRetryable;
  }

  if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
    // Network connectivity error
    return true;
  }

  if (typeof error === 'object' && error !== null) {
    const errObj = error as { status?: number; code?: string; name?: string };
    if (errObj.status && [408, 429, 500, 502, 503, 504].includes(errObj.status)) {
      return true;
    }
    if (errObj.name === 'TimeoutError' || errObj.code === 'ECONNRESET' || errObj.code === 'ETIMEDOUT') {
      return true;
    }
  }

  return false;
}

export async function executeWithRetry<T>(
  asyncFn: () => Promise<T>,
  customConfig?: RetryConfig
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...customConfig };
  let attempt = 0;
  let currentDelay = config.initialDelayMs;

  while (attempt <= config.maxRetries) {
    try {
      return await asyncFn();
    } catch (error) {
      attempt++;

      const isEligible = config.shouldRetry(error, attempt);
      if (!isEligible || attempt > config.maxRetries) {
        throw error;
      }

      // Calculate exponential backoff with optional jitter
      let nextDelay = Math.min(currentDelay * Math.pow(config.backoffFactor, attempt - 1), config.maxDelayMs);
      if (config.useJitter) {
        const jitter = Math.random() * 0.3 + 0.85; // 85% to 115% randomization
        nextDelay = Math.floor(nextDelay * jitter);
      }

      if (config.onRetryAttempt) {
        config.onRetryAttempt(error, attempt, nextDelay);
      }

      await new Promise((resolve) => setTimeout(resolve, nextDelay));
      currentDelay = nextDelay;
    }
  }

  throw new Error('Retry limit reached');
}
