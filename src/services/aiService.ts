/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise AI Application Service
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { ServiceResult, RequestContext, AIServiceOptions, AIServiceResult } from '../types/sharedServices';
import { baseEnterpriseService } from './baseService';

class EnterpriseAIService {
  /**
   * Generates AI text completion / analysis
   */
  public async generateText(
    prompt: string,
    options?: AIServiceOptions,
    context?: RequestContext
  ): Promise<ServiceResult<AIServiceResult<string>>> {
    return baseEnterpriseService.fetchWithContext<AIServiceResult<string>>(
      '/api/ai/generate',
      {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          systemPrompt: options?.systemPrompt,
          maxTokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7,
          isAr: options?.isAr ?? false,
        }),
      },
      context
    );
  }

  /**
   * Summarizes logistics documents or shipment notes
   */
  public async summarizeDocument(
    content: string,
    isAr: boolean = false,
    context?: RequestContext
  ): Promise<ServiceResult<string>> {
    return baseEnterpriseService.fetchWithContext<string>(
      '/api/ai/summarize',
      {
        method: 'POST',
        body: JSON.stringify({ content, isAr }),
      },
      context
    );
  }

  /**
   * Analyzes shipment customs risk & compliance using AI
   */
  public async analyzeCustomsRisk(
    shipmentDetails: any,
    context?: RequestContext
  ): Promise<ServiceResult<{ riskScore: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; recommendations: string[] }>> {
    return baseEnterpriseService.fetchWithContext<{
      riskScore: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      recommendations: string[];
    }>(
      '/api/ai/customs-risk',
      {
        method: 'POST',
        body: JSON.stringify(shipmentDetails),
      },
      context
    );
  }
}

export const enterpriseAIService = new EnterpriseAIService();
