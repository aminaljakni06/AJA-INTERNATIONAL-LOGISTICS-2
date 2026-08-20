/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Finance Application Service
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { ServiceResult, RequestContext } from '../types/sharedServices';
import { GeneralLedgerAccount, FinancialTransaction } from '../types';
import { baseEnterpriseService } from './baseService';
import { enterpriseCache } from './enterpriseCache';

class EnterpriseFinanceService {
  /**
   * Fetch Chart of Accounts
   */
  public async getChartOfAccounts(context?: RequestContext): Promise<ServiceResult<GeneralLedgerAccount[]>> {
    return baseEnterpriseService.fetchWithContext<GeneralLedgerAccount[]>(
      '/api/finance/accounts',
      { method: 'GET' },
      context,
      { tags: ['finance', 'chart-of-accounts'], ttlMs: 10 * 60 * 1000 }
    );
  }

  /**
   * Post Journal Entry
   */
  public async postJournalEntry(
    entry: {
      accountNumber: string;
      debit: number;
      credit: number;
      currency: string;
      description: string;
      reference: string;
    },
    context?: RequestContext
  ): Promise<ServiceResult<FinancialTransaction>> {
    const result = await baseEnterpriseService.fetchWithContext<FinancialTransaction>(
      '/api/finance/journal',
      {
        method: 'POST',
        body: JSON.stringify(entry),
      },
      context
    );

    if (result.success) {
      enterpriseCache.invalidateTag('finance');
    }
    return result;
  }
}

export const enterpriseFinanceService = new EnterpriseFinanceService();
