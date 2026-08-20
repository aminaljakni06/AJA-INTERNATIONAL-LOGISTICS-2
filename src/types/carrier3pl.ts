export type PartnerType = 'CARRIER' | 'VENDOR' | '3PL_PROVIDER' | '4PL_INTEGRATOR' | 'CUSTOMS_BROKER' | 'FREIGHT_FORWARDER';
export type TransportMode = 'ROAD_FREIGHT' | 'AIR_FREIGHT' | 'OCEAN_FREIGHT' | 'RAIL_FREIGHT' | 'MULTIMODAL';
export type TenderStatus = 'DRAFT' | 'PUBLISHED' | 'BIDDING' | 'EVALUATION' | 'AWARDED' | 'CANCELLED';
export type ContractStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'UNDER_RENEWAL' | 'EXPIRED';

export interface PartnerContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface PartnerComplianceDocument {
  id: string;
  docType: 'COMMERCIAL_REGISTRATION' | 'TRANSPORT_PERMIT' | 'INSURANCE_POLICY' | 'TAX_CERTIFICATE' | 'ISO_CERTIFICATE';
  documentNumber: string;
  issuingAuthority: string;
  expiryDate: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'EXPIRED';
}

export interface CarrierPartnerProfile {
  id: string;
  partnerCode: string; // e.g. CAR-AJA-3PL-01
  companyName: string;
  partnerType: PartnerType;
  transportModes: TransportMode[];
  operatingRegions: string[];
  fleetSizeCount: number;
  contactPerson: PartnerContact;
  contractStatus: ContractStatus;
  slaOnTimeDeliveryRate: number; // e.g. 98.4%
  overallRatingStars: number; // e.g. 4.9
  greenFleetScore: number; // e.g. 91
  bankName: string;
  ibanNumber: string;
  vatTaxNumber: string;
  complianceDocs: PartnerComplianceDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface FreightRateSheet {
  id: string;
  carrierId: string;
  carrierName: string;
  originCity: string;
  destinationCity: string;
  mode: TransportMode;
  baseRateSARPerTon: number;
  fuelSurchargePercentage: number;
  minimumChargeSAR: number;
  effectiveFrom: string;
  effectiveTo: string;
  currency: 'SAR' | 'USD' | 'EUR';
}

export interface FreightTender {
  id: string;
  tenderNumber: string; // e.g. TND-2026-WEST-09
  title: string;
  originRegion: string;
  destinationRegion: string;
  cargoDescription: string;
  totalEstimatedTons: number;
  requiredMode: TransportMode;
  publishedDate: string;
  bidDeadlineDate: string;
  status: TenderStatus;
  invitedCarrierIds: string[];
  winningCarrierId?: string;
  awardedAmountSAR?: number;
}

export interface CarrierBid {
  id: string;
  tenderId: string;
  carrierId: string;
  carrierName: string;
  bidAmountSAR: number;
  committedTransitDays: number;
  guaranteedOnTimeSlaPercent: number;
  bidSubmissionDate: string;
  isWinningBid: boolean;
}

export interface EdiIntegrationSpec {
  id: string;
  partnerId: string;
  partnerName: string;
  protocol: 'EDIFACT' | 'ANSI_X12' | 'REST_API' | 'AS2' | 'SFTP';
  supportedEdiTransactions: string[]; // e.g. ["214_SHIPMENT_STATUS", "210_FREIGHT_INVOICE", "204_MOTOR_CARRIER_LOAD_TENDER"]
  endpointUrl: string;
  status: 'ACTIVE' | 'TESTING' | 'DISCONNECTED';
}

export interface AICarrierIntelligenceResult {
  tenderId?: string;
  recommendedCarrierId: string;
  recommendedCarrierName: string;
  confidenceScorePercent: number;
  estimatedCostSavingsSAR: number;
  riskEvaluationReasoning: string;
  predictedSlaPerformancePercent: number;
  negotiationRecommendationTip: string;
}
