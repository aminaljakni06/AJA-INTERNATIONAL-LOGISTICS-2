import { MessageDoc } from '../../types/firestore';
import { validateRequiredString } from '../validation';
import { db as localDb } from '../database';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const MESSAGES_COLLECTION = 'messages';

function useLocalMessageStore(): boolean {
  return (
    process.env.FORCE_LOCAL_DATA_FALLBACK === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true')
  );
}

function toMessageDoc(item: any): MessageDoc {
  return {
    id: item.id,
    customerId: item.customerId || item.receiverId || item.senderId,
    shipmentId: item.shipmentId ?? null,
    senderId: item.senderId,
    senderRole: item.senderRole,
    message: item.message || item.content || '',
    attachment: item.attachment ?? null,
    attachmentName: item.attachmentName,
    attachmentType: item.attachmentType,
    status: item.status || (item.isRead ? 'READ' : 'SENT'),
    createdAt: item.createdAt,
  };
}

export async function createMessage(
  data: Omit<MessageDoc, 'id' | 'createdAt' | 'status'> & { id?: string }
): Promise<MessageDoc> {
  const customerId = validateRequiredString(data.customerId, 'customerId');
  const senderId = validateRequiredString(data.senderId, 'senderId');
  const messageText = validateRequiredString(data.message, 'message');

  const now = new Date().toISOString();
  const id = data.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const msg: MessageDoc = {
    ...data,
    id,
    customerId,
    senderId,
    message: messageText,
    status: 'SENT',
    createdAt: now,
  };

  if (useLocalMessageStore()) {
    localDb.getRaw().messages.push({
      ...msg,
      receiverId: msg.customerId,
      content: msg.message,
      isRead: msg.status === 'READ',
      senderName: (data as any).senderName || msg.senderId,
    } as any);
    localDb.save();
    return msg;
  }

  await getAdminFirestore().collection(MESSAGES_COLLECTION).doc(id).set(msg);
  return msg;
}

export async function getMessagesByCustomer(
  customerId: string, 
  shipmentId?: string
): Promise<MessageDoc[]> {
  let items: MessageDoc[];
  if (useLocalMessageStore()) {
    items = localDb
      .getRaw()
      .messages.map(toMessageDoc)
      .filter((message) => message.customerId === customerId && (!shipmentId || message.shipmentId === shipmentId));
    items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return items;
  }

  let ref: FirebaseFirestore.Query = getAdminFirestore()
    .collection(MESSAGES_COLLECTION)
    .where('customerId', '==', customerId);
  if (shipmentId) {
    ref = ref.where('shipmentId', '==', shipmentId);
  }
  const snap = await ref.get();
  items = snap.docs.map(d => d.data() as MessageDoc);
  items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return items;
}

export async function getAllMessages(): Promise<MessageDoc[]> {
  const items = useLocalMessageStore()
    ? localDb.getRaw().messages.map(toMessageDoc)
    : (await getAdminFirestore().collection(MESSAGES_COLLECTION).get()).docs.map(d => d.data() as MessageDoc);
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items;
}

export async function markMessagesAsRead(messageIds: string[]): Promise<void> {
  if (useLocalMessageStore()) {
    localDb.getRaw().messages.forEach((message: any) => {
      if (messageIds.includes(message.id)) {
        message.status = 'READ';
        message.isRead = true;
      }
    });
    localDb.save();
    return;
  }

  for (const id of messageIds) {
    await getAdminFirestore().collection(MESSAGES_COLLECTION).doc(id).update({ status: 'READ' });
  }
}

export async function deleteMessage(id: string): Promise<void> {
  if (useLocalMessageStore()) {
    const data = localDb.getRaw();
    data.messages = data.messages.filter((message) => message.id !== id);
    localDb.save();
    return;
  }

  await getAdminFirestore().collection(MESSAGES_COLLECTION).doc(id).delete();
}
