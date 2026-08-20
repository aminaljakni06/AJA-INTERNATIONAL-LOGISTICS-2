/**
 * Input Validation Utilities for Aja Logistics Database Layer
 */
import { UserRole } from '../types/user';

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

const VALID_USER_ROLES = new Set<UserRole>([
  'CUSTOMER',
  'STAFF',
  'ADMIN',
  'DISPATCHER',
  'FINANCE_OFFICER',
  'DRIVER',
  'SYSTEM_ADMIN',
  'PLATFORM_ADMIN',
  'ERP_ADMIN',
  'COMPANY_ADMIN',
  'CEO',
  'COO',
  'CFO',
  'HR_MANAGER',
  'FINANCE_MANAGER',
  'SALES_MANAGER',
  'CUSTOMER_SERVICE_MANAGER',
  'WAREHOUSE_MANAGER',
  'CUSTOMS_MANAGER',
  'FLEET_MANAGER',
  'OPERATIONS_MANAGER',
  'BRANCH_MANAGER',
  'TEAM_LEADER',
  'EMPLOYEE',
  'PARTNER',
  'AGENT',
  'AUDITOR',
  'COMPLIANCE_OFFICER',
  'LEGAL_COUNSEL',
  'CUSTOMS_OFFICER',
  'ACCOUNTANT',
  'GUEST',
  'READ_ONLY',
]);

export function validateRole(role: unknown): UserRole {
  if (typeof role === 'string' && VALID_USER_ROLES.has(role as UserRole)) {
    return role as UserRole;
  }
  throw new ValidationError(`Invalid user role: ${role}. Expected a canonical AJA user role.`);
}

export function validateTrackingNumber(tn: string): string {
  const clean = validateRequiredString(tn, 'trackingNumber');
  if (clean.length < 5) {
    throw new ValidationError('Tracking number must be at least 5 characters');
  }
  return clean.toUpperCase();
}
