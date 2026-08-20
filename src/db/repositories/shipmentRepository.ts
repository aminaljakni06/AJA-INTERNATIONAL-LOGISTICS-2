import { ShipmentDoc } from '../../types/firestore';
import { validateRequiredString, validateTrackingNumber } from '../validation';
import { db as localDb } from '../database';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const SHIPMENTS_COLLECTION = 'shipments';

function useLocalShipmentStore(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

function toShipmentDoc(shipment: any): ShipmentDoc {
  return {
    ...shipment,
    shipmentType: shipment.shipmentType || shipment.serviceType,
    pickupLocation: shipment.pickupLocation || shipment.origin,
    deliveryLocation: shipment.deliveryLocation || shipment.destination,
    shippingDate: shipment.shippingDate || shipment.createdAt,
    estimatedArrivalDate: shipment.estimatedArrivalDate || shipment.estimatedDelivery,
    currentStatus: shipment.currentStatus || shipment.status || 'RECEIVED',
  } as ShipmentDoc;
}

function findLocalShipmentById(id: string): ShipmentDoc | null {
  const shipment = localDb.getRaw().shipments.find((item: any) => item.id === id);
  return shipment ? toShipmentDoc(shipment) : null;
}

function findLocalShipmentByTrackingNumber(trackingNumber: string): ShipmentDoc | null {
  const shipment = localDb
    .getRaw()
    .shipments.find((item: any) => item.trackingNumber === trackingNumber);
  return shipment ? toShipmentDoc(shipment) : null;
}

export async function getShipmentById(id: string): Promise<ShipmentDoc | null> {
  if (!id) return null;
  if (useLocalShipmentStore()) {
    return findLocalShipmentById(id);
  }

  const snap = await getAdminFirestore().collection(SHIPMENTS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as ShipmentDoc;
}

export async function getShipmentByTrackingNumber(trackingNumber: string): Promise<ShipmentDoc | null> {
  const cleanTracking = validateTrackingNumber(trackingNumber);
  if (useLocalShipmentStore()) {
    return findLocalShipmentByTrackingNumber(cleanTracking);
  }

  const snap = await getAdminFirestore()
    .collection(SHIPMENTS_COLLECTION)
    .where('trackingNumber', '==', cleanTracking)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as ShipmentDoc;
}

export async function createShipment(
  data: Omit<ShipmentDoc, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<ShipmentDoc> {
  const customerId = validateRequiredString(data.customerId, 'customerId');
  const shipmentType = validateRequiredString(data.shipmentType, 'shipmentType');
  const pickupLocation = validateRequiredString(data.pickupLocation, 'pickupLocation');
  const deliveryLocation = validateRequiredString(data.deliveryLocation, 'deliveryLocation');
  const trackingNumber = validateTrackingNumber(data.trackingNumber);

  const existingByTracking = await getShipmentByTrackingNumber(trackingNumber).catch(() => null);
  if (existingByTracking) {
    throw new Error(`رقم التتبع (${trackingNumber}) مستخدم مسبقاً في النظام ولا يمكن تكراره.`);
  }

  const now = new Date().toISOString();
  const id = data.id || `SHP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const shipment: ShipmentDoc = {
    ...data,
    id,
    trackingNumber,
    customerId,
    shipmentType,
    pickupLocation,
    deliveryLocation,
    currentStatus: data.currentStatus || 'RECEIVED',
    createdAt: now,
    updatedAt: now,
  };

  if (useLocalShipmentStore()) {
    localDb.getRaw().shipments.unshift({
      ...shipment,
      serviceType: shipment.shipmentType as any,
      origin: shipment.pickupLocation,
      destination: shipment.deliveryLocation,
      status: shipment.currentStatus as any,
      currentLocation: shipment.currentLocation || shipment.pickupLocation,
      estimatedDelivery: shipment.estimatedArrivalDate || null,
      customerName: (data as any).customerName || 'عميل أجا',
      customerPhone: (data as any).customerPhone || '',
      senderName: (data as any).senderName || shipment.pickupLocation,
      receiverName: (data as any).receiverName || shipment.deliveryLocation,
    } as any);
    localDb.save();
    return shipment;
  }

  await getAdminFirestore().collection(SHIPMENTS_COLLECTION).doc(id).set(shipment);
  return shipment;
}

export async function updateShipment(id: string, updates: Partial<ShipmentDoc>): Promise<ShipmentDoc> {
  const existing = await getShipmentById(id);
  if (!existing) {
    throw new Error(`Shipment ${id} not found`);
  }

  const now = new Date().toISOString();
  const payload = { ...updates, updatedAt: now };

  if (useLocalShipmentStore()) {
    const raw = localDb.getRaw();
    const index = raw.shipments.findIndex((item: any) => item.id === id);
    if (index === -1) {
      throw new Error(`Shipment ${id} not found`);
    }

    raw.shipments[index] = {
      ...raw.shipments[index],
      ...payload,
      serviceType: (payload.shipmentType as any) || (raw.shipments[index] as any).serviceType,
      origin: payload.pickupLocation || (raw.shipments[index] as any).origin,
      destination: payload.deliveryLocation || (raw.shipments[index] as any).destination,
      status: (payload.currentStatus as any) || (raw.shipments[index] as any).status,
      estimatedDelivery: payload.estimatedArrivalDate || (raw.shipments[index] as any).estimatedDelivery,
    } as any;
    localDb.save();
    return toShipmentDoc(raw.shipments[index]);
  }

  await getAdminFirestore().collection(SHIPMENTS_COLLECTION).doc(id).update(payload);
  return { ...existing, ...payload, updatedAt: now };
}

export async function listShipmentsForCustomer(customerId: string): Promise<ShipmentDoc[]> {
  if (useLocalShipmentStore()) {
    return localDb
      .getRaw()
      .shipments.filter((item: any) => item.customerId === customerId)
      .map(toShipmentDoc);
  }

  const snap = await getAdminFirestore()
    .collection(SHIPMENTS_COLLECTION)
    .where('customerId', '==', customerId)
    .get();
  return snap.docs.map(d => d.data() as ShipmentDoc);
}

export async function listAllShipments(): Promise<ShipmentDoc[]> {
  if (useLocalShipmentStore()) {
    return localDb.getRaw().shipments.map(toShipmentDoc);
  }

  const snap = await getAdminFirestore().collection(SHIPMENTS_COLLECTION).get();
  return snap.docs.map(d => d.data() as ShipmentDoc);
}
