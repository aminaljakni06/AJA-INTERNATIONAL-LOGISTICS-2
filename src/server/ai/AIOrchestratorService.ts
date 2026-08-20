import { AgentManagerService } from './AgentManagerService';
import { ModelRoutingService } from './ModelRoutingService';
import { RAGService } from './RAGService';
import { DecisionIntelligenceService } from './DecisionIntelligenceService';
import { DocumentIntelligenceService } from './DocumentIntelligenceService';
import { AISafetyService } from './AISafetyService';
import { AIAgentRole, AIPlatformTelemetry } from './types';

export class AIOrchestratorService {
  private static telemetryData: AIPlatformTelemetry = {
    totalInferences: 12840,
    avgLatencyMs: 345,
    estimatedCostUSD: 18.45,
    activeAgentsCount: 21,
    safetyBlocksCount: 14,
    modelUsageBreakdown: {
      'gemini-3.6-flash': 10500,
      'openai-gpt4o': 1200,
      'anthropic-claude35': 640,
      'mistral-large': 320,
      'llama-3.3-70b': 180,
    },
    uptimePercentage: 99.98,
  };

  public static async executeAgentTask(
    agentRole: AIAgentRole,
    userQuery: string,
    context?: Record<string, any>
  ) {
    this.telemetryData.totalInferences++;

    // 1. Safety Audit
    const safetyAudit = AISafetyService.auditPromptAndContent(userQuery);
    if (!safetyAudit.safetyPassed) {
      this.telemetryData.safetyBlocksCount++;
      return {
        agent: AgentManagerService.getAgentByRole(agentRole),
        safetyAudit,
        response: 'تم تعليق المعالجة نظراً لاكتشاف مخالفة أمنية في الاستفسار.',
        ragContext: null,
        decisionResult: null,
      };
    }

    // 2. Agent Lookup
    const agent = AgentManagerService.getAgentByRole(agentRole);
    if (!agent) {
      throw new Error(`Agent with role ${agentRole} not found in catalog.`);
    }

    // 3. Multi-Model Route Selection
    const route = ModelRoutingService.selectOptimalModel({
      preferredModel: agent.modelPreference,
      securityLevel: agent.securityLevel,
    });

    // Update telemetry
    this.telemetryData.modelUsageBreakdown[route.selectedModel] =
      (this.telemetryData.modelUsageBreakdown[route.selectedModel] || 0) + 1;

    // 4. RAG Knowledge Fetch
    const ragContext = await RAGService.searchKnowledge(userQuery, undefined, 2);

    // 5. Decision Intelligence (if applicable)
    let decisionResult = null;
    if (userQuery.includes('ناقل') || userQuery.includes('شحن') || userQuery.includes('تسعير') || userQuery.includes('مسار')) {
      decisionResult = DecisionIntelligenceService.runDecisionOptimization({
        decisionType: userQuery.includes('تسعير') ? 'DYNAMIC_PRICING' : 'CARRIER_SELECTION',
        parameters: context || {},
      });
    }

    // 6. Synthesize Response
    const explainability = AISafetyService.generateExplainabilitySummary(
      route.selectedModel,
      0.96,
      ragContext.documents.map((d) => d.id)
    );

    const responseText =
      `مرحباً بك، معك **${agent.nameAr}** (${agent.nameEn}) من إدارة ${agent.department}.\n\n` +
      `بناءً على طلبك واستعراض المعرفة المؤسسية من خلال (${ragContext.documents.length} مراجع)، إليك التوصية والتحليل:\n\n` +
      `${ragContext.synthesizedAnswer}\n` +
      (decisionResult ? `💡 **القرار الموصى به ديناميكياً:** ${decisionResult.recommendation}\n\n` : '') +
      `🛡️ **ملاحظة الشفافية والسلامة:** ${explainability.explainabilityText}`;

    return {
      agent,
      modelRoute: route,
      safetyAudit,
      ragContext,
      decisionResult,
      explainability,
      responseText,
      timestamp: new Date().toISOString(),
    };
  }

  public static getTelemetry(): AIPlatformTelemetry {
    return this.telemetryData;
  }
}
