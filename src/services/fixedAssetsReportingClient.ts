import {
  AIFinanceAssetInsight,
  AssetStatus,
  ConsolidatedEntity,
  DepreciationEntry,
  FinancialStatementLine,
  FixedAsset,
  IFRS16Lease,
  ZATCAInvoiceRecord,
} from '../types/fixedAssetsReporting';

export interface FixedAssetsReportingSummaryMetrics {
  totalAssetCount: number;
  totalGrossCostSAR: number;
  totalAccumulatedDepreciationSAR: number;
  netBookValueSAR: number;
  totalLeaseLiabilitiesSAR: number;
  zatcaComplianceRatePercent: number;
}

export interface FixedAssetsReportingSnapshot {
  metrics: FixedAssetsReportingSummaryMetrics;
  assets: FixedAsset[];
  depreciationSchedule: DepreciationEntry[];
  leaseContracts: IFRS16Lease[];
  zatcaInvoices: ZATCAInvoiceRecord[];
  financialStatements: FinancialStatementLine[];
  consolidatedEntities: ConsolidatedEntity[];
  aiInsights: AIFinanceAssetInsight[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/fixed-assets-reporting${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Fixed assets reporting request failed');
  }

  return payload as T;
};

export const FixedAssetsReportingClient = {
  async getSnapshot(): Promise<FixedAssetsReportingSnapshot> {
    return requestPayload<FixedAssetsReportingSnapshot>('/snapshot');
  },

  async addAsset(asset: FixedAsset): Promise<{ asset: FixedAsset; snapshot: FixedAssetsReportingSnapshot }> {
    return requestPayload('/assets', {
      method: 'POST',
      body: JSON.stringify(asset),
    });
  },

  async updateAssetStatus(
    assetId: string,
    status: AssetStatus
  ): Promise<{ snapshot: FixedAssetsReportingSnapshot }> {
    return requestPayload(`/assets/${encodeURIComponent(assetId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
