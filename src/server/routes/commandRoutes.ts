import { Router, Response } from 'express';
import { DigitalTwinCommandService } from '../command/DigitalTwinCommandService';
import { requireAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// Overview & Executive Cockpit
router.get('/overview', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const kpis = DigitalTwinCommandService.getExecutiveKPIs();
  const twinEntities = DigitalTwinCommandService.getDigitalTwinEntities();
  const aiRecs = DigitalTwinCommandService.getAIRecommendations();
  const incidents = DigitalTwinCommandService.getIncidents();
  const simulations = DigitalTwinCommandService.getSimulations();

  res.json({
    kpis,
    twinEntitiesCount: twinEntities.length,
    pendingAiRecommendationsCount: aiRecs.filter((r) => r.status === 'PENDING_APPROVAL').length,
    activeIncidentsCount: incidents.filter((i) => i.status !== 'RESOLVED').length,
    simulationScenariosCount: simulations.length,
    c4iStatus: 'FULL_OPERATIONAL_COMMAND',
    gisEngineStatus: 'LIVE_SPATIAL_SYNC_ACTIVE',
  });
});

// Digital Twin Entities
router.get('/digital-twin/entities', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ entities: DigitalTwinCommandService.getDigitalTwinEntities() });
});

// Executive Cockpit KPIs
router.get('/executive-cockpit/kpis', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json(DigitalTwinCommandService.getExecutiveKPIs());
});

// AI Decision Center
router.get('/ai-decision/recommendations', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ recommendations: DigitalTwinCommandService.getAIRecommendations() });
});

router.post('/ai-decision/approve', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { recommendationId } = req.body;
  const result = DigitalTwinCommandService.approveAIRecommendation(recommendationId);
  res.json(result);
});

// Crisis Management
router.get('/crisis/incidents', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ incidents: DigitalTwinCommandService.getIncidents() });
});

// Simulations
router.get('/simulations/scenarios', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ scenarios: DigitalTwinCommandService.getSimulations() });
});

router.post('/simulations/run', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { scenarioId } = req.body;
  const result = DigitalTwinCommandService.runSimulationScenario(scenarioId);
  res.json(result);
});

export default router;
