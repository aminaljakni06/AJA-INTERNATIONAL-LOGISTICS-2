import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json' with { type: 'json' };

// Suppress internal gRPC idle disconnect logs
setLogLevel('error');

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with robust auto-detect long polling for sandboxed containers
export const firestore = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
}, firebaseConfigData.firestoreDatabaseId || undefined);

function getFirestoreEmulatorHost(): string | undefined {
  return typeof process !== 'undefined' ? process.env?.FIRESTORE_EMULATOR_HOST : undefined;
}

const firestoreEmulatorHost = getFirestoreEmulatorHost();

if (firestoreEmulatorHost) {
  const [host = '127.0.0.1', portText = '8080'] = firestoreEmulatorHost.split(':');
  const port = Number(portText);

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Invalid FIRESTORE_EMULATOR_HOST port: ${firestoreEmulatorHost}`);
  }

  connectFirestoreEmulator(firestore, host, port);
}

export default app;
