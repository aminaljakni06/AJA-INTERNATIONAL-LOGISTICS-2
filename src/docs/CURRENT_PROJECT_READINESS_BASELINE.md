# AJA International Logistics - Current Readiness Baseline

Date: 2026-08-14

This baseline supersedes older forensic-audit counts when they differ from the current local project state.

## Verified Current State

- Runtime: Express + Vite + React 19 + TypeScript 5.
- Route files: 58 files under `src/server/routes`.
- Repository files: 45 files under `src/db/repositories`.
- Default unit baseline: `npm test`.
- Full local verification gate: `npm run verify`.
- Staging readiness gate: `npm run verify:staging`.

## Current Verification Gate

`npm run verify` runs:

1. `npm run lint`
2. `npm test`
3. `npm run build`
4. `npm run smoke:product-resources`

Latest verified result:

- TypeScript: pass.
- Unit tests: 69 passed, 0 failed.
- Production build: pass.
- Product Resource smoke: pass.
- Firestore client boundary: pass.
- Firebase Admin server-only import boundary: pass.
- Firestore emulator integration: 67 passed, 0 failed.

## Test Suite Classification

Default unit tests are intentionally local and deterministic.

Firestore-backed integration tests are intentionally excluded from `npm test` and run only when either:

- `RUN_FIRESTORE_TESTS=1` is set, or
- `FIRESTORE_EMULATOR_HOST` is set.

The Firestore integration runner uses `--test-force-exit` because Firebase can leave network handles open after assertions complete.

## Production Gate Decision

The project is ready for continued staging hardening, not direct production dispatch.

Production go-live still requires fresh evidence for:

- Staging deployment smoke.
- Environment variable and secret validation.
- Browser QA on critical authenticated flows.
- Deployment rollback and operational runbook.

## Firestore Security Gate

Current `firestore.rules` deny direct client reads and writes by default.

`npm run security:firestore-rules` passes when no unconditional `allow ...: if true;` public read/write rules remain.

The application currently authenticates users with Express JWTs. Firestore Security Rules cannot validate those server JWTs. Therefore the selected production path is:

- Move server-side Firestore access to Firebase Admin SDK and deny direct client access in Firestore rules.

`npm run verify:staging` is the next readiness gate after local verification. It combines:

1. `npm run verify`
2. `npm run security:env`
3. `npm run security:server-only-imports`
4. `npm run security:firestore-boundary`
5. `npm run security:firestore-rules`
6. `npm run test:integration:firestore:emulator`

Latest local staging-gate attempt:

- `npm run verify:staging` passed `lint`, unit tests, production build, and product resource smoke.
- The gate stopped at `npm run security:env` because Firebase Admin credentials were not configured through `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`.
- The local machine default Java is Java 8 (`1.8.0_491`), so a portable JDK 21 was installed under `.tools/jdk21/` for local emulator execution.
- `npm run test:integration:firestore:emulator` passed with the portable JDK 21: 67 Firestore integration tests passed against the deny-by-default rules.
- The Firestore emulator runner now sets `DISABLE_LOCAL_DATA_FALLBACK=true`, so integration tests exercise Firestore emulator behavior instead of local seed data.

## Environment Security Gate

`npm run security:env` validates production-like environment safety without printing secret values.

Current enforced checks include:

- `JWT_SECRET` exists, is at least 32 characters, and is not a demo/placeholder value.
- Firestore emulator and forced local data fallback are not enabled for production-like modes.
- Firebase Admin credentials are present through `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`.
- Default seed passwords are configured if Firebase seeding is enabled.
- Adyen LIVE mode has required keys and HTTPS URLs.

Missing `GEMINI_API_KEY` is currently a warning because AI routes fail closed with configuration errors when called.

## Firestore Boundary Gate

`npm run security:firestore-boundary` detects client-bundled code importing services that also import Firestore.

This must pass before a safe Firebase Admin SDK migration because Admin SDK belongs only on the server. Any failing client import should move to a server API route or a client API wrapper.

Current client boundary status:

- `OrganizationContext` reads organization data through `/api/organization/*`.
- `ConfigContext` reads and updates configuration through `/api/config/*`.
- `EventBusContext` reads/publishes/replays events through `/api/events/*`.
- `WorkflowContext` reads and mutates workflow state through `/api/workflow/*`.
- `AuditContext` reads audit telemetry through `/api/audit-logs/*` and keeps local-only UI events in React state.
- `useEnterpriseDataViews` reads and mutates saved views through `/api/data-views/*`.
- `ContractPlatformMainView` reads and creates contracts through `/api/crm/contracts/*`.
- `CustomerServiceHub` reads and mutates service cases, knowledge articles, queues, and service metrics through `/api/crm/service/*`.
- `FleetCoreMainView` reads fleet registry, drivers, telematics support data, maintenance, inspections, incidents, KPIs, and vehicle status updates through `/api/fleet/*`.
- `Carrier3PLMainView` reads carrier partners, rates, tenders, bids, and EDI integration specs through `/api/carrier3pl/*`.
- `ControlTowerMainView` reads live executions, geofences, exceptions, milestones, POD details, AI analysis, and exception resolution through `/api/control-tower/*`.
- `TransportationCoreMainView` reads and mutates transport orders, dispatch assignments, dock schedules, carrier profiles, carbon metrics, consolidation plans, KPIs, and AI route optimization through `/api/tms/*`.
- `FreightFinanceMainView` reads freight cost breakdowns, invoice audits, landed costs, route profitability, invoice audit decisions, and AI profitability analysis through `/api/freight-finance/*`.
- `ProcurementMainView` reads and mutates vendor master data, sourcing, AP invoices, payment runs, procurement analytics, OCR, 3-way matching, and AI procurement evaluation through `/api/procurement/*`.
- `WarehouseCoreMainView` and its WMS foundation views read warehouse registry, hierarchy, zones, bins, storage rules, shifts, capacity KPIs, AI insights, and space optimization through `/api/warehouse/*`.
- `InboundWarehouseMainView` reads inbound ASNs, GRNs, inspections, putaway, docks, OS&D, NCRs, containers, cross-dock records, label jobs, analytics KPIs, and AI inbound optimization through `/api/inbound-warehouse/*`.
- `SmartWarehouseMainView` reads robotics, AS/RS, conveyors, RFID events, IoT telemetry, predictive maintenance alerts, and AI automation optimization through `/api/smart-warehouse/*`.
- `OutboundLogisticsMainView` reads outbound orders, waves, pick tasks, packing stations, manifests, exceptions, and AI pick-path optimization through `/api/outbound-logistics/*`.
- `WarehouseExecutionMainView` and its WES subviews read putaway rules, slotting profiles, task queues, resources, replenishments, exceptions, performance KPIs, and AI execution optimization through `/api/wes/*`.
- `InventoryControlMainView` reads SKU master data, bin stocks, inventory ledger, lot/batch records, serial numbers, replenishment suggestions, cycle counts, and AI inventory optimization through `/api/inventory-control/*`.
- `InventoryOperationsMainView` reads stock movements, reservations, allocations, holds, transfers, adjustments, ATP metrics, inventory timeline events, and AI operations optimization through `/api/inventory-ops/*`.
- `GeneralLedgerFinanceMainView` reads and mutates executive finance summary, chart of accounts, journals, fiscal periods, dimensions, currencies, intercompany balances, and trial balance through `/api/general-ledger/*`.
- Accounts Receivable screens read and mutate receivables analytics, invoices, revenue recognition schedules, credit profiles, collection cases, customer statements, bad-debt provisions, and AI receivables insights through `/api/accounts-receivable/*`.
- Treasury screens read and mutate bank accounts, cash movements, treasury deals, payment batches, bank statements, liquidity forecasts, FX rates/exposures, financial settlements, and AI treasury insights through `/api/treasury/*`.
- FP&A screens read and mutate budget versions, department budgets, CAPEX projects, rolling forecasts, scenario models, variance analysis, cost allocation, profitability segments, executive KPIs, and AI FP&A insights through `/api/fpa/*`.
- Fixed Assets & Financial Reporting screens read and mutate fixed assets, depreciation schedules, IFRS 16 leases, ZATCA invoices, financial statements, consolidated entities, CFO metrics, and AI asset-finance insights through `/api/fixed-assets-reporting/*`.
- Reports & Analytics screens read report definitions, scheduled reports, report execution results, and multi-domain analytics through `/api/reports/*`.

`npm run audit:client-repositories` inventories remaining client-reachable repository imports. It is intentionally informational while the migration proceeds screen by screen.

## Firebase Admin Server Boundary

`src/server/firebaseAdmin.ts` is the only Firebase Admin SDK entrypoint.

It initializes Firebase Admin on the server with:

- `FIREBASE_SERVICE_ACCOUNT_JSON`, or
- Application Default Credentials through `GOOGLE_APPLICATION_CREDENTIALS`.

`npm run security:server-only-imports` fails if client-bundled code imports `firebase-admin` or the server Admin entrypoint.

The audit now follows local imports from client entrypoints, so indirect Firebase Admin leaks into the browser bundle are caught before staging.

First repository migration completed:

- `src/db/repositories/auditLogRepository.ts` now uses Firebase Admin SDK for production Firestore reads/writes.
- Local development and smoke tests still use the existing local audit store fallback.

Additional server-only repository migrations completed:

- `src/db/repositories/dataViewRepository.ts` now uses Firebase Admin SDK for production saved-view reads/writes and keeps the in-memory/default view fallback for local development.
- `src/db/repositories/cmsContentRepository.ts`, `src/db/repositories/faqRepository.ts`, and `src/db/repositories/serviceRepository.ts` now use Firebase Admin SDK for production CMS, FAQ, and service catalog persistence while preserving local database fallback.
- `src/db/repositories/documentRepository.ts` now uses Firebase Admin SDK for production document metadata persistence and an in-memory local development fallback.
- `src/db/repositories/companyRepository.ts` and `src/db/repositories/customerRepository.ts` now use Firebase Admin SDK for production company/customer profile reads and writes while preserving local database fallback.
- `src/db/repositories/quoteRequestRepository.ts`, `src/db/repositories/shipmentRepository.ts`, and `src/db/repositories/shipmentEventRepository.ts` now use Firebase Admin SDK for production quote, shipment, and shipment-event persistence while preserving local database fallback.
- `src/db/repositories/notificationRepository.ts`, `src/db/repositories/messageRepository.ts`, and `src/db/repositories/importOperationRepository.ts` now use Firebase Admin SDK for production notifications, customer messages, and import idempotency persistence while preserving local database or in-memory fallback.
- `src/db/repositories/userRepository.ts` now uses Firebase Admin SDK for production authentication profile reads/writes while preserving local database fallback.
- `src/db/repositories/contractRepository.ts`, `src/db/repositories/customerServiceRepository.ts`, and `src/db/repositories/fleetRepository.ts` now use Firebase Admin SDK for production contract, customer service, and fleet persistence while preserving seed fallback behavior.
- `src/db/repositories/carrier3plRepository.ts`, `src/db/repositories/controlTowerRepository.ts`, and `src/db/repositories/transportationRepository.ts` now use Firebase Admin SDK for production carrier, control tower, and transportation persistence while preserving seed fallback behavior.
- `src/db/repositories/warehouseRepository.ts`, `src/db/repositories/inboundWarehouseRepository.ts`, `src/db/repositories/outboundLogisticsRepository.ts`, `src/db/repositories/smartWarehouseRepository.ts`, `src/db/repositories/warehouseExecutionRepository.ts`, `src/db/repositories/inventoryControlRepository.ts`, and `src/db/repositories/inventoryOperationsRepository.ts` now use Firebase Admin SDK for production warehouse, warehouse execution, and inventory operations reads/updates while preserving seed fallback behavior.
- `src/db/repositories/analytics/customerAnalyticsRepository.ts`, `src/db/repositories/analytics/quoteAnalyticsRepository.ts`, and `src/db/repositories/analytics/shipmentAnalyticsRepository.ts` now use Firebase Admin SDK queries with bounded reads for reporting analytics.
- `src/db/repositories/customer360Repository.ts`, `src/db/repositories/freightFinanceRepository.ts`, `src/db/repositories/omnichannelRepository.ts`, `src/db/repositories/procurementRepository.ts`, and `src/db/repositories/salesRepository.ts` now use Firebase Admin SDK for production business-domain reads/writes while preserving local, seed, or memory fallback behavior.
- `src/db/repositories/identityRepository.ts`, `src/db/repositories/organizationMasterRepository.ts`, and `src/db/repositories/ssoRepository.ts` now use Firebase Admin SDK for identity, organization master data, SSO, linked-account, passkey, and token revocation persistence while preserving local and memory fallback behavior.

All `src/db/repositories` Firestore access now uses the Firebase Admin SDK boundary. The next migration phase is to replace permissive Firestore rules with deny-by-default client rules.

Firestore rules now deny direct client reads and writes by default. `src/db/repositories` and `src/services` no longer import Firestore Web SDK for persistence paths; server persistence uses Firebase Admin SDK, while `src/lib/firebase.ts` remains the client Firebase configuration entrypoint.

Known architectural debt discovered during import-graph inspection:

- 0 client-reachable repository paths remain after the Data Views, Contract Platform, Customer Service, Fleet, Carrier 3PL, Control Tower, Transportation, Freight Finance, Procurement, Warehouse Core, Inbound Warehouse, Smart Warehouse, Outbound Logistics, Warehouse Execution, Inventory Control, Inventory Operations, General Ledger, Accounts Receivable, Treasury, FP&A, Fixed Assets & Financial Reporting, and Reports & Analytics API-boundary migrations.

## Recent Hardening

- Product Resource Master validation centralized for products, services, vehicles, containers, UOMs, and commodities.
- Product Resource CRUD smoke runs against an isolated temporary local database.
- UOM and Commodity CRUD are exposed through API, client service, and MDM UI.
- `tsconfig.json` now restricts type-check scope to source files and excludes build artifacts.
