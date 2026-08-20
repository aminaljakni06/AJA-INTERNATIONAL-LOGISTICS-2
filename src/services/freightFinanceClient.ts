import {
  AIFreightFinanceResult,
  AuditStatus,
  FreightInvoiceAuditRecord,
  FreightLandedCostCalculation,
  ProfitabilityByRoute,
  ShipmentCostBreakdown,
} from '../types/freightFinance';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aja_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const error = (payload as { error?: string | { message?: string } }).error;
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
  }

  return fallback;
}

async function requestPayload<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...init?.headers,
  };

  const response = await fetch(`/api/freight-finance${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Freight Finance request failed: ${response.status}`));
  }

  return payload as T;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return requestPayload<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export interface FreightFinanceAnalysisRequest {
  shipmentId: string;
  trackingNumber: string;
  totalActualCostSAR: number;
  totalBilledRevenueSAR: number;
  marginPercent: number;
}

export const FreightFinanceClient = {
  getShipmentCostBreakdowns: async () => {
    const payload = await requestPayload<{ costBreakdowns: ShipmentCostBreakdown[] }>('/cost-breakdowns');
    return payload.costBreakdowns;
  },
  getFreightInvoiceAudits: async () => {
    const payload = await requestPayload<{ invoiceAudits: FreightInvoiceAuditRecord[] }>('/invoice-audits');
    return payload.invoiceAudits;
  },
  getFreightLandedCosts: async () => {
    const payload = await requestPayload<{ landedCosts: FreightLandedCostCalculation[] }>('/landed-costs');
    return payload.landedCosts;
  },
  getProfitabilityRoutes: async () => {
    const payload = await requestPayload<{ routes: ProfitabilityByRoute[] }>('/profitability-routes');
    return payload.routes;
  },
  updateInvoiceAuditStatus: async (
    invoiceId: string,
    auditStatus: Extract<AuditStatus, 'APPROVED' | 'DISPUTED'>,
    discrepancyReasonAr?: string
  ) => {
    await post<{ message: string }>('/invoice-audits/update-status', {
      invoiceId,
      auditStatus,
      discrepancyReasonAr,
    });
  },
  analyzeProfitability: async (request: FreightFinanceAnalysisRequest) => {
    const payload = await post<{ result: AIFreightFinanceResult }>('/ai/analyze-profitability', request);
    return payload.result;
  },
};
