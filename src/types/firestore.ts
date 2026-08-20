export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface UserDoc {
  id: string;
  email: string;
  phone?: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  passwordHash?: string; // For auth password verification
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfileDoc {
  userId: string;
  fullName: string;
  companyName?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyDoc {
  id: string;
  name: string;
  commercialRegister?: string;
  taxNumber?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteResponseMap {
  offeredPrice: number | null;
  currency: string;
  validUntil?: string;
  terms?: string;
  respondedByUserId?: string;
  respondedAt?: string;
}

export interface QuoteRequestDoc {
  id: string;
  requestNumber: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  companyName?: string;
  shipmentType: string;
  pickupLocation: string;
  deliveryLocation: string;
  cargoType: string;
  approximateWeight?: number | null;
  packageOrContainerCount?: number | null;
  expectedShippingDate?: string | null;
  attachments?: string[];
  notes?: string;
  status: string; // 'NEW' | 'UNDER_REVIEW' | 'CONTACTED' | 'QUOTE_SENT' | 'NEGOTIATING' | 'AGREED' | 'REJECTED' | 'CLOSED'
  internalNotes?: string;
  quoteResponse?: QuoteResponseMap | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentDoc {
  id: string;
  trackingNumber: string;
  customerId: string;
  quoteRequestId?: string | null;
  shipmentType: string;
  pickupLocation: string;
  deliveryLocation: string;
  shippingDate?: string | null;
  estimatedArrivalDate?: string | null;
  currentStatus: string; // 'RECEIVED' | 'BOOKING_CONFIRMED' | 'PREPARING' | 'LOADING' | 'IN_TRANSIT' | 'ARRIVED_AT_PORT' | 'CUSTOMS_CLEARANCE' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  currentLocation?: string;
  customerVisibleNotes?: string;
  internalNotes?: string;
  paymentStatus?: string; // 'PENDING' | 'PAID' | 'REFUNDED'
  paymentDetails?: {
    provider?: string;
    pspReference?: string;
    amount?: number;
    currency?: string;
    paidAt?: string;
    paymentMethod?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentEventDoc {
  id: string;
  shipmentId: string;
  status: string;
  description: string;
  location: string;
  visibleToCustomer: boolean;
  createdBy: string;
  createdAt: string;
}

export interface DocumentDoc {
  id: string;
  ownerType: string; // 'SHIPMENT' | 'QUOTE' | 'CUSTOMER' | 'COMPANY'
  ownerId: string;
  category?: 'COMMERCIAL_INVOICE' | 'PACKING_LIST' | 'IDENTITY_OR_COMPANY' | 'ADDITIONAL' | string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  fileData?: string; // base64 encoded data string for secure storage
  checksumSha256?: string;
  currentVersionNumber?: number;
  securityClassification?: string;
  uploadedBy: string;
  uploadedByRole?: 'CUSTOMER' | 'STAFF' | 'ADMIN' | string;
  createdAt: string;
}

export interface NotificationDoc {
  id: string;
  recipientUserId: string;
  title: string;
  body: string;
  type: string; // 'SHIPMENT_UPDATE' | 'QUOTE_READY' | 'GENERAL'
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageDoc {
  id: string;
  customerId: string;
  shipmentId?: string | null;
  senderId: string;
  senderRole?: 'CUSTOMER' | 'STAFF' | 'ADMIN' | string;
  message: string;
  attachment?: string | null;
  attachmentName?: string;
  attachmentType?: string;
  status: string; // 'SENT' | 'DELIVERED' | 'READ'
  createdAt: string;
}

export interface ServiceDoc {
  id: string;
  type: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string;
  featuresAr: string[];
  featuresEn: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FAQDoc {
  id: string;
  category: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CMSContentDoc {
  id: string;
  key: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  bodyAr?: string;
  bodyEn?: string;
  updatedAt: string;
}

export interface AuditLogDoc {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}
