export type ServiceType = 
  | 'SEA_FREIGHT'
  | 'LAND_FREIGHT'
  | 'CUSTOMS_CLEARANCE'
  | 'WAREHOUSING'
  | 'DOOR_TO_DOOR';

export type QuoteRequestStatus = 
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'CONTACTED'
  | 'QUOTE_SENT'
  | 'NEGOTIATING'
  | 'AGREED'
  | 'REJECTED'
  | 'CLOSED';

export interface QuoteRequest {
  id: string; // e.g. QR-2026-101
  requestNumber?: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string | null;
  serviceType: ServiceType;
  shipmentType?: string;
  cargoType?: string;
  origin: string;
  destination: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  cargoDetails: string;
  weightKg?: number | null;
  approximateWeight?: string | number;
  volumeCbm?: number | null;
  packageOrContainerCount?: string | number;
  expectedShippingDate?: string;
  attachments?: Array<string | { name?: string; url?: string }>;
  status: QuoteRequestStatus;
  offeredPrice?: number | null;
  currency?: string;
  adminNotes?: string | null;
  internalNotes?: string | null;
  quoteResponse?: {
    offeredPrice: number | null;
    currency: string;
    validUntil?: string;
    terms?: string;
    respondedByUserId?: string;
    respondedAt?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
