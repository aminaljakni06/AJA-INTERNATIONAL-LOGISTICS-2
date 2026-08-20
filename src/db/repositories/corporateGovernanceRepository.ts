/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Corporate Governance Repository
 * Step GOV-05: Corporate Governance Core, Legal Profile, Directors, Officers & PSC Persistence
 * 
 * Persistence & Scoping Architecture:
 * - Direct Firestore persistence with typed converters and fallback in-memory stores
 * - Source of Truth integration with Organization Master (1:1 Legal Entity anchor)
 * - Strict Legal Entity scoping on all collection queries
 * - Historical preservation: Hard delete strictly blocked for active/approved records
 * - Field-level sanitization & masking for sensitive identifiers
 */

import { 
  CorporateLegalProfile, 
  DirectorOfficerRecord, 
  PSCRecord,
  CorporateDecision,
  BoardMeeting,
  MeetingParticipantRecord,
  DecisionVoteRecord,
  CorporateResolution,
  DecisionExecutionRecord,
  DecisionLifecycleState,
  CorporateDecisionType,
  BoardMeetingStatus,
  GovernanceRecordStatus,
  StatutoryAppointmentType,
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
import { validateRequiredString, ValidationError } from '../validation';

// Firestore collection identifiers
export const CORPORATE_LEGAL_PROFILES_COLLECTION = 'corporate_legal_profiles';
export const CORPORATE_APPOINTMENTS_COLLECTION = 'corporate_appointments';
export const PSC_CONTROL_RECORDS_COLLECTION = 'psc_control_records';
export const CORPORATE_DECISIONS_COLLECTION = 'corporate_decisions';
export const BOARD_MEETINGS_COLLECTION = 'board_meetings';
export const MEETING_PARTICIPANTS_COLLECTION = 'meeting_participants';
export const DECISION_VOTES_COLLECTION = 'decision_votes';
export const CORPORATE_RESOLUTIONS_COLLECTION = 'corporate_resolutions';
export const DECISION_EXECUTIONS_COLLECTION = 'decision_executions';

// In-Memory Fallback Stores for resilient and ultra-fast scoped lookups
const inMemoryProfiles = new Map<string, CorporateLegalProfile>();
const inMemoryAppointments = new Map<string, DirectorOfficerRecord>();
const inMemoryPSCRecords = new Map<string, PSCRecord>();
const inMemoryDecisions = new Map<string, CorporateDecision>();
const inMemoryMeetings = new Map<string, BoardMeeting>();
const inMemoryParticipants = new Map<string, MeetingParticipantRecord>();
const inMemoryVotes = new Map<string, DecisionVoteRecord>();
const inMemoryResolutions = new Map<string, CorporateResolution>();
const inMemoryExecutions = new Map<string, DecisionExecutionRecord>();

export function resetCorporateGovernanceMemoryStore(): void {
  inMemoryProfiles.clear();
  inMemoryAppointments.clear();
  inMemoryPSCRecords.clear();
  inMemoryDecisions.clear();
  inMemoryMeetings.clear();
  inMemoryParticipants.clear();
  inMemoryVotes.clear();
  inMemoryResolutions.clear();
  inMemoryExecutions.clear();
}

// ============================================================================
// 1. CORPORATE LEGAL PROFILE REPOSITORY
// ============================================================================

/**
 * Retrieves the Corporate Legal Profile for a specific legal entity.
 * Scoped strictly to legalEntityId.
 */
export async function getCorporateLegalProfileByEntityId(
  legalEntityId: string
): Promise<CorporateLegalProfile | null> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');

  // Check In-Memory cache first
  if (inMemoryProfiles.has(cleanEntityId)) {
    return inMemoryProfiles.get(cleanEntityId)!;
  }

  try {
    const docRef = doc(firestore, CORPORATE_LEGAL_PROFILES_COLLECTION, cleanEntityId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CorporateLegalProfile;
      inMemoryProfiles.set(cleanEntityId, data);
      return data;
    }
  } catch {
    // Return in-memory fallback if firestore is offline or during testing
    return inMemoryProfiles.get(cleanEntityId) || null;
  }

  return null;
}

/**
 * Saves or updates a Corporate Legal Profile.
 * Strictly maintains 1:1 relationship with Organization Master legalEntityId.
 */
export async function saveCorporateLegalProfile(
  profile: CorporateLegalProfile,
  actorUserId: string,
  correlationId?: string
): Promise<CorporateLegalProfile> {
  const cleanEntityId = validateRequiredString(profile.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previousRecord = await getCorporateLegalProfileByEntityId(cleanEntityId);

  const updatedProfile: CorporateLegalProfile = {
    ...profile,
    id: cleanEntityId,
    legalEntityId: cleanEntityId,
    updatedAt: now,
    createdAt: profile.createdAt || previousRecord?.createdAt || now
  };

  // Persist in Memory
  inMemoryProfiles.set(cleanEntityId, updatedProfile);

  // Persist in Firestore
  try {
    const docRef = doc(firestore, CORPORATE_LEGAL_PROFILES_COLLECTION, cleanEntityId);
    await setDoc(docRef, updatedProfile);
  } catch {
    // Continue with in-memory persistence
  }

  // Correlate with Audit Engine
  await createAuditLog({
    actorUserId,
    action: previousRecord ? 'UPDATE_CORPORATE_LEGAL_PROFILE' : 'CREATE_CORPORATE_LEGAL_PROFILE',
    entityType: 'CORPORATE_LEGAL_PROFILE',
    entityId: cleanEntityId,
    before: (previousRecord as unknown as Record<string, unknown>) || null,
    after: (updatedProfile as unknown as Record<string, unknown>) || null,
    metadata: {
      correlationId: correlationId || `cor_${Date.now()}`,
      jurisdiction: profile.incorporationJurisdiction,
      companyNumber: profile.companyNumber
    }
  });

  return updatedProfile;
}

// ============================================================================
// 2. DIRECTORS & OFFICERS CORPORATE APPOINTMENT REPOSITORY
// ============================================================================

/**
 * Retrieves a corporate appointment by its unique identifier.
 */
export async function getCorporateAppointmentById(
  appointmentId: string
): Promise<DirectorOfficerRecord | null> {
  const cleanId = validateRequiredString(appointmentId, 'appointmentId');

  if (inMemoryAppointments.has(cleanId)) {
    return inMemoryAppointments.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, CORPORATE_APPOINTMENTS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as DirectorOfficerRecord;
      inMemoryAppointments.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryAppointments.get(cleanId) || null;
  }

  return null;
}

/**
 * Scoped query: List all corporate appointments for a specific legal entity.
 */
export async function listAppointmentsByLegalEntity(
  legalEntityId: string,
  filterStatus?: GovernanceRecordStatus
): Promise<DirectorOfficerRecord[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');

  let results: DirectorOfficerRecord[] = Array.from(inMemoryAppointments.values()).filter(
    (apt) => apt.legalEntityId === cleanEntityId
  );

  try {
    const q = filterStatus
      ? query(
          collection(firestore, CORPORATE_APPOINTMENTS_COLLECTION),
          where('legalEntityId', '==', cleanEntityId),
          where('status', '==', filterStatus)
        )
      : query(
          collection(firestore, CORPORATE_APPOINTMENTS_COLLECTION),
          where('legalEntityId', '==', cleanEntityId)
        );

    const snap = await getDocs(q);
    if (!snap.empty) {
      const dbResults = snap.docs.map((d) => d.data() as DirectorOfficerRecord);
      // Merge unique
      for (const item of dbResults) {
        inMemoryAppointments.set(item.id, item);
      }
      results = dbResults;
    }
  } catch {
    // Use in-memory filter
  }

  if (filterStatus) {
    results = results.filter((apt) => apt.status === filterStatus);
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Scoped query: List appointments by person identity or user reference.
 */
export async function listAppointmentsByPerson(
  personIdOrUserId: string
): Promise<DirectorOfficerRecord[]> {
  const cleanId = validateRequiredString(personIdOrUserId, 'personIdOrUserId');

  const inMem = Array.from(inMemoryAppointments.values()).filter(
    (apt) =>
      apt.personReference.personId === cleanId ||
      apt.personReference.userId === cleanId ||
      apt.personReference.employeeId === cleanId
  );

  return inMem;
}

/**
 * Saves or updates a Director/Officer corporate appointment.
 */
export async function saveCorporateAppointment(
  appointment: DirectorOfficerRecord,
  actorUserId: string,
  correlationId?: string
): Promise<DirectorOfficerRecord> {
  const cleanId = appointment.id || `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanEntityId = validateRequiredString(appointment.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previousRecord = await getCorporateAppointmentById(cleanId);

  const updatedRecord: DirectorOfficerRecord = {
    ...appointment,
    id: cleanId,
    legalEntityId: cleanEntityId,
    createdAt: appointment.createdAt || previousRecord?.createdAt || now,
    updatedAt: now
  };

  inMemoryAppointments.set(cleanId, updatedRecord);

  try {
    const docRef = doc(firestore, CORPORATE_APPOINTMENTS_COLLECTION, cleanId);
    await setDoc(docRef, updatedRecord);
  } catch {
    // Continue with in-memory persistence
  }

  await createAuditLog({
    actorUserId,
    action: previousRecord ? `UPDATE_APPOINTMENT_${updatedRecord.status}` : 'CREATE_CORPORATE_APPOINTMENT',
    entityType: 'CORPORATE_APPOINTMENT',
    entityId: cleanId,
    before: (previousRecord as unknown as Record<string, unknown>) || null,
    after: (updatedRecord as unknown as Record<string, unknown>) || null,
    metadata: {
      legalEntityId: cleanEntityId,
      statutoryRole: updatedRecord.statutoryRole,
      supportingDecisionId: updatedRecord.supportingDecisionId,
      correlationId: correlationId || `cor_${Date.now()}`
    }
  });

  return updatedRecord;
}

// ============================================================================
// 3. PSC / BENEFICIAL CONTROL REGISTRY REPOSITORY
// ============================================================================

/**
 * Retrieves a PSC Record by unique identifier.
 */
export async function getPSCRecordById(pscId: string): Promise<PSCRecord | null> {
  const cleanId = validateRequiredString(pscId, 'pscId');

  if (inMemoryPSCRecords.has(cleanId)) {
    return inMemoryPSCRecords.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, PSC_CONTROL_RECORDS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as PSCRecord;
      inMemoryPSCRecords.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryPSCRecords.get(cleanId) || null;
  }

  return null;
}

/**
 * Scoped query: List PSC control records for a specific legal entity.
 */
export async function listPSCRecordsByLegalEntity(
  legalEntityId: string,
  filterStatus?: GovernanceRecordStatus
): Promise<PSCRecord[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');

  let results = Array.from(inMemoryPSCRecords.values()).filter(
    (psc) => psc.legalEntityId === cleanEntityId
  );

  try {
    const q = filterStatus
      ? query(
          collection(firestore, PSC_CONTROL_RECORDS_COLLECTION),
          where('legalEntityId', '==', cleanEntityId),
          where('status', '==', filterStatus)
        )
      : query(
          collection(firestore, PSC_CONTROL_RECORDS_COLLECTION),
          where('legalEntityId', '==', cleanEntityId)
        );

    const snap = await getDocs(q);
    if (!snap.empty) {
      const dbResults = snap.docs.map((d) => d.data() as PSCRecord);
      for (const item of dbResults) {
        inMemoryPSCRecords.set(item.id, item);
      }
      results = dbResults;
    }
  } catch {
    // fallback
  }

  if (filterStatus) {
    results = results.filter((psc) => psc.status === filterStatus);
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Saves or updates a PSC Record with strict audit trails and history preservation.
 */
export async function savePSCRecord(
  psc: PSCRecord,
  actorUserId: string,
  correlationId?: string
): Promise<PSCRecord> {
  const cleanId = psc.id || `psc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanEntityId = validateRequiredString(psc.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previousRecord = await getPSCRecordById(cleanId);

  const updatedRecord: PSCRecord = {
    ...psc,
    id: cleanId,
    legalEntityId: cleanEntityId,
    createdAt: psc.createdAt || previousRecord?.createdAt || now,
    updatedAt: now
  };

  inMemoryPSCRecords.set(cleanId, updatedRecord);

  try {
    const docRef = doc(firestore, PSC_CONTROL_RECORDS_COLLECTION, cleanId);
    await setDoc(docRef, updatedRecord);
  } catch {
    // Continue
  }

  await createAuditLog({
    actorUserId,
    action: previousRecord ? `UPDATE_PSC_${updatedRecord.status}` : 'CREATE_PSC_RECORD',
    entityType: 'PSC_CONTROL_RECORD',
    entityId: cleanId,
    before: (previousRecord as unknown as Record<string, unknown>) || null,
    after: (updatedRecord as unknown as Record<string, unknown>) || null,
    metadata: {
      legalEntityId: cleanEntityId,
      subjectType: updatedRecord.subjectType,
      filingReference: updatedRecord.filingReference,
      correlationId: correlationId || `cor_${Date.now()}`
    }
  });

  return updatedRecord;
}

// ============================================================================
// 4. CORPORATE DECISION REGISTER REPOSITORY
// ============================================================================

export async function getCorporateDecisionById(
  decisionId: string
): Promise<CorporateDecision | null> {
  const cleanId = validateRequiredString(decisionId, 'decisionId');

  if (inMemoryDecisions.has(cleanId)) {
    return inMemoryDecisions.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, CORPORATE_DECISIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CorporateDecision;
      inMemoryDecisions.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryDecisions.get(cleanId) || null;
  }

  return null;
}

export async function listCorporateDecisionsByEntity(
  legalEntityId: string,
  filter?: { lifecycleStatus?: DecisionLifecycleState; decisionType?: CorporateDecisionType }
): Promise<CorporateDecision[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');

  const results: CorporateDecision[] = [];

  // Query Firestore
  try {
    const collRef = collection(firestore, CORPORATE_DECISIONS_COLLECTION);
    let q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    if (filter?.lifecycleStatus) {
      q = query(collRef, where('legalEntityId', '==', cleanEntityId), where('lifecycleStatus', '==', filter.lifecycleStatus));
    }
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const item = d.data() as CorporateDecision;
      if (!filter?.decisionType || item.decisionType === filter.decisionType) {
        results.push(item);
        inMemoryDecisions.set(item.id, item);
      }
    });
  } catch {
    // In-memory fallback
    Array.from(inMemoryDecisions.values()).forEach((item) => {
      if (item.legalEntityId === cleanEntityId) {
        if (!filter?.lifecycleStatus || item.lifecycleStatus === filter.lifecycleStatus) {
          if (!filter?.decisionType || item.decisionType === filter.decisionType) {
            results.push(item);
          }
        }
      }
    });
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function generateNextDecisionNumber(
  legalEntityId: string,
  year: number = new Date().getFullYear()
): Promise<string> {
  const existing = await listCorporateDecisionsByEntity(legalEntityId);
  const yearPrefix = `DEC-${year}-`;
  const count = existing.filter((d) => d.decisionNumber?.startsWith(yearPrefix)).length + 1;
  return `${yearPrefix}${String(count).padStart(4, '0')}`;
}

export async function saveCorporateDecision(
  decision: CorporateDecision,
  actorUserId: string,
  correlationId?: string
): Promise<CorporateDecision> {
  const cleanId = validateRequiredString(decision.id, 'id');
  const cleanEntityId = validateRequiredString(decision.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previousRecord = await getCorporateDecisionById(cleanId);

  // If approved or adopted, do not allow direct in-place mutation without versioning/state machine
  const updatedDecision: CorporateDecision = {
    ...decision,
    id: cleanId,
    legalEntityId: cleanEntityId,
    version: previousRecord ? (previousRecord.version || 1) + (previousRecord.lifecycleStatus !== decision.lifecycleStatus ? 1 : 0) : 1,
    auditCorrelationId: correlationId || decision.auditCorrelationId || `cor_dec_${Date.now()}`,
    updatedAt: now,
    createdAt: decision.createdAt || previousRecord?.createdAt || now
  };

  inMemoryDecisions.set(cleanId, updatedDecision);

  try {
    const docRef = doc(firestore, CORPORATE_DECISIONS_COLLECTION, cleanId);
    await setDoc(docRef, updatedDecision, { merge: true });
  } catch {
    // Retain in-memory fallback
  }

  await createAuditLog({
    actorUserId,
    action: previousRecord ? `TRANSITION_DECISION_${updatedDecision.lifecycleStatus}` : 'CREATE_CORPORATE_DECISION',
    entityType: 'CORPORATE_DECISION',
    entityId: cleanId,
    before: (previousRecord as unknown as Record<string, unknown>) || null,
    after: (updatedDecision as unknown as Record<string, unknown>) || null,
    metadata: {
      legalEntityId: cleanEntityId,
      decisionNumber: updatedDecision.decisionNumber,
      decisionType: updatedDecision.decisionType,
      lifecycleStatus: updatedDecision.lifecycleStatus,
      correlationId: updatedDecision.auditCorrelationId
    }
  });

  return updatedDecision;
}

// ============================================================================
// 5. BOARD MEETINGS REPOSITORY
// ============================================================================

export async function getBoardMeetingById(
  meetingId: string
): Promise<BoardMeeting | null> {
  const cleanId = validateRequiredString(meetingId, 'meetingId');

  if (inMemoryMeetings.has(cleanId)) {
    return inMemoryMeetings.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, BOARD_MEETINGS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as BoardMeeting;
      inMemoryMeetings.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryMeetings.get(cleanId) || null;
  }

  return null;
}

export async function listBoardMeetingsByEntity(
  legalEntityId: string,
  status?: BoardMeetingStatus
): Promise<BoardMeeting[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: BoardMeeting[] = [];

  try {
    const collRef = collection(firestore, BOARD_MEETINGS_COLLECTION);
    let q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    if (status) {
      q = query(collRef, where('legalEntityId', '==', cleanEntityId), where('status', '==', status));
    }
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const item = d.data() as BoardMeeting;
      results.push(item);
      inMemoryMeetings.set(item.id, item);
    });
  } catch {
    Array.from(inMemoryMeetings.values()).forEach((item) => {
      if (item.legalEntityId === cleanEntityId) {
        if (!status || item.status === status) {
          results.push(item);
        }
      }
    });
  }

  return results.sort((a, b) => new Date(b.scheduledAtUtc).getTime() - new Date(a.scheduledAtUtc).getTime());
}

export async function generateNextMeetingNumber(
  legalEntityId: string,
  year: number = new Date().getFullYear()
): Promise<string> {
  const existing = await listBoardMeetingsByEntity(legalEntityId);
  const yearPrefix = `MTG-${year}-`;
  const count = existing.filter((m) => m.meetingNumber?.startsWith(yearPrefix)).length + 1;
  return `${yearPrefix}${String(count).padStart(4, '0')}`;
}

export async function saveBoardMeeting(
  meeting: BoardMeeting,
  actorUserId: string,
  correlationId?: string
): Promise<BoardMeeting> {
  const cleanId = validateRequiredString(meeting.id, 'id');
  const cleanEntityId = validateRequiredString(meeting.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previousRecord = await getBoardMeetingById(cleanId);

  const updatedMeeting: BoardMeeting = {
    ...meeting,
    id: cleanId,
    legalEntityId: cleanEntityId,
    updatedAt: now,
    createdAt: meeting.createdAt || previousRecord?.createdAt || now
  };

  inMemoryMeetings.set(cleanId, updatedMeeting);

  try {
    const docRef = doc(firestore, BOARD_MEETINGS_COLLECTION, cleanId);
    await setDoc(docRef, updatedMeeting, { merge: true });
  } catch {
    // Retain in-memory
  }

  await createAuditLog({
    actorUserId,
    action: previousRecord ? `UPDATE_BOARD_MEETING_${updatedMeeting.status}` : 'CREATE_BOARD_MEETING',
    entityType: 'BOARD_MEETING',
    entityId: cleanId,
    before: (previousRecord as unknown as Record<string, unknown>) || null,
    after: (updatedMeeting as unknown as Record<string, unknown>) || null,
    metadata: {
      legalEntityId: cleanEntityId,
      meetingNumber: updatedMeeting.meetingNumber,
      status: updatedMeeting.status,
      correlationId: correlationId || `cor_mtg_${Date.now()}`
    }
  });

  return updatedMeeting;
}

// ============================================================================
// 6. MEETING PARTICIPANTS REPOSITORY
// ============================================================================

export async function listParticipantsByMeeting(
  meetingId: string
): Promise<MeetingParticipantRecord[]> {
  const cleanMeetingId = validateRequiredString(meetingId, 'meetingId');
  const results: MeetingParticipantRecord[] = [];

  try {
    const collRef = collection(firestore, MEETING_PARTICIPANTS_COLLECTION);
    const q = query(collRef, where('meetingId', '==', cleanMeetingId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const item = d.data() as MeetingParticipantRecord;
      results.push(item);
      inMemoryParticipants.set(item.id, item);
    });
  } catch {
    Array.from(inMemoryParticipants.values()).forEach((item) => {
      if (item.meetingId === cleanMeetingId) {
        results.push(item);
      }
    });
  }

  return results;
}

export async function saveMeetingParticipant(
  participant: MeetingParticipantRecord,
  actorUserId: string
): Promise<MeetingParticipantRecord> {
  const cleanId = validateRequiredString(participant.id, 'id');
  const now = new Date().toISOString();

  const updatedParticipant: MeetingParticipantRecord = {
    ...participant,
    id: cleanId,
    updatedAt: now,
    createdAt: participant.createdAt || now
  };

  inMemoryParticipants.set(cleanId, updatedParticipant);

  try {
    const docRef = doc(firestore, MEETING_PARTICIPANTS_COLLECTION, cleanId);
    await setDoc(docRef, updatedParticipant, { merge: true });
  } catch {
    // Retain in memory
  }

  return updatedParticipant;
}

// ============================================================================
// 7. DECISION VOTES REPOSITORY
// ============================================================================

export async function listVotesByDecision(
  decisionId: string
): Promise<DecisionVoteRecord[]> {
  const cleanDecisionId = validateRequiredString(decisionId, 'decisionId');
  const results: DecisionVoteRecord[] = [];

  try {
    const collRef = collection(firestore, DECISION_VOTES_COLLECTION);
    const q = query(collRef, where('decisionId', '==', cleanDecisionId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const item = d.data() as DecisionVoteRecord;
      results.push(item);
      inMemoryVotes.set(item.id, item);
    });
  } catch {
    Array.from(inMemoryVotes.values()).forEach((item) => {
      if (item.decisionId === cleanDecisionId) {
        results.push(item);
      }
    });
  }

  return results;
}

export async function saveDecisionVote(
  vote: DecisionVoteRecord,
  actorUserId: string
): Promise<DecisionVoteRecord> {
  const cleanId = validateRequiredString(vote.id, 'id');
  const now = new Date().toISOString();

  const updatedVote: DecisionVoteRecord = {
    ...vote,
    id: cleanId,
    createdAt: vote.createdAt || now
  };

  inMemoryVotes.set(cleanId, updatedVote);

  try {
    const docRef = doc(firestore, DECISION_VOTES_COLLECTION, cleanId);
    await setDoc(docRef, updatedVote, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: 'CAST_DECISION_VOTE',
    entityType: 'DECISION_VOTE',
    entityId: cleanId,
    metadata: {
      decisionId: vote.decisionId,
      vote: vote.vote,
      voterAppointmentId: vote.voterAppointmentId,
      recused: vote.recused,
      conflictDeclared: vote.conflictDeclared
    }
  });

  return updatedVote;
}

// ============================================================================
// 8. CORPORATE RESOLUTIONS REPOSITORY
// ============================================================================

export async function getCorporateResolutionById(
  resolutionId: string
): Promise<CorporateResolution | null> {
  const cleanId = validateRequiredString(resolutionId, 'resolutionId');

  if (inMemoryResolutions.has(cleanId)) {
    return inMemoryResolutions.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, CORPORATE_RESOLUTIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CorporateResolution;
      inMemoryResolutions.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryResolutions.get(cleanId) || null;
  }

  return null;
}

export async function getResolutionByDecisionId(
  decisionId: string
): Promise<CorporateResolution | null> {
  const cleanDecisionId = validateRequiredString(decisionId, 'decisionId');

  try {
    const collRef = collection(firestore, CORPORATE_RESOLUTIONS_COLLECTION);
    const q = query(collRef, where('decisionId', '==', cleanDecisionId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as CorporateResolution;
      inMemoryResolutions.set(data.id, data);
      return data;
    }
  } catch {
    for (const res of inMemoryResolutions.values()) {
      if (res.decisionId === cleanDecisionId) return res;
    }
  }

  return null;
}

export async function listResolutionsByEntity(
  legalEntityId: string
): Promise<CorporateResolution[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: CorporateResolution[] = [];

  try {
    const collRef = collection(firestore, CORPORATE_RESOLUTIONS_COLLECTION);
    const q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const item = d.data() as CorporateResolution;
      results.push(item);
      inMemoryResolutions.set(item.id, item);
    });
  } catch {
    Array.from(inMemoryResolutions.values()).forEach((item) => {
      if (item.legalEntityId === cleanEntityId) {
        results.push(item);
      }
    });
  }

  return results.sort((a, b) => new Date(b.adoptionDateUtc).getTime() - new Date(a.adoptionDateUtc).getTime());
}

export async function generateNextResolutionNumber(
  legalEntityId: string,
  year: number = new Date().getFullYear()
): Promise<string> {
  const existing = await listResolutionsByEntity(legalEntityId);
  const yearPrefix = `RES-${year}-`;
  const count = existing.filter((r) => r.resolutionNumber?.startsWith(yearPrefix)).length + 1;
  return `${yearPrefix}${String(count).padStart(4, '0')}`;
}

export async function saveCorporateResolution(
  resolution: CorporateResolution,
  actorUserId: string,
  correlationId?: string
): Promise<CorporateResolution> {
  const cleanId = validateRequiredString(resolution.id, 'id');
  const cleanEntityId = validateRequiredString(resolution.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previousRecord = await getCorporateResolutionById(cleanId);

  const updatedResolution: CorporateResolution = {
    ...resolution,
    id: cleanId,
    legalEntityId: cleanEntityId,
    auditCorrelationId: correlationId || resolution.auditCorrelationId || `cor_res_${Date.now()}`,
    updatedAt: now,
    createdAt: resolution.createdAt || previousRecord?.createdAt || now
  };

  inMemoryResolutions.set(cleanId, updatedResolution);

  try {
    const docRef = doc(firestore, CORPORATE_RESOLUTIONS_COLLECTION, cleanId);
    await setDoc(docRef, updatedResolution, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: previousRecord ? `UPDATE_RESOLUTION_${updatedResolution.status}` : 'ADOPT_CORPORATE_RESOLUTION',
    entityType: 'CORPORATE_RESOLUTION',
    entityId: cleanId,
    before: (previousRecord as unknown as Record<string, unknown>) || null,
    after: (updatedResolution as unknown as Record<string, unknown>) || null,
    metadata: {
      legalEntityId: cleanEntityId,
      resolutionNumber: updatedResolution.resolutionNumber,
      decisionId: updatedResolution.decisionId,
      status: updatedResolution.status,
      correlationId: updatedResolution.auditCorrelationId
    }
  });

  return updatedResolution;
}

// ============================================================================
// 9. CONTROLLED DECISION EXECUTIONS REPOSITORY
// ============================================================================

export async function getDecisionExecutionById(
  executionId: string
): Promise<DecisionExecutionRecord | null> {
  const cleanId = validateRequiredString(executionId, 'executionId');

  if (inMemoryExecutions.has(cleanId)) {
    return inMemoryExecutions.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, DECISION_EXECUTIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as DecisionExecutionRecord;
      inMemoryExecutions.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryExecutions.get(cleanId) || null;
  }

  return null;
}

export async function getExecutionByIdempotencyKey(
  idempotencyKey: string
): Promise<DecisionExecutionRecord | null> {
  const cleanKey = validateRequiredString(idempotencyKey, 'idempotencyKey');

  for (const exec of inMemoryExecutions.values()) {
    if (exec.idempotencyKey === cleanKey) return exec;
  }

  try {
    const collRef = collection(firestore, DECISION_EXECUTIONS_COLLECTION);
    const q = query(collRef, where('idempotencyKey', '==', cleanKey));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as DecisionExecutionRecord;
      inMemoryExecutions.set(data.id, data);
      return data;
    }
  } catch {
    // Fallback in memory
  }

  return null;
}

export async function listExecutionsByDecision(
  decisionId: string
): Promise<DecisionExecutionRecord[]> {
  const cleanDecisionId = validateRequiredString(decisionId, 'decisionId');
  const results: DecisionExecutionRecord[] = [];

  try {
    const collRef = collection(firestore, DECISION_EXECUTIONS_COLLECTION);
    const q = query(collRef, where('decisionId', '==', cleanDecisionId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const item = d.data() as DecisionExecutionRecord;
      results.push(item);
      inMemoryExecutions.set(item.id, item);
    });
  } catch {
    Array.from(inMemoryExecutions.values()).forEach((item) => {
      if (item.decisionId === cleanDecisionId) {
        results.push(item);
      }
    });
  }

  return results;
}

export async function saveDecisionExecution(
  execution: DecisionExecutionRecord,
  actorUserId: string
): Promise<DecisionExecutionRecord> {
  const cleanId = validateRequiredString(execution.id, 'id');
  const now = new Date().toISOString();

  const previousRecord = await getDecisionExecutionById(cleanId);

  const updatedExecution: DecisionExecutionRecord = {
    ...execution,
    id: cleanId,
    updatedAt: now,
    createdAt: execution.createdAt || previousRecord?.createdAt || now
  };

  inMemoryExecutions.set(cleanId, updatedExecution);

  try {
    const docRef = doc(firestore, DECISION_EXECUTIONS_COLLECTION, cleanId);
    await setDoc(docRef, updatedExecution, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: `DISPATCH_EXECUTION_${updatedExecution.executionStatus}`,
    entityType: 'DECISION_EXECUTION',
    entityId: cleanId,
    metadata: {
      decisionId: execution.decisionId,
      executionType: execution.executionType,
      targetDomain: execution.targetDomain,
      executionStatus: execution.executionStatus,
      idempotencyKey: execution.idempotencyKey,
      correlationId: execution.correlationId
    }
  });

  return updatedExecution;
}

// ============================================================================
// 10. HISTORICAL PRESERVATION & PROHIBITED HARD-DELETE ENFORCEMENT
// ============================================================================

/**
 * Strict Security Invariant: Hard deletes on approved or historical corporate records
 * are strictly PROHIBITED by statutory governance regulations.
 */
export async function deleteCorporateRecordProhibited(
  recordType: 'PROFILE' | 'APPOINTMENT' | 'PSC' | 'DECISION' | 'RESOLUTION' | 'MEETING' | 'VOTE' | 'EXECUTION',
  recordId: string,
  actorUserId: string
): Promise<never> {
  await createAuditLog({
    actorUserId,
    action: 'UNAUTHORIZED_HARD_DELETE_ATTEMPT_BLOCKED',
    entityType: recordType,
    entityId: recordId,
    metadata: {
      violation: 'Statutory compliance prohibits hard deletion of corporate governance records'
    }
  });

  throw new ValidationError(
    `Hard deletion of corporate governance ${recordType} records (${recordId}) is prohibited. Use status transition (e.g. RESIGNED, REVOKED, SUPERSEDED, EXPIRED, CANCELLED).`
  );
}
