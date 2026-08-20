import {
  AccountStatus,
  ChartOfAccount,
  CurrencyRate,
  ExecutiveFinanceSummary,
  FinancialDimensionValue,
  FiscalPeriod,
  FiscalYear,
  IntercompanyAccount,
  JournalEntry,
  TrialBalanceRow,
} from '../types/generalLedger';

export interface GeneralLedgerSnapshot {
  summary: ExecutiveFinanceSummary;
  accounts: ChartOfAccount[];
  journals: JournalEntry[];
  dimensions: FinancialDimensionValue[];
  fiscalYear: FiscalYear;
  currencies: CurrencyRate[];
  intercompanyAccounts: IntercompanyAccount[];
  trialBalanceRows: TrialBalanceRow[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/general-ledger${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'General ledger request failed');
  }

  return payload as T;
};

export const GeneralLedgerClient = {
  async getSnapshot(): Promise<GeneralLedgerSnapshot> {
    return requestPayload<GeneralLedgerSnapshot>('/snapshot');
  },

  async addAccount(account: Omit<ChartOfAccount, 'id' | 'createdAt' | 'updatedAt' | 'currentBalanceSAR' | 'ytdDebitSAR' | 'ytdCreditSAR'>): Promise<{ account: ChartOfAccount; snapshot: GeneralLedgerSnapshot }> {
    return requestPayload('/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  },

  async updateAccountStatus(accountCode: string, status: AccountStatus): Promise<{ snapshot: GeneralLedgerSnapshot }> {
    return requestPayload(`/accounts/${encodeURIComponent(accountCode)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async createJournalEntry(journal: Omit<JournalEntry, 'id' | 'journalNumber' | 'preparedAt' | 'status'>): Promise<{ journal: JournalEntry; snapshot: GeneralLedgerSnapshot }> {
    return requestPayload('/journals', {
      method: 'POST',
      body: JSON.stringify(journal),
    });
  },

  async postJournalEntry(journalId: string, postedBy: string): Promise<{ journal: JournalEntry; snapshot: GeneralLedgerSnapshot }> {
    return requestPayload(`/journals/${encodeURIComponent(journalId)}/post`, {
      method: 'POST',
      body: JSON.stringify({ postedBy }),
    });
  },

  async addDimensionValue(dimension: Omit<FinancialDimensionValue, 'id'>): Promise<{ dimension: FinancialDimensionValue; snapshot: GeneralLedgerSnapshot }> {
    return requestPayload('/dimensions', {
      method: 'POST',
      body: JSON.stringify(dimension),
    });
  },

  async updatePeriodStatus(periodId: string, status: FiscalPeriod['status'], userName: string): Promise<{ snapshot: GeneralLedgerSnapshot }> {
    return requestPayload(`/periods/${encodeURIComponent(periodId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, userName }),
    });
  },

  async updateCurrencyRate(currencyCode: string, rateToBaseSAR: number): Promise<{ snapshot: GeneralLedgerSnapshot }> {
    return requestPayload(`/currencies/${encodeURIComponent(currencyCode)}/rate`, {
      method: 'PATCH',
      body: JSON.stringify({ rateToBaseSAR }),
    });
  },

  async eliminateIntercompanyAccount(intercompanyAccountId: string): Promise<{ snapshot: GeneralLedgerSnapshot }> {
    return requestPayload(`/intercompany/${encodeURIComponent(intercompanyAccountId)}/eliminate`, {
      method: 'POST',
    });
  },
};
