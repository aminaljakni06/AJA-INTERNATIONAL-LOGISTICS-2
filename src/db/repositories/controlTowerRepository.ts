import {
  ShipmentExecutionOrder,
  ShipmentMilestone,
  ShipmentException,
  ProofOfDeliveryRecord,
  GeofenceZone,
  ControlTowerKPIs
} from '../../types/controlTower';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const EXECUTIONS_COLLECTION = 'controltower_executions';
const EXCEPTIONS_COLLECTION = 'controltower_exceptions';
const GEOFENCES_COLLECTION = 'controltower_geofences';

export const SEED_EXECUTIONS: ShipmentExecutionOrder[] = [
  {
    id: 'EXEC-2026-9001',
    shipmentId: 'SHP-90412',
    trackingNumber: 'AJA-881920',
    customerName: 'شركة المراعي للشحن والخدمات المبردة',
    originCity: 'ميناء الملك عبد العزيز - الدمام',
    destinationCity: 'المرفق اللوجستي المركزي - الرياض (سدير)',
    currentStage: 'IN_TRANSIT' as any,
    healthScorePercent: 98,
    driverName: 'عصام بن خالد العتيبي',
    driverPhone: '+966 50 112 9988',
    vehiclePlateNumber: 'أ ج ا 4092 (مرسيدس أكتروس 2025)',
    carrierPartnerName: 'شركة المجدوعي للوجستيات وسلاسل الإمداد (3PL)',

    currentLat: 25.3831,
    currentLng: 48.5120, // Highway 40 Dammam - Riyadh
    lastGpsUpdateTimestamp: new Date().toISOString(),
    telemetry: {
      temperatureCelsius: 4.2, // Controlled cold chain (+2 to +8)
      humidityPercent: 55,
      shockGForce: 0.12,
      lightLux: 0,
      doorClosed: true,
      batteryPercent: 94,
      fuelLevelPercent: 82,
      weightTons: 24.5,
    },

    plannedETA: '2026-08-05T18:00:00Z',
    currentETA: '2026-08-05T17:30:00Z',
    predictedETAByAI: '2026-08-05T17:15:00Z',
    confidenceScorePercent: 97,
    delayRiskFactor: 'NONE',

    progressPercent: 65,
    hasActiveException: false,
    exceptionCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'EXEC-2026-9002',
    shipmentId: 'SHP-90415',
    trackingNumber: 'AJA-881923',
    customerName: 'الشركة السعودية للصناعات الأساسية (سابك)',
    originCity: 'مدينة الجبيل الصناعية - مجمع بتركيم',
    destinationCity: 'ميناء جدة الإسلامي - رصيف الصادرات',
    currentStage: 'PORT',
    healthScorePercent: 82,
    driverName: 'محمد حامد الغامدي',
    driverPhone: '+966 55 443 1122',
    vehiclePlateNumber: 'ب ر ق 7011 (فولفو FH16)',
    carrierPartnerName: 'أسطول أجا اللوجستية المباشر',

    currentLat: 21.4858,
    currentLng: 39.1925, // Jeddah Port zone
    lastGpsUpdateTimestamp: new Date().toISOString(),
    telemetry: {
      temperatureCelsius: 28.5,
      humidityPercent: 68,
      shockGForce: 0.45,
      lightLux: 120,
      doorClosed: true,
      batteryPercent: 88,
      fuelLevelPercent: 45,
      weightTons: 31.0,
    },

    plannedETA: '2026-08-04T14:00:00Z',
    currentETA: '2026-08-04T16:30:00Z',
    predictedETAByAI: '2026-08-04T16:45:00Z',
    confidenceScorePercent: 89,
    delayRiskFactor: 'MEDIUM',

    progressPercent: 88,
    hasActiveException: true,
    exceptionCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'EXEC-2026-9003',
    shipmentId: 'SHP-90420',
    trackingNumber: 'AJA-881930',
    customerName: 'مجموعة النهدي الطبية - المستودع الإقليمي',
    originCity: 'مطار الملك خالد الدولي - الشحن الجوي السريع',
    destinationCity: 'منطقة نيوم / تبوك - المركز الطبي',
    currentStage: 'AIRPORT',
    healthScorePercent: 99,
    driverName: 'سلطان بن إبراهيم الحازمي',
    driverPhone: '+966 53 889 0011',
    vehiclePlateNumber: 'د ن م 9900 (مان تيرمومستر 2026)',
    carrierPartnerName: 'دي إتش إل للحلول اللوجستية (4PL)',

    currentLat: 24.9576,
    currentLng: 46.6988, // KKIA Air Cargo Hub
    lastGpsUpdateTimestamp: new Date().toISOString(),
    telemetry: {
      temperatureCelsius: 3.8, // Ultra-precise pharma cold chain
      humidityPercent: 48,
      shockGForce: 0.05,
      lightLux: 0,
      doorClosed: true,
      batteryPercent: 99,
      fuelLevelPercent: 90,
      weightTons: 8.2,
    },

    plannedETA: '2026-08-05T09:00:00Z',
    currentETA: '2026-08-05T08:45:00Z',
    predictedETAByAI: '2026-08-05T08:40:00Z',
    confidenceScorePercent: 99,
    delayRiskFactor: 'NONE',

    progressPercent: 30,
    hasActiveException: false,
    exceptionCount: 0,
    updatedAt: new Date().toISOString(),
  },
];

export const SEED_MILESTONES: Record<string, ShipmentMilestone[]> = {
  'EXEC-2026-9001': [
    {
      id: 'MS-101',
      executionId: 'EXEC-2026-9001',
      milestoneKey: 'CREATED',
      labelAr: 'إنشاء أمره الشحن والربط بالمنظومة',
      labelEn: 'Shipment Created',
      plannedTime: '2026-08-04T06:00:00Z',
      actualTime: '2026-08-04T06:02:00Z',
      status: 'COMPLETED',
      locationName: 'مركز العمليات الرقمية - الرياض',
      latitude: 24.7136,
      longitude: 46.6753,
    },
    {
      id: 'MS-102',
      executionId: 'EXEC-2026-9001',
      milestoneKey: 'VEHICLE_ASSIGNED',
      labelAr: 'تخصيص الشاحنة المبردة والسائق المعتمد',
      labelEn: 'Vehicle & Driver Assigned',
      plannedTime: '2026-08-04T07:00:00Z',
      actualTime: '2026-08-04T06:45:00Z',
      status: 'COMPLETED',
      locationName: 'كراج المجدوعي اللوجستي - الدمام',
      latitude: 26.4207,
      longitude: 50.0888,
    },
    {
      id: 'MS-103',
      executionId: 'EXEC-2026-9001',
      milestoneKey: 'PICKUP_COMPLETED',
      labelAr: 'اكتمال الاستلام والتحميل وضبط الحرارة (+4°C)',
      labelEn: 'Pickup & Cold Chain Set Completed',
      plannedTime: '2026-08-04T10:00:00Z',
      actualTime: '2026-08-04T09:50:00Z',
      status: 'COMPLETED',
      locationName: 'ميناء الملك عبد العزيز - الدمام',
      latitude: 26.4333,
      longitude: 50.1833,
    },
    {
      id: 'MS-104',
      executionId: 'EXEC-2026-9001',
      milestoneKey: 'DEPARTED',
      labelAr: 'مغادرة الميناء والانطلاق على طريق الرياض السريع',
      labelEn: 'Departed Port Hub',
      plannedTime: '2026-08-04T11:00:00Z',
      actualTime: '2026-08-04T10:55:00Z',
      status: 'COMPLETED',
      locationName: 'بوابة الميناء - طريق الأحساء الرياض',
      latitude: 25.3831,
      longitude: 48.5120,
    },
    {
      id: 'MS-105',
      executionId: 'EXEC-2026-9001',
      milestoneKey: 'ARRIVED_HUB',
      labelAr: 'الوصول المتوقع لمركز التوزيع بالرياض',
      labelEn: 'Arrive Riyadh Hub',
      plannedTime: '2026-08-05T17:30:00Z',
      actualTime: null,
      status: 'IN_PROGRESS',
      locationName: 'المرفق اللوجستي المركزي - الرياض',
      latitude: 24.8000,
      longitude: 46.7000,
    },
    {
      id: 'MS-106',
      executionId: 'EXEC-2026-9001',
      milestoneKey: 'POD_SIGNED',
      labelAr: 'التوقيع الرقمي والتسليم بالرمز QR',
      labelEn: 'Digital POD Signed',
      plannedTime: '2026-08-05T18:00:00Z',
      actualTime: null,
      status: 'PENDING',
      locationName: 'رصيف تفريغ المستودع - الرياض',
      latitude: 24.8010,
      longitude: 46.7010,
    },
  ],
};

export const SEED_EXCEPTIONS: ShipmentException[] = [
  {
    id: 'EXC-801',
    executionId: 'EXEC-2026-9002',
    trackingNumber: 'AJA-881923',
    category: 'CUSTOMS_HOLD',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    descriptionAr: 'تأخير مؤقت في رصيف التفتيش الجمركي بميناء جدة بسبب مطابقة شهادة المنشأ الصادرة من هيئة الزكاة والضريبة والجمرك (ZATCA)',
    rootCauseAr: 'اختلاف رقم التعريف الإحصائي للبضاعة الكيميائية (HS Code) بين البيان الإلكتروني المسبق والمانيفست الجمركي.',
    resolutionActionAr: 'قام المخلص الجمركي المعتمد بشركة أجا بتحديث البيان عبر بوابة "فسح" وجاري تدقيق المستند الفني الآن.',
    reportedAt: '2026-08-04T11:15:00Z',
    resolvedAt: null,
  },
];

export const SEED_GEOFENCES: GeofenceZone[] = [
  {
    id: 'GEO-101',
    nameAr: 'منطقة الميناء الجاف واللوجستي بالدمام',
    zoneType: 'PORT',
    latitude: 26.4333,
    longitude: 50.1833,
    radiusMeters: 3500,
    activeShipmentsInsideCount: 14,
  },
  {
    id: 'GEO-102',
    nameAr: 'المرفق اللوجستي المركزي بسدير - الرياض',
    zoneType: 'WAREHOUSE',
    latitude: 24.8000,
    longitude: 46.7000,
    radiusMeters: 2000,
    activeShipmentsInsideCount: 28,
  },
  {
    id: 'GEO-103',
    nameAr: 'منطقة قرية الشحن الجوي بمطار الملك خالد',
    zoneType: 'AIRPORT',
    latitude: 24.9576,
    longitude: 46.6988,
    radiusMeters: 4000,
    activeShipmentsInsideCount: 9,
  },
];

export const SEED_POD_RECORDS: Record<string, ProofOfDeliveryRecord> = {
  'EXEC-2026-9001': {
    id: 'POD-9001',
    executionId: 'EXEC-2026-9001',
    trackingNumber: 'AJA-881920',
    receiverName: 'مهندس / فهد السبيعي (مدير مستودع الرياض)',
    digitalSignatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M10 50 Q 50 10 100 50 T 190 50" stroke="%2310b981" stroke-width="3" fill="none"/></svg>',
    qrCodeData: 'AJA-POD-VERIFIED-SA881920-2026',
    gpsLatitude: 24.8000,
    gpsLongitude: 46.7000,
    signedTimestamp: '2026-08-05T18:00:00Z',
    photoProofUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    receiverNotes: 'تم الفحص والتسليم بحالة سليمة تماماً وتم التحقق من درجات حرارة التبريد عند التفرغ (+4.1°C)',
  }
};

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[ControlTowerRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getControlTowerExecutions(): Promise<ShipmentExecutionOrder[]> {
  return safeFetchCollection<ShipmentExecutionOrder>(EXECUTIONS_COLLECTION, SEED_EXECUTIONS);
}

export async function getControlTowerExceptions(): Promise<ShipmentException[]> {
  return safeFetchCollection<ShipmentException>(EXCEPTIONS_COLLECTION, SEED_EXCEPTIONS);
}

export async function getControlTowerGeofences(): Promise<GeofenceZone[]> {
  return safeFetchCollection<GeofenceZone>(GEOFENCES_COLLECTION, SEED_GEOFENCES);
}

export async function getShipmentMilestones(executionId: string): Promise<ShipmentMilestone[]> {
  if (SEED_MILESTONES[executionId]) {
    return SEED_MILESTONES[executionId];
  }
  // Return standard milestones if missing
  return SEED_MILESTONES['EXEC-2026-9001'] || [];
}

export async function getProofOfDeliveryRecord(executionId: string): Promise<ProofOfDeliveryRecord | null> {
  return SEED_POD_RECORDS[executionId] || SEED_POD_RECORDS['EXEC-2026-9001'] || null;
}

export async function resolveControlTowerException(
  exceptionId: string,
  resolutionActionAr: string
): Promise<boolean> {
  try {
    await getAdminFirestore().collection(EXCEPTIONS_COLLECTION).doc(exceptionId).update({
      status: 'RESOLVED',
      resolutionActionAr,
      resolvedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('[ControlTowerRepo] Exception resolve local update fallback:', err);
    const found = SEED_EXCEPTIONS.find(e => e.id === exceptionId);
    if (found) {
      found.status = 'RESOLVED';
      found.resolutionActionAr = resolutionActionAr;
      found.resolvedAt = new Date().toISOString();
    }
    return true;
  }
}
