import { ServiceDoc } from '../../types/firestore';
import { ServiceInfo } from '../../types/cms';
import { ServiceType } from '../../types/quote';
import { db as localDb } from '../database';
import { validateRequiredString } from '../validation';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const SERVICES_COLLECTION = 'services';

function useLocalServiceStore(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

function toServiceDoc(service: ServiceInfo): ServiceDoc {
  const timestamps = service as ServiceInfo & { createdAt?: string; updatedAt?: string };
  return {
    ...service,
    type: service.type || service.serviceType || 'GENERAL',
    createdAt: timestamps.createdAt || new Date().toISOString(),
    updatedAt: timestamps.updatedAt || timestamps.createdAt || new Date().toISOString(),
  } as ServiceDoc;
}

export async function getServiceById(id: string): Promise<ServiceDoc | null> {
  if (!id) return null;
  if (useLocalServiceStore()) {
    const service = localDb.getRaw().services.find((item) => item.id === id);
    return service ? toServiceDoc(service) : null;
  }

  const snap = await getAdminFirestore().collection(SERVICES_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as ServiceDoc;
}

export async function getAllServices(): Promise<ServiceDoc[]> {
  if (useLocalServiceStore()) {
    return localDb.getRaw().services.map(toServiceDoc);
  }

  const snap = await getAdminFirestore().collection(SERVICES_COLLECTION).get();
  return snap.docs.map(d => d.data() as ServiceDoc);
}

export async function upsertService(
  data: Omit<ServiceDoc, 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }
): Promise<ServiceDoc> {
  const type = validateRequiredString(data.type, 'type');
  const titleAr = validateRequiredString(data.titleAr, 'titleAr');
  const titleEn = validateRequiredString(data.titleEn, 'titleEn');

  const now = new Date().toISOString();
  const id = data.id || `srv_${type.toLowerCase()}`;
  const existing = await getServiceById(id);

  const service: ServiceDoc = {
    ...data,
    id,
    type,
    titleAr,
    titleEn,
    createdAt: existing?.createdAt || data.createdAt || now,
    updatedAt: now,
  };

  if (useLocalServiceStore()) {
    const dataStore = localDb.getRaw();
    const index = dataStore.services.findIndex((item) => item.id === id);
    const localService = { ...service, type: service.type as ServiceType } as ServiceInfo;
    if (index === -1) dataStore.services.push(localService);
    else dataStore.services[index] = localService;
    localDb.save();
    return service;
  }

  await getAdminFirestore().collection(SERVICES_COLLECTION).doc(id).set(service);
  return service;
}

export async function deleteService(id: string): Promise<void> {
  if (useLocalServiceStore()) {
    const data = localDb.getRaw();
    data.services = data.services.filter((item) => item.id !== id);
    localDb.save();
    return;
  }

  await getAdminFirestore().collection(SERVICES_COLLECTION).doc(id).delete();
}
