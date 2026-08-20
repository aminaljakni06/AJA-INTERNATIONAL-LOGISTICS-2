import {
  AIReceivablesInsight,
  ARAnalytics,
  BadDebtProvision,
  CollectionCase,
  CustomerCreditProfile,
  CustomerInvoice,
  CustomerPayment,
  CustomerStatement,
  DunningLevel,
  InvoiceStatus,
  RevenueSchedule,
} from '../types/accountsReceivable';

export interface AccountsReceivableSnapshot {
  analytics: ARAnalytics;
  invoices: CustomerInvoice[];
  revenueSchedules: RevenueSchedule[];
  payments: CustomerPayment[];
  creditProfiles: CustomerCreditProfile[];
  collectionCases: CollectionCase[];
  badDebtProvisions: BadDebtProvision[];
  aiInsights: AIReceivablesInsight[];
}

type InvoiceCreatePayload = Omit<CustomerInvoice, 'id' | 'paidAmountSAR' | 'balanceDueSAR' | 'statusHistory' | 'createdAt' | 'updatedAt'>;

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/accounts-receivable${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Accounts receivable request failed');
  }

  return payload as T;
};

export const AccountsReceivableClient = {
  async getSnapshot(): Promise<AccountsReceivableSnapshot> {
    return requestPayload<AccountsReceivableSnapshot>('/snapshot');
  },

  async getCustomerStatement(customerId: string, periodStart: string, periodEnd: string): Promise<CustomerStatement> {
    const params = new URLSearchParams({ customerId, periodStart, periodEnd });
    const payload = await requestPayload<{ statement: CustomerStatement }>(`/statements?${params.toString()}`);
    return payload.statement;
  },

  async addInvoice(invoice: InvoiceCreatePayload): Promise<{ invoice: CustomerInvoice; snapshot: AccountsReceivableSnapshot }> {
    return requestPayload('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  },

  async updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus,
    noteEn?: string,
    noteAr?: string,
    changedBy?: string
  ): Promise<{ invoice: CustomerInvoice; snapshot: AccountsReceivableSnapshot }> {
    return requestPayload(`/invoices/${encodeURIComponent(invoiceId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, noteEn, noteAr, changedBy }),
    });
  },

  async recognizeMilestone(scheduleId: string, milestoneId: string): Promise<{ schedule: RevenueSchedule; snapshot: AccountsReceivableSnapshot }> {
    return requestPayload(`/revenue-schedules/${encodeURIComponent(scheduleId)}/milestones/${encodeURIComponent(milestoneId)}/recognize`, {
      method: 'POST',
    });
  },

  async toggleCreditHold(
    customerId: string,
    hold: boolean,
    reasonEn?: string,
    reasonAr?: string
  ): Promise<{ profile: CustomerCreditProfile; snapshot: AccountsReceivableSnapshot }> {
    return requestPayload(`/credit-profiles/${encodeURIComponent(customerId)}/hold`, {
      method: 'PATCH',
      body: JSON.stringify({ hold, reasonEn, reasonAr }),
    });
  },

  async updateCreditLimit(customerId: string, newLimitSAR: number, approvedBy: string): Promise<{ profile: CustomerCreditProfile; snapshot: AccountsReceivableSnapshot }> {
    return requestPayload(`/credit-profiles/${encodeURIComponent(customerId)}/limit`, {
      method: 'PATCH',
      body: JSON.stringify({ newLimitSAR, approvedBy }),
    });
  },

  async addCollectionNote(caseNumber: string, noteEn: string, noteAr: string, author: string): Promise<{ collectionCase: CollectionCase; snapshot: AccountsReceivableSnapshot }> {
    return requestPayload(`/collection-cases/${encodeURIComponent(caseNumber)}/notes`, {
      method: 'POST',
      body: JSON.stringify({ noteEn, noteAr, author }),
    });
  },

  async updateDunningLevel(caseNumber: string, level: DunningLevel): Promise<{ collectionCase: CollectionCase; snapshot: AccountsReceivableSnapshot }> {
    return requestPayload(`/collection-cases/${encodeURIComponent(caseNumber)}/dunning`, {
      method: 'PATCH',
      body: JSON.stringify({ level }),
    });
  },

  async updatePromiseToPay(caseNumber: string, promiseDate: string, promiseAmountSAR: number): Promise<{ collectionCase: CollectionCase; snapshot: AccountsReceivableSnapshot }> {
    return requestPayload(`/collection-cases/${encodeURIComponent(caseNumber)}/promise`, {
      method: 'PATCH',
      body: JSON.stringify({ promiseDate, promiseAmountSAR }),
    });
  },

  async approveWriteOff(provisionId: string, approvedBy: string): Promise<{ provision: BadDebtProvision; snapshot: AccountsReceivableSnapshot }> {
    return requestPayload(`/bad-debt-provisions/${encodeURIComponent(provisionId)}/approve-write-off`, {
      method: 'POST',
      body: JSON.stringify({ approvedBy }),
    });
  },
};
