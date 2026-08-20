import type { Company } from './organization';
export type { Company };

export type UserRole = 
  // Base Roles
  | 'CUSTOMER' 
  | 'STAFF' 
  | 'ADMIN' 
  | 'DISPATCHER' 
  | 'FINANCE_OFFICER' 
  | 'DRIVER'
  // Enterprise Roles
  | 'SYSTEM_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'ERP_ADMIN'
  | 'COMPANY_ADMIN'
  | 'CEO'
  | 'COO'
  | 'CFO'
  | 'HR_MANAGER'
  | 'FINANCE_MANAGER'
  | 'SALES_MANAGER'
  | 'CUSTOMER_SERVICE_MANAGER'
  | 'WAREHOUSE_MANAGER'
  | 'CUSTOMS_MANAGER'
  | 'FLEET_MANAGER'
  | 'OPERATIONS_MANAGER'
  | 'BRANCH_MANAGER'
  | 'TEAM_LEADER'
  | 'EMPLOYEE'
  | 'PARTNER'
  | 'AGENT'
  | 'AUDITOR'
  | 'COMPLIANCE_OFFICER'
  | 'LEGAL_COUNSEL'
  | 'CUSTOMS_OFFICER'
  | 'ACCOUNTANT'
  | 'GUEST'
  | 'READ_ONLY';

export interface User {
  id: string;
  userId?: string;
  email: string;
  name?: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
  roles?: Array<UserRole | string>;
  permissions?: string[];
  passwordHash?: string;
  legalEntityId?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  country?: string | null;
  securityLevel?: number;
  approvalLimit?: number;
  clearanceLevel?: number;
  customPermissions?: string[];
  attributes?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSession extends User {
  token: string;
}
