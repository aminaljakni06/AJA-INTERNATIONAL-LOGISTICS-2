import type { ServiceType } from './quote';
export type { ServiceType };

export type ShipmentStatus = 
  | 'RECEIVED'
  | 'BOOKING_CONFIRMED'
  | 'PREPARING'
  | 'LOADING'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_PORT'
  | 'DEPARTURE_CUSTOMS'
  | 'CUSTOMS_CLEARANCE'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  descriptionAr: string;
  descriptionEn?: string;
  createdById?: string;
  timestamp: string;
}

export interface Shipment {
  id: string; // e.g. SHP-90412
  trackingNumber: string;
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  quoteRequestId?: string | null;
  serviceType: ServiceType;
  origin: string;
  destination: string;
  senderName: string;
  receiverName: string;
  status: ShipmentStatus;
  currentLocation?: string | null;
  estimatedDelivery?: string | null;
  weightKg?: number | null;
  containerNumber?: string | null;
  events?: ShipmentEvent[];
  createdAt: string;
  updatedAt: string;
}
