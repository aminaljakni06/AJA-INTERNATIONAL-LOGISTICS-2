import { type DocumentReference, type Query, type WhereFilterOp } from 'firebase-admin/firestore';
import { getAdminFirestore } from './firebaseAdmin';

export const adminFirestore = Symbol('admin-firestore');

type QueryConstraint = {
  kind: 'where';
  fieldPath: string;
  opStr: WhereFilterOp;
  value: unknown;
};

type CompatDocumentSnapshot = {
  exists(): boolean;
  data(): FirebaseFirestore.DocumentData | undefined;
  id: string;
};

function wrapDocumentSnapshot(snapshot: FirebaseFirestore.DocumentSnapshot): CompatDocumentSnapshot {
  return {
    id: snapshot.id,
    exists: () => snapshot.exists,
    data: () => snapshot.data(),
  };
}

function isForcedLocalFallback(): boolean {
  return process.env.FORCE_LOCAL_DATA_FALLBACK === 'true';
}

function throwForcedLocalFallback(): never {
  throw new Error('Firestore operation skipped because FORCE_LOCAL_DATA_FALLBACK=true');
}

export function collection(_firestore: unknown, collectionPath: string): FirebaseFirestore.CollectionReference {
  if (isForcedLocalFallback()) {
    throwForcedLocalFallback();
  }
  return getAdminFirestore().collection(collectionPath);
}

export function doc(_firestore: unknown, collectionPath: string, documentPath: string): DocumentReference {
  if (isForcedLocalFallback()) {
    throwForcedLocalFallback();
  }
  return getAdminFirestore().collection(collectionPath).doc(documentPath);
}

export function query(
  baseQuery: FirebaseFirestore.CollectionReference | Query,
  ...constraints: QueryConstraint[]
): Query {
  return constraints.reduce<Query>((currentQuery, constraint) => {
    if (constraint.kind === 'where') {
      return currentQuery.where(constraint.fieldPath, constraint.opStr, constraint.value);
    }

    return currentQuery;
  }, baseQuery);
}

export function where(fieldPath: string, opStr: WhereFilterOp, value: unknown): QueryConstraint {
  return { kind: 'where', fieldPath, opStr, value };
}

export async function getDoc(documentRef: DocumentReference): Promise<CompatDocumentSnapshot> {
  if (isForcedLocalFallback()) {
    throwForcedLocalFallback();
  }
  const snapshot = await documentRef.get();
  return wrapDocumentSnapshot(snapshot);
}

export async function getDocs(baseQuery: FirebaseFirestore.CollectionReference | Query): Promise<FirebaseFirestore.QuerySnapshot> {
  if (isForcedLocalFallback()) {
    throwForcedLocalFallback();
  }
  return baseQuery.get();
}

export async function setDoc(
  documentRef: DocumentReference,
  data: FirebaseFirestore.DocumentData,
  options?: FirebaseFirestore.SetOptions
): Promise<FirebaseFirestore.WriteResult> {
  if (isForcedLocalFallback()) {
    throwForcedLocalFallback();
  }
  return options ? documentRef.set(data, options) : documentRef.set(data);
}

export async function updateDoc(
  documentRef: DocumentReference,
  data: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>
): Promise<FirebaseFirestore.WriteResult> {
  if (isForcedLocalFallback()) {
    throwForcedLocalFallback();
  }
  return documentRef.update(data);
}

export async function deleteDoc(documentRef: DocumentReference): Promise<FirebaseFirestore.WriteResult> {
  if (isForcedLocalFallback()) {
    throwForcedLocalFallback();
  }
  return documentRef.delete();
}
