import { getAdminFirestore } from '../../server/firebaseAdmin';
import {
  AdvancedShippingNotice,
  GoodsReceiptNote,
  QualityInspectionRecord,
  DirectedPutawayTask,
  DockAppointment,
  OSDRecord,
  NCRRecord,
  InboundContainer,
  CrossDockRecord,
  InboundLabelJob,
  InboundAnalyticsKPIs
} from '../../types/inboundWarehouse';

const ASNS_COLLECTION = 'warehouse_asns';
const GRNS_COLLECTION = 'warehouse_grns';
const INSPECTIONS_COLLECTION = 'warehouse_inspections';
const PUTAWAY_COLLECTION = 'warehouse_putaway_tasks';
const DOCKS_COLLECTION = 'warehouse_dock_appointments';
const OSD_COLLECTION = 'warehouse_osd_records';
const NCR_COLLECTION = 'warehouse_ncr_records';
const CONTAINERS_COLLECTION = 'warehouse_inbound_containers';
const CROSSDOCK_COLLECTION = 'warehouse_crossdock_records';
const LABELS_COLLECTION = 'warehouse_inbound_labels';

export const SEED_ASNS: AdvancedShippingNotice[] = [
  {
    id: 'ASN-9001',
    asnNumber: 'ASN-2026-901',
    purchaseOrderNumber: 'PO-AJA-9081',
    supplierNameAr: 'شركة المورد المتقدم للصناعات الطبية (ألمانيا)',
    carrierNameAr: 'شركة أجا للخدمات اللوجستية والمبردة (AJA Freight)',
    expectedArrivalDate: '2026-08-05 08:30',
    warehouseId: 'WH-RUH-01',
    dockNumber: 'Dock Gate Alpha-01',
    totalExpectedPackages: 1200,
    totalExpectedPallets: 40,
    status: 'ARRIVED_AT_DOCK',
    driverName: 'السائق / إبراهيم القحطاني',
    truckPlateNumber: 'أ ج ا 9921',
    temperatureControlled: true,
    targetTemperatureCelsius: 4,
  },
  {
    id: 'ASN-9002',
    asnNumber: 'ASN-2026-902',
    purchaseOrderNumber: 'PO-SABIC-4410',
    supplierNameAr: 'الشركة السعودية للصناعات الأساسية (سابك)',
    carrierNameAr: 'شركة المجدوعي للوجستيات (3PL)',
    expectedArrivalDate: '2026-08-05 11:00',
    warehouseId: 'WH-DMM-02',
    dockNumber: 'Dock Gate Bravo-03',
    totalExpectedPackages: 800,
    totalExpectedPallets: 25,
    status: 'SCHEDULED',
    driverName: 'السائق / محمد الشمري',
    truckPlateNumber: 'ب ص ك 4410',
    temperatureControlled: false,
  },
  {
    id: 'ASN-9003',
    asnNumber: 'ASN-2026-903',
    purchaseOrderNumber: 'PO-NAHDI-1092',
    supplierNameAr: 'مجموعة النهدي الطبية - المستودع الرئيسي',
    carrierNameAr: 'أسطول أجا للأسطول المبرد',
    expectedArrivalDate: '2026-08-04 14:00',
    warehouseId: 'WH-RUH-01',
    dockNumber: 'Dock Gate Alpha-02',
    totalExpectedPackages: 1500,
    totalExpectedPallets: 50,
    status: 'COMPLETED',
    driverName: 'السائق / سعد العتيبي',
    truckPlateNumber: 'ر س م 7720',
    temperatureControlled: true,
    targetTemperatureCelsius: 2,
  },
];

export const SEED_GRNS: GoodsReceiptNote[] = [
  {
    id: 'GRN-4001',
    grnNumber: 'GRN-2026-401',
    asnNumber: 'ASN-2026-901',
    warehouseId: 'WH-RUH-01',
    dockNumber: 'Dock Gate Alpha-01',
    supplierNameAr: 'شركة المورد المتقدم للصناعات الطبية (ألمانيا)',
    receivedDate: '2026-08-05 08:45',
    expectedQuantity: 1200,
    receivedQuantity: 1200,
    varianceQuantity: 0,
    inspectionRequired: true,
    receivedByInspector: 'مفتش الجودة / المهندس أحمد الغامدي',
    status: 'PENDING_INSPECTION',
    notesAr: 'تم الفحص الظاهري للحاوية المبردة وتسجيل الحرارة عند +3.8°C.',
  },
  {
    id: 'GRN-4002',
    grnNumber: 'GRN-2026-402',
    asnNumber: 'ASN-2026-903',
    warehouseId: 'WH-RUH-01',
    dockNumber: 'Dock Gate Alpha-02',
    supplierNameAr: 'مجموعة النهدي الطبية - المستودع الرئيسي',
    receivedDate: '2026-08-04 14:15',
    expectedQuantity: 1500,
    receivedQuantity: 1500,
    varianceQuantity: 0,
    inspectionRequired: true,
    receivedByInspector: 'مفتش الجودة / خالد الدوسري',
    status: 'APPROVED',
    notesAr: 'استلام كامل بدون تلفيات مع توثيق الأرقام التسلسلية.',
  },
];

export const SEED_INSPECTIONS: QualityInspectionRecord[] = [
  {
    id: 'INSP-8001',
    grnNumber: 'GRN-2026-401',
    skuCode: 'SKU-MED-9081',
    productNameAr: 'مستلزمات وأجهزة تبريد طبية عالية الدقة',
    sampleQuantityInspected: 100,
    damagedQuantityFound: 0,
    inspectionResult: 'PASSED',
    inspectorName: 'المهندس أحمد الغامدي',
    inspectionTimestamp: '2026-08-05 09:10',
    photoAttachmentUrls: [],
  },
];

export const SEED_PUTAWAY_TASKS: DirectedPutawayTask[] = [
  {
    id: 'PUT-8801',
    taskNumber: 'PUT-2026-8801',
    grnNumber: 'GRN-2026-401',
    skuCode: 'SKU-MED-9081',
    productNameAr: 'مستلزمات وأجهزة تبريد طبية عالية الدقة',
    palletBarcode: 'PALLET-AJA-8801',
    rfidTagId: 'RFID-HEX-9011-A',
    recommendedZoneCode: 'Z-COLD-01 (منطقة التبريد المركزي)',
    recommendedBinCode: 'A01-R02-S03-P02',
    assignedOperatorName: 'سائق الرافعية / سلطان العنزي',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-05 09:20',
  },
];

export const SEED_DOCK_APPOINTMENTS: DockAppointment[] = [
  {
    id: 'DOCK-101',
    dockNumber: 'Dock Gate Alpha-01',
    warehouseId: 'WH-RUH-01',
    supplierNameAr: 'شركة المورد المتقدم للصناعات الطبية (ألمانيا)',
    carrierNameAr: 'AJA Freight Fleet',
    scheduledTimeSlot: '2026-08-05 08:00 - 09:30',
    truckType: 'شاحنة مبردة 24 قدم',
    status: 'OCCUPIED',
  },
  {
    id: 'DOCK-102',
    dockNumber: 'Dock Gate Alpha-02',
    warehouseId: 'WH-RUH-01',
    supplierNameAr: 'مجموعة النهدي الطبية',
    carrierNameAr: 'AJA Freight Fleet',
    scheduledTimeSlot: '2026-08-05 10:00 - 11:30',
    truckType: 'مقطورة تبريد 40 قدم',
    status: 'RESERVED',
  },
];

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[InboundWarehouseRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getASNs(): Promise<AdvancedShippingNotice[]> {
  return safeFetchCollection<AdvancedShippingNotice>(ASNS_COLLECTION, SEED_ASNS);
}

export async function getGoodsReceipts(): Promise<GoodsReceiptNote[]> {
  return safeFetchCollection<GoodsReceiptNote>(GRNS_COLLECTION, SEED_GRNS);
}

export async function getQualityInspections(): Promise<QualityInspectionRecord[]> {
  return safeFetchCollection<QualityInspectionRecord>(INSPECTIONS_COLLECTION, SEED_INSPECTIONS);
}

export async function getPutawayTasks(): Promise<DirectedPutawayTask[]> {
  return safeFetchCollection<DirectedPutawayTask>(PUTAWAY_COLLECTION, SEED_PUTAWAY_TASKS);
}

export async function getDockAppointments(): Promise<DockAppointment[]> {
  return safeFetchCollection<DockAppointment>(DOCKS_COLLECTION, SEED_DOCK_APPOINTMENTS);
}

export const SEED_OSD_RECORDS: OSDRecord[] = [
  {
    id: 'OSD-101',
    osdNumber: 'OSD-2026-101',
    grnNumber: 'GRN-2026-401',
    supplierNameAr: 'شركة المورد المتقدم للصناعات الطبية (ألمانيا)',
    overQuantity: 0,
    shortQuantity: 5,
    damagedQuantity: 5,
    missingItemsCount: 0,
    replacementRequested: true,
    incidentDescriptionAr: 'وجود 5 طرود بها أضرار كرتونية بسبب اهتزاز الشحن الجوي وكسر في 5 أمبولات.',
    claimStatus: 'CLAIM_FILED',
    reportedAt: '2026-08-05 09:00',
    photoUrls: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80']
  }
];

export const SEED_NCR_RECORDS: NCRRecord[] = [
  {
    id: 'NCR-301',
    ncrNumber: 'NCR-2026-301',
    grnNumber: 'GRN-2026-401',
    supplierNameAr: 'شركة المورد المتقدم للصناعات الطبية (ألمانيا)',
    skuCode: 'SKU-PHARM-2201',
    productNameAr: 'مصل لقاحات مبردة شديدة الحساسية',
    rootCauseAr: 'ضعف التثبيت الداخلي في الحاوية أثناء النقل الجوي الدولي.',
    correctiveActionAr: 'استبدال الشحنة المتضررة وإرسال طرد بديل عبر أساطيل أجا المبردة السريعة.',
    preventiveActionAr: 'إلزام المورد باستخدام فوم مقوى وسدادات تمتص الصدمات لكل شحنة مستقبليّة.',
    status: 'CAPA_PENDING',
    createdBy: 'المهندس أحمد الغامدي',
    createdAt: '2026-08-05 09:30'
  }
];

export const SEED_CONTAINERS: InboundContainer[] = [
  {
    id: 'CONT-101',
    containerNumber: 'MSKU-882019-1',
    sealNumber: 'SEAL-AJA-99120',
    containerType: '40FT_REEFER',
    status: 'UNLOADING',
    unloadProgressPercent: 75,
    expectedPallets: 40,
    unloadedPallets: 30,
    temperatureCelsius: 3.8
  },
  {
    id: 'CONT-102',
    containerNumber: 'CMAU-441092-8',
    sealNumber: 'SEAL-SABIC-0091',
    containerType: '40FT_HC',
    status: 'ARRIVED',
    unloadProgressPercent: 0,
    expectedPallets: 25,
    unloadedPallets: 0
  }
];

export const SEED_CROSSDOCK: CrossDockRecord[] = [
  {
    id: 'XD-001',
    crossDockNumber: 'XD-2026-001',
    inboundAsnNumber: 'ASN-2026-901',
    outboundShipmentNumber: 'SHP-2026-A882',
    skuCode: 'SKU-MED-9081',
    productNameAr: 'مستلزمات وأجهزة تبريد طبية عالية الدقة',
    transferQuantity: 100,
    fromDockNumber: 'Dock Gate Alpha-01',
    toOutboundDockNumber: 'Outbound Bay 04',
    status: 'TRANSFERRING'
  }
];

export const SEED_LABELS: InboundLabelJob[] = [
  {
    id: 'LBL-01',
    jobId: 'LBL-JOB-901',
    labelType: 'PALLET',
    targetCode: 'PALLET-AJA-8801',
    skuOrPalletCode: 'SKU-MED-9081',
    format: 'RFID_EPC_GEN2',
    quantityToPrint: 40,
    status: 'COMPLETED',
    printedAt: '2026-08-05 08:50',
    printedBy: 'أحمد الغامدي'
  }
];

export const SEED_INBOUND_ANALYTICS: InboundAnalyticsKPIs = {
  totalAsnsThisMonth: 142,
  avgUnloadingTimeMins: 38,
  dockUtilizationPercent: 88.5,
  receivingAccuracyPercent: 99.4,
  supplierOnTimePercent: 96.2,
  qualityPassRatePercent: 98.1,
  osdIncidentRatePercent: 1.2,
  receivingLeadTimeHours: 1.8
};

export async function getOSDRecords(): Promise<OSDRecord[]> {
  return safeFetchCollection<OSDRecord>(OSD_COLLECTION, SEED_OSD_RECORDS);
}

export async function getNCRRecords(): Promise<NCRRecord[]> {
  return safeFetchCollection<NCRRecord>(NCR_COLLECTION, SEED_NCR_RECORDS);
}

export async function getInboundContainers(): Promise<InboundContainer[]> {
  return safeFetchCollection<InboundContainer>(CONTAINERS_COLLECTION, SEED_CONTAINERS);
}

export async function getCrossDockRecords(): Promise<CrossDockRecord[]> {
  return safeFetchCollection<CrossDockRecord>(CROSSDOCK_COLLECTION, SEED_CROSSDOCK);
}

export async function getInboundLabelJobs(): Promise<InboundLabelJob[]> {
  return safeFetchCollection<InboundLabelJob>(LABELS_COLLECTION, SEED_LABELS);
}

export async function getInboundAnalyticsKPIs(): Promise<InboundAnalyticsKPIs> {
  return SEED_INBOUND_ANALYTICS;
}

export async function updateASNStatus(
  asnId: string,
  status: AdvancedShippingNotice['status']
): Promise<boolean> {
  try {
    await getAdminFirestore().collection(ASNS_COLLECTION).doc(asnId).update({ status });
    return true;
  } catch (err) {
    console.warn('[InboundWarehouseRepo] ASN update fallback:', err);
    const found = SEED_ASNS.find(a => a.id === asnId);
    if (found) found.status = status;
    return true;
  }
}
