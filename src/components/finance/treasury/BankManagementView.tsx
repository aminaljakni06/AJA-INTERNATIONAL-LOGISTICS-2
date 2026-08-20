import React, { useEffect, useState } from 'react';
import {
  Landmark,
  Plus,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  FileText,
  Search,
  Building2,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TreasuryClient } from '../../../services/treasuryClient';
import { BankAccount } from '../../../types/treasury';

export const BankManagementView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void TreasuryClient.getSnapshot().then(snapshot => {
      setAccounts(snapshot.bankAccounts);
      setSelectedAccount(snapshot.bankAccounts[0] || null);
    });
  }, []);

  const filteredAccounts = accounts.filter(a =>
    a.bankNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.iban.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.accountNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Landmark className="w-4 h-4" />
            <span>{isAr ? 'دليل وبنك الحسابات والمفوضين بالسداد' : 'Bank Master, Accounts & Signatories Directory'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'إدارة الحسابات البنكية، أيبان، سويفت ومصفوفة الصلاحيات' : 'Bank Master Engine, IBAN/SWIFT Verification & Signatory Mandates'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'إدارة تفاصيل الحسابات البنكية، حدود السحب، التوقيعات المعتمدة، والمطابقة مع شجرة الحسابات' : 'Manage corporate bank accounts, IBAN compliance, SWIFT codes, authorized signatories & credit lines.'}
          </p>
        </div>
      </div>

      {/* Grid Layout: Account List & Account Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Accounts List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono">{isAr ? 'قائمة الحسابات المصرفية' : 'Bank Account Ledger'}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400">{filteredAccounts.length}</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isAr ? 'بحث بالبنك، الأيبان أو الحساب...' : 'Search bank, IBAN or account...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="space-y-3">
            {filteredAccounts.map(acc => (
              <div
                key={acc.id}
                onClick={() => setSelectedAccount(acc)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedAccount && selectedAccount.id === acc.id
                    ? 'bg-sky-500/10 border-sky-500/40 shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{isAr ? acc.bankNameAr : acc.bankNameEn}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400">
                    {acc.currency}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 truncate">
                  IBAN: {acc.iban}
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400">{isAr ? 'الرصيد الدفتري:' : 'Balance:'}</span>
                  <span className="text-emerald-400 font-bold">
                    {acc.currency} {acc.currentBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Account Inspector */}
        {selectedAccount && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Account Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-sky-400 font-bold uppercase">{selectedAccount.accountType} ACCOUNT</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ✓ {selectedAccount.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">{isAr ? selectedAccount.bankNameAr : selectedAccount.bankNameEn}</h3>
                  <div className="text-xs text-slate-400 font-mono">{isAr ? selectedAccount.accountNameAr : selectedAccount.accountNameEn}</div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">{isAr ? 'الرصيد الحالي المتوفر' : 'Current Balance'}</div>
                  <div className="text-2xl font-extrabold text-emerald-400">
                    {selectedAccount.currency} {selectedAccount.currentBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Technical Banking Details Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-slate-400">{isAr ? 'رقم الحساب الدولي (IBAN)' : 'IBAN Code'}</div>
                  <div className="text-white font-bold select-all">{selectedAccount.iban}</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-slate-400">{isAr ? 'رمز السويفت (SWIFT / BIC)' : 'SWIFT BIC Code'}</div>
                  <div className="text-sky-400 font-bold">{selectedAccount.swiftCode}</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-slate-400">{isAr ? 'حساب دفتر الحسابات العام (GL Code)' : 'GL Account Mapping'}</div>
                  <div className="text-emerald-400 font-bold">{selectedAccount.glAccountCode}</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-slate-400">{isAr ? 'الفرع المصرفي' : 'Bank Branch'}</div>
                  <div className="text-slate-200">{isAr ? selectedAccount.branchNameAr : selectedAccount.branchNameEn}</div>
                </div>
              </div>

              {/* Authorized Signatories Table */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    <span>{isAr ? 'المفوضون المعتمدون بالسحب والتوقيع' : 'Authorized Bank Signatories & Approval Limits'}</span>
                  </span>
                  <span className="text-[10px] text-sky-400">{selectedAccount.signatories.length} Signatories</span>
                </h4>

                <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
                        <th className="p-3">{isAr ? 'اسم المفوض' : 'Signatory Name'}</th>
                        <th className="p-3">{isAr ? 'المسمى الوظيفي' : 'Role'}</th>
                        <th className="p-3">{isAr ? 'حد الصلاحية للسحب' : 'Approval Limit (SAR)'}</th>
                        <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedAccount.signatories.map(sig => (
                        <tr key={sig.id} className="hover:bg-slate-800/80">
                          <td className="p-3 font-bold text-white">{isAr ? sig.nameAr : sig.nameEn}</td>
                          <td className="p-3 text-sky-400">{sig.role}</td>
                          <td className="p-3 text-emerald-400 font-bold">SAR {sig.approvalLimitSAR.toLocaleString()}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                              {sig.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
