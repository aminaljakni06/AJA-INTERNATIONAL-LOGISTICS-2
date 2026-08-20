import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { APIGatewayService } from '../integration/APIGatewayService';
import { EventBusBrokerService } from '../integration/EventBusBrokerService';
import { WorkflowOrchestrationService } from '../integration/WorkflowOrchestrationService';
import { WebhookConnectorService } from '../integration/WebhookConnectorService';

const router = Router();

/**
 * GET /api/integration/overview
 * Combined overview metrics for iPaaS, API Gateway, Event Bus, Service Mesh & Connectors
 */
router.get('/overview', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const endpoints = APIGatewayService.getEndpoints();
  const meshTelemetry = APIGatewayService.getServiceMeshTelemetry();
  const devPortalMetrics = APIGatewayService.getDeveloperPortalMetrics();
  const topics = EventBusBrokerService.getTopics();
  const sagas = EventBusBrokerService.getSagaInstances();
  const workflows = WorkflowOrchestrationService.getWorkflows();
  const webhooks = WebhookConnectorService.getWebhooks();
  const connectors = WebhookConnectorService.getConnectors();

  const totalGatewayRequestsToday = devPortalMetrics.totalRequestsToday;
  const avgGatewayLatencyMs = Math.round(endpoints.reduce((acc, e) => acc + e.avgLatencyMs, 0) / endpoints.length);
  const totalEventMessagesToday = topics.reduce((acc, t) => acc + t.totalMessagesToday, 0);

  res.json({
    summary: {
      totalEndpointsCount: endpoints.length,
      totalGatewayRequestsToday,
      avgGatewayLatencyMs,
      totalTopicsCount: topics.length,
      totalEventMessagesToday,
      activeSagasCount: sagas.filter((s) => s.status === 'IN_PROGRESS').length,
      activeWorkflowsCount: workflows.length,
      healthyConnectorsCount: connectors.filter((c) => c.healthStatus === 'HEALTHY').length,
      activeWebhooksCount: webhooks.filter((w) => w.activeStatus).length,
    },
    devPortalMetrics,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/integration/apis
 * List managed APIs and endpoints
 */
router.get('/apis', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const endpoints = APIGatewayService.getEndpoints();
  res.json({ total: endpoints.length, endpoints });
});

/**
 * POST /api/integration/api/test
 * Test invoke API Gateway route
 */
router.post('/api/test', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { endpointId, payload } = req.body;
    const result = APIGatewayService.testInvokeEndpoint(endpointId, payload);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error invoking endpoint' });
  }
});

/**
 * GET /api/integration/events
 * Event Bus Topics and Saga WorkflowInstances
 */
router.get('/events', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const topics = EventBusBrokerService.getTopics();
  const sagas = EventBusBrokerService.getSagaInstances();
  res.json({ totalTopics: topics.length, topics, sagas });
});

/**
 * POST /api/integration/event/publish
 * Publish test domain event to Kafka/RabbitMQ Topic
 */
router.post('/event/publish', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { topicName, eventType, eventPayload } = req.body;
    if (!topicName || !eventType) {
      res.status(400).json({ error: 'topicName and eventType are required' });
      return;
    }

    const result = EventBusBrokerService.publishEvent(topicName, eventType, eventPayload);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error publishing event' });
  }
});

/**
 * GET /api/integration/workflows
 * Configurable orchestration workflows
 */
router.get('/workflows', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const workflows = WorkflowOrchestrationService.getWorkflows();
  res.json({ total: workflows.length, workflows });
});

/**
 * POST /api/integration/workflow/trigger
 * Manually trigger workflow
 */
router.post('/workflow/trigger', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { workflowId, customContext } = req.body;
    const execution = WorkflowOrchestrationService.triggerWorkflow(workflowId, customContext);
    res.json({ success: true, execution });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error triggering workflow' });
  }
});

/**
 * GET /api/integration/service-mesh
 * Service Mesh telemetry and Zero Trust security status
 */
router.get('/service-mesh', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const meshTelemetry = APIGatewayService.getServiceMeshTelemetry();
  res.json({ totalServices: meshTelemetry.length, meshTelemetry });
});

/**
 * GET /api/integration/webhooks
 * List Webhook subscriptions and HMAC security keys
 */
router.get('/webhooks', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const webhooks = WebhookConnectorService.getWebhooks();
  res.json({ total: webhooks.length, webhooks });
});

/**
 * GET /api/integration/connectors
 * List Pre-built Enterprise Connectors (SAP, ZATCA, Fasah, Adyen, WhatsApp, etc.)
 */
router.get('/connectors', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const connectors = WebhookConnectorService.getConnectors();
  res.json({ total: connectors.length, connectors });
});

/**
 * GET /api/integration/developer-portal
 * Developer Portal metrics and OpenAPI/AsyncAPI specifications
 */
router.get('/developer-portal', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const devMetrics = APIGatewayService.getDeveloperPortalMetrics();
  const endpoints = APIGatewayService.getEndpoints();
  res.json({
    metrics: devMetrics,
    specs: endpoints.map((e) => ({
      id: e.id,
      nameAr: e.nameAr,
      nameEn: e.nameEn,
      path: e.path,
      type: e.type,
      specUrl: e.openApiSpecUrl || `/docs/${e.type.toLowerCase()}/${e.id}.json`,
    })),
  });
});

export default router;
