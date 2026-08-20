/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Compliance Certification & Control Attestation Repository
 * Step GOV-20: Regulatory Obligation Execution Assurance, Compliance Certification,
 * Control Attestation & Evidence-Based Compliance Closure
 *
 * Persistence Architecture:
 * - Direct Firestore persistence with fallback in-memory stores
 * - Version pinning & historical snapshot preservation
 * - Strict multi-tenant isolation by Legal Entity and Jurisdiction
 * - SHA-256 cryptographic integrity seal calculation
 */

import {
  ComplianceCertification,
  ControlAttestation,
  ComplianceCertificationResult,
  ComplianceCertificationLifecycleStatus,
  PointInTimeCertificationReplay
} from '../../types/complianceCertification';
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
import * as crypto from 'crypto';

export const COMPLIANCE_CERTIFICATIONS_COLLECTION = 'compliance_certifications';
export const CONTROL_ATTESTATIONS_COLLECTION = 'control_attestations';
export const CERTIFICATION_HISTORICAL_SNAPSHOTS_COLLECTION = 'compliance_certification_snapshots';

// In-Memory Stores for resilient and fast deterministic lookups
const inMemoryCertifications = new Map<string, ComplianceCertification>();
const inMemoryControlAttestations = new Map<string, ControlAttestation>();
const inMemoryHistoricalSnapshots = new Map<string, ComplianceCertification[]>();

let certSequenceCounter = 1000;
let attestationSequenceCounter = 1000;

export function resetComplianceCertificationRepositoryMemoryStore(): void {
  inMemoryCertifications.clear();
  inMemoryControlAttestations.clear();
  inMemoryHistoricalSnapshots.clear();
  certSequenceCounter = 1000;
  attestationSequenceCounter = 1000;
}

export function generateCertificationNumber(): string {
  certSequenceCounter += 1;
  const year = new Date().getFullYear();
  return `CCF-${year}-${certSequenceCounter}`;
}

export function generateAttestationNumber(): string {
  attestationSequenceCounter += 1;
  const year = new Date().getFullYear();
  return `CAT-${year}-${attestationSequenceCounter}`;
}

export function computeCertificationIntegrityHash(cert: Partial<ComplianceCertification>): string {
  const payload = JSON.stringify({
    id: cert.id,
    certificationNumber: cert.certificationNumber,
    legalEntityId: cert.legalEntityId,
    obligationId: cert.obligationId,
    obligationVersionId: cert.obligationVersionId,
    policyVersionId: cert.policyVersionId,
    ruleVersion: cert.ruleVersion,
    reportingPeriodStart: cert.reportingPeriodStart,
    reportingPeriodEnd: cert.reportingPeriodEnd,
    status: cert.status,
    certificationResult: cert.certificationResult,
    statementVersion: cert.statementVersion,
    evidenceSnapshots: cert.evidenceSnapshots?.map(e => ({
      evidenceRecordId: e.evidenceRecordId,
      documentVersionId: e.documentVersionId,
      checksumSha256: e.checksumSha256
    })),
    controlSnapshots: cert.controlSnapshots?.map(c => ({
      controlId: c.controlId,
      operatingEffectiveness: c.operatingEffectiveness,
      designEffectiveness: c.designEffectiveness
    })),
    filingSnapshots: cert.filingSnapshots?.map(f => ({
      filingId: f.filingId,
      status: f.status
    })),
    version: cert.version
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export function computeAttestationIntegrityHash(attestation: Partial<ControlAttestation>): string {
  const payload = JSON.stringify({
    id: attestation.id,
    attestationNumber: attestation.attestationNumber,
    controlId: attestation.controlId,
    legalEntityId: attestation.legalEntityId,
    attestorUserId: attestation.attestorUserId,
    reportingPeriodStart: attestation.reportingPeriodStart,
    reportingPeriodEnd: attestation.reportingPeriodEnd,
    operatingEffectiveness: attestation.operatingEffectiveness,
    statementVersion: attestation.statementVersion,
    evidenceRecordIds: attestation.evidenceRecordIds
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// ============================================================================
// 1. COMPLIANCE CERTIFICATION REPOSITORY
// ============================================================================

export async function getComplianceCertificationById(id: string): Promise<ComplianceCertification | null> {
  const cleanId = validateRequiredString(id, 'id');
  if (inMemoryCertifications.has(cleanId)) {
    return inMemoryCertifications.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, COMPLIANCE_CERTIFICATIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ComplianceCertification;
      inMemoryCertifications.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryCertifications.get(cleanId) || null;
  }

  return null;
}

export async function getComplianceCertificationByNumber(certificationNumber: string): Promise<ComplianceCertification | null> {
  const cleanNum = validateRequiredString(certificationNumber, 'certificationNumber');
  for (const cert of inMemoryCertifications.values()) {
    if (cert.certificationNumber === cleanNum) {
      return cert;
    }
  }

  try {
    const q = query(
      collection(firestore, COMPLIANCE_CERTIFICATIONS_COLLECTION),
      where('certificationNumber', '==', cleanNum)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as ComplianceCertification;
      inMemoryCertifications.set(data.id, data);
      return data;
    }
  } catch {
    // Fallback in-memory check
  }

  return null;
}

export async function listComplianceCertificationsByEntity(
  legalEntityId: string,
  filter?: {
    obligationId?: string;
    status?: ComplianceCertificationLifecycleStatus;
    result?: ComplianceCertificationResult;
  }
): Promise<ComplianceCertification[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: ComplianceCertification[] = [];

  for (const cert of inMemoryCertifications.values()) {
    if (cert.legalEntityId !== cleanEntityId) continue;
    if (filter?.obligationId && cert.obligationId !== filter.obligationId) continue;
    if (filter?.status && cert.status !== filter.status) continue;
    if (filter?.result && cert.certificationResult !== filter.result) continue;
    results.push(cert);
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveComplianceCertification(
  cert: ComplianceCertification,
  actorUserId: string
): Promise<ComplianceCertification> {
  const cleanId = validateRequiredString(cert.id, 'id');
  const cleanEntityId = validateRequiredString(cert.legalEntityId, 'legalEntityId');
  const cleanObligationId = validateRequiredString(cert.obligationId, 'obligationId');
  const cleanCertNumber = cert.certificationNumber || generateCertificationNumber();
  const now = new Date().toISOString();

  const previous = await getComplianceCertificationById(cleanId);
  const version = cert.version !== undefined ? cert.version : (previous ? previous.version : 1);

  const calculatedHash = computeCertificationIntegrityHash({
    ...cert,
    id: cleanId,
    certificationNumber: cleanCertNumber,
    version
  });

  const updated: ComplianceCertification = {
    ...cert,
    id: cleanId,
    certificationNumber: cleanCertNumber,
    legalEntityId: cleanEntityId,
    obligationId: cleanObligationId,
    version,
    evidenceSnapshots: cert.evidenceSnapshots || [],
    controlSnapshots: cert.controlSnapshots || [],
    filingSnapshots: cert.filingSnapshots || [],
    exceptionSnapshots: cert.exceptionSnapshots || [],
    findingSnapshots: cert.findingSnapshots || [],
    reopenHistory: cert.reopenHistory || previous?.reopenHistory || [],
    classification: cert.classification || 'CONFIDENTIAL',
    integrityHashSha256: calculatedHash,
    correlationId: cert.correlationId || previous?.correlationId || `cor_${Date.now()}`,
    createdAt: cert.createdAt || previous?.createdAt || now,
    updatedAt: now
  };

  inMemoryCertifications.set(cleanId, updated);

  // Preserve historical snapshot for point-in-time replay
  const historyList = inMemoryHistoricalSnapshots.get(cleanId) || [];
  historyList.push(JSON.parse(JSON.stringify(updated)));
  inMemoryHistoricalSnapshots.set(cleanId, historyList);

  try {
    const docRef = doc(firestore, COMPLIANCE_CERTIFICATIONS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // In-memory fallback
  }

  await createAuditLog({
    actorUserId,
    action: previous ? 'UPDATE_COMPLIANCE_CERTIFICATION' : 'CREATE_COMPLIANCE_CERTIFICATION',
    entityType: 'COMPLIANCE_CERTIFICATION',
    entityId: cleanId,
    metadata: {
      certificationNumber: cleanCertNumber,
      legalEntityId: cleanEntityId,
      obligationId: cleanObligationId,
      status: updated.status,
      result: updated.certificationResult,
      version: updated.version,
      integrityHash: calculatedHash,
      correlationId: updated.correlationId
    }
  });

  return updated;
}

// ============================================================================
// 2. CONTROL ATTESTATION REPOSITORY
// ============================================================================

export async function getControlAttestationById(id: string): Promise<ControlAttestation | null> {
  const cleanId = validateRequiredString(id, 'id');
  if (inMemoryControlAttestations.has(cleanId)) {
    return inMemoryControlAttestations.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, CONTROL_ATTESTATIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ControlAttestation;
      inMemoryControlAttestations.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryControlAttestations.get(cleanId) || null;
  }

  return null;
}

export async function saveControlAttestation(
  attestation: ControlAttestation,
  actorUserId: string
): Promise<ControlAttestation> {
  const cleanId = validateRequiredString(attestation.id, 'id');
  const cleanControlId = validateRequiredString(attestation.controlId, 'controlId');
  const cleanEntityId = validateRequiredString(attestation.legalEntityId, 'legalEntityId');
  const cleanAttestationNumber = attestation.attestationNumber || generateAttestationNumber();
  const now = new Date().toISOString();

  const previous = await getControlAttestationById(cleanId);
  const calculatedHash = computeAttestationIntegrityHash({
    ...attestation,
    id: cleanId,
    attestationNumber: cleanAttestationNumber
  });

  const updated: ControlAttestation = {
    ...attestation,
    id: cleanId,
    attestationNumber: cleanAttestationNumber,
    controlId: cleanControlId,
    legalEntityId: cleanEntityId,
    evidenceRecordIds: attestation.evidenceRecordIds || [],
    exceptionsNoted: attestation.exceptionsNoted || [],
    integrityHashSha256: calculatedHash,
    correlationId: attestation.correlationId || previous?.correlationId || `cor_${Date.now()}`,
    createdAt: attestation.createdAt || previous?.createdAt || now,
    updatedAt: now
  };

  inMemoryControlAttestations.set(cleanId, updated);

  try {
    const docRef = doc(firestore, CONTROL_ATTESTATIONS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // in-memory fallback
  }

  await createAuditLog({
    actorUserId,
    action: previous ? 'UPDATE_CONTROL_ATTESTATION' : 'CREATE_CONTROL_ATTESTATION',
    entityType: 'CONTROL_ATTESTATION',
    entityId: cleanId,
    metadata: {
      attestationNumber: cleanAttestationNumber,
      controlId: cleanControlId,
      legalEntityId: cleanEntityId,
      operatingEffectiveness: updated.operatingEffectiveness,
      attestorUserId: updated.attestorUserId,
      integrityHash: calculatedHash
    }
  });

  return updated;
}

export async function listControlAttestationsByControl(controlId: string): Promise<ControlAttestation[]> {
  const cleanId = validateRequiredString(controlId, 'controlId');
  return Array.from(inMemoryControlAttestations.values()).filter(a => a.controlId === cleanId);
}

export async function listControlAttestationsByEntity(legalEntityId: string): Promise<ControlAttestation[]> {
  const cleanId = validateRequiredString(legalEntityId, 'legalEntityId');
  return Array.from(inMemoryControlAttestations.values()).filter(a => a.legalEntityId === cleanId);
}

// ============================================================================
// 3. POINT-IN-TIME REPLAY & HISTORICAL RECONSTRUCTION
// ============================================================================

export async function getHistoricalCertificationSnapshots(certificationId: string): Promise<ComplianceCertification[]> {
  const cleanId = validateRequiredString(certificationId, 'certificationId');
  return inMemoryHistoricalSnapshots.get(cleanId) || [];
}

export async function reconstructCertificationAtPointInTime(
  certificationId: string,
  targetTimestampUtc: string
): Promise<PointInTimeCertificationReplay> {
  const cleanId = validateRequiredString(certificationId, 'certificationId');
  const targetTime = new Date(targetTimestampUtc).getTime();
  if (isNaN(targetTime)) {
    throw new ValidationError(`Invalid timestamp format for historical replay: [${targetTimestampUtc}]`);
  }

  const history = inMemoryHistoricalSnapshots.get(cleanId) || [];
  const current = inMemoryCertifications.get(cleanId);
  const candidates = [...history];
  if (current && !candidates.some(c => c.updatedAt === current.updatedAt)) {
    candidates.push(current);
  }

  // Find the closest snapshot created/updated at or before targetTime
  const filtered = candidates
    .filter(s => new Date(s.updatedAt || s.createdAt).getTime() <= targetTime)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  const snapshot = filtered[0] || current;
  if (!snapshot) {
    throw new ValidationError(`No certification record found for ID [${cleanId}] at or before [${targetTimestampUtc}]`);
  }

  const integrityHash = computeCertificationIntegrityHash(snapshot);

  return {
    certificationId: snapshot.id,
    certificationNumber: snapshot.certificationNumber,
    asOfDate: targetTimestampUtc,
    obligationVersionAtTime: snapshot.obligationVersionId,
    policyVersionAtTime: snapshot.policyVersionId,
    resultAtTime: snapshot.certificationResult,
    statusAtTime: snapshot.status,
    evidenceSnapshotsAtTime: snapshot.evidenceSnapshots,
    controlSnapshotsAtTime: snapshot.controlSnapshots,
    filingSnapshotsAtTime: snapshot.filingSnapshots,
    findingsAtTime: snapshot.findingSnapshots,
    exceptionsAtTime: snapshot.exceptionSnapshots,
    certifierUserIdAtTime: snapshot.certifierUserId,
    independentVerifierUserIdAtTime: snapshot.independentVerifierUserId,
    integrityHashSha256: integrityHash,
    replayedAt: new Date().toISOString()
  };
}
