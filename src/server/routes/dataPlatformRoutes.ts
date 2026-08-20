import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { LakehouseWarehouseService } from '../dataPlatform/LakehouseWarehouseService';
import { MDMGovernanceService } from '../dataPlatform/MDMGovernanceService';
import { DataCatalogQualityService } from '../dataPlatform/DataCatalogQualityService';
import { PipelineStreamingService } from '../dataPlatform/PipelineStreamingService';
import { BusinessIntelligenceService } from '../dataPlatform/BusinessIntelligenceService';

const router = Router();

/**
 * GET /api/data-platform/overview
 * Combined overview metrics for Lakehouse, Warehouse, MDM, Data Quality, and Pipelines
 */
router.get('/overview', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const lakehouseDatasets = LakehouseWarehouseService.getLakehouseDatasets();
  const warehouseMarts = LakehouseWarehouseService.getWarehouseMarts();
  const goldenRecords = MDMGovernanceService.getGoldenRecords();
  const qualityMetrics = DataCatalogQualityService.getQualityMetrics();
  const pipelines = PipelineStreamingService.getPipelineExecutions();
  const executiveBi = BusinessIntelligenceService.getExecutiveDashboardData();

  const totalStorageMB = lakehouseDatasets.reduce((acc, d) => acc + d.sizeMB, 0);
  const avgQualityScore = qualityMetrics.reduce((acc, q) => acc + q.overallQualityScore, 0) / qualityMetrics.length;

  res.json({
    summary: {
      lakehouseDatasetsCount: lakehouseDatasets.length,
      warehouseMartsCount: warehouseMarts.length,
      goldenRecordsCount: goldenRecords.length,
      totalStorageMB,
      totalStorageGB: (totalStorageMB / 1024).toFixed(2),
      avgQualityScore: Math.round(avgQualityScore * 10) / 10,
      activePipelinesCount: pipelines.filter((p) => p.status === 'RUNNING').length,
    },
    executiveBi,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/data-platform/lakehouse/datasets
 * List Lakehouse datasets across Bronze, Silver, Gold, and Feature Store layers
 */
router.get('/lakehouse/datasets', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const datasets = LakehouseWarehouseService.getLakehouseDatasets();
  res.json({ total: datasets.length, datasets });
});

/**
 * GET /api/data-platform/warehouse/marts
 * List Data Warehouse analytical Data Marts (Star & Snowflake schemas)
 */
router.get('/warehouse/marts', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const marts = LakehouseWarehouseService.getWarehouseMarts();
  res.json({ total: marts.length, marts });
});

/**
 * GET /api/data-platform/mdm/golden-records
 * Retrieve Master Data Management Golden Records
 */
router.get('/mdm/golden-records', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const domain = req.query.domain as string | undefined;
  const records = MDMGovernanceService.getGoldenRecords(domain);
  res.json({ total: records.length, records });
});

/**
 * POST /api/data-platform/mdm/golden-record
 * Create or Update MDM Golden Record with Data Steward approval flow
 */
router.post('/mdm/golden-record', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const record = MDMGovernanceService.createOrUpdateGoldenRecord(req.body);
    res.json({ success: true, record });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating Golden Record' });
  }
});

/**
 * GET /api/data-platform/catalog
 * Searchable Data Catalog & Lineage graph
 */
router.get('/catalog', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const query = req.query.q as string | undefined;
  const assets = DataCatalogQualityService.getCatalogAssets(query);
  const lineage = DataCatalogQualityService.getLineageGraph();
  res.json({ totalAssets: assets.length, assets, lineage });
});

/**
 * GET /api/data-platform/quality
 * Data Quality Engine metrics and freshness scores
 */
router.get('/quality', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const metrics = DataCatalogQualityService.getQualityMetrics();
  res.json({ total: metrics.length, metrics });
});

/**
 * GET /api/data-platform/pipelines
 * ETL / ELT / CDC / Streaming pipeline execution statuses
 */
router.get('/pipelines', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const executions = PipelineStreamingService.getPipelineExecutions();
  const topics = PipelineStreamingService.getStreamingTopicTelemetry();
  res.json({ total: executions.length, executions, topics });
});

/**
 * POST /api/data-platform/pipelines/trigger
 * Trigger pipeline run manually
 */
router.post('/pipelines/trigger', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { pipelineName } = req.body;
    if (!pipelineName) {
      res.status(400).json({ error: 'pipelineName is required' });
      return;
    }

    const execution = PipelineStreamingService.triggerPipeline(pipelineName);
    res.json({ success: true, execution });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error triggering pipeline' });
  }
});

/**
 * GET /api/data-platform/semantic-layer
 * Unified Business Definitions & Semantic Metrics
 */
router.get('/semantic-layer', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const metrics = BusinessIntelligenceService.getSemanticMetrics();
  res.json({ total: metrics.length, metrics });
});

/**
 * GET /api/data-platform/bi/dashboard
 * Executive BI Dashboard metrics
 */
router.get('/bi/dashboard', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const dashboard = BusinessIntelligenceService.getExecutiveDashboardData();
  res.json(dashboard);
});

/**
 * POST /api/data-platform/bi/query
 * Execute Self-Service Analytics query
 */
router.post('/bi/query', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { metricId, groupBy } = req.body;
    const result = BusinessIntelligenceService.executeSelfServiceQuery(metricId, groupBy);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing BI query' });
  }
});

export default router;
