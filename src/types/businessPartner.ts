export type BPRole =
  | 'CUSTOMER'
  | 'VENDOR'
  | 'SUPPLIER'
  | 'CARRIER'
  | 'FREIGHT_FORWARDER'
  | 'CUSTOMS_BROKER'
  | 'SHIPPING_AGENT'
  | 'WAREHOUSE_PROVIDER'
  | 'INSURANCE_PROVIDER'
  | 'FINANCIAL_INSTITUTION'
  | 'GOVERNMENT_AGENCY'
  | 'CONTRACTOR'
  | 'CONSULTANT'
  | 'AGENT'
  | '3PL'
  | '4PL'
  | 'PARTNER';

export type BPClassification = 'ENTERPRISE' | 'CORPORATE' | 'SME' | 'GOVERNMENT' | 'INDIVIDUAL';

export type BPStatus = 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'SUSPENDED' | 'BLACK_LISTED' | 'ARCHIVED';

export type BPRiskRating = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type BPCreditRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'UNRATED';

export type ContactRole = 'PRIMARY' | 'SECONDARY' | 'BILLING' | 'EMERGENCY' | 'TECHNICAL' | 'OPERATIONS' | 'LEGAL';

export type AddressType =
  | 'HEAD_OFFICE'
  | 'BRANCH'
  | 'BILLING'
  | 'SHIPPING'
  | 'WAREHOUSE'
  | 'PICKUP'
  | 'DELIVERY'
  | 'RETURNS'
  | 'LEGAL_ADDRESS';

export interface BPContact {
  id: string;
  name: string;
  jobTitle: string;
  department?: string;
  email: string;
  phone: string;
  mobile?: string;
  whatsapp?: string;
  preferredLanguage: 'ar' | 'en';
  roles: ContactRole[];
  isPrimary: boolean;
  isEmergency: boolean;
  notes?: string;
}

export interface BPAddress {
  id: string;
  type: AddressType;
  addressName: string;
  street: string;
  district?: string;
  city: string;
  stateRegion?: string;
  postalCode?: string;
  country: string;
  isPrimary: boolean;
  geoCoordinates?: {
    lat: number;
    lng: number;
  };
}

export interface BPBankAccount {
  id: string;
  bankName: string;
  branchName?: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  currency: string;
  isPrimary: boolean;
  settlementPreference?: string;
}

export interface BPCreditInfo {
  creditLimit: number;
  creditExposure: number;
  creditRating: BPCreditRating;
  riskCategory: BPRiskRating;
  isOnCreditHold: boolean;
  creditHoldReason?: string;
  paymentTerms: string; // e.g. "NET_30", "NET_60", "IMMEDIATE"
  incoterms: string; // e.g. "DDP", "FOB", "CIF"
  collectionStatus: 'NORMAL' | 'OVERDUE' | 'LEGAL_ACTION' | 'WRITTEN_OFF';
}

export interface BPLicense {
  id: string;
  type: string;
  licenseNumber: string;
  issuingAuthority: string;
  expiryDate: string;
  status: 'VALID' | 'EXPIRED' | 'SUSPENDED';
}

export interface BPCompliance {
  kycStatus: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'REJECTED';
  kycVerificationDate?: string;
  amlCheckStatus: 'CLEAR' | 'FLAGGED' | 'NOT_CHECKED';
  sanctionsStatus: 'CLEAR' | 'FLAGGED' | 'EXEMPT';
  commercialRegistration: string;
  crExpiryDate?: string;
  vatNumber: string;
  taxCertificateNumber?: string;
  licenses: BPLicense[];
}

export interface BPDocument {
  id: string;
  documentType: 'TRADE_LICENSE' | 'CR' | 'VAT_CERTIFICATE' | 'INSURANCE' | 'CONTRACT' | 'NDA' | 'TAX_CERTIFICATE' | 'KYC_DOC' | 'OTHER';
  title: string;
  fileUrl: string;
  version: number;
  expiryDate?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface BPRelationship {
  id: string;
  sourceBpId: string;
  sourceBpName: string;
  targetBpId: string;
  targetBpName: string;
  relationshipType: 'PARENT_COMPANY' | 'SUBSIDIARY' | 'VENDOR_CUSTOMER' | 'CARRIER_CUSTOMER' | 'PARTNER' | 'AGENT' | 'CROSS_COMPANY';
  description: string;
  effectiveDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BusinessPartner {
  id: string;
  bpNumber: string; // e.g. BP-10029
  organizationId?: string; // Link to Enterprise Organization Master
  roles: BPRole[];
  legalName: string;
  tradingName: string;
  arabicName: string;
  englishName: string;
  taxNumber: string;
  vatNumber: string;
  commercialRegistration: string;
  classification: BPClassification;
  industry: string;
  businessSize: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
  preferredCurrency: string;
  preferredLanguage: 'ar' | 'en';
  paymentTerms: string;
  incoterms: string;
  status: BPStatus;
  activationDate: string;
  expirationDate?: string;
  owner: string;
  dataSteward: string;
  tags: string[];
  metadata: Record<string, any>;
  contacts: BPContact[];
  addresses: BPAddress[];
  bankAccounts: BPBankAccount[];
  credit: BPCreditInfo;
  compliance: BPCompliance;
  documents: BPDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface BPDuplicatePair {
  id: string;
  partnerAId: string;
  partnerAName: string;
  partnerBId: string;
  partnerBName: string;
  similarityScore: number;
  matchReason: string;
  status: 'OPEN' | 'MERGED' | 'DISMISSED';
  detectedAt: string;
}

export interface BPAnalytics {
  totalPartners: number;
  activePartners: number;
  totalCreditLimit: number;
  totalCreditExposure: number;
  kycVerifiedCount: number;
  kycPendingCount: number;
  roleBreakdown: Record<BPRole, number>;
  riskBreakdown: Record<BPRiskRating, number>;
  statusBreakdown: Record<BPStatus, number>;
}
