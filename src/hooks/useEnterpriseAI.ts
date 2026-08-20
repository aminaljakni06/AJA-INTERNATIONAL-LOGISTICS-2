/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise AI Capabilities Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { useState, useCallback } from 'react';
import { enterpriseAIService } from '../services/aiService';
import { RequestContext, AIServiceOptions } from '../types/sharedServices';

export function useEnterpriseAI(context?: RequestContext) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateText = useCallback(
    async (prompt: string, options?: AIServiceOptions) => {
      setIsGenerating(true);
      setError(null);
      const res = await enterpriseAIService.generateText(prompt, options, context);
      setIsGenerating(false);

      if (!res.success) {
        setError(res.error || 'AI request failed');
      }
      return res;
    },
    [context]
  );

  const summarizeDocument = useCallback(
    async (content: string, isAr: boolean = false) => {
      setIsGenerating(true);
      setError(null);
      const res = await enterpriseAIService.summarizeDocument(content, isAr, context);
      setIsGenerating(false);

      if (!res.success) {
        setError(res.error || 'Summarization failed');
      }
      return res;
    },
    [context]
  );

  const analyzeCustomsRisk = useCallback(
    async (shipmentDetails: any) => {
      setIsGenerating(true);
      setError(null);
      const res = await enterpriseAIService.analyzeCustomsRisk(shipmentDetails, context);
      setIsGenerating(false);

      if (!res.success) {
        setError(res.error || 'Risk evaluation failed');
      }
      return res;
    },
    [context]
  );

  return {
    isGenerating,
    error,
    generateText,
    summarizeDocument,
    analyzeCustomsRisk,
  };
}
