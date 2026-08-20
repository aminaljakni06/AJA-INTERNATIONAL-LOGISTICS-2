import {
  AITreasuryInsight,
  BankAccount,
  BankStatement,
  CashMovement,
  FinancialSettlement,
  FXExposure,
  FXRate,
  LiquidityForecastItem,
  PaymentBatch,
  PaymentBatchStatus,
  ReconMatchStatus,
  TreasuryDeal,
} from '../types/treasury';

export interface TreasurySummaryMetrics {
  totalCashSAR: number;
  activeDealsSAR: number;
  pendingPaymentsSAR: number;
  unreconciledSAR: number;
  bankAccountsCount: number;
  liquidityRatio: number;
}

export interface TreasurySnapshot {
  metrics: TreasurySummaryMetrics;
  bankAccounts: BankAccount[];
  cashMovements: CashMovement[];
  treasuryDeals: TreasuryDeal[];
  paymentBatches: PaymentBatch[];
  bankStatements: BankStatement[];
  liquidityForecasts: LiquidityForecastItem[];
  fxRates: FXRate[];
  fxExposures: FXExposure[];
  financialSettlements: FinancialSettlement[];
  aiInsights: AITreasuryInsight[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/treasury${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Treasury request failed');
  }

  return payload as T;
};

export const TreasuryClient = {
  async getSnapshot(): Promise<TreasurySnapshot> {
    return requestPayload<TreasurySnapshot>('/snapshot');
  },

  async updatePaymentBatchStatus(
    batchId: string,
    status: PaymentBatchStatus,
    approverName?: string
  ): Promise<{ snapshot: TreasurySnapshot }> {
    return requestPayload(`/payment-batches/${encodeURIComponent(batchId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, approverName }),
    });
  },

  async matchStatementLine(
    statementId: string,
    lineId: string,
    status: ReconMatchStatus,
    glRef?: string
  ): Promise<{ snapshot: TreasurySnapshot }> {
    return requestPayload(`/bank-statements/${encodeURIComponent(statementId)}/lines/${encodeURIComponent(lineId)}/match`, {
      method: 'PATCH',
      body: JSON.stringify({ status, glRef }),
    });
  },
};
