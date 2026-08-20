export type BankAccountType = 'CHECKING' | 'SAVINGS' | 'TREASURY' | 'PAYROLL' | 'ESCROW' | 'SWEEP';
export type BankAccountStatus = 'ACTIVE' | 'DORMANT' | 'FROZEN' | 'CLOSED' | 'UNDER_REVIEW';
export type PaymentMethodType = 'SARIE_LOCAL' | 'SWIFT_INTL' | 'SEPA_EUR' | 'ADYEN_SETTLEMENT' | 'INTERNAL_TRANSFER' | 'CHECK';
export type PaymentBatchStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'TRANSMITTED' | 'SETTLED' | 'REJECTED';
export type ReconMatchStatus = 'UNMATCHED' | 'AUTO_MATCHED' | 'MANUALLY_MATCHED' | 'EXCEPTION';
export type TreasuryDealType = 'TERM_DEPOSIT' | 'COMMERCIAL_PAPER' | 'SUKUK' | 'SYNDICATED_LOAN' | 'REVOLVING_CREDIT' | 'FX_FORWARD';
export type ScenarioType = 'OPTIMISTIC' | 'BASE_CASE' | 'STRESS_SCENARIO';

export interface BankSignatory {
  id: string;
  nameEn: string;
  nameAr: string;
  role: string;
  approvalLimitSAR: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  accountNameEn: string;
  accountNameAr: string;
  bankNameEn: string;
  bankNameAr: string;
  swiftCode: string;
  iban: string;
  branchNameEn: string;
  branchNameAr: string;
  currency: 'SAR' | 'USD' | 'EUR' | 'AED';
  accountType: BankAccountType;
  status: BankAccountStatus;
  currentBalance: number;
  availableBalance: number;
  unreconciledAmount: number;
  glAccountCode: string; // Integration with Chart of Accounts
  signatories: BankSignatory[];
  creditLimitSAR?: number;
}

export interface CashMovement {
  id: string;
  movementDate: string;
  bankAccountId: string;
  accountNameEn: string;
  amount: number;
  currency: 'SAR' | 'USD' | 'EUR' | 'AED';
  amountSAR: number;
  direction: 'INFLOW' | 'OUTFLOW';
  category: 'CUSTOMER_COLLECTION' | 'VENDOR_PAYMENT' | 'PAYROLL' | 'TAX_VAT' | 'TREASURY_TRANSFER' | 'ADYEN_SETTLEMENT' | 'INTERCOMPANY';
  referenceNumber: string;
  descriptionEn: string;
  descriptionAr: string;
  counterpartyName: string;
  reconciled: boolean;
}

export interface TreasuryDeal {
  id: string;
  dealNumber: string;
  dealType: TreasuryDealType;
  counterpartyBankEn: string;
  counterpartyBankAr: string;
  principalAmountSAR: number;
  interestRatePercent: number;
  startDate: string;
  maturityDate: string;
  accruedInterestSAR: number;
  currency: 'SAR' | 'USD' | 'EUR';
  status: 'ACTIVE' | 'MATURED' | 'CANCELLED';
  traderName: string;
}

export interface PaymentBatchItem {
  id: string;
  vendorOrBeneficiaryNameEn: string;
  vendorOrBeneficiaryNameAr: string;
  ibanOrAccount: string;
  swiftCode?: string;
  amount: number;
  currency: 'SAR' | 'USD' | 'EUR';
  amountSAR: number;
  invoiceRef: string;
  apModuleId?: string;
  purposeCode: string; // e.g., 'SALA', 'SUPP', 'INTC'
}

export interface PaymentBatch {
  id: string;
  batchNumber: string;
  createdDate: string;
  bankAccountId: string;
  sourceAccountNameEn: string;
  paymentMethod: PaymentMethodType;
  totalAmountSAR: number;
  totalItemsCount: number;
  status: PaymentBatchStatus;
  preparedBy: string;
  approvedBy?: string;
  approvedDate?: string;
  items: PaymentBatchItem[];
  fileFormat: 'ISO20022_XML' | 'SARIE_MT103' | 'CSV_BATCH';
}

export interface BankStatementLine {
  id: string;
  statementId: string;
  valueDate: string;
  bookingDate: string;
  reference: string;
  descriptionEn: string;
  descriptionAr: string;
  amount: number;
  direction: 'DEBIT' | 'CREDIT';
  balanceAfter: number;
  matchStatus: ReconMatchStatus;
  matchedGlJournalRef?: string;
  matchedArApRef?: string;
}

export interface BankStatement {
  id: string;
  statementNumber: string;
  bankAccountId: string;
  bankNameEn: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  lines: BankStatementLine[];
}

export interface LiquidityForecastItem {
  id: string;
  forecastDate: string;
  periodLabel: string; // e.g., 'Week 1', 'Week 2'
  projectedInflowSAR: number;
  projectedOutflowSAR: number;
  netCashFlowSAR: number;
  endingCashPositionSAR: number;
  liquidityGapSAR: number;
  confidenceLevelPercent: number;
}

export interface FXRate {
  id: string;
  pair: string; // e.g., 'USD/SAR', 'EUR/SAR', 'AED/SAR'
  baseCurrency: string;
  targetCurrency: string;
  spotRate: number;
  previousCloseRate: number;
  dailyChangePercent: number;
  lastUpdated: string;
}

export interface FXExposure {
  id: string;
  currency: 'USD' | 'EUR' | 'AED';
  assetExposureSAR: number;
  liabilityExposureSAR: number;
  netExposureSAR: number;
  unrealizedGainLossSAR: number;
  recommendedHedgeActionEn: string;
  recommendedHedgeActionAr: string;
}

export interface FinancialSettlement {
  id: string;
  settlementRef: string;
  settlementDate: string;
  type: 'INCOMING' | 'OUTGOING' | 'ADYEN_GATEWAY_NET';
  channel: 'BANK_SARIE' | 'SWIFT' | 'ADYEN_CARD' | 'CHANCELLERY';
  grossAmountSAR: number;
  feeAmountSAR: number;
  netAmountSAR: number;
  status: 'MATCHED' | 'PENDING_VERIFICATION' | 'DISCREPANCY';
  arApDocumentRef: string;
  bankAccountRef: string;
  matchedJournalId?: string;
}

export interface AITreasuryInsight {
  id: string;
  category: 'CASH_FORECAST' | 'LIQUIDITY_RISK' | 'FX_OPTIMIZATION' | 'AUTO_RECONCILIATION';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  confidenceScore: number;
  impactSAR: number;
  recommendedActionEn: string;
  recommendedActionAr: string;
}
