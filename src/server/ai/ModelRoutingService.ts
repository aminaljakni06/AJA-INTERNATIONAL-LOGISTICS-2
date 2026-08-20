import { AIModelAlias, ModelRoutingConfig } from './types';

export class ModelRoutingService {
  private static readonly MODEL_SPECS: Record<AIModelAlias, { costPer1k: number; avgLatencyMs: number; provider: string; securityScore: number }> = {
    'gemini-3.6-flash': { costPer1k: 0.00015, avgLatencyMs: 320, provider: 'Google AI Studio', securityScore: 98 },
    'openai-gpt4o': { costPer1k: 0.0025, avgLatencyMs: 650, provider: 'OpenAI Enterprise', securityScore: 95 },
    'anthropic-claude35': { costPer1k: 0.003, avgLatencyMs: 710, provider: 'Anthropic Bedrock', securityScore: 96 },
    'mistral-large': { costPer1k: 0.002, avgLatencyMs: 480, provider: 'Mistral AI', securityScore: 92 },
    'llama-3.3-70b': { costPer1k: 0.0008, avgLatencyMs: 420, provider: 'Meta On-Premise', securityScore: 99 },
  };

  public static selectOptimalModel(config: Partial<ModelRoutingConfig> & { taskType?: string; securityLevel?: string }): {
    selectedModel: AIModelAlias;
    reasoning: string;
    estimatedLatencyMs: number;
    estimatedCostUSD: number;
  } {
    const preferred = config.preferredModel || 'gemini-3.6-flash';
    const security = config.securityLevel || 'CONFIDENTIAL';
    const maxLatency = config.maxLatencyMs || 1000;

    // Highest security or lowest latency preference
    if (security === 'TOP_SECRET') {
      return {
        selectedModel: 'llama-3.3-70b',
        reasoning: 'Routed to Llama 3.3 70B On-Premise for isolated air-gapped data compliance.',
        estimatedLatencyMs: this.MODEL_SPECS['llama-3.3-70b'].avgLatencyMs,
        estimatedCostUSD: this.MODEL_SPECS['llama-3.3-70b'].costPer1k,
      };
    }

    if (maxLatency < 400 || preferred === 'gemini-3.6-flash') {
      return {
        selectedModel: 'gemini-3.6-flash',
        reasoning: 'Routed to Google Gemini 3.6 Flash for ultra-fast response, multimodal support, and optimal cost efficiency.',
        estimatedLatencyMs: this.MODEL_SPECS['gemini-3.6-flash'].avgLatencyMs,
        estimatedCostUSD: this.MODEL_SPECS['gemini-3.6-flash'].costPer1k,
      };
    }

    const spec = this.MODEL_SPECS[preferred] || this.MODEL_SPECS['gemini-3.6-flash'];
    return {
      selectedModel: preferred,
      reasoning: `Routed to ${preferred} based on agent preference and model capability requirements.`,
      estimatedLatencyMs: spec.avgLatencyMs,
      estimatedCostUSD: spec.costPer1k,
    };
  }

  public static getModelTelemetry() {
    return {
      availableModels: Object.keys(this.MODEL_SPECS).map((m) => ({
        model: m as AIModelAlias,
        ...this.MODEL_SPECS[m as AIModelAlias],
      })),
      defaultFallback: 'gemini-3.6-flash' as AIModelAlias,
    };
  }
}
