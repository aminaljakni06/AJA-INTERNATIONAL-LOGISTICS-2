import { getAdminFirestore } from '../../server/firebaseAdmin';
import {
  WarehouseLocation,
  WarehouseZone,
  WarehouseBin,
  WarehouseCapacityKPIs,
  WarehouseBuilding,
  WarehouseFloor,
  WarehouseAisle,
  WarehouseRack,
  WarehouseShelf,
  StorageRule,
  WarehouseShift,
  AIWarehouseInsight
} from '../../types/warehouse';

const WAREHOUSES_COLLECTION = 'warehouses';
const WAREHOUSE_ZONES_COLLECTION = 'warehouse_zones';
const WAREHOUSE_BINS_COLLECTION = 'warehouse_bins';

export const SEED_WAREHOUSES: WarehouseLocation[] = [
  {
    id: 'WH-RUH-01',
    code: 'WH-RUH-CENTRAL',
    nameAr: 'مركز التوزيع واللوجستيات المركزي - الرياض',
    nameEn: 'Riyadh Central Logistics DC',
    type: 'DISTRIBUTION_CENTER',
    city: 'الرياض',
    region: 'المنطقة الوسطى',
    addressAr: 'طريق الخرج، الحي اللوجستي، الرياض',
    managerName: 'مهندس / فهد العتيبي',
    managerPhone: '+966 50 112 3344',
    status: 'ACTIVE',
    totalCapacityPallets: 25000,
    occupiedCapacityPallets: 19800,
    utilizationPercent: 79.2,
    temperatureControlled: true,
    rfidEnabled: true,
    workingHours: '24/7 (ثلاث ورديات)',
  },
  {
    id: 'WH-DMM-02',
    code: 'WH-DMM-BONDED',
    nameAr: 'مستودع الميناء الجمركي - الدمام (Bonded Hub)',
    nameEn: 'Dammam Port Bonded Warehouse',
    type: 'BONDED_WAREHOUSE',
    city: 'الدمام',
    region: 'المنطقة الشرقية',
    addressAr: 'ميناء الملك عبد العزيز، المنطقة الحرة 2',
    managerName: 'أستاذ / خالد الدوسري',
    managerPhone: '+966 53 887 9900',
    status: 'ACTIVE',
    totalCapacityPallets: 18000,
    occupiedCapacityPallets: 14200,
    utilizationPercent: 78.8,
    temperatureControlled: true,
    rfidEnabled: true,
    workingHours: '06:00 - 22:00',
  },
  {
    id: 'WH-JED-03',
    code: 'WH-JED-CROSSDOCK',
    nameAr: 'مركز التجميع والتفريغ السريع - جدة (Cross Dock)',
    nameEn: 'Jeddah Maritime Cross Dock Center',
    type: 'CROSS_DOCK',
    city: 'جدة',
    region: 'المنطقة الغربية',
    addressAr: 'المنطقة الصناعية الثالثة، طريق الخمرة',
    managerName: 'مهندس / عمر الغامدي',
    managerPhone: '+966 55 443 2211',
    status: 'ACTIVE',
    totalCapacityPallets: 12000,
    occupiedCapacityPallets: 8900,
    utilizationPercent: 74.1,
    temperatureControlled: false,
    rfidEnabled: true,
    workingHours: '24/7',
  },
];

export const SEED_ZONES: WarehouseZone[] = [
  {
    id: 'ZN-RUH-COLD-A',
    warehouseId: 'WH-RUH-01',
    code: 'Z-COLD-01',
    nameAr: 'منطقة التبريد المركزي للأدوية والأغذية (-20°C إلى +4°C)',
    zoneType: 'COLD_ZONE',
    temperatureMinCelsius: -20,
    temperatureMaxCelsius: 4,
    totalBinsCount: 1200,
    occupiedBinsCount: 980,
    utilizationPercent: 81.6,
    hasHazmatPermit: false,
    securityLevel: 'HIGH',
  },
  {
    id: 'ZN-RUH-PICK-B',
    warehouseId: 'WH-RUH-01',
    code: 'Z-PICK-02',
    nameAr: 'منطقة التجهيز والانتقاء السريع (Fast-Moving Picking Zone)',
    zoneType: 'PICKING',
    totalBinsCount: 2500,
    occupiedBinsCount: 2100,
    utilizationPercent: 84.0,
    hasHazmatPermit: false,
    securityLevel: 'STANDARD',
  },
  {
    id: 'ZN-DMM-HAZ-C',
    warehouseId: 'WH-DMM-02',
    code: 'Z-HAZMAT-01',
    nameAr: 'منطقة المواد الكيميائية والخطرة (Hazmat Zone)',
    zoneType: 'HAZMAT',
    totalBinsCount: 600,
    occupiedBinsCount: 420,
    utilizationPercent: 70.0,
    hasHazmatPermit: true,
    securityLevel: 'RESTRICTED',
  },
];

export const SEED_BINS: WarehouseBin[] = [
  {
    id: 'BIN-1001',
    zoneId: 'ZN-RUH-COLD-A',
    binCode: 'A01-R02-S03-P01',
    barcode: 'BC-AJA-RUH-8801',
    qrCode: 'QR-AJA-RUH-8801',
    rfidTagId: 'RFID-HEX-9011-A',
    aisle: '01',
    rack: '02',
    shelf: '03',
    position: '01',
    maxWeightKg: 1500,
    currentWeightKg: 1200,
    maxVolumeCbm: 2.5,
    currentVolumeCbm: 2.1,
    status: 'OCCUPIED',
    currentSkuCode: 'SKU-MED-9081',
    currentProductNameAr: 'مستلزمات وأنسولين طبية مبردة',
    quantityInside: 450,
  },
  {
    id: 'BIN-1002',
    zoneId: 'ZN-RUH-COLD-A',
    binCode: 'A01-R02-S03-P02',
    barcode: 'BC-AJA-RUH-8802',
    qrCode: 'QR-AJA-RUH-8802',
    rfidTagId: 'RFID-HEX-9012-B',
    aisle: '01',
    rack: '02',
    shelf: '03',
    position: '02',
    maxWeightKg: 1500,
    currentWeightKg: 0,
    maxVolumeCbm: 2.5,
    currentVolumeCbm: 0,
    status: 'AVAILABLE',
  },
  {
    id: 'BIN-1003',
    zoneId: 'ZN-RUH-PICK-B',
    binCode: 'B04-R01-S02-P01',
    barcode: 'BC-AJA-RUH-8901',
    qrCode: 'QR-AJA-RUH-8901',
    rfidTagId: 'RFID-HEX-9013-C',
    aisle: '04',
    rack: '01',
    shelf: '02',
    position: '01',
    maxWeightKg: 1000,
    currentWeightKg: 850,
    maxVolumeCbm: 2.0,
    currentVolumeCbm: 1.8,
    status: 'OCCUPIED',
    currentSkuCode: 'SKU-AUTO-1092',
    currentProductNameAr: 'قطع غيار الشاحنات والمحركات',
    quantityInside: 120,
  },
];

export const SEED_BUILDINGS: WarehouseBuilding[] = [
  { id: 'BLD-RUH-01', warehouseId: 'WH-RUH-01', buildingCode: 'BLD-A', buildingNameEn: 'Main Cold & Ambient Terminal Building', buildingNameAr: 'مبنى المحطة الرئيسية للتبريد والتخزين الجاف', totalFloors: 2 },
  { id: 'BLD-DMM-01', warehouseId: 'WH-DMM-02', buildingCode: 'BLD-B', buildingNameEn: 'Port Customs Bonded Facility', buildingNameAr: 'مبنى الميناء الجمركي المستورد', totalFloors: 1 }
];

export const SEED_FLOORS: WarehouseFloor[] = [
  { id: 'FLR-RUH-G', buildingId: 'BLD-RUH-01', floorNumber: 0, floorCode: 'FLR-G', floorNameAr: 'الطابق الأرضي - منصات الاستلام والتفريغ', totalZones: 3 },
  { id: 'FLR-RUH-1', buildingId: 'BLD-RUH-01', floorNumber: 1, floorCode: 'FLR-1', floorNameAr: 'الطابق الأول - التخزين العالي والتجهيز السريع', totalZones: 2 }
];

export const SEED_AISLES: WarehouseAisle[] = [
  { id: 'AIS-01', zoneId: 'ZN-RUH-COLD-A', aisleCode: 'AISLE-01', aisleNameAr: 'الممر 01 - أدوية وأنسولين', totalRacks: 8 },
  { id: 'AIS-02', zoneId: 'ZN-RUH-PICK-B', aisleCode: 'AISLE-04', aisleNameAr: 'الممر 04 - قطع غيار سريعة الحركة', totalRacks: 12 }
];

export const SEED_RACKS: WarehouseRack[] = [
  { id: 'RCK-101', aisleId: 'AIS-01', rackCode: 'RACK-02', totalShelves: 5, maxWeightCapacityKg: 8000, currentWeightKg: 5200, status: 'ACTIVE' },
  { id: 'RCK-102', aisleId: 'AIS-02', rackCode: 'RACK-01', totalShelves: 4, maxWeightCapacityKg: 6000, currentWeightKg: 4800, status: 'ACTIVE' }
];

export const SEED_SHELVES: WarehouseShelf[] = [
  { id: 'SHF-201', rackId: 'RCK-101', shelfCode: 'SHELF-03', totalBins: 4, maxWeightKg: 1500 },
  { id: 'SHF-202', rackId: 'RCK-102', shelfCode: 'SHELF-02', totalBins: 4, maxWeightKg: 1000 }
];

export const SEED_STORAGE_RULES: StorageRule[] = [
  { id: 'SR-1', warehouseId: 'WH-RUH-01', zoneId: 'ZN-RUH-COLD-A', ruleNameEn: 'Pharma FEFO First Expire First Out Rule', ruleNameAr: 'قاعدة الأدوية: المنتهي أولاً يخرج أولاً (FEFO)', strategy: 'FEFO', minTempCelsius: -20, maxTempCelsius: 4, securityLevel: 'HIGH', active: true },
  { id: 'SR-2', warehouseId: 'WH-RUH-01', zoneId: 'ZN-RUH-PICK-B', ruleNameEn: 'Fast Movers FIFO Rule', ruleNameAr: 'قاعدة البضائع السريعة: الوارد أولاً يخرج أولاً (FIFO)', strategy: 'FIFO', securityLevel: 'STANDARD', active: true },
  { id: 'SR-3', warehouseId: 'WH-DMM-02', zoneId: 'ZN-DMM-HAZ-C', ruleNameEn: 'Hazmat Batch Quarantine Rule', ruleNameAr: 'قاعدة المواد الخطرة وتتبع التشغيلات (Batch Control)', strategy: 'HAZMAT', hazmatLevel: 'CLASS-3-FLAMMABLE', securityLevel: 'RESTRICTED', active: true }
];

export const SEED_SHIFTS: WarehouseShift[] = [
  { id: 'SHF-1', warehouseId: 'WH-RUH-01', shiftNameEn: 'Morning Operations Shift', shiftNameAr: 'الوردية الصباحية - الاستلام والشحن', startTime: '06:00', endTime: '14:00', supervisorName: 'أحمد القحطاني', assignedWorkersCount: 42, status: 'OPEN' },
  { id: 'SHF-2', warehouseId: 'WH-RUH-01', shiftNameEn: 'Evening Picking & Sorting Shift', shiftNameAr: 'الوردية المسائية - الانتقاء والفرز', startTime: '14:00', endTime: '22:00', supervisorName: 'محمد الدوسري', assignedWorkersCount: 38, status: 'OPEN' },
  { id: 'SHF-3', warehouseId: 'WH-RUH-01', shiftNameEn: 'Night Automated Maintenance Window', shiftNameAr: 'فترة الصيانة الليلية والأتمتة', startTime: '22:00', endTime: '06:00', supervisorName: 'سعيد الغامدي', assignedWorkersCount: 12, status: 'MAINTENANCE_WINDOW' }
];

export const SEED_AI_INSIGHTS: AIWarehouseInsight[] = [
  { id: 'AI-WH-1', warehouseId: 'WH-RUH-01', category: 'STORAGE_OPTIMIZATION', titleEn: 'Relocate Cold Chain SKU-MED-9081 to Bin A01-R02-S03', titleAr: 'إعادة توجيه الصنف الطبي المبرد إلى الخانة A01-R02-S03 لتقليل هدر الطاقة بـ 14%', descriptionEn: 'IoT thermal mapping indicates optimal cold flow stability in Aisle 01 Rack 02.', descriptionAr: 'المسح الحراري بـ IoT أظهر استقرار درجة التبريد في الممر 01 الرف 02.', confidencePercent: 96, recommendedActionEn: 'Approve AI Putaway Directive', recommendedActionAr: 'اعتماد أمر التخزين الذكي', impactScore: '+14% Energy Savings' },
  { id: 'AI-WH-2', warehouseId: 'WH-DMM-02', category: 'CONGESTION_PREDICTION', titleEn: 'Aisle 04 Bottleneck Warning at Gate Alpha', titleAr: 'تنبيه ازدحام ممر 04 ببوابة الاستلام عند الساعة 11:00 صباحاً', descriptionEn: 'Predicted 3 heavy freight trucks arrival will bottleneck picking route.', descriptionAr: 'توقع وصول 3 شاحنات ثقيلة قد يعيق حركة رافعات الشوكة بالممر.', confidencePercent: 92, recommendedActionEn: 'Reroute Forklifts to Gate Bravo', recommendedActionAr: 'تحويل رافعات الشوكة للبوابة ب', impactScore: '-25 min Delay Prevented' }
];

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[WarehouseRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getWarehouses(): Promise<WarehouseLocation[]> {
  return safeFetchCollection<WarehouseLocation>(WAREHOUSES_COLLECTION, SEED_WAREHOUSES);
}

export async function getWarehouseZones(warehouseId?: string): Promise<WarehouseZone[]> {
  const zones = await safeFetchCollection<WarehouseZone>(WAREHOUSE_ZONES_COLLECTION, SEED_ZONES);
  if (warehouseId) {
    return zones.filter(z => z.warehouseId === warehouseId);
  }
  return zones;
}

export async function getWarehouseBins(zoneId?: string): Promise<WarehouseBin[]> {
  const bins = await safeFetchCollection<WarehouseBin>(WAREHOUSE_BINS_COLLECTION, SEED_BINS);
  if (zoneId) {
    return bins.filter(b => b.zoneId === zoneId);
  }
  return bins;
}

export async function getWarehouseBuildings(warehouseId?: string): Promise<WarehouseBuilding[]> {
  const data = await safeFetchCollection<WarehouseBuilding>('warehouse_buildings', SEED_BUILDINGS);
  return warehouseId ? data.filter(b => b.warehouseId === warehouseId) : data;
}

export async function getWarehouseFloors(buildingId?: string): Promise<WarehouseFloor[]> {
  const data = await safeFetchCollection<WarehouseFloor>('warehouse_floors', SEED_FLOORS);
  return buildingId ? data.filter(f => f.buildingId === buildingId) : data;
}

export async function getWarehouseAisles(zoneId?: string): Promise<WarehouseAisle[]> {
  const data = await safeFetchCollection<WarehouseAisle>('warehouse_aisles', SEED_AISLES);
  return zoneId ? data.filter(a => a.zoneId === zoneId) : data;
}

export async function getWarehouseRacks(aisleId?: string): Promise<WarehouseRack[]> {
  const data = await safeFetchCollection<WarehouseRack>('warehouse_racks', SEED_RACKS);
  return aisleId ? data.filter(r => r.aisleId === aisleId) : data;
}

export async function getWarehouseShelves(rackId?: string): Promise<WarehouseShelf[]> {
  const data = await safeFetchCollection<WarehouseShelf>('warehouse_shelves', SEED_SHELVES);
  return rackId ? data.filter(s => s.rackId === rackId) : data;
}

export async function getStorageRules(warehouseId?: string): Promise<StorageRule[]> {
  const data = await safeFetchCollection<StorageRule>('warehouse_storage_rules', SEED_STORAGE_RULES);
  return warehouseId ? data.filter(r => r.warehouseId === warehouseId) : data;
}

export async function getWarehouseShifts(warehouseId?: string): Promise<WarehouseShift[]> {
  const data = await safeFetchCollection<WarehouseShift>('warehouse_shifts', SEED_SHIFTS);
  return warehouseId ? data.filter(s => s.warehouseId === warehouseId) : data;
}

export async function getAIWarehouseInsights(warehouseId?: string): Promise<AIWarehouseInsight[]> {
  const data = await safeFetchCollection<AIWarehouseInsight>('warehouse_ai_insights', SEED_AI_INSIGHTS);
  return warehouseId ? data.filter(i => i.warehouseId === warehouseId) : data;
}

export async function getWarehouseCapacityKPIs(): Promise<WarehouseCapacityKPIs> {
  const warehouses = await getWarehouses();
  const totalPalletPositions = warehouses.reduce((acc, w) => acc + w.totalCapacityPallets, 0);
  const occupiedPalletPositions = warehouses.reduce((acc, w) => acc + w.occupiedCapacityPallets, 0);
  const availablePalletPositions = totalPalletPositions - occupiedPalletPositions;
  const overallUtilizationPercent = totalPalletPositions > 0 ? Number(((occupiedPalletPositions / totalPalletPositions) * 100).toFixed(1)) : 0;

  return {
    totalPalletPositions,
    occupiedPalletPositions,
    availablePalletPositions,
    overallUtilizationPercent,
    activeWarehousesCount: warehouses.length,
    coldStorageUtilizationPercent: 81.6,
    activeBinsCount: 4300,
    rfidScannedRatePercent: 99.2,
  };
}
