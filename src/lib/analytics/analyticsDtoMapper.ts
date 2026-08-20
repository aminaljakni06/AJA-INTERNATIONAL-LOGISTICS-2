/**
 * AJA INTERNATIONAL LOGISTICS — Analytics Public DTO Mapper
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: REST API & Tenant-Aware Middleware Integration (STEP 05.19.04)
 */

import { AnalyticsMetricDescriptor } from '../../types/analyticsFramework';

export interface PublicDimensionDTO {
  id: string;
  labelEn: string;
  labelAr: string;
  type?: string;
  allowedValues?: string[];
}

export interface PublicAnalyticsMetricDTO {
  id: string;
  resource: string;
  domain: string;
  labelKey: string;
  labelEn: string;
  labelAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  valueType: string;
  format: {
    valueType: string;
    unit?: string;
    unitAr?: string;
    precision?: number;
    prefix?: string;
    suffix?: string;
    defaultCurrency?: string;
  };
  dimensions?: PublicDimensionDTO[];
  drillDownCapable: boolean;
  exportable: boolean;
  status: string;
}

/**
 * Transforms an internal AnalyticsMetricDescriptor into a safe client-facing DTO,
 * stripping internal source fields, calculation logic, and security metadata.
 */
export function mapMetricToPublicDTO(descriptor: AnalyticsMetricDescriptor): PublicAnalyticsMetricDTO {
  const dimensions: PublicDimensionDTO[] | undefined = descriptor.dimensions?.map((dim) => ({
    id: dim.id,
    labelEn: dim.labelEn,
    labelAr: dim.labelAr,
    type: dim.type,
    allowedValues: dim.allowedValues ? [...dim.allowedValues] : undefined,
  }));

  return {
    id: descriptor.id,
    resource: descriptor.resource,
    domain: descriptor.domain,
    labelKey: descriptor.labelKey,
    labelEn: descriptor.labelEn,
    labelAr: descriptor.labelAr,
    descriptionEn: descriptor.descriptionEn,
    descriptionAr: descriptor.descriptionAr,
    valueType: descriptor.valueType,
    format: {
      valueType: descriptor.format.valueType,
      unit: descriptor.format.unit,
      unitAr: descriptor.format.unitAr,
      precision: descriptor.format.precision,
      prefix: descriptor.format.prefix,
      suffix: descriptor.format.suffix,
      defaultCurrency: descriptor.format.defaultCurrency,
    },
    dimensions,
    drillDownCapable: descriptor.drillDownCapable,
    exportable: descriptor.exportable,
    status: descriptor.status,
  };
}
