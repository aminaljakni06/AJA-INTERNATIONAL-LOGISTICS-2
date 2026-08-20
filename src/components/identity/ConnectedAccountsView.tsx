import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Link2, 
  Unlink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Shield, 
  Globe, 
  User, 
  Mail,
  PlusCircle
} from 'lucide-react';
import { LinkedAccount, SSOProviderType, SSOProviderConfig } from '../../types/identity';

export const ConnectedAccountsView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [publicProviders, setPublicProviders] = useState<SSOProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const [linkedRes, provRes] = await Promise.all([
        fetch('/api/sso/linked-accounts', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/sso/providers')
      ]);

      if (linkedRes.ok) {
        const data = await linkedRes.json();
        setLinkedAccounts(data);
      }
      if (provRes.ok) {
        const pData = await provRes.json();
        setPublicProviders(pData);
      }
    } catch (err) {
      console.error('[ConnectedAccounts] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLinkMock = async (provider: SSOProviderConfig) => {
    setActionLoading(provider.providerId);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const mockEmail = `user_${Math.random().toString(36).substring(2, 7)}@${provider.providerId}.com`;
      const res = await fetch('/api/sso/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: provider.type,
          providerUserId: `id_${provider.providerId}_${Date.now()}`,
          providerEmail: mockEmail,
          displayName: `${provider.name} Identity`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: isAr ? `تم ربط حساب ${provider.name} بنجاح!` : `Successfully linked ${provider.name} account!` });
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل ربط الحساب' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error linking account' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleUnlink = async (providerType: SSOProviderType) => {
    if (!confirm(isAr ? 'هل أنت تأكد من إلغاء ربط هذا الحساب؟' : 'Are you sure you want to unlink this account?')) return;
    
    setActionLoading(providerType);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/sso/unlink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ provider: providerType })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: isAr ? 'تم إلغاء ربط الحساب بنجاح' : 'Account unlinked successfully' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل إلغاء ربط الحساب' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error unlinking account' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-amber-600" />
            <span>{isAr ? 'الحسابات المرتبطة وتكامل SSO' : 'Connected Accounts & Identity Links'}</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isAr 
              ? 'إدارة الحسابات الخارجية المرتبطة بهويتك لتمكين الدخول الموحد السريع بنقرة واحدة.'
              : 'Link your external enterprise or social SSO identity providers for seamless single sign-on.'}
          </p>
        </div>

        <button 
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm border flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Active Linked Accounts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>{isAr ? 'الحسابات المربوطة حالياً' : 'Currently Linked Accounts'}</span>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
            {linkedAccounts.length} {isAr ? 'حسابات' : 'linked'}
          </span>
        </h3>

        {linkedAccounts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            {isAr ? 'لا توجد حسابات خارجية مرتبطة حالياً.' : 'No external SSO accounts currently linked.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {linkedAccounts.map(acc => (
              <div key={acc.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {acc.provider.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{acc.providerDisplayName || acc.provider}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">{acc.provider}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{acc.providerEmail}</span>
                      <span>•</span>
                      <span>{isAr ? 'تاريخ الربط:' : 'Linked:'} {new Date(acc.linkedAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                </div>

                {acc.provider !== 'INTERNAL' && (
                  <button
                    onClick={() => handleUnlink(acc.provider)}
                    disabled={actionLoading === acc.provider}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إلغاء الربط' : 'Unlink'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available SSO Providers to Link */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
          {isAr ? 'ربط حساب جديد بواسطة SSO' : 'Available Enterprise SSO Providers'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicProviders
            .filter(p => p.type !== 'INTERNAL' && !linkedAccounts.some(a => a.provider === p.type))
            .map(prov => (
              <div key={prov.providerId} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-amber-300 transition">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{prov.name}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{prov.type}</p>
                </div>
                <button
                  onClick={() => handleLinkMock(prov)}
                  disabled={actionLoading === prov.providerId}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold transition shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isAr ? 'ربط الآن' : 'Connect'}</span>
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
