import { AuditLogDoc } from '../../types/firestore';
import { validateRequiredString } from '../validation';
import { db as localDb } from '../database';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const AUDIT_COLLECTION = 'auditLogs';

function useLocalAuditStore(): boolean {
  return (
    process.env.FORCE_LOCAL_DATA_FALLBACK === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true')
  );
}

export async function createAuditLog(
  data: Omit<AuditLogDoc, 'id' | 'createdAt'> & { id?: string }
): Promise<AuditLogDoc> {
  const actorUserId = validateRequiredString(data.actorUserId, 'actorUserId');
  const action = validateRequiredString(data.action, 'action');
  const entityType = validateRequiredString(data.entityType, 'entityType');
  const entityId = validateRequiredString(data.entityId, 'entityId');

  const now = new Date().toISOString();
  const id = data.id || `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const log: AuditLogDoc = {
    ...data,
    id,
    actorUserId,
    action,
    entityType,
    entityId,
    before: data.before || null,
    after: data.after || null,
    createdAt: now,
  };

  if (useLocalAuditStore()) {
    localDb.getRaw().audit_logs.unshift({
      id,
      actorId: actorUserId,
      actorEmail: (data as any).actorEmail || 'system@aja-logistics.local',
      actorRole: (data as any).actorRole || 'SYSTEM',
      action,
      entityType,
      entityId,
      details: { before: log.before, after: log.after },
      timestamp: now,
    } as any);
    localDb.save();
    return log;
  }

  await getAdminFirestore().collection(AUDIT_COLLECTION).doc(id).set(log);
  return log;
}

export async function listAuditLogs(limitCount = 100): Promise<AuditLogDoc[]> {
  if (useLocalAuditStore()) {
    return localDb
      .getRaw()
      .audit_logs.slice(0, limitCount)
      .map((log: any) => ({
        id: log.id,
        actorUserId: log.actorUserId || log.actorId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        before: log.before || log.details?.before || null,
        after: log.after || log.details?.after || log.details || null,
        createdAt: log.createdAt || log.timestamp,
      }));
  }

  const snap = await getAdminFirestore().collection(AUDIT_COLLECTION).limit(limitCount).get();
  const logs = snap.docs.map((d) => d.data() as AuditLogDoc);
  logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return logs;
}
