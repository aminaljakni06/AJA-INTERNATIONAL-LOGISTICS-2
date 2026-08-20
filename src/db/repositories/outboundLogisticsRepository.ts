import { getAdminFirestore } from '../../server/firebaseAdmin';
import {
  OutboundSalesOrder,
  PickingWave,
  PickTaskItem,
  PackingStationRecord,
  ShippingManifest,
  OutboundExceptionRecord
} from '../../types/outboundLogistics';

const SALES_ORDERS_COLLECTION = 'outbound_sales_orders';
const WAVES_COLLECTION = 'outbound_waves';
const PICK_TASKS_COLLECTION = 'outbound_pick_tasks';
const PACKING_COLLECTION = 'outbound_packing_stations';
const MANIFESTS_COLLECTION = 'outbound_manifests';
const EXCEPTIONS_COLLECTION = 'outbound_exceptions';

export const SEED_SALES_ORDERS: OutboundSalesOrder[] = [
  {
    id: 'SO-001',
    orderNumber: 'SO-2026-901',
    customerNameAr: 'مستشفى الملك فيصل التخصصي ومركز الأبحاث',
    customerCode: 'CUST-KFSH-01',
    destinationCityAr: 'الرياض - الحائر',
    orderPriority: 'CRITICAL_MEDICAL',
    status: 'PICKING',
    requestedDeliveryDate: '2026-08-05 16:00',
    totalItemsCount: 15,
    totalWeightKg: 125.0,
    totalVolumeCbm: 0.85,
    pickingStrategy: 'WAVE_PICKING',
    assignedWaveId: 'WAVE-2026-0801',
    createdAt: '2026-08-05 08:30',
  },
  {
    id: 'SO-002',
    orderNumber: 'SO-2026-902',
    customerNameAr: 'شركة سابك المتقدمة للصناعات',
    customerCode: 'CUST-SABIC-88',
    destinationCityAr: 'الجبيل الصناعية',
    orderPriority: 'EXPRESS',
    status: 'RELEASED_TO_WAVE',
    requestedDeliveryDate: '2026-08-06 10:00',
    totalItemsCount: 40,
    totalWeightKg: 2400.0,
    totalVolumeCbm: 12.0,
    pickingStrategy: 'BATCH_PICKING',
    assignedWaveId: 'WAVE-2026-0802',
    createdAt: '2026-08-05 09:00',
  },
  {
    id: 'SO-003',
    orderNumber: 'SO-2026-903',
    customerNameAr: 'متاجر الدانوب للتجزئة الغذائية',
    customerCode: 'CUST-DANUBE-03',
    destinationCityAr: 'جدة - حي السلامة',
    orderPriority: 'STANDARD',
    status: 'PACKING',
    requestedDeliveryDate: '2026-08-05 20:00',
    totalItemsCount: 120,
    totalWeightKg: 850.0,
    totalVolumeCbm: 4.5,
    pickingStrategy: 'ZONE_PICKING',
    assignedWaveId: 'WAVE-2026-0801',
    createdAt: '2026-08-05 07:15',
  },
];

export const SEED_WAVES: PickingWave[] = [
  {
    id: 'WAVE-001',
    waveNumber: 'WAVE-2026-0801',
    warehouseId: 'WH-RUH-01',
    zoneCode: 'Z-COLD-01',
    strategy: 'WAVE_PICKING',
    assignedPickerNameAr: 'فريق موجة التبريد / الكابتن ماجد العتيبي',
    totalOrdersCount: 2,
    totalPickTasksCount: 18,
    completedPickTasksCount: 14,
    status: 'IN_PROGRESS',
    pickToLightActive: true,
    voicePickingActive: true,
    startedAt: '2026-08-05 09:30',
  },
  {
    id: 'WAVE-002',
    waveNumber: 'WAVE-2026-0802',
    warehouseId: 'WH-DMM-02',
    zoneCode: 'Z-BULK-02',
    strategy: 'BATCH_PICKING',
    assignedPickerNameAr: 'فريق المواد الثقيلة / عبدالمجيد الغامدي',
    totalOrdersCount: 1,
    totalPickTasksCount: 10,
    completedPickTasksCount: 0,
    status: 'RELEASED',
    pickToLightActive: false,
    voicePickingActive: false,
  },
];

export const SEED_PICK_TASKS: PickTaskItem[] = [
  {
    id: 'PT-101',
    waveId: 'WAVE-2026-0801',
    orderNumber: 'SO-2026-901',
    skuCode: 'SKU-MED-9081',
    productNameAr: 'مستلزمات وأجهزة تبريد طبية عالية الدقة',
    sourceBinCode: 'A01-R02-S03-P02',
    targetCartonId: 'CTN-MED-001',
    quantityRequired: 10,
    quantityPicked: 10,
    status: 'PICKED',
    lightModuleCode: 'PTL-Z1-012',
    voiceCommandPromptAr: 'التقط 10 طرد من خانة أ-01 الرف 02',
  },
  {
    id: 'PT-102',
    waveId: 'WAVE-2026-0801',
    orderNumber: 'SO-2026-901',
    skuCode: 'SKU-MED-9082',
    productNameAr: 'حقن وأنسولين حفظ مبرد دقيق',
    sourceBinCode: 'A01-R02-S03-P05',
    targetCartonId: 'CTN-MED-001',
    quantityRequired: 5,
    quantityPicked: 4,
    status: 'SHORTAGE_EXCEPTION',
    lightModuleCode: 'PTL-Z1-015',
    voiceCommandPromptAr: 'التقط 5 وحدات أنسولين',
  },
];

export const SEED_PACKING_STATIONS: PackingStationRecord[] = [
  {
    id: 'PACK-001',
    stationNumber: 'PACK-STATION-01',
    packerNameAr: 'أخصائي التغليف / خالد الشهري',
    currentOrderNumber: 'SO-2026-903',
    cartonCode: 'CTN-FOOD-INSULATED-9',
    weightVerifiedKg: 14.8,
    recommendedBoxTypeAr: 'كرتون ثلاثي الطبقات مزود بعزل حراري وثريجيد جيل',
    checklistPassed: true,
    status: 'PACKING_IN_PROGRESS',
  },
];

export const SEED_MANIFESTS: ShippingManifest[] = [
  {
    id: 'MAN-001',
    manifestNumber: 'MAN-2026-8809',
    carrierNameAr: 'أسطول أجا للنقل السريع والمبرد',
    truckPlateNumber: 'أ ج ا - 5542',
    dockDoorNumber: 'DOCK-04',
    totalPackages: 12,
    totalWeightKg: 850.0,
    dispatchStatus: 'LOADING_VERIFIED',
    proofOfShipmentSignatureAr: 'توقيع السائق / عادل الحارثي - تم الفحص بالباركود',
  },
];

export const SEED_EXCEPTIONS: OutboundExceptionRecord[] = [
  {
    id: 'EXC-001',
    exceptionNumber: 'EXC-OUT-102',
    orderNumber: 'SO-2026-901',
    skuCode: 'SKU-MED-9082',
    exceptionType: 'MISSING_ITEM',
    reportedByAr: 'مشغّل التحضير / ماجد العتيبي',
    status: 'UNDER_REVIEW',
    timestamp: '2026-08-05 10:15',
    resolutionDetailsAr: 'جاري السحب من الخانة الاحتياطية B02-R01 وتعديل الكميات بالدفتر',
  },
];

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[OutboundLogisticsRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getOutboundSalesOrders(): Promise<OutboundSalesOrder[]> {
  return safeFetchCollection<OutboundSalesOrder>(SALES_ORDERS_COLLECTION, SEED_SALES_ORDERS);
}

export async function getPickingWaves(): Promise<PickingWave[]> {
  return safeFetchCollection<PickingWave>(WAVES_COLLECTION, SEED_WAVES);
}

export async function getPickTasks(): Promise<PickTaskItem[]> {
  return safeFetchCollection<PickTaskItem>(PICK_TASKS_COLLECTION, SEED_PICK_TASKS);
}

export async function getPackingStations(): Promise<PackingStationRecord[]> {
  return safeFetchCollection<PackingStationRecord>(PACKING_COLLECTION, SEED_PACKING_STATIONS);
}

export async function getShippingManifests(): Promise<ShippingManifest[]> {
  return safeFetchCollection<ShippingManifest>(MANIFESTS_COLLECTION, SEED_MANIFESTS);
}

export async function getOutboundExceptions(): Promise<OutboundExceptionRecord[]> {
  return safeFetchCollection<OutboundExceptionRecord>(EXCEPTIONS_COLLECTION, SEED_EXCEPTIONS);
}
