import { FAQDoc } from '../../types/firestore';
import { FAQItem } from '../../types/cms';
import { db as localDb } from '../database';
import { validateRequiredString } from '../validation';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const FAQS_COLLECTION = 'faqs';

function useLocalFaqStore(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

function toFAQDoc(faq: FAQItem): FAQDoc {
  const timestamps = faq as FAQItem & { createdAt?: string; updatedAt?: string; order?: number };
  return {
    ...faq,
    order: timestamps.order,
    createdAt: timestamps.createdAt || new Date().toISOString(),
    updatedAt: timestamps.updatedAt || timestamps.createdAt || new Date().toISOString(),
  };
}

export async function getAllFAQs(): Promise<FAQDoc[]> {
  if (useLocalFaqStore()) {
    return localDb.getRaw().faqs.map(toFAQDoc);
  }

  const snap = await getAdminFirestore().collection(FAQS_COLLECTION).get();
  return snap.docs.map(d => d.data() as FAQDoc);
}

export async function getFAQsByCategory(category: string): Promise<FAQDoc[]> {
  if (useLocalFaqStore()) {
    return localDb.getRaw().faqs.filter((faq) => faq.category === category).map(toFAQDoc);
  }

  const snap = await getAdminFirestore().collection(FAQS_COLLECTION).where('category', '==', category).get();
  return snap.docs.map(d => d.data() as FAQDoc);
}

export async function upsertFAQ(
  data: Omit<FAQDoc, 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }
): Promise<FAQDoc> {
  const category = validateRequiredString(data.category, 'category');
  const questionAr = validateRequiredString(data.questionAr, 'questionAr');
  const questionEn = validateRequiredString(data.questionEn, 'questionEn');

  const now = new Date().toISOString();
  const id = data.id || `faq_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

  const faq: FAQDoc = {
    ...data,
    id,
    category,
    questionAr,
    questionEn,
    createdAt: data.createdAt || now,
    updatedAt: now,
  };

  if (useLocalFaqStore()) {
    const dataStore = localDb.getRaw();
    const index = dataStore.faqs.findIndex((item) => item.id === id);
    if (index === -1) dataStore.faqs.push(faq);
    else dataStore.faqs[index] = faq;
    localDb.save();
    return faq;
  }

  await getAdminFirestore().collection(FAQS_COLLECTION).doc(id).set(faq);
  return faq;
}

export async function deleteFAQ(id: string): Promise<void> {
  if (useLocalFaqStore()) {
    const data = localDb.getRaw();
    data.faqs = data.faqs.filter((item) => item.id !== id);
    localDb.save();
    return;
  }

  await getAdminFirestore().collection(FAQS_COLLECTION).doc(id).delete();
}
