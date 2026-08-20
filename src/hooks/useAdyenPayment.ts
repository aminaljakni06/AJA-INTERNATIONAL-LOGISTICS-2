import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { offlinePaymentQueue, QueuedPaymentTransaction } from '../utils/offlinePaymentQueue';

export interface AdyenSessionParams {
  amount: number;
  currency?: string;
  reference: string;
  description?: string;
  returnUrl?: string;
  shopperLocale?: string;
}

export interface AdyenSessionData {
  id: string;
  sessionData: string;
  clientKey: string;
  environment: string;
  merchantAccount?: string;
  amount: {
    currency: string;
    value: number;
  };
  reference: string;
  status?: string;
}

export interface AdyenPaymentParams {
  amount: number;
  currency?: string;
  reference: string;
  entityType?: 'QUOTE' | 'SHIPMENT' | 'QUOTE_REQUEST';
  entityId?: string;
  description?: string;
  paymentMethod: {
    type: 'scheme' | 'mada' | 'applepay' | 'paywithgoogle' | 'googlepay' | 'sadad' | 'directEbanking';
  };
  cardDetails?: {
    number: string;
    holder: string;
    expiry: string;
    cvv?: string;
  };
  installments?: {
    value: number; // 3 or 6 months
  };
}

export interface AdyenPaymentResult {
  pspReference: string;
  resultCode: 'Authorised' | 'Refused' | 'Pending' | 'Cancelled' | 'Error' | 'OfflineQueued';
  merchantReference: string;
  amount: {
    currency: string;
    value: number;
  };
  paymentMethod: string;
  refusalReason?: string;
  timestamp: string;
  installments?: {
    value: number;
    monthlyAmount: number;
    currency: string;
  };
  queuedTransaction?: QueuedPaymentTransaction;
}

export interface AdyenWebhookEvent {
  eventCode: string;
  pspReference: string;
  merchantReference: string;
  success: boolean;
  amount: {
    currency: string;
    value: number;
  };
  paymentMethod?: string;
  eventDate: string;
}

export type AdyenPaymentStatus = 
  | 'idle' 
  | 'creating_session' 
  | 'session_ready' 
  | 'processing' 
  | '3ds_challenge' 
  | 'authorised' 
  | 'refused' 
  | 'error'
  | 'offline_queued';

/**
 * Custom React Hook to manage Adyen Payment state lifecycle:
 * - Session creation (/api/payments/adyen/sessions)
 * - Payment processing & 3DS challenge handling (/api/payments/adyen/payments)
 * - Additional payment details / redirects (/api/payments/adyen/paymentDetails)
 * - Webhook notification listener & event confirmation (/api/payments/adyen/webhook)
 */
export function useAdyenPayment() {
  const { token } = useAuth();
  const [status, setStatus] = useState<AdyenPaymentStatus>('idle');
  const [session, setSession] = useState<AdyenSessionData | null>(null);
  const [paymentResult, setPaymentResult] = useState<AdyenPaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [webhookEvent, setWebhookEvent] = useState<AdyenWebhookEvent | null>(null);

  /**
   * Creates an Adyen Checkout Session
   */
  const createSession = useCallback(async (params: AdyenSessionParams): Promise<AdyenSessionData | null> => {
    setStatus('creating_session');
    setError(null);

    try {
      const response = await fetch('/api/payments/adyen/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Adyen Checkout Session');
      }

      setSession(data);
      setStatus('session_ready');
      return data;
    } catch (err: any) {
      const msg = err.message || 'Error creating Adyen session';
      setError(msg);
      setStatus('error');
      return null;
    }
  }, [token]);

  /**
   * Processes a direct payment or card charge via Adyen Checkout API
   * Automatically queues transaction if device is offline or connection drops
   */
  const processPayment = useCallback(async (params: AdyenPaymentParams): Promise<AdyenPaymentResult | null> => {
    setStatus('processing');
    setError(null);

    // If device is offline, enqueue immediately
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const queued = offlinePaymentQueue.enqueueTransaction({
        referenceNumber: params.reference,
        amount: params.amount,
        currency: params.currency || 'SAR',
        paymentMethod: params.paymentMethod.type,
        cardDetails: params.cardDetails
          ? {
              holderName: params.cardDetails.holder,
              number: params.cardDetails.number,
              expiry: params.cardDetails.expiry,
              cvv: params.cardDetails.cvv,
            }
          : undefined,
        installments: params.installments,
        entityType: params.entityType as any,
        entityId: params.entityId,
        description: params.description,
      });

      const offlineResult: AdyenPaymentResult = {
        pspReference: queued.id,
        resultCode: 'OfflineQueued',
        merchantReference: params.reference,
        amount: {
          currency: params.currency || 'SAR',
          value: params.amount,
        },
        paymentMethod: params.paymentMethod.type,
        timestamp: new Date().toISOString(),
        queuedTransaction: queued,
      };

      setPaymentResult(offlineResult);
      setStatus('offline_queued');
      return offlineResult;
    }

    try {
      // Simulate 3DS challenge transition for security verification UI
      setStatus('3ds_challenge');
      await new Promise((r) => setTimeout(r, 1000));

      const response = await fetch('/api/payments/adyen/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(params),
      });

      const data: AdyenPaymentResult = await response.json();

      if (response.ok && data.resultCode === 'Authorised') {
        setPaymentResult(data);
        setStatus('authorised');
        return data;
      } else {
        setPaymentResult(data);
        setStatus('refused');
        setError(data.refusalReason || 'Payment declined by issuing bank');
        return data;
      }
    } catch (err: any) {
      // If network request failed (e.g. lost connection mid-flight), fallback to offline queuing
      console.warn('Network error during payment submission, queueing offline:', err);
      
      const queued = offlinePaymentQueue.enqueueTransaction({
        referenceNumber: params.reference,
        amount: params.amount,
        currency: params.currency || 'SAR',
        paymentMethod: params.paymentMethod.type,
        cardDetails: params.cardDetails
          ? {
              holderName: params.cardDetails.holder,
              number: params.cardDetails.number,
              expiry: params.cardDetails.expiry,
              cvv: params.cardDetails.cvv,
            }
          : undefined,
        installments: params.installments,
        entityType: params.entityType as any,
        entityId: params.entityId,
        description: params.description,
      });

      const offlineResult: AdyenPaymentResult = {
        pspReference: queued.id,
        resultCode: 'OfflineQueued',
        merchantReference: params.reference,
        amount: {
          currency: params.currency || 'SAR',
          value: params.amount,
        },
        paymentMethod: params.paymentMethod.type,
        timestamp: new Date().toISOString(),
        queuedTransaction: queued,
      };

      setPaymentResult(offlineResult);
      setStatus('offline_queued');
      return offlineResult;
    }
  }, [token]);

  /**
   * Submits 3DS2 details or additional authentication credentials
   */
  const submitAdditionalDetails = useCallback(async (details: any) => {
    setStatus('processing');
    try {
      const response = await fetch('/api/payments/adyen/paymentDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(details),
      });

      const data = await response.json();
      if (response.ok && data.resultCode === 'Authorised') {
        setStatus('authorised');
        setPaymentResult(data);
        return data;
      } else {
        setStatus('refused');
        setError(data.refusalReason || '3D Secure authentication failed');
        return data;
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting payment details');
      setStatus('error');
      return null;
    }
  }, [token]);

  /**
   * Dispatches or simulates an Adyen Webhook event notification to confirm payment status asynchronously
   */
  const handleWebhookNotification = useCallback(async (payload: any) => {
    try {
      const response = await fetch('/api/payments/adyen/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const item = payload.notificationItems?.[0]?.NotificationRequestItem || payload;
        const parsedEvent: AdyenWebhookEvent = {
          eventCode: item.eventCode || 'AUTHORISATION',
          pspReference: item.pspReference || `PSP-${Date.now()}`,
          merchantReference: item.merchantReference || 'REF-WEBHOOK',
          success: item.success === 'true' || item.success === true,
          amount: item.amount || { currency: 'SAR', value: 0 },
          paymentMethod: item.paymentMethod || 'scheme',
          eventDate: item.eventDate || new Date().toISOString(),
        };
        setWebhookEvent(parsedEvent);
        return parsedEvent;
      }
    } catch (err) {
      console.error('Error handling webhook notification:', err);
    }
    return null;
  }, []);

  /**
   * Resets hook state to default
   */
  const resetState = useCallback(() => {
    setStatus('idle');
    setSession(null);
    setPaymentResult(null);
    setError(null);
    setWebhookEvent(null);
  }, []);

  return {
    status,
    session,
    paymentResult,
    error,
    webhookEvent,
    isLoading: status === 'creating_session' || status === 'processing' || status === '3ds_challenge',
    createSession,
    processPayment,
    submitAdditionalDetails,
    handleWebhookNotification,
    resetState,
  };
}
