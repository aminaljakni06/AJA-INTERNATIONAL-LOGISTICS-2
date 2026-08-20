import { ShipmentEventDoc } from '../../types/firestore';
import { validateRequiredString } from '../validation';
import { db as localDb } from '../database';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const SHIPMENT_EVENTS_COLLECTION = 'shipmentEvents';

function useLocalShipmentEventStore(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

function toShipmentEventDoc(event: any): ShipmentEventDoc {
  return {
    ...event,
    description: event.description || event.descriptionAr || event.descriptionEn || '',
    visibleToCustomer: event.visibleToCustomer ?? true,
    createdBy: event.createdBy || event.createdById || 'system',
    createdAt: event.createdAt || event.timestamp,
  } as ShipmentEventDoc;
}

export async function addShipmentEvent(
  data: Omit<ShipmentEventDoc, 'id' | 'createdAt'> & { id?: string }
): Promise<ShipmentEventDoc> {
  const shipmentId = validateRequiredString(data.shipmentId, 'shipmentId');
  const status = validateRequiredString(data.status, 'status');
  const description = validateRequiredString(data.description, 'description');
  const location = validateRequiredString(data.location, 'location');
  const createdBy = validateRequiredString(data.createdBy, 'createdBy');

  const now = new Date().toISOString();
  const id = data.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const event: ShipmentEventDoc = {
    ...data,
    id,
    shipmentId,
    status,
    description,
    location,
    visibleToCustomer: data.visibleToCustomer ?? true,
    createdBy,
    createdAt: now,
  };

  if (useLocalShipmentEventStore()) {
    localDb.getRaw().shipment_events.push({
      ...event,
      descriptionAr: event.description,
      timestamp: event.createdAt,
      createdById: event.createdBy,
    } as any);
    localDb.save();
    return event;
  }

  await getAdminFirestore().collection(SHIPMENT_EVENTS_COLLECTION).doc(id).set(event);
  return event;
}

export async function getEventsForShipment(
  shipmentId: string, 
  customerVisibleOnly = false
): Promise<ShipmentEventDoc[]> {
  if (useLocalShipmentEventStore()) {
    const raw = localDb.getRaw();
    const storedEvents = raw.shipment_events.filter((event: any) => event.shipmentId === shipmentId);
    const shipmentEvents =
      raw.shipments.find((shipment: any) => shipment.id === shipmentId)?.events || [];

    let events = [...storedEvents, ...shipmentEvents].map(toShipmentEventDoc);
    if (customerVisibleOnly) {
      events = events.filter((event) => event.visibleToCustomer);
    }
    events.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return events;
  }

  const snap = await getAdminFirestore()
    .collection(SHIPMENT_EVENTS_COLLECTION)
    .where('shipmentId', '==', shipmentId)
    .get();
  let events = snap.docs.map(d => d.data() as ShipmentEventDoc);

  if (customerVisibleOnly) {
    events = events.filter(e => e.visibleToCustomer);
  }

  // Sort ascending by createdAt
  events.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return events;
}
