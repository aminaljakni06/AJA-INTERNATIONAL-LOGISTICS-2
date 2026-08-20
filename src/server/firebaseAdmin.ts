import { cert, getApps, initializeApp, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import firebaseConfigData from '../../firebase-applet-config.json' with { type: 'json' };

function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error('firebaseAdmin must never be imported by client-bundled code.');
  }
}

function parseServiceAccountJson(): Record<string, unknown> | undefined {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawJson) {
    return undefined;
  }

  try {
    return JSON.parse(rawJson) as Record<string, unknown>;
  } catch (err) {
    throw new Error(
      `Invalid FIREBASE_SERVICE_ACCOUNT_JSON: ${err instanceof Error ? err.message : 'JSON parse failed'}`
    );
  }
}

function getAdminApp(): App {
  assertServerOnly();

  const existing = getApps()[0];
  if (existing) {
    return existing;
  }

  const serviceAccount = parseServiceAccountJson();
  const credential = serviceAccount ? cert(serviceAccount) : applicationDefault();

  return initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfigData.projectId,
    storageBucket: firebaseConfigData.storageBucket,
  });
}

export function getAdminFirestore(): Firestore {
  const app = getAdminApp();
  const databaseId = process.env.FIRESTORE_DATABASE_ID || firebaseConfigData.firestoreDatabaseId;
  return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}
