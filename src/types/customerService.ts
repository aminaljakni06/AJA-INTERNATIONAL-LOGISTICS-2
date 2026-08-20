export type CaseType = 
  | 'INCIDENT' 
  | 'COMPLAINT' 
  | 'CLAIM' 
  | 'SERVICE_REQUEST' 
  | 'GENERAL_INQUIRY' 
  | 'BILLING_ISSUE' 
  | 'SHIPMENT_ISSUE' 
  | 'CUSTOMS_ISSUE' 
  | 'WAREHOUSE_ISSUE' 
  | 'FLEET_ISSUE' 
  | 'TECHNICAL_ISSUE';

export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CaseSeverity = 'S1_CRITICAL_OUTAGE' | 'S2_MAJOR_IMPACT' | 'S3_MINOR_IMPACT' | 'S4_INFORMATIONAL';

export type CaseStatus = 
  | 'NEW' 
  | 'IN_PROGRESS' 
  | 'PENDING_CUSTOMER' 
  | 'PENDING_VENDOR' 
  | 'ESCALATED' 
  | 'RESOLVED' 
  | 'CLOSED' 
  | 'CANCELLED';

export type ServiceRequestType = 
  | 'PICKUP_REQUEST' 
  | 'DELIVERY_REQUEST' 
  | 'WAREHOUSE_REQUEST' 
  | 'RATE_REQUEST' 
  | 'DOCUMENT_REQUEST' 
  | 'REFUND_REQUEST' 
  | 'INSURANCE_REQUEST' 
  | 'CUSTOM_REQUEST';

export interface CaseNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'AGENT' | 'MANAGER' | 'CUSTOMER' | 'AI_ASSISTANT';
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface CaseTimelineEvent {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  actorName: string;
}

export interface ServiceCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  caseType: CaseType;
  serviceRequestType?: ServiceRequestType;
  priority: CasePriority;
  severity: CaseSeverity;
  status: CaseStatus;
  customerId: string;
  customerName: string;
  businessPartnerId?: string;
  shipmentRef?: string;
  contractRef?: string;
  invoiceRef?: string;
  department: 'LOGISTICS_OPS' | 'CUSTOMS_CLEARANCE' | 'WAREHOUSING' | 'FINANCE_BILLING' | 'FLEET' | 'IT_SUPPORT';
  assignedAgentId?: string;
  assignedAgentName?: string;
  firstResponseTimeMinutes?: number;
  resolutionTimeHours?: number;
  slaBreached: boolean;
  slaDeadline: string;
  escalationLevel: number; // 0=None, 1=Supervisor, 2=Department Head, 3=Executive
  sentimentScore: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT';
  notes: CaseNote[];
  timeline: CaseTimelineEvent[];
  csatRating?: number; // 1-5
  csatFeedback?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// Knowledge Base Article
export interface KnowledgeArticle {
  id: string;
  articleNumber: string;
  title: string;
  summary: string;
  content: string;
  category: 'SHIPMENT' | 'CUSTOMS' | 'BILLING' | 'WAREHOUSING' | 'SLA_POLICIES' | 'GENERAL_FAQ';
  tags: string[];
  authorName: string;
  viewsCount: number;
  helpfulCount: number;
  unhelpfulCount: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  updatedAt: string;
}

// Queue & SLA Metrics
export interface DepartmentQueue {
  id: string;
  departmentName: string;
  activeAgentsCount: number;
  openCasesCount: number;
  avgResolutionTimeHours: number;
  slaComplianceRatePercentage: number;
}

// CSAT / NPS Metrics
export interface ServiceMetricsSummary {
  totalCases: number;
  openCases: number;
  resolvedCases: number;
  avgResponseTimeMinutes: number;
  slaCompliancePercentage: number;
  csatScore: number; // e.g., 4.8 / 5
  npsScore: number; // e.g., +62
  cesScore: number; // Customer Effort Score e.g., 4.6 / 5
}

// AI Service Assist Request / Response
export interface AIServiceAssistRequest {
  caseTitle: string;
  caseDescription: string;
  customerName: string;
  caseType: string;
  priority: string;
  notesText?: string;
}

export interface AIServiceAssistResponse {
  autoCategory: string;
  autoPriority: CasePriority;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT';
  suggestedReplyAr: string;
  suggestedReplyEn: string;
  rootCauseAnalysis: string;
  nextBestAction: string;
  recommendedKnowledgeArticles: { title: string; articleNumber: string }[];
}
