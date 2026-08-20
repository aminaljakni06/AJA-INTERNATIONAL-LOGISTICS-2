export interface DigitalTwinEntity {
  entityId: string;
  category: 'WAREHOUSE' | 'FLEET_TRUCK' | 'CONTAINER_SHIP' | 'CUSTOMS_PORT' | 'AI_AGENT_CLUSTER' | 'TREASURY_VAULT';
  nameAr: string;
  nameEn: string;
  locationGeographic: { lat: number; lng: number; address: string };
  status: 'OPTIMAL' | 'WARNING_CONGESTION' | 'CRITICAL_DELAY' | 'MAINTENANCE';
  utilizationPct: number;
  activeLoadUnits: number;
  temperatureCelsius?: number;
  syncTimestamp: string;
}

export interface ExecutiveCockpitKPIs {
  grossRevenueMonthlySar: number;
  operatingMarginPct: number;
  cashPositionSar: number;
  workingCapitalSar: number;
  activeOrdersCount: number;
  fleetAvailabilityPct: number;
  warehouseUtilizationPct: number;
  customerSatisfactionScore: number; // e.g. 4.92 / 5.0
  complianceScorePct: number; // e.g. 99.8%
  aiAgentDecisionAccuracyPct: number; // e.g. 98.4%
  overallRiskScore: 'LOW_NORMAL' | 'MODERATE' | 'HIGH';
}

export interface AIDecisionRecommendation {
  recommendationId: string;
  domain: 'LOGISTICS_ROUTING' | 'TREASURY_LIQUIDITY' | 'CUSTOMS_CLEARANCE' | 'INVENTORY_REALLOCATION' | 'PRICE_SURGE';
  titleAr: string;
  titleEn: string;
  impactEstimateSar: number;
  confidencePct: number;
  supportingEvidenceAr: string;
  aiAgentModel: string;
  status: 'PENDING_APPROVAL' | 'EXECUTED_AUTO' | 'REJECTED';
}

export interface CrisisManagementIncident {
  incidentId: string;
  severity: 'LEVEL_1_ROUTINE' | 'LEVEL_2_ELEVATED' | 'LEVEL_3_CRITICAL_WAR_ROOM';
  titleAr: string;
  affectedRegion: string;
  status: 'OPEN_INVESTIGATING' | 'WAR_ROOM_ACTIVE' | 'MITIGATED' | 'RESOLVED';
  leadCommander: string;
  declaredAt: string;
  actionItems: { actionAr: string; owner: string; completed: boolean }[];
}

export interface WhatIfSimulationScenario {
  scenarioId: string;
  titleAr: string;
  titleEn: string;
  parameterAdjustments: string;
  simulatedMarginChangePct: number;
  simulatedDeliveryTimeChangeHours: number;
  riskReductionScorePct: number;
  recommendationNote: string;
}
