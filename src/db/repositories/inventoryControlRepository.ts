import { getAdminFirestore } from '../../server/firebaseAdmin';
import {
  InventoryItemSKU,
  WarehouseBinStock,
  InventoryLedgerEntry,
  LotBatchRecord,
  SerialNumberRecord,
  ReplenishmentSuggestion,
  CycleCountRecord
} from '../../types/inventoryControl';

const SKUS_COLLECTION = 'inventory_skus';
const STOCK_COLLECTION = 'inventory_bin_stocks';
const LEDGER_COLLECTION = 'inventory_ledger';
const LOTS_COLLECTION = 'inventory_lots';
const SERIALS_COLLECTION = 'inventory_serials';
const REPLENISHMENT_COLLECTION = 'inventory_replenishments';
const CYCLE_COUNTS_COLLECTION = 'inventory_cycle_counts';

export const SEED_SKUS: InventoryItemSKU[] = [
  {
    id: 'SKU-001',
    skuCode: 'SKU-MED-9081',
    itemCode: 'ITEM-4001',
    barcode: '628100090812',
    rfidTagPrefix: 'RFID-HEX-90',
    nameAr: 'مستلزمات وأجهزة تبريد طبية عالية الدقة',
    nameEn: 'Precision Medical Cold Storage Equipment',
    categoryAr: 'مستلزمات طبية وأدوية',
    brand: 'AJA MedTech',
    unitOfMeasure: 'Box (طرد)',
    weightKg: 12.5,
    dimensionsCm: '40x30x25',
    abcClass: 'A',
    xyzClass: 'X',
    reorderPointMin: 300,
    maxStockLevel: 2000,
    safetyStockLevel: 250,
    unitCostSAR: 1450,
  },
  {
    id: 'SKU-002',
    skuCode: 'SKU-SABIC-4410',
    itemCode: 'ITEM-1020',
    barcode: '628200044105',
    rfidTagPrefix: 'RFID-HEX-44',
    nameAr: 'بوليمرات وبلاستيك صناعي عالي الكثافة (HDPE)',
    nameEn: 'High Density Polyethylene Polymers',
    categoryAr: 'بتروكيماويات ومواد خام',
    brand: 'SABIC Industrial',
    unitOfMeasure: 'Pallet (طبلية)',
    weightKg: 850.0,
    dimensionsCm: '120x100x150',
    abcClass: 'A',
    xyzClass: 'Y',
    reorderPointMin: 100,
    maxStockLevel: 800,
    safetyStockLevel: 80,
    unitCostSAR: 3200,
  },
  {
    id: 'SKU-003',
    skuCode: 'SKU-FOOD-2009',
    itemCode: 'ITEM-9901',
    barcode: '628300020098',
    rfidTagPrefix: 'RFID-HEX-20',
    nameAr: 'مواد غذائية مبردة وخضار طازجة مجمدة',
    nameEn: 'Chilled Food & Frozen Fresh Vegetables',
    categoryAr: 'أغذية ومشروبات مبردة',
    brand: 'AJA Fresh',
    unitOfMeasure: 'Carton (كرتون)',
    weightKg: 15.0,
    dimensionsCm: '50x35x30',
    abcClass: 'B',
    xyzClass: 'Z',
    reorderPointMin: 500,
    maxStockLevel: 3000,
    safetyStockLevel: 400,
    unitCostSAR: 180,
  },
];

export const SEED_BIN_STOCKS: WarehouseBinStock[] = [
  {
    id: 'STK-001',
    skuCode: 'SKU-MED-9081',
    warehouseId: 'WH-RUH-01',
    zoneCode: 'Z-COLD-01',
    binCode: 'A01-R02-S03-P02',
    availableQty: 1200,
    reservedQty: 150,
    allocatedQty: 100,
    damagedQty: 0,
    lotNumber: 'LOT-2026-MED01',
    expiryDate: '2027-12-31',
    lastCountedAt: '2026-08-01',
  },
  {
    id: 'STK-002',
    skuCode: 'SKU-SABIC-4410',
    warehouseId: 'WH-DMM-02',
    zoneCode: 'Z-BULK-02',
    binCode: 'B04-R01-S01-P01',
    availableQty: 450,
    reservedQty: 50,
    allocatedQty: 20,
    damagedQty: 0,
    lotNumber: 'LOT-2026-SABIC',
    expiryDate: '2029-06-30',
    lastCountedAt: '2026-08-02',
  },
];

export const SEED_LEDGER: InventoryLedgerEntry[] = [
  {
    id: 'TXN-8801',
    transactionNumber: 'TXN-2026-8801',
    timestamp: '2026-08-05 09:15',
    skuCode: 'SKU-MED-9081',
    warehouseId: 'WH-RUH-01',
    transactionType: 'GOODS_RECEIPT',
    quantityChanged: 1200,
    resultingBalance: 1200,
    referenceDocNumber: 'GRN-2026-401',
    operatorNameAr: 'مفتش الاستلام / المهندس أحمد الغامدي',
    notesAr: 'استلام جديد وتوثيق في خانة التبريد A01-R02-S03-P02.',
  },
];

export const SEED_LOTS: LotBatchRecord[] = [
  {
    id: 'LOT-101',
    lotNumber: 'LOT-2026-MED01',
    skuCode: 'SKU-MED-9081',
    supplierNameAr: 'شركة المورد المتقدم للصناعات الطبية (ألمانيا)',
    manufacturingDate: '2026-06-01',
    expiryDate: '2027-12-31',
    initialQuantity: 1200,
    currentQuantity: 1200,
    status: 'ACTIVE',
    temperatureRequirementAr: 'تخزين مبرد (+2°C إلى +8°C)',
  },
];

export const SEED_SERIALS: SerialNumberRecord[] = [
  {
    id: 'SN-001',
    serialNumber: 'SN-AJA-9920101',
    skuCode: 'SKU-MED-9081',
    warehouseId: 'WH-RUH-01',
    binCode: 'A01-R02-S03-P02',
    status: 'AVAILABLE',
    warrantyExpiryDate: '2028-08-01',
    ownerCustomerNameAr: 'مستشفى الملك فيصل التخصصي',
  },
];

export const SEED_REPLENISHMENTS: ReplenishmentSuggestion[] = [
  {
    id: 'REP-001',
    skuCode: 'SKU-FOOD-2009',
    productNameAr: 'مواد غذائية مبردة وخضار طازجة مجمدة',
    warehouseId: 'WH-JED-03',
    currentAvailableQty: 320,
    reorderPoint: 500,
    recommendedOrderQty: 1500,
    suggestedSupplierAr: 'مؤسسة المزارع الوطنية للإنتاج الغذائي',
    urgencyLevel: 'HIGH',
    estimatedLeadTimeDays: 2,
    status: 'PENDING_PO',
  },
];

export const SEED_CYCLE_COUNTS: CycleCountRecord[] = [
  {
    id: 'CC-001',
    countPlanNumber: 'CC-2026-004',
    warehouseId: 'WH-RUH-01',
    zoneCode: 'Z-COLD-01',
    scheduledDate: '2026-08-06',
    skuCode: 'SKU-MED-9081',
    binCode: 'A01-R02-S03-P02',
    systemQuantity: 1200,
    actualCountedQuantity: 1200,
    varianceQuantity: 0,
    status: 'VARIANCE_APPROVED',
    counterNameAr: 'أمين المستودع / فيصل المطيري',
  },
];

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[InventoryControlRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getInventorySKUs(): Promise<InventoryItemSKU[]> {
  return safeFetchCollection<InventoryItemSKU>(SKUS_COLLECTION, SEED_SKUS);
}

export async function getWarehouseBinStocks(): Promise<WarehouseBinStock[]> {
  return safeFetchCollection<WarehouseBinStock>(STOCK_COLLECTION, SEED_BIN_STOCKS);
}

export async function getInventoryLedger(): Promise<InventoryLedgerEntry[]> {
  return safeFetchCollection<InventoryLedgerEntry>(LEDGER_COLLECTION, SEED_LEDGER);
}

export async function getLotBatches(): Promise<LotBatchRecord[]> {
  return safeFetchCollection<LotBatchRecord>(LOTS_COLLECTION, SEED_LOTS);
}

export async function getSerialNumbers(): Promise<SerialNumberRecord[]> {
  return safeFetchCollection<SerialNumberRecord>(SERIALS_COLLECTION, SEED_SERIALS);
}

export async function getReplenishmentSuggestions(): Promise<ReplenishmentSuggestion[]> {
  return safeFetchCollection<ReplenishmentSuggestion>(REPLENISHMENT_COLLECTION, SEED_REPLENISHMENTS);
}

export async function getCycleCountRecords(): Promise<CycleCountRecord[]> {
  return safeFetchCollection<CycleCountRecord>(CYCLE_COUNTS_COLLECTION, SEED_CYCLE_COUNTS);
}
