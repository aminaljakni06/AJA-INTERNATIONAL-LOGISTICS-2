import { Router, Response } from 'express';
import { ClusterK8sService } from '../platform/ClusterK8sService';
import { GitOpsDevSecOpsService } from '../platform/GitOpsDevSecOpsService';
import { SREFinOpsService } from '../platform/SREFinOpsService';
import { requireAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// Get Platform High-Level Overview
router.get('/overview', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const clusters = ClusterK8sService.getClusters();
  const pipelines = GitOpsDevSecOpsService.getPipelineRuns();
  const slos = SREFinOpsService.getSLOs();
  const finops = SREFinOpsService.getFinOpsReport();
  const dr = SREFinOpsService.getDisasterRecoveryStatus();

  res.json({
    k8sClustersCount: clusters.length,
    activeNodesTotal: clusters.reduce((acc, c) => acc + c.nodeCount, 0),
    cpuCoresTotal: clusters.reduce((acc, c) => acc + c.totalCpuCores, 0),
    activePodsTotal: clusters.reduce((acc, c) => acc + c.activePodsCount, 0),
    recentPipelineRunsCount: pipelines.length,
    sreAverageAvailabilityPct: 99.993,
    finopsCurrentMonthlySpendUsd: finops.currentSpendUsd,
    finopsSavingsPotentialUsd: finops.optimizationOpportunitiesUsd,
    drRpoSeconds: dr.rpoSecondsCurrent,
    drRtoMinutes: dr.rtoMinutesCurrent,
    openTelemetryCollectorStatus: 'HEALTHY_ACTIVE',
    cncfComplianceMode: 'CNCF_GRADUATED_STACK',
  });
});

// K8s Multi-Cluster Endpoints
router.get('/k8s/clusters', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ clusters: ClusterK8sService.getClusters() });
});

router.post('/k8s/autoscale', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { clusterId, additionalNodes } = req.body;
  const result = ClusterK8sService.triggerClusterAutoscale(
    clusterId || 'K8S-PROD-RUH-01',
    Number(additionalNodes) || 4
  );
  res.json(result);
});

// GitOps & DevSecOps Endpoints
router.get('/devsecops/pipelines', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ pipelines: GitOpsDevSecOpsService.getPipelineRuns() });
});

router.post('/devsecops/trigger', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { appName, branch } = req.body;
  const newPipe = GitOpsDevSecOpsService.triggerPipeline(
    appName || 'aja-core-logistics-backend',
    branch || 'main'
  );
  res.json(newPipe);
});

// SRE & OpenTelemetry Endpoints
router.get('/sre/slos', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ slos: SREFinOpsService.getSLOs() });
});

// FinOps Cloud Cost Endpoints
router.get('/finops/report', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json(SREFinOpsService.getFinOpsReport());
});

// Disaster Recovery Endpoints
router.get('/dr/status', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json(SREFinOpsService.getDisasterRecoveryStatus());
});

router.post('/dr/test-failover', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const result = SREFinOpsService.executeDrFailoverTest();
  res.json(result);
});

export default router;
