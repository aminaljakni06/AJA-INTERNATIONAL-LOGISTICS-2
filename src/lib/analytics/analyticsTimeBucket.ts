/**
 * AJA INTERNATIONAL LOGISTICS — Analytics Time Bucketing & Timezone Semantics
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Server-Side Aggregation Engine & Multi-Domain Analytics Repositories (STEP 05.19.03)
 */

import { AnalyticsTimeSeriesPoint } from '../../types/analyticsFramework';

export type TimeBucketInterval = 'DAY' | 'WEEK' | 'MONTH';

/**
 * Normalizes an ISO date string into a deterministic bucket key based on interval and timezone.
 */
export function getTimeBucketKey(
  dateIsoString: string,
  interval: TimeBucketInterval,
  timezone = 'Asia/Riyadh'
): { key: string; label: string; date: Date } {
  const d = new Date(dateIsoString);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date ISO string: "${dateIsoString}"`);
  }

  // Format date parts in specified timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(d);
  let year = '';
  let month = '';
  let day = '';

  for (const p of parts) {
    if (p.type === 'year') year = p.value;
    if (p.type === 'month') month = p.value;
    if (p.type === 'day') day = p.value;
  }

  if (interval === 'DAY') {
    const key = `${year}-${month}-${day}`;
    return { key, label: key, date: d };
  }

  if (interval === 'MONTH') {
    const key = `${year}-${month}`;
    return { key, label: key, date: d };
  }

  // interval === 'WEEK'
  // ISO week calculation
  const target = new Date(d.valueOf());
  const dayNr = (d.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
  const weekStr = weekNumber.toString().padStart(2, '0');
  const key = `${year}-W${weekStr}`;

  return { key, label: `Week ${weekStr}, ${year}`, date: d };
}

/**
 * Groups raw data records with timestamp field into time-series points across requested interval.
 */
export function aggregateRecordsIntoTimeSeries<T>(
  records: T[],
  timeField: keyof T & string,
  interval: TimeBucketInterval,
  valueExtractor: (rec: T) => number = () => 1,
  timezone = 'Asia/Riyadh'
): AnalyticsTimeSeriesPoint[] {
  const bucketMap = new Map<string, { label: string; sum: number; count: number }>();

  for (const rec of records) {
    const rawTime = rec[timeField];
    if (!rawTime || typeof rawTime !== 'string') continue;

    try {
      const { key, label } = getTimeBucketKey(rawTime, interval, timezone);
      const val = valueExtractor(rec);

      const existing = bucketMap.get(key) || { label, sum: 0, count: 0 };
      existing.sum += val;
      existing.count += 1;
      bucketMap.set(key, existing);
    } catch {
      // Ignore invalid date strings gracefully
    }
  }

  // Sort keys chronologically
  const sortedKeys = Array.from(bucketMap.keys()).sort();

  return sortedKeys.map((key) => {
    const b = bucketMap.get(key)!;
    return {
      timestamp: key,
      label: b.label,
      value: b.sum,
    };
  });
}
