# Aja Logistics - Database Model & Schema Documentation

## Database Engine
The platform uses a persistent server-side file-backed database (`/data/db.json`) managed by an atomic write transaction coordinator (`src/db/database.ts`). Data persists permanently across application restarts.

## Core Collections & Entities

### 1. `users`
- `id` (string, PK)
- `email` (string, unique)
- `passwordHash` (string, bcrypt)
- `fullName` (string)
- `phone` (string)
- `role` ('CUSTOMER' | 'STAFF' | 'ADMIN')
- `companyId` (string | null, FK)
- `createdAt` (ISO String)
- `updatedAt` (ISO String)

### 2. `companies`
- `id` (string, PK)
- `name` (string)
- `commercialRegister` (string)
- `taxNumber` (string)
- `phone` (string)
- `address` (string)
- `createdAt` (ISO String)

### 3. `quote_requests`
- `id` (string, PK) - e.g. `QR-2026-1001`
- `customerId` (string, FK)
- `customerName` (string)
- `customerEmail` (string)
- `customerPhone` (string)
- `serviceType` ('SEA_FREIGHT' | 'LAND_FREIGHT' | 'CUSTOMS_CLEARANCE' | 'WAREHOUSING' | 'DOOR_TO_DOOR')
- `origin` (string)
- `destination` (string)
- `cargoDetails` (string)
- `weightKg` (number)
- `volumeCbm` (number)
- `status` ('NEW' | 'UNDER_REVIEW' | 'CONTACTED' | 'QUOTE_SENT' | 'NEGOTIATING' | 'AGREED' | 'REJECTED' | 'CLOSED')
- `offeredPrice` (number | null)
- `notes` (string | null)
- `createdAt` (ISO String)
- `updatedAt` (ISO String)

### 4. `shipments`
- `id` (string, PK) - e.g. `SHP-882910`
- `trackingNumber` (string, unique)
- `customerId` (string, FK)
- `quoteRequestId` (string | null, FK)
- `serviceType` ('SEA_FREIGHT' | 'LAND_FREIGHT' | 'CUSTOMS_CLEARANCE' | 'WAREHOUSING' | 'DOOR_TO_DOOR')
- `origin` (string)
- `destination` (string)
- `senderName` (string)
- `receiverName` (string)
- `status` ('RECEIVED' | 'BOOKING_CONFIRMED' | 'PREPARING' | 'LOADING' | 'IN_TRANSIT' | 'ARRIVED_AT_PORT' | 'CUSTOMS_CLEARANCE' | 'OUT_FOR_DELIVERY' | 'DELIVERED')
- `estimatedDelivery` (string | null)
- `currentLocation` (string | null)
- `createdAt` (ISO String)
- `updatedAt` (ISO String)

### 5. `shipment_events`
- `id` (string, PK)
- `shipmentId` (string, FK)
- `status` (ShipmentStatus)
- `location` (string)
- `descriptionAr` (string)
- `descriptionEn` (string)
- `createdById` (string, FK)
- `timestamp` (ISO String)

### 6. `documents`
- `id` (string, PK)
- `relatedType` ('SHIPMENT' | 'QUOTE_REQUEST')
- `relatedId` (string)
- `title` (string)
- `fileUrl` (string)
- `fileType` (string)
- `uploadedBy` (string, FK)
- `createdAt` (ISO String)

### 7. `notifications`
- `id` (string, PK)
- `userId` (string, FK)
- `titleAr` (string)
- `titleEn` (string)
- `messageAr` (string)
- `messageEn` (string)
- `isRead` (boolean)
- `createdAt` (ISO String)

### 8. `messages`
- `id` (string, PK)
- `senderId` (string, FK)
- `receiverId` (string | null, FK)
- `shipmentId` (string | null, FK)
- `quoteRequestId` (string | null, FK)
- `content` (string)
- `isRead` (boolean)
- `createdAt` (ISO String)

### 9. `services` & `faqs` & `cms_content`
- Public website static/CMS content managed by ADMIN.

### 10. `audit_logs`
- `id` (string, PK)
- `actorId` (string, FK)
- `actorEmail` (string)
- `action` (string)
- `entityType` (string)
- `entityId` (string)
- `details` (object)
- `ipAddress` (string)
- `timestamp` (ISO String)
