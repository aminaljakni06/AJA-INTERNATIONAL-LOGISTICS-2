# AJA INTERNATIONAL LOGISTICS
## ENTERPRISE INTEGRATION ARCHITECTURE BLUEPRINT (STEPS 13.01 - 13.03)

---

# PART 1: STEP 13.01 — Enterprise Integration Architecture & API Gateway Foundation

## 1. Executive Summary & Architectural Vision
AJA INTERNATIONAL LOGISTICS requires a unified, resilient, highly available, and secure **Enterprise Integration Layer**. This layer serves as the strict, single point of egress and ingress for all internal modules (ERP, CRM, WMS, TMS, OMS, Finance, AI Platform) to interface with third-party external services, government systems (ZATCA, Mawani, Customs), carriers, financial institutions, and partner ecosystems.

**Core Directive:** No internal business module is permitted to communicate directly with external providers or third-party APIs. All interactions must traverse the Enterprise Integration Layer.

---

## 2. Core Architectural Principles
- **API First & Contract Driven:** Every capability is exposed via well-defined OpenAPI 3.1 contracts.
- **Provider-Agnostic Abstraction:** Internal systems interact exclusively with normalized domain interfaces.
- **Zero Trust Security:** Strict authentication (OAuth2/OIDC, mTLS, JWT, API Keys), least privilege, and granular RBAC/ABAC at the gateway level.
- **Loose Coupling & Event-Driven:** Asynchronous communication via an Event Bus for status updates, Webhooks, and CDC data streams.
- **High Availability & Resilience:** Circuit Breakers, Exponential Backoff Retries, Dead Letter Queues (DLQ), and Multi-Region Redundancy.
- **Observability First:** End-to-end distributed tracing (OpenTelemetry Correlation IDs), structured JSON logging, and real-time metric collection.

---

## 3. High-Level Architecture Layers

```
+-----------------------------------------------------------------------------------+
| 1. PRESENTATION LAYER                                                             |
| Customer Portal | Mobile App | Admin Console | AI Assistant | Partner Dashboards  |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. ENTERPRISE API GATEWAY (Kong / Envoy / Custom Edge)                           |
| TLS Termination | OAuth2/JWT Auth | Rate Limiting | WAF | Routing | Request Audit |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. BUSINESS LAYER (Core Microservices)                                           |
| WMS | TMS | OMS | ERP | CRM | Finance | AI Intelligence | Document Vault         |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 4. ENTERPRISE INTEGRATION LAYER (The Connector & Event Bus Hub)                   |
| Carrier Adapters | Customs Adapters | Payment Adapters | Mapping Engine | DLQ   |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 5. EXTERNAL SERVICES LAYER                                                        |
| Shipping Lines | Airlines | Ports (Mawani) | Customs (ZATCA) | Banks | Maps (Google) |
+-----------------------------------------------------------------------------------+
```

---

## 4. API Structure, Namespaces & Versioning Strategy
To ensure backward compatibility and zero breaking changes across major upgrades, APIs are structured cleanly by domain and visibility:

| API Namespace | Base Path | Target Audience | Auth & Security Policy |
| :--- | :--- | :--- | :--- |
| **Public APIs** | `/api/v1/public/` | Guest Users & Unauthenticated Utilities | Rate Limited, IP Throttling, Captcha |
| **Customer APIs** | `/api/v1/customer/` | B2B/B2C Portal & Mobile App Users | OAuth2 + OIDC JWT, Tenant Isolation |
| **Partner APIs** | `/api/v1/partners/` | Logistics Partners & 3PL/4PL Carriers | mTLS / API Keys + OAuth2 Client Credentials |
| **Internal APIs** | `/api/v1/internal/` | Inter-microservice Communication | Internal mTLS / Service Account JWT |
| **AI Platform APIs**| `/api/v1/ai/` | Internal AI Agents & Decision Engine | Service Tokens, Granular Scope Checks |
| **Admin APIs** | `/api/v1/admin/` | Enterprise Command & Operations Center | Multi-Factor Authentication + Admin RBAC |

### Versioning Policy
- All APIs adhere to Semantic Versioning (`/api/v1/`, `/api/v2/`).
- Breaking changes trigger a new major version release with a minimum **12-month deprecation grace period**.

---

## 5. Request & Response Pipeline Specification

### Request Processing Sequence:
1. **TLS 1.3 Handshake & WAF Inspection:** Validates SSL certificates, mitigates DDoS, and sanitizes payload against OWASP Top 10.
2. **Authentication Check:** Validates JWT signature, API key status, or OAuth2 token scopes.
3. **Authorization & RBAC/ABAC:** Verifies tenant ownership and role permissions.
4. **Rate Limiting & Quota Validation:** Applies token bucket rate limits per client IP / API Key.
5. **Request Sanitization & Validation:** Enforces OpenAPI schema constraints.
6. **Correlation ID Injection:** Assigns a unique `X-Correlation-ID` header for end-to-end tracing.
7. **Business Service Routing:** Proxies request to the targeted internal service or adapter.

### Standardized Response Format:
```json
{
  "success": true,
  "status": 200,
  "message": "Shipment dispatched successfully",
  "data": {
    "shipmentId": "SHP-2026-90812",
    "trackingNumber": "AJA-8839201-RUH",
    "currentStatus": "IN_TRANSIT"
  },
  "pagination": null,
  "meta": {
    "apiVersion": "v1",
    "timestamp": "2026-08-05T18:35:00Z",
    "correlationId": "corr-c4i-99018231-8812"
  }
}
```

### Unified Error Model:
```json
{
  "success": false,
  "status": 422,
  "message": "Validation failed for carrier request payload",
  "error": {
    "code": "ERR_CARRIER_PAYLOAD_INVALID",
    "details": [
      { "field": "destinationZipCode", "issue": "Postal code is required for express delivery" }
    ]
  },
  "meta": {
    "correlationId": "corr-c4i-99018231-8812",
    "timestamp": "2026-08-05T18:35:01Z"
  }
}
```

---

# PART 2: STEP 13.02 — Shipping Carriers & Logistics Providers Integration Framework

## 1. Provider-Agnostic Connector Framework
The **Carrier Connector Framework** establishes a pluggable adapter layer. Any local or global courier, 3PL/4PL provider, or trucking line is integrated by implementing a standardized `ICarrierConnector` adapter contract.

```
+--------------------------------------------------------------------+
|                       TMS / OMS / WMS Modules                       |
+--------------------------------------------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
|                  UNIFIED CARRIER CONNECTOR INTERFACE               |
| CreateShipment() | CancelShipment() | TrackShipment() | GetLabel() |
+--------------------------------------------------------------------+
       |                          |                          |
       v                          v                          v
+--------------+           +--------------+           +--------------+
| DHL Express  |           | FedEx Cargo  |           | Local Courier|
|   Adapter    |           |   Adapter    |           |   Adapter    |
+--------------+           +--------------+           +--------------+
```

---

## 2. Supported Core Operations
Every Carrier Adapter implements the following mandatory capability lifecycle:

1. **Shipment Creation:** Transmits normalized order payload, generates carrier reference number, and retrieves shipping waybill.
2. **Shipment Update:** Modifies destination addresses, recipient contact details, or delivery windows prior to dispatch.
3. **Shipment Cancellation:** Triggers cancellation with the carrier, verifying cancellation status and fee waivers.
4. **Real-time Tracking & Telematics:** Queries current waypoint, GPS coordinates, estimated time of arrival (ETA), and temperature telemetry.
5. **Shipping Labels & Documents:** Retrieves PDF/ZPL format shipping labels, commercial invoices, and proof of pickup.
6. **Pickup Dispatch Management:** Schedules carrier vehicle pickup requests at AJA hubs or partner fulfillment centers.
7. **Delivery & Proof of Delivery (POD):** Captures digital signatures, recipient photo POD, and geofenced timestamp.

---

## 3. Normalized Tracking Status Model
To insulate internal dashboards from vendor-specific terminology, all external statuses are mapped into the **AJA Universal Logistics Status Model**:

```
+---------------+      +---------------+      +---------------+
|     DRAFT     | ---> |   CONFIRMED   | ---> |   PICKED_UP   |
+---------------+      +---------------+      +---------------+
                                                      |
                                                      v
+---------------+      +---------------+      +---------------+
|   DELIVERED   | <--- | OUT_FOR_DELIV | <--- |  IN_TRANSIT   |
+---------------+      +---------------+      +---------------+
        ^                                             |
        |              +---------------+              v
        +------------- |   CUSTOMS     | <--- +---------------+
                       +---------------+      |    AT_HUB     |
                                              +---------------+
```

---

## 4. Webhooks, Polling & Resilience Strategy
- **Webhook Gateway:** Authenticates digital HMAC signatures, prevents replay attacks via timestamp checks, and publishes events directly to the Event Bus.
- **Scheduled Polling Engine:** For carriers without Webhook support, a cron worker queries the tracking endpoint using exponential polling backoffs (e.g., 15m, 1h, 4h).
- **Circuit Breaker Pattern:** Automatically trips open if a carrier API error rate exceeds 15% in 5 minutes, routing requests to backup carrier contracts.
- **Dead Letter Queue (DLQ):** Unprocessed payloads are retained in Kafka/RabbitMQ DLQ for automated retry or operator review.

---

# PART 3: STEP 13.03 — Airlines, Ocean Carriers, Ports & Customs Integration Framework

## 1. Domain Coverage & Scope
This framework handles complex international multimodal transport spanning air freight, ocean liners, port terminals, airport hubs, and customs clearance platforms.

```
+-----------------------------------------------------------------------------------+
|                        AJA MULTIMODAL INTEGRATION HUB                             |
+-----------------------------------------------------------------------------------+
    |                   |                   |                   |                   |
    v                   v                   v                   v                   v
+-------+           +-------+           +-------+           +-------+           +-------+
|  AIR  |           | OCEAN |           | PORT  |           |AIRPORT|           |CUSTOMS|
| CARGO |           |FREIGHT|           |TERMINAL           | CARGO |           |(ZATCA)|
+-------+           +-------+           +-------+           +-------+           +-------+
```

---

## 2. Domain-Specific Connector Capabilities

### A. Air Cargo Integration Framework
- **Master & House Air Waybill (MAWB/HAWB):** Digital generation, status sync, and IATA Cargo iQ event processing.
- **Flight Operations & Tracking:** Real-time integration with airline systems for flight schedules, delays, and departure/arrival timestamps.
- **Normalized Air Events:** `FlightScheduled` -> `CargoAccepted` -> `CargoLoaded` -> `FlightDeparted` -> `FlightArrived` -> `CargoReleased`.

### B. Ocean Freight Integration Framework
- **Bill of Lading (B/L) & Container Booking:** Automatic booking requests, container allocation, vessel schedules, and shipping instructions.
- **Vessel Tracking & AIS Telematics:** Tracks vessel coordinates, maritime weather impacts, congestion alerts, and updated ETA.
- **Normalized Ocean Events:** `ContainerBooked` -> `ContainerReceived` -> `LoadedOnVessel` -> `VesselDeparted` -> `VesselArrived` -> `ContainerDischarged` -> `ReadyForPickup`.

### C. Port & Terminal Systems Integration (Mawani / Global Ports)
- **Berthing & Gate Operations:** Real-time berthing notices, Gate-In / Gate-Out container tracking, and terminal dwell times.
- **Port Congestion Monitoring:** Analyzes terminal queue lengths to route shipments dynamically to alternate ports (e.g., Jeddah to Yanbu).

### D. Customs Clearance Gateway (ZATCA & Global Customs)
- **Customs Declaration Management:** Automatic electronic submission of Commercial Invoices, Packing Lists, Certificates of Origin, and Waybills.
- **Clearance Status Lifecycle:** `Submitted` -> `UnderReview` -> `InspectionRequired` -> `DutiesPending` -> `Cleared` -> `Released`.
- **Duties & Taxes Integration:** Calculates exact customs tariffs, value-added taxes (VAT), and handles automated payment settlement.

---

## 3. Data Normalization & Event Standardization
All incoming messages across air, sea, port, and customs domains are transformed into standard cloud events:

- `CustomsSubmitted`
- `CustomsCleared`
- `CustomsRejected`
- `VesselArrived`
- `VesselDeparted`
- `FlightDeparted`
- `FlightArrived`
- `PortGateIn`
- `PortGateOut`

---

## 4. Governance, Security & Design Tokens

### Security Protocols
- **mTLS:** Mandatory for direct government customs and port gateways.
- **X.509 Cryptographic Certificates:** Enforces ZATCA Phase 2 digital signatures on all electronic invoices.
- **Secrets Management:** Integration credentials stored in HashiCorp Vault / Google Secret Manager with automated 90-day rotation.

### Connector Design Tokens
- `StatusToken.Active`
- `StatusToken.Degraded`
- `StatusToken.CircuitOpen`
- `SeverityToken.Critical`
- `ClearanceToken.Approved`
- `ClearanceToken.Pending`

---

## 5. Summary & Next Steps
This Enterprise Integration Architecture Blueprint (STEPS 13.01 - 13.04) provides the official, provider-agnostic foundation for AJA INTERNATIONAL LOGISTICS. All internal systems interact cleanly through normalized API specifications, ensuring seamless scalability and long-term resilience across global logistics and financial operations.

---

# PART 4: STEP 13.04 — Payment Gateway & Financial Systems Integration Framework

## 1. Executive Summary & Financial Architecture Vision
The **Payment Gateway & Financial Systems Integration Framework** establishes an isolated, highly secure, provider-agnostic layer connecting AJA INTERNATIONAL LOGISTICS with global and local payment processors (e.g., Stripe, Adyen, HyperPay, Tap, Checkout.com, Mada, SADAD), financial institutions, and Enterprise Resource Planning (ERP) accounting engines (e.g., SAP, Oracle Financials, Odoo, Dynamics 365, Zoho Books).

**Core Directive:** No core business module (TMS, WMS, OMS, Portal) shall interact directly with payment gateway SDKs or accounting software APIs. All monetary transactions, invoicing events, tax records, and GL entries must pass through the Financial Abstraction Layer.

---

## 2. Payment Abstraction Layer & Connector Framework

```
+-----------------------------------------------------------------------------------+
|                        TMS / OMS / CUSTOMER PORTAL / ERP                          |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                       FINANCIAL ABSTRACTION LAYER (FAL)                           |
| CreateIntent() | Authorize() | Capture() | Refund() | Reconcile() | SyncGL()          |
+-----------------------------------------------------------------------------------+
       |                          |                          |                          |
       v                          v                          v                          v
+--------------+           +--------------+           +--------------+           +--------------+
|   HyperPay   |           |    Adyen     |           | Stripe Cargo |           | SAP / Oracle |
| (Mada/SADAD) |           | (Global Cards|           | (International)          |  ERP Sync    |
+--------------+           +--------------+           +--------------+           +--------------+
```

### Mandatory Connector Metadata & Capabilities:
Every Financial Connector must expose:
- **Provider Identity & Config:** Id, Provider Name, API Endpoint, Target Region.
- **Credentials Vault Key:** Reference to secret manager HashiCorp/GCP key (never raw secrets).
- **Supported Payment Methods:** Credit/Debit (Visa, Mastercard, Amex, Mada, KNET), Apple Pay, STC Pay, Bank Transfers, SADAD, BNPL.
- **Multi-Currency Matrix:** SAR, AED, KWD, BHD, USD, EUR, GBP.
- **Health & Telemetry:** Real-time ping latency, circuit breaker state, success rate SLA tracking.

---

## 3. Standardized Payment Lifecycle Operations

1. **Payment Intent Initialization (`CreateIntent`):**
   - Validates shipment reference, customer ID, currency, and line items.
   - Generates an idempotent `financialTransactionId` (e.g., `TXN-2026-90812-FIN`).
   - Registers transaction in `PENDING` state prior to contacting external gateway.

2. **Authorization (`Authorize`):**
   - Reserves funds on the customer's payment instrument without immediate charge.
   - Essential for freight quotes where final weight/volumetric charges are confirmed at warehouse arrival.

3. **Capture (`Capture`):**
   - Executes full or partial charge upon container loading or dispatch clearance.
   - Supports multi-stage captures for staggered freight milestones.

4. **Refund (`Refund`):**
   - Supports full or partial refunds for cancelled shipments, damage claims, or rate adjustments.
   - Triggers automated reversal approval workflows and credit note issuance.

5. **Void / Cancel (`Void`):**
   - Cancels authorization before capture, releasing customer hold limits with zero merchant processing fees.

6. **Settlement & Payouts (`Settlement`):**
   - Ingests daily payout files from payment processors and matches net payouts against bank deposits.

---

## 4. Normalized Payment & Invoice Status Model

### Universal Payment Status Model:
To insulate internal dashboards from vendor-specific response codes (e.g., `100.400.000` vs `succeeded` vs `AUTHORIZED`), all events map to standard AJA statuses:

- `PENDING`
- `AUTHORIZED`
- `CAPTURED`
- `PARTIALLY_CAPTURED`
- `PAID`
- `FAILED`
- `REFUNDED`
- `PARTIALLY_REFUNDED`
- `CANCELLED`
- `EXPIRED`

### Invoice Lifecycle & ERP Synchronization:
- **Invoice Creation:** Generates ZATCA Phase 2 compliant XML/PDF invoices with embedded QR codes, Cryptographic Stamps, and Hash Chaining.
- **ERP Integration Specs:** Standardized JSON contracts syncing Accounts Receivable (AR), Accounts Payable (AP), Journal Entries, Customer Masters, Credit Notes, Tax Records (VAT 15%), and Cost Centers.

---

## 5. Financial Reconciliation Framework
The automated **Reconciliation Engine** executes 3-way matching every 24 hours:

```
+------------------+         +------------------+         +------------------+
| AJA Order & OMS  | <=====> | Payment Gateway  | <=====> | Bank Account     |
| Transaction Logs |         | Settlement File  |         | Statement (MT940)|
+------------------+         +------------------+         +------------------+
          \                           |                           /
           \                          v                          /
            +---------------------------------------------------+
            |  3-WAY AUTOMATED RECONCILIATION MATCHING ENGINE    |
            |   Discrepancy Alert | Auto-Adjustment | Audit Trail|
            +---------------------------------------------------+
```

- **Discrepancy Detection:** Flags fee mismatches, currency conversion rate variances, or missing gateway payouts exceeding SAR 0.01 tolerance threshold.
- **Duplicate Prevention:** Enforces idempotency keys (`X-Idempotency-Key: SHA256(OrderNo + Amount + Timestamp)`).

---

## 6. Webhooks, Security & Compliance Standards

### Security & PCI DSS v4.0 Compliance:
- **Zero Card Data Storage:** Primary Account Numbers (PAN) and CVVs never enter AJA servers. Tokenization & Hosted Payment Fields / Apple Pay SDKs are mandatory.
- **mTLS & Encryption:** TLS 1.3 in transit; AES-256-GCM encryption at rest for transaction metadata.
- **MFA & Fraud Protection:** Mandatory Multi-Factor Authentication for any manual refund or payout override > SAR 10,000. Fraud detection hooks run velocity and IP risk scoring prior to charge authorization.

---

## 7. Financial Design Tokens & Observability
- **Payment Tokens:** `PayStatus.Paid` (emerald), `PayStatus.Failed` (rose), `PayStatus.Pending` (amber), `PayStatus.Authorized` (indigo).
- **Health Tokens:** `GatewayHealth.Optimal`, `GatewayHealth.Degraded`, `GatewayHealth.Offline`.
- **Metrics Tracked:** Gateway Authorization Success Rate (%), Mean Latency (ms), Chargeback Ratio (%), Settlement Processing Window (hours).

---

## 8. Developer Guide: Onboarding a New Payment Gateway or ERP
To add a new payment gateway (e.g., Tap Payments or Benefit) or ERP System:
1. Implement the `IPaymentConnector` or `IERPFinanceConnector` interface.
2. Register the connector configuration in the HashiCorp Vault / Google Secret Manager.
3. Map provider response codes into the `Universal Payment Status Model`.
4. Deploy contract tests using the Mock Gateway Sandbox suite.
5. Enable zero-downtime canary routing via the Enterprise API Gateway.

---

# PART 5: STEP 13.05 — Enterprise ERP, Accounting & Business Systems Integration Framework

## 1. Executive Summary & Architecture Vision
The **Enterprise ERP, Accounting & Business Systems Integration Framework** provides a vendor-neutral, highly scalable integration fabric connecting AJA INTERNATIONAL LOGISTICS with major global and enterprise ERP systems (SAP S/4HANA, Oracle Fusion Cloud ERP, Microsoft Dynamics 365, Odoo Enterprise, Infor), accounting platforms (Zoho Books, QuickBooks, Xero), customer order management systems (OMS), inventory portals, and Human Capital Management (HCM) software.

**Core Directive:** To maintain platform agility and zero lock-in, internal microservices (TMS, WMS, Freight Engine, Portal) shall never couple to vendor-specific ERP database schemas or proprietary REST/SOAP APIs. All enterprise data exchanges must pass through the **Canonical Data Model (CDM)** and **Enterprise Service Integration Layer**.

```
+-----------------------------------------------------------------------------------+
|                  AJA CORE LOGISTICS & FREIGHT PLATFORM                            |
| TMS | WMS | OMS | Fleet | Customs | Customer Portal | AI Intelligence Engine        |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        CANONICAL DATA MODEL (CDM) & MDM HUB                       |
| Customer | Vendor | Order | Shipment | Invoice | Payment | GL | CostCenter | Item  |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                    ENTERPRISE BUS & DATA TRANSFORMATION ENGINE                    |
| Mapping Rules | Validation Engine | Enrichment | EDI/XML Translator | Event Bus   |
+-----------------------------------------------------------------------------------+
       |                          |                          |                          |
       v                          v                          v                          v
+--------------+           +--------------+           +--------------+           +--------------+
| SAP S/4HANA  |           | Oracle Cloud |           | Microsoft D365|          | Custom EDI / |
|   Adapter    |           |   Adapter    |           |   Adapter    |           | Flat File Hub|
+--------------+           +--------------+           +--------------+           +--------------+
```

---

## 2. Canonical Data Model (CDM)
The Canonical Data Model standardizes all business entities exchanged between AJA Logistics and external enterprise platforms:

| CDM Entity | Field Scope & Description | Key Standard Attributes |
| :--- | :--- | :--- |
| **Customer** | B2B & B2C customer profiles, commercial registration, credit limits | `customerId`, `taxNumber`, `creditLimit`, `currency`, `billingAddress` |
| **Vendor** | Carriers, subcontractors, fuel suppliers, port agencies | `vendorId`, `vendorType`, `paymentTerms`, `iban`, `ratingScore` |
| **Shipment** | Freight movement, waybill metadata, origin/destination nodes | `shipmentId`, `carrierCode`, `mode`, `grossWeight`, `chargeableWeight` |
| **Order** | Commercial sales orders, booking requests, line item details | `orderId`, `customerId`, `orderDate`, `incoterms`, `lineItems[]` |
| **Invoice** | ZATCA Phase 2 compliant tax invoices, debit/credit notes | `invoiceId`, `taxAmount`, `netAmount`, `qrCodeHash`, `eInvoiceXml` |
| **Payment** | Cash receipts, vendor disbursements, bank reconciliation items | `paymentId`, `method`, `gatewayReference`, `settlementDate` |
| **Warehouse** | Physical storage nodes, free zones, bonded facility zones | `warehouseId`, `facilityCode`, `capacityM3`, `temperatureZones[]` |
| **Branch** | Regional operating hubs (Riyadh, Jeddah, Dammam, Dubai, London) | `branchId`, `legalEntityName`, `localCurrency`, `managerId` |
| **Employee** | Logistics staff, drivers, customs clearance brokers, dispatchers | `employeeId`, `nationalId`, `licenseType`, `department`, `role` |
| **Product / Item** | Freight SKUs, dangerous goods classification, HS codes | `skuId`, `hsCode`, `hazmatClass`, `unitOfMeasure`, `dimensions` |
| **Service** | Logistics service catalog (Air Freight, LCL, Customs Clearance) | `serviceId`, `serviceCode`, `baseTariff`, `taxCategory` |
| **Currency** | Exchange rates, foreign currency transactions, revaluation entries | `currencyCode`, `fxRateToSAR`, `effectiveDate`, `sourceBank` |
| **Tax** | VAT, customs duties, municipal fees, regional tax rules | `taxCode`, `ratePercentage`, `taxAuthority`, `isExempt` |
| **Cost Center** | Organizational cost centers, fleet units, line-of-business tags | `costCenterId`, `businessUnit`, `budgetCode`, `department` |

---

## 3. Master Data Management (MDM) Framework
To prevent record duplication and maintain data integrity across multiple enterprise systems:

- **Golden Record Engine:** Merges customer, vendor, and item records from legacy ERPs into a authoritative AJA Golden Master Record.
- **Deduplication & Fuzzy Matching:** Uses Jaro-Winkler distance and tax registration ID matching to flag duplicate entity submissions.
- **Conflict Resolution Matrix:** Establishes priority rules (e.g., AJA Master Portal overrides CRM for credit limits; SAP ERP overrides for GL Account Codes).
- **Audit & Version History:** Maintains immutable log entries of every field modification, editor identity, and sync timestamp.

---

## 4. Data Synchronization & Event Bus Architecture

### Synchronization Modes:
1. **Initial Full Sync:** Bulk snapshot ingestion during enterprise customer onboarding with batch parallel workers.
2. **Incremental Delta Sync:** Queries target systems using watermarks (`updatedAt > lastSyncTimestamp`) to fetch delta changes.
3. **Real-Time Webhook/API Sync:** Instant event-driven processing for urgent status updates (e.g., Order Approved, Invoice Paid).
4. **Scheduled Batch Sync:** Nightly execution for heavy ledger entries, bank statement reconciliations, and inventory snapshots.
5. **On-Demand Manual Sync:** Operator-triggered forced sync via the Admin Command Center.

### Standardized Business Event Catalog:
Published across the Event Bus with standardized CloudEvent JSON headers:
- `CustomerCreated` / `CustomerUpdated`
- `OrderCreated` / `OrderUpdated`
- `InvoiceCreated` / `InvoicePaid`
- `PaymentReceived` / `PaymentDisbursed`
- `ShipmentCompleted` / `InventoryAdjusted`

---

## 5. Data Transformation Engine & File Exchange Framework

### Transformation Capabilities:
- **Graphical & Code Mapping Rules:** Maps custom vendor JSON/XML schemas into Canonical Data Model formats.
- **Field Cleansing & Translation:** Converts country names (e.g., "KSA" -> "SA"), currency symbols, and HS code formats.
- **Data Enrichment:** Automatically appends latitude/longitude geocodes, ZATCA tax rules, and exchange rates during payload parsing.

### File Exchange Engine (EDI & Flat Files):
Supports legacy enterprise file exchange formats for supply chain partners lacking modern REST APIs:
- **Supported Formats:** CSV, XML, JSON, EDIFACT (e.g., `IFTMIN`, `IFTSTA`), ANSI X12 (e.g., `204`, `214`, `810`, `850`).
- **Secure Transport:** SFTP, AS2, HTTPS Webhook Ingestion with PGP encryption at rest.
- **Processing History:** Stores raw input files, parsed outputs, validation reports, and error logs for 7 years.

---

## 6. Security, Resilience & Error Management

### Security Architecture:
- **Authentication:** OAuth2 Client Credentials for modern ERPs; Mutual TLS (mTLS) for bank feeds; Encrypted API Keys for legacy systems.
- **Secrets Management:** Credentials and PGP keys stored in HashiCorp Vault with zero plain-text disk exposure.
- **Auditability:** Full trace logging of request headers, payload hashes, and execution timestamps.

### Error Handling & Circuit Breakers:
- **Dead Letter Queue (DLQ):** Failed ERP sync messages are routed to a dedicated DLQ queue with automated alert triggers.
- **Exponential Backoff:** Retries failed requests at 1m, 5m, 15m, 1h intervals.
- **Circuit Breaker:** Automatically trips open if an enterprise ERP endpoint experiences >15% error rate, preventing system cascade failures.

---

## 7. Design Tokens, Monitoring & Developer Onboarding

### ERP Integration Design Tokens:
- `SyncStatus.Synced` (emerald)
- `SyncStatus.Pending` (amber)
- `SyncStatus.Failed` (rose)
- `IntegrationHealth.Optimal`
- `IntegrationHealth.Degraded`
- `MDMStatus.Golden`

### Monitoring Observability Panel:
Real-time dashboard tracking sync latency, payload throughput (MB/s), queue depth, API quota utilization, and active DLQ error incidents.

### Unified Developer Guide: Adding a New ERP or Accounting System:
1. Define the connector configuration and register credentials in Vault.
2. Implement the `IERPConnector` interface implementing `SyncCustomer`, `SyncInvoice`, `SyncOrder`, and `SyncJournalEntry`.
3. Create field mapping definitions converting the vendor payload to the Canonical Data Model.
4. Execute contract tests against the Mock ERP Sandbox.
5. Enable the connector in the Admin Platform and monitor initial synchronization metrics.

---

# PART 6: STEP 13.06 — Maps, Geolocation, Route Intelligence & Location Services Integration Framework

## 1. Executive Summary & Architecture Vision
The **Location Intelligence Platform** provides a provider-agnostic, real-time spatial data layer connecting **AJA INTERNATIONAL LOGISTICS** with global and regional mapping services (Google Maps Platform, HERE Technologies, Mapbox, TomTom), telematics & IoT hardware networks (Geotab, Samsara, CalAmp), address validation engines, and custom AI route optimization engines.

**Core Directive:** To maintain complete independence from map and telematics vendor lock-in, no internal logistics module (TMS, Fleet Management, Driver Mobile App, Customer Tracking Portal) shall directly call third-party mapping SDKs or spatial APIs. All spatial requests, routing logic, geocoding calls, geofencing events, and telemetry streams must pass through the **Location Service Abstraction Layer** and use the **Canonical Location Model (CLM)**.

```
+-----------------------------------------------------------------------------------+
|               AJA LOGISTICS MODULES & CUSTOMER VISIBILITY PORTAL                  |
| TMS | Fleet Manager | Last-Mile Mobile App | Air/Sea Gateway | AI Dispatcher      |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     LOCATION SERVICE ABSTRACTION LAYER (LSAL)                     |
| ValidateAddress() | Geocode() | ComputeRoute() | CalculateETA() | TrackVehicle()  |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                       CANONICAL LOCATION MODEL (CLM)                              |
| Address | Coordinates | Route | VehiclePosition | ShipmentLocation | Geofence     |
+-----------------------------------------------------------------------------------+
       |                          |                          |                          |
       v                          v                          v                          v
+--------------+           +--------------+           +--------------+           +--------------+
| Google Maps  |           |     HERE     |           |   Samsara    |           |   Mapbox /   |
|   Platform   |           | Routing /    |           |  Telematics  |           | OpenStreetMap|
| (Places/Routes)          | Vector Maps  |           |  GPS Feed    |           |   Engine     |
+--------------+           +--------------+           +--------------+           +--------------+
```

---

## 2. Location Service Abstraction Layer (LSAL)
Every spatial connector integrated into the AJA ecosystem must implement the unified `ILocationConnector` contract:

### Connector Configuration & Capabilities:
- **Provider Identity & Type:** Connector ID, Provider Name (e.g., `GoogleMaps_v3`, `Samsara_Telematics`), Primary Domain (Geocoding, Routing, Telematics, Places).
- **Credentials & Key Rotation:** Vault-managed API keys, OAuth tokens, and mTLS certificates with automatic 90-day key rotation.
- **Service Feature Matrix:** Explicit flag toggles for supported capabilities: `FORWARD_GEOCODING`, `REVERSE_GEOCODING`, `PLACES_AUTOCOMPLETE`, `ADDRESS_VALIDATION`, `TRUCK_ROUTING`, `DISTANCE_MATRIX`, `LIVE_TRAFFIC`, `GEOFENCING`, `TELEMATICS_STREAM`.
- **Health & Fallback Routing:** Real-time health monitoring (`HEALTHY`, `DEGRADED`, `CIRCUIT_OPEN`). Automated failover from primary provider (e.g., Google Maps) to secondary fallback provider (e.g., HERE or Mapbox) upon error spikes.
- **Circuit Breaker & Retries:** Exponential backoff with jitter (100ms base, 3 retries) and 3000ms max request timeout.
- **Logging & Quota Metrics:** Complete execution metrics capturing API call volume, latency, credit consumption, and response accuracy.

---

## 3. Canonical Location Model (CLM)
Internal systems consume spatial data strictly formatted according to the **Canonical Location Model (CLM)**:

| CLM Entity | Core Purpose | Standard Attributes & Data Types |
| :--- | :--- | :--- |
| **Address** | Normalized physical delivery & hub addresses | `addressId`, `streetName`, `buildingNumber`, `district`, `city`, `postalCode`, `countryCode` (ISO-2), `formattedAddress` |
| **Coordinates** | High-precision geospatial position | `lat` (float64), `lng` (float64), `altitudeMeters`, `precision` (enum: `EXACT`, `INTERPOLATED`, `CENTROID`) |
| **Route** | Optimized multi-stop waypoints and polylines | `routeId`, `origin`, `destination`, `waypoints[]`, `encodedPolyline`, `distanceMeters`, `durationSeconds`, `tollCost` |
| **VehiclePosition** | Real-time vehicle telematics telemetry | `vehicleId`, `coordinates`, `speedKmph`, `headingDegrees`, `ignitionOn` (bool), `fuelLevelPct`, `timestamp` |
| **ShipmentPosition**| Last-known position of a freight unit | `shipmentId`, `currentHubId`, `coordinates`, `transportMode` (Air/Sea/Road), `lastUpdated`, `status` |
| **Geofence** | Defined virtual geographical perimeter | `geofenceId`, `name`, `type` (`CIRCLE` / `POLYGON`), `coordinates[]`, `radiusMeters`, `associatedHubId` |
| **ETA** | Machine-learning enhanced estimated arrival time | `shipmentId`, `routeId`, `estimatedArrivalTime` (ISO-8601), `confidenceScore` (0.00-1.00), `delayMinutes`, `reason` |
| **Distance** | Distance & travel time matrix element | `originId`, `destinationId`, `distanceMeters`, `travelTimeSeconds`, `trafficDurationSeconds` |

---

## 4. Address Services Framework
Provides localized and international address standardizing, cleaning, and geocoding:

- **Address Validation & Normalization:** Validates physical addresses against national postal databases (e.g., Saudi National Address / SPL Short Address, UAE Makani numbers, Zip Codes) to ensure 100% deliverability.
- **Forward & Reverse Geocoding:** Converts physical address strings into precise WGS84 coordinates (`lat`, `lng`) and vice-versa.
- **Typeahead Address Suggestions:** Real-time autocomplete suggestions during booking creation using Google Places API (New) with restricted field masks to minimize API cost tiers.
- **Postal Code & District Parsing:** Extracts administrative boundaries, municipal districts, and postal zones for automated hub assignment.

---

## 5. Route Intelligence & Multi-Stop Optimization Engine
The **Route Intelligence Engine** calculates optimal transport paths for heavy freight trucks, delivery vans, and fleet drivers:

```
+-----------------------------------------------------------------------------------+
|                            ROUTE OPTIMIZATION INPUTS                              |
| Waypoints | Vehicle Height/Weight | HazMat Class | Traffic Feed | Driver Shift Limits |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        AJA ROUTE INTELLIGENCE ENGINE                              |
| Distance Matrix Computation | TSP/VRP Solver | Toll Minimizer | Road Restriction Check|
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                            OPTIMIZED ROUTE OUTPUT                                 |
| Encoded Polyline | Multi-Stop ETA Schedule | Fuel Consumption | Toll Cost Breakdown   |
+-----------------------------------------------------------------------------------+
```

### Advanced Route Capabilities:
- **Commercial Vehicle & Truck Restrictions:** Enforces axle weight limits, vehicle height clearance, bridge weight capacities, and dangerous goods (HazMat) transit prohibitions.
- **Multi-Stop Route TSP/VRP Solver:** Solves Travelling Salesperson and Vehicle Routing Problems with time-window constraints (e.g., customer delivery slots).
- **Toll & Cost Awareness:** Calculates toll gate fees (e.g., Salik in Dubai, Saudi highway tolls) and balances distance vs. toll cost trade-offs.
- **Live & Historical Traffic Matrix:** Uses real-time traffic speeds and predictive historical congestion patterns to adjust departure times.

---

## 6. ETA Engine & Predictive Delay Analytics
The **ETA Engine** continuously recalculates arrival timelines for active air, ocean, and road freight movements:

- **Multi-Factor Input Pipeline:** Blends real-time vehicle speed, remaining route distance, live traffic delays, driver mandatory rest breaks, port gate dwell times, and customs clearance queues.
- **Confidence Scoring Model:** Assigns a dynamic confidence score (`HIGH` > 90%, `MEDIUM` 70-90%, `LOW` < 70%) based on weather stability and transit history.
- **Delay Alerting:** Automatically triggers system notifications when predicted delay exceeds configurable thresholds (e.g., > 15 minutes for express domestic cargo; > 4 hours for ocean freight).

---

## 7. Vehicle & Shipment Telematics Tracking Framework
Interfacing with GPS hardware, IoT sensors, and mobile device GPS drivers:

- **Real-Time Telemetry Feed:** Ingests vehicle coordinates, speed, heading, ignition status, engine idle time, and odometer readings at 10-second intervals.
- **Trip History & Replay:** Maintains full spatial-temporal logs allowing operations managers to replay historical delivery routes step-by-step.
- **Cold Chain Sensor Ingestion:** Combines GPS location feeds with Bluetooth/IoT temperature and humidity sensors for pharmaceutical and perishable food cargo.

---

## 8. Geofencing & Zone Management Framework
Enables spatial automation around warehouses, sea ports, airport cargo terminals, and customer delivery premises:

- **Geofence Types:** Supports circular geofences (center + radius) and complex multi-vertex polygon geofences defining precise warehouse yards or port docks.
- **Automated Event Detection:** Triggers immediate system events upon detecting:
  - `GEOFENCE_ENTERED`: Vehicle/shipment arrives at port gate or distribution hub.
  - `GEOFENCE_EXITED`: Vehicle/shipment departs dispatch center.
  - `GEOFENCE_DWELL_TIMEOUT`: Alert raised if a truck remains idle inside a loading dock beyond allocated dwell time (e.g., > 45 minutes).

---

## 9. Standardized Location Event Catalog
All location events pass through the Event Bus formatted as CloudEvents:

```json
{
  "specversion": "1.0",
  "type": "com.aja.location.geofence.entered",
  "source": "/location-service/geofence-engine",
  "id": "evt-geo-9908123-2026",
  "time": "2026-08-05T19:05:00Z",
  "datacontenttype": "application/json",
  "data": {
    "vehicleId": "VEH-RUH-8821",
    "shipmentId": "SHP-2026-90812",
    "geofenceId": "GEO-HUB-JED-PORT",
    "geofenceName": "Jeddah Islamic Port Container Yard",
    "coordinates": { "lat": 21.4858, "lng": 39.1925 },
    "speedKmph": 12.5,
    "timestamp": "2026-08-05T19:04:58Z"
  }
}
```

### Catalog of Standard Events:
- `VehicleStarted` / `VehicleStopped`
- `RouteStarted` / `RouteCompleted`
- `ShipmentLocationUpdated`
- `ETAUpdated`
- `GeofenceEntered` / `GeofenceExited`
- `DwellTimeExceeded`
- `RouteDeviationDetected`

---

## 10. Security, Performance & Scalability Architecture

### Security Protocols:
- **API Key Security & Exposure Protection:** Client-side web maps consume restricted, ephemeral session tokens. Server-side master API keys remain hidden behind the LSAL layer.
- **In-Transit & At-Rest Encryption:** TLS 1.3 for spatial data streams; AES-256 spatial indexing database storage.
- **Privacy & Anonymization:** Driver location logs anonymized after 90 days in compliance with local workforce privacy regulations.

### High-Throughput Performance:
- **Real-Time WebSockets & SSE:** Streams active driver coordinates to customer tracking portals using Server-Sent Events (SSE) and WebSocket channels.
- **Spatial Caching Layer:** Caches static geocoding queries, reverse geocodes, and route polylines in Redis with spatial indexing (Geohash / H3 Grid), reducing redundant API costs by up to 60%.
- **Queue-Based Processing:** Telematics feeds from 10,000+ active fleet vehicles processed asynchronously via high-throughput Kafka / RabbitMQ ingestion pipelines.

---

## 11. Monitoring, Observability & Location Design Tokens

### Observability Dashboard Metrics:
- **Provider Status & SLA:** Latency (ms), error rates (%), and uptime (%) per location connector.
- **API Cost & Quota Usage:** Daily map loads, geocoding requests, and route computations vs monthly billing caps.
- **Tracking Accuracy:** Average GPS signal precision (meters), lost signal count, and telemetry packet delay.
- **ETA Accuracy:** Mean Absolute Error (MAE) between predicted ETA and actual delivery timestamps.

### Location Design Tokens:
- `MapStatus.Active` (emerald)
- `MapStatus.Degraded` (amber)
- `VehicleStatus.InTransit` (indigo)
- `VehicleStatus.Stopped` (slate)
- `VehicleStatus.Idle` (amber)
- `ETAStatus.OnTime` (emerald)
- `ETAStatus.Delayed` (rose)
- `GeofenceStatus.Inside` (blue)
- `GeofenceStatus.Outside` (neutral)

---

# PART 7: STEP 13.07 — Enterprise Communication, Notifications & Messaging Integration Framework

## 1. Executive Summary & Platform Architecture Vision
The **Enterprise Communication Platform (ECP)** serves as the single, centralized, provider-agnostic messaging hub for **AJA INTERNATIONAL LOGISTICS**. It governs all outbound and inbound transactional, operational, and promotional communications sent to customers, drivers, warehouse operators, customs brokers, carriers, internal employees, and partner ecosystems.

**Core Directive:** No core logistics module (TMS, WMS, OMS, Finance, Portal, Driver App) is permitted to call external communication APIs (such as Twilio, SendGrid, FCM, Meta WhatsApp API, or SMS gateways) directly. All notification triggers must publish business events to the **Communication Abstraction Layer (CAL)**, which handles template compilation, dynamic provider routing, fallback channel execution, localization, rate limiting, and delivery tracking.

```
+-----------------------------------------------------------------------------------+
|               AJA LOGISTICS MODULES & INTERNAL BUSINESS EVENTS                    |
| Shipment | Customs | Invoicing | Fleet Dispatch | AI Engine | Customer Portal     |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     COMMUNICATION ABSTRACTION LAYER (CAL)                         |
| Event Router | Template Engine | Channel Fallback Engine | User Preference Check  |
+-----------------------------------------------------------------------------------+
                                          |
        +------------------+--------------+--------------+------------------+
        |                  |                             |                  |
        v                  v                             v                  v
+---------------+  +---------------+             +---------------+  +---------------+
| EMAIL HUB     |  | SMS GATEWAY   |             | WHATSAPP BIZ  |  | PUSH & IN-APP |
| (SES/SendGrid)|  | (Twilio/Mobily|             | (Meta/Infobip)|  | (FCM/WebSockets|
+---------------+  +---------------+             +---------------+  +---------------+
```

---

## 2. Communication Abstraction Layer (CAL) & Connector Specification
Every messaging adapter integrated into the AJA platform implements a strict `ICommunicationConnector` contract:

### Connector Lifecycle & Metadata Properties:
- **Provider Identity & Config:** ID, Name (e.g., `SendGrid_v3`, `Unifonic_SMS`, `Meta_WhatsApp_v18`, `FCM_v1`), Supported Channels (`EMAIL`, `SMS`, `WHATSAPP`, `PUSH_MOBILE`, `PUSH_WEB`, `IN_APP`).
- **Credentials & Vault Security:** Credentials (API Keys, Tokens, Secret Keys, Private Key JSONs) stored in HashiCorp Vault / Secret Manager with automated 90-day rotation and zero hardcoded secrets.
- **Health & Health Checks:** Real-time ping latency, circuit breaker state (`HEALTHY`, `DEGRADED`, `CIRCUIT_OPEN`), success rate SLA tracking.
- **Rate Limiting & Quota Management:** Enforces provider API rate limits (e.g., 100 SMS/sec, 10,000 Emails/min) with token bucket queuing to eliminate provider throttling errors (HTTP 429).
- **Timeout & Retry Policy:** 2500ms max timeout per API invocation; exponential backoff retry policy (1s base, max 3 attempts) before failing over to backup providers or fallback channels.
- **Auditability & Metrics:** Structured JSON execution logs recording provider request ID, delivery status, timestamp, byte size, and cost per message.

---

## 3. Supported Multi-Channel Capabilities

| Channel | Core Use Cases | Supported Features & Provider Adapters |
| :--- | :--- | :--- |
| **Email** | Invoices, Waybills, Contract Approvals, Statements, Welcome Onboarding | AWS SES, SendGrid, Mailgun. Supports HTML5 responsive templates, PDF attachments, digital signatures, open/click tracking, bounce/spam feedback loops. |
| **SMS** | OTP verification, Urgent Delivery Alerts, Driver Arrival Notifications | Unifonic, Twilio, Mobily, Zain. Supports single/bulk SMS, alphanumeric sender IDs, character encoding (GSM 7-bit & Unicode Arabic), delivery receipts (DLR). |
| **WhatsApp Business** | Real-time shipment tracking links, Interactive Quick Replies, Waybill PDF shares | Meta WhatsApp Cloud API, Infobip, Twilio for WhatsApp. Supports HSM Template Messages, interactive buttons, document sharing, read receipts, and 24-hour support session messaging. |
| **Push Notifications** | Driver job dispatches, Urgent route changes, Mobile app status updates | Firebase Cloud Messaging (FCM), Apple Push Notification service (APNs), Web Push (VAPID). Supports rich media (images/maps), deep links, vibration patterns, silent background syncs. |
| **In-App Notifications** | Workspace alerts, Task assignments, Portal notification center inbox | Native WebSockets / Server-Sent Events (SSE) & Firebase Firestore sync. Supports real-time unread counter badge, categorization, read/unread states, and action triggers. |

---

## 4. Centralized Multi-Lingual Template Management Engine
All messaging content is decoupled from application code and managed inside the **Template Management Engine**:

- **Multi-Lingual Support:** Native dual-language templates (Arabic `ar_SA` and English `en_US`) with automated RTL/LTR layout rendering.
- **Dynamic Variable Interpolation:** Handlebars/Mustache syntax supporting context data injection (e.g., `{{customerName}}`, `{{trackingNumber}}`, `{{formattedAmount}}`, `{{etaTimestamp}}`).
- **Version Control & Approval Workflow:** Immutable semantic versioning (`v1.0.0`, `v1.1.0`). Changes require dual authorization (Marketing/Compliance + Operations Lead) prior to production deployment.
- **Interactive Sandbox & Test Sending:** Live visual preview engine allowing administrators to test render templates across desktop/mobile views and dispatch test messages to sandbox devices.

---

## 5. Business Event Ingestion & Notification Mapping Matrix
Internal services publish domain events to the Kafka/RabbitMQ Event Bus. The ECP listens for these events and dispatches messages according to pre-configured rules:

| Internal Event Name | Default Primary Channel | Secondary Fallback Channel | Target Recipient Role |
| :--- | :--- | :--- | :--- |
| `ShipmentCreated` | WhatsApp Business | Email | B2B / B2C Customer |
| `ShipmentUpdated` | In-App / Push | WhatsApp | Customer / Operations Desk |
| `ShipmentDelivered` | WhatsApp Business | SMS | Consignee / Recipient |
| `PickupScheduled` | Mobile Push | SMS | Fleet Driver / Dispatcher |
| `CustomsCleared` | In-App Notification | Email | Customs Clearance Agent |
| `InvoiceIssued` | Email (with PDF) | WhatsApp | Finance Dept / Customer |
| `PaymentReceived` | Email | WhatsApp | Customer / Accounting |
| `PaymentFailed` | SMS + In-App | Email | Customer / Billing Desk |
| `QuoteApproved` | Email | In-App | Sales Manager / Account Exec |
| `UserInvitation` | Email | SMS | New Platform Employee/Partner |
| `PasswordReset` | SMS (OTP) / Email | WhatsApp | Any Authenticated User |

---

## 6. Delivery Policies, Quiet Hours & Fallback Channel Routing
The **Intelligent Dispatch Engine** enforces business logic prior to message transmission:

```
+-----------------------------------------------------------------------------------+
|                              OUTBOUND MESSAGE REQUEST                             |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                            USER PREFERENCE & QUIET HOUR CHECK                     |
| Is Channel Allowed? | Is Current Local Time in Quiet Hours (22:00-07:00)?         |
+-----------------------------------------------------------------------------------+
                      /                                 \
          Allowed & Urgent                          Quiet Hour / Non-Urgent
                   /                                       \
                  v                                         v
+---------------------------------------+  +---------------------------------------+
|      EXECUTE PRIMARY DISPATCH         |  |   SCHEDULE FOR NEXT PERMITTED WINDOW  |
+---------------------------------------+  +---------------------------------------+
                  |
     Failure / Provider Timeout
                  |
                  v
+---------------------------------------+
|  EXECUTE FALLBACK CHANNEL ROUTING     |
|  (e.g., Push -> WhatsApp -> SMS)      |
+---------------------------------------+
```

- **Priority Classification:** `CRITICAL` (OTP, Security Alerts - bypasses quiet hours), `HIGH` (Shipment Dispatches, Delivery Approaching), `NORMAL` (Invoice Statements, Milestones), `LOW` (Promotions, Weekly Summaries).
- **Quiet Hours Policy:** Restricts non-critical SMS and Push notifications between 22:00 and 07:00 local time (Asia/Riyadh), queuing them for dispatch at 07:05 AM.
- **Fallback Cascading:** If Primary Channel (e.g., WhatsApp) fails or remains unread for 10 minutes, the engine automatically cascades to Secondary Channel (e.g., SMS or Email).

---

## 7. User Preferences & Granular Communication Matrix
Customers and users maintain full control over their notification settings through the Customer Portal:

- **Granular Matrix Controls:** Toggle switches per event category (`Operational`, `Financial`, `Security`, `Marketing`) across each channel (`Email`, `SMS`, `WhatsApp`, `Push`).
- **Mandatory Overrides:** Critical security events (OTP, Password Resets) and mandatory legal notices (Invoices, Customs Holds) cannot be disabled by users.
- **Preferred Language & Timezone:** User locale settings automatically select template language (`ar_SA` / `en_US`) and format timestamps according to recipient timezone.

---

## 8. End-to-End Message Lifecycle & Webhook Processing
Every message generated receives a unique `messageId` (e.g., `MSG-2026-90812-ECP`) and transitions through an audited state machine:

```
+------------+     +------------+     +------------+     +------------+
|   QUEUED   | --> |    SENT    | --> | DELIVERED  | --> |   OPENED   |
+------------+     +------------+     +------------+     +------------+
      |                  |                  |                  |
      v                  v                  v                  v
+------------+     +------------+     +------------+     +------------+
|  EXPIRED   |     |   FAILED   |     |  RETRIED   |     |    READ    |
+------------+     +------------+     +------------+     +------------+
```

### Webhook Ingestion Engine:
- Receiver endpoints validate HMAC digital signatures from providers (e.g., SendGrid webhooks, Meta WhatsApp Webhooks).
- Processes delivery reports (DLR), read receipts, email opens, link clicks, bounces, and spam complaints in real-time.
- Unsubscribes bounced or complained email addresses automatically to protect domain sender reputation.

---

## 9. Security, Compliance & Data Privacy Architecture
- **PII & Data Masking:** Recipient phone numbers and email addresses are masked in application logs (e.g., `+966 5* *** 8812`, `a***k@domain.com`).
- **Encryption Standards:** TLS 1.3 for all outbound provider requests; AES-256-GCM encryption for message body payloads stored at rest in tracking archives.
- **Regulatory Compliance:** Complies with Saudi Personal Data Protection Law (PDPL), GDPR, and CITC SMS Regulations (mandatory opt-out instructions for promotional SMS).

---

## 10. Performance, Observability & Design Tokens

### High-Throughput Queue Architecture:
- Built on Kafka / RabbitMQ asynchronous worker pools capable of bursting to 50,000+ messages per minute during flash dispatch events.
- Horizontal pod autoscaling (HPA) triggers worker scaling when queue depth exceeds 500 messages.

### Communication Design Tokens:
- `MessageStatus.Queued` (slate)
- `MessageStatus.Sent` (blue)
- `MessageStatus.Delivered` (emerald)
- `MessageStatus.Read` (indigo)
- `MessageStatus.Failed` (rose)
- `ChannelHealth.Optimal` (emerald)
- `ChannelHealth.Degraded` (amber)
- `ChannelHealth.Offline` (rose)

### Observability Dashboard Metrics:
Real-time operations dashboard tracking Total Messages Sent, Channel Delivery Success Rate (%), Mean Latency (ms), Open/Read Rate (%), Bounce Rate (%), and API Quota Consumption.

---

## 11. Testing Strategy
- **Mock Communication Connectors:** Full local sandbox environment generating mock delivery receipts without consuming live SMS/WhatsApp credits.
- **Template Contract Testing:** Automated CI/CD pipeline verifying template dynamic variables against backend event payload schemas.
- **Load & Chaos Simulation:** Simulates provider downtime to verify fallback channel cascading (e.g., WhatsApp outage triggering SMS failover).

---

## 12. Unified Developer Guide: Adding or Replacing a Communication Provider
To onboard a new messaging provider or gateway (e.g., Infobip or a local Saudi SMS gateway):
1. Implement the `ICommunicationConnector` interface in the ECP core.
2. Register API credentials and authentication keys in HashiCorp Vault.
3. Configure the provider mapping and channel support rules in `communication_config.json`.
4. Deploy contract tests using the Mock Sandbox test suite.
5. Enable the provider in the Admin Console and configure canary traffic routing (e.g., 10% live traffic rollout).

---

# PART 8: STEP 13.08 — Connector Framework, Integration Orchestration & Data Transformation Platform

## 1. Executive Summary & Orchestration Platform Vision
The **Integration Orchestration Platform (IOP)** serves as the central operational engine and nervous system for **AJA INTERNATIONAL LOGISTICS**. It governs, routes, transforms, orchestrates, and monitors all data exchanges across every integration domain established in Steps 13.01 to 13.07:
- **Shipping Carriers & Couriers (13.02)**
- **Air Freight, Ocean Freight, Ports (Mawani) & Customs (ZATCA) Gateways (13.03)**
- **Payment Gateways & ERP Accounting Systems (13.04)**
- **Enterprise ERPs, CRM & Supply Chain Management Systems (13.05)**
- **Maps, GIS, Route Solvers & Telematics Platforms (13.06)**
- **Multi-Channel Communication & Notification Systems (13.07)**

**Core Directive:** No third-party API, external webhook, carrier feed, or enterprise ERP connection is permitted to execute outside the Integration Orchestration Platform. All workflows, transformations, message routings, and synchronizations are managed via configuration-driven pipelines, ensuring 100% provider abstraction, end-to-end auditability, and zero core system coupling.

```
+-----------------------------------------------------------------------------------+
|               AJA LOGISTICS BUSINESS DOMAINS & CORE SERVICES                      |
| TMS | WMS | OMS | Fleet | Financials | Customs | Customer Portal | AI Engine      |
+-----------------------------------------------------------------------------------+
                                          ^
                                          | Unified Events & API Bus
                                          v
+-----------------------------------------------------------------------------------+
|                INTEGRATION ORCHESTRATION PLATFORM (IOP) CORE                      |
| Workflow Engine | Connector Registry | Data Transformer | Router | Event Bus      |
+-----------------------------------------------------------------------------------+
       |                          |                          |                          |
       v                          v                          v                          v
+--------------+           +--------------+           +--------------+           +--------------+
| Carrier &    |           | Multimodal   |           | Financial &  |           | GIS, ERP &   |
| Express Hub  |           | Port/Customs |           | Payment Hub  |           | Comm Engine  |
+--------------+           +--------------+           +--------------+           +--------------+
```

---

## 2. Integration Orchestration Engine & Workflow Architecture
The **Integration Orchestration Engine** executes complex, multi-system transactional workflows with guaranteed consistency, compensation, and idempotency.

### Orchestration Execution Models:
- **Workflow-Based Integration:** Graph-based integration DAGs (Directed Acyclic Graphs) defining execution steps, dependencies, and conditions.
- **Multi-Step & Parallel Execution:** Runs independent sub-tasks concurrently (e.g., simultaneously querying carrier rates from 5 shipping lines and verifying customer credit score in ERP).
- **Sequential Execution:** Enforces strict ordered processing (e.g., `ZATCA Declaration` -> `Duties Assessment` -> `Payment Settlement` -> `Port Gate Release`).
- **Conditional Routing:** Dynamic branching based on payload attributes (e.g., if cargo weight > 5000kg route to Heavy Freight Carrier; if destination is inside EU route to EU Customs Gateway).
- **Retry, Timeout & Compensation (Saga Pattern):** When a step in a multi-system workflow fails (e.g., Payment succeeds but Carrier Booking fails), the Saga Orchestrator triggers compensating transactions (e.g., automatic payment refund / authorization void) to revert state across all systems.

---

## 3. Centralized Connector Registry Architecture
Every external or enterprise connector is registered and managed in the **Centralized Connector Registry**:

```json
{
  "connectorId": "CONN-CARRIER-DHL-EXPRESS-v2",
  "name": "DHL Express International Courier Connector",
  "category": "SHIPPING_CARRIER",
  "version": "2.4.0",
  "status": "ACTIVE",
  "owner": "Logistics Systems Engineering Team",
  "configuration": {
    "baseUrl": "https://xmlpi-ea.dhl.com/XMLGateway/",
    "timeoutMs": 3000,
    "maxConcurrency": 50,
    "rateLimitPerMin": 1200
  },
  "credentialsRef": "vault://secrets/connectors/dhl-express-prod-key",
  "authenticationType": "OAUTH2_CLIENT_CREDENTIALS",
  "healthCheckEndpoint": "/api/v2/health",
  "retryPolicy": {
    "maxAttempts": 3,
    "backoffStrategy": "EXPONENTIAL_JITTER",
    "baseIntervalMs": 200
  },
  "auditHistory": [
    { "timestamp": "2026-08-05T19:00:00Z", "action": "VERSION_UPGRADE", "updatedBy": "admin-user-091" }
  ]
}
```

---

## 4. Unified Data Transformation Engine
The **Data Transformation Engine** converts data between external formats and AJA's internal **Canonical Data Model (CDM)** seamlessly:

### Supported Formats & Protocols:
- **Standard Formats:** JSON, XML, CSV, TSV, YAML.
- **Supply Chain & Logistics EDI:** EDIFACT (`IFTMIN`, `IFTSTA`, `INVOIC`), ANSI X12 (`204`, `214`, `810`, `850`).

### Core Transformation Capabilities:
- **Declarative Field Mapping:** Visual and JSON schema mapping rules converting vendor payload trees to CDM attributes.
- **Data Validation & Cleansing:** Enforces JSON Schema / XML Schema (XSD) rules prior to transformation; strips invalid characters and sanitizes text strings.
- **Type Conversion & Code Translation:** Normalizes country codes (e.g., "SAU" / "Saudi Arabia" -> "SA"), currency codes, and status codes (e.g., DHL status `OK` -> `DELIVERED`).
- **Data Enrichment:** Automatically injects spatial geocodes, current FX rates, and organization metadata during pipeline execution.
- **Detailed Error Reporting:** Identifies specific line, field, and syntax failure locations when transformation errors occur.

---

## 5. Message & Event Routing Engine
- **Request Routing:** Maps incoming external API requests to targeted internal microservices via path, header, or query parameters.
- **Response Routing:** Encapsulates internal domain responses into provider-specific expected response formats.
- **Event Routing & Pub/Sub:** Routes real-time cloud events to subscribed queue topics (e.g., `ShipmentDelivered` event broadcast to Customer Portal, CRM, and Billing Service).
- **Failover Routing:** Reroutes traffic to fallback connectors automatically when primary provider connectors enter `CIRCUIT_OPEN` state.

---

## 6. Synchronization Engine & Execution Modes
Supports flexible multi-mode data synchronization between AJA and enterprise partner systems:

| Sync Mode | Operational Frequency | Primary Use Case | Execution Mechanism |
| :--- | :--- | :--- | :--- |
| **Initial Full Sync** | Onboarding / System Initialization | Initial customer SKU, master customer, and historical data load | High-throughput parallel batch workers with chunked streaming |
| **Incremental Sync** | Periodic (e.g., every 15 mins) | Delta tracking for modified ERP records (`updatedAt > lastWatermark`) | Watermark polling workers with state persistence |
| **Real-Time Sync** | Instantaneous (< 500ms) | Urgent status changes (Customs Clearance, Payment Received, Driver Dispatch) | Event-driven Webhook & WebSockets pipelines |
| **Scheduled Sync** | Fixed Cron Schedule (Nightly/Hourly) | Heavy financial reconciliations, bank MT940 statement sync, inventory audits | Distributed Quartz/Cron scheduler workers |
| **Manual Sync** | On-Demand Operator Trigger | Manual re-sync initiated by logistics managers via Admin Console | High-priority manual job trigger with progress tracking |

---

## 7. Webhook Management Platform
The **Webhook Management Platform** handles all incoming and outgoing webhooks securely:

- **Ingestion Security:** Validates HMAC-SHA256 digital signatures, verifies IP allowlists, and enforces timestamp replay attack mitigation (rejects requests > 300 seconds old).
- **Idempotency Guarantee:** Enforces unique `X-Webhook-ID` deduping to prevent double-processing of identical events.
- **Delivery & Retry Engine:** Outbound webhooks to customer endpoints use exponential backoff retries across 48 hours for failed endpoints.
- **Delivery Audit History:** Maintains complete request/response payload logs, status codes, and execution latencies for 90 days.

---

## 8. Scheduling & Cron Management Framework
Centralized scheduling engine running time-based enterprise jobs:
- **Cron Job Scheduler:** Distributed scheduler for background maintenance, metric rollups, and periodic reports.
- **Scheduled Polling Workers:** Automated polling engine querying non-webhook legacy carriers.
- **Scheduled Health Checks:** Pings all active Connector Registry endpoints every 60 seconds.
- **Automated Data Cleanup:** Rotates raw log payloads older than retention policy constraints.

---

## 9. Error Management, Circuit Breakers & DLQ Strategy
- **Error Classification:** Categorizes errors into `VALIDATION_ERROR`, `MAPPING_ERROR`, `AUTH_ERROR`, `TIMEOUT_ERROR`, and `PROVIDER_ERROR`.
- **Circuit Breaker Pattern:** Trips to `OPEN` state if a connector reaches >15% failure rate in 3 minutes, halting traffic to the broken provider and routing to fallback adapters.
- **Dead Letter Queue (DLQ):** Unresolvable messages are captured in Kafka/RabbitMQ DLQ with context metadata (`correlationId`, `workflowId`, `stackTrace`).
- **Incident Tracking & Auto-Alerting:** Critical DLQ events automatically generate PagerDuty / Slack incidents for integration engineers.

---

## 10. Centralized Operations & Monitoring Dashboard
Real-time command center providing full visibility into integration ecosystem health:

- **Metrics Displayed:** Total Throughput (msg/sec), Active Workflows, Failed Workflows, Mean Latency (ms), Webhook Success Rate (%), DLQ Depth, Connector SLA Uptime.
- **Interactive Control Panel:** Allows operators to trigger manual retries, replay DLQ messages, pause degraded connectors, and inspect live trace spans.

---

## 11. Governance, Security & Performance Architecture
- **Security:** OAuth2 / mTLS authentication, HashiCorp Vault secrets management, TLS 1.3 in-transit encryption, AES-256 at-rest encryption, zero-trust RBAC.
- **Performance & Auto-Scaling:** Asynchronous queue-based pipeline handling 100,000+ operations/min; auto-scales background pod instances when CPU > 70% or queue depth exceeds threshold.
- **Observability:** OpenTelemetry distributed tracing with mandatory `X-Correlation-ID` headers propagating across all microservice boundaries.

---

## 12. Integration Design Tokens
- `ConnectorStatus.Active` (emerald)
- `ConnectorStatus.Degraded` (amber)
- `ConnectorStatus.Offline` (rose)
- `WorkflowStatus.Running` (blue)
- `WorkflowStatus.Completed` (emerald)
- `WorkflowStatus.Failed` (rose)
- `WorkflowStatus.Compensated` (indigo)
- `SyncStatus.InSync` (emerald)
- `QueueStatus.Healthy` (emerald)
- `QueueStatus.Backlogged` (amber)

---

## 13. Testing & Verification Strategy
- **Mock Connector Framework:** Simulates all carrier, port, payment, and ERP APIs for rapid local development and automated CI testing.
- **Contract & Workflow Simulation:** Contract tests verifying schema compliance; chaos testing simulating network partitions and API latency spikes.

---

## 14. Unified Operational Guide: Creating, Managing & Binding a New Connector or Workflow
To deploy a new Connector or Workflow into the Integration Orchestration Platform:
1. **Define Connector Metadata:** Add entry to the Connector Registry via Admin Console or JSON config.
2. **Register Vault Secrets:** Store API keys, OAuth client credentials, or mTLS certificates in Secret Manager.
3. **Build Data Mapping Scheme:** Create transformation rules binding the provider schema to the Canonical Data Model (CDM).
4. **Construct Workflow DAG:** Define the multi-step execution pipeline including fallback routes and compensation actions.
5. **Run Integration & Chaos Tests:** Execute test suite against the Mock Connector sandbox.
6. **Deploy & Canary Rollout:** Enable the workflow via API Gateway with 5% canary traffic allocation, monitoring the Operations Dashboard for errors.

---

## 15. Comprehensive Deliverables Verification Matrix (Steps 13.01 - 13.08)

| Step # | Integration Domain | Deliverable Status | Core Architecture Layer |
| :--- | :--- | :--- | :--- |
| **13.01** | Enterprise API Gateway Foundation | **COMPLETED** | API Routing, OAuth2/JWT Auth, Rate Limiting, OWASP WAF |
| **13.02** | Shipping Carriers & Couriers | **COMPLETED** | Pluggable Carrier Connector Framework, Waybills, Universal Status |
| **13.03** | Air, Ocean, Ports & Customs | **COMPLETED** | Multimodal Gateway, Mawani Port Integration, ZATCA Customs |
| **13.04** | Payment Gateways & Financials | **COMPLETED** | Financial Abstraction Layer, HyperPay/Stripe, ZATCA e-Invoice |
| **13.05** | Enterprise ERP & Business Systems| **COMPLETED** | Canonical Data Model (CDM), SAP/Oracle/Dynamics Adapters, MDM |
| **13.06** | Maps, Route & Location Intelligence| **COMPLETED** | Location Abstraction Layer (LSAL), Route Solver, ETA Engine, Geofences |
| **13.07** | Communication, Notifications & Messaging | **COMPLETED** | Communication Abstraction Layer (CAL), Multi-Channel Hub, Multi-Lingual Templates |
| **13.08** | Connector Framework & Integration Orchestration | **COMPLETED** | Integration Orchestration Platform (IOP), Data Transformer, Workflow Engine, Webhook Manager |

---

# PART 9: STEP 13.09 — Integration Security, Monitoring, Governance & Compliance Platform

## 1. Executive Summary & Control Plane Vision
The **Integration Security, Monitoring, Governance & Compliance Platform (ISMGCP)** serves as the authoritative enterprise control plane overseeing all integration assets within **AJA INTERNATIONAL LOGISTICS**. It exercises complete governance, security enforcement, real-time observability, regulatory compliance, risk mitigation, and operational control across all previously established integration domains:
- **Enterprise API Gateway Foundation (13.01)**
- **Shipping Carriers & Express Couriers (13.02)**
- **Airlines, Ocean Freight, Ports (Mawani) & Customs (ZATCA) Gateways (13.03)**
- **Payment Gateways & Financial Systems (13.04)**
- **Enterprise ERPs, CRM & Accounting Platforms (13.05)**
- **Maps, GIS, Route Solvers & Telematics Platforms (13.06)**
- **Multi-Channel Communication & Messaging Platform (13.07)**
- **Integration Orchestration & Data Transformation Engine (13.08)**

**Core Directive:** No API endpoint, connector, webhook pipeline, event subscription, or data transformation job may operate unmonitored or unmodeled. The ISMGCP enforces Zero Trust security, strict API lifecycle governance, automated compliance auditing, proactive site reliability engineering (SRE), and continuous threat protection across all logistics integrations.

```
+-----------------------------------------------------------------------------------+
|            GOVERNANCE & SECURITY CONTROL PLANE (ISMGCP) MANAGEMENT LAYER          |
| Security Engine | API Governance | Audit Vault | Observability Hub | Risk Manager |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|               ENTERPRISE INTEGRATION LANDSCAPE (STEPS 13.01 - 13.08)              |
| API Gateway | Carriers | Multimodal | Payments | ERPs | GIS | Comm | IOP Engine  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Integration Security Architecture (Zero Trust Framework)
Enforces end-to-end security across inter-service communication and third-party integrations:

- **Zero Trust Model:** "Never Trust, Always Verify." Every request—internal microservice or external third-party API call—is explicitly authenticated, authorized, and encrypted.
- **Service-to-Service Authentication (mTLS):** Mutual TLS 1.3 with dual-X.509 certificate verification for all internal microservices and high-security government gateways (ZATCA, Mawani).
- **OAuth2 & OIDC Token Verification:** Enforces OAuth2 Client Credentials for machine-to-machine integrations and OpenID Connect (OIDC) JWT tokens with short-lived access periods (15 minutes).
- **Granular Role-Based & Attribute-Based Access Control (RBAC/ABAC):** Validates caller role, tenant ID, originating IP, and request scope before granting endpoint execution.
- **Automated Secrets Management & Certificate Rotation:** All credentials, private keys, and API tokens are stored in HashiCorp Vault / Secret Manager with automated 90-day rotation and zero hardcoded secrets.

---

## 3. Enterprise API Governance Framework
Governs the entire lifecycle of APIs across internal, customer, partner, and public namespaces:

```
+--------------+     +--------------+     +--------------+     +--------------+
| DESIGN & PLAN| --> | DEVELOP & TEST| --> | STAGING REVIEW| --> |  PUBLISHED   |
+--------------+     +--------------+     +--------------+     +--------------+
                                                                      |
                                                                      v
+--------------+                          +--------------+     +--------------+
|   RETIRED    | <----------------------- | DEPRECATED   | <-- | MAJOR UPDATE |
+--------------+                          +--------------+     +--------------+
```

### Governance Rules & Standards:
- **API Lifecycle States:** `DRAFT` -> `IN_REVIEW` -> `PUBLISHED` -> `DEPRECATED` (minimum 12-month window) -> `RETIRED`.
- **Naming & URI Conventions:** Strictly RESTful, kebab-case resource paths (e.g., `/api/v1/shipments/{shipmentId}/carrier-status`), OpenAPI 3.1 contract compliance.
- **Versioning Policy:** Major versions in URL path (`/v1/`, `/v2/`). Minor and patch updates must preserve 100% backward compatibility.
- **Change Approval Workflow:** Breaking changes require dual architecture board approval and automated contract testing before staging promotion.

---

## 4. Multi-Regulatory Compliance & Data Privacy Framework
Provides flexible, region-specific compliance profiles that can be activated dynamically:

| Regulation / Standard | Scope & Implementation in AJA Integration Layer | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Saudi PDPL** (Personal Data Protection Law) | Personal Identifiable Information (PII) data masking, residency inside KSA data centers | In-transit PII masking, local cloud hosting (GCP Kingdom Region) |
| **ZATCA Phase 2** (E-Invoicing) | Digital cryptographic stamps, UUID chaining, XML invoice archiving | Automated e-Invoice signing module and 6-year tamper-proof storage |
| **PCI DSS v4.0** (Payment Security) | Credit card tokenization, Zero PAN/CVV storage on AJA servers | Hosted payment fields, tokenized payment intents |
| **CITC Telecom & SMS Rules** | Opt-out links in promotional SMS, approved sender ID registration | ECP dispatch filter enforcing opt-out lists and sender ID headers |
| **ISO 27001 / NCA ECC** | Information security controls, access logging, vulnerability management | Continuous security posture assessment and quarterly penetration audits |

---

## 5. Centralized Immutable Audit Platform
Captures every API request, integration event, configuration update, and authorization attempt into a tamper-proof audit vault:

```json
{
  "auditId": "AUD-2026-90812-3901",
  "correlationId": "corr-c4i-99018231-8812",
  "timestamp": "2026-08-05T19:20:00Z",
  "initiator": {
    "type": "SERVICE_ACCOUNT",
    "id": "svc-tms-dispatcher-prod",
    "sourceIp": "10.240.12.88"
  },
  "operation": {
    "domain": "CUSTOMS_GATEWAY",
    "action": "SUBMIT_DECLARATION",
    "endpoint": "/api/v1/customs/zatca/declarations",
    "connectorId": "CONN-CUSTOMS-ZATCA-v2"
  },
  "execution": {
    "durationMs": 342,
    "httpStatus": 200,
    "result": "SUCCESS"
  },
  "security": {
    "authMethod": "MTLS_X509",
    "tenantId": "TNT-AJA-GLOBAL"
  }
}
```

---

## 6. Unified Real-Time Monitoring Platform
Multi-dimensional operational dashboard monitoring four core layers:

1. **API Gateway Monitoring:** Total Request Volume, Latency Percentiles (p50, p95, p99), HTTP Status Code Breakdown (2xx, 4xx, 5xx), Rate Limit Throttling.
2. **Connector & Provider Health:** Endpoint Ping Latency, Success Rate SLA (%), Failure Rate (%), Active Circuit Breaker States.
3. **Integration Workflow Monitoring:** Active Workflow Executions, Completed vs Failed Workflows, Saga Compensation Triggers, Queue Depth.
4. **Infrastructure & System Telemetry:** CPU Usage, RAM Utilization, Database Connection Pool Saturation, Kafka/RabbitMQ Lag.

---

## 7. Intelligent Alert & Incident Management Engine

### Multi-Tier Alert Matrix:
- **CRITICAL (P1):** Complete gateway outage, ZATCA/Mawani API failure, Payment Processor offline, DLQ spike > 500 msgs. *Routing: PagerDuty On-Call + SMS + Instant WhatsApp Call.*
- **WARNING (P2):** Connector response time > 2000ms, Error rate > 5%, Rate limit quota at 85%. *Routing: Slack #integration-alerts channel + Email.*
- **INFO (P3):** Daily sync complete, API deprecation notice received, SSL certificate 30-day renewal warning. *Routing: Operations Digest Report.*

### Incident Lifecycle Management:
`Incident Created` -> `P1 On-Call Paged` -> `Triage & Root Cause Analysis (RCA)` -> `Remediation / Failover` -> `Resolution Verified` -> `Post-Incident Review (PIR) Published`.

---

## 8. Enterprise Observability & OpenTelemetry Standards
- **Structured JSON Logging:** Uniform log formats across all microservices including mandatory `correlationId`, `serviceName`, `environment`, and `traceId`.
- **Distributed Tracing:** OpenTelemetry (OTel) context propagation across HTTP headers (`traceparent`), allowing SREs to visualize full request journeys across 10+ microservices in Jaeger / Zipkin.
- **Synthetic API Monitoring:** Automated synthetic probes pinging critical carrier and customs API endpoints every 60 seconds to detect vendor degradation before users notice.

---

## 9. API Analytics & Consumer Insights Model
Tracks consumption patterns across external B2B partners, internal mobile apps, and customer portals:
- **Top API Consumption:** Ranks most frequently called endpoints (e.g., Track Shipment vs Generate Quote).
- **Response Time & Error Trends:** Identifies slowing endpoints and error spikes over time.
- **Consumer Statistics:** Tracks API key usage, quota utilization, and peak usage hours per B2B customer tenant.

---

## 10. Continuous Risk Management & Threat Protection
- **Threat Modeling & Vulnerability Scanning:** Automated daily SAST/DAST scans of integration code and container images.
- **OWASP API Security Top 10 Mitigation:** Built-in WAF rules preventing Broken Object Level Authorization (BOLA), Unrestricted Resource Consumption, and Broken Authentication.
- **Continuous Penetration Testing:** Quarterly third-party ethical hacking simulations targeting external integration endpoints.

---

## 11. Business Continuity, High Availability & Disaster Recovery
- **High Availability (HA):** Multi-region active-active deployment across Google Cloud Platform (KSA Kingdom Region) with 99.99% SLA uptime.
- **Disaster Recovery Targets:**
  - **Recovery Point Objective (RPO):** < 1 minute (real-time asynchronous database replication).
  - **Recovery Time Objective (RTO):** < 5 minutes (automated DNS failover to standby region).
- **Automated Chaos Engineering:** Periodic chaos experiments simulating container kills and regional network drops to verify auto-healing resilience.

---

## 12. Integration Governance & Security Design Tokens
- `SecurityState.Enforced` (emerald)
- `SecurityState.Violated` (rose)
- `APIHealth.Optimal` (emerald)
- `APIHealth.Degraded` (amber)
- `APIHealth.Critical` (rose)
- `Compliance.Compliant` (emerald)
- `Compliance.NonCompliant` (rose)
- `AlertSeverity.CriticalP1` (rose)
- `AlertSeverity.WarningP2` (amber)
- `AlertSeverity.InfoP3` (blue)
- `RiskLevel.Low` (emerald)
- `RiskLevel.High` (rose)

---

## 13. Testing Strategy
- **Security Penetration Testing:** Automated fuzz testing on REST endpoints and JWT vulnerability probes.
- **Chaos & Failover Simulation:** Injects 500ms network latency and 20% packet drops into carrier connectors to verify resilience.
- **Governance Validation Rules:** CI/CD pipeline blocks build deployment if OpenAPI specification deviates from company naming standards.

---

## 14. Unified Operational Guide: Governance, Monitoring & Incident Management
For SRE and Security Operations Teams managing the Integration Control Plane:
1. **API Onboarding Review:** Verify OpenAPI contract, ensure security scopes are configured, and run vulnerability scanner.
2. **Alert Policy Configuration:** Set SLA threshold targets and assign escalation paths in PagerDuty.
3. **Continuous Monitoring:** Review Observability Dashboard for latency anomalies and error rate spikes.
4. **Incident Response:** Follow standard P1 Playbook for gateway or connector outages; initiate failover to backup providers.
5. **Post-Incident Audit:** Conduct Root Cause Analysis (RCA), publish PIR report, and implement corrective remediation tasks within 5 business days.

---

## 15. Comprehensive Deliverables Verification Matrix (Steps 13.01 - 13.09)

| Step # | Integration Domain | Deliverable Status | Core Architecture Layer |
| :--- | :--- | :--- | :--- |
| **13.01** | Enterprise API Gateway Foundation | **COMPLETED** | API Routing, OAuth2/JWT Auth, Rate Limiting, OWASP WAF |
| **13.02** | Shipping Carriers & Couriers | **COMPLETED** | Pluggable Carrier Connector Framework, Waybills, Universal Status |
| **13.03** | Air, Ocean, Ports & Customs | **COMPLETED** | Multimodal Gateway, Mawani Port Integration, ZATCA Customs |
| **13.04** | Payment Gateways & Financials | **COMPLETED** | Financial Abstraction Layer, HyperPay/Stripe, ZATCA e-Invoice |
| **13.05** | Enterprise ERP & Business Systems| **COMPLETED** | Canonical Data Model (CDM), SAP/Oracle/Dynamics Adapters, MDM |
| **13.06** | Maps, Route & Location Intelligence| **COMPLETED** | Location Abstraction Layer (LSAL), Route Solver, ETA Engine, Geofences |
| **13.07** | Communication, Notifications & Messaging | **COMPLETED** | Communication Abstraction Layer (CAL), Multi-Channel Hub, Multi-Lingual Templates |
| **13.08** | Connector Framework & Integration Orchestration | **COMPLETED** | Integration Orchestration Platform (IOP), Data Transformer, Workflow Engine, Webhook Manager |
| **13.09** | Integration Security, Governance & Observability | **COMPLETED** | Zero Trust Control Plane, API Governance, Multi-Regulatory Compliance, SRE Observability |

---

# PART 10: STEP 13.10 — API Developer Portal, Partner Ecosystem & Integration Lifecycle Platform

## 1. Executive Summary & Partner Ecosystem Vision
The **API Developer Portal & Partner Ecosystem Platform** serves as the official B2B integration hub and front door for **AJA INTERNATIONAL LOGISTICS**. It enables B2B enterprise clients, shipping carriers, 3PL partners, customs brokers, e-commerce merchants, and third-party developers to discover, test, integrate, monitor, and manage APIs and event webhooks in a secure, self-service environment.

**Core Architecture Guarantee:**
- Complete Provider Independence & Zero Vendor Lock-in.
- Fully decoupled from core logistics business modules (TMS, WMS, OMS, Finance).
- Built on a modern tech stack (Next.js frontend + Laravel API Control Plane + PostgreSQL + Redis + Kafka Event Bus + AI Assistance Platform).
- 100% compliant with Zero Trust security, mTLS authentication, and OpenAPI 3.1 specification standards.

```
+-----------------------------------------------------------------------------------+
|             EXTERNAL DEVELOPERS, B2B PARTNERS & ENTERPRISE CLIENTS                |
| Custom ERPs | E-Commerce Stores | 3PL Freight Partners | Customs Brokers          |
+-----------------------------------------------------------------------------------+
                                          |
                                          v (HTTPS / TLS 1.3)
+-----------------------------------------------------------------------------------+
|               AJA DEVELOPER & PARTNER ECOSYSTEM PLATFORM                          |
| Developer Portal | API Catalog | Interactive Sandbox | Self-Service Webhook Hub   |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|               ENTERPRISE INTEGRATION LAYER (STEPS 13.01 - 13.09)                  |
| API Gateway | Connector Registry | IOP Engine | Zero Trust Control Plane           |
+-----------------------------------------------------------------------------------+
```

---

## 2. Developer & Partner Portal Architecture
Designed with a modular, high-performance architecture split into 13 core functional modules:

```
+-----------------------------------------------------------------------------------+
|                           DEVELOPER PLATFORM MODULES                              |
| +--------------------+  +--------------------+  +-------------------------------+ |
| | Developer Portal   |  | Partner Portal     |  | API Catalog                   | |
| +--------------------+  +--------------------+  +-------------------------------+ |
| | Interactive Sandbox|  | API Documentation  |  | API Key & OAuth Credentials   | |
| +--------------------+  +--------------------+  +-------------------------------+ |
| | Webhook Management |  | Integration Dashboard | API Usage & SLA Analytics     | |
| +--------------------+  +--------------------+  +-------------------------------+ |
| | Support & Helpdesk |  | Release Notes Hub  |  | Change Log & Migration Center | |
| +--------------------+  +--------------------+  +-------------------------------+ |
+-----------------------------------------------------------------------------------+
```

- **Developer Portal:** Public-facing portal for developer registration, API exploration, interactive code snippets, and quick-start guides.
- **Partner Portal:** Secure, authenticated workspace for B2B partners to manage organizational teams, API credentials, production permissions, and SLAs.
- **API Catalog:** Centralized directory categorizing APIs by domain (`Shipping`, `Customs`, `Payments`, `ERP/Finance`, `Location/GIS`, `Communications`).

---

## 3. API Catalog & OpenAPI 3.1 Documentation Standards
All APIs hosted on the platform are documented strictly adhering to the **OpenAPI 3.1 Specification**:

### Catalog Attributes per API:
- **Identifier & Name:** e.g., `api-shipments-v2` - Universal Shipping & Tracking API.
- **Category & Description:** Logistics Operations, Customs Clearance, Freight Quotes, Invoicing.
- **Version & Lifecycle State:** `v2.4.0` (`PUBLISHED`, `STABLE`).
- **Auth Requirements:** OAuth 2.0 (`Bearer JWT`) with granular OAuth scopes (e.g., `shipments:read`, `shipments:write`).
- **Rate Limits & SLAs:** 1,000 req/min default limit; 99.95% SLA uptime tier.
- **Interactive Code Samples:** Auto-generated code snippets in cURL, JavaScript/TypeScript (Node.js/Next.js), PHP (Laravel), Python, Java, and C# (.NET).

---

## 4. Isolated Multi-Tenant Sandbox Environment Architecture
To prevent testing traffic from impacting production systems, AJA provides a completely isolated, mock-backed **Sandbox Environment**:

- **Mock Data Generator:** Generates realistic Saudi & global addresses, waybill tracking numbers (e.g., `AJA-SB-901823`), customs HS codes, and SAR currency transactions.
- **Isolated Credentials:** Sandbox API keys (`sk_sandbox_...`) and OAuth client secrets scoped exclusively to the sandbox gateway (`https://sandbox-api.ajalogistics.com`).
- **Simulated Failure Scenarios:** Allows partners to test edge-cases by triggering synthetic error headers (e.g., `X-Simulate-Error: CUSTOMS_HOLDOUT`, `X-Simulate-Error: INSUFFICIENT_FUNDS`, `X-Simulate-Error: CARRIER_TIMEOUT`).
- **Zero Production Impact:** Sandbox uses isolated test databases and mock connectors; no live carrier bookings, real credit card charges, or actual SMS dispatches occur.

---

## 5. API Key & OAuth 2.0 Credentials Management
Empowers partners to manage authentication credentials securely via self-service:

### Credentials Management Lifecycle:
- **API Key Generation:** Instant provisioning of `Publishable Key` and `Secret Key` pairs for development and production.
- **Key Rotation Policy:** Seamless zero-downtime key rotation with dual-active key overlap windows (up to 48 hours) prior to old key revocation.
- **OAuth 2.0 Client Registration:** Register B2B OAuth clients, configure Client IDs/Secrets, define authorized Redirect URIs, and assign least-privilege OAuth scopes.
- **Credential Storage Security:** Secret keys displayed only once upon generation; stored using bcrypt/Argon2 hashing in PostgreSQL and HashiCorp Vault.

---

## 6. Partner Webhook Self-Service Platform
B2B partners can register and monitor real-time event webhooks directly from their workspace dashboard:

```json
{
  "webhookId": "whk_partner_90182",
  "endpointUrl": "https://api.partnercompany.com/v1/aja-events",
  "subscribedEvents": [
    "shipment.created",
    "shipment.customs_cleared",
    "shipment.out_for_delivery",
    "shipment.delivered"
  ],
  "security": {
    "authType": "HMAC_SHA256",
    "signingSecret": "whsec_live_90812390812390123"
  },
  "retryPolicy": {
    "maxAttempts": 5,
    "backoffStrategy": "EXPONENTIAL",
    "initialIntervalSec": 30
  }
}
```

- **Event Simulator & Manual Test Dispatch:** Allows partners to trigger test webhook payloads to verify their receiver endpoints.
- **Delivery Log & Replay Engine:** Displays HTTP status codes, latency, and response bodies for every webhook attempt with single-click manual payload replay.

---

## 7. End-to-End Integration Lifecycle Model
A rigorous 11-stage integration lifecycle model governs B2B partner onboarding from initial sign-up to production sunsetting:

```
+-----------------------------------------------------------------------------------+
|                        11-STAGE INTEGRATION LIFECYCLE MODEL                       |
| 1. Registration  -->  2. Verification  -->  3. Sandbox Access --> 4. Development  |
| 5. Testing       -->  6. Certification -->  7. Production Approval              |
| 8. Live Monitoring--> 9. Version Upgrade--> 10. Deprecation   --> 11. Retirement   |
+-----------------------------------------------------------------------------------+
```

1. **Partner Registration:** B2B entity submits company registration, tax ID (CR/VAT in KSA), and technical contact info.
2. **Identity Verification:** Automated identity check and domain verification.
3. **Sandbox Provisioning:** Instant issuance of sandbox credentials and test environment access.
4. **Development Phase:** Partner builds integration using OpenAPI docs and interactive code snippets.
5. **Sandbox Testing:** Execution of mandatory automated integration test suites.
6. **Certification (Optional):** Architecture review for high-volume enterprise B2B partners (> 1M API calls/month).
7. **Production Approval:** Security review sign-off and issuance of production API keys (`sk_live_...`).
8. **Live Production Monitoring:** Continuous monitoring of partner request volume, latency, and SLA compliance.
9. **Version Upgrade:** Automated notification of new minor/major API version availability.
10. **Deprecation Window:** Minimum 12-month advance notice provided for major version sunsetting.
11. **Retirement:** Graceful decommissioning of deprecated API versions with automated traffic migration reporting.

---

## 8. B2B Partner Self-Service, Team RBAC & Quotas
- **Team Workspace Management:** Invite team members with role-based permissions (`Owner`, `Lead Developer`, `Finance Administrator`, `Viewer`).
- **Quota & Tier Management:** Real-time visibility into current API rate limits, monthly quota consumption, and self-service tier upgrade requests.
- **Custom IP Allowlists:** Enforce IP CIDR restriction rules for production API key execution.

---

## 9. API Analytics, Usage Metrics & SLA Monitoring Dashboard
Provides B2B partners and internal AJA product managers with rich real-time visual analytics:

- **Metrics Tracked:** Total API Requests, Average Response Time (ms), Error Rate (%), HTTP Status Breakdown (2xx, 4xx, 5xx), Top API Endpoints Used, Bandwidth Consumption (MB/GB).
- **SLA Uptime Tracker:** Live public status board (`status.ajalogistics.com`) displaying real-time system health and historical uptime SLA metrics (99.95% target).

---

## 10. Knowledge Center, Integration Guides & Support Hub
- **Interactive Knowledge Base:** Step-by-step tutorial guides for popular B2B scenarios (e.g., "Connecting Shopify/Salla Store to AJA OMS", "Automating ZATCA E-Invoicing via API").
- **Error Code Catalog:** Comprehensive error dictionary mapping error strings (e.g., `ERR_INVALID_CUSTOMS_HS_CODE`) to actionable resolution steps.
- **Support Ticket Management:** Built-in helpdesk portal for submitting technical integration support requests directly to AJA's API Support Engineering team.

---

## 11. Change Management, Version Control & Release Notes
- **Interactive Change Log:** Filterable log highlighting `ADDED`, `CHANGED`, `DEPRECATED`, and `FIXED` items across API versions.
- **Release Notes Hub:** Detailed release announcements published prior to major platform updates.
- **Breaking Changes Governance:** Mandatory zero-breaking-changes policy within a major version series (`v1.x`, `v2.x`).

---

## 12. Security Architecture & Zero Trust Governance
- **Authentication:** OAuth 2.0 / OIDC with JWT bearer tokens; mTLS supported for enterprise B2B connections.
- **Data Protection:** TLS 1.3 encryption in transit; AES-256 encryption at rest for API keys and secrets.
- **Administrative MFA:** Multi-Factor Authentication (TOTP / WebAuthn) required for all administrative partner operations.
- **Audit Logging:** Immutably records all credential creations, permission changes, and production key disclosures.

---

## 13. High-Performance Platform Architecture
- **Global CDN Caching:** Static documentation assets, OpenAPI specs, and SDK downloads cached globally via Cloudflare CDN.
- **Edge Rate Limiting:** Redis-backed sliding-window rate limiters enforcing quota limits at the edge before hitting core APIs.
- **Horizontal Auto-Scaling:** Next.js and Laravel container pods scale dynamically based on web traffic demand.

---

## 14. Observability & Partner SLA Compliance
- **Real-Time Health Probes:** Synthetic health probes running every 30 seconds across API endpoints.
- **Proactive Incident Alerts:** Automated email/SMS alerts dispatched to partner technical contacts upon detecting elevated error rates.

---

## 15. Testing & Validation Strategy
- **Documentation Validation:** CI/CD pipeline validates OpenAPI specifications against Spectral linter rules on every git push.
- **Contract & Schema Testing:** Automated contract testing verifying that production API responses match published OpenAPI schemas 100%.

---

## 16. Developer Portal Design Tokens
- `APIStatus.Stable` (emerald)
- `APIStatus.Beta` (amber)
- `APIStatus.Deprecated` (rose)
- `PartnerStatus.Verified` (emerald)
- `PartnerStatus.PendingReview` (amber)
- `Environment.Production` (indigo)
- `Environment.Sandbox` (slate)
- `WebhookStatus.Active` (emerald)
- `WebhookStatus.Failing` (rose)
- `SupportTicket.Open` (blue)
- `SupportTicket.Resolved` (emerald)

---

## 17. Enterprise Operational Guide: Onboarding & Managing B2B Partners
1. **Partner Invitation:** Admin sends invitation email or partner registers on Developer Portal.
2. **Access Provisioning:** System grants instant access to Sandbox Environment and generates test API keys.
3. **Integration & Test Verification:** Partner executes automated sandbox test suite; system verifies 100% test pass rate.
4. **Production Sign-Off:** Security team approves production access; partner retrieves live credentials via MFA challenge.
5. **Ongoing Governance:** Partner usage monitored via Analytics Dashboard; automated alerts triggered if rate limits or error thresholds are breached.

---

## 18. Master STEP 13 Final Architectural Requirements Verification

Prior to final sign-off, all 10 sub-steps of **STEP 13 Enterprise Integration Architecture** have been audited and verified against AJA's core architectural mandates:

| Architectural Mandate | Verification Status | Implementation & Architectural Evidence |
| :--- | :--- | :--- |
| **Unified Enterprise Integration Platform** | **VERIFIED** | All external communications, integrations, and APIs route through the centralized EIP / IOP engine. |
| **API Gateway Centralization** | **VERIFIED** | 100% of external and B2B API traffic terminates at the API Gateway (Step 13.01) with rate limiting, WAF, and OAuth2/JWT auth. |
| **Canonical Data Model (CDM)** | **VERIFIED** | All enterprise data transformations convert vendor-specific schemas into AJA's standardized CDM (Step 13.05). |
| **Event-Driven Architecture (EDA)** | **VERIFIED** | Real-time events publish to Kafka/RabbitMQ Event Bus with correlation IDs and idempotency guarantees (Step 13.08). |
| **Pluggable Connector Framework** | **VERIFIED** | All 3rd party providers (Carriers, Ports, Customs, Payments, Maps, Comm) implement abstract connector contracts (Steps 13.02 - 13.08). |
| **Zero Trust Security** | **VERIFIED** | mTLS 1.3, Vault secret rotation, RBAC/ABAC, and OWASP WAF enforced across all integration points (Step 13.09). |
| **End-to-End Observability & Audit** | **VERIFIED** | OpenTelemetry distributed tracing, immutable audit logs, and real-time SRE monitoring dashboards active (Step 13.09). |
| **Horizontal Auto-Scaling** | **VERIFIED** | Stateless container workers scale dynamically on Cloud Run / Kubernetes based on queue depth and CPU/RAM load. |
| **Tech Stack Harmony** | **VERIFIED** | Fully compatible with Laravel Enterprise + Next.js + PostgreSQL + Redis + RabbitMQ/Kafka + GCP AI Platform. |
| **Zero Direct Provider Coupling** | **VERIFIED** | No core business microservice contains direct hardcoded 3rd party API calls or credentials. |
| **Multi-Tenant & Global Scalability** | **VERIFIED** | Architecture natively supports B2B multi-tenant isolation, multi-currency, multi-language (Arabic/English), and global logistics expansion. |

---

## 19. Master Deliverables Verification Matrix (Steps 13.01 - 13.10)

| Step # | Integration Domain | Deliverable Status | Core Architecture Layer |
| :--- | :--- | :--- | :--- |
| **13.01** | Enterprise API Gateway Foundation | **COMPLETED** | API Routing, OAuth2/JWT Auth, Rate Limiting, OWASP WAF |
| **13.02** | Shipping Carriers & Couriers | **COMPLETED** | Pluggable Carrier Connector Framework, Waybills, Universal Status |
| **13.03** | Air, Ocean, Ports & Customs | **COMPLETED** | Multimodal Gateway, Mawani Port Integration, ZATCA Customs |
| **13.04** | Payment Gateways & Financials | **COMPLETED** | Financial Abstraction Layer, HyperPay/Stripe, ZATCA e-Invoice |
| **13.05** | Enterprise ERP & Business Systems| **COMPLETED** | Canonical Data Model (CDM), SAP/Oracle/Dynamics Adapters, MDM |
| **13.06** | Maps, Route & Location Intelligence| **COMPLETED** | Location Abstraction Layer (LSAL), Route Solver, ETA Engine, Geofences |
| **13.07** | Communication, Notifications & Messaging | **COMPLETED** | Communication Abstraction Layer (CAL), Multi-Channel Hub, Multi-Lingual Templates |
| **13.08** | Connector Framework & Integration Orchestration | **COMPLETED** | Integration Orchestration Platform (IOP), Data Transformer, Workflow Engine, Webhook Manager |
| **13.09** | Integration Security, Governance & Observability | **COMPLETED** | Zero Trust Control Plane, API Governance, Multi-Regulatory Compliance, SRE Observability |
| **13.10** | API Developer Portal & Partner Ecosystem | **COMPLETED** | Developer Portal, B2B Partner Hub, OpenAPI 3.1 Specs, Interactive Sandbox, Lifecycle Engine |

---
*Official Blueprint Version: 13.10.0 — Final Release | AJA INTERNATIONAL LOGISTICS Enterprise Architecture Governance Board*








