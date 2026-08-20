import { Router, Request, Response } from 'express';
import { requireAuth, requireRoles } from '../auth';
import { EventBusService } from '../../services/eventBusService';
import { EventRegistry } from '../../lib/events/EventRegistry';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/events/definitions
 * List registered event definitions and payload specs
 */
router.get('/definitions', (_req: Request, res: Response) => {
  try {
    const definitions = EventRegistry.getAllDefinitions();
    res.json({ success: true, count: definitions.length, definitions });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch definitions' });
  }
});

/**
 * GET /api/events/history
 * Query event history logs
 */
router.get('/history', (req: Request, res: Response) => {
  try {
    const { eventName, module, correlationId, aggregateId, limit } = req.query;
    const history = EventBusService.getHistory({
      eventName: eventName as any,
      module: module as any,
      correlationId: correlationId as string,
      aggregateId: aggregateId as string,
      limit: limit ? parseInt(limit as string, 10) : 100,
    });
    res.json({ success: true, count: history.length, history });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch event history' });
  }
});

/**
 * GET /api/events/dlq
 * Query Dead Letter Queue items
 */
router.get('/dlq', requireRoles('STAFF', 'ADMIN'), (_req: Request, res: Response) => {
  try {
    const dlq = EventBusService.getDeadLetterQueue();
    res.json({ success: true, count: dlq.length, deadLetterQueue: dlq });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch DLQ' });
  }
});

/**
 * POST /api/events/publish
 * Publish a domain event from API client or external webhooks
 */
router.post('/publish', requireRoles('STAFF', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, aggregateId, aggregateType, module, payload, priority, correlationId, triggeredBy } = req.body;

    if (!name || !aggregateId || !aggregateType || !payload) {
      return res.status(400).json({
        error: 'Missing required event fields: name, aggregateId, aggregateType, payload',
      });
    }

    const event = await EventBusService.publish({
      name,
      aggregateId,
      aggregateType,
      module: module || 'SYSTEM',
      payload,
      priority,
      correlationId,
      triggeredBy,
    });

    res.status(201).json({ success: true, event });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to publish event' });
  }
});

/**
 * POST /api/events/replay
 * Replay past events
 */
router.post('/replay', async (req: Request, res: Response) => {
  try {
    const { eventName, module, correlationId, aggregateId, limit } = req.body;
    const replayedCount = await EventBusService.replay({
      eventName,
      module,
      correlationId,
      aggregateId,
      limit,
    });
    res.json({ success: true, replayedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to replay events' });
  }
});

/**
 * POST /api/events/dlq/:id/retry
 * Retry dead letter item
 */
router.post('/dlq/:id/retry', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await EventBusService.retryDeadLetter(id);
    if (!success) {
      return res.status(404).json({ error: 'DLQ item not found' });
    }
    res.json({ success: true, message: `Successfully retried DLQ entry ${id}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retry DLQ entry' });
  }
});

export default router;
