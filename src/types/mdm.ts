export type MasterDataDomain =
  | 'CUSTOMER'
  | 'VENDOR'
  | 'CARRIER'
  | 'WAREHOUSE'
  | 'FLEET'
  | 'VEHICLE'
  | 'DRIVER'
  | 'EMPLOYEE'
  | 'COMPANY'
  | 'BRANCH'
  | 'DEPARTMENT'
  | 'COUNTRY'
  | 'CITY'
  | 'REGION'
  | 'PORT'
  | 'AIRPORT'
  | 'CURRENCY'
  | 'EXCHANGE_RATE'
  | 'LANGUAGE'
  | 'UOM'
  | 'PACKAGING_TYPE'
  | 'INCOTERM'
  | 'PAYMENT_TERM'
  | 'TAX_CODE'
  | 'COMMODITY_CATEGORY'
  | 'HAZMAT'
  | 'CONTAINER_TYPE'
  | 'SERVICE_CATALOG'
  | 'PRODUCT_CATALOG'
  | 'DOCUMENT_TYPE'
  | 'STATUS_CODE'
  | 'REASON_CODE'
  | 'BUSINESS_CALENDAR'
  | 'HOLIDAY_CALENDAR';

export type MasterRecordStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type MasterApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MasterDataRecord {
  id: string;
  domain: MasterDataDomain;
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  status: MasterRecordStatus;
  approvalStatus: MasterApprovalStatus;
  owner?: string;
  steward?: string;
  version: number;
  createdBy: string;
  updatedBy: string;
  effectiveDate: string;
  expirationDate?: string;
  companyScope: string[]; // e.g. ['GLOBAL'] or company IDs
  branchScope: string[]; // e.g. ['GLOBAL'] or branch IDs
  metadata: Record<string, any>;
  tags: string[];
  isDeleted: boolean;
  qualityScore: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

export interface MasterDataVersionRecord {
  id: string;
  masterRecordId: string;
  domain: MasterDataDomain;
  version: number;
  snapshot: MasterDataRecord;
  changedBy: string;
  changeReason: string;
  timestamp: string;
}

export interface MasterRelationship {
  id: string;
  sourceEntityId: string;
  sourceDomain: MasterDataDomain;
  targetEntityId: string;
  targetDomain: MasterDataDomain;
  relationshipType: 'PARENT_CHILD' | 'BELONGS_TO' | 'OPERATED_BY' | 'ASSIGNED_TO' | 'MAPPED_TO' | 'CUSTOM';
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: string;
}

export interface DuplicatePair {
  id: string;
  domain: MasterDataDomain;
  recordAId: string;
  recordBId: string;
  recordAName: string;
  recordBName: string;
  similarityScore: number; // 0 - 100
  matchReason: string;
  status: 'OPEN' | 'MERGED' | 'DISMISSED';
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface DataQualityIssue {
  recordId: string;
  recordCode: string;
  recordName: string;
  domain: MasterDataDomain;
  ruleType: 'COMPLETENESS' | 'FORMAT' | 'UNIQUENESS' | 'REFERENCE' | 'CONSISTENCY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  field?: string;
  message: string;
}

export interface MDMAnalytics {
  totalRecords: number;
  activeDomainsCount: number;
  averageQualityScore: number;
  openDuplicatesCount: number;
  pendingApprovalsCount: number;
  domainBreakdown: Record<MasterDataDomain, number>;
  statusBreakdown: Record<MasterRecordStatus, number>;
}
