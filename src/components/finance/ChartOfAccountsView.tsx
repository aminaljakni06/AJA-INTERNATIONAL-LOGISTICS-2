import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Folder,
  FileText,
  Lock,
  Unlock,
  Building2,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ChartOfAccount, AccountCategory, AccountStatus } from '../../types/generalLedger';

interface ChartOfAccountsViewProps {
  accounts: ChartOfAccount[];
  onAddAccount: (acc: Omit<ChartOfAccount, 'id' | 'createdAt' | 'updatedAt' | 'currentBalanceSAR' | 'ytdDebitSAR' | 'ytdCreditSAR'>) => void;
  onUpdateStatus: (code: string, status: AccountStatus) => void;
}

export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({
  accounts,
  onAddAccount,
  onUpdateStatus
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formCategory, setFormCategory] = useState<AccountCategory>('ASSETS');
  const [formParentCode, setFormParentCode] = useState('');
  const [formIsHeader, setFormIsHeader] = useState(false);
  const [formCurrency, setFormCurrency] = useState('SAR');

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc.accountCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.accountNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.accountNameAr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || acc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formNameEn || !formNameAr) return;

    onAddAccount({
      accountCode: formCode,
      accountNameEn: formNameEn,
      accountNameAr: formNameAr,
      category: formCategory,
      parentAccountCode: formParentCode || undefined,
      hierarchyLevel: formParentCode ? 3 : 1,
      isHeader: formIsHeader,
      isPosting: !formIsHeader,
      allowDirectPosting: !formIsHeader,
      currency: formCurrency,
      status: 'ACTIVE',
      naturalAccountCode: formCode,
      companyId: 'comp-101'
    });

    setIsModalOpen(false);
    setFormCode('');
    setFormNameEn('');
    setFormNameAr('');
  };

  const formatSAR = (amount: number) => {
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const categoryLabels: Record<AccountCategory, { en: string; ar: string; bg: string }> = {
    ASSETS: { en: 'Assets', ar: 'الأصول', bg: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    LIABILITIES: { en: 'Liabilities', ar: 'الالتزامات', bg: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    EQUITY: { en: 'Equity', ar: 'حقوق الملكية', bg: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    REVENUE: { en: 'Revenue', ar: 'الإيرادات', bg: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    COST_OF_SALES: { en: 'Cost of Sales', ar: 'تكلفة المبيعات', bg: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    OPERATING_EXPENSES: { en: 'OpEx', ar: 'المصاريف التشغيلية', bg: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    OTHER_INCOME: { en: 'Other Income', ar: 'إيرادات أخرى', bg: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    OTHER_EXPENSES: { en: 'Other Expenses', ar: 'مصاريف أخرى', bg: 'text-red-400 bg-red-500/10 border-red-500/20' },
    MEMORANDUM_ACCOUNTS: { en: 'Memo Accounts', ar: 'حسابات نظامية', bg: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-400" />
            <span>{isAr ? 'شجرة دليل الحسابات المالي (Chart of Accounts)' : 'Enterprise Chart of Accounts'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'إدارة الهيكل التنظيمي للحسابات، الترحيل المباشر والتنظيف القياسي (GAAP/IFRS)' : 'Manage hierarchy, natural accounts, and direct posting controls'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-sm shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة حساب جديد' : 'Add New Account'}</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'البحث برقم الحساب أو اسم الحساب بالعربي/إنجليزي...' : 'Search by account code or name...'}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">{isAr ? 'جميع الفئات الحسابية' : 'All Categories'}</option>
            <option value="ASSETS">{isAr ? 'الأصول (Assets)' : 'Assets'}</option>
            <option value="LIABILITIES">{isAr ? 'الالتزامات (Liabilities)' : 'Liabilities'}</option>
            <option value="EQUITY">{isAr ? 'حقوق الملكية (Equity)' : 'Equity'}</option>
            <option value="REVENUE">{isAr ? 'الإيرادات (Revenue)' : 'Revenue'}</option>
            <option value="COST_OF_SALES">{isAr ? 'تكلفة المبيعات (Cost of Sales)' : 'Cost of Sales'}</option>
            <option value="OPERATING_EXPENSES">{isAr ? 'المصاريف التشغيلية (OpEx)' : 'Operating Expenses'}</option>
          </select>
        </div>
      </div>

      {/* Account Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/90 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3.5">{isAr ? 'رمز الحساب' : 'Code'}</th>
                <th className="px-4 py-3.5">{isAr ? 'اسم الحساب (عربي / إنجليزي)' : 'Account Name'}</th>
                <th className="px-4 py-3.5">{isAr ? 'الفئة' : 'Category'}</th>
                <th className="px-4 py-3.5">{isAr ? 'النوع' : 'Type'}</th>
                <th className="px-4 py-3.5">{isAr ? 'العملة' : 'Currency'}</th>
                <th className="px-4 py-3.5 text-right">{isAr ? 'الرصيد الحالي' : 'Current Balance'}</th>
                <th className="px-4 py-3.5 text-center">{isAr ? 'الحالة والتحكم' : 'Status & Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredAccounts.map(account => {
                const isHeader = account.isHeader;
                const indentLevel = (account.hierarchyLevel - 1) * 16;
                const catInfo = categoryLabels[account.category];

                return (
                  <tr
                    key={account.id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isHeader ? 'bg-slate-800/30 font-bold text-white' : ''
                    }`}
                  >
                    {/* Account Code */}
                    <td className="px-4 py-3 font-mono text-sky-400 font-bold whitespace-nowrap">
                      {account.accountCode}
                    </td>

                    {/* Account Name with Indentation */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${indentLevel}px` }}>
                        {isHeader ? (
                          <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <div className={`text-sm ${isHeader ? 'text-white font-bold' : 'text-slate-200'}`}>
                            {isAr ? account.accountNameAr : account.accountNameEn}
                          </div>
                          <div className="text-[11px] text-slate-500 font-sans">
                            {isAr ? account.accountNameEn : account.accountNameAr}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${catInfo?.bg}`}>
                        {isAr ? catInfo?.ar : catInfo?.en}
                      </span>
                    </td>

                    {/* Account Type */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        isHeader ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {isHeader ? (isAr ? 'مجموعة رئيسية' : 'Header Group') : (isAr ? 'حساب ترحيل' : 'Posting Account')}
                      </span>
                    </td>

                    {/* Currency */}
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-300">
                      {account.currency}
                    </td>

                    {/* Balance */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      {formatSAR(account.currentBalanceSAR)}
                    </td>

                    {/* Status & Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          account.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {account.status}
                        </span>

                        {!isHeader && (
                          <button
                            onClick={() => onUpdateStatus(account.accountCode, account.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE')}
                            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                            title={account.status === 'ACTIVE' ? 'Freeze Account' : 'Activate Account'}
                          >
                            {account.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                <span>{isAr ? 'إضافة حساب جديد في الدليل' : 'Create New Account'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  {isAr ? 'رقم / رمز الحساب Code' : 'Account Code'}
                </label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  placeholder="e.g. 101300"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    {isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameEn}
                    onChange={e => setFormNameEn(e.target.value)}
                    placeholder="e.g. Riyad Bank Operating"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    {isAr ? 'الاسم بالعربية' : 'Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={e => setFormNameAr(e.target.value)}
                    placeholder="مثال: بنك الرياض التشغيلي"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    {isAr ? 'الفئة الحسابية Category' : 'Account Category'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="ASSETS">ASSETS (الأصول)</option>
                    <option value="LIABILITIES">LIABILITIES (الالتزامات)</option>
                    <option value="EQUITY">EQUITY (حقوق الملكية)</option>
                    <option value="REVENUE">REVENUE (الإيرادات)</option>
                    <option value="COST_OF_SALES">COST OF SALES (تكلفة المبيعات)</option>
                    <option value="OPERATING_EXPENSES">OPERATING EXPENSES (المصاريف)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    {isAr ? 'العملة Currency' : 'Account Currency'}
                  </label>
                  <select
                    value={formCurrency}
                    onChange={e => setFormCurrency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="SAR">SAR (ريال سعودي)</option>
                    <option value="USD">USD (دولار أمريكي)</option>
                    <option value="AED">AED (درهم إماراتي)</option>
                    <option value="EUR">EUR (يورو)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  {isAr ? 'رمز الحساب الأب (إن وجد)' : 'Parent Account Code (Optional)'}
                </label>
                <input
                  type="text"
                  value={formParentCode}
                  onChange={e => setFormParentCode(e.target.value)}
                  placeholder="e.g. 101000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isHeaderCheck"
                  checked={formIsHeader}
                  onChange={e => setFormIsHeader(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-0"
                />
                <label htmlFor="isHeaderCheck" className="text-sm font-semibold text-slate-200 cursor-pointer">
                  {isAr ? 'حساب رئيسي تجميعي (Group Header - لا يسمح بالترحيل المباشر)' : 'Header Group Account (No Direct Posting)'}
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-md"
                >
                  {isAr ? 'حفظ وتثبيت الحساب' : 'Save & Deploy Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
