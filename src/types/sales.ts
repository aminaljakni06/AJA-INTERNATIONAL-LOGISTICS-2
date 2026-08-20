export type LeadSource =
  | 'WEBSITE'
  | 'REFERRAL'
  | 'GOOGLE_ADS'
  | 'META_ADS'
  | 'TIKTOK_ADS'
  | 'LINKEDIN'
  | 'TRADE_SHOW'
  | 'COLD_CALL'
  | 'PARTNER'
  | 'EMAIL_CAMPAIGN'
  | 'PHONE_INQUIRY'
  | 'WALK_IN'
  | 'API'
  | 'MANUAL_ENTRY';

export type LeadQualificationStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface LeadTimelineEvent {
  id: string;
  type: 'CREATED' | 'STATUS_CHANGE' | 'NOTE' | 'CALL' | 'MEETING' | 'EMAIL' | 'AI_SCORED' | 'CONVERTED';
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
}

export interface Lead {
  id: string; // e.g. LEAD-1001
  leadNumber: string; // e.g. LD-2026-0081
  companyName: string;
  contactName: string;
  jobTitle?: string;
  email: string;
  phone: string;
  mobile?: string;
  city?: string;
  country?: string;
  source: LeadSource;
  campaign?: string;
  industry: string;
  businessSize: 'MICRO' | 'SME' | 'MID_MARKET' | 'ENTERPRISE' | 'GOVERNMENT';
  assignedSalespersonId: string;
  assignedSalespersonName: string;
  priority: LeadPriority;
  leadScore: number; // 0-100
  scoreReasoning?: string;
  qualificationStatus: LeadQualificationStatus;
  expectedRevenue: number;
  currency: string;
  expectedCloseDate: string;
  customerInterest: 'AIR_FREIGHT' | 'SEA_FREIGHT' | 'LAND_TRANSPORT' | 'CUSTOMS_CLEARANCE' | 'WAREHOUSING' | '3PL_END_TO_END' | 'COLD_CHAIN';
  tags: string[];
  notes?: string;
  attachments?: string[];
  timeline: LeadTimelineEvent[];
  statusHistory: { status: LeadQualificationStatus; timestamp: string; user: string }[];
  convertedOpportunityId?: string;
  convertedCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export type SalesStage =
  | 'PROSPECTING'
  | 'QUALIFICATION'
  | 'DISCOVERY'
  | 'NEEDS_ANALYSIS'
  | 'PROPOSAL'
  | 'QUOTATION'
  | 'NEGOTIATION'
  | 'APPROVAL'
  | 'CONTRACT'
  | 'WON'
  | 'LOST'
  | 'CANCELLED';

export type ForecastCategory = 'PIPELINE' | 'BEST_CASE' | 'COMMIT' | 'CLOSED' | 'OMITTED';

export type OpportunityRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface OpportunityTimelineEvent {
  id: string;
  type: 'CREATED' | 'STAGE_ADVANCED' | 'PROPOSAL_SENT' | 'QUOTE_LINKED' | 'DISCOUNT_APPROVED' | 'WIN_CLOSED' | 'LOSS_CLOSED' | 'NOTE';
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
}

export interface OpportunityProductService {
  id: string;
  serviceCode: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  marginPct: number;
}

export interface Opportunity {
  id: string; // e.g. OPP-2001
  opportunityNumber: string; // e.g. OP-2026-0412
  name: string;
  customerId?: string;
  customerName: string;
  bpId?: string;
  leadId?: string;
  expectedRevenue: number;
  probability: number; // 0 - 100%
  weightedRevenue: number; // expectedRevenue * (probability / 100)
  currency: string;
  expectedCloseDate: string;
  stage: SalesStage;
  ownerId: string;
  ownerName: string;
  competitorIds?: string[];
  competitorNames?: string[];
  productsServices: OpportunityProductService[];
  pipelineId: string;
  riskLevel: OpportunityRiskLevel;
  forecastCategory: ForecastCategory;
  quoteId?: string;
  quoteNumber?: string;
  proposalId?: string;
  proposalNumber?: string;
  wonReason?: string;
  lostReason?: string;
  competitorLostTo?: string;
  aiWinProbabilityPct?: number;
  aiNextBestAction?: string;
  timeline: OpportunityTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | 'CALL'
  | 'MEETING'
  | 'EMAIL'
  | 'TASK'
  | 'REMINDER'
  | 'SITE_VISIT'
  | 'VIDEO_MEETING'
  | 'PROPOSAL_REVIEW'
  | 'INTERNAL_REVIEW'
  | 'APPROVAL';

export interface SalesActivity {
  id: string;
  entityType: 'LEAD' | 'OPPORTUNITY' | 'CUSTOMER';
  entityId: string;
  entityName: string;
  type: ActivityType;
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedToId: string;
  assignedToName: string;
  outcome?: string;
  isRecurring?: boolean;
  recurrenceRule?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  createdAt: string;
  updatedAt: string;
}

export interface ProposalRevision {
  version: number;
  changesSummary: string;
  updatedBy: string;
  timestamp: string;
}

export interface Proposal {
  id: string;
  proposalNumber: string; // e.g. PROP-2026-901
  opportunityId: string;
  opportunityName: string;
  customerId: string;
  customerName: string;
  title: string;
  version: number;
  templateName: string;
  executiveSummary: string;
  scopeOfWork: string;
  pricingSchedule: { description: string; amount: number; isTaxInclusive: boolean }[];
  totalAmount: number;
  currency: string;
  validUntil: string;
  digitalApprovalStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvalDate?: string;
  attachments: { fileName: string; fileUrl: string; sizeKb: number }[];
  revisionHistory: ProposalRevision[];
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  country: string;
  marketSegment: string; // e.g. "Air Freight KSA", "GCC Cross-Border Land"
  strengths: string[];
  weaknesses: string[];
  estimatedMarketSharePct: number;
  winRateAgainstUsPct: number;
  pricingNotes: string;
  contacts?: { name: string; title: string; email: string }[];
  createdAt: string;
}

export interface WinLossRecord {
  id: string;
  opportunityId: string;
  opportunityName: string;
  customerName: string;
  dealValue: number;
  status: 'WON' | 'LOST';
  primaryCompetitorId?: string;
  primaryCompetitorName?: string;
  reasonCategory: 'PRICING' | 'TIMING' | 'SERVICE_SCOPE' | 'RELATIONSHIP' | 'EQUIPMENT_AVAILABILITY' | 'OTHER';
  detailedReason: string;
  customerFeedback?: string;
  salesOwnerName: string;
  closedAt: string;
}

export interface SalesTerritory {
  id: string;
  territoryName: string; // e.g. "Riyadh & Central Region", "GCC Overland & Customs"
  code: string;
  countries: string[];
  regions: string[];
  cities: string[];
  industries: string[];
  businessSegments: string[];
  teamLeadId: string;
  teamLeadName: string;
  accountManagerIds: string[];
  activeLeadsCount: number;
  activeOpportunitiesCount: number;
  totalPipelineValue: number;
}

export interface SalesTarget {
  id: string;
  salespersonId: string;
  salespersonName: string;
  territoryName: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  periodLabel: string; // e.g. "Q1 2026"
  revenueTarget: number;
  shipmentTarget: number;
  quoteTarget: number;
  newCustomerTarget: number;
  achievedRevenue: number;
  achievedShipments: number;
  achievedQuotes: number;
  achievedNewCustomers: number;
  achievementPct: number;
}

export interface CommissionRule {
  id: string;
  ruleName: string;
  description: string;
  baseRatePct: number;
  bonusTierThresholdPct: number; // e.g. 100% target achieved
  bonusTierRatePct: number; // additional rate above target
  minMarginPct: number; // minimum profit margin required for commission
  isActive: boolean;
}

export interface SalesKpiSummary {
  totalActiveLeads: number;
  qualifiedLeadsPct: number;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  totalWonThisQuarter: number;
  quarterlyTarget: number;
  targetAchievementPct: number;
  avgDealCycleDays: number;
  overallWinRatePct: number;
}

export interface AISalesInsightsResponse {
  summary: string;
  leadScoringAnalysis: { leadId: string; score: number; reasoning: string; action: string }[];
  pipelineHealthScore: number; // 0-100
  pipelineRiskAlerts: { opportunityId: string; opportunityName: string; riskLevel: string; mitigation: string }[];
  revenueForecastNextQuarter: number;
  topUpsellOpportunities: string[];
  nextBestActions: { title: string; targetEntity: string; description: string; priority: 'HIGH' | 'MEDIUM' }[];
}
