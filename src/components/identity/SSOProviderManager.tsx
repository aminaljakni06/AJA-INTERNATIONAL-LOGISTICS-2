import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  ShieldCheck, 
  Key, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Edit3, 
  Save, 
  X, 
  RefreshCw,
  Lock,
  Layers,
  Link2,
  ExternalLink
} from 'lucide-react';
import { SSOProviderConfig, SSOProviderType } from '../../types/identity';

export const SSOProviderManager: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [providers, setProviders] = useState<SSOProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<SSOProviderConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/sso/admin/providers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProviders(data);
      }
    } catch (err) {
      console.error('[SSOProviderManager] Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleToggle = async (providerId: string, currentEnabled: boolean) => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch(`/api/sso/admin/providers/${providerId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !currentEnabled })
      });
      if (res.ok) {
        setProviders(prev => prev.map(p => p.providerId === providerId ? { ...p, enabled: !currentEnabled } : p));
        setMessage(isAr ? 'تم تحديث حالة المزود بنجاح' : 'Provider status updated');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('[SSOProviderManager] Toggle error:', err);
    }
  };

  const handleSaveConfig = async () => {
    if (!editingProvider) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch(`/api/sso/admin/providers/${editingProvider.providerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingProvider)
      });
      if (res.ok) {
        const updated = await res.json();
        setProviders(prev => prev.map(p => p.providerId === updated.providerId ? updated : p));
        setEditingProvider(null);
        setMessage(isAr ? 'تم حفظ إعدادات مزود الهوية بنجاح' : 'SSO Provider configuration saved');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('[SSOProviderManager] Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const getBadgeColor = (type: SSOProviderType) => {
    switch (type) {
      case 'INTERNAL': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'GOOGLE': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MICROSOFT': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'APPLE': return 'bg-neutral-100 text-neutral-800 border-neutral-300';
      case 'GITHUB': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SAML_CUSTOM': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-medium text-xs tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'منصة الربط الاتحادي للهوية (SSO Federation)' : 'Identity Federation Platform'}</span>
          </div>
          <h2 className="text-xl font-bold">{isAr ? 'إدارة مزودي الهوية الموحدة' : 'SSO Provider Registry & Federation'}</h2>
          <p className="text-slate-300 text-sm max-w-2xl">
            {isAr 
              ? 'تكوين وإدارة مزودي الخدمة الموحدة (Google, Microsoft Entra ID, SAML 2.0, OpenID Connect) والتحكم في سياسات الربط الإداري.'
              : 'Configure Enterprise Single Sign-On (SSO) integration providers including OAuth 2.1, OIDC, and SAML 2.0 endpoints.'}
          </p>
        </div>

        <button 
          onClick={fetchProviders} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث' : 'Refresh'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Provider List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {providers.map(p => (
          <div 
            key={p.providerId}
            className={`bg-white rounded-2xl border p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between ${
              p.enabled ? 'border-slate-200' : 'border-slate-200 opacity-75 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeColor(p.type)}`}>
                  {p.type}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {p.enabled ? (isAr ? 'مفعل' : 'Enabled') : (isAr ? 'معطل' : 'Disabled')}
                  </span>
                  
                  {p.type !== 'INTERNAL' && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={p.enabled} 
                        onChange={() => handleToggle(p.providerId, p.enabled)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1">{p.name}</h3>
              <p className="text-slate-500 text-xs mb-4">
                ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">{p.providerId}</code>
              </p>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-4">
                {p.clientId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Client ID:</span>
                    <span className="font-mono text-slate-800 truncate max-w-[140px]">{p.clientId}</span>
                  </div>
                )}
                {p.redirectUri && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Redirect URI:</span>
                    <span className="font-mono text-slate-800 truncate max-w-[140px]">{p.redirectUri}</span>
                  </div>
                )}
                {p.samlMetadataUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">SAML Metadata:</span>
                    <span className="font-mono text-slate-800 truncate max-w-[140px]">{p.samlMetadataUrl}</span>
                  </div>
                )}
                {p.scopes && p.scopes.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Scopes:</span>
                    <span className="font-mono text-slate-700">{p.scopes.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setEditingProvider(p)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition mt-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isAr ? 'تعديل الإعدادات' : 'Configure Provider'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit Provider Modal */}
      {editingProvider && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-lg">
                  {isAr ? `تكوين ${editingProvider.name}` : `Configure ${editingProvider.name}`}
                </h3>
              </div>
              <button 
                onClick={() => setEditingProvider(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'اسم مزود الهوية' : 'Provider Name'}
                </label>
                <input 
                  type="text" 
                  value={editingProvider.name} 
                  onChange={e => setEditingProvider({ ...editingProvider, name: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client ID / App ID</label>
                <input 
                  type="text" 
                  value={editingProvider.clientId || ''} 
                  onChange={e => setEditingProvider({ ...editingProvider, clientId: e.target.value })}
                  className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. client_id_xyz..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client Secret</label>
                <input 
                  type="password" 
                  value={editingProvider.clientSecret || ''} 
                  onChange={e => setEditingProvider({ ...editingProvider, clientSecret: e.target.value })}
                  className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="••••••••••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Redirect Callback URI</label>
                <input 
                  type="text" 
                  value={editingProvider.redirectUri || ''} 
                  onChange={e => setEditingProvider({ ...editingProvider, redirectUri: e.target.value })}
                  className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {editingProvider.type === 'SAML_CUSTOM' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">SAML Entity ID</label>
                    <input 
                      type="text" 
                      value={editingProvider.samlEntityId || ''} 
                      onChange={e => setEditingProvider({ ...editingProvider, samlEntityId: e.target.value })}
                      className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">SAML Metadata URL</label>
                    <input 
                      type="text" 
                      value={editingProvider.samlMetadataUrl || ''} 
                      onChange={e => setEditingProvider({ ...editingProvider, samlMetadataUrl: e.target.value })}
                      className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
              <button
                onClick={() => setEditingProvider(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
