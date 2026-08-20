export type VendorCategoryType =
  | 'Transportation'
  | 'Warehousing'
  | 'Packaging'
  | 'Fuel'
  | 'Customs'
  | 'Insurance'
  | 'Equipment'
  | 'IT Services'
  | 'Professional Services'
  | 'Maintenance'
  | 'Utilities';

export type VendorStatus =
  | 'ONBOARDING'
  | 'APPROVED'
  | 'SUSPENDED'
  | 'BLOCKED'
  | 'BLACKLISTED'
  | 'CONDITIONAL'
  | 'PREFERRED'
  | 'STRATEGIC';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PaymentTermOption = 'NET_15' | 'NET_30' | 'NET_60' | 'DUE_ON_RECEIPT' | 'ADVANCE_50_50';

export interface PurchasingOrganization {
  id: string;
  code: string;
  name: string;
  companyId: string;
  companyName: string;
  branchId?: string;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE';
  buyersCount: number;
  description: string;
  createdAt: string;
}

export interface PurchasingGroup {
  id: string;
  code: string;
  name: string;
  purchasingOrgId: string;
  purchasingOrgName: string;
  leadBuyerName: string;
  leadBuyerEmail: string;
  categorySpecialization: VendorCategoryType;
  membersCount: number;
}

export interface VendorScorecard {
  qualityScore: number; // 0-100
  deliveryPerformance: number; // 0-100%
  priceCompetitiveness: number; // 0-100
  leadTimeDays: number;
  responseTimeHours: number;
  complianceScore: number; // 0-100
  overallRating: number; // 1-5 scale
}

export interface VendorRiskProfile {
  financialRisk: RiskLevel;
  operationalRisk: RiskLevel;
  complianceRisk: RiskLevel;
  cyberRisk: RiskLevel;
  esgScore: number; // 0-100
  countryRisk: RiskLevel;
  supplyChainRisk: RiskLevel;
  overallRiskScore: number; // 0-100
  riskLevel: RiskLevel;
}

export interface VendorQualifications {
  complianceValidated: boolean;
  backgroundCheckPassed: boolean;
  isoCertified: boolean;
  zatcaTaxVerified: boolean;
  commercialRegisterVerified: boolean;
  documentsCollectedCount: number;
  verificationDate?: string;
  expiryDate?: string;
}

export interface VendorMaster {
  id: string;
  vendorCode: string;
  name: string;
  legalName: string;
  taxId: string; // VAT / ZATCA
  commercialRegisterNo: string; // CR Number
  vendorType: VendorCategoryType;
  status: VendorStatus;
  
  companyDetails: {
    website: string;
    phone: string;
    email: string;
    country: string;
    city: string;
    address: string;
    postalCode: string;
  };
  
  financial: {
    bankName: string;
    iban: string;
    swift: string;
    paymentTerms: PaymentTermOption;
    currency: string;
    creditLimitSAR: number;
  };
  
  categories: VendorCategoryType[];
  regionsServed: string[];
  
  qualifications: VendorQualifications;
  scorecard: VendorScorecard;
  riskProfile: VendorRiskProfile;
  
  contractCount: number;
  totalSpendYTD: number;
  activeOrdersCount: number;
  
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;

  createdAt: string;
  updatedAt: string;
}

export interface SupplierContract {
  id: string;
  contractNumber: string;
  vendorId: string;
  vendorName: string;
  title: string;
  contractType: 'FRAMEWORK' | 'PRICING_AGREEMENT' | 'SLA' | 'LEASE' | 'SERVICE';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  status: 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'EXPIRED' | 'TERMINATED';
  valueSAR: number;
  governingLaw: string;
  paymentTerms: PaymentTermOption;
  renewalNoticeDays: number;
  createdAt: string;
}

export interface ProcurementPolicy {
  id: string;
  policyCode: string;
  title: string;
  category: VendorCategoryType | 'ALL';
  minAmountSAR: number;
  maxAmountSAR: number;
  approvalTier: 'BUYER' | 'MANAGER' | 'DIRECTOR' | 'VP_PROCUREMENT' | 'CFO';
  requiredQuotesCount: number;
  preferredVendorEnforced: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  description: string;
}

export interface SupplierPerformanceLog {
  id: string;
  vendorId: string;
  vendorName: string;
  evaluationDate: string;
  evaluatorName: string;
  qualityRating: number; // 1-5
  deliveryRating: number; // 1-5
  priceRating: number; // 1-5
  notes: string;
  actionTaken: 'NONE' | 'ISSUED_CAPA' | 'UPGRADED_PREFERRED' | 'SUSPENDED_TEMP' | 'FLAGGED_REVIEW';
}

export interface SupplierRiskAlert {
  id: string;
  vendorId: string;
  vendorName: string;
  riskCategory: 'FINANCIAL' | 'OPERATIONAL' | 'COMPLIANCE' | 'CYBER' | 'ESG' | 'COUNTRY';
  severity: RiskLevel;
  title: string;
  description: string;
  mitigationPlan: string;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'CLOSED';
  detectedAt: string;
}

export interface ProcurementSummaryKPIs {
  totalVendors: number;
  approvedVendors: number;
  preferredStrategicVendors: number;
  blockedSuspendedVendors: number;
  totalYTDSpendSAR: number;
  activeContractsValueSAR: number;
  openRiskAlertsCount: number;
  avgSupplierPerformanceScore: number;
}

// ==========================================
// PACK 007.002: SOURCING & REQUISITIONS TYPES
// ==========================================

export type PurchaseRequisitionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DEPARTMENT_APPROVED'
  | 'BUDGET_APPROVED'
  | 'PROCUREMENT_REVIEW'
  | 'EXECUTIVE_APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'APPROVED'
  | 'ARCHIVED';

export type RequisitionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RequisitionLineItem {
  id: string;
  itemDescription: string;
  category: VendorCategoryType;
  quantity: number;
  unitOfMeasure: string;
  estimatedUnitPriceSAR: number;
  totalPriceSAR: number;
  specifications?: string;
}

export interface PurchaseRequisition {
  id: string;
  requisitionNumber: string;
  department: string;
  businessUnit: string;
  costCenter: string;
  requestedBy: string;
  requestedByEmail: string;
  requiredDate: string;
  priority: RequisitionPriority;
  budgetReference: string;
  projectReference?: string;
  lineItems: RequisitionLineItem[];
  totalEstimatedAmountSAR: number;
  budgetAvailabilityStatus: 'AVAILABLE' | 'COMMITMENT_RESERVED' | 'THRESHOLD_EXCEEDED';
  status: PurchaseRequisitionStatus;
  approvalHistory: {
    stage: string;
    actionBy: string;
    actionDate: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'RETURNED';
    comments?: string;
  }[];
  attachmentsCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SourcingEventType = 'RFI' | 'RFQ' | 'RFP';
export type SourcingEventStatus = 'DRAFT' | 'PUBLISHED' | 'IN_EVALUATION' | 'AWARDED' | 'CLOSED' | 'CANCELLED';

export interface SourcingRequirementLine {
  id: string;
  description: string;
  category: VendorCategoryType;
  quantity: number;
  unit: string;
  targetPriceSAR?: number;
}

export interface SourcingEvent {
  id: string;
  eventNumber: string;
  eventType: SourcingEventType;
  title: string;
  category: VendorCategoryType;
  requisitionId?: string;
  requisitionNumber?: string;
  costCenter: string;
  budgetReference: string;
  responseDeadline: string;
  targetDeliveryDate: string;
  status: SourcingEventStatus;
  invitedVendorIds: string[];
  invitedVendorNames: string[];
  technicalWeightPercent: number; // e.g., 40%
  commercialWeightPercent: number; // e.g., 50%
  complianceWeightPercent: number; // e.g., 10%
  requirementsLines: SourcingRequirementLine[];
  estimatedValueSAR: number;
  awardedVendorId?: string;
  awardedVendorName?: string;
  awardedValueSAR?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierQuotationLine {
  requirementLineId: string;
  description: string;
  quantity: number;
  unitPriceSAR: number;
  discountPercent: number;
  taxPercent: number;
  netLineTotalSAR: number;
}

export interface SupplierQuotation {
  id: string;
  quotationNumber: string;
  sourcingEventId: string;
  sourcingEventNumber: string;
  vendorId: string;
  vendorName: string;
  submissionDate: string;
  validityDays: number;
  lineItems: SupplierQuotationLine[];
  subtotalSAR: number;
  taxSAR: number;
  totalQuotationSAR: number;
  leadTimeDays: number;
  paymentTerms: PaymentTermOption;
  deliveryTerms: string; // e.g., DDP Riyadh, FCA Dammam
  warrantyMonths: number;
  technicalScore: number; // 0-100
  commercialScore: number; // 0-100
  complianceScore: number; // 0-100
  weightedTotalScore: number; // 0-100
  status: 'SUBMITTED' | 'UNDER_EVALUATION' | 'SHORTLISTED' | 'RECOMMENDED' | 'AWARDED' | 'REJECTED';
  committeeRemarks?: string;
  attachmentsCount: number;
}

export interface StrategicSourcingAnalytics {
  totalRequisitionsCount: number;
  pendingApprovalsCount: number;
  activeRFQsRFPCount: number;
  totalEvaluatedBidsCount: number;
  achievedSavingsSAR: number;
  avgCycleTimeDays: number;
}

// ==========================================
// PACK 007.004: ACCOUNTS PAYABLE & INVOICING TYPES
// ==========================================

export type SupplierInvoiceStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_MATCHING'
  | 'MATCHED'
  | 'DISCREPANCY_HOLD'
  | 'APPROVED_FOR_PAYMENT'
  | 'PARTIALLY_PAID'
  | 'FULLY_PAID'
  | 'CANCELLED';

export type InvoiceCaptureChannel = 'MANUAL' | 'OCR_PDF' | 'ZATCA_E_INVOICE_XML' | 'BULK_IMPORT';

export type MatchingStatusType =
  | 'PENDING'
  | 'EXACT_MATCH'
  | 'TOLERANCE_APPROVED'
  | 'QUANTITY_MISMATCH'
  | 'PRICE_MISMATCH'
  | 'TAX_MISMATCH';

export interface SupplierInvoiceLineItem {
  id: string;
  itemDescription: string;
  quantity: number;
  unitPriceSAR: number;
  taxAmountSAR: number;
  totalAmountSAR: number;
  poLineReference?: string;
  grnLineReference?: string;
}

export interface ThreeWayMatchResult {
  matchPassed: boolean;
  matchingStatus: MatchingStatusType;
  poTotalSAR: number;
  grnTotalSAR: number;
  invoiceTotalSAR: number;
  priceVarianceSAR: number;
  quantityVarianceSAR: number;
  priceVariancePercent: number;
  quantityVariancePercent: number;
  toleranceAllowedPercent: number;
  discrepancyNotes?: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  poNumber?: string;
  grnReference?: string;
  contractReference?: string;
  invoiceDate: string;
  dueDate: string;
  postingDate: string;
  currency: 'SAR' | 'USD' | 'EUR';
  vatRegistrationNumber: string;
  netAmountSAR: number;
  vatAmountSAR: number;
  withholdingTaxAmountSAR: number;
  totalAmountSAR: number;
  paidAmountSAR: number;
  remainingBalanceSAR: number;
  status: SupplierInvoiceStatus;
  captureChannel: InvoiceCaptureChannel;
  matchingStatus: MatchingStatusType;
  threeWayMatch?: ThreeWayMatchResult;
  lineItems: SupplierInvoiceLineItem[];
  paymentTerms: PaymentTermOption;
  attachmentsCount: number;
  zatcaQRCode?: string;
  zatcaComplianceStatus?: 'PASSED' | 'WARNING' | 'FAILED';
  approvalFlow: {
    stage: string;
    actionBy: string;
    actionDate: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING';
    comments?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentRunMethod = 'BANK_TRANSFER' | 'ADYEN_GATEWAY' | 'CORPORATE_CHECK' | 'LETTER_OF_CREDIT';
export type PaymentRunStatus = 'DRAFT' | 'APPROVED_SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface APPaymentRun {
  id: string;
  paymentRunNumber: string;
  paymentRunDate: string;
  scheduledExecutionDate: string;
  totalPaymentAmountSAR: number;
  totalInvoicesCount: number;
  paymentMethod: PaymentRunMethod;
  status: PaymentRunStatus;
  selectedInvoiceIds: string[];
  discountSavingsAchievedSAR: number;
  initiatedBy: string;
  bankAccountReference: string;
  adyenPaymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierReconciliationStatement {
  id: string;
  statementNumber: string;
  supplierId: string;
  supplierName: string;
  periodStartDate: string;
  periodEndDate: string;
  openingBalanceSAR: number;
  totalInvoicedSAR: number;
  totalPaidSAR: number;
  creditDebitAdjustmentsSAR: number;
  closingBalanceSAR: number;
  reconciliationStatus: 'BALANCED' | 'DISCREPANCY_OPEN' | 'RESOLVED';
  discrepancyAmountSAR: number;
  notes?: string;
  reconciledBy: string;
  reconciledAt: string;
}

export interface APAgingAnalytics {
  totalAPLiabilitiesSAR: number;
  currentNotDueSAR: number;
  aging1To30DaysSAR: number;
  aging31To60DaysSAR: number;
  aging61To90DaysSAR: number;
  agingOver90DaysSAR: number;
  avgPaymentCycleDays: number;
  earlyPaymentDiscountSavingsSAR: number;
  totalPendingMatchingInvoices: number;
}

export interface AIAPIntelligence {
  ocrExtractedInvoicesCount: number;
  autoMatched3WayPercentage: number;
  fraudAlertsDetectedCount: number;
  predictedNext30DaysCashOutflowSAR: number;
  earlyDiscountOpportunitiesSAR: number;
  recommendations: string[];
}

// ==========================================
// PACK 007.005: ANALYTICS, SPEND CUBE, SCORECARDS & COCKPIT TYPES
// ==========================================

export interface SpendCubeFilter {
  supplierId?: string;
  category?: VendorCategoryType | 'ALL';
  region?: string;
  department?: string;
  project?: string;
  businessUnit?: string;
  year?: number;
  month?: string;
  currency?: string;
}

export interface SpendDimensionBreakdown {
  name: string;
  code: string;
  spendSAR: number;
  percentage: number;
  supplierCount: number;
  itemCount: number;
  contractedSpendSAR: number;
  maverickSpendSAR: number;
  savingsSAR: number;
  taxSAR: number;
}

export interface MonthlySpendTrend {
  month: string;
  spendSAR: number;
  budgetSAR: number;
  savingsSAR: number;
  maverickSpendSAR: number;
  contractedSpendSAR: number;
}

export interface SpendCubeData {
  totalSpendSAR: number;
  contractedSpendSAR: number;
  maverickSpendSAR: number;
  savingsSAR: number;
  taxSAR: number;
  supplierBreakdown: SpendDimensionBreakdown[];
  categoryBreakdown: SpendDimensionBreakdown[];
  regionBreakdown: SpendDimensionBreakdown[];
  departmentBreakdown: SpendDimensionBreakdown[];
  projectBreakdown: SpendDimensionBreakdown[];
  buBreakdown: SpendDimensionBreakdown[];
  monthlyTrends: MonthlySpendTrend[];
}

export interface SupplierScorecardKPI {
  score: number;
  weight: number;
  weightedScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';
  target: number;
  actual: number;
  unit: string;
}

export interface SupplierScorecard {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  category: VendorCategoryType;
  tier: 'STRATEGIC' | 'PREFERRED' | 'QUALIFIED' | 'CONDITIONAL' | 'RESTRICTED';
  period: '2026-Q1' | '2026-Q2' | '2026-Q3' | '2026-Q4' | '2026-ANNUAL';
  overallScore: number;
  ranking: number;
  kpis: {
    deliveryPerformance: SupplierScorecardKPI;
    qualityScore: SupplierScorecardKPI;
    pricingCompetitiveness: SupplierScorecardKPI;
    complianceScore: SupplierScorecardKPI;
    responsivenessScore: SupplierScorecardKPI;
    innovationESGScore: SupplierScorecardKPI;
  };
  claimsCount: number;
  leadTimeAvgDays: number;
  onTimeDeliveryPct: number;
  defectRatePct: number;
  rfqResponseHours: number;
  evaluatedBy: string;
  evaluatedAt: string;
  reviewType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  historyTrends: { period: string; score: number }[];
}

export interface ContractComplianceMetric {
  id: string;
  contractId: string;
  contractTitle: string;
  vendorId: string;
  vendorName: string;
  category: VendorCategoryType;
  totalContractValueSAR: number;
  utilizedAmountSAR: number;
  utilizationPct: number;
  maverickSpendSAR: number;
  offContractSpendSAR: number;
  pricingCompliancePct: number;
  expirationDaysLeft: number;
  savingsAchievedSAR: number;
  status: 'COMPLIANT' | 'OVER_UTILIZED' | 'EXPIRING_SOON' | 'MAVERICK_RISK';
}

export interface ContractComplianceSummary {
  totalContractedSpendSAR: number;
  maverickSpendSAR: number;
  offContractSpendSAR: number;
  maverickRatePct: number;
  avgContractUtilizationPct: number;
  expiringWithin30DaysCount: number;
  activeContractsCount: number;
  totalSavingsSAR: number;
}

export interface PurchaseCycleAnalytics {
  avgPRtoPOHours: number;
  avgPOApprovalHours: number;
  avgSupplierResponseHours: number;
  avgOrderFulfillmentDays: number;
  avgInvoiceProcessingHours: number;
  threeWayMatchRatePct: number;
  onTimeInFullFulfillmentPct: number;
  paymentOnTimePct: number;
  prToPoCycleTrend: { month: string; hours: number }[];
  poApprovalTrend: { month: string; hours: number }[];
}

export interface ExecutiveProcurementKPIs {
  spendUnderManagementSAR: number;
  spendUnderManagementPct: number;
  totalSavingsSAR: number;
  costSavingsPct: number;
  procurementROIRatio: number;
  activeSuppliersCount: number;
  highRiskSuppliersCount: number;
  avgSupplierScore: number;
  contractCompliancePct: number;
  avgPurchaseCycleDays: number;
}

export interface SpendOptimizationOpportunity {
  id: string;
  title: string;
  category: VendorCategoryType;
  potentialSavingsSAR: number;
  recommendation: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  implementationTime: string;
}

export interface SupplierRiskPrediction {
  vendorId: string;
  vendorName: string;
  riskFactor: string;
  probabilityPct: number;
  predictedImpactSAR: number;
  mitigationStrategy: string;
}

export interface DemandForecastCategory {
  category: VendorCategoryType;
  forecastedSpend30DaysSAR: number;
  forecastedSpend90DaysSAR: number;
  expectedPriceTrendPct: number;
  confidencePct: number;
}

export interface CategoryOptimizationInsight {
  category: VendorCategoryType;
  currentVendorsCount: number;
  optimalVendorsCount: number;
  strategy: string;
  benchmarkComparisonPct: number;
}

export interface AIProcurementIntelligenceData {
  spendOptimizationOpportunities: SpendOptimizationOpportunity[];
  supplierRiskPredictions: SupplierRiskPrediction[];
  demandForecasts: DemandForecastCategory[];
  categoryOptimizations: CategoryOptimizationInsight[];
  executiveInsights: string[];
  benchmarkMetrics: {
    category: string;
    ajaMetric: number;
    industryBenchmark: number;
    unit: string;
  }[];
}



