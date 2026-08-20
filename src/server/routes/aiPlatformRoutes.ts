import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { AgentManagerService } from '../ai/AgentManagerService';
import { AIOrchestratorService } from '../ai/AIOrchestratorService';
import { ModelRoutingService } from '../ai/ModelRoutingService';
import { RAGService } from '../ai/RAGService';
import { DecisionIntelligenceService } from '../ai/DecisionIntelligenceService';
import { DocumentIntelligenceService } from '../ai/DocumentIntelligenceService';
import { AISafetyService } from '../ai/AISafetyService';
import { AIAgentRole } from '../ai/types';

const router = Router();

/**
 * GET /api/ai/platform/agents
 * List all 21 specialized Enterprise AI Agents in the platform catalog
 */
router.get('/agents', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const agents = AgentManagerService.getAllAgents();
  res.json({
    total: agents.length,
    agents,
  });
});

/**
 * POST /api/ai/platform/agent/invoke
 * Invoke a specific specialized AI agent
 */
router.post('/agent/invoke', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { agentRole, query, context } = req.body;
    if (!agentRole || !query) {
      res.status(400).json({ error: 'agentRole and query parameters are required' });
      return;
    }

    const result = await AIOrchestratorService.executeAgentTask(
      agentRole as AIAgentRole,
      query,
      context
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing AI agent task' });
  }
});

/**
 * POST /api/ai/platform/rag/search
 * Enterprise hybrid RAG knowledge search with citations
 */
router.post('/rag/search', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query, categoryFilter } = req.body;
    if (!query) {
      res.status(400).json({ error: 'query string is required for RAG search' });
      return;
    }

    const result = await RAGService.searchKnowledge(query, categoryFilter);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing RAG search' });
  }
});

/**
 * POST /api/ai/platform/decision-intelligence
 * Execute Decision Intelligence & Optimization Engine
 */
router.post('/decision-intelligence', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { decisionType, parameters, constraints } = req.body;
    if (!decisionType) {
      res.status(400).json({ error: 'decisionType is required' });
      return;
    }

    const result = DecisionIntelligenceService.runDecisionOptimization({
      decisionType,
      parameters: parameters || {},
      constraints,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error in decision intelligence optimization' });
  }
});

/**
 * POST /api/ai/platform/predict
 * Predictive Analytics Engine
 */
router.post('/predict', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { predictionType, historicalData, timeHorizonDays } = req.body;
    if (!predictionType) {
      res.status(400).json({ error: 'predictionType is required' });
      return;
    }

    const result = DecisionIntelligenceService.runPredictiveAnalytics({
      predictionType,
      historicalData: historicalData || {},
      timeHorizonDays: timeHorizonDays || 30,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error in predictive analytics' });
  }
});

/**
 * POST /api/ai/platform/doc-intelligence
 * AI Document Extraction & OCR Entity Matching
 */
router.post('/doc-intelligence', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentType, fileName, textContent } = req.body;
    if (!documentType || !fileName) {
      res.status(400).json({ error: 'documentType and fileName are required' });
      return;
    }

    const extraction = DocumentIntelligenceService.extractDocumentFields(
      documentType,
      fileName,
      textContent
    );

    res.json(extraction);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error in document intelligence processing' });
  }
});

/**
 * POST /api/ai/platform/safety/audit
 * Safety, Toxicity, Prompt Injection Shield & Audit
 */
router.post('/safety/audit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'prompt is required' });
      return;
    }

    const audit = AISafetyService.auditPromptAndContent(prompt);
    res.json(audit);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error in safety audit' });
  }
});

/**
 * GET /api/ai/platform/telemetry
 * Telemetry metrics, model routing telemetry & usage breakdown
 */
router.get('/telemetry', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const telemetry = AIOrchestratorService.getTelemetry();
  const models = ModelRoutingService.getModelTelemetry();

  res.json({
    telemetry,
    models,
    timestamp: new Date().toISOString(),
  });
});

export default router;
