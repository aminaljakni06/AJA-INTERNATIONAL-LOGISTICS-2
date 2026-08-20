export type CustomerSegment = 
  | 'ENTERPRISE'
  | 'SME'
  | 'CORPORATE'
  | 'GOVERNMENT'
  | 'VIP'
  | 'RETAIL'
  | 'DISTRIBUTOR'
  | 'AGENT'
  | 'STRATEGIC'
  | 'INACTIVE'
  | 'PROSPECT'
  | 'LEAD'
  | 'CUSTOMER'
  | 'FORMER';

export type CustomerStatus = 'PROSPECT' | 'LEAD' | 'ACTIVE' | 'VIP' | 'STRATEGIC' | 'INACTIVE' | 'FORMER_CUSTOMER';

export type HealthStatus = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'AT_RISK' | 'CRITICAL';

export type RiskRating = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TimelineEventType = 
  | 'REGISTRATION'
  | 'PROFILE_CHANGE'
  | 'LEAD_CONVERSION'
  | 'QUOTE_REQUEST'
  | 'BOOKING'
  | 'SHIPMENT_UPDATE'
  | 'TRACKING_EVENT'
  | 'INVOICE_ISSUED'
  | 'PAYMENT_RECEIVED'
  | 'REFUND_PROCESSED'
  | 'SUPPORT_TICKET'
  | 'SUPPORT_CHAT'
  | 'PHONE_CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'TASK'
  | 'NOTE'
  | 'DOCUMENT_UPLOAD'
  | 'APPROVAL'
  | 'CONTRACT_SIGN'
  | 'AI_RECOMMENDATION'
  | 'AUDIT_EVENT';

export interface CustomerContact360 {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  email: string;
  phone: string;
  mobile?: string;
  whatsapp?: string;
  preferredLanguage: 'ar' | 'en';
  role: string;
  permissions: string[];
  isPrimary: boolean;
  isEmergency: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CustomerAddress360 {
  id: string;
  type: 'HEAD_OFFICE' | 'BRANCH' | 'BILLING' | 'SHIPPING' | 'WAREHOUSE' | 'PICKUP' | 'DELIVERY' | 'LEGAL_ADDRESS';
  addressName: string;
  street: string;
  district?: string;
  city: string;
  stateRegion?: string;
  postalCode?: string;
  country: string;
  isPrimary: boolean;
}

export interface CustomerAccountStructure {
  parentAccountId?: string;
  parentAccountName?: string;
  childAccountIds?: string[];
  branchesCount?: number;
  businessUnits?: string[];
  assignedAccountManager: string;
  salesTerritory: string;
  ownership: string;
}

export interface CustomerBillingDetails {
  paymentTerms: string; // e.g. "NET_30", "NET_60", "IMMEDIATE"
  incoterms: string; // e.g. "DDP", "FOB", "CIF"
  creditLimit: number;
  creditExposure: number;
  isOnCreditHold: boolean;
  creditHoldReason?: string;
  taxNumber: string;
  vatNumber: string;
  iban?: string;
  bankName?: string;
}

export interface CustomerShippingPreferences {
  preferredMode: 'AIR' | 'SEA' | 'LAND' | 'MULTIMODAL' | 'CUSTOMS_ONLY';
  defaultOrigin: string;
  defaultDestination: string;
  specialHandling: string[];
  requiresTemperatureControl: boolean;
  requiresDangerousGoods: boolean;
}

export interface CustomerComplianceStatus {
  kycStatus: 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'REJECTED';
  kycVerificationDate?: string;
  amlCheckStatus: 'CLEAR' | 'FLAGGED' | 'NOT_CHECKED';
  sanctionsStatus: 'CLEAR' | 'FLAGGED' | 'EXEMPT';
  commercialRegistration: string;
  crExpiryDate?: string;
  vatCertificateNumber?: string;
}

export interface CustomerHealthScore {
  overallScore: number; // 0-100
  status: HealthStatus;
  breakdown: {
    revenueContribution: number;
    paymentPunctuality: number;
    shipmentVolumeTrend: number;
    supportTicketFrequency: number;
    complaintRate: number;
    contractValidity: number;
    engagementScore: number;
    npsSatisfaction: number;
  };
  manualAdjustment: number;
  aiRecommendation: string;
  lastCalculatedAt: string;
}

export interface CustomerRiskScore {
  overallRisk: RiskRating;
  riskScore: number; // 0-100
  financialRisk: RiskRating;
  operationalRisk: RiskRating;
  complianceRisk: RiskRating;
  creditRisk: RiskRating;
  fraudRisk: RiskRating;
  historicalTrend: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  notes?: string;
  lastEvaluatedAt: string;
}

export interface CustomerLifetimeValue {
  totalRevenue: number;
  grossProfit: number;
  profitMarginPct: number;
  totalOrders: number;
  totalShipments: number;
  retentionMonths: number;
  yearOverYearGrowthPct: number;
  forecastedLtv1Yr: number;
  forecastedLtv3Yr: number;
}

export interface CustomerTimelineEntry {
  id: string;
  customerId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  category?: 'OPERATIONS' | 'FINANCE' | 'SUPPORT' | 'SALES' | 'SYSTEM' | 'COMPLIANCE';
  metadata?: Record<string, any>;
  status?: string;
}

export interface CustomerCommunicationEntry {
  id: string;
  customerId: string;
  type: 'EMAIL' | 'PHONE' | 'MEETING' | 'CHAT' | 'SUPPORT_TICKET' | 'SMS' | 'WHATSAPP' | 'NOTE';
  subject: string;
  content: string;
  agentName: string;
  agentId: string;
  channel: string;
  timestamp: string;
  attachments?: string[];
  direction: 'INBOUND' | 'OUTBOUND' | 'INTERNAL';
}

export interface CustomerActivityTask {
  id: string;
  customerId: string;
  type: 'CALL' | 'MEETING' | 'FOLLOW_UP' | 'TASK' | 'REMINDER' | 'APPOINTMENT' | 'ESCALATION';
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo: string;
  createdAt: string;
}

export interface CustomerDocument360 {
  id: string;
  customerId: string;
  documentType: 'CONTRACT' | 'INVOICE' | 'QUOTATION' | 'SHIPPING_DOC' | 'POD' | 'CERTIFICATE' | 'COMPLIANCE_DOC' | 'TRADE_LICENSE' | 'TAX_DOC' | 'IMAGE' | 'OTHER';
  title: string;
  fileName: string;
  fileUrl: string;
  version: number;
  expiryDate?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CustomerAIInsights {
  summary: string;
  healthAnalysis: string;
  riskAnalysis: string;
  upsellOpportunities: string[];
  crossSellOpportunities: string[];
  retentionPrediction: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    probabilityOfChurnPct: number;
    retentionStrategy: string;
  };
  complaintAnalysis: string;
  revenueForecast: {
    nextQuarterEstimate: number;
    confidenceScore: number;
  };
}

export interface Customer360Profile {
  id: string; // e.g., CUST-360-1001
  bpId: string; // Business Partner Link, e.g. BP-10029
  organizationId?: string; // Enterprise Organization Link
  companyName: string;
  arabicName?: string;
  englishName?: string;
  branches: string[];
  legalInformation: {
    commercialRegistration: string;
    crExpiryDate?: string;
    taxNumber: string;
    vatNumber: string;
    legalEntity: string;
  };
  industry: string;
  customerType: 'ENTERPRISE' | 'CORPORATE' | 'SME' | 'GOVERNMENT' | 'RETAIL' | 'DISTRIBUTOR' | 'AGENT';
  customerStatus: CustomerStatus;
  segment: CustomerSegment;
  language: 'ar' | 'en';
  currency: string;
  timeZone: string;
  addresses: CustomerAddress360[];
  contacts: CustomerContact360[];
  accountStructure: CustomerAccountStructure;
  billingDetails: CustomerBillingDetails;
  shippingPreferences: CustomerShippingPreferences;
  complianceStatus: CustomerComplianceStatus;
  healthScore: CustomerHealthScore;
  riskScore: CustomerRiskScore;
  clv: CustomerLifetimeValue;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Customer360KpiSummary {
  totalCustomers: number;
  activeCustomers: number;
  vipCustomers: number;
  enterpriseCustomers: number;
  averageHealthScore: number;
  atRiskCustomersCount: number;
  totalLifetimeRevenue: number;
  avgRetentionMonths: number;
}
