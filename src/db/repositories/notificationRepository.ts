import { NotificationDoc } from '../../types/firestore';
import { validateRequiredString } from '../validation';
import { db as localDb } from '../database';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const NOTIFICATIONS_COLLECTION = 'notifications';

function useLocalNotificationStore(): boolean {
  return (
    process.env.FORCE_LOCAL_DATA_FALLBACK === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true')
  );
}

function toNotificationDoc(item: any): NotificationDoc {
  return {
    id: item.id,
    recipientUserId: item.recipientUserId || item.userId,
    title: item.title || item.titleAr || item.titleEn || '',
    body: item.body || item.messageAr || item.messageEn || '',
    type: item.type || 'GENERAL',
    relatedEntityType: item.relatedEntityType,
    relatedEntityId: item.relatedEntityId,
    isRead: item.isRead ?? false,
    createdAt: item.createdAt,
  };
}

export async function createNotification(
  data: Omit<NotificationDoc, 'id' | 'createdAt' | 'isRead'> & { id?: string; deduplicationKey?: string }
): Promise<NotificationDoc> {
  const recipientUserId = validateRequiredString(data.recipientUserId, 'recipientUserId');
  const title = validateRequiredString(data.title, 'title');
  const body = validateRequiredString(data.body, 'body');
  const type = validateRequiredString(data.type, 'type');

  const now = new Date().toISOString();
  
  // If deduplicationKey is provided, check if notification already exists
  const id = data.deduplicationKey || data.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (data.deduplicationKey) {
    if (useLocalNotificationStore()) {
      const existing = localDb.getRaw().notifications.find((item: any) => item.id === id);
      if (existing) return toNotificationDoc(existing);
    } else {
      const existingSnap = await getAdminFirestore().collection(NOTIFICATIONS_COLLECTION).doc(id).get();
      if (existingSnap.exists) {
        return existingSnap.data() as NotificationDoc;
      }
    }
  }

  const notif: NotificationDoc = {
    ...data,
    id,
    recipientUserId,
    title,
    body,
    type,
    isRead: false,
    createdAt: now,
  };

  if (useLocalNotificationStore()) {
    localDb.getRaw().notifications.unshift({
      ...notif,
      userId: notif.recipientUserId,
      titleAr: notif.title,
      titleEn: notif.title,
      messageAr: notif.body,
      messageEn: notif.body,
    } as any);
    localDb.save();
    return notif;
  }

  await getAdminFirestore().collection(NOTIFICATIONS_COLLECTION).doc(id).set(notif);
  return notif;
}

export async function getNotificationsForUser(recipientUserId: string): Promise<NotificationDoc[]> {
  const items = useLocalNotificationStore()
    ? localDb
        .getRaw()
        .notifications.filter((item: any) => item.userId === recipientUserId || item.recipientUserId === recipientUserId)
        .map(toNotificationDoc)
    : (await getAdminFirestore()
        .collection(NOTIFICATIONS_COLLECTION)
        .where('recipientUserId', '==', recipientUserId)
        .get()).docs.map(d => d.data() as NotificationDoc);
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (useLocalNotificationStore()) {
    const item = localDb.getRaw().notifications.find((notification: any) => notification.id === id);
    if (item) {
      item.isRead = true;
      localDb.save();
    }
    return;
  }

  await getAdminFirestore().collection(NOTIFICATIONS_COLLECTION).doc(id).update({ isRead: true });
}

export async function markAllNotificationsAsReadForUser(recipientUserId: string): Promise<void> {
  if (useLocalNotificationStore()) {
    localDb.getRaw().notifications.forEach((item: any) => {
      if ((item.userId === recipientUserId || item.recipientUserId === recipientUserId) && !item.isRead) {
        item.isRead = true;
      }
    });
    localDb.save();
    return;
  }

  const snap = await getAdminFirestore()
    .collection(NOTIFICATIONS_COLLECTION)
    .where('recipientUserId', '==', recipientUserId)
    .where('isRead', '==', false)
    .get();
  const promises = snap.docs.map(d => d.ref.update({ isRead: true }));
  await Promise.all(promises);
}
