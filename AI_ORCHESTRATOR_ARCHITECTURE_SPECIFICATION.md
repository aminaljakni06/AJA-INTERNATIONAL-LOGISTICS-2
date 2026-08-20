# AJA INTERNATIONAL LOGISTICS — AI ORCHESTRATOR ARCHITECTURE SPECIFICATION

## 1. EXECUTIVE SUMMARY & SYSTEM VISION

The **AJA AI Orchestrator** is an enterprise-grade multi-agent intelligence platform powering automated supply chain decision-making, real-time customer support, proactive route re-optimization, and operational event synthesis for **AJA International Logistics**.

Built on an event-driven **Message-Broker Pattern using Redis (Streams & Pub/Sub)**, the AI Orchestrator coordinates cross-agent communication among specialized domain agents:
1. **Customer Support Agent (`CS-Agent`)**: Natural language query handling, ticket triaging, bilingual (Arabic/English) client communication, and automated status reporting.
2. **Shipment Intelligence Agent (`Shipment-Agent`)**: Predictive ETA estimation, customs dwell-time forecasting, port congestion analysis, and shipment milestone anomaly detection.
3. **Fleet Intelligence Agent (`Fleet-Agent`)**: Real-time vehicle telemetry analysis, dynamic truck/vessel re-routing, fuel consumption optimization, and driver shift scheduling.
4. **Customs & Compliance Agent (`Customs-Agent`)**: Fasah declaration verification, duty assessment, document OCR parsing, and compliance risk scoring.

The architecture strictly aligns with the **AJA Centralized Design System** (`/src/design-system/tokens.ts`), providing live observability dashboards across the Customer Portal and Admin Operations Control Center while maintaining WCAG 2.2 AA compliance, robust security, and sub-second response latency.

---

## 2. MULTI-AGENT TOPOLOGY & SPECIALIZED DOMAINS

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AJA AI ORCHESTRATOR                                    │
│                   (Central Coordinator & Intent Routing Engine)                        │
└───────────────────────────┬────────────────────────────────┬───────────────────────────┘
                            │                                │
       ┌────────────────────┴───────────────┐   ┌────────────┴──────────────────────┐
       │ CUSTOMER SUPPORT AGENT (CS-Agent)  │   │ SHIPMENT INTELLIGENCE AGENT       │
       │ • Natural Language Understanding   │   │ • Predictive ETA & Congestion     │
       │ • Bilingual Ticket Triaging        │   │ • Milestone Anomaly Detection     │
       │ • Automated Status Response        │   │ • Route Delay Risk Scoring        │
       └────────────────────┬───────────────┘   └────────────┬──────────────────────┘
                            │                                │
                            │     REDIS MESSAGE BROKER       │
                            │  (Streams • Pub/Sub • Memory)  │
                            │                                │
       ┌────────────────────┴───────────────┐   ┌────────────┴──────────────────────┐
       │ FLEET INTELLIGENCE AGENT           │   │ CUSTOMS & COMPLIANCE AGENT        │
       │ • Dynamic Re-Routing               │   │ • Fasah Declaration Sync          │
       │ • Driver Telemetry & Shift Logic   │   │ • OCR Invoice/Packing List Parser │
       │ • Asset Allocation (Truck/Vessel)  │   │ • Duty Assessment & Risk Score    │
       └────────────────────────────────────┘   └───────────────────────────────────┘
```

### Agent Domain Matrix

| Agent Identity | Domain Focus | Core Inputs | Primary Outputs / Actions | Redis Channels / Streams |
| :--- | :--- | :--- | :--- | :--- |
| **Orchestrator Core** | Master Task Routing | Client Queries, API Triggers, Webhooks | Delegated Agent Tasks, Synthesized Answers | `aja:orchestrator:requests`, `aja:orchestrator:events` |
| **Customer Support Agent** | Client Interaction | Chat Prompts, Support Tickets, Language | Resolved Tickets, Automated Replies, Escalations | `stream:agent:cs:inbox`, `pubsub:agent:cs:outbound` |
| **Shipment Intelligence Agent** | Cargo & Milestone Analytics | Tracking IDs, AIS Vessel Data, Weather API | ETA Predictions, Delay Alerts, Risk Score | `stream:agent:shipment:telemetry`, `pubsub:shipment:eta_updates` |
| **Fleet Intelligence Agent** | Vehicle & Asset Optimization | GPS Telemetry, Fuel Levels, Traffic | Re-Routing Vectors, Driver Alerts, Maintenance | `stream:agent:fleet:telemetry`, `pubsub:fleet:reroute_events` |
| **Customs & Compliance Agent**| Border & Document Verification | Commercial Invoices, B/L, Fasah Status | Duty Assessment, Document OCR Flags | `stream:agent:customs:clearance`, `pubsub:customs:status` |

---

## 3. REDIS MESSAGE-BROKER ARCHITECTURE & COMMUNICATION PATTERNS

Cross-agent communication relies on a dual Redis pattern combining **Redis Streams** for durable, ordered task queue execution and **Redis Pub/Sub** for real-time pub/sub event broadcasting.

```
                  ┌──────────────────────────────────────────────────┐
                  │              REDIS CLUSTER ENGINE                │
                  ├──────────────────────────────────────────────────┤
                  │                                                  │
   PRODUCERS      │  ┌────────────────────────────────────────────┐  │    CONSUMERS / WORKERS
  ┌──────────┐    │  │ REDIS STREAMS (Durable Consumer Groups)    │  │    ┌─────────────────┐
  │ Client   ├───┼─►│ • stream:orchestrator:tasks               │├───┼───►│ CS Agent        │
  │ Portal   │    │  │ • stream:shipment:telemetry              ││   │    └─────────────────┘
  └──────────┘    │  │ • stream:fleet:telemetry                 ││   │    ┌─────────────────┐
  ┌──────────┐    │  └────────────────────────────────────────────┘│   │───►│ Shipment Agent  │
  │ Admin    ├───┼─┐                                              │   │    └─────────────────┘
  │ Operations│   │ │  ┌────────────────────────────────────────────┐│   │    ┌─────────────────┐
  └──────────┘    │ └─►│ REDIS PUB/SUB (Real-Time Broadcast)      ├┼───┼───►│ Fleet Agent     │
                  │    │ • pubsub:alerts:critical                 ││   │    └─────────────────┘
                  │    │ • pubsub:client:ui_updates               ││   │    ┌─────────────────┐
                  │    └────────────────────────────────────────────┘│   │───►│ Customs Agent   │
                  │                                                  │   │    └─────────────────┘
                  │  ┌────────────────────────────────────────────┐  │   │    ┌─────────────────┐
                  │  │ REDIS IN-MEMORY CONTEXT STORE              │  │   └───►│ Dead Letter Q   │
                  │  │ • Hash: session:{sessionId}:context        │  │        └─────────────────┘
                  │  │ • Key: lock:shipment:{trackingId}          │  │
                  │  └────────────────────────────────────────────┘  │
                  └──────────────────────────────────────────────────┘
```

### Communication Pattern Characteristics

1. **Redis Streams (`stream:*`)**:
   - Used for **asynchronous, reliable, ordered task processing**.
   - Implements **Consumer Groups** (`cg-cs-workers`, `cg-shipment-workers`, `cg-fleet-workers`) ensuring every task message is delivered to exactly one worker instance with acknowledgment (`XACK`).
   - Retains message history with trimming (`MAXLEN ~ 100000`) for complete execution auditability.

2. **Redis Pub/Sub (`pubsub:*`)**:
   - Used for **ephemeral, real-time broadcast notifications** (e.g., streaming live agent responses directly to client UI WebSockets, urgent collision/delay warnings).

3. **Redis In-Memory State & Distributed Locks**:
   - **Distributed Locks (`Redlock`)**: Prevents duplicate agent decisions (e.g., ensuring two agents do not simultaneously re-route the same truck container).
   - **Short-Term Conversation Context (`Hash`)**: Stores real-time multi-turn conversation state with automatic TTL (30 minutes).

---

## 4. INTER-AGENT EVENT SCHEMAS & JSON PAYLOAD SPECIFICATIONS

All inter-agent messages are standardized in JSON format with strictly typed headers, correlation tracking, priority tiers, and domain-specific payloads.

### A. Base Message Envelope Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AJA_Agent_Message_Envelope",
  "type": "object",
  "required": [
    "eventId",
    "correlationId",
    "timestamp",
    "sourceAgent",
    "targetAgent",
    "eventType",
    "priority",
    "payload"
  ],
  "properties": {
    "eventId": {
      "type": "string",
      "example": "evt_9918240a-81f2"
    },
    "correlationId": {
      "type": "string",
      "example": "corr_req_882910_ksa"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "example": "2026-07-30T10:15:30.000Z"
    },
    "sourceAgent": {
      "type": "string",
      "enum": ["ORCHESTRATOR", "CS_AGENT", "SHIPMENT_AGENT", "FLEET_AGENT", "CUSTOMS_AGENT"]
    },
    "targetAgent": {
      "type": "string",
      "enum": ["ORCHESTRATOR", "CS_AGENT", "SHIPMENT_AGENT", "FLEET_AGENT", "CUSTOMS_AGENT", "BROADCAST"]
    },
    "eventType": {
      "type": "string",
      "example": "CUSTOMER_QUERY_RECEIVED"
    },
    "priority": {
      "type": "string",
      "enum": ["LOW", "NORMAL", "HIGH", "CRITICAL"]
    },
    "ttlSeconds": {
      "type": "integer",
      "default": 3600
    },
    "payload": {
      "type": "object"
    }
  }
}
```

### B. Event Scenario 1: Customer Asks for Delay Explanation (`CS_AGENT` ➔ `SHIPMENT_AGENT`)

#### Event Stream: `stream:shipment:tasks`
```json
{
  "eventId": "evt_cs_to_ship_001",
  "correlationId": "corr_track_AJA-882910-KSA",
  "timestamp": "2026-07-30T10:15:30.000Z",
  "sourceAgent": "CS_AGENT",
  "targetAgent": "SHIPMENT_AGENT",
  "eventType": "QUERY_SHIPMENT_TELEMETRY",
  "priority": "HIGH",
  "payload": {
    "trackingId": "AJA-882910-KSA",
    "requestedDetails": ["REASON_FOR_DELAY", "REVISED_ETA", "CURRENT_GPS"],
    "language": "ar",
    "userRole": "Enterprise Customer"
  }
}
```

### C. Event Scenario 2: Weather Delay Detected, Triggering Fleet Re-Route (`SHIPMENT_AGENT` ➔ `FLEET_AGENT`)

#### Event Stream: `stream:fleet:tasks`
```json
{
  "eventId": "evt_ship_to_fleet_042",
  "correlationId": "corr_track_AJA-882910-KSA",
  "timestamp": "2026-07-30T10:15:32.120Z",
  "sourceAgent": "SHIPMENT_AGENT",
  "targetAgent": "FLEET_AGENT",
  "eventType": "TRIGGER_REROUTE_OPTIMIZATION",
  "priority": "CRITICAL",
  "payload": {
    "shipmentId": "AJA-882910-KSA",
    "truckId": "TRK-KSA-9941",
    "currentCoordinates": {
      "latitude": 21.5423,
      "longitude": 39.1984
    },
    "destinationHub": "SARIY_DRY_PORT",
    "obstacleType": "SANDSTORM_WARNING",
    "maxDelayToleranceHours": 4
  }
}
```

---

## 5. AI ORCHESTRATOR CORE WORKFLOW & LIFECYCLE

```
[Customer / Operations Query Received]
                  ↓
[1. Orchestrator Intent Parser (Gemini Flash / Omni)]
                  ↓
  ┌─────────────────────────────────────────────────────────┐
  │ Query Intent: "Why is my shipment delayed and when will │
  │ it reach Riyadh Dry Port?"                              │
  └──────────────────────────┬──────────────────────────────┘
                             ↓
[2. Task Decomposition & Redis Stream Enqueue]
  ├── Enqueue Task A ➔ `stream:shipment:tasks` (Fetch ETA & AIS Telemetry)
  └── Enqueue Task B ➔ `stream:fleet:tasks` (Fetch Highway Traffic & Re-route)
                             ↓
[3. Parallel Agent Execution & Redis Message Consumption]
  ├── `Shipment-Agent` fetches AIS vessel coordinates & calculates revised ETA
  └── `Fleet-Agent` checks Riyadh highway congestion & identifies optimal bypass
                             ↓
[4. Inter-Agent Synthesis & Resolution Event]
  Agents publish results to `stream:orchestrator:synthesis`
                             ↓
[5. Orchestrator Response Generation]
  Synthesizes unified Arabic/English response with confidence score & map marker
                             ↓
[6. Real-Time UI Broadcast via Redis Pub/Sub & WebSockets]
```

---

## 6. STATE MANAGEMENT, CONTEXT PRESERVATION & MEMORY ENGINE

1. **Short-Term Memory (Redis Hash Store)**:
   - Maintains conversation history, user preferences, and intermediate reasoning steps for active sessions.
   - *Key Pattern*: `aja:session:{sessionId}:context`
   - *TTL*: 1,800 seconds (30 minutes of idle window).

2. **Long-Term Memory & Audit Persistence (Firestore)**:
   - Final synthesized decisions, user interactions, and cross-agent event logs are persisted in the Firestore `aiAgentLogs` and `auditLogs` collections.
   - Provides historical context for continuous agent prompt optimization and compliance auditing.

---

## 7. RESILIENCY, DEAD-LETTER QUEUES (DLQ) & FAULT TOLERANCE

To guarantee 99.99% reliability across enterprise logistics operations:

1. **Consumer Group Acknowledgment (`XACK`)**:
   - Workers process messages from Redis Streams. A message is only removed from the Pending Entries List (PEL) after explicit `XACK`.

2. **Retry Mechanism & Backoff**:
   - Failed tasks are retried up to 3 times with exponential backoff (1s, 4s, 16s).

3. **Dead Letter Queue (`stream:agent:dlq`)**:
   - If a task fails 3 consecutive execution attempts, it is moved to the Dead Letter Queue for manual operator intervention on the Admin Control Center.
   - Triggers an automated high-priority alert on the Admin Dashboard (`tokens.colors.semantic.danger`).

4. **Circuit Breaker Pattern**:
   - If a third-party API (e.g., Weather API, Fasah Customs API) experiences elevated failure rates (>50%), the orchestrator opens the circuit breaker and falls back to cached historical telemetry.

---

## 8. SECURITY, RBAC & DATA PRIVACY CONTROLS

- **Message Encryption**: All payloads transmitted through Redis in production are encrypted using AES-256 GCM.
- **Role-Based Message Filtering (RBAC)**:
  - `CS-Agent` masks personal identifiable information (PII) such as customer phone numbers and full addresses when communicating public tracking queries.
  - Enterprise contract rates and cost margins are restricted exclusively to authenticated `Sales Manager` and `Corporate Admin` roles.
- **Agent Identity Verification**: Every inter-agent Redis message requires a cryptographic HMAC signature verified by the orchestrator.

---

## 9. DESIGN SYSTEM & UI OBSERVABILITY INTEGRATION

The status and activities of the AI Orchestrator and its sub-agents are visually rendered across the AJA platform using predefined tokens from `/src/design-system/tokens.ts`:

### A. Live Agent Monitor Dashboard UI Component
- Displays active agent health, queue depth (Redis pending stream count), average processing latency, and live event log.

### B. Agent Status Badge Tokens
```typescript
export const aiAgentTokens = {
  status: {
    idle:       { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1', icon: 'Bot' },
    processing: { bg: '#E4ECF3', text: '#1F4E79', border: '#C8D9E7', icon: 'RefreshCw' },
    resolved:   { bg: '#F2F8F4', text: '#3F7D58', border: '#C3E6D0', icon: 'CheckCircle2' },
    warning:    { bg: '#FAF3EA', text: '#A66A22', border: '#F2D7B5', icon: 'AlertTriangle' },
    danger:     { bg: '#FAF0F0', text: '#B84040', border: '#F3C5C5', icon: 'XCircle' }
  },
  typography: {
    agentCode: 'font-mono text-xs font-bold text-slate-900',
    timestamp: 'font-mono text-xs text-slate-500'
  }
};
```

---

## 10. ARCHITECTURAL COMPLIANCE & VERIFICATION

This specification document establishes the official master architecture for the **AJA AI Orchestrator**. It provides full alignment with Redis Streams & Pub/Sub messaging patterns, Gemini AI model integration, Firestore persistence, WCAG 2.2 Level AA accessibility, and the centralized AJA Design System.
