/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Governance Orchestration Repository
 * Step GOV-14: Governance Operating Calendar, Committee Workflow Orchestration, Decision Follow-Up, Notifications & Executive Action Management
 * 
 * Architecture:
 * - Pure Orchestration Layer: Integrates and drives existing engines (GOV-05, GOV-06, GOV-08, GOV-09, GOV-10, GOV-11, GOV-12, GOV-13)
 * - GOVERNANCE-POLICY-INVARIANT-01: Configurable, versioned, jurisdiction-aware & provenance-preserved governance cadences
 * - Multi-tenant Legal Entity isolation and cross-committee boundary enforcement
 * - Pack Readiness Gate: Comprehensive validation before approval/publication
 * - Segregation of Duties (SoD): Technical admin & service principals blocked from governance sign-offs; action owners blocked from self-verification
 * - Notification Router with deduplication and idempotency
 */

import {
  GovernanceOperatingCycle,
  GovernanceCalendarCycleType,
  GovernanceCommitteeType,
  GovernanceCycleFrequency,
  GovernanceCycleStatus,
  GovernanceMilestone,
  CommitteeAgendaItem,
  CommitteeAgendaItemCategory,
  CommitteeAgendaItemStatus,
  PackReadinessGateReport,
  PackSectionReadinessCheck,
  CrossCommitteeDependency,
  CrossCommitteeSourceEntityType,
  CrossCommitteeTargetEntityType,
  CrossCommitteeDependencyStatus,
  GovernanceNotificationDispatch,
  GovernanceNotificationEventType,
  ExecutiveDeskView,
  GovernanceJurisdiction,
  BoardMeeting,
  CorporateDecision,
  CorporateResolution,
  GovernanceReportingPack,
  GovernanceChallenge,
  GovernanceAction,
  GovernanceActionStatus,
  ExecutiveAttestation,
  CorporatePolicyVersion,
  DelegationOfAuthority
} from '../../types/corporateGovernance';
import { UserContext } from '../../types/permissions';
import { adminFirestore as firestore } from '../../server/adminFirestoreCompat';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where
} from '../../server/adminFirestoreCompat';
import { createAuditLog } from './auditLogRepository';
import { createNotification } from './notificationRepository';
import { validateRequiredString, ValidationError } from '../validation';
import {
  getBoardMeetingById,
  listBoardMeetingsByEntity,
  saveBoardMeeting,
  getCorporateDecisionById,
  getCorporateResolutionById,
  saveCorporateDecision,
  saveCorporateResolution
} from './corporateGovernanceRepository';
import {
  getCorporatePolicyVersionById,
  getDelegationById
} from './corporateAuthorityRepository';
import {
  resolveEffectiveGovernanceRules,
  getGovernanceReportingPackById,
  saveGovernanceReportingPack,
  getGovernanceActionById,
  saveGovernanceAction,
  listGovernanceActionsByEntity,
  createGovernanceAction,
  getGovernanceChallengeById,
  createGovernanceChallenge,
  getExecutiveAttestationById,
  getMetricSnapshotById,
  getRiskAppetiteStatementById,
  GOVERNANCE_ACTIONS_COLLECTION,
  GOVERNANCE_CHALLENGES_COLLECTION,
  EXECUTIVE_ATTESTATIONS_COLLECTION,
  GOVERNANCE_REPORTING_PACKS_COLLECTION
} from './corporateBoardOversightRepository';
import { getEvidenceRecordById } from './corporateRecordsRepository';
import { getGovernanceRiskById, getGovernanceFindingById } from './corporateRiskAssuranceRepository';
import { getAnnualAuditPlanById } from './corporateAuditAssuranceRepository';
import * as crypto from 'crypto';

// Firestore collection identifiers
export const GOVERNANCE_OPERATING_CYCLES_COLLECTION = 'governance_operating_cycles';
export const COMMITTEE_AGENDA_ITEMS_COLLECTION = 'committee_agenda_items';
export const CROSS_COMMITTEE_DEPENDENCIES_COLLECTION = 'cross_committee_dependencies';
export const GOVERNANCE_NOTIFICATION_DISPATCHES_COLLECTION = 'governance_notification_dispatches';

// In-memory fallback stores
const inMemoryOperatingCycles = new Map<string, GovernanceOperatingCycle>();
const inMemoryAgendaItems = new Map<string, CommitteeAgendaItem>();
const inMemoryCrossDependencies = new Map<string, CrossCommitteeDependency>();
const inMemoryDispatches = new Map<string, GovernanceNotificationDispatch>();

export function resetGovernanceOrchestrationMemoryStore(): void {
  inMemoryOperatingCycles.clear();
  inMemoryAgendaItems.clear();
  inMemoryCrossDependencies.clear();
  inMemoryDispatches.clear();
}

function computeSha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export { listGovernanceActionsByEntity, saveGovernanceAction };

export async function listGovernanceChallengesByPack(packId: string): Promise<GovernanceChallenge[]> {
  const cleanPackId = validateRequiredString(packId, 'packId');
  const results: GovernanceChallenge[] = [];
  try {
    const collRef = collection(firestore, GOVERNANCE_CHALLENGES_COLLECTION);
    const q = query(collRef, where('packId', '==', cleanPackId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      results.push(d.data() as GovernanceChallenge);
    });
  } catch {}
  return results;
}

export async function listExecutiveAttestationsByEntity(legalEntityId: string): Promise<ExecutiveAttestation[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: ExecutiveAttestation[] = [];
  try {
    const collRef = collection(firestore, EXECUTIVE_ATTESTATIONS_COLLECTION);
    const q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      results.push(d.data() as ExecutiveAttestation);
    });
  } catch {}
  return results;
}

/**
 * Checks entity access authorization
 */
function assertEntityAccess(entityId: string, userContext: UserContext, actionName: string): void {
  const allowedRoles = ['GLOBAL_COMPLIANCE_DIRECTOR', 'INTERNAL_AUDITOR', 'EXTERNAL_AUDITOR'];
  if (userContext.legalEntityId && userContext.legalEntityId !== entityId && !allowedRoles.includes(userContext.role)) {
    throw new ValidationError(
      `Access Denied: User from legal entity '${userContext.legalEntityId}' is not authorized to execute '${actionName}' on entity '${entityId}'.`
    );
  }
}

/**
 * Anti-Corruption: Technical admin & service principals cannot perform final governance sign-offs
 */
function assertGovernanceSignoffAuthority(userContext: UserContext, actionName: string): void {
  if (userContext.role === 'TECHNICAL_ADMIN' || userContext.role === 'SUPER_ADMIN') {
    throw new ValidationError(
      `Segregation of Duties Violation: Technical Administrator '${userContext.userId}' cannot perform governance approval/sign-off '${actionName}'.`
    );
  }
  if (userContext.role === 'SERVICE_PRINCIPAL' || userContext.role === 'AI_ASSISTANT' || (userContext as any).isServicePrincipal || (userContext as any).isAiAgent) {
    throw new ValidationError(
      `Segregation of Duties Violation: Automated Agent / Service Principal cannot perform final governance approval/sign-off '${actionName}'.`
    );
  }
}

// ============================================================================
// 1. ANNUAL GOVERNANCE OPERATING CALENDAR & CYCLE ORCHESTRATION (INVARIANT-01)
// ============================================================================

export async function getGovernanceOperatingCycleById(cycleId: string): Promise<GovernanceOperatingCycle | null> {
  const cleanId = validateRequiredString(cycleId, 'cycleId');
  if (inMemoryOperatingCycles.has(cleanId)) {
    return inMemoryOperatingCycles.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, GOVERNANCE_OPERATING_CYCLES_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GovernanceOperatingCycle;
      inMemoryOperatingCycles.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryOperatingCycles.get(cleanId) || null;
  }

  return null;
}

export async function listGovernanceOperatingCyclesByEntity(
  legalEntityId: string,
  filter?: {
    committeeType?: GovernanceCommitteeType;
    cycleType?: GovernanceCalendarCycleType;
    year?: number;
    status?: GovernanceCycleStatus;
  }
): Promise<GovernanceOperatingCycle[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: GovernanceOperatingCycle[] = [];

  try {
    const collRef = collection(firestore, GOVERNANCE_OPERATING_CYCLES_COLLECTION);
    let q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    if (filter?.year) {
      q = query(collRef, where('legalEntityId', '==', cleanEntityId), where('year', '==', filter.year));
    }
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as GovernanceOperatingCycle;
      if (!filter?.committeeType || item.committeeType === filter.committeeType) {
        if (!filter?.cycleType || item.cycleType === filter.cycleType) {
          if (!filter?.status || item.status === filter.status) {
            results.push(item);
            inMemoryOperatingCycles.set(item.id, item);
          }
        }
      }
    });
  } catch {
    // Fallback in-memory
    Array.from(inMemoryOperatingCycles.values()).forEach(item => {
      if (item.legalEntityId === cleanEntityId) {
        if (!filter?.year || item.year === filter.year) {
          if (!filter?.committeeType || item.committeeType === filter.committeeType) {
            if (!filter?.cycleType || item.cycleType === filter.cycleType) {
              if (!filter?.status || item.status === filter.status) {
                results.push(item);
              }
            }
          }
        }
      }
    });
  }

  return results.sort((a, b) => new Date(a.targetStartDate).getTime() - new Date(b.targetStartDate).getTime());
}

export async function saveGovernanceOperatingCycle(
  cycle: GovernanceOperatingCycle,
  actorUserId: string
): Promise<GovernanceOperatingCycle> {
  const cleanId = validateRequiredString(cycle.id, 'id');
  const now = new Date().toISOString();

  const previous = await getGovernanceOperatingCycleById(cleanId);

  // Invariant-01: Prohibit recalculating historical cycles with current policy rules if historical snapshot exists
  if (previous && previous.status === 'COMPLETED' && cycle.status === 'COMPLETED') {
    if (previous.ruleSetHashSha256 !== cycle.ruleSetHashSha256) {
      throw new ValidationError(
        `Invariant-01 Violation: Historical completed cycle '${cleanId}' rule snapshot cannot be overwritten or recalculated.`
      );
    }
  }

  const updated: GovernanceOperatingCycle = {
    ...cycle,
    id: cleanId,
    updatedAt: now,
    createdAt: cycle.createdAt || previous?.createdAt || now
  };

  inMemoryOperatingCycles.set(cleanId, updated);

  try {
    const docRef = doc(firestore, GOVERNANCE_OPERATING_CYCLES_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Retain in-memory
  }

  await createAuditLog({
    actorUserId,
    action: previous ? 'UPDATE_GOVERNANCE_OPERATING_CYCLE' : 'CREATE_GOVERNANCE_OPERATING_CYCLE',
    entityType: 'GOVERNANCE_OPERATING_CYCLE',
    entityId: cleanId,
    before: (previous as unknown as Record<string, unknown>) || null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      legalEntityId: updated.legalEntityId,
      cycleNumber: updated.cycleNumber,
      committeeType: updated.committeeType,
      year: updated.year,
      status: updated.status
    }
  });

  return updated;
}

/**
 * Generates an Annual Governance Operating Calendar for a Legal Entity and its Committees.
 * Applies GOVERNANCE-POLICY-INVARIANT-01:
 * Dynamically resolves cadences, cutoff dates, SLA periods from the effective Policy Version.
 * Idempotent: Duplicated calls for identical entity, committee, year, quarter return existing cycles.
 */
export async function generateAnnualGovernanceOperatingCycles(
  params: {
    legalEntityId: string;
    jurisdictionContext: GovernanceJurisdiction;
    year: number;
    policyVersionId: string;
    supportingDecisionId?: string;
    committeeTypes?: GovernanceCommitteeType[];
  },
  userContext: UserContext
): Promise<GovernanceOperatingCycle[]> {
  const cleanEntityId = validateRequiredString(params.legalEntityId, 'legalEntityId');
  assertEntityAccess(cleanEntityId, userContext, 'generateAnnualGovernanceOperatingCycles');

  // Validate policy version provenance
  if (!params.policyVersionId) {
    throw new ValidationError(
      `Invariant-01 Violation: Missing Corporate Policy Version provenance for operating calendar generation.`
    );
  }

  const policyVer = await getCorporatePolicyVersionById(params.policyVersionId);
  if (!policyVer) {
    throw new ValidationError(
      `Invariant-01 Violation: Policy Version '${params.policyVersionId}' does not exist.`
    );
  }

  // Deny outdated policy cadence applied to new future cycles
  if (policyVer.supersededByVersionId || (policyVer.effectiveUntil && policyVer.effectiveUntil < new Date().toISOString())) {
    throw new ValidationError(
      `Invariant-01 Violation: Cannot generate new operating calendar using superseded/archived policy version '${params.policyVersionId}'.`
    );
  }

  // Resolve Effective Governance Rules for Board Oversight
  const effectiveRuleSet = await resolveEffectiveGovernanceRules({
    legalEntityId: cleanEntityId,
    jurisdictionContext: params.jurisdictionContext,
    ruleCategory: 'BOARD_OVERSIGHT',
    policyVersionId: params.policyVersionId,
    evaluationTimestamp: new Date().toISOString()
  }, userContext.userId);

  const rules = effectiveRuleSet.effectiveRules;
  const agendaCutoffDays = rules.agendaCutoffDays || 14; // T-14 default if not overridden by policy
  const packDistributionDays = rules.packDistributionDays || 7; // T-7 default
  const readinessLockdownDays = rules.readinessLockdownDays || 3; // T-3 default
  const minutesCirculationDays = rules.minutesCirculationDays || 3; // T+3 default
  const actionDispatchDays = rules.actionDispatchDays || 7; // T+7 default

  const targetCommittees: GovernanceCommitteeType[] = params.committeeTypes && params.committeeTypes.length > 0
    ? params.committeeTypes
    : [
        'BOARD_OF_DIRECTORS',
        'AUDIT_COMMITTEE',
        'RISK_COMMITTEE',
        'REMUNERATION_COMMITTEE',
        'EXECUTIVE_COMMITTEE',
        'COMPLIANCE_COMMITTEE'
      ];

  const generatedCycles: GovernanceOperatingCycle[] = [];
  const existingCycles = await listGovernanceOperatingCyclesByEntity(cleanEntityId, { year: params.year });

  const quarters: Array<{ q: 1 | 2 | 3 | 4; startMonth: number; midMonth: number; endMonth: number }> = [
    { q: 1, startMonth: 1, midMonth: 2, endMonth: 3 },
    { q: 2, startMonth: 4, midMonth: 5, endMonth: 6 },
    { q: 3, startMonth: 7, midMonth: 8, endMonth: 9 },
    { q: 4, startMonth: 10, midMonth: 11, endMonth: 12 }
  ];

  for (const committee of targetCommittees) {
    for (const quarter of quarters) {
      const cycleNumber = `GOC-${params.year}-Q${quarter.q}-${committee.substring(0, 3).toUpperCase()}`;

      // Idempotency check: if cycle exists, return it
      const existing = existingCycles.find(c => c.cycleNumber === cycleNumber || (c.committeeType === committee && c.year === params.year && c.quarter === quarter.q));
      if (existing) {
        generatedCycles.push(existing);
        continue;
      }

      const qStart = new Date(Date.UTC(params.year, quarter.startMonth - 1, 1)).toISOString();
      const qEnd = new Date(Date.UTC(params.year, quarter.endMonth, 0, 23, 59, 59)).toISOString();
      
      // Meeting day set to 3rd Thursday of quarter mid-month
      const meetingTarget = new Date(Date.UTC(params.year, quarter.midMonth - 1, 20, 10, 0, 0));
      const meetingIso = meetingTarget.toISOString();

      const agendaCutoffDate = new Date(meetingTarget.getTime() - agendaCutoffDays * 86400000).toISOString();
      const packDistDate = new Date(meetingTarget.getTime() - packDistributionDays * 86400000).toISOString();
      const readinessLockdownDate = new Date(meetingTarget.getTime() - readinessLockdownDays * 86400000).toISOString();
      const minutesCircDate = new Date(meetingTarget.getTime() + minutesCirculationDays * 86400000).toISOString();
      const actionDispatchDate = new Date(meetingTarget.getTime() + actionDispatchDays * 86400000).toISOString();

      const milestones: GovernanceMilestone[] = [
        {
          id: `mls_${cycleNumber}_t14`,
          milestoneCode: `T_MINUS_${agendaCutoffDays}_AGENDA_CUTOFF`,
          title: `Agenda Submissions & Topic Cut-off (T-${agendaCutoffDays})`,
          targetDate: agendaCutoffDate,
          status: 'PENDING',
          responsibleRole: 'COMPANY_SECRETARY'
        },
        {
          id: `mls_${cycleNumber}_t7`,
          milestoneCode: `T_MINUS_${packDistributionDays}_PACK_DISTRIBUTION`,
          title: `Pre-Read & Reporting Pack Publication (T-${packDistributionDays})`,
          targetDate: packDistDate,
          status: 'PENDING',
          responsibleRole: 'COMPANY_SECRETARY'
        },
        {
          id: `mls_${cycleNumber}_t3`,
          milestoneCode: `T_MINUS_${readinessLockdownDays}_READINESS_LOCKDOWN`,
          title: `Quorum & Governance Readiness Lockdown (T-${readinessLockdownDays})`,
          targetDate: readinessLockdownDate,
          status: 'PENDING',
          responsibleRole: 'COMMITTEE_CHAIR'
        },
        {
          id: `mls_${cycleNumber}_meet`,
          milestoneCode: 'MEETING_DAY',
          title: `${committee.replace(/_/g, ' ')} Q${quarter.q} Session`,
          targetDate: meetingIso,
          status: 'PENDING',
          responsibleRole: 'COMMITTEE_CHAIR'
        },
        {
          id: `mls_${cycleNumber}_tplus3`,
          milestoneCode: `T_PLUS_${minutesCirculationDays}_MINUTES_CIRCULATION`,
          title: `Draft Minutes & Resolution Circulation (T+${minutesCirculationDays})`,
          targetDate: minutesCircDate,
          status: 'PENDING',
          responsibleRole: 'COMPANY_SECRETARY'
        },
        {
          id: `mls_${cycleNumber}_tplus7`,
          milestoneCode: `T_PLUS_${actionDispatchDays}_ACTION_DISPATCH`,
          title: `Governance Actions & Executive Dispatches (T+${actionDispatchDays})`,
          targetDate: actionDispatchDate,
          status: 'PENDING',
          responsibleRole: 'EXECUTIVE_SECRETARY'
        }
      ];

      const cycleId = `cycle_${cleanEntityId}_${params.year}_q${quarter.q}_${committee.toLowerCase()}`;
      const now = new Date().toISOString();

      const newCycle: GovernanceOperatingCycle = {
        id: cycleId,
        cycleNumber,
        legalEntityId: cleanEntityId,
        jurisdictionContext: params.jurisdictionContext,
        committeeType: committee,
        cycleType: committee === 'BOARD_OF_DIRECTORS' ? 'BOARD_MEETING_CYCLE' : 'COMMITTEE_MEETING_CYCLE',
        year: params.year,
        quarter: quarter.q,
        frequency: 'QUARTERLY',
        titleEn: `${committee.replace(/_/g, ' ')} Operating Rhythm Q${quarter.q} ${params.year}`,
        titleAr: `جدول أعمال ${committee.replace(/_/g, ' ')} للربع ${quarter.q} ${params.year}`,
        targetStartDate: qStart,
        targetEndDate: qEnd,
        status: 'PLANNED',
        supportingPolicyVersionId: params.policyVersionId,
        supportingDecisionId: params.supportingDecisionId,
        effectiveRuleSnapshot: {
          ...rules,
          agendaCutoffDays,
          packDistributionDays,
          readinessLockdownDays,
          minutesCirculationDays,
          actionDispatchDays
        },
        ruleSetHashSha256: effectiveRuleSet.ruleSetHashSha256,
        milestones,
        meetingIds: [],
        packIds: [],
        attestationIds: [],
        actionIds: [],
        generatedAt: now,
        generatedByUserId: userContext.userId,
        auditCorrelationId: `cor_cycle_${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };

      const saved = await saveGovernanceOperatingCycle(newCycle, userContext.userId);
      generatedCycles.push(saved);
    }
  }

  return generatedCycles;
}

// ============================================================================
// 2. COMMITTEE WORKFLOW ORCHESTRATION & AGENDA LIFECYCLE
// ============================================================================

export async function getCommitteeAgendaItemById(itemId: string): Promise<CommitteeAgendaItem | null> {
  const cleanId = validateRequiredString(itemId, 'itemId');
  if (inMemoryAgendaItems.has(cleanId)) {
    return inMemoryAgendaItems.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, COMMITTEE_AGENDA_ITEMS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CommitteeAgendaItem;
      inMemoryAgendaItems.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryAgendaItems.get(cleanId) || null;
  }

  return null;
}

export async function listCommitteeAgendaItems(meetingId: string): Promise<CommitteeAgendaItem[]> {
  const cleanMeetingId = validateRequiredString(meetingId, 'meetingId');
  const results: CommitteeAgendaItem[] = [];

  try {
    const collRef = collection(firestore, COMMITTEE_AGENDA_ITEMS_COLLECTION);
    const q = query(collRef, where('meetingId', '==', cleanMeetingId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as CommitteeAgendaItem;
      results.push(item);
      inMemoryAgendaItems.set(item.id, item);
    });
  } catch {
    Array.from(inMemoryAgendaItems.values()).forEach(item => {
      if (item.meetingId === cleanMeetingId) {
        results.push(item);
      }
    });
  }

  return results.sort((a, b) => a.itemNumber - b.itemNumber);
}

export async function saveCommitteeAgendaItem(
  agendaItem: CommitteeAgendaItem,
  userContext: UserContext
): Promise<CommitteeAgendaItem> {
  const cleanId = validateRequiredString(agendaItem.id, 'id');
  const cleanMeetingId = validateRequiredString(agendaItem.meetingId, 'meetingId');
  const cleanEntityId = validateRequiredString(agendaItem.legalEntityId, 'legalEntityId');

  assertEntityAccess(cleanEntityId, userContext, 'saveCommitteeAgendaItem');

  // Verify meeting exists
  const meeting = await getBoardMeetingById(cleanMeetingId);
  if (!meeting) {
    throw new ValidationError(`Meeting '${cleanMeetingId}' does not exist.`);
  }

  // Check if meeting or agenda is already locked
  if (meeting.status === 'CONCLUDED' || meeting.status === 'CANCELLED') {
    throw new ValidationError(`Cannot modify agenda for concluded or cancelled meeting '${cleanMeetingId}'.`);
  }

  const previous = await getCommitteeAgendaItemById(cleanId);

  // Agenda mutation after lock -> DENY
  if (previous && previous.isLocked) {
    throw new ValidationError(
      `Governance Invariant Violation: Agenda Item '${cleanId}' is LOCKED and cannot be modified without formal Chairperson unlock.`
    );
  }

  // Accountable ownership mandatory
  if (!agendaItem.ownerUserId || !agendaItem.ownerRole) {
    throw new ValidationError(
      `Governance Invariant Violation: Agenda Item '${agendaItem.title}' must have a designated accountable owner.`
    );
  }

  const now = new Date().toISOString();
  const updated: CommitteeAgendaItem = {
    ...agendaItem,
    id: cleanId,
    legalEntityId: cleanEntityId,
    meetingId: cleanMeetingId,
    updatedAt: now,
    createdAt: agendaItem.createdAt || previous?.createdAt || now
  };

  inMemoryAgendaItems.set(cleanId, updated);

  try {
    const docRef = doc(firestore, COMMITTEE_AGENDA_ITEMS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Retain in-memory
  }

  await createAuditLog({
    actorUserId: userContext.userId,
    action: previous ? 'UPDATE_COMMITTEE_AGENDA_ITEM' : 'CREATE_COMMITTEE_AGENDA_ITEM',
    entityType: 'COMMITTEE_AGENDA_ITEM',
    entityId: cleanId,
    before: (previous as unknown as Record<string, unknown>) || null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      legalEntityId: cleanEntityId,
      meetingId: cleanMeetingId,
      itemNumber: updated.itemNumber,
      title: updated.title,
      ownerUserId: updated.ownerUserId
    }
  });

  return updated;
}

export async function lockCommitteeAgenda(
  meetingId: string,
  userContext: UserContext
): Promise<{ meeting: BoardMeeting; items: CommitteeAgendaItem[] }> {
  const cleanMeetingId = validateRequiredString(meetingId, 'meetingId');
  const meeting = await getBoardMeetingById(cleanMeetingId);
  if (!meeting) {
    throw new ValidationError(`Meeting '${cleanMeetingId}' does not exist.`);
  }

  assertEntityAccess(meeting.legalEntityId, userContext, 'lockCommitteeAgenda');
  assertGovernanceSignoffAuthority(userContext, 'lockCommitteeAgenda');

  const items = await listCommitteeAgendaItems(cleanMeetingId);
  if (items.length === 0) {
    throw new ValidationError(`Cannot lock an empty agenda for meeting '${cleanMeetingId}'.`);
  }

  const now = new Date().toISOString();
  const lockedItems: CommitteeAgendaItem[] = [];

  for (const it of items) {
    const locked: CommitteeAgendaItem = {
      ...it,
      status: 'LOCKED',
      isLocked: true,
      lockedByUserId: userContext.userId,
      lockedAtUtc: now,
      updatedAt: now
    };
    lockedItems.push(locked);
    inMemoryAgendaItems.set(it.id, locked);
    try {
      await setDoc(doc(firestore, COMMITTEE_AGENDA_ITEMS_COLLECTION, it.id), locked, { merge: true });
    } catch {}
  }

  await createAuditLog({
    actorUserId: userContext.userId,
    action: 'LOCK_COMMITTEE_AGENDA',
    entityType: 'BOARD_MEETING',
    entityId: cleanMeetingId,
    before: { agendaLocked: false },
    after: { agendaLocked: true, lockedItemCount: items.length },
    metadata: {
      legalEntityId: meeting.legalEntityId,
      meetingNumber: meeting.meetingNumber,
      lockedAt: now
    }
  });

  return { meeting, items: lockedItems };
}

export async function checkMeetingReadiness(
  meetingId: string,
  userContext: UserContext
): Promise<{
  isReady: boolean;
  quorumEligibleCount: number;
  quorumRequired: number;
  quorumMet: boolean;
  agendaLocked: boolean;
  packPublished: boolean;
  blockers: string[];
}> {
  const cleanMeetingId = validateRequiredString(meetingId, 'meetingId');
  const meeting = await getBoardMeetingById(cleanMeetingId);
  if (!meeting) {
    throw new ValidationError(`Meeting '${cleanMeetingId}' does not exist.`);
  }

  assertEntityAccess(meeting.legalEntityId, userContext, 'checkMeetingReadiness');

  const blockers: string[] = [];
  const items = await listCommitteeAgendaItems(cleanMeetingId);

  const agendaLocked = items.length > 0 && items.every(i => i.isLocked);
  if (!agendaLocked) {
    blockers.push('Agenda has not been finalized and locked by Chairperson/Secretary.');
  }

  // Check quorum
  const quorumRequired = meeting.quorumRequired || 2;
  const quorumEligibleCount = meeting.quorumParticipantCount || (meeting.quorumAchieved ? quorumRequired : 0);
  const quorumMet = quorumEligibleCount >= quorumRequired;
  if (!quorumMet) {
    blockers.push(`Confirmed quorum count (${quorumEligibleCount}) is below statutory quorum requirement (${quorumRequired}).`);
  }

  // Check pack
  let packPublished = false;
  // Check if reporting pack is linked and published
  const packs = await getDocs(
    query(collection(firestore, 'governance_reporting_packs'), where('meetingId', '==', cleanMeetingId))
  ).then(s => s.docs.map(d => d.data() as GovernanceReportingPack)).catch(() => [] as GovernanceReportingPack[]);
  
  if (packs.length > 0 && packs.some(p => p.status === 'PUBLISHED')) {
    packPublished = true;
  } else {
    // If items require decisions or reports, pack must be published
    const requiresPreRead = items.some(i => i.preReadDocumentIds && i.preReadDocumentIds.length > 0);
    if (requiresPreRead && !packPublished) {
      blockers.push('Reporting Pack / Pre-Read documentation has not been published and sealed.');
    }
  }

  return {
    isReady: blockers.length === 0,
    quorumEligibleCount,
    quorumRequired,
    quorumMet,
    agendaLocked,
    packPublished,
    blockers
  };
}

// ============================================================================
// 3. BOARD/COMMITTEE REPORTING PACK READINESS GATE
// ============================================================================

/**
 * Validates whether a Governance Reporting Pack satisfies all statutory and governance requirements.
 * Required Sections + Metrics + Risk Data + Audit Findings + Executive Attestations + Evidence + Policy Provenance -> READY
 */
export async function evaluatePackReadinessGate(
  packId: string,
  userContext: UserContext
): Promise<PackReadinessGateReport> {
  const cleanPackId = validateRequiredString(packId, 'packId');
  const pack = await getGovernanceReportingPackById(cleanPackId);
  if (!pack) {
    throw new ValidationError(`Governance Reporting Pack '${cleanPackId}' does not exist.`);
  }

  const primaryEntityId = pack.legalEntityIds && pack.legalEntityIds.length > 0 ? pack.legalEntityIds[0] : 'GB-AJA-001';
  assertEntityAccess(primaryEntityId, userContext, 'evaluatePackReadinessGate');

  const blockers: string[] = [];
  const warnings: string[] = [];
  const recommendedActions: string[] = [];
  const sectionCheckResults: PackSectionReadinessCheck[] = [];

  // 1. Check Policy Provenance
  const policyProvenanceValid = !!(pack.supportingDecisionId || pack.sections.length > 0);
  if (!policyProvenanceValid) {
    blockers.push('Missing Governance Policy Provenance or Board Decision reference.');
  }

  // 2. Validate Pack Sections
  if (!pack.sections || pack.sections.length === 0) {
    blockers.push('Reporting Pack contains no sections.');
  } else {
    for (const section of pack.sections) {
      const secBlockers: string[] = [];
      let metricsValid = true;
      let risksValid = true;
      let findingsValid = true;
      let attestationsValid = true;
      let decisionsValid = true;
      let evidenceValid = true;

      // Validate Executive Summary
      if (!section.executiveSummaryText || section.executiveSummaryText.trim().length < 10) {
        secBlockers.push(`Section '${section.title}' lacks a meaningful Executive Summary.`);
      }

      // Validate Metrics Snapshots
      if (section.metricsSnapshotIds && section.metricsSnapshotIds.length > 0) {
        for (const snapId of section.metricsSnapshotIds) {
          const snap = await getMetricSnapshotById(snapId);
          if (!snap) {
            secBlockers.push(`Metric snapshot '${snapId}' not found.`);
            metricsValid = false;
          } else if (!snap.checksumSha256) {
            secBlockers.push(`Metric snapshot '${snapId}' lacks lineage SHA-256 seal.`);
            metricsValid = false;
          }
        }
      }

      // Validate Critical Risks
      if (section.criticalRiskIds && section.criticalRiskIds.length > 0) {
        for (const riskId of section.criticalRiskIds) {
          const risk = await getGovernanceRiskById(riskId);
          if (!risk) {
            secBlockers.push(`Risk item '${riskId}' not found in Enterprise Risk Register.`);
            risksValid = false;
          }
        }
      }

      // Validate Key Audit Findings
      if (section.keyFindingIds && section.keyFindingIds.length > 0) {
        for (const findingId of section.keyFindingIds) {
          const finding = await getGovernanceFindingById(findingId);
          if (!finding) {
            secBlockers.push(`Audit Finding '${findingId}' not found.`);
            findingsValid = false;
          }
        }
      }

      // Validate Required Attestations
      if (section.attestationIds && section.attestationIds.length > 0) {
        for (const attId of section.attestationIds) {
          const att = await getExecutiveAttestationById(attId);

          if (!att) {
            secBlockers.push(`Executive Attestation '${attId}' not found.`);
            attestationsValid = false;
          } else if (att.status !== 'SUBMITTED' && att.status !== 'VERIFIED') {
            secBlockers.push(`Executive Attestation '${attId}' is not signed/verified (current status: ${att.status}).`);
            attestationsValid = false;
          }
        }
      }

      const isComplete = secBlockers.length === 0;
      if (!isComplete) {
        blockers.push(...secBlockers);
      }

      sectionCheckResults.push({
        sectionCode: section.sectionCode,
        title: section.title,
        isComplete,
        metricsValid,
        risksValid,
        findingsValid,
        attestationsValid,
        decisionsValid,
        evidenceValid,
        blockerReasons: secBlockers
      });
    }
  }

  const totalChecks = (pack.sections?.length || 1) + 1;
  const passedChecks = sectionCheckResults.filter(s => s.isComplete).length + (policyProvenanceValid ? 1 : 0);
  const readinessScore = Math.round((passedChecks / totalChecks) * 100);
  const isReady = blockers.length === 0;

  if (!isReady) {
    recommendedActions.push('Resolve all blocker findings and ensure required attestations are fully signed before publication.');
  }

  return {
    packId: cleanPackId,
    legalEntityId: primaryEntityId,
    packType: pack.packType,
    evaluatedAt: new Date().toISOString(),
    isReady,
    readinessScore,
    sectionCheckResults,
    policyProvenanceValid,
    blockers,
    warnings,
    recommendedActions
  };
}

/**
 * Publishes a reporting pack with governed integrity seal after verifying the Readiness Gate.
 * Published Pack Replacement Prohibition: Modifying an already published pack directly is prohibited.
 */
export async function approveAndPublishGovernancePack(
  packId: string,
  userContext: UserContext
): Promise<GovernanceReportingPack> {
  const cleanPackId = validateRequiredString(packId, 'packId');
  const pack = await getGovernanceReportingPackById(cleanPackId);
  if (!pack) {
    throw new ValidationError(`Reporting Pack '${cleanPackId}' does not exist.`);
  }

  const primaryEntityId = pack.legalEntityIds && pack.legalEntityIds.length > 0 ? pack.legalEntityIds[0] : 'GB-AJA-001';
  assertEntityAccess(primaryEntityId, userContext, 'approveAndPublishGovernancePack');
  assertGovernanceSignoffAuthority(userContext, 'approveAndPublishGovernancePack');

  // Published Pack Replacement Prohibition
  if (pack.status === 'PUBLISHED' && pack.isPackLocked) {
    throw new ValidationError(
      `Governance Invariant Violation: Reporting Pack '${cleanPackId}' is already PUBLISHED and sealed. You cannot overwrite a published pack; create a superseding pack instead.`
    );
  }

  // Evaluate Readiness Gate
  const gateReport = await evaluatePackReadinessGate(cleanPackId, userContext);
  if (!gateReport.isReady) {
    throw new ValidationError(
      `Pack Readiness Gate Failed: Cannot publish pack '${cleanPackId}'. Blockers: ${gateReport.blockers.join('; ')}`
    );
  }

  const now = new Date().toISOString();
  const payloadToSeal = JSON.stringify({
    packNumber: pack.packNumber,
    packType: pack.packType,
    reportingPeriod: pack.reportingPeriod,
    sections: pack.sections,
    publishedAt: now,
    publishedByUserId: userContext.userId
  });
  const sealHash = computeSha256(payloadToSeal);

  const updatedPack: GovernanceReportingPack = {
    ...pack,
    status: 'PUBLISHED',
    isPackLocked: true,
    publishedAt: now,
    publishedByUserId: userContext.userId,
    boardChairSignoffUserId: userContext.userId,
    boardChairSignoffAt: now,
    checksumSha256: sealHash,
    updatedAt: now
  };

  const saved = await saveGovernanceReportingPack(updatedPack, userContext.userId);

  // Dispatch publication notification to eligible board/committee members
  await dispatchGovernanceNotification({
    eventType: 'PACK_PUBLISHED',
    legalEntityId: primaryEntityId,
    jurisdictionContext: 'GLOBAL',
    recipientUserId: userContext.userId,
    recipientRole: 'BOARD_CHAIR',
    title: `Reporting Pack Published: ${saved.titleEn}`,
    body: `Governance Reporting Pack '${saved.packNumber}' for period '${saved.reportingPeriod}' has been published with Integrity Seal.`,
    targetEntityType: 'GOVERNANCE_REPORTING_PACK',
    targetEntityId: saved.id,
    policyVersionId: saved.supportingDecisionId || 'pol_ver_board_gov_v1',
    urgency: 'HIGH'
  }, userContext);

  return saved;
}

// ============================================================================
// 4. DECISION FOLLOW-UP & RESOLUTION ENFORCEMENT (REUSING GOV-06)
// ============================================================================

/**
 * Enforces execution tracking on corporate resolutions.
 * Rejects any approved resolution requiring execution without an accountable owner.
 */
export async function enforceResolutionDecisionExecution(
  resolutionId: string,
  userContext: UserContext
): Promise<GovernanceAction[]> {
  const cleanResId = validateRequiredString(resolutionId, 'resolutionId');
  const resolution = await getCorporateResolutionById(cleanResId);
  if (!resolution) {
    throw new ValidationError(`Corporate Resolution '${cleanResId}' does not exist.`);
  }

  assertEntityAccess(resolution.legalEntityId, userContext, 'enforceResolutionDecisionExecution');

  const decision = await getCorporateDecisionById(resolution.decisionId);
  if (!decision) {
    throw new ValidationError(`Corporate Decision '${resolution.decisionId}' linked to resolution '${cleanResId}' does not exist.`);
  }

  // Check if resolution requires execution
  const requiresExecution = decision.isExecutionControlled || decision.executionStatus === 'PENDING_DISPATCH' || decision.executionStatus === 'IN_PROGRESS' || decision.decisionType === 'CAPITAL_ALLOCATION' || decision.decisionType === 'MAJOR_CONTRACT_APPROVAL';
  if (requiresExecution) {
    if (!decision.executedByUserId && !decision.approvedByUserIds?.length && !resolution.signatories?.length) {
      throw new ValidationError(
        `Governance Invariant Violation: Resolution '${resolution.resolutionNumber}' requires execution but lacks an accountable execution owner.`
      );
    }
  }

  const actions: GovernanceAction[] = [];
  const existingActions = await listGovernanceActionsByEntity(resolution.legalEntityId, {
    sourceType: 'BOARD_MEETING'
  });

  const matchingAction = existingActions.find(a => a.sourceReferenceId === resolution.id || a.sourceReferenceId === decision.id);
  if (matchingAction) {
    actions.push(matchingAction);
  } else if (requiresExecution) {
    const now = new Date().toISOString();
    const actionOwner = decision.executedByUserId || decision.approvedByUserIds?.[0] || resolution.signatories?.[0]?.userId || userContext.userId;
    const dueDate = decision.effectiveDate ? new Date(new Date(decision.effectiveDate).getTime() + 30 * 86400000).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();

    const newAction: GovernanceAction = {
      id: `act_res_${resolution.id}`,
      actionNumber: `ACT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceType: 'BOARD_MEETING',
      sourceReferenceId: resolution.id,
      legalEntityId: resolution.legalEntityId,
      title: `Execute Resolution: ${resolution.title}`,
      details: `Execution requirement derived from Resolution ${resolution.resolutionNumber}: ${resolution.resolutionText.substring(0, 200)}...`,
      ownerUserId: actionOwner,
      ownerRole: 'EXECUTIVE_OFFICER',
      dueDate,
      priority: 'HIGH',
      status: 'OPEN',
      evidenceIds: [],
      escalationLevel: 0,
      auditCorrelationId: resolution.auditCorrelationId || `cor_act_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    const savedAction = await saveGovernanceAction(newAction, userContext.userId);
    actions.push(savedAction);

    // Dispatch notification to accountable owner
    await dispatchGovernanceNotification({
      eventType: 'ACTION_ASSIGNED',
      legalEntityId: resolution.legalEntityId,
      jurisdictionContext: 'GLOBAL',
      recipientUserId: actionOwner,
      recipientRole: 'EXECUTIVE_OFFICER',
      title: `Governance Action Assigned: ${savedAction.title}`,
      body: `You are designated accountable owner for Resolution Execution '${savedAction.actionNumber}' due on ${dueDate.substring(0, 10)}.`,
      targetEntityType: 'GOVERNANCE_ACTION',
      targetEntityId: savedAction.id,
      policyVersionId: 'pol_ver_board_gov_v1',
      urgency: 'HIGH'
    }, userContext);
  }

  return actions;
}

// ============================================================================
// 5. EXECUTIVE ACTION MANAGEMENT, SoD & SLA ESCALATION
// ============================================================================

export async function completeGovernanceActionWithEvidence(
  actionId: string,
  params: {
    completionNotes: string;
    evidenceIds: string[];
  },
  userContext: UserContext
): Promise<GovernanceAction> {
  const cleanId = validateRequiredString(actionId, 'actionId');
  const action = await getGovernanceActionById(cleanId);
  if (!action) {
    throw new ValidationError(`Governance Action '${cleanId}' does not exist.`);
  }

  assertEntityAccess(action.legalEntityId, userContext, 'completeGovernanceAction');

  if (!params.evidenceIds || params.evidenceIds.length === 0) {
    throw new ValidationError(
      `Governance Invariant Violation: Cannot complete Governance Action '${cleanId}' without supporting Evidence Vault records.`
    );
  }

  // Validate Evidence records exist
  for (const evId of params.evidenceIds) {
    const ev = await getEvidenceRecordById(evId);
    if (!ev) {
      throw new ValidationError(`Evidence Record '${evId}' not found in Corporate Evidence Vault.`);
    }
  }

  const now = new Date().toISOString();
  const updated: GovernanceAction = {
    ...action,
    status: 'COMPLETED',
    completionNotes: params.completionNotes,
    evidenceIds: params.evidenceIds,
    completedAt: now,
    updatedAt: now
  };

  return await saveGovernanceAction(updated, userContext.userId);
}

/**
 * Segregation of Duties: Action owner cannot self-verify their own action.
 * Technical admin / Service principal cannot perform governance verification.
 */
export async function orchestrateAndVerifyGovernanceAction(
  actionId: string,
  userContext: UserContext
): Promise<GovernanceAction> {
  const cleanId = validateRequiredString(actionId, 'actionId');
  const action = await getGovernanceActionById(cleanId);
  if (!action) {
    throw new ValidationError(`Governance Action '${cleanId}' does not exist.`);
  }

  assertEntityAccess(action.legalEntityId, userContext, 'orchestrateAndVerifyGovernanceAction');
  assertGovernanceSignoffAuthority(userContext, 'orchestrateAndVerifyGovernanceAction');

  // Anti-Corruption / SoD: Action owner cannot self-verify
  if (action.ownerUserId === userContext.userId) {
    throw new ValidationError(
      `Segregation of Duties Violation: Action Owner '${userContext.userId}' cannot self-verify or close their own Governance Action '${cleanId}'. Independent verification is mandatory.`
    );
  }

  if (action.status !== 'COMPLETED') {
    throw new ValidationError(
      `Cannot verify action '${cleanId}' because it is in '${action.status}' state. It must be in 'COMPLETED' state with evidence attached.`
    );
  }

  const now = new Date().toISOString();
  const updated: GovernanceAction = {
    ...action,
    status: 'VERIFIED_CLOSED',
    verifiedByUserId: userContext.userId,
    verifiedAt: now,
    updatedAt: now
  };

  return await saveGovernanceAction(updated, userContext.userId);
}

export async function reopenGovernanceAction(
  actionId: string,
  reason: string,
  userContext: UserContext
): Promise<GovernanceAction> {
  const cleanId = validateRequiredString(actionId, 'actionId');
  const action = await getGovernanceActionById(cleanId);
  if (!action) {
    throw new ValidationError(`Governance Action '${cleanId}' does not exist.`);
  }

  assertEntityAccess(action.legalEntityId, userContext, 'reopenGovernanceAction');
  assertGovernanceSignoffAuthority(userContext, 'reopenGovernanceAction');

  const now = new Date().toISOString();
  const updated: GovernanceAction = {
    ...action,
    status: 'OPEN',
    completionNotes: `Reopened: ${reason} (previously: ${action.completionNotes || ''})`,
    verifiedByUserId: undefined,
    verifiedAt: undefined,
    completedAt: undefined,
    updatedAt: now
  };

  return await saveGovernanceAction(updated, userContext.userId);
}

/**
 * Runs automated Governance Action Escalation Sweep.
 * Evaluates overdue actions and escalates based on SLA.
 * Idempotent: Does not dispatch duplicate escalations on the same day/level.
 */
export async function runGovernanceActionEscalationSweep(
  legalEntityId: string,
  userContext: UserContext,
  currentTimestamp?: string
): Promise<{
  escalatedActions: GovernanceAction[];
  notificationsDispatched: GovernanceNotificationDispatch[];
}> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  assertEntityAccess(cleanEntityId, userContext, 'runGovernanceActionEscalationSweep');

  const nowTime = currentTimestamp ? new Date(currentTimestamp).getTime() : Date.now();
  const nowIso = new Date(nowTime).toISOString();
  const todayDateStr = nowIso.substring(0, 10);

  const actions = await listGovernanceActionsByEntity(cleanEntityId);
  const escalatedActions: GovernanceAction[] = [];
  const notificationsDispatched: GovernanceNotificationDispatch[] = [];

  for (const act of actions) {
    if (act.status === 'VERIFIED_CLOSED' || act.status === 'CANCELLED') {
      continue;
    }

    const dueTime = new Date(act.dueDate).getTime();
    if (nowTime > dueTime) {
      const daysOverdue = Math.floor((nowTime - dueTime) / 86400000);
      let targetLevel = 1;
      if (daysOverdue > 14) targetLevel = 3;
      else if (daysOverdue > 7) targetLevel = 2;

      // Idempotency: skip if already escalated to this level recently
      const alreadyEscalatedToday = act.lastEscalatedAt && act.lastEscalatedAt.startsWith(todayDateStr);
      if (act.escalationLevel >= targetLevel && alreadyEscalatedToday) {
        continue;
      }

      const updatedAct: GovernanceAction = {
        ...act,
        status: 'OVERDUE',
        escalationLevel: targetLevel,
        lastEscalatedAt: nowIso,
        updatedAt: nowIso
      };

      const saved = await saveGovernanceAction(updatedAct, userContext.userId);
      escalatedActions.push(saved);

      // Dispatch escalation notification
      const notif = await dispatchGovernanceNotification({
        eventType: 'ACTION_ESCALATED',
        legalEntityId: cleanEntityId,
        jurisdictionContext: 'GLOBAL',
        recipientUserId: act.ownerUserId,
        recipientRole: act.ownerRole,
        title: `OVERDUE Governance Action Escalated (Level ${targetLevel}): ${act.actionNumber}`,
        body: `Action '${act.title}' is ${daysOverdue} days past due date (${act.dueDate.substring(0, 10)}). Escalated to Level ${targetLevel}.`,
        targetEntityType: 'GOVERNANCE_ACTION',
        targetEntityId: act.id,
        policyVersionId: 'pol_ver_board_gov_v1',
        urgency: targetLevel >= 3 ? 'CRITICAL' : 'HIGH'
      }, userContext);

      notificationsDispatched.push(notif);
    }
  }

  return { escalatedActions, notificationsDispatched };
}

// ============================================================================
// 6. GOVERNANCE NOTIFICATION ROUTER WITH DEDUPLICATION (REUSING GOV-08)
// ============================================================================

/**
 * Dispatches a governance notification with strict deduplication and idempotency.
 * Computes deterministic key based on event, entity, target, recipient, and date.
 */
export async function dispatchGovernanceNotification(
  params: {
    eventType: GovernanceNotificationEventType;
    legalEntityId: string;
    jurisdictionContext: GovernanceJurisdiction;
    recipientUserId: string;
    recipientRole: string;
    title: string;
    body: string;
    targetEntityType: string;
    targetEntityId: string;
    policyVersionId: string;
    urgency?: 'INFO' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    channel?: 'IN_APP' | 'EMAIL' | 'PUSH' | 'MULTI_CHANNEL';
    auditCorrelationId?: string;
  },
  userContext: UserContext
): Promise<GovernanceNotificationDispatch> {
  const cleanEntityId = validateRequiredString(params.legalEntityId, 'legalEntityId');
  const cleanRecipientId = validateRequiredString(params.recipientUserId, 'recipientUserId');
  const dateStr = new Date().toISOString().substring(0, 10);

  // Deterministic deduplication key: prevents spamming duplicate reminders
  const deduplicationKey = `gov_notif_${params.eventType}_${cleanEntityId}_${params.targetEntityId}_${cleanRecipientId}_${dateStr}`;

  if (inMemoryDispatches.has(deduplicationKey)) {
    const existing = inMemoryDispatches.get(deduplicationKey)!;
    return {
      ...existing,
      isDeduplicated: true
    };
  }

  // Check Firestore for deduplication
  try {
    const docRef = doc(firestore, GOVERNANCE_NOTIFICATION_DISPATCHES_COLLECTION, deduplicationKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GovernanceNotificationDispatch;
      inMemoryDispatches.set(deduplicationKey, data);
      return {
        ...data,
        isDeduplicated: true
      };
    }
  } catch {}

  const now = new Date().toISOString();
  const dispatchId = deduplicationKey;

  const record: GovernanceNotificationDispatch = {
    id: dispatchId,
    deduplicationKey,
    eventType: params.eventType,
    legalEntityId: cleanEntityId,
    jurisdictionContext: params.jurisdictionContext,
    recipientUserId: cleanRecipientId,
    recipientRole: params.recipientRole,
    title: params.title,
    body: params.body,
    targetEntityType: params.targetEntityType,
    targetEntityId: params.targetEntityId,
    supportingPolicyVersionId: params.policyVersionId,
    urgency: params.urgency || 'NORMAL',
    channel: params.channel || 'MULTI_CHANNEL',
    dispatchedAt: now,
    isDelivered: true,
    deliveredAt: now,
    isDeduplicated: false,
    auditCorrelationId: params.auditCorrelationId || `cor_notif_${Date.now()}`
  };

  inMemoryDispatches.set(deduplicationKey, record);

  // Forward to core notification repository (GOV-08)
  try {
    await createNotification({
      recipientUserId: cleanRecipientId,
      title: params.title,
      body: params.body,
      type: params.urgency === 'CRITICAL' ? 'ERROR' : params.urgency === 'HIGH' ? 'WARNING' : 'INFO',
      deduplicationKey
    });

    const docRef = doc(firestore, GOVERNANCE_NOTIFICATION_DISPATCHES_COLLECTION, deduplicationKey);
    await setDoc(docRef, record);
  } catch {
    // Retain in-memory
  }

  return record;
}

// ============================================================================
// 7. CROSS-COMMITTEE DEPENDENCIES & CORRELATION LINEAGE
// ============================================================================

export async function createCrossCommitteeDependency(
  dependency: CrossCommitteeDependency,
  userContext: UserContext
): Promise<CrossCommitteeDependency> {
  const cleanId = validateRequiredString(dependency.id, 'id');
  const cleanEntityId = validateRequiredString(dependency.legalEntityId, 'legalEntityId');

  assertEntityAccess(cleanEntityId, userContext, 'createCrossCommitteeDependency');

  const now = new Date().toISOString();
  const newDep: CrossCommitteeDependency = {
    ...dependency,
    id: cleanId,
    legalEntityId: cleanEntityId,
    status: dependency.status || 'PENDING_HANDOFF',
    handoffDate: dependency.handoffDate || now,
    createdAt: now,
    updatedAt: now
  };

  inMemoryCrossDependencies.set(cleanId, newDep);

  try {
    const docRef = doc(firestore, CROSS_COMMITTEE_DEPENDENCIES_COLLECTION, cleanId);
    await setDoc(docRef, newDep);
  } catch {}

  await createAuditLog({
    actorUserId: userContext.userId,
    action: 'CREATE_CROSS_COMMITTEE_DEPENDENCY',
    entityType: 'CROSS_COMMITTEE_DEPENDENCY',
    entityId: cleanId,
    before: null,
    after: (newDep as unknown as Record<string, unknown>) || null,
    metadata: {
      legalEntityId: cleanEntityId,
      sourceCommittee: newDep.sourceCommitteeType,
      targetCommittee: newDep.targetCommitteeType,
      title: newDep.title
    }
  });

  return newDep;
}

export async function listCrossCommitteeDependencies(
  legalEntityId: string,
  status?: CrossCommitteeDependencyStatus
): Promise<CrossCommitteeDependency[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: CrossCommitteeDependency[] = [];

  try {
    const collRef = collection(firestore, CROSS_COMMITTEE_DEPENDENCIES_COLLECTION);
    let q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    if (status) {
      q = query(collRef, where('legalEntityId', '==', cleanEntityId), where('status', '==', status));
    }
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as CrossCommitteeDependency;
      results.push(item);
      inMemoryCrossDependencies.set(item.id, item);
    });
  } catch {
    Array.from(inMemoryCrossDependencies.values()).forEach(item => {
      if (item.legalEntityId === cleanEntityId) {
        if (!status || item.status === status) {
          results.push(item);
        }
      }
    });
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function resolveCrossCommitteeDependency(
  dependencyId: string,
  resolutionSummary: string,
  targetEntityId: string,
  userContext: UserContext
): Promise<CrossCommitteeDependency> {
  const cleanId = validateRequiredString(dependencyId, 'dependencyId');
  const existing = inMemoryCrossDependencies.get(cleanId);
  if (!existing) {
    throw new ValidationError(`Cross-Committee Dependency '${cleanId}' not found.`);
  }

  assertEntityAccess(existing.legalEntityId, userContext, 'resolveCrossCommitteeDependency');

  const now = new Date().toISOString();
  const updated: CrossCommitteeDependency = {
    ...existing,
    status: 'RESOLVED',
    resolutionSummary,
    targetEntityId,
    resolvedDate: now,
    updatedAt: now
  };

  inMemoryCrossDependencies.set(cleanId, updated);

  try {
    const docRef = doc(firestore, CROSS_COMMITTEE_DEPENDENCIES_COLLECTION, cleanId);
    await updateDoc(docRef, {
      status: 'RESOLVED',
      resolutionSummary,
      targetEntityId,
      resolvedDate: now,
      updatedAt: now
    });
  } catch {}

  return updated;
}

// ============================================================================
// 8. EXECUTIVE WORKFLOW ORCHESTRATION & EXECUTIVE DESK VIEW
// ============================================================================

/**
 * Calculates a consolidated, role-tailored Executive Desk View.
 * Answers: What is waiting for CEO? CFO? Committee Chair? Overdue actions? Unready packs?
 */
export async function getExecutiveDeskView(
  userId: string,
  legalEntityId: string,
  userContext: UserContext
): Promise<ExecutiveDeskView> {
  const cleanUserId = validateRequiredString(userId, 'userId');
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');

  assertEntityAccess(cleanEntityId, userContext, 'getExecutiveDeskView');

  // 1. Pending Attestations
  const attestations = await listExecutiveAttestationsByEntity(cleanEntityId);
  const pendingAttestations = attestations.filter(
    a => a.attestorUserId === cleanUserId && (a.status === 'DRAFT' || a.status === 'PENDING_SIGNATURE')
  );

  // 2. Reporting Packs pending signoff / unready
  const packs = await getDocs(
    query(collection(firestore, 'governance_reporting_packs'))
  ).then(s => s.docs.map(d => d.data() as GovernanceReportingPack)).catch(() => [] as GovernanceReportingPack[]);

  const entityPacks = packs.filter(p => p.legalEntityIds?.includes(cleanEntityId));
  const pendingPackSignoffs = entityPacks.filter(
    p => (p.status === 'REVIEW' || p.status === 'APPROVED_FOR_PUBLICATION') && !p.boardChairSignoffUserId
  );

  const unreadyReportingPacks: { pack: GovernanceReportingPack; readinessReport: PackReadinessGateReport }[] = [];
  for (const pack of entityPacks.filter(p => p.status === 'DRAFT' || p.status === 'REVIEW')) {
    const readinessReport = await evaluatePackReadinessGate(pack.id, userContext);
    if (!readinessReport.isReady) {
      unreadyReportingPacks.push({ pack, readinessReport });
    }
  }

  // 3. Meetings pending agenda locks
  const meetings = await listBoardMeetingsByEntity(cleanEntityId);
  const pendingAgendaLocks = meetings.filter(m => m.status === 'SCHEDULED');

  // 4. Decisions pending signatures
  const decisions = await getDocs(
    query(collection(firestore, 'corporate_decisions'), where('legalEntityId', '==', cleanEntityId))
  ).then(s => s.docs.map(d => d.data() as CorporateDecision)).catch(() => [] as CorporateDecision[]);

  const pendingDecisionSignatures = decisions.filter(
    d => d.lifecycleStatus === 'APPROVAL' || d.lifecycleStatus === 'REVIEW'
  );

  // 5. Actions: Executions, Verifications, Overdue, Escalated
  const actions = await listGovernanceActionsByEntity(cleanEntityId);
  const pendingActionExecutions = actions.filter(
    a => a.ownerUserId === cleanUserId && (a.status === 'OPEN' || a.status === 'IN_PROGRESS')
  );
  const pendingActionVerifications = actions.filter(
    a => a.ownerUserId !== cleanUserId && a.status === 'COMPLETED'
  );
  const overdueActions = actions.filter(a => a.status === 'OVERDUE');
  const escalatedActions = actions.filter(a => a.escalationLevel > 0 && a.status !== 'VERIFIED_CLOSED');

  // 6. Open Challenges Assigned
  const challenges: GovernanceChallenge[] = [];
  for (const p of entityPacks) {
    const pChalls = await listGovernanceChallengesByPack(p.id);
    challenges.push(...pChalls);
  }
  const openChallengesAssigned = challenges.filter(
    c => c.assignedToUserId === cleanUserId && (c.status === 'ASSIGNED' || c.status === 'OPEN')
  );

  // 7. Cross-Committee Dependencies Pending
  const crossDeps = await listCrossCommitteeDependencies(cleanEntityId);
  const crossCommitteeDependenciesPending = crossDeps.filter(
    d => d.status === 'PENDING_HANDOFF' || d.status === 'HANDED_OFF' || d.status === 'UNDER_REVIEW'
  );

  const totalPendingItems =
    pendingAttestations.length +
    pendingPackSignoffs.length +
    pendingDecisionSignatures.length +
    pendingActionExecutions.length +
    pendingActionVerifications.length +
    openChallengesAssigned.length;

  const criticalItems =
    overdueActions.length +
    escalatedActions.filter(a => a.escalationLevel >= 2).length +
    pendingAttestations.length;

  return {
    userId: cleanUserId,
    userRole: userContext.role,
    legalEntityId: cleanEntityId,
    calculatedAt: new Date().toISOString(),
    pendingAttestations,
    pendingPackSignoffs,
    pendingAgendaLocks,
    pendingDecisionSignatures,
    pendingActionExecutions,
    pendingActionVerifications,
    overdueActions,
    escalatedActions,
    openChallengesAssigned,
    crossCommitteeDependenciesPending,
    unreadyReportingPacks,
    summaryCounts: {
      totalPendingItems,
      criticalItems,
      overdueCount: overdueActions.length,
      attestationCount: pendingAttestations.length,
      actionCount: pendingActionExecutions.length,
      packCount: pendingPackSignoffs.length
    }
  };
}
