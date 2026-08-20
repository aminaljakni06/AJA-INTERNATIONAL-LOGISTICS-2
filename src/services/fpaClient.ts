import {
  AIFPAInsight,
  BudgetStatus,
  BudgetVersion,
  CapexProject,
  CostAllocationRule,
  DepartmentBudgetLine,
  ExecutiveFinancialKPI,
  ForecastPeriod,
  ProfitabilitySegment,
  ScenarioModel,
  VarianceItem,
} from '../types/fpa';

export interface FPASummaryMetrics {
  masterBudgetTotalSAR: number;
  totalSpentSAR: number;
  totalEncumberedSAR: number;
  remainingBudgetSAR: number;
  netVarianceSAR: number;
  capexApprovedTotalSAR: number;
  avgEbitdaMarginPercent: number;
}

export interface FPASnapshot {
  metrics: FPASummaryMetrics;
  budgetVersions: BudgetVersion[];
  departmentBudgets: DepartmentBudgetLine[];
  capexProjects: CapexProject[];
  forecastPeriods: ForecastPeriod[];
  scenarioModels: ScenarioModel[];
  varianceItems: VarianceItem[];
  costAllocationRules: CostAllocationRule[];
  profitabilitySegments: ProfitabilitySegment[];
  executiveKPIs: ExecutiveFinancialKPI[];
  aiInsights: AIFPAInsight[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/fpa${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'FP&A request failed');
  }

  return payload as T;
};

export const FPAClient = {
  async getSnapshot(): Promise<FPASnapshot> {
    return requestPayload<FPASnapshot>('/snapshot');
  },

  async updateBudgetStatus(
    budgetId: string,
    status: BudgetStatus,
    approverName?: string
  ): Promise<{ snapshot: FPASnapshot }> {
    return requestPayload(`/budgets/${encodeURIComponent(budgetId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, approverName }),
    });
  },

  async addCapexProject(project: CapexProject): Promise<{ project: CapexProject; snapshot: FPASnapshot }> {
    return requestPayload('/capex-projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },
};
