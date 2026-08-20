export type AccountCategory =
  | 'ASSETS'
  | 'LIABILITIES'
  | 'EQUITY'
  | 'REVENUE'
  | 'COST_OF_SALES'
  | 'OPERATING_EXPENSES'
  | 'OTHER_INCOME'
  | 'OTHER_EXPENSES'
  | 'MEMORANDUM_ACCOUNTS';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'BLOCKED_FOR_POSTING';

export interface ChartOfAccount {
  id: string;
  accountCode: string; // e.g. "101000"
  accountNameEn: string;
  accountNameAr: string;
  category: AccountCategory;
  parentAccountCode?: string;
  hierarchyLevel: number; // 1, 2, 3, 4, 5
  isHeader: boolean; // Group header vs posting account
  isPosting: boolean;
  allowDirectPosting: boolean;
  currency: string; // "SAR", "USD", "AED", "ALL"
  status: AccountStatus;
  naturalAccountCode: string;
  companyId: string;
  branchId?: string;
  currentBalanceSAR: number;
  ytdDebitSAR: number;
  ytdCreditSAR: number;
  createdAt: string;
  updatedAt: string;
}

export type FinancialDimensionType =
  | 'COMPANY'
  | 'BRANCH'
  | 'BUSINESS_UNIT'
  | 'DEPARTMENT'
  | 'DIVISION'
  | 'PROJECT'
  | 'COST_CENTER'
  | 'PROFIT_CENTER'
  | 'REGION'
  | 'WAREHOUSE'
  | 'VEHICLE'
  | 'CUSTOMER'
  | 'VENDOR'
  | 'EMPLOYEE';

export interface FinancialDimensionValue {
  id: string;
  dimensionType: FinancialDimensionType;
  code: string;
  nameEn: string;
  nameAr: string;
  parentCode?: string;
  isActive: boolean;
  companyId: string;
}

export interface DimensionRule {
  id: string;
  accountCode: string;
  requiredDimensions: FinancialDimensionType[];
  optionalDimensions: FinancialDimensionType[];
  forbiddenDimensions: FinancialDimensionType[];
}

export interface FiscalPeriod {
  id: string;
  year: number; // e.g. 2026
  periodNumber: number; // 1 to 12
  periodNameEn: string; // e.g. "Jan 2026"
  periodNameAr: string; // e.g. "يناير 2026"
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'SOFT_CLOSE' | 'HARD_CLOSE' | 'FUTURE_ENTRY';
  closedBy?: string;
  closedAt?: string;
}

export interface FiscalYear {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
  isYearEndClosed: boolean;
  periods: FiscalPeriod[];
}

export interface CurrencyRate {
  id: string;
  currencyCode: string; // "USD", "EUR", "AED", "GBP"
  currencyNameEn: string;
  currencyNameAr: string;
  rateToBaseSAR: number; // 1 USD = 3.75 SAR
  effectiveDate: string;
  isBaseCurrency: boolean; // SAR = true
  isFunctionalCurrency: boolean;
  isReportingCurrency: boolean;
}

export interface CurrencyRevaluationLog {
  id: string;
  revaluationDate: string;
  currencyCode: string;
  oldRate: number;
  newRate: number;
  unrealizedGainLossSAR: number;
  journalEntryNumber?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export type JournalType =
  | 'MANUAL'
  | 'RECURRING'
  | 'REVERSING'
  | 'ADJUSTING'
  | 'ALLOCATION'
  | 'INTERCOMPANY'
  | 'SYSTEM_AUTOMATED';

export type JournalStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'POSTED' | 'REJECTED' | 'REVERSED';

export interface JournalLine {
  id: string;
  lineNumber: number;
  accountCode: string;
  accountNameEn: string;
  accountNameAr: string;
  debitSAR: number;
  creditSAR: number;
  foreignDebit?: number;
  foreignCredit?: number;
  currency?: string;
  exchangeRate?: number;
  descriptionEn: string;
  descriptionAr: string;

  // Financial Dimensions
  companyId: string;
  branchId?: string;
  costCenterCode?: string;
  departmentCode?: string;
  projectCode?: string;
  businessUnitCode?: string;
  vehicleCode?: string;
  warehouseCode?: string;
}

export interface JournalEntry {
  id: string;
  journalNumber: string; // e.g. "JV-2026-00812"
  journalType: JournalType;
  postingDate: string;
  fiscalPeriodId: string;
  companyId: string;
  companyName: string;
  referenceNumber?: string;
  sourceModule: 'GENERAL_LEDGER' | 'PROCUREMENT' | 'ACCOUNTS_PAYABLE' | 'FLEET' | 'WAREHOUSE' | 'TRANSPORTATION' | 'INTERCOMPANY';
  narrationEn: string;
  narrationAr: string;
  totalDebitSAR: number;
  totalCreditSAR: number;
  status: JournalStatus;
  preparedBy: string;
  preparedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  postedBy?: string;
  postedAt?: string;
  reversalJournalNumber?: string;
  lines: JournalLine[];
}

export interface IntercompanyTransaction {
  id: string;
  transactionNumber: string;
  sendingCompanyId: string;
  sendingCompanyName: string;
  receivingCompanyId: string;
  receivingCompanyName: string;
  dueToAccountCode: string;
  dueFromAccountCode: string;
  amountSAR: number;
  descriptionAr: string;
  descriptionEn: string;
  status: 'PENDING_MATCH' | 'MATCHED' | 'ELIMINATED' | 'DISCREPANCY';
  journalEntryNumber?: string;
  eliminationJournalNumber?: string;
  createdAt: string;
}

export interface IntercompanyAccount {
  id: string;
  accountCode: string;
  fromCompanyId: string;
  fromCompanyName: string;
  toCompanyId: string;
  toCompanyName: string;
  dueFromBalanceSAR: number;
  dueToBalanceSAR: number;
  autoEliminationEnabled: boolean;
  status: 'BALANCED' | 'PENDING' | 'DISCREPANCY';
}

export interface TrialBalanceRow {
  accountCode: string;
  accountNameEn: string;
  accountNameAr: string;
  category: AccountCategory;
  hierarchyLevel: number;
  openingDebitSAR: number;
  openingCreditSAR: number;
  periodDebitSAR: number;
  periodCreditSAR: number;
  closingDebitSAR: number;
  closingCreditSAR: number;
  netBalanceSAR: number;
  isHeader: boolean;
}

export interface FinancialControlRule {
  id: string;
  ruleCode: string;
  ruleNameEn: string;
  ruleNameAr: string;
  ruleType: 'SEGREGATION_OF_DUTIES' | 'POSTING_RESTRICTION' | 'THRESHOLD_APPROVAL' | 'PERIOD_LOCK';
  descriptionAr: string;
  isActive: boolean;
  thresholdSAR?: number;
  restrictedRoles?: string[];
}

export interface ExecutiveFinanceSummary {
  totalAssetsSAR: number;
  totalLiabilitiesSAR: number;
  totalEquitySAR: number;
  ytdRevenueSAR: number;
  ytdCostOfSalesSAR: number;
  ytdOperatingExpensesSAR: number;
  netProfitSAR: number;
  netMarginPercent: number;
  cashPositionSAR: number;
  workingCapitalSAR: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquityRatio: number;
  ledgerHealthScore: number; // 0-100
  unpostedJournalsCount: number;
  openFiscalPeriod: string;
  currencyExposureSAR: { currency: string; exposureAmount: number }[];
}

export type GeneralLedgerAccount = ChartOfAccount;

export interface FinancialTransaction {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  accountCode: string;
  accountNameEn: string;
  accountNameAr: string;
  debitAmount: number;
  creditAmount: number;
  currency: string;
  descriptionEn: string;
  descriptionAr: string;
  referenceNumber?: string;
  companyId: string;
  branchId?: string;
  postedBy: string;
}

export interface AIFinanceInsight {
  id: string;
  type: 'ACCOUNT_CLASSIFICATION' | 'JOURNAL_VALIDATION' | 'ANOMALY_DETECTION' | 'CURRENCY_FORECAST' | 'LEDGER_HEALTH';
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  confidencePercent: number;
  recommendedActionAr: string;
  accountCode?: string;
  journalNumber?: string;
  createdAt: string;
}
