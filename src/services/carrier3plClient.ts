import {
  CarrierBid,
  CarrierPartnerProfile,
  EdiIntegrationSpec,
  FreightRateSheet,
  FreightTender,
} from '../types/carrier3pl';

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

async function requestPayload<T>(path: string): Promise<T> {
  const response = await fetch(`/api/carrier3pl${path}`, { headers: getAuthHeaders() });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Carrier 3PL request failed: ${response.status}`));
  }

  return payload as T;
}

export const Carrier3PLClient = {
  getCarrierPartners: async () => {
    const payload = await requestPayload<{ partners: CarrierPartnerProfile[] }>('/partners');
    return payload.partners;
  },
  getFreightRateSheets: async () => {
    const payload = await requestPayload<{ rates: FreightRateSheet[] }>('/rates');
    return payload.rates;
  },
  getFreightTendersAndBids: async () => {
    const payload = await requestPayload<{ tenders: FreightTender[]; bids: CarrierBid[] }>('/tenders');
    return payload;
  },
  getEdiSpecs: async () => {
    const payload = await requestPayload<{ ediSpecs: EdiIntegrationSpec[] }>('/edi');
    return payload.ediSpecs;
  },
};
