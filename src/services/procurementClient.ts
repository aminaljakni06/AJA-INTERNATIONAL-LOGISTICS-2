import {
  AIAPIntelligence,
  AIProcurementIntelligenceData,
  APAgingAnalytics,
  APPaymentRun,
  ContractComplianceMetric,
  ContractComplianceSummary,
  ExecutiveProcurementKPIs,
  ProcurementPolicy,
  ProcurementSummaryKPIs,
  PurchaseCycleAnalytics,
  PurchaseRequisition,
  PurchasingGroup,
  PurchasingOrganization,
  SpendCubeData,
  StrategicSourcingAnalytics,
  SupplierContract,
  SupplierInvoice,
  SupplierQuotation,
  SupplierReconciliationStatement,
  SupplierRiskAlert,
  SupplierScorecard,
  SourcingEvent,
  ThreeWayMatchResult,
  VendorCategoryType,
  VendorMaster,
} from '../types/procurement';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aja_auth_token') || localStorage.getItem('token');
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

  const response = await fetch(`/api/procurement${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Procurement request failed: ${response.status}`));
  }

  return payload as T;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return requestPayload<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export interface AIBidEvaluationRequest {
  sourcingEventTitle: string;
  category: VendorCategoryType | string;
  budgetSAR: number;
  quotationsList: SupplierQuotation[];
}

export interface SupplierEvaluationRequest {
  vendorName: string;
  category: VendorCategoryType | string;
  expectedSpendSAR: number;
  requirements: string;
}

export interface ThreeWayMatchRequest {
  invoiceTotalSAR: number;
  poTotalSAR: number;
  grnTotalSAR: number;
  toleranceAllowedPercent: number;
}

export const ProcurementClient = {
  getKPIs: async () => {
    const payload = await requestPayload<{ kpis: ProcurementSummaryKPIs }>('/kpis');
    return payload.kpis;
  },
  getVendors: async () => {
    const payload = await requestPayload<{ vendors: VendorMaster[] }>('/vendors');
    return payload.vendors;
  },
  saveVendor: async (vendor: VendorMaster) => {
    const payload = await post<{ vendor: VendorMaster }>('/vendors', vendor);
    return payload.vendor;
  },
  getPurchasingOrgsAndGroups: async () => {
    const payload = await requestPayload<{ orgs: PurchasingOrganization[]; groups: PurchasingGroup[] }>(
      '/purchasing-orgs'
    );
    return payload;
  },
  getSupplierContracts: async () => {
    const payload = await requestPayload<{ contracts: SupplierContract[] }>('/contracts');
    return payload.contracts;
  },
  getProcurementPolicies: async () => {
    const payload = await requestPayload<{ policies: ProcurementPolicy[] }>('/policies');
    return payload.policies;
  },
  getSupplierRiskAlerts: async () => {
    const payload = await requestPayload<{ alerts: SupplierRiskAlert[] }>('/risk-alerts');
    return payload.alerts;
  },
  getAIProcurementIntelligence: async () => {
    const payload = await requestPayload<{ intelligence: unknown }>('/ai-intelligence');
    return payload.intelligence;
  },
  getPurchaseRequisitions: async () => {
    const payload = await requestPayload<{ requisitions: PurchaseRequisition[] }>('/requisitions');
    return payload.requisitions;
  },
  savePurchaseRequisition: async (requisition: PurchaseRequisition) => {
    const payload = await post<{ requisition: PurchaseRequisition }>('/requisitions', requisition);
    return payload.requisition;
  },
  getSourcingEvents: async () => {
    const payload = await requestPayload<{ events: SourcingEvent[] }>('/sourcing-events');
    return payload.events;
  },
  saveSourcingEvent: async (event: SourcingEvent) => {
    const payload = await post<{ event: SourcingEvent }>('/sourcing-events', event);
    return payload.event;
  },
  getSupplierQuotations: async () => {
    const payload = await requestPayload<{ quotations: SupplierQuotation[] }>('/quotations');
    return payload.quotations;
  },
  getStrategicSourcingAnalytics: async () => {
    const payload = await requestPayload<{ analytics: StrategicSourcingAnalytics }>('/sourcing-analytics');
    return payload.analytics;
  },
  evaluateBids: async (request: AIBidEvaluationRequest) => {
    const payload = await post<{ result: unknown }>('/ai/evaluate-bids', request);
    return payload.result;
  },
  getSupplierInvoices: async () => {
    const payload = await requestPayload<{ invoices: SupplierInvoice[] }>('/invoices');
    return payload.invoices;
  },
  saveSupplierInvoice: async (invoice: SupplierInvoice) => {
    const payload = await post<{ invoice: SupplierInvoice }>('/invoices', invoice);
    return payload.invoice;
  },
  extractInvoice: async (rawInvoiceText: string) => {
    const payload = await post<{ extractedData: Record<string, any> }>('/invoices/ocr-extract', {
      rawInvoiceText,
    });
    return payload.extractedData;
  },
  runThreeWayMatch: async (request: ThreeWayMatchRequest) => {
    const payload = await post<{ matchResult: ThreeWayMatchResult }>('/invoices/3way-match', request);
    return payload.matchResult;
  },
  getPaymentRuns: async () => {
    const payload = await requestPayload<{ paymentRuns: APPaymentRun[] }>('/payment-runs');
    return payload.paymentRuns;
  },
  savePaymentRun: async (paymentRun: Partial<APPaymentRun>) => {
    const payload = await post<{ paymentRun: APPaymentRun }>('/payment-runs', paymentRun);
    return payload.paymentRun;
  },
  getReconciliations: async () => {
    const payload = await requestPayload<{ reconciliations: SupplierReconciliationStatement[] }>('/reconciliations');
    return payload.reconciliations;
  },
  getAPAgingAnalytics: async () => {
    const payload = await requestPayload<{ apAging: APAgingAnalytics }>('/ap-aging');
    return payload.apAging;
  },
  getAIAPIntelligence: async () => {
    const payload = await requestPayload<{ apIntel: AIAPIntelligence }>('/ai/ap-intelligence');
    return payload.apIntel;
  },
  getSpendCubeData: async () => {
    const payload = await requestPayload<{ spendCube: SpendCubeData }>('/analytics/spend-cube');
    return payload.spendCube;
  },
  getSupplierScorecards: async () => {
    const payload = await requestPayload<{ scorecards: SupplierScorecard[] }>('/analytics/supplier-scorecards');
    return payload.scorecards;
  },
  getContractComplianceMetrics: async () => {
    const payload = await requestPayload<{
      compliance: { summary: ContractComplianceSummary; metrics: ContractComplianceMetric[] };
    }>('/analytics/contract-compliance');
    return payload.compliance;
  },
  getPurchaseCycleAnalytics: async () => {
    const payload = await requestPayload<{ purchaseCycle: PurchaseCycleAnalytics }>('/analytics/purchase-cycle');
    return payload.purchaseCycle;
  },
  getExecutiveProcurementKPIs: async () => {
    const payload = await requestPayload<{ executiveKpis: ExecutiveProcurementKPIs }>('/analytics/executive-kpis');
    return payload.executiveKpis;
  },
  getAIProcurementIntelligenceData: async () => {
    const payload = await requestPayload<{ aiProcurement: AIProcurementIntelligenceData }>(
      '/analytics/ai-procurement-center'
    );
    return payload.aiProcurement;
  },
  evaluateSupplier: async (request: SupplierEvaluationRequest) => {
    const payload = await post<{ result: unknown }>('/ai/supplier-evaluate', request);
    return payload.result;
  },
};
