import {
  StockMovement,
  InventoryReservation,
  InventoryAllocation,
  InventoryHold,
  StockTransfer,
  InventoryAdjustment,
  ATPMetrics,
  InventoryTimelineEvent,
  AIInventoryOptimizationResult
} from '../../types/inventoryOperations';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const mockMovements: StockMovement[] = [
  {
    id: 'MOV-1',
    movementNumber: 'MOV-2026-901',
    type: 'GOODS_RECEIPT',
    skuCode: 'SKU-MED-9901',
    productNameAr: 'لقاحات حيوية مضادة للفيروسات (تبريد 2-8°م)',
    quantity: 500,
    unitOfMeasure: 'عبوة',
    sourceWarehouseId: 'WH-INBOUND-01',
    sourceBinCode: 'RECEIVING-DOCK-01',
    destinationWarehouseId: 'WH-RUH-01',
    destinationBinCode: 'COLD-ZONE-A01',
    referenceDocumentNumber: 'PO-2026-8801',
    performedByUserId: 'USR-201',
    performedByUserNameAr: 'م. أحمد الشمري',
    timestamp: '2026-08-05T08:30:00Z',
    status: 'COMPLETED'
  },
  {
    id: 'MOV-2',
    movementNumber: 'MOV-2026-902',
    type: 'BIN_TRANSFER',
    skuCode: 'SKU-ELEC-4402',
    productNameAr: 'شاشات عرض ذكية متقدمة للتحكم',
    quantity: 120,
    unitOfMeasure: 'قطعة',
    sourceWarehouseId: 'WH-RUH-01',
    sourceBinCode: 'STAGE-01',
    destinationWarehouseId: 'WH-RUH-01',
    destinationBinCode: 'SHELF-B03-R02',
    referenceDocumentNumber: 'WES-TSK-102',
    performedByUserId: 'USR-205',
    performedByUserNameAr: 'خالد العنزي',
    timestamp: '2026-08-05T09:15:00Z',
    status: 'COMPLETED'
  }
];

const mockReservations: InventoryReservation[] = [
  {
    id: 'RSV-1',
    reservationNumber: 'RSV-2026-101',
    reservationType: 'PROJECT',
    skuCode: 'SKU-MED-9901',
    productNameAr: 'لقاحات حيوية مضادة للفيروسات (تبريد 2-8°م)',
    warehouseId: 'WH-RUH-01',
    binCode: 'COLD-ZONE-A01',
    reservedQuantity: 150,
    customerOrProjectNameAr: 'مشروع المستشفيات التخصصية بالرياض',
    priorityOrder: 1,
    expiresAt: '2026-08-15T23:59:59Z',
    status: 'ACTIVE',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'RSV-2',
    reservationNumber: 'RSV-2026-102',
    reservationType: 'ORDER',
    skuCode: 'SKU-ELEC-4402',
    productNameAr: 'شاشات عرض ذكية متقدمة للتحكم',
    warehouseId: 'WH-RUH-01',
    binCode: 'SHELF-B03-R02',
    reservedQuantity: 40,
    customerOrProjectNameAr: 'شركة الحلول المتقدمة للتكنولوجيا',
    priorityOrder: 2,
    expiresAt: '2026-08-10T23:59:59Z',
    status: 'ACTIVE',
    createdAt: '2026-08-03T11:20:00Z'
  }
];

const mockAllocations: InventoryAllocation[] = [
  {
    id: 'ALLOC-1',
    allocationNumber: 'ALLOC-2026-401',
    orderNumber: 'SO-2026-9921',
    skuCode: 'SKU-MED-9901',
    productNameAr: 'لقاحات حيوية مضادة للفيروسات (تبريد 2-8°م)',
    warehouseId: 'WH-RUH-01',
    allocatedBinCode: 'COLD-ZONE-A01',
    batchNumber: 'BATCH-VAC-2026-08',
    allocatedQuantity: 100,
    strategyUsed: 'FEFO',
    status: 'ALLOCATED',
    allocatedAt: '2026-08-05T07:45:00Z'
  }
];

const mockHolds: InventoryHold[] = [
  {
    id: 'HLD-1',
    holdNumber: 'HLD-2026-055',
    reason: 'QUALITY',
    skuCode: 'SKU-CHEM-1102',
    productNameAr: 'محلول معقم كيميائي حساس',
    warehouseId: 'WH-RUH-01',
    binCode: 'HAZ-BIN-09',
    quantityOnHold: 25,
    blockedByUserNameAr: 'د. سارة المنصور (مراقب الجودة)',
    notesAr: 'فحص عينات عشوائية للتأكد من المكونات النشطة',
    status: 'ACTIVE_HOLD',
    placedAt: '2026-08-04T14:00:00Z'
  }
];

const mockTransfers: StockTransfer[] = [
  {
    id: 'TRF-1',
    transferNumber: 'TRF-2026-301',
    transferType: 'WAREHOUSE_TO_WAREHOUSE',
    skuCode: 'SKU-MED-9901',
    productNameAr: 'لقاحات حيوية مضادة للفيروسات (تبريد 2-8°م)',
    sourceWarehouseId: 'WH-RUH-01',
    sourceWarehouseNameAr: 'مستودع الرياض المركزي Main',
    sourceBinCode: 'COLD-ZONE-A01',
    destinationWarehouseId: 'WH-JED-02',
    destinationWarehouseNameAr: 'مستودع جدة الإقليمي',
    destinationBinCode: 'COLD-BAY-02',
    quantity: 200,
    carrierDriverNameAr: 'أسطول عجا للتبريد - سائق: محمد القحطاني',
    estimatedArrivalAt: '2026-08-06T18:00:00Z',
    status: 'DISPATCHED_IN_TRANSIT',
    initiatedAt: '2026-08-05T06:00:00Z'
  }
];

const mockAdjustments: InventoryAdjustment[] = [
  {
    id: 'ADJ-1',
    adjustmentNumber: 'ADJ-2026-701',
    adjustmentType: 'CYCLE_COUNT',
    skuCode: 'SKU-ELEC-4402',
    productNameAr: 'شاشات عرض ذكية متقدمة للتحكم',
    warehouseId: 'WH-RUH-01',
    binCode: 'SHELF-B03-R02',
    previousQuantity: 118,
    adjustedQuantity: 120,
    differenceQuantity: 2,
    financialValueImpactSar: 3400,
    reasonAr: 'عثور على وحدتين إضافيتين أثناء عد الدورة الدوري',
    approvedByManagerAr: 'سعود المقرن (مدير المستودعات)',
    status: 'APPROVED',
    adjustedAt: '2026-08-04T16:30:00Z'
  }
];

const mockATPMetrics: ATPMetrics = {
  skuCode: 'SKU-MED-9901',
  productNameAr: 'لقاحات حيوية مضادة للفيروسات (تبريد 2-8°م)',
  warehouseId: 'WH-RUH-01',
  onHandQuantity: 500,
  reservedQuantity: 150,
  allocatedQuantity: 100,
  holdQuantity: 0,
  incomingPoQuantity: 300,
  availableToPromiseQuantity: 550, // 500 - 150 - 100 - 0 + 300
  futureAvailabilityDate: '2026-08-08T00:00:00Z'
};

const mockTimelineEvents: InventoryTimelineEvent[] = [
  {
    id: 'TL-1',
    timestamp: '2026-08-05T08:30:00Z',
    eventType: 'MOVEMENT',
    skuCode: 'SKU-MED-9901',
    descriptionAr: 'استلام شحنة واردة +500 وحدة بجدول PO-2026-8801',
    operatorNameAr: 'م. أحمد الشمري',
    quantityChange: 500,
    resultOnHand: 500
  },
  {
    id: 'TL-2',
    timestamp: '2026-08-05T07:45:00Z',
    eventType: 'ALLOCATION',
    skuCode: 'SKU-MED-9901',
    descriptionAr: 'تخصيص 100 وحدة لأمر البيع SO-2026-9921 بمبدأ FEFO',
    operatorNameAr: 'نظام WMS الأوتوماتيكي',
    quantityChange: -100,
    resultOnHand: 500
  }
];

export const getStockMovements = async (): Promise<StockMovement[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('inventory_movements').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovement));
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to mock for movements:', err);
  }
  return mockMovements;
};

export const getInventoryReservations = async (): Promise<InventoryReservation[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('inventory_reservations').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryReservation));
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to mock for reservations:', err);
  }
  return mockReservations;
};

export const getInventoryAllocations = async (): Promise<InventoryAllocation[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('inventory_allocations').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryAllocation));
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to mock for allocations:', err);
  }
  return mockAllocations;
};

export const getInventoryHolds = async (): Promise<InventoryHold[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('inventory_holds').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryHold));
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to mock for holds:', err);
  }
  return mockHolds;
};

export const getStockTransfers = async (): Promise<StockTransfer[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('inventory_transfers').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockTransfer));
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to mock for transfers:', err);
  }
  return mockTransfers;
};

export const getInventoryAdjustments = async (): Promise<InventoryAdjustment[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('inventory_adjustments').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryAdjustment));
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to mock for adjustments:', err);
  }
  return mockAdjustments;
};

export const getATPMetrics = async (skuCode: string): Promise<ATPMetrics> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('inventory_atp').get();
    if (!querySnapshot.empty) {
      const match = querySnapshot.docs.find(doc => doc.data().skuCode === skuCode);
      if (match) return match.data() as ATPMetrics;
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to mock for ATP:', err);
  }
  return mockATPMetrics;
};

export const getInventoryTimeline = async (skuCode: string): Promise<InventoryTimelineEvent[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('inventory_timeline').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryTimelineEvent));
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to mock for timeline:', err);
  }
  return mockTimelineEvents;
};
