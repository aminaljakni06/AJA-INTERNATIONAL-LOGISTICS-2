/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Global Search Service
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { ServiceResult, RequestContext, SearchResultGroup } from '../types/sharedServices';
import { baseEnterpriseService } from './baseService';

class EnterpriseSearchService {
  /**
   * Global cross-module search
   */
  public async globalSearch(
    query: string,
    context?: RequestContext
  ): Promise<ServiceResult<SearchResultGroup[]>> {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }

    return baseEnterpriseService.fetchWithContext<SearchResultGroup[]>(
      `/api/search/global?q=${encodeURIComponent(query)}`,
      { method: 'GET' },
      context,
      { ttlMs: 30 * 1000 } // 30 sec search cache
    );
  }
}

export const enterpriseSearchService = new EnterpriseSearchService();
