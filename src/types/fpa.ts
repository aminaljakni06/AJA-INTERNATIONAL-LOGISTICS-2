export type BudgetStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'LOCKED' | 'REVISED';
export type BudgetType = 'ANNUAL' | 'QUARTERLY' | 'PROJECT_CAPEX' | 'DEPARTMENTAL_OPEX';
export type CapexStatus = 'PROPOSED' | 'UNDER_EVALUATION' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export type FPAScenarioType = 'BASE_CASE' | 'OPTIMISTIC' | 'PESSIMISTIC_STRESS';

export interface BudgetVersion {
  id: string;
  versionCode: string; // e.g., 'BUD-2026-V1'
  fiscalYear: number;
  budgetNameEn: string;
  budgetNameAr: string;
  budgetType: BudgetType;
  status: BudgetStatus;
  totalBudgetSAR: number;
  allocatedCapexSAR: number;
  allocatedOpexSAR: number;
  createdBy: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface DepartmentBudgetLine {
  id: string;
  budgetId: string;
  departmentNameEn: string;
  departmentNameAr: string;
  costCenterCode: string;
  annualBudgetSAR: number;
  actualSpentSAR: number;
  encumberedSAR: number;
  remainingSAR: number;
  varianceSAR: number;
  variancePercent: number;
}

export interface CapexProject {
  id: string;
  projectCode: string;
  projectNameEn: string;
  projectNameAr: string;
  department: string;
  requestedAmountSAR: number;
  approvedAmountSAR: number;
  spentToDateSAR: number;
  projectedRoiPercent: number;
  npvSAR: number;
  irrPercent: number;
  paybackPeriodMonths: number;
  status: CapexStatus;
  sponsor: string;
}

export interface ForecastPeriod {
  id: string;
  periodLabel: string; // e.g. 'Q1 2026', 'Q2 2026'
  budgetRevenueSAR: number;
  forecastRevenueSAR: number;
  actualRevenueSAR: number;
  budgetExpenseSAR: number;
  forecastExpenseSAR: number;
  actualExpenseSAR: number;
  forecastEbitdaSAR: number;
  ebitdaMarginPercent: number;
}

export interface ScenarioModel {
  id: string;
  scenarioNameEn: string;
  scenarioNameAr: string;
  scenarioType: FPAScenarioType;
  revenueGrowthAssumptionPercent: number;
  fuelCostIncreasePercent: number;
  laborInflationPercent: number;
  projectedEbitdaSAR: number;
  projectedNetMarginPercent: number;
  riskAssessmentEn: string;
  riskAssessmentAr: string;
}

export interface VarianceItem {
  id: string;
  costCenterCode: string;
  accountNameEn: string;
  accountNameAr: string;
  budgetAmountSAR: number;
  actualAmountSAR: number;
  varianceSAR: number;
  varianceType: 'FAVORABLE' | 'UNFAVORABLE';
  variancePercent: number;
  rootCauseEn: string;
  rootCauseAr: string;
}

export interface CostAllocationRule {
  id: string;
  ruleCode: string;
  sourcePoolEn: string;
  sourcePoolAr: string;
  poolAmountSAR: number;
  allocationDriverEn: string;
  allocationDriverAr: string; // e.g. 'Machine Hours', 'Fleet Mileage', 'Headcount'
  targetDepartments: { departmentEn: string; departmentAr: string; percentage: number; allocatedAmountSAR: number }[];
}

export interface ProfitabilitySegment {
  id: string;
  segmentType: 'CUSTOMER' | 'ROUTE' | 'BRANCH' | 'SERVICE_LINE';
  segmentNameEn: string;
  segmentNameAr: string;
  grossRevenueSAR: number;
  directCostSAR: number;
  allocatedOverheadSAR: number;
  netProfitSAR: number;
  netMarginPercent: number;
  profitabilityRank: number;
}

export interface ExecutiveFinancialKPI {
  id: string;
  kpiNameEn: string;
  kpiNameAr: string;
  currentValue: number;
  targetValue: number;
  unit: 'SAR' | 'PERCENT' | 'RATIO' | 'DAYS';
  status: 'EXCEEDING' | 'ON_TRACK' | 'AT_RISK' | 'CRITICAL';
  yoyGrowthPercent: number;
}

export interface AIFPAInsight {
  id: string;
  category: 'BUDGET_OPTIMIZATION' | 'COST_REDUCTION' | 'FORECAST_ACCURACY' | 'PROFITABILITY_DRIVERS';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  confidenceScore: number;
  impactSAR: number;
  recommendedActionEn: string;
  recommendedActionAr: string;
}
