export type ContractType =
  | 'MASTER_SERVICE_AGREEMENT'
  | 'TRANSPORTATION_CONTRACT'
  | 'WAREHOUSE_AGREEMENT'
  | 'CUSTOMS_AGREEMENT'
  | 'FREIGHT_AGREEMENT'
  | 'FRAMEWORK_AGREEMENT'
  | 'RATE_AGREEMENT'
  | 'INSURANCE_AGREEMENT'
  | 'PARTNER_AGREEMENT';

export type ContractStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'ARCHIVED'
  | 'CANCELLED';

export type SalesOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export type RateCategory =
  | 'AIR_FREIGHT'
  | 'SEA_FREIGHT'
  | 'LAND_TRANSPORT'
  | 'EXPRESS'
  | 'WAREHOUSING'
  | 'CUSTOMS'
  | 'PACKAGING'
  | 'INSURANCE'
  | 'FUEL_SURCHARGE'
  | 'PEAK_SEASON';

// Sales Order Interfaces
export interface SalesOrderItem {
  id: string;
  itemType: 'PRODUCT' | 'SERVICE' | 'SHIPMENT_REQUEST' | 'WAREHOUSE_REQUEST';
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent: number;
  totalAmount: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  businessPartnerId?: string;
  quotationRef?: string;
  contractRef?: string;
  items: SalesOrderItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  currency: 'SAR' | 'USD' | 'EUR';
  billingSchedule: 'MILESTONE' | 'MONTHLY' | 'UPFRONT' | 'UPON_DELIVERY';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  orderStatus: SalesOrderStatus;
  expectedDelivery: string;
  completionPercentage: number;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

// Contract Clauses & SLA
export interface ContractClause {
  id: string;
  title: string;
  content: string;
  category: 'PRICING' | 'SLA' | 'LIABILITY' | 'TERMINATION' | 'CONFIDENTIALITY' | 'CUSTOM';
  isMandatory: boolean;
}

export interface SlaRule {
  id: string;
  metricName: string; // e.g., 'Pickup Time', 'Delivery Accuracy', 'Claims Resolution'
  targetValue: string; // e.g., 'Within 4 Hours', '99.5%'
  penaltyRule: string; // e.g., '5% rebate per 2hr delay'
  escalationContact: string;
}

export interface RateCardItem {
  id: string;
  category: RateCategory;
  origin: string;
  destination: string;
  unitOfMeasure: 'KG' | 'CBM font' | 'CONTAINER_20' | 'CONTAINER_40' | 'PALLET' | 'SHIPMENT' | 'HOUR';
  baseRate: number;
  currency: 'SAR' | 'USD';
  validFrom: string;
  validTo: string;
  notes?: string;
}

// Digital Signature & Audit
export interface DigitalSignature {
  id: string;
  signerName: string;
  signerEmail: string;
  signerRole: 'LEGAL' | 'COMMERCIAL' | 'CUSTOMER_REP' | 'EXECUTIVE';
  signedAt: string;
  ipAddress: string;
  verificationHash: string;
  certificateRef: string;
}

// Contract Versioning
export interface ContractVersion {
  versionNumber: number;
  revisedAt: string;
  revisedBy: string;
  changeSummary: string;
  fileUrl?: string;
}

export interface CommercialContract {
  id: string;
  contractNumber: string;
  title: string;
  contractType: ContractType;
  version: number;
  revision: number;
  status: ContractStatus;
  customerId: string;
  customerName: string;
  businessPartnerId?: string;
  quotationRef?: string;
  effectiveDate: string;
  expirationDate: string;
  renewalDate: string;
  autoRenewal: boolean;
  businessOwner: string;
  legalOwner: string;
  commercialOwner: string;
  currency: 'SAR' | 'USD' | 'EUR';
  contractValue: number;
  jurisdiction: string;
  governingLaw: string;
  languages: ('ar' | 'en')[];
  clauses: ContractClause[];
  slaRules: SlaRule[];
  rateCards: RateCardItem[];
  signatures: DigitalSignature[];
  versionHistory: ContractVersion[];
  riskFlags: { id: string; riskType: string; description: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }[];
  complianceCheck: { insuranceValid: boolean; taxValid: boolean; licenseValid: boolean; auditPassed: boolean };
  createdAt: string;
  updatedAt: string;
}

// AI Analysis Payload
export interface AIContractAnalysisRequest {
  contractTitle: string;
  contractType: string;
  clausesText: string;
  slaText?: string;
}

export interface AIContractAnalysisResponse {
  summary: string;
  extractedClauses: { title: string; category: string; summary: string }[];
  detectedRisks: { riskType: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; suggestion: string }[];
  slaQualityScore: number;
  missingKeyClauses: string[];
  pricingRecommendation: string;
  renewalRecommendation: string;
}
