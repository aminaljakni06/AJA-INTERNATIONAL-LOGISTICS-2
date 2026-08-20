import {
  WorkflowCondition,
  WorkflowAISuggestion,
  WorkflowInstance,
  WorkflowStepDef,
} from '../../types/workflow';

export class AutomationEngine {
  /**
   * Evaluate if a step condition passes based on metadata or entity properties
   */
  public static evaluateCondition(
    condition?: WorkflowCondition,
    contextData?: Record<string, any>
  ): boolean {
    if (!condition) return true;
    if (!contextData) return false;

    const fieldValue = contextData[condition.field];
    const targetValue = condition.value;

    switch (condition.operator) {
      case 'EQUALS':
        return fieldValue === targetValue;

      case 'NOT_EQUALS':
        return fieldValue !== targetValue;

      case 'GREATER_THAN':
        return Number(fieldValue) > Number(targetValue);

      case 'LESS_THAN':
        return Number(fieldValue) < Number(targetValue);

      case 'CONTAINS':
        return (
          typeof fieldValue === 'string' &&
          fieldValue.toLowerCase().includes(String(targetValue).toLowerCase())
        );

      case 'IN':
        return Array.isArray(targetValue) && targetValue.includes(fieldValue);

      default:
        return true;
    }
  }

  /**
   * Generates AI Approval Suggestion & Risk Analysis Hook
   */
  public static generateAISuggestion(
    instance: WorkflowInstance,
    step: WorkflowStepDef
  ): WorkflowAISuggestion {
    const priority = instance.priority;
    const isOverdue = instance.isSLAViolated;
    const rejections = instance.rejections.length;
    const amount = instance.metadata?.amount || instance.metadata?.value || 0;

    let suggestion: WorkflowAISuggestion['suggestion'] = 'APPROVE';
    let confidenceScore = 0.92;
    let riskScore: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let predictedResolutionMinutes = 45;
    let rationale = `AI analysis: Standard ${instance.category} parameters within normal enterprise variance threshold.`;

    if (amount > 100000) {
      riskScore = 'HIGH';
      suggestion = 'REVIEW_DETAILS';
      confidenceScore = 0.78;
      predictedResolutionMinutes = 180;
      rationale = `High financial value transaction ($${amount.toLocaleString()}). Detailed verification by Finance Director is recommended.`;
    } else if (rejections > 0) {
      riskScore = 'MEDIUM';
      suggestion = 'REJECT';
      confidenceScore = 0.85;
      predictedResolutionMinutes = 90;
      rationale = `Previous step rejected. Recommended review of non-conformance comments before re-evaluating.`;
    } else if (isOverdue || priority === 'CRITICAL') {
      riskScore = 'MEDIUM';
      suggestion = 'ESCALATE';
      confidenceScore = 0.88;
      predictedResolutionMinutes = 30;
      rationale = `Critical operational priority or SLA warning. Immediate assignment escalation suggested.`;
    }

    return {
      suggestion,
      confidenceScore,
      riskScore,
      predictedResolutionMinutes,
      rationale,
    };
  }
}
