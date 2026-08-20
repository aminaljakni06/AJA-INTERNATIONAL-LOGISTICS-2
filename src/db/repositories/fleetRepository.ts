import {
  Vehicle,
  DriverProfile,
  FuelLog,
  TireLog,
  MaintenanceRecord,
  VehicleInspectionReport,
  FleetIncident,
  FleetKpiSummary
} from '../../types/fleet';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const VEHICLES_COLLECTION = 'fleet_vehicles';
const DRIVERS_COLLECTION = 'fleet_drivers';

export const SEED_VEHICLES: Vehicle[] = [
  {
    id: 'VEH-101',
    fleetCode: 'AJA-FL-8001',
    licensePlate: 'أ ج ا - 5582',
    vin: '9AJA9837190283112',
    vehicleType: '40FT_REEFER_TRAILER',
    manufacturer: 'Volvo Trucks',
    model: 'FH16 550 Refrigerator',
    year: 2024,
    branchLocation: 'الدمام - المركز المبرد الرئيسي',
    status: 'IN_TRANSIT',
    currentDriverId: 'DRV-201',
    currentDriverName: 'الكابتن / سعد القحطاني',
    mileageKm: 142500,
    fuelLevelPercent: 78,
    engineTempCelsius: 88,
    lastGpsLocation: {
      latitude: 25.38,
      longitude: 49.58,
      locationName: 'طريق الدمام الرياض السريع - محطة الهفوف',
      speedKmH: 84,
      headingDegree: 240,
      timestamp: new Date().toISOString(),
    },
    nextMaintenanceKm: 150000,
    insuranceExpiryDate: '2027-01-15',
    inspectionExpiryDate: '2026-11-20',
    reeferTargetTemp: '+4°C',
    reeferCurrentTemp: '+4.2°C',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'VEH-102',
    fleetCode: 'AJA-FL-8002',
    licensePlate: 'أ ج ا - 3310',
    vin: '9AJA3310190283441',
    vehicleType: '8TON_DRY_TRUCK',
    manufacturer: 'Isuzu',
    model: 'Forward FVR 8-Ton',
    year: 2023,
    branchLocation: 'جدة - الوادي اللوجستي',
    status: 'AVAILABLE',
    currentDriverId: 'DRV-202',
    currentDriverName: 'محمد الشهري',
    mileageKm: 98200,
    fuelLevelPercent: 92,
    engineTempCelsius: 82,
    lastGpsLocation: {
      latitude: 21.48,
      longitude: 39.30,
      locationName: 'مستودع أجا - جدة الوادي',
      speedKmH: 0,
      headingDegree: 90,
      timestamp: new Date().toISOString(),
    },
    nextMaintenanceKm: 100000,
    insuranceExpiryDate: '2026-12-01',
    inspectionExpiryDate: '2026-10-15',
    createdAt: '2023-05-12T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'VEH-103',
    fleetCode: 'AJA-FL-8003',
    licensePlate: 'أ ج ا - 9912',
    vin: '9AJA9912190288821',
    vehicleType: 'HEAVY_TRACTOR_HEAD',
    manufacturer: 'Mercedes-Benz',
    model: 'Actros 1845',
    year: 2025,
    branchLocation: 'الرياض - الجاف اللوجستي',
    status: 'MAINTENANCE',
    mileageKm: 65400,
    fuelLevelPercent: 35,
    engineTempCelsius: 75,
    lastGpsLocation: {
      latitude: 24.71,
      longitude: 46.67,
      locationName: 'ورشة أجا المركزية - الرياض',
      speedKmH: 0,
      headingDegree: 0,
      timestamp: new Date().toISOString(),
    },
    nextMaintenanceKm: 65000,
    insuranceExpiryDate: '2027-04-10',
    inspectionExpiryDate: '2027-03-01',
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

export const SEED_DRIVERS: DriverProfile[] = [
  {
    id: 'DRV-201',
    employeeCode: 'EMP-DRV-201',
    name: 'الكابتن / سعد القحطاني',
    licenseNumber: 'SA-LIC-990123',
    licenseCategory: 'نقل ثقيل تجاري مبرّد',
    licenseExpiryDate: '2028-06-15',
    phoneNumber: '+966 50 112 3344',
    status: 'ON_DUTY',
    ratingStars: 4.9,
    drivingSafetyScore: 96,
    harshBrakingCount: 1,
    idleTimeHoursThisMonth: 3.2,
    totalDistanceDrivenKm: 345000,
    assignedVehiclePlate: 'أ ج ا - 5582',
    medicalCertExpiryDate: '2027-05-10',
  },
  {
    id: 'DRV-202',
    employeeCode: 'EMP-DRV-202',
    name: 'محمد الشهري',
    licenseNumber: 'SA-LIC-881204',
    licenseCategory: 'نقل متوسط تجاري',
    licenseExpiryDate: '2027-11-20',
    phoneNumber: '+966 55 443 2211',
    status: 'AVAILABLE',
    ratingStars: 4.7,
    drivingSafetyScore: 92,
    harshBrakingCount: 3,
    idleTimeHoursThisMonth: 5.1,
    totalDistanceDrivenKm: 182000,
    assignedVehiclePlate: 'أ ج ا - 3310',
    medicalCertExpiryDate: '2027-02-14',
  },
];

export const SEED_FUEL_LOGS: FuelLog[] = [
  {
    id: 'FUEL-1001',
    vehicleId: 'VEH-101',
    licensePlate: 'أ ج ا - 5582',
    driverName: 'سعد القحطاني',
    timestamp: '2026-08-04T09:30:00Z',
    fuelCardNumber: 'ARAMCO-CARD-9912',
    stationName: 'محطة الدريس - طريق الدمام السريع',
    liters: 320,
    costSAR: 896,
    odometerKm: 142100,
    fuelEfficiencyKmPerLiter: 3.9,
    theftAlertFlag: false,
  },
  {
    id: 'FUEL-1002',
    vehicleId: 'VEH-102',
    licensePlate: 'أ ج ا - 3310',
    driverName: 'محمد الشهري',
    timestamp: '2026-08-03T16:00:00Z',
    fuelCardNumber: 'ARAMCO-CARD-4420',
    stationName: 'محطة ساسكو - جدة طريق المطار',
    liters: 140,
    costSAR: 392,
    odometerKm: 98100,
    fuelEfficiencyKmPerLiter: 4.8,
    theftAlertFlag: false,
  },
];

export const SEED_TIRE_LOGS: TireLog[] = [
  {
    id: 'TIRE-1',
    vehicleId: 'VEH-101',
    licensePlate: 'أ ج ا - 5582',
    position: 'FRONT_LEFT',
    serialNumber: 'MICH-2025-X01',
    brand: 'Michelin X Multi Energy',
    treadDepthMm: 11.5,
    pressurePsi: 115,
    installedAtKm: 120000,
    status: 'GOOD',
  },
  {
    id: 'TIRE-2',
    vehicleId: 'VEH-101',
    licensePlate: 'أ ج ا - 5582',
    position: 'FRONT_RIGHT',
    serialNumber: 'MICH-2025-X02',
    brand: 'Michelin X Multi Energy',
    treadDepthMm: 11.2,
    pressurePsi: 114,
    installedAtKm: 120000,
    status: 'GOOD',
  },
];

export const SEED_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'MNT-501',
    vehicleId: 'VEH-103',
    licensePlate: 'أ ج ا - 9912',
    maintenanceType: 'PREVENTIVE',
    description: 'صيانة صمام الهيدروليك الدوري واستبدال فلتر الزيت والمحرك',
    scheduledDate: '2026-08-04T07:00:00Z',
    costSAR: 3200,
    workshopVendorName: 'ورشة أجا المركزية - الرياض',
    status: 'IN_PROGRESS',
    downtimeHours: 6,
  },
];

export const SEED_INSPECTIONS: VehicleInspectionReport[] = [
  {
    id: 'INSP-301',
    vehicleId: 'VEH-101',
    licensePlate: 'أ ج ا - 5582',
    driverName: 'سعد القحطاني',
    inspectionDate: '2026-08-05T05:45:00Z',
    inspectionType: 'PRE_TRIP',
    passed: true,
    brakesOk: true,
    tiresOk: true,
    lightsOk: true,
    reeferEngineOk: true,
    fluidLevelsOk: true,
    notes: 'الشاحنة جاهزة والمكينات تعمل بكفاءة عالية مع فحص الحرارة.',
  },
];

export const SEED_INCIDENTS: FleetIncident[] = [
  {
    id: 'INC-901',
    vehicleId: 'VEH-102',
    licensePlate: 'أ ج ا - 3310',
    driverName: 'محمد الشهري',
    incidentType: 'SPEED_VIOLATION',
    severity: 'LOW',
    timestamp: '2026-08-01T14:20:00Z',
    locationName: 'طريق جدة مكة السريع',
    description: 'تجاوز طفيف للسرعة المحددة (95 كم/س في منطقة 90 كم/س) لمدة 3 دقائق',
    status: 'RESOLVED',
  },
];

export const SEED_FLEET_KPIS: FleetKpiSummary = {
  totalVehicles: 48,
  activeInTransit: 32,
  underMaintenance: 4,
  availableVehicles: 12,
  avgFleetAgeYears: 2.1,
  totalFuelSpentSAR: 184000,
  avgFleetEfficiencyKmPerL: 4.2,
  avgFleetSafetyScore: 94.5,
};

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[FleetRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getVehicles(): Promise<Vehicle[]> {
  return safeFetchCollection<Vehicle>(VEHICLES_COLLECTION, SEED_VEHICLES);
}

export async function updateVehicleStatus(vehicleId: string, status: Vehicle['status']): Promise<Vehicle | null> {
  const list = await getVehicles();
  const item = list.find(v => v.id === vehicleId);
  if (item) {
    item.status = status;
    item.updatedAt = new Date().toISOString();
    try {
      await getAdminFirestore().collection(VEHICLES_COLLECTION).doc(vehicleId).update({
        status: item.status,
        updatedAt: item.updatedAt,
      });
    } catch (err) {
      console.warn('[FleetRepo] updateDoc error:', err);
    }
    return item;
  }
  return null;
}

export async function getDrivers(): Promise<DriverProfile[]> {
  return safeFetchCollection<DriverProfile>(DRIVERS_COLLECTION, SEED_DRIVERS);
}

export async function getFuelLogs(): Promise<FuelLog[]> {
  return safeFetchCollection<FuelLog>('fleet_fuel_logs', SEED_FUEL_LOGS);
}

export async function getTireLogs(): Promise<TireLog[]> {
  return safeFetchCollection<TireLog>('fleet_tire_logs', SEED_TIRE_LOGS);
}

export async function getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
  return safeFetchCollection<MaintenanceRecord>('fleet_maintenance', SEED_MAINTENANCE);
}

export async function getInspections(): Promise<VehicleInspectionReport[]> {
  return safeFetchCollection<VehicleInspectionReport>('fleet_inspections', SEED_INSPECTIONS);
}

export async function getIncidents(): Promise<FleetIncident[]> {
  return safeFetchCollection<FleetIncident>('fleet_incidents', SEED_INCIDENTS);
}

export async function getFleetKpis(): Promise<FleetKpiSummary> {
  return SEED_FLEET_KPIS;
}
