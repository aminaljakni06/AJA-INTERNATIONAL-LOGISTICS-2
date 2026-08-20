export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'TOP_SECRET';

export type PipelineType = 'ETL' | 'ELT' | 'CDC' | 'STREAMING' | 'BATCH';

export type PipelineStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SCHEDULED' | 'PAUSED';

export interface LakehouseDataset {
  id: string;
  name: string;
  layer: 'RAW_BRONZE' | 'CLEANSED_SILVER' | 'CURATED_GOLD' | 'FEATURE_STORE';
  sourceSystem: string; // ERP, CRM, WMS, TMS, IoT, GPS, Finance
  format: 'PARQUET' | 'DELTA' | 'ICEBERG' | 'AVRO' | 'JSON' | 'CSV';
  recordCount: number;
  sizeMB: number;
  lastIngestedAt: string;
  schemaVersion: string;
  timeTravelSupported: boolean;
  classification: DataClassification;
}

export interface DataWarehouseMart {
  id: string;
  martName: string; // Finance, WMS, TMS, Sales, Fleet, Risk
  factTablesCount: number;
  dimTablesCount: number;
  totalRows: number;
  lastRefreshedAt: string;
  starSchemaConfig: {
    factTable: string;
    dimensionTables: string[];
  };
  scdType2Enabled: boolean;
}

export interface MDMGoldenRecord {
  id: string;
  masterDomain: 'CUSTOMER' | 'SUPPLIER' | 'EMPLOYEE' | 'VEHICLE' | 'DRIVER' | 'WAREHOUSE' | 'BRANCH' | 'PRODUCT' | 'CARRIER' | 'PORT';
  entityNameEn: string;
  entityNameAr: string;
  globalIdentifier: string; // e.g. AJA-CUST-9002
  sourceSystemsSynced: string[]; // ERP, CRM, WMS
  dataSteward: string;
  approvalStatus: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
  qualityScore: number; // 0-100
  versionHistoryCount: number;
  lastUpdatedAt: string;
  attributes: Record<string, any>;
}

export interface DataCatalogAsset {
  id: string;
  assetName: string;
  assetType: 'DATASET' | 'TABLE' | 'VIEW' | 'API' | 'REPORT' | 'PIPELINE' | 'ML_MODEL';
  domain: string;
  owner: string;
  steward: string;
  descriptionEn: string;
  descriptionAr: string;
  tags: string[];
  classification: DataClassification;
  qualityScore: number;
  upstreamDependencies: string[];
  downstreamConsumers: string[];
  certified: boolean;
  updatedAt: string;
}

export interface DataQualityMetric {
  id: string;
  datasetOrTableName: string;
  completenessPct: number;
  accuracyPct: number;
  consistencyPct: number;
  uniquenessPct: number;
  validityPct: number;
  timelinessPct: number;
  overallQualityScore: number;
  anomaliesDetectedCount: number;
  lastValidatedAt: string;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
}

export interface PipelineExecution {
  id: string;
  pipelineName: string;
  type: PipelineType;
  sourceSystem: string;
  targetDestination: string;
  recordsProcessed: number;
  durationSeconds: number;
  status: PipelineStatus;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface SemanticBusinessMetric {
  metricId: string;
  nameEn: string;
  nameAr: string;
  category: 'FINANCIAL' | 'OPERATIONAL' | 'CUSTOMER' | 'FLEET' | 'WAREHOUSE' | 'AI';
  formulaDefinition: string;
  unit: string;
  currentValue: number;
  targetValue: number;
  trend: 'UPWARD' | 'DOWNWARD' | 'STABLE';
  lastCalculatedAt: string;
}

export interface ExecutiveBIDashboardData {
  summaryKpis: {
    totalRevenueSAR: number;
    ebitdaSAR: number;
    grossMarginPct: number;
    otifDeliveryPct: number; // On-Time In-Full
    activeShipments: number;
    warehouseCapacityUtilizationPct: number;
    fleetEfficiencyScore: number;
    aiAdoptionPercentage: number;
  };
  monthlyRevenueTrend: Array<{ month: string; revenueSAR: number; targetSAR: number; costSAR: number }>;
  regionalShipmentDistribution: Array<{ region: string; count: number; percentage: number }>;
  carrierPerformanceComparison: Array<{ carrierName: string; otifPct: number; avgCostSAR: number; volume: number }>;
  dataQualityHealthScore: number;
  pipelineHealthPct: number;
}

export interface AIFeatureStoreDataset {
  featureGroupId: string;
  featureGroupName: string;
  domain: string;
  featureCount: number;
  primaryKey: string;
  updateFrequency: 'REAL_TIME' | 'HOURLY' | 'DAILY';
  mlUseCases: string[];
  lastSyncedAt: string;
}
