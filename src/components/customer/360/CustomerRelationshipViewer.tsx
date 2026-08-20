import React from 'react';
import { Network, Building2, User, MapPin, ChevronRight, CornerDownLeft, Shield } from 'lucide-react';
import { Card } from '../../common/Card';
import { Customer360Profile } from '../../../types/customer360';

interface CustomerRelationshipViewerProps {
  customer: Customer360Profile;
  allCustomers: Customer360Profile[];
  onSelectCustomer: (cust: Customer360Profile) => void;
}

export const CustomerRelationshipViewer: React.FC<CustomerRelationshipViewerProps> = ({
  customer,
  allCustomers,
  onSelectCustomer,
}) => {
  const account = customer.accountStructure;

  const childProfiles = allCustomers.filter(
    (c) => account?.childAccountIds?.includes(c.id) || c.accountStructure?.parentAccountId === customer.id
  );

  return (
    <div className="space-y-6 text-slate-100 text-xs">
      {/* Top Summary Card */}
      <Card className="bg-slate-800 border-slate-700 p-5 space-y-4">
        <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
          <Network className="w-5 h-5" />
          <span>هيكلية الحسابات والارتباطات المؤسسية 360</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 space-y-1">
            <span className="text-slate-400 text-[11px] block">مدير الحساب المخصص (Account Manager):</span>
            <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-400" />
              <span>{account?.assignedAccountManager || 'م. عمر الفارسي'}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 space-y-1">
            <span className="text-slate-400 text-[11px] block">النطاق والتقسيم الجغرافي:</span>
            <span className="font-bold text-blue-300 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>{account?.salesTerritory || 'المنطقة الوسطى والغربية'}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 space-y-1">
            <span className="text-slate-400 text-[11px] block">الملكية والنوع:</span>
            <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{account?.ownership || 'حساب استراتيجي خاص'}</span>
            </span>
          </div>
        </div>
      </Card>

      {/* Visual Hierarchy Mapping Tree */}
      <Card className="bg-slate-800 border-slate-700 p-6 space-y-6">
        <h4 className="font-bold text-slate-200 text-xs border-b border-slate-700 pb-2">
          خريطة الهيكل الشجري للمجموعة والشركات التابعة
        </h4>

        {/* Parent Account */}
        {account?.parentAccountName && (
          <div className="p-4 bg-slate-900/90 border-2 border-amber-500/40 rounded-xl max-w-md mx-auto space-y-1 text-center">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">الشركة الأم (Parent Group)</span>
            <h4 className="font-bold text-slate-100 text-sm">{account.parentAccountName}</h4>
            <span className="text-[10px] text-slate-400 font-mono">{account.parentAccountId}</span>
          </div>
        )}

        {/* Connector Line */}
        {account?.parentAccountName && (
          <div className="w-0.5 h-6 bg-amber-500/40 mx-auto" />
        )}

        {/* Current Active Customer */}
        <div className="p-5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-400 rounded-xl max-w-lg mx-auto space-y-2 shadow-lg text-center">
          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] inline-block">
            الحساب النشط المفتوح حالياً
          </span>
          <h3 className="font-extrabold text-amber-300 text-base">{customer.companyName}</h3>
          <p className="text-slate-300 text-xs">{customer.industry} • {customer.customerType}</p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
            <span>ID: {customer.id}</span>
            <span>BP: {customer.bpId}</span>
          </div>
        </div>

        {/* Child Accounts Branching */}
        {childProfiles.length > 0 && (
          <>
            <div className="w-0.5 h-6 bg-amber-500/40 mx-auto" />

            <div className="space-y-3">
              <span className="text-[11px] text-slate-400 font-bold text-center block">
                الفروع والشركات التابعة ({childProfiles.length})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {childProfiles.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => onSelectCustomer(child)}
                    className="p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-amber-400 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">{child.companyName}</span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">{child.industry}</p>
                    <div className="text-[10px] text-amber-300 font-mono pt-1">
                      LTV: {(child.clv?.totalRevenue || 0).toLocaleString()} SAR
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
