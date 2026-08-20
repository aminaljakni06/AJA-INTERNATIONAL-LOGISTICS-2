import { DocumentDoc } from '../../types/firestore';
import { DocumentVersionDoc } from '../../types/corporateGovernance';
import { validateRequiredString } from '../validation';
import { getAdminFirestore } from '../../server/firebaseAdmin';
import * as crypto from 'crypto';

const DOCUMENTS_COLLECTION = 'documents';
const DOCUMENT_VERSIONS_COLLECTION = 'documentVersions';
const inMemoryDocuments = new Map<string, DocumentDoc>();
const inMemoryDocumentVersions = new Map<string, DocumentVersionDoc>();

export function resetDocumentRepositoryMemoryStore(): void {
  inMemoryDocuments.clear();
  inMemoryDocumentVersions.clear();
}

function useLocalDocumentStore(): boolean {
  return (
    process.env.FORCE_LOCAL_DATA_FALLBACK === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true')
  );
}

export async function getDocumentById(id: string): Promise<DocumentDoc | null> {
  if (!id) return null;
  if (useLocalDocumentStore()) {
    return inMemoryDocuments.get(id) || null;
  }

  const snap = await getAdminFirestore().collection(DOCUMENTS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as DocumentDoc;
}

export async function createDocument(
  data: Omit<DocumentDoc, 'id' | 'createdAt'> & { id?: string }
): Promise<DocumentDoc> {
  const ownerType = validateRequiredString(data.ownerType, 'ownerType');
  const ownerId = validateRequiredString(data.ownerId, 'ownerId');
  const fileName = validateRequiredString(data.fileName, 'fileName');
  const fileType = validateRequiredString(data.fileType, 'fileType');
  const storagePath = validateRequiredString(data.storagePath, 'storagePath');
  const uploadedBy = validateRequiredString(data.uploadedBy, 'uploadedBy');

  const now = new Date().toISOString();
  const id = data.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const documentDoc: DocumentDoc = {
    ...data,
    id,
    ownerType,
    ownerId,
    category: data.category || 'ADDITIONAL',
    fileName,
    fileType,
    fileSize: data.fileSize || 0,
    storagePath,
    fileData: data.fileData || '',
    checksumSha256: data.checksumSha256,
    currentVersionNumber: data.currentVersionNumber || 1,
    uploadedBy,
    uploadedByRole: data.uploadedByRole || 'CUSTOMER',
    createdAt: now,
  };

  const initialVersion: DocumentVersionDoc = {
    id: `docver_${id}_v${documentDoc.currentVersionNumber || 1}`,
    documentId: id,
    versionNumber: documentDoc.currentVersionNumber || 1,
    fileName,
    fileType,
    fileSize: documentDoc.fileSize || 0,
    storagePath,
    fileData: data.fileData || '',
    checksumSha256: documentDoc.checksumSha256 || calculateSha256Checksum(data.fileData || storagePath),
    uploadedBy,
    uploadedByRole: documentDoc.uploadedByRole || 'CUSTOMER',
    isImmutable: false,
    createdAt: now,
  };

  if (useLocalDocumentStore()) {
    inMemoryDocuments.set(id, documentDoc);
    inMemoryDocumentVersions.set(initialVersion.id, initialVersion);
    return documentDoc;
  }

  await getAdminFirestore().collection(DOCUMENTS_COLLECTION).doc(id).set(documentDoc);
  await getAdminFirestore().collection(DOCUMENT_VERSIONS_COLLECTION).doc(initialVersion.id).set(initialVersion);
  return documentDoc;
}

export function calculateSha256Checksum(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function createDocumentVersion(
  documentIdOrData: string | (Omit<DocumentVersionDoc, 'id' | 'createdAt' | 'checksumSha256' | 'isImmutable'> & {
    id?: string;
    checksumSha256?: string;
    isImmutable?: boolean;
  }),
  versionData?: Omit<DocumentVersionDoc, 'id' | 'createdAt' | 'checksumSha256' | 'isImmutable' | 'documentId'> & {
    id?: string;
    checksumSha256?: string;
    isImmutable?: boolean;
  }
): Promise<DocumentVersionDoc> {
  const data = typeof documentIdOrData === 'string'
    ? { ...(versionData || {}), documentId: documentIdOrData }
    : documentIdOrData;
  const documentId = validateRequiredString(data.documentId, 'documentId');
  const fileName = validateRequiredString(data.fileName, 'fileName');
  const fileType = validateRequiredString(data.fileType, 'fileType');
  const storagePath = validateRequiredString(data.storagePath, 'storagePath');
  const uploadedBy = validateRequiredString(data.uploadedBy, 'uploadedBy');
  const id = data.id || `docver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();
  const existingVersions = await getDocumentVersions(documentId);
  const nextVersionNumber = existingVersions.length > 0
    ? Math.max(...existingVersions.map(existingVersion => existingVersion.versionNumber || 0)) + 1
    : 1;
  const version: DocumentVersionDoc = {
    ...data,
    id,
    documentId,
    versionNumber: data.versionNumber || nextVersionNumber,
    fileName,
    fileType,
    fileSize: data.fileSize || 0,
    storagePath,
    checksumSha256: data.checksumSha256 || calculateSha256Checksum(data.fileData || storagePath),
    uploadedBy,
    uploadedByRole: data.uploadedByRole || 'SYSTEM',
    isImmutable: data.isImmutable ?? false,
    createdAt,
  };

  if (useLocalDocumentStore()) {
    inMemoryDocumentVersions.set(id, version);
    const documentDoc = inMemoryDocuments.get(documentId);
    if (documentDoc) {
      inMemoryDocuments.set(documentId, { ...documentDoc, currentVersionNumber: version.versionNumber });
    }
    return version;
  }

  await getAdminFirestore().collection(DOCUMENT_VERSIONS_COLLECTION).doc(id).set(version);
  await getAdminFirestore().collection(DOCUMENTS_COLLECTION).doc(documentId).set(
    { currentVersionNumber: version.versionNumber },
    { merge: true }
  );
  return version;
}

export async function getDocumentVersions(documentId: string): Promise<DocumentVersionDoc[]> {
  const cleanDocumentId = validateRequiredString(documentId, 'documentId');
  if (useLocalDocumentStore()) {
    return Array.from(inMemoryDocumentVersions.values())
      .filter((version) => version.documentId === cleanDocumentId)
      .sort((a, b) => a.versionNumber - b.versionNumber);
  }

  const snap = await getAdminFirestore()
    .collection(DOCUMENT_VERSIONS_COLLECTION)
    .where('documentId', '==', cleanDocumentId)
    .get();
  return snap.docs
    .map((d) => d.data() as DocumentVersionDoc)
    .sort((a, b) => a.versionNumber - b.versionNumber);
}

export async function getDocumentVersionById(id: string): Promise<DocumentVersionDoc | null> {
  const cleanId = validateRequiredString(id, 'id');
  if (useLocalDocumentStore()) {
    return inMemoryDocumentVersions.get(cleanId) || null;
  }

  const snap = await getAdminFirestore().collection(DOCUMENT_VERSIONS_COLLECTION).doc(cleanId).get();
  if (!snap.exists) return null;
  return snap.data() as DocumentVersionDoc;
}

export async function setDocumentVersionImmutable(id: string): Promise<DocumentVersionDoc | null> {
  const existing = await getDocumentVersionById(id);
  if (!existing) return null;
  const updated = { ...existing, isImmutable: true };

  if (useLocalDocumentStore()) {
    inMemoryDocumentVersions.set(id, updated);
    return updated;
  }

  await getAdminFirestore().collection(DOCUMENT_VERSIONS_COLLECTION).doc(id).set(updated, { merge: true });
  return updated;
}

export async function getDocumentsByOwner(ownerType: string, ownerId: string): Promise<DocumentDoc[]> {
  if (useLocalDocumentStore()) {
    return Array.from(inMemoryDocuments.values()).filter(
      (documentDoc) => documentDoc.ownerType === ownerType && documentDoc.ownerId === ownerId
    );
  }

  const snap = await getAdminFirestore()
    .collection(DOCUMENTS_COLLECTION)
    .where('ownerType', '==', ownerType)
    .where('ownerId', '==', ownerId)
    .get();
  return snap.docs.map(d => d.data() as DocumentDoc);
}

export async function deleteDocument(id: string): Promise<void> {
  if (useLocalDocumentStore()) {
    inMemoryDocuments.delete(id);
    return;
  }

  await getAdminFirestore().collection(DOCUMENTS_COLLECTION).doc(id).delete();
}
