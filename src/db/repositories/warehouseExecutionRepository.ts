import {
  PutawayRule,
  DynamicSlottingProfile,
  LocationConstraintValidation,
  WarehouseTask,
  WarehouseResource,
  ReplenishmentTask,
  WarehouseException,
  WESPerformanceKPIs,
  AIWESOptimizationResult
} from '../../types/warehouseExecution';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const mockPutawayRules: PutawayRule[] = [
  {
    id: 'pwr-1',
    ruleCode: 'PWR-COLD-01',
    ruleNameAr: 'قاعدة إيداع المنتجات الطبية المبردة المباشرة (Cold Storage FEFO)',
    ruleNameEn: 'Medical Cold Storage FEFO Directed Putaway',
    warehouseId: 'WH-RUH-01',
    putawayType: 'COLD_STORAGE',
    rotationStrategy: 'FEFO',
    priorityOrder: 1,
    minTempCelsius: 2,
    maxTempCelsius: 8,
    targetZoneCode: 'ZN-COLD-A',
    active: true
  },
  {
    id: 'pwr-2',
    ruleCode: 'PWR-HAZMAT-02',
    ruleNameAr: 'قاعدة إيداع المواد الكيميائية والخطرة (Hazmat Class 3)',
    ruleNameEn: 'Hazmat Class 3 Isolated Putaway',
    warehouseId: 'WH-RUH-01',
    putawayType: 'HAZMAT',
    rotationStrategy: 'FIFO',
    priorityOrder: 2,
    hazmatClass: 'FLAMMABLE_CLASS_3',
    targetZoneCode: 'ZN-HAZMAT-C',
    active: true
  },
  {
    id: 'pwr-3',
    ruleCode: 'PWR-FAST-03',
    ruleNameAr: 'قاعدة إيداع البضائع سريعة الحركة بالقرب من أرصفة الشحن (Fast-Moving A-Class)',
    ruleNameEn: 'Fast-Moving A-Class Proximity Putaway',
    warehouseId: 'WH-RUH-01',
    putawayType: 'FAST_MOVING',
    rotationStrategy: 'FIFO',
    priorityOrder: 3,
    targetZoneCode: 'ZN-FAST-B',
    active: true
  },
  {
    id: 'pwr-4',
    ruleCode: 'PWR-CROSSDOCK-04',
    ruleNameAr: 'قاعدة الشحن العابر المباشر دون تخزين (Cross-Dock Express)',
    ruleNameEn: 'Direct Dock-to-Dock Cross Docking',
    warehouseId: 'WH-JED-02',
    putawayType: 'CROSS_DOCK',
    rotationStrategy: 'FIFO',
    priorityOrder: 4,
    targetZoneCode: 'ZN-RECEIVING-STAGE',
    active: true
  }
];

const mockSlottingProfiles: DynamicSlottingProfile[] = [
  {
    id: 'slot-1',
    skuCode: 'SKU-PHARM-2201',
    productNameAr: 'مصل لقاحات مبردة عالية الحساسية',
    velocityClass: 'FAST_A',
    demandRatePerDay: 450,
    seasonalPeakMonth: 'الربع الثالث (الصيف)',
    familyGroupCode: 'PHARMA_COLD',
    currentBinCode: 'B-Z04-R10-S01',
    recommendedBinCode: 'B-A01-R01-S01',
    travelDistanceScoreMeters: 45,
    reslottingRecommended: true,
    reslottingReasonAr: 'الصنف ذو معدل سحب عالي جداً (Class A) ويوجد حالياً في ممر بعيد عن منطقة الشحن السريع.'
  },
  {
    id: 'slot-2',
    skuCode: 'SKU-IND-8812',
    productNameAr: 'قطع غيار هيدروليكية ثقيلة',
    velocityClass: 'MEDIUM_B',
    demandRatePerDay: 85,
    familyGroupCode: 'HEAVY_IND',
    currentBinCode: 'B-B02-R03-S02',
    recommendedBinCode: 'B-B02-R03-S01',
    travelDistanceScoreMeters: 120,
    reslottingRecommended: false
  },
  {
    id: 'slot-3',
    skuCode: 'SKU-MED-9081',
    productNameAr: 'أجهزة قياس نبض وتخطيط قلب طبية',
    velocityClass: 'SLOW_C',
    demandRatePerDay: 12,
    familyGroupCode: 'HIGH_VALUE_TECH',
    currentBinCode: 'B-C05-R08-S04',
    recommendedBinCode: 'B-C05-R08-S04',
    travelDistanceScoreMeters: 210,
    reslottingRecommended: false
  }
];

const mockWarehouseTasks: WarehouseTask[] = [
  {
    id: 'tsk-101',
    taskNumber: 'WES-TSK-2026-101',
    taskType: 'PUTAWAY',
    priority: 'EMERGENCY',
    status: 'IN_PROGRESS',
    warehouseId: 'WH-RUH-01',
    sourceLocationCode: 'DOCK-RECEIVING-02',
    destinationLocationCode: 'B-A01-R02-S03',
    skuCode: 'SKU-PHARM-2201',
    productNameAr: 'مصل لقاحات مبردة عالية الحساسية',
    quantity: 120,
    unitOfMeasure: 'BOX',
    assignedResourceId: 'res-1',
    assignedResourceNameAr: 'م. فهد القحطاني',
    assignedEquipmentCode: 'FLT-RUH-01 (رافعية مبردة)',
    estimatedTravelDistanceMeters: 140,
    createdAt: '2026-08-05 08:30',
    startedAt: '2026-08-05 08:35'
  },
  {
    id: 'tsk-102',
    taskNumber: 'WES-TSK-2026-102',
    taskType: 'REPLENISHMENT',
    priority: 'URGENT',
    status: 'OPEN',
    warehouseId: 'WH-RUH-01',
    sourceLocationCode: 'BULK-ZONE-B08',
    destinationLocationCode: 'PICK-A01-R01-S01',
    skuCode: 'SKU-ECOM-1044',
    productNameAr: 'طرد مستلزمات حماية وقائية',
    quantity: 500,
    unitOfMeasure: 'UNIT',
    estimatedTravelDistanceMeters: 280,
    createdAt: '2026-08-05 09:00'
  },
  {
    id: 'tsk-103',
    taskNumber: 'WES-TSK-2026-103',
    taskType: 'MOVE',
    priority: 'NORMAL',
    status: 'ASSIGNED',
    warehouseId: 'WH-RUH-01',
    sourceLocationCode: 'B-Z04-R10-S01',
    destinationLocationCode: 'B-A01-R01-S01',
    skuCode: 'SKU-PHARM-2201',
    productNameAr: 'مصل لقاحات مبردة عالية الحساسية',
    quantity: 40,
    unitOfMeasure: 'PALLET',
    assignedResourceId: 'res-2',
    assignedResourceNameAr: 'سعد العتيبي (مشغل Reach Truck)',
    assignedEquipmentCode: 'RT-RUH-04',
    estimatedTravelDistanceMeters: 195,
    createdAt: '2026-08-05 09:15'
  },
  {
    id: 'tsk-104',
    taskNumber: 'WES-TSK-2026-104',
    taskType: 'CYCLE_COUNT',
    priority: 'LOW',
    status: 'COMPLETED',
    warehouseId: 'WH-JED-02',
    sourceLocationCode: 'B-C05-R08-S04',
    destinationLocationCode: 'B-C05-R08-S04',
    skuCode: 'SKU-MED-9081',
    productNameAr: 'أجهزة قياس نبض وتخطيط قلب طبية',
    quantity: 25,
    unitOfMeasure: 'UNIT',
    assignedResourceId: 'res-3',
    assignedResourceNameAr: 'علي الشهري',
    estimatedTravelDistanceMeters: 50,
    createdAt: '2026-08-05 07:00',
    startedAt: '2026-08-05 07:10',
    completedAt: '2026-08-05 07:25'
  }
];

const mockResources: WarehouseResource[] = [
  {
    id: 'res-1',
    resourceCode: 'OPERATOR-RUH-101',
    resourceNameAr: 'المهندس فهد القحطاني',
    equipmentType: 'FORKLIFT',
    warehouseId: 'WH-RUH-01',
    assignedZoneCode: 'ZN-COLD-A',
    shiftNameAr: 'الوردية الصباحية المتقدمة',
    activeTasksCount: 1,
    completedTasksTodayCount: 14,
    status: 'BUSY_EXECUTING'
  },
  {
    id: 'res-2',
    resourceCode: 'OPERATOR-RUH-102',
    resourceNameAr: 'سعد العتيبي',
    equipmentType: 'REACH_TRUCK',
    warehouseId: 'WH-RUH-01',
    assignedZoneCode: 'ZN-FAST-B',
    shiftNameAr: 'الوردية الصباحية المتقدمة',
    activeTasksCount: 1,
    completedTasksTodayCount: 18,
    status: 'AVAILABLE'
  },
  {
    id: 'res-3',
    resourceCode: 'AMR-ROBOT-88',
    resourceNameAr: 'روبوت نقل الطبالي الذكي AJA AutoMover X1',
    equipmentType: 'AMR_PALLET_MOVER',
    warehouseId: 'WH-RUH-01',
    assignedZoneCode: 'ZN-HAZMAT-C',
    shiftNameAr: 'تشغيل آلي 24/7',
    activeTasksCount: 0,
    completedTasksTodayCount: 32,
    status: 'AVAILABLE'
  }
];

const mockReplenishments: ReplenishmentTask[] = [
  {
    id: 'rep-1',
    replenishmentNumber: 'REP-2026-801',
    type: 'FORWARD_PICKING',
    skuCode: 'SKU-ECOM-1044',
    productNameAr: 'طرد مستلزمات حماية وقائية',
    pickingBinCode: 'PICK-A01-R01-S01',
    bulkReserveBinCode: 'BULK-ZONE-B08',
    minThresholdQuantity: 100,
    maxTargetQuantity: 600,
    currentQuantityInPickingBin: 80,
    requestedReplenishQuantity: 520,
    status: 'DISPATCHED'
  },
  {
    id: 'rep-2',
    replenishmentNumber: 'REP-2026-802',
    type: 'EMERGENCY',
    skuCode: 'SKU-PHARM-2201',
    productNameAr: 'مصل لقاحات مبردة عالية الحساسية',
    pickingBinCode: 'PICK-COLD-A02',
    bulkReserveBinCode: 'BULK-COLD-RESERVE-04',
    minThresholdQuantity: 50,
    maxTargetQuantity: 200,
    currentQuantityInPickingBin: 10,
    requestedReplenishQuantity: 190,
    status: 'IN_PROGRESS'
  }
];

const mockExceptions: WarehouseException[] = [
  {
    id: 'exp-1',
    exceptionNumber: 'EXP-2026-401',
    exceptionType: 'LOCATION_FULL',
    warehouseId: 'WH-RUH-01',
    locationCode: 'B-A01-R02-S03',
    taskId: 'WES-TSK-2026-101',
    skuCode: 'SKU-PHARM-2201',
    descriptionAr: 'الرف المحدد ممتلئ بالطبالي نتيجة تعديل طارئ في أحجام العبوات.',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    reportedAt: '2026-08-05 08:40'
  },
  {
    id: 'exp-2',
    exceptionNumber: 'EXP-2026-402',
    exceptionType: 'TEMP_ALERT',
    warehouseId: 'WH-RUH-01',
    locationCode: 'ZN-COLD-A',
    descriptionAr: 'ارتفاع مؤقت بـ 1.2 درجة مئوية قرب مستشعر IoT رقم 04 أثناء تحميل الشاحنة.',
    severity: 'WARNING',
    status: 'RESOLVED',
    reportedAt: '2026-08-05 06:15',
    resolvedAt: '2026-08-05 06:30',
    resolutionNotesAr: 'تم إغلاق البوابة الهوائية تلقائياً وعادت البرودة للحد المثالي 4°C.'
  }
];

const mockKPIs: WESPerformanceKPIs = {
  avgPutawayTimeMins: 11.4,
  totalTravelDistanceKmToday: 142.8,
  workerProductivityTasksPerHour: 22.5,
  equipmentUtilizationPercent: 91.2,
  taskCompletionRatePercent: 98.6,
  replenishmentEfficiencyPercent: 96.4,
  hourlyWarehouseThroughputPallets: 185,
  openExceptionsCount: 1
};

export const getPutawayRules = async (): Promise<PutawayRule[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('wes_putaway_rules').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PutawayRule));
    }
  } catch (e) {
    console.warn('Firestore fetch failed for putaway rules, returning fallback data:', e);
  }
  return mockPutawayRules;
};

export const getSlottingProfiles = async (): Promise<DynamicSlottingProfile[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('wes_slotting_profiles').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DynamicSlottingProfile));
    }
  } catch (e) {
    console.warn('Firestore fetch failed for slotting profiles, returning fallback data:', e);
  }
  return mockSlottingProfiles;
};

export const getWarehouseTasks = async (): Promise<WarehouseTask[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('wes_warehouse_tasks').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WarehouseTask));
    }
  } catch (e) {
    console.warn('Firestore fetch failed for warehouse tasks, returning fallback data:', e);
  }
  return mockWarehouseTasks;
};

export const getWarehouseResources = async (): Promise<WarehouseResource[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('wes_warehouse_resources').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WarehouseResource));
    }
  } catch (e) {
    console.warn('Firestore fetch failed for warehouse resources, returning fallback data:', e);
  }
  return mockResources;
};

export const getReplenishmentTasks = async (): Promise<ReplenishmentTask[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('wes_replenishments').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReplenishmentTask));
    }
  } catch (e) {
    console.warn('Firestore fetch failed for replenishments, returning fallback data:', e);
  }
  return mockReplenishments;
};

export const getWarehouseExceptions = async (): Promise<WarehouseException[]> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('wes_exceptions').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WarehouseException));
    }
  } catch (e) {
    console.warn('Firestore fetch failed for exceptions, returning fallback data:', e);
  }
  return mockExceptions;
};

export const getWESPerformanceKPIs = async (): Promise<WESPerformanceKPIs> => {
  try {
    const querySnapshot = await getAdminFirestore().collection('wes_kpis').get();
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as WESPerformanceKPIs;
    }
  } catch (e) {
    console.warn('Firestore fetch failed for WES KPIs, returning fallback data:', e);
  }
  return mockKPIs;
};
