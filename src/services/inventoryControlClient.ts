import {
  AIInventoryOptimizationResult,
  CycleCountRecord,
  InventoryItemSKU,
  InventoryLedgerEntry,
  LotBatchRecord,
  ReplenishmentSuggestion,
  SerialNumberRecord,
  WarehouseBinStock,
} from '../types/inventoryControl';

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/inventory-control${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Inventory control request failed');
  }

  return payload as T;
};

export const InventoryControlClient = {
  async getInventorySKUs(): Promise<InventoryItemSKU[]> {
    const payload = await requestPayload<{ skus: InventoryItemSKU[] }>('/skus');
    return payload.skus;
  },

  async getWarehouseBinStocks(): Promise<WarehouseBinStock[]> {
    const payload = await requestPayload<{ stocks: WarehouseBinStock[] }>('/stocks');
    return payload.stocks;
  },

  async getInventoryLedger(): Promise<InventoryLedgerEntry[]> {
    const payload = await requestPayload<{ ledger: InventoryLedgerEntry[] }>('/ledger');
    return payload.ledger;
  },

  async getLotBatches(): Promise<LotBatchRecord[]> {
    const payload = await requestPayload<{ lots: LotBatchRecord[] }>('/lots');
    return payload.lots;
  },

  async getSerialNumbers(): Promise<SerialNumberRecord[]> {
    const payload = await requestPayload<{ serials: SerialNumberRecord[] }>('/serials');
    return payload.serials;
  },

  async getReplenishmentSuggestions(): Promise<ReplenishmentSuggestion[]> {
    const payload = await requestPayload<{ replenishments: ReplenishmentSuggestion[] }>('/replenishments');
    return payload.replenishments;
  },

  async getCycleCountRecords(): Promise<CycleCountRecord[]> {
    const payload = await requestPayload<{ cycleCounts: CycleCountRecord[] }>('/cycle-counts');
    return payload.cycleCounts;
  },

  async optimizeInventory(request: {
    skuCode: string;
    nameAr: string;
    currentAvailableQty: number;
    reorderPointMin: number;
    categoryAr: string;
  }): Promise<AIInventoryOptimizationResult> {
    const payload = await requestPayload<{ result: AIInventoryOptimizationResult }>('/ai/inventory-optimize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return payload.result;
  },
};
