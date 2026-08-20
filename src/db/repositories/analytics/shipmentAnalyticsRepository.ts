/**
 * AJA INTERNATIONAL LOGISTICS — Shipment Domain Analytics Repository
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Server-Side Aggregation Engine & Multi-Domain Analytics Repositories (STEP 05.19.03)
 */

import { getAdminFirestore } from '../../../server/firebaseAdmin';
import { ShipmentDoc } from '../../../types/firestore';
import { TranslatedQueryFilters } from '../../../lib/analytics/analyticsFilterTranslator';
import { AnalyticsGroupedItem, AnalyticsTimeSeriesPoint } from '../../../types/analyticsFramework';
import { aggregateRecordsIntoTimeSeries, TimeBucketInterval } from '../../../lib/analytics/analyticsTimeBucket';

const SHIPMENTS_COLLECTION = 'shipments';
const MAX_BOUNDED_READ_LIMIT = 5000;
const NETWORK_TIMEOUT_MS = 2500;

async function withTimeout<T>(promise: Promise<T>, fallback: T, timeoutMs = NETWORK_TIMEOUT_MS): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), timeoutMs);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
}

export interface ShipmentAnalyticsQueryOptions {
  filters: TranslatedQueryFilters;
  dimension?: string;
  timeBucket?: TimeBucketInterval;
  timeField?: string;
  timezone?: string;
}

function buildShipmentQuery(filters: TranslatedQueryFilters): FirebaseFirestore.Query {
  let ref: FirebaseFirestore.Query = getAdminFirestore().collection(SHIPMENTS_COLLECTION);

  if (filters.tenantId) {
    ref = ref.where('tenantId', '==', filters.tenantId);
  }
  if (filters.companyId) {
    ref = ref.where('companyId', '==', filters.companyId);
  }
  if (filters.branchId) {
    ref = ref.where('branchId', '==', filters.branchId);
  }

  for (const [key, val] of Object.entries(filters.equalityFilters)) {
    const targetField = key === 'status' ? 'currentStatus' : key;
    ref = ref.where(targetField, '==', val);
  }

  for (const [key, vals] of Object.entries(filters.inFilters)) {
    if (vals && vals.length > 0) {
      const targetField = key === 'status' ? 'currentStatus' : key;
      ref = ref.where(targetField, 'in', vals.slice(0, 30));
    }
  }

  if (filters.dateRangeFilter) {
    const timeField = filters.dateRangeFilter.field || 'createdAt';
    if (filters.dateRangeFilter.startDate) {
      ref = ref.where(timeField, '>=', filters.dateRangeFilter.startDate);
    }
    if (filters.dateRangeFilter.endDate) {
      ref = ref.where(timeField, '<=', filters.dateRangeFilter.endDate);
    }
  }

  return ref;
}

export class ShipmentAnalyticsRepository {
  public async getShipmentCount(options: ShipmentAnalyticsQueryOptions): Promise<number> {
    try {
      const docsTask = buildShipmentQuery(options.filters).limit(MAX_BOUNDED_READ_LIMIT).get().then((snap) => snap.size);
      return await withTimeout(docsTask, 0);
    } catch {
      return 0;
    }
  }

  public async getShipmentSum(options: ShipmentAnalyticsQueryOptions, sourceField: keyof ShipmentDoc & string): Promise<number> {
    try {
      const snap = await withTimeout(buildShipmentQuery(options.filters).limit(MAX_BOUNDED_READ_LIMIT).get(), null);
      if (!snap) return 0;

      let sum = 0;
      snap.forEach((d) => {
        const data = d.data() as ShipmentDoc;
        const val = data[sourceField];
        if (typeof val === 'number' && !isNaN(val)) {
          sum += val;
        }
      });
      return sum;
    } catch {
      return 0;
    }
  }

  public async getGroupedShipments(
    options: ShipmentAnalyticsQueryOptions,
    dimension: string
  ): Promise<AnalyticsGroupedItem[]> {
    try {
      const snap = await withTimeout(buildShipmentQuery(options.filters).limit(MAX_BOUNDED_READ_LIMIT).get(), null);
      if (!snap) return [];

      const groupMap = new Map<string, number>();
      const fieldName = dimension === 'status' ? 'currentStatus' : dimension;

      snap.forEach((d) => {
        const data = d.data() as any;
        let keyVal: string;
        if (dimension === 'corridor') {
          keyVal = data.corridor || (data.origin && data.destination ? `${data.origin} → ${data.destination}` : 'UNKNOWN');
        } else {
          keyVal = data[fieldName] || 'UNKNOWN';
        }
        const keyStr = String(keyVal);
        groupMap.set(keyStr, (groupMap.get(keyStr) || 0) + 1);
      });

      return Array.from(groupMap.entries()).map(([key, val]) => ({
        key,
        labelEn: key,
        labelAr: key,
        value: val,
        count: val,
      }));
    } catch {
      return [];
    }
  }

  public async getTimeSeries(
    options: ShipmentAnalyticsQueryOptions,
    timeBucket: TimeBucketInterval,
    timeField = 'createdAt',
    timezone = 'Asia/Riyadh'
  ): Promise<AnalyticsTimeSeriesPoint[]> {
    try {
      const snap = await withTimeout(buildShipmentQuery(options.filters).limit(MAX_BOUNDED_READ_LIMIT).get(), null);
      if (!snap) return [];

      const records: ShipmentDoc[] = snap.docs.map((d) => d.data() as ShipmentDoc);
      return aggregateRecordsIntoTimeSeries(records, timeField as keyof ShipmentDoc & string, timeBucket, () => 1, timezone);
    } catch {
      return [];
    }
  }
}

export const shipmentAnalyticsRepository = new ShipmentAnalyticsRepository();
