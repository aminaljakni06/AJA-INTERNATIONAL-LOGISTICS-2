export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
export type BranchStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
export type EmploymentStatus = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN';
export type CostCenterType = 'DEPARTMENT' | 'BRANCH' | 'PROJECT' | 'OPERATIONAL' | 'CORPORATE';

export type DepartmentType =
  | 'OPERATIONS'
  | 'FINANCE'
  | 'HR'
  | 'CRM'
  | 'SALES'
  | 'MARKETING'
  | 'CUSTOMER_SERVICE'
  | 'WAREHOUSE'
  | 'FLEET'
  | 'CUSTOMS'
  | 'PROCUREMENT'
  | 'IT'
  | 'COMPLIANCE'
  | 'EXECUTIVE'
  | 'CUSTOM';

export interface HeadOfficeAddress {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
}

export interface CompanyBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  faviconUrl?: string;
}

export interface Company {
  id: string;
  name?: string;
  legalName?: string;
  tradeName?: string;
  commercialRegistration?: string; // CR Number
  commercialRegister?: string;
  vatNumber?: string; // Tax Number
  taxNumber?: string;
  phone?: string;
  address?: string;
  industry?: string;
  currency?: string;
  fiscalYearStart?: string; // e.g., '01-01'
  timeZone?: string;
  status?: CompanyStatus;
  branding?: CompanyBranding;
  defaultLanguage?: 'ar' | 'en';
  headOffice?: HeadOfficeAddress;
  createdAt: string;
  updatedAt?: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  companyId: string;
  country: string;
  city: string;
  address: string;
  managerId?: string;
  managerName?: string;
  phone: string;
  email: string;
  warehouseId?: string;
  status: BranchStatus;
  timezone: string;
  isHeadquarters?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  companyId: string;
  branchId?: string | null;
  type: DepartmentType;
  name: string;
  nameAr?: string;
  managerId?: string;
  managerName?: string;
  costCenterCode?: string;
  description?: string;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamRule {
  id: string;
  ruleName: string;
  description: string;
  enabled: boolean;
}

export interface Team {
  id: string;
  departmentId: string;
  companyId: string;
  branchId?: string;
  name: string;
  leaderId?: string;
  leaderName?: string;
  memberIds: string[];
  kpis?: string[];
  rules?: TeamRule[];
  createdAt: string;
  updatedAt: string;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  type: CostCenterType;
  companyId: string;
  branchId?: string;
  departmentId?: string;
  budgetAllocated: number;
  budgetSpent: number;
  currency: string;
  managerId?: string;
  managerName?: string;
  createdAt: string;
}

export interface EmployeeAssignment {
  userId: string;
  fullName: string;
  email: string;
  companyId: string;
  branchId: string;
  departmentId: string;
  teamId?: string;
  managerId?: string;
  managerName?: string;
  position: string;
  positionAr?: string;
  employmentStatus: EmploymentStatus;
  workLocation: string;
  joinedDate: string;
}

export interface ReportingTreeNode {
  id: string; // User ID
  fullName: string;
  position: string;
  role: string;
  avatarUrl?: string;
  email: string;
  departmentName?: string;
  branchName?: string;
  subordinates: ReportingTreeNode[];
}

export interface HolidayEntry {
  id: string;
  name: string;
  nameAr?: string;
  date: string; // ISO date string YYYY-MM-DD
  isRecurring: boolean;
}

export interface BusinessHours {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface OrganizationSettings {
  companyId: string;
  workingDays: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
  weekendDays: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
  businessHours: BusinessHours;
  holidays: HolidayEntry[];
  regionalSettings: {
    dateFormat: string;
    timeFormat: '12h' | '24h';
    numberFormat: string;
  };
  fiscalCalendar: {
    startMonth: number; // 1 to 12
    taxReportingPeriod: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  };
}
