import { CustomerProfileDoc } from '../../types/firestore';
import { db as localDb } from '../database';
import { validateEmail, validateRequiredString } from '../validation';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const CUSTOMERS_COLLECTION = 'customers';

function useLocalCustomerStore(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

function ensureLocalCustomers(): CustomerProfileDoc[] {
  const data = localDb.getRaw();
  data.customers ||= [];

  for (const user of data.users.filter((item) => item.role === 'CUSTOMER')) {
    if (!data.customers.some((customer) => customer.userId === user.id)) {
      data.customers.push({
        userId: user.id,
        fullName: user.fullName,
        companyName: user.companyName || undefined,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }
  }

  return data.customers;
}

export async function getCustomerByUserId(userId: string): Promise<CustomerProfileDoc | null> {
  if (!userId) return null;
  if (useLocalCustomerStore()) {
    return ensureLocalCustomers().find((customer) => customer.userId === userId) || null;
  }

  const snap = await getAdminFirestore().collection(CUSTOMERS_COLLECTION).doc(userId).get();
  if (!snap.exists) return null;
  return snap.data() as CustomerProfileDoc;
}

export async function upsertCustomerProfile(
  data: Omit<CustomerProfileDoc, 'createdAt' | 'updatedAt'>
): Promise<CustomerProfileDoc> {
  const userId = validateRequiredString(data.userId, 'userId');
  const fullName = validateRequiredString(data.fullName, 'fullName');
  const email = validateEmail(data.email);
  const phone = validateRequiredString(data.phone, 'phone');

  const now = new Date().toISOString();
  const existing = await getCustomerByUserId(userId);

  if (useLocalCustomerStore()) {
    const customers = ensureLocalCustomers();
    const updated: CustomerProfileDoc = {
      ...(existing || { createdAt: now }),
      ...data,
      userId,
      fullName,
      email,
      phone,
      updatedAt: now,
    } as CustomerProfileDoc;
    const index = customers.findIndex((customer) => customer.userId === userId);
    if (index === -1) customers.push(updated);
    else customers[index] = updated;
    localDb.save();
    return updated;
  }

  if (existing) {
    const updated: CustomerProfileDoc = {
      ...existing,
      ...data,
      userId,
      fullName,
      email,
      phone,
      updatedAt: now,
    };
    await getAdminFirestore().collection(CUSTOMERS_COLLECTION).doc(userId).update({ ...updated });
    return updated;
  } else {
    const newProfile: CustomerProfileDoc = {
      ...data,
      userId,
      fullName,
      email,
      phone,
      createdAt: now,
      updatedAt: now,
    };
    await getAdminFirestore().collection(CUSTOMERS_COLLECTION).doc(userId).set(newProfile);
    return newProfile;
  }
}

export async function listCustomers(): Promise<CustomerProfileDoc[]> {
  if (useLocalCustomerStore()) {
    return ensureLocalCustomers();
  }

  const snap = await getAdminFirestore().collection(CUSTOMERS_COLLECTION).get();
  return snap.docs.map(d => d.data() as CustomerProfileDoc);
}
