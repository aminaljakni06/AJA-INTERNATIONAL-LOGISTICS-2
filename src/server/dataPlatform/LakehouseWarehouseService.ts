import { LakehouseDataset, DataWarehouseMart } from './types';

export class LakehouseWarehouseService {
  private static readonly LAKEHOUSE_DATASETS: LakehouseDataset[] = [
    {
      id: 'LAKE-BRONZE-ERP-01',
      name: 'raw_erp_journal_entries',
      layer: 'RAW_BRONZE',
      sourceSystem: 'SAP / Oracle ERP',
      format: 'DELTA',
      recordCount: 1420500,
      sizeMB: 3850,
      lastIngestedAt: new Date().toISOString(),
      schemaVersion: 'v2.4',
      timeTravelSupported: true,
      classification: 'CONFIDENTIAL',
    },
    {
      id: 'LAKE-BRONZE-TMS-02',
      name: 'raw_gps_fleet_telemetry_stream',
      layer: 'RAW_BRONZE',
      sourceSystem: 'AJA Fleet GPS IoT',
      format: 'ICEBERG',
      recordCount: 8900400,
      sizeMB: 12400,
      lastIngestedAt: new Date().toISOString(),
      schemaVersion: 'v1.8',
      timeTravelSupported: true,
      classification: 'INTERNAL',
    },
    {
      id: 'LAKE-SILVER-WMS-03',
      name: 'cleansed_warehouse_inventory_bins',
      layer: 'CLEANSED_SILVER',
      sourceSystem: 'AJA Smart WMS / WES',
      format: 'PARQUET',
      recordCount: 680200,
      sizeMB: 1200,
      lastIngestedAt: new Date().toISOString(),
      schemaVersion: 'v3.1',
      timeTravelSupported: true,
      classification: 'CONFIDENTIAL',
    },
    {
      id: 'LAKE-SILVER-CUSTOMS-04',
      name: 'cleansed_fasah_customs_declarations',
      layer: 'CLEANSED_SILVER',
      sourceSystem: 'Saudi Customs (Fasah) API',
      format: 'PARQUET',
      recordCount: 245000,
      sizeMB: 840,
      lastIngestedAt: new Date().toISOString(),
      schemaVersion: 'v2.0',
      timeTravelSupported: true,
      classification: 'RESTRICTED',
    },
    {
      id: 'LAKE-GOLD-BI-05',
      name: 'curated_customer_360_lifetime_analytics',
      layer: 'CURATED_GOLD',
      sourceSystem: 'CRM + ERP + Billing',
      format: 'DELTA',
      recordCount: 48900,
      sizeMB: 450,
      lastIngestedAt: new Date().toISOString(),
      schemaVersion: 'v4.0',
      timeTravelSupported: true,
      classification: 'RESTRICTED',
    },
    {
      id: 'LAKE-FEATURE-AI-06',
      name: 'ai_carrier_recommendation_features',
      layer: 'FEATURE_STORE',
      sourceSystem: 'AI Platform Orchestrator',
      format: 'PARQUET',
      recordCount: 180300,
      sizeMB: 310,
      lastIngestedAt: new Date().toISOString(),
      schemaVersion: 'v1.2',
      timeTravelSupported: true,
      classification: 'INTERNAL',
    },
  ];

  private static readonly DATA_WAREHOUSE_MARTS: DataWarehouseMart[] = [
    {
      id: 'MART-FINANCE-01',
      martName: 'Freight & Corporate Finance Data Mart',
      factTablesCount: 4,
      dimTablesCount: 8,
      totalRows: 4200000,
      lastRefreshedAt: new Date().toISOString(),
      starSchemaConfig: {
        factTable: 'fact_financial_ledger_entries',
        dimensionTables: [
          'dim_customer',
          'dim_vendor',
          'dim_chart_of_accounts',
          'dim_currency',
          'dim_cost_center',
          'dim_date',
          'dim_branch',
          'dim_tax_code',
        ],
      },
      scdType2Enabled: true,
    },
    {
      id: 'MART-TMS-02',
      martName: 'Transportation & Control Tower Data Mart',
      factTablesCount: 3,
      dimTablesCount: 6,
      totalRows: 8900000,
      lastRefreshedAt: new Date().toISOString(),
      starSchemaConfig: {
        factTable: 'fact_shipment_milestone_events',
        dimensionTables: [
          'dim_carrier_3pl',
          'dim_route_origin_dest',
          'dim_port_customs',
          'dim_vehicle_fleet',
          'dim_driver',
          'dim_time_hour',
        ],
      },
      scdType2Enabled: true,
    },
    {
      id: 'MART-WMS-03',
      martName: 'Smart Warehouse & Fulfillment Data Mart',
      factTablesCount: 3,
      dimTablesCount: 5,
      totalRows: 3100000,
      lastRefreshedAt: new Date().toISOString(),
      starSchemaConfig: {
        factTable: 'fact_inventory_movements',
        dimensionTables: [
          'dim_warehouse_location',
          'dim_product_sku',
          'dim_storage_bin',
          'dim_asn_inbound',
          'dim_customer_account',
        ],
      },
      scdType2Enabled: true,
    },
    {
      id: 'MART-CRM-04',
      martName: 'Commercial Sales & Customer 360 Mart',
      factTablesCount: 2,
      dimTablesCount: 5,
      totalRows: 1800000,
      lastRefreshedAt: new Date().toISOString(),
      starSchemaConfig: {
        factTable: 'fact_sales_quote_conversions',
        dimensionTables: [
          'dim_customer_360',
          'dim_contract_tariff',
          'dim_sales_rep',
          'dim_lead_source',
          'dim_service_category',
        ],
      },
      scdType2Enabled: true,
    },
  ];

  public static getLakehouseDatasets(): LakehouseDataset[] {
    return this.LAKEHOUSE_DATASETS;
  }

  public static getWarehouseMarts(): DataWarehouseMart[] {
    return this.DATA_WAREHOUSE_MARTS;
  }

  public static getTimeTravelSnapshots(datasetId: string) {
    return {
      datasetId,
      snapshots: [
        { version: 'v3.1.0', timestamp: '2026-08-05T12:00:00Z', rowsAdded: 14200, commitAuthor: 'CDC_AutoIngest' },
        { version: 'v3.0.0', timestamp: '2026-08-04T12:00:00Z', rowsAdded: 13800, commitAuthor: 'ETL_DailyBatch' },
        { version: 'v2.9.0', timestamp: '2026-08-03T12:00:00Z', rowsAdded: 15100, commitAuthor: 'ETL_DailyBatch' },
      ],
    };
  }
}
