/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Shipment Application Service
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { ServiceResult, RequestContext } from '../types/sharedServices';
import { Shipment, QuoteRequest } from '../types';
import { baseEnterpriseService } from './baseService';
import { enterpriseCache } from './enterpriseCache';

class EnterpriseShipmentService {
  /**
   * Fetch paginated shipments list with filters
   */
  public async getShipments(
    params?: { page?: number; limit?: number; status?: string; search?: string },
    context?: RequestContext
  ): Promise<ServiceResult<{ items: Shipment[]; total: number }>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    return baseEnterpriseService.fetchWithContext<{ items: Shipment[]; total: number }>(
      `/api/shipments?${query.toString()}`,
      { method: 'GET' },
      context,
      { tags: ['shipments'], ttlMs: 2 * 60 * 1000 }
    );
  }

  /**
   * Fetch single shipment by ID or Tracking Reference
   */
  public async getShipmentByTrackingNumber(
    trackingNumber: string,
    context?: RequestContext
  ): Promise<ServiceResult<Shipment>> {
    return baseEnterpriseService.fetchWithContext<Shipment>(
      `/api/shipments/track/${encodeURIComponent(trackingNumber)}`,
      { method: 'GET' },
      context,
      { tags: ['shipments'], ttlMs: 1 * 60 * 1000 }
    );
  }

  /**
   * Create new Shipment
   */
  public async createShipment(
    payload: Partial<Shipment>,
    context?: RequestContext
  ): Promise<ServiceResult<Shipment>> {
    const result = await baseEnterpriseService.fetchWithContext<Shipment>(
      '/api/shipments',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      context
    );

    if (result.success) {
      enterpriseCache.invalidateTag('shipments');
    }
    return result;
  }

  /**
   * Submit Quote Request
   */
  public async requestQuote(
    payload: Partial<QuoteRequest>,
    context?: RequestContext
  ): Promise<ServiceResult<QuoteRequest>> {
    const result = await baseEnterpriseService.fetchWithContext<QuoteRequest>(
      '/api/quotes/request',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      context
    );

    if (result.success) {
      enterpriseCache.invalidateTag('quotes');
    }
    return result;
  }
}

export const enterpriseShipmentService = new EnterpriseShipmentService();
