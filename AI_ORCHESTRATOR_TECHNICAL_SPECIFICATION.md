# AJA INTERNATIONAL LOGISTICS — AI ORCHESTRATOR TECHNICAL SPECIFICATION
## Redis Message-Broker Architecture, Inter-Agent Protocols & Context Engine
**Version 2.0 | Enterprise Supply Chain Intelligence Framework**

---

## 1. EXECUTIVE SUMMARY & SYSTEM TOPOLOGY

The **AJA AI Orchestrator** is an enterprise multi-agent coordination engine built for **AJA International Logistics**. It automates complex decision workflows across global freight forwarding, real-time tracking, proactive fleet re-routing, and bilingual customer support.

To handle high-throughput logistics events and maintain sub-second response times, the AI Orchestrator relies on a **Redis Message-Broker Pattern** combining **Redis Streams** (durable queue processing) and **Redis Pub/Sub** (real-time broadcast streaming). 

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       AJA AI ORCHESTRATOR ENGINE                                      │
│                           (Central Router, Intent Synthesizer & Task Dispatcher)                        │
└─────────────────────────────────────────┬──────────────────────────────────────────────────────────────┘
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            │                     REDIS MESSAGE BROKER                  │
            │  ┌─────────────────────────────────────────────────────┐  │
            │  │ REDIS STREAMS (Ordered Task Consumer Groups)       │  │
            │  │ • stream:agent:cs:tasks                             │  │
            │  │ • stream:agent:shipment:tasks                       │  │
            │  │ • stream:agent:fleet:tasks                          │  │
            │  └─────────────────────────────────────────────────────┘  │
            │  ┌─────────────────────────────────────────────────────┐  │
            │  │ REDIS PUB/SUB (Real-Time UI & Alert Broadcasts)     │  │
            │  │ • pubsub:agent:live_telemetry                       │  │
            │  │ • pubsub:ui:stream_responses                        │  │
            │  └─────────────────────────────────────────────────────┘  │
            │  ┌─────────────────────────────────────────────────────┐  │
            │  │ REDIS HASHS & REDLOCK (Shared Context & Locks)      │  │
            │  │ • aja:context:session:{sessionId}                   │  │
            │  │ • lock:shipment:{trackingId}                        │  │
            │  └─────────────────────────────────────────────────────┘  │
            └─────────────────────────────┬─────────────────────────────┘
                                          │
    ┌──────────────────────────────┬──────┴──────────────────────┬──────────────────────────────┐
    ▼                              ▼                             ▼                              ▼
┌───────────────────────────┐  ┌──────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
│ CUSTOMER SUPPORT AGENT    │  │ SHIPMENT INTELLIGENCE    │  │ FLEET INTELLIGENCE AGENT  │  │ CUSTOMS & COMPLIANCE      │
│ (`CS-Agent`)              │  │ AGENT (`Shipment-Agent`) │  │ (`Fleet-Agent`)           │  │ AGENT (`Customs-Agent`)   │
│ • Bilingual NLP / Prompts │  │ • Predictive ETA          │  │ • Telemetry & Rerouting   │  │ • Fasah Declaration Sync  │
│ • Ticket Resolution       │  │ • Anomaly Detection       │  │ • Driver Shift Scheduling │  │ • OCR Document Audit      │
│ • SLA Exception Triaging  │  │ • Congestion Scoring      │  │ • Fuel & Route Vectoring  │  │ • Duty Risk Assessment    │
└───────────────────────────┘  └──────────────────────────┘  └───────────────────────────┘  └───────────────────────────┘
```

---

## 2. REDIS MESSAGE-BROKER ARCHITECTURE

The message broker architecture guarantees reliability, scalability, zero message loss, and sub-50ms inter-agent messaging latency.

### 2.1 Dual-Pattern Broker Topology

| Redis Component | Structural Pattern | Key / Stream Name | Purpose & Operational Behavior |
| :--- | :--- | :--- | :--- |
| **Streams Engine** | Consumer Groups (`XREADGROUP`) | `stream:agent:<domain>:tasks` | Persistent, ordered task queue execution with explicit worker acknowledgment (`XACK`) and pending entries recovery (`XPENDING`). |
| **Pub/Sub Engine** | Event Channels (`PUBLISH` / `SUBSCRIBE`) | `pubsub:agent:<domain>:events` | Ephemeral, low-latency broadcast of state changes to frontend WebSockets, map overlays, and live monitoring dashboards. |
| **Context Store** | Hash Map with TTL (`HSET` / `HGETALL`) | `aja:context:<correlationId>` | In-memory shared state enabling agents to read/write structured reasoning graphs during multi-turn orchestration. |
| **Concurrency Control**| Distributed Lock (`Redlock`) | `lock:<resource_type>:<resource_id>` | Mutex locking preventing race conditions when multiple agents attempt concurrent route or container updates. |
| **Dead Letter Queue** | Streams Retention | `stream:agent:dlq` | Isolated retention stream for tasks failing 3 consecutive execution attempts for manual operator triaging. |

### 2.2 Redis Consumer Group Configuration

```bash
# Initialize Redis Consumer Groups for Domain Agents
XGROUP CREATE stream:agent:cs:tasks cg-cs-workers $ MKSTREAM
XGROUP CREATE stream:agent:shipment:tasks cg-shipment-workers $ MKSTREAM
XGROUP CREATE stream:agent:fleet:tasks cg-fleet-workers $ MKSTREAM
XGROUP CREATE stream:agent:customs:tasks cg-customs-workers $ MKSTREAM
```

Each domain runs $N$ horizontal worker instances under its consumer group. The Redis broker distributes task entries evenly, tracking pending unacknowledged entries (`PEL`). If a worker crashes before sending `XACK`, standard recovery workers claim stale pending entries (`XCLAIM`) after a 10-second idle threshold.

---

## 3. COMMUNICATION PROTOCOLS BETWEEN SPECIALIZED AGENTS

Communication among `CS-Agent`, `Shipment-Agent`, and `Fleet-Agent` follows a standardized protocol based on typed message envelopes, rigid request/response state machines, and asynchronous correlation tracking.

### 3.1 Protocol State Machine

```
[INITIATED] ──► [QUEUED IN REDIS STREAM] ──► [CONSUMED & LOCKED]
                                                      │
                                                      ▼
[SYNTHESIZED & COMPLETED] ◄── [CONTEXT UPDATED] ◄── [EXECUTED BY AGENT]
         │
         ▼
[EVENT PUBLISHED TO PUB/SUB]
```

### 3.2 Inter-Agent Message Envelope Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AJA_InterAgent_MessageEnvelope",
  "type": "object",
  "required": [
    "eventId",
    "correlationId",
    "timestamp",
    "sourceAgent",
    "targetAgent",
    "eventType",
    "priority",
    "contextRef",
    "payload"
  ],
  "properties": {
    "eventId": { "type": "string", "example": "evt_9918240a-81f2" },
    "correlationId": { "type": "string", "example": "corr_shipment_AJA-882910-KSA" },
    "timestamp": { "type": "string", "format": "date-time", "example": "2026-07-30T10:15:30.000Z" },
    "sourceAgent": {
      "type": "string",
      "enum": ["ORCHESTRATOR", "CS_AGENT", "SHIPMENT_AGENT", "FLEET_AGENT", "CUSTOMS_AGENT"]
    },
    "targetAgent": {
      "type": "string",
      "enum": ["ORCHESTRATOR", "CS_AGENT", "SHIPMENT_AGENT", "FLEET_AGENT", "CUSTOMS_AGENT", "BROADCAST"]
    },
    "eventType": { "type": "string", "example": "QUERY_SHIPMENT_TELEMETRY" },
    "priority": { "type": "string", "enum": ["CRITICAL", "HIGH", "NORMAL", "LOW"] },
    "contextRef": { "type": "string", "example": "aja:context:corr_shipment_AJA-882910-KSA" },
    "ttlMs": { "type": "integer", "default": 300000 },
    "payload": { "type": "object" }
  }
}
```

---

### 3.3 Concrete Agent Interaction Workflows

#### Interaction 1: Customer Asks for Delay Explanation & Revised ETA
* **Flow**: `CS-Agent` ➔ `Shipment-Agent`
* **Stream**: `stream:agent:shipment:tasks`
* **Payload**:
```json
{
  "eventId": "evt_cs_req_10291",
  "correlationId": "corr_session_99410",
  "timestamp": "2026-07-30T10:15:30.000Z",
  "sourceAgent": "CS_AGENT",
  "targetAgent": "SHIPMENT_AGENT",
  "eventType": "QUERY_SHIPMENT_TELEMETRY",
  "priority": "HIGH",
  "contextRef": "aja:context:corr_session_99410",
  "payload": {
    "shipmentId": "AJA-882910-KSA",
    "userQuery": "Why is my shipment delayed and when will it reach Dammam Port?",
    "requestedMetrics": ["REVISED_ETA", "DELAY_REASON", "WEATHER_IMPACT", "PORT_CONGESTION"],
    "responseLanguage": "ar"
  }
}
```

#### Interaction 2: Weather Anomaly Triggers Proactive Reroute Request
* **Flow**: `Shipment-Agent` ➔ `Fleet-Agent`
* **Stream**: `stream:agent:fleet:tasks`
* **Payload**:
```json
{
  "eventId": "evt_ship_reroute_4412",
  "correlationId": "corr_session_99410",
  "timestamp": "2026-07-30T10:15:31.450Z",
  "sourceAgent": "SHIPMENT_AGENT",
  "targetAgent": "FLEET_AGENT",
  "eventType": "REQUEST_FLEET_REROUTE",
  "priority": "CRITICAL",
  "contextRef": "aja:context:corr_session_99410",
  "payload": {
    "shipmentId": "AJA-882910-KSA",
    "vehicleId": "TRK-KSA-9941",
    "currentLocation": { "lat": 24.7136, "lng": 46.6753 },
    "destinationHub": "DAMMAM_PORT_GATE_3",
    "obstacle": { "type": "SANDSTORM_WARNING", "severity": "HIGH", "radiusKm": 45 },
    "maxAcceptableDelayHours": 2
  }
}
```

#### Interaction 3: Reroute Confirmation & Dynamic ETA Resolution
* **Flow**: `Fleet-Agent` ➔ `CS-Agent` & `Orchestrator`
* **Stream**: `stream:agent:cs:tasks` & Pub/Sub `pubsub:agent:live_telemetry`
* **Payload**:
```json
{
  "eventId": "evt_fleet_confirm_8812",
  "correlationId": "corr_session_99410",
  "timestamp": "2026-07-30T10:15:32.100Z",
  "sourceAgent": "FLEET_AGENT",
  "targetAgent": "CS_AGENT",
  "eventType": "REROUTE_CONFIRMED",
  "priority": "HIGH",
  "contextRef": "aja:context:corr_session_99410",
  "payload": {
    "shipmentId": "AJA-882910-KSA",
    "vehicleId": "TRK-KSA-9941",
    "rerouteStatus": "OPTIMIZED_ALTERNATIVE_ACTIVE",
    "newRouteVector": "HWY-40-BYPASS-NORTH",
    "calculatedDelayMinutes": 35,
    "revisedETA": "2026-07-30T14:45:00.000Z",
    "bilingualExplanation": {
      "en": "Vehicle TRK-KSA-9941 has been automatically re-routed via Highway 40 North to bypass severe weather. Revised ETA is 14:45 AST (+35 mins).",
      "ar": "تم إعادة توجيه الشاحنة TRK-KSA-9941 تلقائيًا عبر الطريق السريع 40 شمالاً لتجنب الأحوال الجوية. موعد الوصول المعدل هو 14:45 م (+35 دقيقة)."
    }
  }
}
```

---

## 4. CONSISTENT CONTEXT SHARING & SESSION MEMORY FRAMEWORK

To prevent context drift or information isolation during multi-agent interactions, the architecture employs a unified **Shared Context Engine**.

```
                           ┌────────────────────────────────────────┐
                           │   SHARED REDIS HASH CONTEXT STORE      │
                           │   Key: aja:context:<correlationId>     │
                           └──────────────────┬─────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
┌──────────────────────────┐        ┌──────────────────────────┐        ┌──────────────────────────┐
│  CUSTOMER CONTEXT        │        │  SHIPMENT CONTEXT        │        │  FLEET CONTEXT           │
│  • User Role & Preferred │        │  • Origin & Destination  │        │  • Telemetry Coordinates │
│    Language (EN/AR)      │        │  • Cargo Specifications  │        │  • Driver ID & Shifts    │
│  • Interaction History   │        │  • Customs Status Flags  │        │  • Route Vectors & Fuel  │
└──────────────────────────┘        └──────────────────────────┘        └──────────────────────────┘
```

### 4.1 Shared Context Structure (`HGETALL aja:context:<correlationId>`)

```json
{
  "correlationId": "corr_session_99410",
  "sessionId": "sess_user_77182",
  "userId": "usr_enterprise_dammam_corp",
  "language": "ar",
  "activeShipmentId": "AJA-882910-KSA",
  "shipmentState": {
    "status": "IN_TRANSIT",
    "origin": "Jeddah Islamic Port",
    "destination": "Dammam Port",
    "lastKnownETA": "2026-07-30T14:45:00.000Z",
    "delayRiskScore": 0.12
  },
  "fleetState": {
    "assignedTruck": "TRK-KSA-9941",
    "driverId": "DRV-8821",
    "telemetry": { "lat": 24.7136, "lng": 46.6753, "speedKmh": 82 },
    "activeRoute": "HWY-40-BYPASS-NORTH"
  },
  "agentReasoningTrace": [
    { "agent": "CS_AGENT", "timestamp": "10:15:30", "action": "Parsed query intent for delay explanation" },
    { "agent": "SHIPMENT_AGENT", "timestamp": "10:15:31", "action": "Detected sandstorm hazard on primary route" },
    { "agent": "FLEET_AGENT", "timestamp": "10:15:32", "action": "Applied Highway 40 bypass vector successfully" }
  ],
  "updatedAt": "2026-07-30T10:15:32.100Z"
}
```

### 4.2 Concurrency & Locking Protocol (`Redlock`)

When an agent needs to update shipment route parameters, it acquires a Redlock distributed lock:

```typescript
// Distributed Lock Pattern for Inter-Agent Mutations
const lockKey = `lock:shipment:${shipmentId}`;
const lockAcquired = await redis.set(lockKey, agentId, 'NX', 'PX', 5000); // 5 sec TTL

if (lockAcquired) {
  try {
    // Perform state update in Redis Hash Context & Stream task
    await updateSharedContext(correlationId, mutationData);
  } finally {
    // Release lock safely with Lua script checking ownership
    await releaseLock(lockKey, agentId);
  }
} else {
  // Retry with exponential backoff or await state sync event
}
```

---

## 5. TASK PRIORITY MANAGEMENT & PREEMPTION

Logistics operations require dynamic task priority management to ensure critical alerts take precedence over routine telemetry ingestion.

### 5.1 Priority Matrix & Latency SLAs

| Priority Tier | Value | Target Response SLA | Trigger Conditions & Scenarios | Consumer Polling Weight |
| :--- | :--- | :--- | :--- | :--- |
| `CRITICAL` | Tier 0 | **< 50 ms** | Safety hazards, collision warnings, active weather re-routing, Fasah customs rejection. | Polled on **100%** iteration cycles |
| `HIGH` | Tier 1 | **< 200 ms** | Live customer support queries, SLA delay triaging, route ETA deviations > 30 mins. | Polled on **80%** iteration cycles |
| `NORMAL` | Tier 2 | **< 1,000 ms** | Scheduled tracking updates, milestone predictions, document parsing. | Polled on **50%** iteration cycles |
| `LOW` | Tier 3 | **Async Background** | Historical data aggregation, telemetry archive logging, batch analytics. | Polled on **20%** iteration cycles |

### 5.2 Priority-Aware Multi-Stream Consumer Loop

```typescript
// Worker Polling Strategy with Priority Scheduling
async function startPriorityWorker(workerId: string) {
  while (isRunning) {
    // 1. Check CRITICAL priority stream first
    let entries = await redis.xreadgroup(
      'GROUP', 'cg-fleet-workers', workerId,
      'COUNT', 5, 'STREAMS', 'stream:agent:fleet:critical', '>'
    );

    // 2. Fallback to HIGH / NORMAL streams if no CRITICAL tasks pending
    if (!entries || entries.length === 0) {
      entries = await redis.xreadgroup(
        'GROUP', 'cg-fleet-workers', workerId,
        'COUNT', 10, 'STREAMS', 'stream:agent:fleet:tasks', '>'
      );
    }

    if (entries) {
      for (const entry of entries) {
        await processTaskWithTrace(entry);
        await redis.xack('stream:agent:fleet:tasks', 'cg-fleet-workers', entry.id);
      }
    }
  }
}
```

### 5.3 Dead-Letter Queue (DLQ) & Circuit Breaker Logic

* **Retry Threshold**: 3 retries with exponential backoff ($2^n \times 1000\,\text{ms}$).
* **DLQ Stream**: Tasks exceeding retry count are written to `stream:agent:dlq` with detailed stack traces.
* **Circuit Breaker**: If third-party telemetry services fail at $>30\%$ rate over a 60-second window, the orchestrator trips the circuit breaker and falls back to offline predictive ML models stored in memory.

---

## 6. DESIGN SYSTEM & FRONTEND OBSERVABILITY

The AI Orchestrator's status and real-time reasoning events are displayed across the AJA platform adhering to the **AJA Centralized Design System** (`/src/design-system/tokens.ts`).

### 6.1 Theme & Design Token Integration

* **Primary Surface**: Deep Oceanic Navy `#082F49` (`tokens.colors.primary[900]`)
* **Secondary Surface**: Enterprise Logistics Blue `#0F4C75` (`tokens.colors.primary[700]`)
* **Action & Alerts**: Premium Safety Orange `#EA580C` (`tokens.colors.accent[500]`)
* **Radii Constraints**: Cards `16px`, Buttons `10px`, Badges `9999px`

### 6.2 Real-Time Monitoring Badges Specification

```typescript
export const aiAgentStatusTokens = {
  idle:       { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1', label: 'Idle' },
  processing: { bg: '#EAF5FD', text: '#0F4C75', border: '#B5D8F7', label: 'Processing' },
  resolved:   { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC', label: 'Completed' },
  warning:    { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'Rerouting' },
  critical:   { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5', label: 'Exception' }
};
```

---

## 7. SUMMARY & ARCHITECTURAL VERIFICATION

This technical specification establishes the master framework for the **AJA AI Orchestrator**:

1. **Redis Message-Broker Protocol**: Combines Redis Streams (Consumer Groups for durability) and Redis Pub/Sub (real-time streaming) with in-memory Redis Hash shared context storage.
2. **Tri-Agent Communication Protocols**: Formally defines typed data envelopes and payload formats between `CS-Agent`, `Shipment-Agent`, and `Fleet-Agent`.
3. **Consistent Context Sharing**: Prevents state fragmentation using unified Redis session hashes and `Redlock` distributed locks.
4. **Task Priority Scheduling**: Enforces SLA-driven priority streams (`CRITICAL` < 50ms to `LOW` background) with DLQ fail-safes.
5. **AJA Design System Alignment**: Implements design tokens for UI observability in the Admin Control Center and Customer Portal.
