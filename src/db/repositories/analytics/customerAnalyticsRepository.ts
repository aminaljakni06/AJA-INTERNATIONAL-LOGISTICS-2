/**
 * AJA INTERNATIONAL LOGISTICS — Customer Domain Analytics Repository
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Server-Side Aggregation Engine & Multi-Domain Analytics Repositories (STEP 05.19.03)
 */

import { getAdminFirestore } from '../../../server/firebaseAdmin';
import { CustomerProfileDoc } from '../../../types/firestore';
import { TranslatedQueryFilters } from '../../../lib/analytics/analyticsFilterTranslator';
import { AnalyticsGroupedItem, AnalyticsTimeSeriesPoint } from '../../../types/analyticsFramework';
import { aggregateRecordsIntoTimeSeries, TimeBucketInterval } from '../../../lib/analytics/analyticsTimeBucket';

const CUSTOMERS_COLLECTION = 'customers';
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

export interface CustomerAnalyticsQueryOptions {
  filters: TranslatedQueryFilters;
  dimension?: string;
  timeBucket?: TimeBucketInterval;
  timeField?: string;
  timezone?: string;
}

function buildCustomerQuery(filters: TranslatedQueryFilters): FirebaseFirestore.Query {
  let ref: FirebaseFirestore.Query = getAdminFirestore().collection(CUSTOMERS_COLLECTION);

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
    ref = ref.where(key, '==', val);
  }

  for (const [key, vals] of Object.entries(filters.inFilters)) {
    if (vals && vals.length > 0) {
      ref = ref.where(key, 'in', vals.slice(0, 30));
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

export class CustomerAnalyticsRepository {
  public async getCustomerCount(options: CustomerAnalyticsQueryOptions): Promise<number> {
    try {
      const docsTask = buildCustomerQuery(options.filters).limit(MAX_BOUNDED_READ_LIMIT).get().then((snap) => snap.size);
      return await withTimeout(docsTask, 0);
    } catch {
      return 0;
    }
  }

  public async getGroupedCustomers(
    options: CustomerAnalyticsQueryOptions,
    dimension: string
  ): Promise<AnalyticsGroupedItem[]> {
    try {
      const snap = await withTimeout(buildCustomerQuery(options.filters).limit(MAX_BOUNDED_READ_LIMIT).get(), null);
      if (!snap) return [];

      const groupMap = new Map<string, number>();

      snap.forEach((d) => {
        const data = d.data() as any;
        const keyVal = data[dimension] || 'UNKNOWN';
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
    options: CustomerAnalyticsQueryOptions,
    timeBucket: TimeBucketInterval,
    timeField = 'createdAt',
    timezone = 'Asia/Riyadh'
  ): Promise<AnalyticsTimeSeriesPoint[]> {
    try {
      const snap = await withTimeout(buildCustomerQuery(options.filters).limit(MAX_BOUNDED_READ_LIMIT).get(), null);
      if (!snap) return [];

      const records: CustomerProfileDoc[] = snap.docs.map((d) => d.data() as CustomerProfileDoc);
      return aggregateRecordsIntoTimeSeries(records, timeField as keyof CustomerProfileDoc & string, timeBucket, () => 1, timezone);
    } catch {
      return [];
    }
  }
}

export const customerAnalyticsRepository = new CustomerAnalyticsRepository();
