import {
  TransportationOrder,
  TransportationKpis,
  TransportOrderStatus,
  DockScheduleSlot,
  CarrierPerformanceProfile,
  CarbonEmissionMetrics,
  ShipmentConsolidationPlan
} from '../../types/transportation';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const TRANSPORT_COLLECTION = 'transportation_orders';

const SEED_TRANSPORT_ORDERS: TransportationOrder[] = [
  {
    id: 'TO-2026-8001',
    transportOrderNumber: 'AJA-TO-9001',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    salesOrderRef: 'SO-2026-4401',
    shipmentRef: 'SHP-2026-8801',
    transportMode: 'ROAD_FREIGHT',
    originName: 'مستودع أجا المبرد الرئيسي - ميناء الملك عبد العزيز بالدمام',
    destinationName: 'المركز اللوجستي الإقليمي للمنتجات الطبية - الرياض الجاف',
    pickupWindowStart: '2026-08-05T06:00:00Z',
    pickupWindowEnd: '2026-08-05T08:00:00Z',
    deliveryWindowStart: '2026-08-05T14:00:00Z',
    deliveryWindowEnd: '2026-08-05T16:00:00Z',
    estimatedEta: '2026-08-05T14:30:00Z',
    priority: 'CRITICAL',
    status: 'IN_TRANSIT',
    carrierName: 'أسطول أجا للنقل السريع والمبرد',
    assignedDriverName: 'الكابتن / سعد القحطاني',
    assignedVehiclePlate: 'أ ج ا - 5582 (تريلا مبردة 40 قدم)',
    distanceKm: 395,
    loadDetails: {
      weightKg: 18500,
      volumeCbm: 68,
      palletCount: 24,
      containerType: '40FT_REEFER',
      containerUtilizationPercentage: 92,
      isDangerousGoods: false,
      temperatureControlled: true,
      targetTempRange: '+2°C إلى +8°C',
    },
    waypoints: [
      { id: 'WP-1', locationName: 'منفذ مغادرة ميناء الدمام', latitude: 26.43, longitude: 50.10, sequenceOrder: 1, estimatedArrival: '2026-08-05T07:15:00Z' },
      { id: 'WP-2', locationName: 'محطة فحص الوزن والحرارة - الهفوف', latitude: 25.38, longitude: 49.58, sequenceOrder: 2, estimatedArrival: '2026-08-05T09:45:00Z' },
      { id: 'WP-3', locationName: 'نقطة تفتيش مدخل الرياض الشرقي', latitude: 24.71, longitude: 46.85, sequenceOrder: 3, estimatedArrival: '2026-08-05T13:30:00Z' },
    ],
    documents: [
      { id: 'DOC-1', documentType: 'WAYBILL', documentNumber: 'WB-AJA-9001-A', uploadedAt: '2026-08-04T10:00:00Z' },
      { id: 'DOC-2', documentType: 'BILL_OF_LADING', documentNumber: 'BOL-AJA-9001-B', uploadedAt: '2026-08-04T10:05:00Z' },
    ],
    trackingEvents: [
      { id: 'TRK-1', timestamp: '2026-08-05T06:30:00Z', status: 'PICKED_UP', locationName: 'ميناء الملك عبد العزيز بالدمام', notes: 'تم تحميل الحاوية المبردة والتأكد من فتح تكييف الشاحنة عند 4 درجات مئوية.', updatedBy: 'سعد القحطاني' },
      { id: 'TRK-2', timestamp: '2026-08-05T09:50:00Z', status: 'IN_TRANSIT', locationName: 'طريق الدمام الرياض السريع', notes: 'مرور سلس والحرارة مستقرة عند 4.2 درجة مئوية.', updatedBy: 'تتبع GPS التلقائي' },
    ],
    costAmount: 4200,
    revenueAmount: 6800,
    currency: 'SAR',
    createdAt: '2026-08-04T08:00:00Z',
    updatedAt: '2026-08-05T09:50:00Z',
  },
  {
    id: 'TO-2026-8002',
    transportOrderNumber: 'AJA-TO-9002',
    customerId: 'CUST-360-1002',
    customerName: 'مجموعة التجزئة الوطنية الأغذية',
    salesOrderRef: 'SO-2026-4402',
    shipmentRef: 'SHP-2026-8802',
    transportMode: 'ROAD_FREIGHT',
    originName: 'مركز التوزيع الرئيسي - جدة الوادي',
    destinationName: 'مستودع التوزيع المركزي - مكة المكرمة',
    pickupWindowStart: '2026-08-05T08:00:00Z',
    pickupWindowEnd: '2026-08-05T10:00:00Z',
    deliveryWindowStart: '2026-08-05T11:30:00Z',
    deliveryWindowEnd: '2026-08-05T13:00:00Z',
    estimatedEta: '2026-08-05T12:15:00Z',
    priority: 'HIGH',
    status: 'READY_FOR_PICKUP',
    carrierName: 'أسطول أجا - فرع الغربية',
    assignedDriverName: 'محمد الشهري',
    assignedVehiclePlate: 'أ ج ا - 3310 (دينات 8 طن)',
    distanceKm: 85,
    loadDetails: {
      weightKg: 6200,
      volumeCbm: 24,
      palletCount: 10,
      containerType: 'DRY_BOX',
      containerUtilizationPercentage: 85,
      isDangerousGoods: false,
      temperatureControlled: false,
    },
    waypoints: [
      { id: 'WP-201', locationName: 'طريق جدة مكة السريع', latitude: 21.48, longitude: 39.30, sequenceOrder: 1, estimatedArrival: '2026-08-05T11:00:00Z' },
    ],
    documents: [
      { id: 'DOC-201', documentType: 'WAYBILL', documentNumber: 'WB-AJA-9002-A', uploadedAt: '2026-08-04T11:00:00Z' },
    ],
    trackingEvents: [
      { id: 'TRK-201', timestamp: '2026-08-04T15:00:00Z', status: 'SCHEDULED', locationName: 'جدة', notes: 'تم تأكيد موعد التحميل وتجهيز الشاحنة.', updatedBy: 'فريق الجدولة' },
    ],
    costAmount: 1100,
    revenueAmount: 1850,
    currency: 'SAR',
    createdAt: '2026-08-04T11:00:00Z',
    updatedAt: '2026-08-04T15:00:00Z',
  },
];

export const SEED_DOCK_SLOTS: DockScheduleSlot[] = [
  {
    id: 'DOCK-101',
    dockNumber: 'رصيف الشحن أ-01 (DOCK A1)',
    facilityLocation: 'مستودع أجا المركزي - ميناء الدمام',
    scheduledTime: '2026-08-05T07:00:00Z',
    orderRef: 'AJA-TO-9001',
    assignedVehiclePlate: 'أ ج ا - 5582',
    dockStatus: 'LOADING',
    estimatedDurationMinutes: 45,
  },
  {
    id: 'DOCK-102',
    dockNumber: 'رصيف التفريغ ب-03 (DOCK B3)',
    facilityLocation: 'المركز اللوجستي - الرياض الجاف',
    scheduledTime: '2026-08-05T14:30:00Z',
    orderRef: 'AJA-TO-9001',
    assignedVehiclePlate: 'أ ج ا - 5582',
    dockStatus: 'RESERVED',
    estimatedDurationMinutes: 60,
  },
  {
    id: 'DOCK-103',
    dockNumber: 'رصيف المبرد م-02 (REEFER DOCK)',
    facilityLocation: 'مركز التوزيع - جدة الوادي',
    scheduledTime: '2026-08-05T09:00:00Z',
    orderRef: 'AJA-TO-9002',
    assignedVehiclePlate: 'أ ج ا - 3310',
    dockStatus: 'COMPLETED',
    estimatedDurationMinutes: 30,
  },
];

export const SEED_CARRIERS: CarrierPerformanceProfile[] = [
  {
    id: 'CAR-1',
    carrierName: 'أسطول أجا للنقل المبرّد السريع',
    mode: 'ROAD_FREIGHT',
    slaOnTimeRate: 98.8,
    ratingStars: 4.9,
    costPerKmSAR: 8.5,
    activeVehiclesCount: 42,
    greenScore: 92,
    totalCompletedShipments: 1450,
    preferredStatus: 'PREFERRED',
  },
  {
    id: 'CAR-2',
    carrierName: 'شركة الساحل الغربي اللوجستية',
    mode: 'ROAD_FREIGHT',
    slaOnTimeRate: 95.4,
    ratingStars: 4.6,
    costPerKmSAR: 7.9,
    activeVehiclesCount: 28,
    greenScore: 84,
    totalCompletedShipments: 820,
    preferredStatus: 'APPROVED',
  },
  {
    id: 'CAR-3',
    carrierName: 'أجا للشحن الجوي المباشر (Air Express)',
    mode: 'AIR_FREIGHT',
    slaOnTimeRate: 99.4,
    ratingStars: 5.0,
    costPerKmSAR: 32.0,
    activeVehiclesCount: 6,
    greenScore: 78,
    totalCompletedShipments: 310,
    preferredStatus: 'PREFERRED',
  },
];

export const SEED_CARBON_METRICS: CarbonEmissionMetrics = {
  totalCo2Tons: 142.8,
  avgCo2PerKmKg: 0.18,
  fleetGreenScore: 89,
  co2SavedTonsThisMonth: 18.4,
  fuelEfficiencyKmPerLiter: 3.8,
  electricVehicleSharePercentage: 14.5,
};

export const SEED_CONSOLIDATION_PLANS: ShipmentConsolidationPlan[] = [
  {
    id: 'CONSOL-801',
    planNumber: 'CNS-2026-EAST-01',
    routeRegion: 'المنطقة الشرقية ➔ الرياض',
    mergedOrderIds: ['TO-2026-8001', 'TO-2026-8003'],
    totalWeightKg: 24500,
    totalVolumeCbm: 78,
    utilizationPercentage: 96,
    estimatedCostSavingsSAR: 2800,
    status: 'PROPOSED',
  },
];

export const SEED_TMS_KPIS: TransportationKpis = {
  onTimePickupRate: 98.6,
  onTimeDeliveryRate: 97.8,
  avgTransitTimeHours: 6.4,
  fleetCapacityUtilization: 91.2,
  totalDistanceKm: 148200,
  totalFreightCostSAR: 485000,
  avgCostPerShipmentSAR: 3200,
  carbonEmissionMetrics: SEED_CARBON_METRICS,
};

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[TransportationRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getTransportationOrders(customerId?: string): Promise<TransportationOrder[]> {
  const items = await safeFetchCollection<TransportationOrder>(TRANSPORT_COLLECTION, SEED_TRANSPORT_ORDERS);
  if (customerId) {
    return items.filter(o => o.customerId === customerId);
  }
  return items;
}

export async function createTransportationOrder(orderData: Omit<TransportationOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<TransportationOrder> {
  const id = `TO-${Date.now()}`;
  const now = new Date().toISOString();
  const order: TransportationOrder = {
    ...orderData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await getAdminFirestore().collection(TRANSPORT_COLLECTION).doc(id).set(order);
  } catch (err) {
    console.warn('[TransportationRepo] setDoc error:', err);
  }

  SEED_TRANSPORT_ORDERS.unshift(order);
  return order;
}

export async function updateTransportationOrderStatus(orderId: string, status: TransportOrderStatus, trackingNote?: string): Promise<TransportationOrder | null> {
  const orders = await getTransportationOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (trackingNote) {
      order.trackingEvents.push({
        id: `TRK-${Date.now()}`,
        timestamp: order.updatedAt,
        status,
        locationName: order.originName,
        notes: trackingNote,
        updatedBy: 'مرحّل العمليات (Dispatcher)',
      });
    }

    try {
      await getAdminFirestore().collection(TRANSPORT_COLLECTION).doc(orderId).update({
        status: order.status,
        trackingEvents: order.trackingEvents,
        updatedAt: order.updatedAt,
      });
    } catch (err) {
      console.warn('[TransportationRepo] updateDoc error:', err);
    }
    return order;
  }
  return null;
}

export async function assignDriverAndVehicle(orderId: string, driverName: string, vehiclePlate: string): Promise<TransportationOrder | null> {
  const orders = await getTransportationOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.assignedDriverName = driverName;
    order.assignedVehiclePlate = vehiclePlate;
    if (order.status === 'DRAFT' || order.status === 'PLANNED') {
      order.status = 'SCHEDULED';
    }
    order.updatedAt = new Date().toISOString();

    try {
      await getAdminFirestore().collection(TRANSPORT_COLLECTION).doc(orderId).update({
        assignedDriverName: order.assignedDriverName,
        assignedVehiclePlate: order.assignedVehiclePlate,
        status: order.status,
        updatedAt: order.updatedAt,
      });
    } catch (err) {
      console.warn('[TransportationRepo] updateDoc error:', err);
    }
    return order;
  }
  return null;
}

export async function getDockScheduleSlots(): Promise<DockScheduleSlot[]> {
  return safeFetchCollection<DockScheduleSlot>('dock_slots', SEED_DOCK_SLOTS);
}

export async function createDockScheduleSlot(slotData: Omit<DockScheduleSlot, 'id'>): Promise<DockScheduleSlot> {
  const id = `DOCK-${Date.now()}`;
  const slot: DockScheduleSlot = { ...slotData, id };
  try {
    await getAdminFirestore().collection('dock_slots').doc(id).set(slot);
  } catch (err) {
    console.warn('[TransportationRepo] setDoc dock_slots error:', err);
  }
  SEED_DOCK_SLOTS.unshift(slot);
  return slot;
}

export async function getCarrierPerformanceProfiles(): Promise<CarrierPerformanceProfile[]> {
  return safeFetchCollection<CarrierPerformanceProfile>('carrier_profiles', SEED_CARRIERS);
}

export async function getCarbonAnalytics(): Promise<CarbonEmissionMetrics> {
  return SEED_CARBON_METRICS;
}

export async function getConsolidationPlans(): Promise<ShipmentConsolidationPlan[]> {
  return safeFetchCollection<ShipmentConsolidationPlan>('consolidation_plans', SEED_CONSOLIDATION_PLANS);
}
