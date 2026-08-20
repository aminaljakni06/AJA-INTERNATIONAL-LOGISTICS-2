import { CMSContentDoc } from '../../types/firestore';
import { db as localDb } from '../database';
import { validateRequiredString } from '../validation';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const CMS_COLLECTION = 'cmsContent';

function useLocalCMSStore(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

function ensureLocalCMS(): CMSContentDoc[] {
  const data = localDb.getRaw();
  data.cms_content ||= [];
  return data.cms_content;
}

export async function getCMSContentByKey(key: string): Promise<CMSContentDoc | null> {
  if (useLocalCMSStore()) {
    return ensureLocalCMS().find((item) => item.key === key) || null;
  }

  const snap = await getAdminFirestore().collection(CMS_COLLECTION).where('key', '==', key).get();
  if (snap.empty) return null;
  return snap.docs[0].data() as CMSContentDoc;
}

export async function getAllCMSContent(): Promise<CMSContentDoc[]> {
  if (useLocalCMSStore()) {
    return ensureLocalCMS();
  }

  const snap = await getAdminFirestore().collection(CMS_COLLECTION).get();
  return snap.docs.map(d => d.data() as CMSContentDoc);
}

export async function upsertCMSContent(
  key: string,
  data: Omit<CMSContentDoc, 'id' | 'key' | 'updatedAt'>
): Promise<CMSContentDoc> {
  const cleanKey = validateRequiredString(key, 'key');
  const now = new Date().toISOString();
  const existing = await getCMSContentByKey(cleanKey);

  const id = existing?.id || `cms_${cleanKey}`;
  const content: CMSContentDoc = {
    ...data,
    id,
    key: cleanKey,
    updatedAt: now,
  };

  if (useLocalCMSStore()) {
    const items = ensureLocalCMS();
    const index = items.findIndex((item) => item.id === id || item.key === cleanKey);
    if (index === -1) items.push(content);
    else items[index] = content;
    localDb.save();
    return content;
  }

  await getAdminFirestore().collection(CMS_COLLECTION).doc(id).set(content);
  return content;
}
