import { CompanyDoc } from '../../types/firestore';
import { Company } from '../../types/user';
import { db as localDb } from '../database';
import { validateRequiredString } from '../validation';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const COMPANIES_COLLECTION = 'companies';

function useLocalCompanyStore(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

function toCompanyDoc(company: Company): CompanyDoc {
  return {
    id: company.id,
    name: company.name || company.legalName || company.tradeName || '',
    commercialRegister: company.commercialRegister || company.commercialRegistration,
    taxNumber: company.taxNumber || company.vatNumber,
    phone: company.phone,
    address: company.address,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt || company.createdAt,
  };
}

export async function getCompanyById(id: string): Promise<CompanyDoc | null> {
  if (!id) return null;
  if (useLocalCompanyStore()) {
    const company = localDb.getRaw().companies.find((item) => item.id === id);
    return company ? toCompanyDoc(company) : null;
  }

  const snap = await getAdminFirestore().collection(COMPANIES_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as CompanyDoc;
}

export async function createCompany(data: Omit<CompanyDoc, 'createdAt' | 'updatedAt'>): Promise<CompanyDoc> {
  const id = validateRequiredString(data.id, 'id');
  const name = validateRequiredString(data.name, 'name');

  const now = new Date().toISOString();
  const company: CompanyDoc = {
    ...data,
    id,
    name,
    createdAt: now,
    updatedAt: now,
  };

  if (useLocalCompanyStore()) {
    const data = localDb.getRaw();
    if (!data.companies.some((item) => item.id === id)) {
      data.companies.push(company);
      localDb.save();
    }
    return company;
  }

  await getAdminFirestore().collection(COMPANIES_COLLECTION).doc(id).set(company);
  return company;
}

export async function updateCompany(id: string, updates: Partial<CompanyDoc>): Promise<CompanyDoc> {
  const existing = await getCompanyById(id);
  if (!existing) {
    throw new Error(`Company with ID ${id} not found.`);
  }

  const now = new Date().toISOString();
  const payload = { ...updates, updatedAt: now };

  if (useLocalCompanyStore()) {
    const data = localDb.getRaw();
    const index = data.companies.findIndex((item) => item.id === id);
    if (index === -1) throw new Error(`Company with ID ${id} not found.`);
    data.companies[index] = {
      ...data.companies[index],
      ...payload,
      updatedAt: now,
    };
    localDb.save();
    return { ...existing, ...payload, updatedAt: now };
  }

  await getAdminFirestore().collection(COMPANIES_COLLECTION).doc(id).update(payload);
  return { ...existing, ...payload, updatedAt: now };
}

export async function listCompanies(): Promise<CompanyDoc[]> {
  if (useLocalCompanyStore()) {
    return localDb.getRaw().companies.map(toCompanyDoc);
  }

  const snap = await getAdminFirestore().collection(COMPANIES_COLLECTION).get();
  return snap.docs.map(d => d.data() as CompanyDoc);
}
