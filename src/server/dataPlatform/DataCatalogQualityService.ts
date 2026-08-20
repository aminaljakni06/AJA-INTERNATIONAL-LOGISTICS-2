import { DataCatalogAsset, DataQualityMetric } from './types';

export class DataCatalogQualityService {
  private static readonly CATALOG_ASSETS: DataCatalogAsset[] = [
    {
      id: 'CAT-ASSET-01',
      assetName: 'curated_customer_360_gold',
      assetType: 'DATASET',
      domain: 'Customer & Commercial',
      owner: 'Commercial Analytics Team',
      steward: 'Hassan Al-Otaibi',
      descriptionEn: 'Unified 360-degree customer profile dataset combining sales, logistics, billing, and sentiment.',
      descriptionAr: 'سجل ملف العميل الشامل 360 درجة الموحد للمبيعات، الشحنات، الفواتير، وتقييم الخدمة.',
      tags: ['GOLD_LAYER', 'CUSTOMER_360', 'ZATCA_SYNCED', 'SCD_TYPE_2'],
      classification: 'RESTRICTED',
      qualityScore: 98.4,
      upstreamDependencies: ['raw_erp_journal_entries', 'cleansed_crm_leads', 'fact_shipment_milestone_events'],
      downstreamConsumers: ['Executive_BI_Dashboard', 'AI_Customer_Support_Agent', 'Predictive_Churn_Model'],
      certified: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CAT-ASSET-02',
      assetName: 'fact_shipment_milestone_events',
      assetType: 'TABLE',
      domain: 'Logistics & TMS Control Tower',
      owner: 'Control Tower Operations',
      steward: 'Reem Al-Ghamdi',
      descriptionEn: 'Fact table storing real-time and historical milestones for ocean, air, and land freight shipments.',
      descriptionAr: 'جدول حقائق يربط أحداث ومعالم الشحنات الملاحية والبرية والجوية لحظياً.',
      tags: ['FACT_TABLE', 'REAL_TIME_STREAM', 'STAR_SCHEMA', 'GPS_LINKED'],
      classification: 'CONFIDENTIAL',
      qualityScore: 99.1,
      upstreamDependencies: ['raw_gps_fleet_telemetry_stream', 'cleansed_fasah_customs_declarations'],
      downstreamConsumers: ['Transportation_Data_Mart', 'AI_Carrier_Selection_Engine'],
      certified: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CAT-ASSET-03',
      assetName: 'fact_financial_ledger_entries',
      assetType: 'TABLE',
      domain: 'Finance & Treasury',
      owner: 'Corporate Finance & Accounting',
      steward: 'Fariha Al-Qahtani',
      descriptionEn: 'Immutable general ledger postings for freight revenue, carrier disbursements, and VAT taxes.',
      descriptionAr: 'جدول قيود اليومية العامة غير القابلة التعديل لإيرادات ومصروفات الشحن وضريبة القيمة المضافة.',
      tags: ['GENERAL_LEDGER', 'IMMUTABLE_AUDIT', 'ZATCA_PHASE_2'],
      classification: 'TOP_SECRET',
      qualityScore: 99.8,
      upstreamDependencies: ['raw_erp_journal_entries', 'adyen_payment_settlements'],
      downstreamConsumers: ['Executive_EBITDA_Dashboard', 'ZATCA_Tax_Report_Generator'],
      certified: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CAT-ASSET-04',
      assetName: 'ai_carrier_recommendation_features',
      assetType: 'ML_MODEL',
      domain: 'AI Platform & Data Science',
      owner: 'Enterprise AI Engineering',
      steward: 'Dr. Ziad Al-Rashid',
      descriptionEn: 'Feature store table feeding historical OTIF carrier performance into the AI decision optimizer.',
      descriptionAr: 'جدول متجر الميزات الخاص بتغذية خوارزميات التوصية الذكية لاختيار أفضل الناقلين الملاحيين.',
      tags: ['FEATURE_STORE', 'ML_READY', 'AI_OPTIMIZER'],
      classification: 'INTERNAL',
      qualityScore: 97.2,
      upstreamDependencies: ['fact_shipment_milestone_events', 'dim_carrier_3pl'],
      downstreamConsumers: ['AJA_Decision_Intelligence_Service'],
      certified: true,
      updatedAt: new Date().toISOString(),
    },
  ];

  private static readonly QUALITY_METRICS: DataQualityMetric[] = [
    {
      id: 'DQ-METRIC-01',
      datasetOrTableName: 'curated_customer_360_gold',
      completenessPct: 99.2,
      accuracyPct: 98.8,
      consistencyPct: 97.9,
      uniquenessPct: 100.0,
      validityPct: 99.0,
      timelinessPct: 98.5,
      overallQualityScore: 98.9,
      anomaliesDetectedCount: 0,
      lastValidatedAt: new Date().toISOString(),
      status: 'EXCELLENT',
    },
    {
      id: 'DQ-METRIC-02',
      datasetOrTableName: 'fact_shipment_milestone_events',
      completenessPct: 98.5,
      accuracyPct: 99.1,
      consistencyPct: 98.2,
      uniquenessPct: 99.9,
      validityPct: 99.4,
      timelinessPct: 99.8,
      overallQualityScore: 99.1,
      anomaliesDetectedCount: 1, // Minor delay anomaly
      lastValidatedAt: new Date().toISOString(),
      status: 'EXCELLENT',
    },
    {
      id: 'DQ-METRIC-03',
      datasetOrTableName: 'raw_gps_fleet_telemetry_stream',
      completenessPct: 94.2, // IoT packet loss
      accuracyPct: 96.0,
      consistencyPct: 95.1,
      uniquenessPct: 98.0,
      validityPct: 96.5,
      timelinessPct: 99.9,
      overallQualityScore: 96.0,
      anomaliesDetectedCount: 3,
      lastValidatedAt: new Date().toISOString(),
      status: 'GOOD',
    },
  ];

  public static getCatalogAssets(query?: string): DataCatalogAsset[] {
    if (!query) return this.CATALOG_ASSETS;
    const q = query.toLowerCase();
    return this.CATALOG_ASSETS.filter(
      (a) =>
        a.assetName.toLowerCase().includes(q) ||
        a.descriptionAr.includes(q) ||
        a.domain.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  public static getQualityMetrics(): DataQualityMetric[] {
    return this.QUALITY_METRICS;
  }

  public static getLineageGraph() {
    return {
      nodes: [
        { id: 'src_erp', label: 'SAP ERP Journal API', type: 'SOURCE', layer: 'ERP/CRM' },
        { id: 'src_gps', label: 'IoT Fleet Telemetry', type: 'SOURCE', layer: 'IoT/GPS' },
        { id: 'src_fasah', label: 'Saudi Customs Fasah API', type: 'SOURCE', layer: 'Government' },
        { id: 'lake_bronze', label: 'Bronze Lakehouse (Raw Data)', type: 'LAKEHOUSE', layer: 'Bronze' },
        { id: 'lake_silver', label: 'Silver Lakehouse (Cleansed)', type: 'LAKEHOUSE', layer: 'Silver' },
        { id: 'lake_gold', label: 'Gold Lakehouse (Curated 360)', type: 'LAKEHOUSE', layer: 'Gold' },
        { id: 'dw_fact_shipment', label: 'DW Fact: Shipment Events', type: 'WAREHOUSE', layer: 'Data Mart' },
        { id: 'dw_fact_finance', label: 'DW Fact: Financial Ledger', type: 'WAREHOUSE', layer: 'Data Mart' },
        { id: 'bi_exec', label: 'Executive BI Dashboard', type: 'CONSUMER', layer: 'BI & Reporting' },
        { id: 'ai_engine', label: 'AJA Decision AI Platform', type: 'CONSUMER', layer: 'AI Foundation' },
      ],
      edges: [
        { from: 'src_erp', to: 'lake_bronze', label: 'CDC Ingest' },
        { from: 'src_gps', to: 'lake_bronze', label: 'Streaming Kafka' },
        { from: 'src_fasah', to: 'lake_bronze', label: 'API Ingest' },
        { from: 'lake_bronze', to: 'lake_silver', label: 'dbt Transformation' },
        { from: 'lake_silver', to: 'lake_gold', label: 'MDM Aggregation' },
        { from: 'lake_silver', to: 'dw_fact_shipment', label: 'ELT Pipeline' },
        { from: 'lake_gold', to: 'dw_fact_finance', label: 'ELT Pipeline' },
        { from: 'dw_fact_finance', to: 'bi_exec', label: 'Direct SQL' },
        { from: 'dw_fact_shipment', to: 'ai_engine', label: 'Feature Store Sync' },
      ],
    };
  }
}
