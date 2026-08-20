export type OrganizationType =
  | 'HOLDING_COMPANY'
  | 'COMPANY'
  | 'SUBSIDIARY'
  | 'REGIONAL_OFFICE'
  | 'BRANCH'
  | 'DISTRIBUTION_CENTER'
  | 'WAREHOUSE'
  | 'TERMINAL'
  | 'PORT_OFFICE'
  | 'AIRPORT_OFFICE'
  | 'DIVISION'
  | 'BUSINESS_UNIT'
  | 'DEPARTMENT'
  | 'OPERATIONS_CENTER'
  | 'FINANCE_OFFICE'
  | 'HR_OFFICE'
  | 'CUSTOMER_SERVICE_CENTER'
  | 'FLEET_OPERATIONS_CENTER'
  | 'TEAM';

export type OrgRelationshipType =
  | 'PARENT_CHILD'
  | 'PARTNER'
  | 'SHARED_SERVICES'
  | 'INTERNAL_SUPPLIER'
  | 'INTERNAL_CUSTOMER'
  | 'CROSS_COMPANY'
  | 'TEMPORARY_ASSIGNMENT';

export type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface LegalEntityDetails {
  legalEntityId: string;
  legalName: string;
  tradeName: string;
  commercialRegistration: string; // CR Number
  vatNumber: string; // Tax ID
  taxRegistrationDate?: string;
  incorporationCountry: string;
  licenses: {
    licenseNumber: string;
    issuingAuthority: string;
    expiryDate: string;
    type: string;
  }[];
  regulatoryMetadata?: Record<string, any>;
}

export interface GeographicLocation {
  country: string;
  region: string;
  province?: string;
  city: string;
  district?: string;
  address: string;
  postalCode?: string;
  operationalZone?: string;
  deliveryZone?: string;
  coverageArea?: string;
  latitude?: number;
  longitude?: number;
}

export interface FinancialRelationship {
  costCenterId?: string;
  costCenterCode?: string;
  costCenterName?: string;
  profitCenterId?: string;
  profitCenterCode?: string;
  responsibilityCenter?: string;
  budgetAllocated: number;
  budgetSpent: number;
  currency: string;
  budgetOwnerId?: string;
  budgetOwnerName?: string;
}

export interface MasterOrganizationNode {
  id: string; // Global Org ID (UUID/Code)
  code: string; // e.g., 'AJA-SA-HQ'
  name: string; // English Name
  nameAr: string; // Arabic Name
  shortName: string;
  type: OrganizationType;
  parentId: string | null;
  depth: number;
  lineagePath: string; // e.g., '/holding/company-sa/branch-ruh'
  legalEntity?: LegalEntityDetails;
  geographic: GeographicLocation;
  financial: FinancialRelationship;
  phone: string;
  email: string;
  website?: string;
  timeZone: string;
  currency: string;
  defaultLanguage: 'ar' | 'en';
  status: OrganizationStatus;
  activationDate: string;
  expirationDate?: string;
  version: number;
  effectiveDate: string;
  dataSteward: string; // Steward User ID/Name
  ownerUserId?: string;
  metadata?: Record<string, any>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationRelationship {
  id: string;
  sourceOrgId: string;
  sourceOrgName: string;
  targetOrgId: string;
  targetOrgName: string;
  relationshipType: OrgRelationshipType;
  description: string;
  effectiveDate: string;
  status: 'ACTIVE' | 'TERMINATED';
  createdAt: string;
}

export interface OrganizationHierarchyTreeNode {
  node: MasterOrganizationNode;
  children: OrganizationHierarchyTreeNode[];
  totalSubNodes: number;
}

export interface OrganizationVersionRecord {
  versionId: string;
  orgId: string;
  version: number;
  effectiveDate: string;
  changes: Record<string, { oldVal: any; newVal: any }>;
  changedBy: string;
  timestamp: string;
  reason?: string;
}

export interface OrganizationMasterAnalytics {
  totalNodes: number;
  nodesByType: Record<string, number>;
  totalLegalEntities: number;
  totalCostCenters: number;
  totalProfitCenters: number;
  maxHierarchyDepth: number;
  activeCount: number;
  inactiveCount: number;
}
