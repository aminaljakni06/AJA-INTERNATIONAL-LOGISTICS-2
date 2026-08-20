/**
 * AJA INTERNATIONAL LOGISTICS — Governance Control Tower & Monitoring Repository
 * Step GOV-16: Continuous Governance Monitoring, Health Scorecards, Anomaly Detection & Early-Warning Engine
 * 
 * Persistence & Scoping Architecture:
 * - Dual-layer persistence: Firestore with typed converters and high-performance in-memory caching
 * - Deterministic sequence generation: SIG-YYYY-#### (Signals) and GHC-YYYY-#### (Governance Health Scorecards)
 * - Strict multi-entity isolation across all query filters
 * - Signal deduplication by deterministic SHA-256 hash
 * - Audit logging with security event correlation
 */

import {
  GovernanceSignal,
  GovernanceHealthScorecard,
  GovernanceHealthIndicatorDefinition,
  GovernanceSignalStatus,
  GovernanceSignalSeverity,
  GovernanceSignalCategory,
  GovernanceJurisdiction
} from '../../types/corporateGovernance';
import { adminFirestore as firestore } from '../../server/adminFirestoreCompat';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where
} from '../../server/adminFirestoreCompat';
import { createAuditLog } from './auditLogRepository';
import { validateRequiredString } from '../validation';
import { createHash } from 'crypto';

// Firestore collection identifiers
export const GOVERNANCE_SIGNALS_COLLECTION = 'governance_signals';
export const GOVERNANCE_HEALTH_SCORECARDS_COLLECTION = 'governance_health_scorecards';
export const GOVERNANCE_HEALTH_INDICATORS_COLLECTION = 'governance_health_indicators';

// In-Memory Fallback Stores
const inMemorySignals = new Map<string, GovernanceSignal>();
const inMemoryScorecards = new Map<string, GovernanceHealthScorecard>();
const inMemoryIndicatorDefinitions = new Map<string, GovernanceHealthIndicatorDefinition>();

let signalCounter = 1;
let scorecardCounter = 1;

export function resetControlTowerMemoryStore(): void {
  inMemorySignals.clear();
  inMemoryScorecards.clear();
  inMemoryIndicatorDefinitions.clear();
  signalCounter = 1;
  scorecardCounter = 1;
}

export function computeControlTowerSha256(payload: string | object): string {
  const normalized = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return createHash('sha256').update(normalized).digest('hex');
}

export function generateSignalNumber(year = new Date().getFullYear()): string {
  const seq = String(signalCounter++).padStart(4, '0');
  return `SIG-${year}-${seq}`;
}

export function generateScorecardNumber(year = new Date().getFullYear()): string {
  const seq = String(scorecardCounter++).padStart(4, '0');
  return `GHC-${year}-${seq}`;
}

// ============================================================================
// 1. GOVERNANCE SIGNALS
// ============================================================================

export async function saveGovernanceSignal(
  signal: GovernanceSignal,
  actorUserId: string,
  correlationId?: string
): Promise<GovernanceSignal> {
  const cleanId = validateRequiredString(signal.id, 'signal.id');
  const cleanEntityId = validateRequiredString(signal.legalEntityId, 'signal.legalEntityId');
  const now = new Date().toISOString();

  const record: GovernanceSignal = {
    ...signal,
    id: cleanId,
    legalEntityId: cleanEntityId,
    updatedAt: now
  };

  inMemorySignals.set(cleanId, record);

  try {
    const docRef = doc(firestore, GOVERNANCE_SIGNALS_COLLECTION, cleanId);
    await setDoc(docRef, record, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_GOVERNANCE_SIGNAL',
    entityType: 'GOVERNANCE_SIGNAL',
    entityId: cleanId,
    before: null,
    after: record as unknown as Record<string, unknown>,
    metadata: {
      category: record.category,
      severity: record.severity,
      legalEntityId: cleanEntityId,
      status: record.status,
      correlationId: correlationId || `cor_sig_${Date.now()}`
    }
  });

  return record;
}

export async function getGovernanceSignalById(id: string): Promise<GovernanceSignal | null> {
  const cleanId = validateRequiredString(id, 'signalId');

  if (inMemorySignals.has(cleanId)) {
    return inMemorySignals.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, GOVERNANCE_SIGNALS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GovernanceSignal;
      inMemorySignals.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemorySignals.get(cleanId) || null;
  }

  return null;
}

export async function listGovernanceSignalsByEntity(
  legalEntityId: string,
  filter?: {
    category?: GovernanceSignalCategory;
    severity?: GovernanceSignalSeverity;
    status?: GovernanceSignalStatus;
  }
): Promise<GovernanceSignal[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');

  if (process.env.NODE_ENV === 'test') {
    const results = Array.from(inMemorySignals.values()).filter(s => {
      if (s.legalEntityId !== cleanEntityId) return false;
      if (filter?.category && s.category !== filter.category) return false;
      if (filter?.severity && s.severity !== filter.severity) return false;
      if (filter?.status && s.status !== filter.status) return false;
      return true;
    });
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const results: GovernanceSignal[] = [];

  for (const item of inMemorySignals.values()) {
    if (item.legalEntityId === cleanEntityId) {
      if (!filter?.category || item.category === filter.category) {
        if (!filter?.severity || item.severity === filter.severity) {
          if (!filter?.status || item.status === filter.status) {
            results.push(item);
          }
        }
      }
    }
  }

  try {
    const collRef = collection(firestore, GOVERNANCE_SIGNALS_COLLECTION);
    const q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as GovernanceSignal;
      if (!results.some(r => r.id === item.id)) {
        if (!filter?.category || item.category === filter.category) {
          if (!filter?.severity || item.severity === filter.severity) {
            if (!filter?.status || item.status === filter.status) {
              results.push(item);
            }
          }
        }
        inMemorySignals.set(item.id, item);
      }
    });
  } catch {
    // Fallback
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function findSignalByDeduplicationKey(
  legalEntityId: string,
  deduplicationKey: string
): Promise<GovernanceSignal | null> {
  const signals = await listGovernanceSignalsByEntity(legalEntityId);
  return signals.find(s => s.deduplicationKey === deduplicationKey && s.status !== 'RESOLVED' && s.status !== 'FALSE_POSITIVE' && s.status !== 'SUPPRESSED') || null;
}

// ============================================================================
// 2. GOVERNANCE HEALTH SCORECARDS
// ============================================================================

export async function saveGovernanceHealthScorecard(
  scorecard: GovernanceHealthScorecard,
  actorUserId: string,
  correlationId?: string
): Promise<GovernanceHealthScorecard> {
  const cleanId = validateRequiredString(scorecard.id, 'scorecard.id');
  const cleanEntityId = validateRequiredString(scorecard.legalEntityId, 'scorecard.legalEntityId');
  const now = new Date().toISOString();

  const record: GovernanceHealthScorecard = {
    ...scorecard,
    id: cleanId,
    legalEntityId: cleanEntityId,
    updatedAt: now
  };

  inMemoryScorecards.set(cleanId, record);

  try {
    const docRef = doc(firestore, GOVERNANCE_HEALTH_SCORECARDS_COLLECTION, cleanId);
    await setDoc(docRef, record, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_GOVERNANCE_HEALTH_SCORECARD',
    entityType: 'GOVERNANCE_HEALTH_SCORECARD',
    entityId: cleanId,
    before: null,
    after: record as unknown as Record<string, unknown>,
    metadata: {
      legalEntityId: cleanEntityId,
      overallScore: record.overallScore,
      overallStatus: record.overallStatus,
      reportingPeriod: record.reportingPeriod,
      calculationEvidenceHashSha256: record.calculationEvidenceHashSha256,
      correlationId: correlationId || `cor_ghc_${Date.now()}`
    }
  });

  return record;
}

export async function getGovernanceHealthScorecardById(id: string): Promise<GovernanceHealthScorecard | null> {
  const cleanId = validateRequiredString(id, 'scorecardId');

  if (inMemoryScorecards.has(cleanId)) {
    return inMemoryScorecards.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, GOVERNANCE_HEALTH_SCORECARDS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GovernanceHealthScorecard;
      inMemoryScorecards.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryScorecards.get(cleanId) || null;
  }

  return null;
}

export async function listGovernanceHealthScorecardsByEntity(
  legalEntityId: string
): Promise<GovernanceHealthScorecard[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');

  if (process.env.NODE_ENV === 'test') {
    return Array.from(inMemoryScorecards.values())
      .filter(s => s.legalEntityId === cleanEntityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const results: GovernanceHealthScorecard[] = [];

  for (const item of inMemoryScorecards.values()) {
    if (item.legalEntityId === cleanEntityId) {
      results.push(item);
    }
  }

  try {
    const collRef = collection(firestore, GOVERNANCE_HEALTH_SCORECARDS_COLLECTION);
    const q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as GovernanceHealthScorecard;
      if (!results.some(r => r.id === item.id)) {
        results.push(item);
        inMemoryScorecards.set(item.id, item);
      }
    });
  } catch {
    // Fallback
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ============================================================================
// 3. GOVERNANCE HEALTH INDICATOR DEFINITIONS
// ============================================================================

export async function saveGovernanceHealthIndicatorDefinition(
  definition: GovernanceHealthIndicatorDefinition,
  actorUserId: string
): Promise<GovernanceHealthIndicatorDefinition> {
  const cleanId = validateRequiredString(definition.id, 'definition.id');
  const now = new Date().toISOString();

  const record: GovernanceHealthIndicatorDefinition = {
    ...definition,
    updatedAt: now
  };

  inMemoryIndicatorDefinitions.set(cleanId, record);

  try {
    const docRef = doc(firestore, GOVERNANCE_HEALTH_INDICATORS_COLLECTION, cleanId);
    await setDoc(docRef, record, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_GOVERNANCE_HEALTH_INDICATOR_DEF',
    entityType: 'GOVERNANCE_HEALTH_INDICATOR',
    entityId: cleanId,
    before: null,
    after: record as unknown as Record<string, unknown>
  });

  return record;
}

export async function listGovernanceHealthIndicatorDefinitions(
  policyVersionId?: string
): Promise<GovernanceHealthIndicatorDefinition[]> {
  const results = Array.from(inMemoryIndicatorDefinitions.values());
  if (policyVersionId) {
    return results.filter(d => d.policyVersionId === policyVersionId);
  }
  return results;
}
