import { QuoteRequestDoc } from '../../types/firestore';
import { validateRequiredString } from '../validation';
import { db as localDb } from '../database';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const QUOTE_COLLECTION = 'quoteRequests';

function useLocalQuoteStore(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

function toQuoteRequestDoc(quote: any): QuoteRequestDoc {
  return {
    ...quote,
    requestNumber: quote.requestNumber || quote.id,
    shipmentType: quote.shipmentType || quote.serviceType,
    pickupLocation: quote.pickupLocation || quote.origin,
    deliveryLocation: quote.deliveryLocation || quote.destination,
    cargoType: quote.cargoType || quote.cargoDetails,
    approximateWeight: quote.approximateWeight ?? quote.weightKg ?? null,
    packageOrContainerCount: quote.packageOrContainerCount ?? quote.volumeCbm ?? null,
    quoteResponse:
      quote.quoteResponse ||
      (quote.offeredPrice
        ? {
            offeredPrice: quote.offeredPrice,
            currency: quote.currency || 'SAR',
          }
        : null),
  } as QuoteRequestDoc;
}

function findLocalQuoteById(id: string): QuoteRequestDoc | null {
  const quote = localDb.getRaw().quote_requests.find((item: any) => item.id === id || item.requestNumber === id);
  return quote ? toQuoteRequestDoc(quote) : null;
}

export async function getQuoteById(id: string): Promise<QuoteRequestDoc | null> {
  if (!id) return null;
  if (useLocalQuoteStore()) {
    return findLocalQuoteById(id);
  }

  const snap = await getAdminFirestore().collection(QUOTE_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as QuoteRequestDoc;
}

export async function getQuoteByRequestNumber(reqNo: string): Promise<QuoteRequestDoc | null> {
  if (useLocalQuoteStore()) {
    return findLocalQuoteById(reqNo);
  }

  const snap = await getAdminFirestore()
    .collection(QUOTE_COLLECTION)
    .where('requestNumber', '==', reqNo)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as QuoteRequestDoc;
}

export async function createQuoteRequest(
  data: Omit<QuoteRequestDoc, 'id' | 'requestNumber' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<QuoteRequestDoc> {
  const customerId = validateRequiredString(data.customerId, 'customerId');
  const shipmentType = validateRequiredString(data.shipmentType, 'shipmentType');
  const pickupLocation = validateRequiredString(data.pickupLocation, 'pickupLocation');
  const deliveryLocation = validateRequiredString(data.deliveryLocation, 'deliveryLocation');
  const cargoType = validateRequiredString(data.cargoType, 'cargoType');

  const now = new Date().toISOString();
  const id = data.id || `QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const requestNumber = `REQ-${Date.now().toString().slice(-6)}`;

  const quote: QuoteRequestDoc = {
    ...data,
    id,
    requestNumber,
    customerId,
    shipmentType,
    pickupLocation,
    deliveryLocation,
    cargoType,
    status: data.status || 'NEW',
    createdAt: now,
    updatedAt: now,
  };

  if (useLocalQuoteStore()) {
    localDb.getRaw().quote_requests.unshift({
      ...quote,
      serviceType: quote.shipmentType as any,
      origin: quote.pickupLocation,
      destination: quote.deliveryLocation,
      cargoDetails: quote.cargoType,
      offeredPrice: quote.quoteResponse?.offeredPrice ?? null,
      currency: quote.quoteResponse?.currency,
    } as any);
    localDb.save();
    return quote;
  }

  await getAdminFirestore().collection(QUOTE_COLLECTION).doc(id).set(quote);
  return quote;
}

export async function updateQuoteRequest(id: string, updates: Partial<QuoteRequestDoc>): Promise<QuoteRequestDoc> {
  const existing = await getQuoteById(id);
  if (!existing) {
    throw new Error(`Quote request ${id} not found`);
  }

  const now = new Date().toISOString();
  const payload = { ...updates, updatedAt: now };

  if (useLocalQuoteStore()) {
    const raw = localDb.getRaw();
    const index = raw.quote_requests.findIndex((item: any) => item.id === id || item.requestNumber === id);
    if (index === -1) {
      throw new Error(`Quote request ${id} not found`);
    }

    raw.quote_requests[index] = {
      ...raw.quote_requests[index],
      ...payload,
      serviceType: (payload.shipmentType as any) || (raw.quote_requests[index] as any).serviceType,
      origin: payload.pickupLocation || (raw.quote_requests[index] as any).origin,
      destination: payload.deliveryLocation || (raw.quote_requests[index] as any).destination,
      cargoDetails: payload.cargoType || (raw.quote_requests[index] as any).cargoDetails,
      offeredPrice:
        payload.quoteResponse?.offeredPrice ??
        (payload as any).offeredPrice ??
        (raw.quote_requests[index] as any).offeredPrice,
      currency: payload.quoteResponse?.currency || (raw.quote_requests[index] as any).currency,
    } as any;
    localDb.save();
    return toQuoteRequestDoc(raw.quote_requests[index]);
  }

  await getAdminFirestore().collection(QUOTE_COLLECTION).doc(id).update(payload);
  return { ...existing, ...payload, updatedAt: now };
}

export async function listQuotesForCustomer(customerId: string): Promise<QuoteRequestDoc[]> {
  if (useLocalQuoteStore()) {
    return localDb
      .getRaw()
      .quote_requests.filter((item: any) => item.customerId === customerId)
      .map(toQuoteRequestDoc);
  }

  const snap = await getAdminFirestore()
    .collection(QUOTE_COLLECTION)
    .where('customerId', '==', customerId)
    .get();
  return snap.docs.map(d => d.data() as QuoteRequestDoc);
}

export async function listAllQuotes(status?: string): Promise<QuoteRequestDoc[]> {
  if (useLocalQuoteStore()) {
    const quotes = localDb.getRaw().quote_requests.map(toQuoteRequestDoc);
    return status ? quotes.filter((quote) => quote.status === status) : quotes;
  }

  let ref: FirebaseFirestore.Query = getAdminFirestore().collection(QUOTE_COLLECTION);
  if (status) {
    ref = ref.where('status', '==', status);
  }
  const snap = await ref.get();
  return snap.docs.map(d => d.data() as QuoteRequestDoc);
}
