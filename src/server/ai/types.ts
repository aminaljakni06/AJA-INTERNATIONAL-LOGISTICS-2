export type AIAgentRole =
  | 'EXECUTIVE_ADVISOR'
  | 'FINANCE_ANALYST'
  | 'TREASURY_ANALYST'
  | 'SALES_ASSISTANT'
  | 'MARKETING_ASSISTANT'
  | 'CUSTOMER_SUPPORT'
  | 'OPERATIONS_COORDINATOR'
  | 'WAREHOUSE_ASSISTANT'
  | 'FLEET_COORDINATOR'
  | 'PROCUREMENT_ASSISTANT'
  | 'HR_ASSISTANT'
  | 'LEGAL_ASSISTANT'
  | 'COMPLIANCE_ASSISTANT'
  | 'RISK_INTELLIGENCE'
  | 'SECURITY_ASSISTANT'
  | 'ERP_ASSISTANT'
  | 'CRM_ASSISTANT'
  | 'DOCUMENT_INTELLIGENCE'
  | 'BUSINESS_INTELLIGENCE'
  | 'DEVELOPER_ASSISTANT'
  | 'DEVOPS_ASSISTANT';

export type AIModelAlias =
  | 'gemini-3.6-flash'
  | 'openai-gpt4o'
  | 'anthropic-claude35'
  | 'mistral-large'
  | 'llama-3.3-70b';

export interface AIAgentMetadata {
  id: AIAgentRole;
  nameEn: string;
  nameAr: string;
  department: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
  allowedTools: string[];
  securityLevel: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED' | 'TOP_SECRET';
  modelPreference: AIModelAlias;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DEPRECATED';
}

export interface ModelRoutingConfig {
  preferredModel: AIModelAlias;
  maxLatencyMs: number;
  maxCostPer1kTokens: number;
  fallbackChain: AIModelAlias[];
  securityEnforcement: boolean;
}

export interface RAGKnowledgeDoc {
  id: string;
  title: string;
  category: 'POLICY' | 'CONTRACT' | 'INVOICE' | 'SHIPMENT' | 'WAREHOUSE' | 'ERP' | 'CRM' | 'FINANCE';
  content: string;
  metadata: Record<string, any>;
  embeddingVector?: number[];
  updatedAt: string;
}

export interface RAGSearchResult {
  query: string;
  documents: Array<{
    id: string;
    title: string;
    category: string;
    snippet: string;
    relevanceScore: number;
    citation: string;
  }>;
  synthesizedAnswer: string;
  confidenceScore: number;
}

export interface DecisionIntelligenceRequest {
  decisionType: 'CARRIER_SELECTION' | 'ROUTE_OPTIMIZATION' | 'DYNAMIC_PRICING' | 'INVENTORY_ALLOCATION' | 'CASH_FLOW_FORECAST';
  parameters: Record<string, any>;
  constraints?: Record<string, any>;
}

export interface DecisionIntelligenceResult {
  decisionType: string;
  recommendation: string;
  confidenceScore: number;
  reasoningSummary: string;
  dataSourcesUsed: string[];
  alternativeOptions: Array<{ option: string; score: number; tradeOff: string }>;
  costSavingsEstimatedSAR?: number;
  timeSavingsMinutes?: number;
  timestamp: string;
}

export interface PredictiveAnalyticsRequest {
  predictionType: 'DEMAND_FORECAST' | 'REVENUE_FORECAST' | 'ETA_DELAY' | 'CHURN_RISK' | 'MAINTENANCE_PREDICTION';
  historicalData: Record<string, any>;
  timeHorizonDays: number;
}

export interface PredictiveAnalyticsResult {
  predictionType: string;
  predictedValue: any;
  trend: 'UPWARD' | 'DOWNWARD' | 'STABLE';
  confidenceInterval: { lower: number; upper: number };
  keyFactors: Array<{ factor: string; impact: string }>;
  recommendedActions: string[];
  timestamp: string;
}

export interface DocumentIntelligenceExtraction {
  documentType: 'BILL_OF_LADING' | 'COMMERCIAL_INVOICE' | 'CUSTOMS_DECLARATION' | 'PACKING_LIST' | 'PURCHASE_ORDER';
  fileName: string;
  ocrConfidence: number;
  extractedFields: Record<string, any>;
  validationStatus: 'VALID' | 'WARNING' | 'INVALID';
  validationErrors: string[];
  complianceNotes: string;
}

export interface AISafetyAudit {
  prompt: string;
  isPromptInjection: boolean;
  containsPII: boolean;
  toxicityScore: number;
  hallucinationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  humanApprovalRequired: boolean;
  safetyPassed: boolean;
  notes: string;
}

export interface AIPlatformTelemetry {
  totalInferences: number;
  avgLatencyMs: number;
  estimatedCostUSD: number;
  activeAgentsCount: number;
  safetyBlocksCount: number;
  modelUsageBreakdown: Record<AIModelAlias, number>;
  uptimePercentage: number;
}
