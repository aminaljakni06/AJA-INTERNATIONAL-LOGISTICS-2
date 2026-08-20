import {
  AdvancedShippingNotice,
  AIInboundWarehouseResult,
  CrossDockRecord,
  DockAppointment,
  DirectedPutawayTask,
  GoodsReceiptNote,
  InboundAnalyticsKPIs,
  InboundContainer,
  InboundLabelJob,
  NCRRecord,
  OSDRecord,
  QualityInspectionRecord,
} from '../types/inboundWarehouse';

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/inbound-warehouse${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Inbound warehouse request failed');
  }

  return payload as T;
};

export const InboundWarehouseClient = {
  async getASNs(): Promise<AdvancedShippingNotice[]> {
    const payload = await requestPayload<{ asns: AdvancedShippingNotice[] }>('/asns');
    return payload.asns;
  },

  async getGoodsReceipts(): Promise<GoodsReceiptNote[]> {
    const payload = await requestPayload<{ grns: GoodsReceiptNote[] }>('/grns');
    return payload.grns;
  },

  async getQualityInspections(): Promise<QualityInspectionRecord[]> {
    const payload = await requestPayload<{ inspections: QualityInspectionRecord[] }>('/inspections');
    return payload.inspections;
  },

  async getPutawayTasks(): Promise<DirectedPutawayTask[]> {
    const payload = await requestPayload<{ putawayTasks: DirectedPutawayTask[] }>('/putaway');
    return payload.putawayTasks;
  },

  async getDockAppointments(): Promise<DockAppointment[]> {
    const payload = await requestPayload<{ docks: DockAppointment[] }>('/docks');
    return payload.docks;
  },

  async getOSDRecords(): Promise<OSDRecord[]> {
    const payload = await requestPayload<{ osds: OSDRecord[] }>('/osds');
    return payload.osds;
  },

  async getNCRRecords(): Promise<NCRRecord[]> {
    const payload = await requestPayload<{ ncrs: NCRRecord[] }>('/ncrs');
    return payload.ncrs;
  },

  async getInboundContainers(): Promise<InboundContainer[]> {
    const payload = await requestPayload<{ containers: InboundContainer[] }>('/containers');
    return payload.containers;
  },

  async getCrossDockRecords(): Promise<CrossDockRecord[]> {
    const payload = await requestPayload<{ crossDocks: CrossDockRecord[] }>('/crossdocks');
    return payload.crossDocks;
  },

  async getInboundLabelJobs(): Promise<InboundLabelJob[]> {
    const payload = await requestPayload<{ labels: InboundLabelJob[] }>('/labels');
    return payload.labels;
  },

  async getInboundAnalyticsKPIs(): Promise<InboundAnalyticsKPIs> {
    const payload = await requestPayload<{ kpis: InboundAnalyticsKPIs }>('/analytics');
    return payload.kpis;
  },

  async updateASNStatus(asnId: string, status: AdvancedShippingNotice['status']): Promise<void> {
    await requestPayload('/asns/status', {
      method: 'POST',
      body: JSON.stringify({ asnId, status }),
    });
  },

  async optimizeInbound(request: {
    asnNumber: string;
    supplierNameAr: string;
    totalExpectedPallets: number;
    temperatureControlled: boolean;
  }): Promise<AIInboundWarehouseResult> {
    const payload = await requestPayload<{ result: AIInboundWarehouseResult }>('/ai/inbound-optimize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return payload.result;
  },
};
