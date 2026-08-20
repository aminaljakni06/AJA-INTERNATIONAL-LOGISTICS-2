export type AssetClass = 'TRANSPORT_FLEET' | 'WAREHOUSE_EQUIPMENT' | 'REAL_ESTATE_LAND' | 'IT_HARDWARE_SOFTWARE' | 'OFFICE_FACILITIES';
export type AssetStatus = 'COMMISSIONED' | 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'IMPAIRED' | 'DISPOSED' | 'RETIRED';
export type DepreciationMethod = 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'DOUBLE_DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION' | 'SUM_OF_YEARS_DIGITS' | 'CUSTOM_FORMULA';
export type LeaseStatus = 'ACTIVE' | 'TERMINATED' | 'RENEWED';
export type ZATCASubmitStatus = 'CLEARED' | 'REPORTED' | 'REJECTED' | 'PENDING_STAMP';

export interface FixedAsset {
  id: string;
  assetNumber: string; // e.g., 'AST-2026-RIG-001'
  assetNameEn: string;
  assetNameAr: string;
  assetClass: AssetClass;
  serialNumber: string;
  barcode: string;
  qrCode: string;
  companyName: string;
  branchLocation: string;
  costCenterCode: string;
  custodian: string;
  purchaseCostSAR: number;
  salvageValueSAR: number;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  accumulatedDepreciationSAR: number;
  netBookValueSAR: number;
  acquisitionDate: string;
  commissionDate: string;
  status: AssetStatus;
}

export interface DepreciationEntry {
  id: string;
  assetNumber: string;
  periodLabel: string; // e.g. 'Jan 2026'
  bookDepreciationSAR: number;
  taxDepreciationSAR: number;
  accumulatedTotalSAR: number;
  remainingBookValueSAR: number;
  postingStatus: 'POSTED' | 'SCHEDULED';
}

export interface IFRS16Lease {
  id: string;
  leaseContractCode: string; // e.g. 'LEASE-2026-WH-RYD'
  lessorNameEn: string;
  lessorNameAr: string;
  underlyingAssetDescription: string;
  startDate: string;
  expiryDate: string;
  monthlyPaymentSAR: number;
  discountRatePercent: number;
  initialRightOfUseAssetSAR: number;
  currentLeaseLiabilitySAR: number;
  status: LeaseStatus;
}

export interface ZATCAInvoiceRecord {
  id: string;
  invoiceNumber: string; // e.g. 'INV-2026-9041'
  buyerNameEn: string;
  buyerNameAr: string;
  vatRegistrationNumber: string;
  issueTimestamp: string;
  totalBeforeVATSAR: number;
  vatAmountSAR: number; // 15%
  totalWithVATSAR: number;
  cryptographicStamp: string;
  zatcaQrCode: string;
  status: ZATCASubmitStatus;
}

export interface FinancialStatementLine {
  id: string;
  accountCategory: 'ASSETS' | 'LIABILITIES' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  accountNameEn: string;
  accountNameAr: string;
  currentPeriodSAR: number;
  priorPeriodSAR: number;
  variancePercent: number;
}

export interface ConsolidatedEntity {
  id: string;
  entityCode: string;
  entityNameEn: string;
  entityNameAr: string;
  ownershipPercentage: number;
  functionalCurrency: 'SAR' | 'AED' | 'USD';
  standaloneRevenueSAR: number;
  intercompanyEliminationSAR: number;
  consolidatedRevenueSAR: number;
}

export interface AIFinanceAssetInsight {
  id: string;
  category: 'DEPRECIATION_OPTIMIZATION' | 'IMPAIRMENT_WARNING' | 'ZATCA_AUDIT_RISK' | 'LEASE_SAVINGS';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  confidencePercent: number;
  estimatedImpactSAR: number;
  actionRequiredEn: string;
  actionRequiredAr: string;
}
