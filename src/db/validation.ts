/**
 * Input Validation Utilities for Aja Logistics Database Layer
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export function validateEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required and must be a string');
  }
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    throw new ValidationError(`Invalid email format: ${email}`);
  }
  return clean;
}

export function validateRequiredString(value: unknown, fieldName: string): string {
  if (value === undefined || value === null || typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`Field '${fieldName}' is required and must be a non-empty string`);
  }
  return value.trim();
}

export function validateOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return String(value);
  return value.trim();
}

export function validateNumber(value: unknown, fieldName: string, min?: number): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError(`Field '${fieldName}' must be a valid number`);
  }
  if (min !== undefined && num < min) {
    throw new ValidationError(`Field '${fieldName}' must be greater than or equal to ${min}`);
  }
  return num;
}

export function validateRole(role: unknown): 'CUSTOMER' | 'STAFF' | 'ADMIN' {
  if (role === 'CUSTOMER' || role === 'STAFF' || role === 'ADMIN') {
    return role;
  }
  throw new ValidationError(`Invalid user role: ${role}. Expected CUSTOMER, STAFF, or ADMIN.`);
}

export function validateTrackingNumber(tn: string): string {
  const clean = validateRequiredString(tn, 'trackingNumber');
  if (clean.length < 5) {
    throw new ValidationError('Tracking number must be at least 5 characters');
  }
  return clean.toUpperCase();
}
