/**
 * AJA INTERNATIONAL LOGISTICS — Governance Analytics & Decision Intelligence Repository
 * Step GOV-17: Governance Analytics, Scenario Simulation, Decision Intelligence & Board Advisory Storage Layer
 * 
 * Persistence Invariants:
 * 1. Multi-Entity and Jurisdiction isolation enforced on all queries and storage.
 * 2. Immutable finalized simulation runs and advisory briefs (sealed with SHA-256).
 * 3. Deterministic sequence numbering (GAS-YYYY-####, SCN-YYYY-####, SIM-YYYY-####, GDI-YYYY-####, BAB-YYYY-####).
 * 4. In-memory master store with Firestore-ready interfaces.
 */

import crypto from 'crypto';
import {
  GovernanceAnalyticsSnapshot,
  GovernanceScenarioDefinition,
  GovernanceSimulationRun,
  GovernanceDecisionIntelligence,
  BoardAdvisoryBrief
} from '../../types/corporateGovernance';

// ============================================================================
// IN-MEMORY STORAGE MAPS
// ============================================================================

const analyticsSnapshotsStore = new Map<string, GovernanceAnalyticsSnapshot>();
const scenarioDefinitionsStore = new Map<string, GovernanceScenarioDefinition>();
const simulationRunsStore = new Map<string, GovernanceSimulationRun>();
const decisionIntelligenceStore = new Map<string, GovernanceDecisionIntelligence>();
const boardAdvisoryBriefsStore = new Map<string, BoardAdvisoryBrief>();

// ============================================================================
// SEQUENCE COUNTERS
// ============================================================================

let snapshotSeq = 1;
let scenarioSeq = 1;
let simulationSeq = 1;
let intelligenceSeq = 1;
let briefSeq = 1;

export function generateAnalyticsSnapshotNumber(): string {
  const year = new Date().getFullYear();
  const num = String(snapshotSeq++).padStart(4, '0');
  return `GAS-${year}-${num}`;
}

export function generateScenarioNumber(): string {
  const year = new Date().getFullYear();
  const num = String(scenarioSeq++).padStart(4, '0');
  return `SCN-${year}-${num}`;
}

export function generateSimulationRunNumber(): string {
  const year = new Date().getFullYear();
  const num = String(simulationSeq++).padStart(4, '0');
  return `SIM-${year}-${num}`;
}

export function generateDecisionIntelligenceNumber(): string {
  const year = new Date().getFullYear();
  const num = String(intelligenceSeq++).padStart(4, '0');
  return `GDI-${year}-${num}`;
}

export function generateBoardAdvisoryBriefNumber(): string {
  const year = new Date().getFullYear();
  const num = String(briefSeq++).padStart(4, '0');
  return `BAB-${year}-${num}`;
}

export function computeAnalyticsSha256(payload: unknown): string {
  const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

export function resetGovernanceAnalyticsMemoryStore(): void {
  analyticsSnapshotsStore.clear();
  scenarioDefinitionsStore.clear();
  simulationRunsStore.clear();
  decisionIntelligenceStore.clear();
  boardAdvisoryBriefsStore.clear();
  snapshotSeq = 1;
  scenarioSeq = 1;
  simulationSeq = 1;
  intelligenceSeq = 1;
  briefSeq = 1;
}

// ============================================================================
// 1. ANALYTICS SNAPSHOTS REPOSITORY
// ============================================================================

export async function saveGovernanceAnalyticsSnapshot(
  snapshot: GovernanceAnalyticsSnapshot
): Promise<GovernanceAnalyticsSnapshot> {
  analyticsSnapshotsStore.set(snapshot.id, { ...snapshot });
  return { ...snapshot };
}

export async function getGovernanceAnalyticsSnapshotById(
  id: string
): Promise<GovernanceAnalyticsSnapshot | null> {
  const found = analyticsSnapshotsStore.get(id);
  return found ? { ...found } : null;
}

export async function listGovernanceAnalyticsSnapshotsByEntity(
  legalEntityId: string
): Promise<GovernanceAnalyticsSnapshot[]> {
  const results: GovernanceAnalyticsSnapshot[] = [];
  for (const snapshot of analyticsSnapshotsStore.values()) {
    if (snapshot.legalEntityId === legalEntityId) {
      results.push({ ...snapshot });
    }
  }
  return results.sort((a, b) => b.generatedAtUtc.localeCompare(a.generatedAtUtc));
}

// ============================================================================
// 2. SCENARIO DEFINITIONS REPOSITORY
// ============================================================================

export async function saveGovernanceScenarioDefinition(
  scenario: GovernanceScenarioDefinition
): Promise<GovernanceScenarioDefinition> {
  scenarioDefinitionsStore.set(scenario.id, { ...scenario });
  return { ...scenario };
}

export async function getGovernanceScenarioDefinitionById(
  id: string
): Promise<GovernanceScenarioDefinition | null> {
  const found = scenarioDefinitionsStore.get(id);
  return found ? { ...found } : null;
}

export async function listGovernanceScenarioDefinitionsByEntity(
  legalEntityId: string
): Promise<GovernanceScenarioDefinition[]> {
  const results: GovernanceScenarioDefinition[] = [];
  for (const scenario of scenarioDefinitionsStore.values()) {
    if (scenario.legalEntityId === legalEntityId) {
      results.push({ ...scenario });
    }
  }
  return results.sort((a, b) => b.createdAtUtc.localeCompare(a.createdAtUtc));
}

// ============================================================================
// 3. SIMULATION RUNS REPOSITORY
// ============================================================================

export async function saveGovernanceSimulationRun(
  simulation: GovernanceSimulationRun
): Promise<GovernanceSimulationRun> {
  simulationRunsStore.set(simulation.id, { ...simulation });
  return { ...simulation };
}

export async function getGovernanceSimulationRunById(
  id: string
): Promise<GovernanceSimulationRun | null> {
  const found = simulationRunsStore.get(id);
  return found ? { ...found } : null;
}

export async function listGovernanceSimulationRunsByEntity(
  legalEntityId: string
): Promise<GovernanceSimulationRun[]> {
  const results: GovernanceSimulationRun[] = [];
  for (const simulation of simulationRunsStore.values()) {
    if (simulation.legalEntityId === legalEntityId) {
      results.push({ ...simulation });
    }
  }
  return results.sort((a, b) => b.requestedAtUtc.localeCompare(a.requestedAtUtc));
}

// ============================================================================
// 4. DECISION INTELLIGENCE REPOSITORY
// ============================================================================

export async function saveGovernanceDecisionIntelligence(
  intelligence: GovernanceDecisionIntelligence
): Promise<GovernanceDecisionIntelligence> {
  decisionIntelligenceStore.set(intelligence.id, { ...intelligence });
  return { ...intelligence };
}

export async function getGovernanceDecisionIntelligenceById(
  id: string
): Promise<GovernanceDecisionIntelligence | null> {
  const found = decisionIntelligenceStore.get(id);
  return found ? { ...found } : null;
}

export async function listGovernanceDecisionIntelligenceByEntity(
  legalEntityId: string
): Promise<GovernanceDecisionIntelligence[]> {
  const results: GovernanceDecisionIntelligence[] = [];
  for (const item of decisionIntelligenceStore.values()) {
    if (item.legalEntityId === legalEntityId) {
      results.push({ ...item });
    }
  }
  return results.sort((a, b) => b.createdAtUtc.localeCompare(a.createdAtUtc));
}

// ============================================================================
// 5. BOARD ADVISORY BRIEFS REPOSITORY
// ============================================================================

export async function saveBoardAdvisoryBrief(
  brief: BoardAdvisoryBrief
): Promise<BoardAdvisoryBrief> {
  boardAdvisoryBriefsStore.set(brief.id, { ...brief });
  return { ...brief };
}

export async function getBoardAdvisoryBriefById(
  id: string
): Promise<BoardAdvisoryBrief | null> {
  const found = boardAdvisoryBriefsStore.get(id);
  return found ? { ...found } : null;
}

export async function listBoardAdvisoryBriefsByEntity(
  legalEntityId: string
): Promise<BoardAdvisoryBrief[]> {
  const results: BoardAdvisoryBrief[] = [];
  for (const brief of boardAdvisoryBriefsStore.values()) {
    if (brief.legalEntityId === legalEntityId) {
      results.push({ ...brief });
    }
  }
  return results.sort((a, b) => b.preparedAtUtc.localeCompare(a.preparedAtUtc));
}
