export type BillingType = 
  | 'SHIPMENT'
  | 'CONTRACT'
  | 'RECURRING'
  | 'MILESTONE'
  | 'PARTIAL'
  | 'CONSOLIDATED';

export type InvoiceSeries = 
  | 'INV-SA'
  | 'INV-UAE'
  | 'INV-INTL'
  | 'INV-MIL'
  | 'INV-CON';

export type InvoiceStatus = 
  | 'DRAFT'
  | 'ISSUED'
  | 'APPROVED'
  | 'SENT'
  | 'VIEWED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED'
  | 'VOIDED'
  | 'CREDIT_ADJUSTED';

export type PaymentMethod = 
  | 'ADYEN_CARD'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'CHEQUE'
  | 'ONLINE_PG'
  | 'CREDIT_MEMO';

export type PaymentStatus = 
  | 'PENDING'
  | 'ALLOCATED'
  | 'PARTIALLY_ALLOCATED'
  | 'REFUNDED'
  | 'REJECTED';

export type RevRecRule = 
  | 'IFRS15_PERFORMANCE_OBLIGATION'
  | 'MILESTONE_BASED'
  | 'TIME_STRAIGHT_LINE'
  | 'DELIVERY_COMPLETED';

export type RevRecStatus = 
  | 'DEFERRED'
  | 'RECOGNIZED'
  | 'PARTIALLY_RECOGNIZED';

export type RiskRating = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DunningLevel = 
  | 'LEVEL_1_REMINDER'
  | 'LEVEL_2_NOTICE'
  | 'LEVEL_3_WARNING'
  | 'LEVEL_4_LEGAL';

export interface CustomerInvoiceLine {
  id: string;
  descriptionEn: string;
  descriptionAr: string;
  quantity: number;
  unitPriceSAR: number;
  lineTotalSAR: number;
  vatRatePercent: number; // e.g., 15 for KSA VAT
  vatAmountSAR: number;
  totalIncVatSAR: number;
  glAccountCode: string; // e.g. 401000 Freight Revenue
  costCenterCode?: string;
  performanceObligationId?: string;
}

export interface InvoiceStatusHistory {
  status: InvoiceStatus;
  changedBy: string;
  changedAt: string;
  noteEn?: string;
  noteAr?: string;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string; // e.g. INV-SA-2026-00412
  series: InvoiceSeries;
  customerId: string;
  customerNameEn: string;
  customerNameAr: string;
  customerTaxNumber: string; // VAT ID e.g. 300192847100003
  billingType: BillingType;
  currencyCode: string; // 'SAR', 'AED', 'USD'
  exchangeRateToBaseSAR: number;
  issueDate: string;
  dueDate: string;
  paymentTermsDays: number; // 30, 60, 90
  lines: CustomerInvoiceLine[];
  subtotalSAR: number;
  totalVatSAR: number;
  totalAmountSAR: number;
  totalAmountInCurrency: number;
  paidAmountSAR: number;
  balanceDueSAR: number;
  status: InvoiceStatus;
  shipmentIds?: string[];
  contractId?: string;
  milestoneNameEn?: string;
  milestoneNameAr?: string;
  poNumber?: string;
  notesEn?: string;
  notesAr?: string;
  attachmentsCount: number;
  revisionNumber: number;
  statusHistory: InvoiceStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneRecognitionItem {
  milestoneId: string;
  nameEn: string;
  nameAr: string;
  targetPercent: number;
  amountSAR: number;
  status: 'PENDING' | 'RECOGNIZED';
  recognizedDate?: string;
  glPostingJvRef?: string;
}

export interface RevenueSchedule {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerNameEn: string;
  performanceObligationDescriptionEn: string;
  performanceObligationDescriptionAr: string;
  totalContractValueSAR: number;
  deferredRevenueBalanceSAR: number;
  recognizedRevenueBalanceSAR: number;
  revRecRule: RevRecRule;
  recognitionPeriodStart: string;
  recognitionPeriodEnd: string;
  milestones: MilestoneRecognitionItem[];
  status: RevRecStatus;
  lastPostingDate?: string;
}

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  allocatedAmountSAR: number;
  allocationDate: string;
  allocationType: 'AUTOMATIC' | 'MANUAL' | 'ADVANCE';
}

export interface CustomerPayment {
  id: string;
  paymentNumber: string; // e.g., PAY-2026-0812
  customerId: string;
  customerNameEn: string;
  customerNameAr: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceTransactionId: string; // Adyen TX or Bank Ref
  currencyCode: string;
  paymentAmountSAR: number;
  unallocatedAmountSAR: number;
  status: PaymentStatus;
  bankAccountCode: string; // e.g. 101100 NCB SAR Bank
  notesEn?: string;
  allocations: PaymentAllocation[];
}

export interface CustomerCreditProfile {
  id: string;
  customerId: string;
  customerNameEn: string;
  customerNameAr: string;
  creditLimitSAR: number;
  currentExposureSAR: number;
  availableCreditSAR: number;
  creditHold: boolean;
  holdReasonEn?: string;
  holdReasonAr?: string;
  riskRating: RiskRating;
  paymentBehaviorScore: number; // 0-100
  dsoDays: number;
  totalOverdueSAR: number;
  lastReviewedAt: string;
  approvalMatrix: {
    level: string;
    approverName: string;
    approvedAt: string;
    limitApprovedSAR: number;
  }[];
}

export interface CollectionNote {
  id: string;
  date: string;
  author: string;
  noteEn: string;
  noteAr: string;
}

export interface CollectionCase {
  id: string;
  caseNumber: string;
  customerId: string;
  customerNameEn: string;
  customerNameAr: string;
  outstandingAmountSAR: number;
  overdueDays: number;
  dunningLevel: DunningLevel;
  lastContactDate: string;
  nextFollowUpDate: string;
  promisedPaymentDate?: string;
  promisedAmountSAR?: number;
  legalStatus: 'NORMAL' | 'ESCALATED' | 'LEGAL_NOTICE' | 'WRITE_OFF_PENDING';
  assignedAgent: string;
  notes: CollectionNote[];
}

export interface CustomerStatement {
  customerId: string;
  customerNameEn: string;
  customerNameAr: string;
  statementPeriodStart: string;
  statementPeriodEnd: string;
  openingBalanceSAR: number;
  totalInvoicedSAR: number;
  totalPaidSAR: number;
  totalCreditsSAR: number;
  closingBalanceSAR: number;
  openInvoices: CustomerInvoice[];
  paidInvoices: CustomerInvoice[];
}

export interface BadDebtProvision {
  id: string;
  customerId: string;
  customerNameEn: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmountSAR: number;
  overdueDays: number;
  provisionPercent: number; // e.g., 50%, 100%
  provisionAmountSAR: number;
  status: 'PROVISIONED' | 'APPROVED_WRITE_OFF' | 'RECOVERED';
  writeOffReasonEn?: string;
  writeOffReasonAr?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface ARAnalytics {
  totalReceivablesSAR: number;
  currentReceivablesSAR: number;
  overdue1_30SAR: number;
  overdue31_60SAR: number;
  overdue61_90SAR: number;
  overdue90PlusSAR: number;
  dsoDays: number;
  collectionEfficiencyPercent: number;
  totalCreditLimitsSAR: number;
  creditUtilizationPercent: number;
  highRiskCustomersCount: number;
  predictedCollection30DaysSAR: number;
}

export interface AIReceivablesInsight {
  id: string;
  category: 'LATE_PAYMENT_RISK' | 'CREDIT_LIMIT' | 'REVENUE_FORECAST' | 'COLLECTION_STRATEGY';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  impactSAR: number;
  recommendedActionEn: string;
  recommendedActionAr: string;
  confidenceScore: number; // 0-100%
}
