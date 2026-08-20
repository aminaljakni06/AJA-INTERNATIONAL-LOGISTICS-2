import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useIdentity } from '../../context/IdentityContext';
import { IdentityProfileView } from '../../components/identity/IdentityProfileView';
import { SessionManagerView } from '../../components/identity/SessionManagerView';
import { DeviceManagerView } from '../../components/identity/DeviceManagerView';
import { SecuritySettingsView } from '../../components/identity/SecuritySettingsView';
import { SSOProviderManager } from '../../components/identity/SSOProviderManager';
import { ConnectedAccountsView } from '../../components/identity/ConnectedAccountsView';
import { PasskeyManagerView } from '../../components/identity/PasskeyManagerView';
import { AdaptiveSecurityMonitorView } from '../../components/identity/AdaptiveSecurityMonitorView';
import { UserLifecycleView } from '../../components/identity/governance/UserLifecycleView';
import { AccessCertificationView } from '../../components/identity/governance/AccessCertificationView';
import { RoleGovernanceView } from '../../components/identity/governance/RoleGovernanceView';
import { DelegatedAdminView } from '../../components/identity/governance/DelegatedAdminView';
import { SoDRuleManagerView } from '../../components/identity/governance/SoDRuleManagerView';
import { GovernanceAnalyticsView } from '../../components/identity/governance/GovernanceAnalyticsView';
import { 
  Users, 
  Shield, 
  KeyRound, 
  Monitor, 
  Laptop, 
  Search, 
  Filter, 
  Lock, 
  UserCheck, 
  UserX, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Edit3,
  X,
  Save,
  Globe,
  Link2,
  Fingerprint,
  Activity
} from 'lucide-react';
import { IdentityProfile, AccountStatus, PasswordPolicy } from '../../types/identity';

export const AdminIdentityManagement: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { profile } = useIdentity();

  const [activeTab, setActiveTab] = useState<
    | 'registry'
    | 'sso-providers'
    | 'connected-accounts'
    | 'passkeys'
    | 'adaptive-security'
    | 'iga-lifecycle'
    | 'iga-certification'
    | 'iga-roles'
    | 'iga-delegation'
    | 'iga-sod'
    | 'iga-analytics'
    | 'my-profile'
    | 'sessions'
    | 'devices'
    | 'security-policies'
  >('registry');

  // Admin Registry list state
  const [identities, setIdentities] = useState<IdentityProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Policy Edit state
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy | null>(null);
  const [isEditingPolicy, setIsEditingPolicy] = useState(false);
  const [policyForm, setPolicyForm] = useState<PasswordPolicy | null>(null);

  // Status Change Modal
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityProfile | null>(null);
  const [newStatus, setNewStatus] = useState<AccountStatus>('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchRegistry = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/identity/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIdentities(Array.isArray(data) ? data : data.data || []);
      }

      const polRes = await fetch('/api/identity/password-policy');
      if (polRes.ok) {
        const polData = await polRes.json();
        setPasswordPolicy(polData);
        setPolicyForm(polData);
      }
    } catch (err) {
      console.error('[AdminIdentity] Error fetching registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  const handleUpdateAccountStatus = async () => {
    if (!selectedIdentity) return;
    if (!statusReason.trim()) {
      setStatusMessage(isAr ? 'سبب تغيير الحالة إلزامي لأغراض التدقيق' : 'A reason is required for audit.');
      return;
    }
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/identity/admin/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUserId: selectedIdentity.userId,
          newStatus,
          reason: statusReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(isAr ? 'تم تحديث حالة الحساب بنجاح' : 'Account status updated');
        setSelectedIdentity(null);
        fetchRegistry();
      } else {
        setStatusMessage(data.error || (isAr ? 'فشل تحديث الحالة' : 'Failed to update status'));
      }
    } catch {
      setStatusMessage(isAr ? 'تعذر الاتصال بالخادم' : 'Server error');
    }
  };

  const handleSavePolicy = async () => {
    if (!policyForm) return;
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/identity/admin/password-policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(policyForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setPasswordPolicy(updated);
        setIsEditingPolicy(false);
        setStatusMessage(isAr ? 'تم حفظ سياسة المرور المؤسسية بنجاح' : 'Password policy saved');
      }
    } catch {
      setStatusMessage(isAr ? 'تعذر حفظ سياسة المرور' : 'Failed to save policy');
    }
  };

  const filteredIdentities = identities.filter((item) => {
    const matchesSearch =
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.primaryEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.employeeId && item.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.identityId && item.identityId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || item.accountStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalUsers = identities.length;
  const activeUsers = identities.filter(i => i.accountStatus === 'ACTIVE').length;
  const suspendedUsers = identities.filter(i => ['SUSPENDED', 'LOCKED', 'DISABLED'].includes(i.accountStatus)).length;
  const mfaEnabledUsers = identities.filter(i => i.mfaEnabled).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isAr ? 'منصة الهوية وإدارة الوصول (Enterprise Identity Platform)' : 'Enterprise Identity & Access Platform'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                  {isAr 
                    ? 'إدارة دورة حياة الهوية، الجلسات، الأجهزة الموثوقة، وسياست الأمان والسرية' 
                    : 'Manage identity lifecycle, sessions, trusted hardware devices, and security policies.'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchRegistry}
            className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-white text-sm font-semibold rounded-xl transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {isAr ? 'تحديث البيانات' : 'Refresh'}
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-t border-gray-100 dark:border-slate-700 pt-4">
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'registry'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            {isAr ? 'سجل الهويات والمستخدمين' : 'Identity Registry'}
          </button>

          <button
            onClick={() => setActiveTab('sso-providers')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'sso-providers'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            {isAr ? 'مزودو SSO وIdP' : 'SSO Providers'}
          </button>

          <button
            onClick={() => setActiveTab('connected-accounts')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'connected-accounts'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Link2 className="w-4 h-4" />
            {isAr ? 'الحسابات المربوطة' : 'Connected Accounts'}
          </button>

          <button
            onClick={() => setActiveTab('passkeys')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'passkeys'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            {isAr ? 'مفاتيح المرور (Passkeys)' : 'Passkeys'}
          </button>

          <button
            onClick={() => setActiveTab('adaptive-security')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'adaptive-security'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            {isAr ? 'الأمان التكيفي (Adaptive Risk)' : 'Adaptive Security'}
          </button>

          <button
            onClick={() => setActiveTab('iga-lifecycle')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'iga-lifecycle'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            {isAr ? 'دورة حياة الهوية (Lifecycle)' : 'User Lifecycle'}
          </button>

          <button
            onClick={() => setActiveTab('iga-certification')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'iga-certification'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            {isAr ? 'مراجعة الصلاحيات (Certification)' : 'Access Certification'}
          </button>

          <button
            onClick={() => setActiveTab('iga-roles')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'iga-roles'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            {isAr ? 'حاكمة الأدوار (Role Governance)' : 'Role Governance'}
          </button>

          <button
            onClick={() => setActiveTab('iga-delegation')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'iga-delegation'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
            {isAr ? 'التفويض الإداري (Delegated Admins)' : 'Delegated Admins'}
          </button>

          <button
            onClick={() => setActiveTab('iga-sod')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'iga-sod'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            {isAr ? 'الفصل بين المهام (SoD Engine)' : 'SoD Rules'}
          </button>

          <button
            onClick={() => setActiveTab('iga-analytics')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'iga-analytics'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            {isAr ? 'تحليلات الحوكمة (Governance Analytics)' : 'IGA Analytics'}
          </button>

          <button
            onClick={() => setActiveTab('my-profile')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'my-profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            {isAr ? 'ملفي الشخصي (Identity Profile)' : 'My Identity Profile'}
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
            {isAr ? 'إدارة الجلسات (Sessions)' : 'Active Sessions'}
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'devices'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Laptop className="w-4 h-4" />
            {isAr ? 'الأجهزة الموثوقة (Devices)' : 'Trusted Devices'}
          </button>

          <button
            onClick={() => setActiveTab('security-policies')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'security-policies'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            {isAr ? 'سياسة المرور وMFA' : 'Security Policies'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* TAB CONTENT: Identity Registry */}
      {activeTab === 'registry' && (
        <div className="space-y-6">
          {/* KPI Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">{isAr ? 'إجمالي الهويات المسجلة' : 'Total Identities'}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalUsers}</h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">{isAr ? 'الحسابات النشطة' : 'Active Accounts'}</p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeUsers}</h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">{isAr ? 'الحسابات الموقوفة / المقفلة' : 'Suspended/Locked'}</p>
                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{suspendedUsers}</h3>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                <UserX className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">{isAr ? 'تفعيل MFA الثنائي' : 'MFA Adoption'}</p>
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {totalUsers > 0 ? `${Math.round((mfaEnabledUsers / totalUsers) * 100)}%` : '0%'}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder={isAr ? 'البحث بالاسم، البريد، أو الرقم الوظيفي...' : 'Search name, email, employee ID...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white"
              >
                <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="ACTIVE">{isAr ? 'نشط (ACTIVE)' : 'Active'}</option>
                <option value="PENDING">{isAr ? 'معلق (PENDING)' : 'Pending'}</option>
                <option value="SUSPENDED">{isAr ? 'موقوف (SUSPENDED)' : 'Suspended'}</option>
                <option value="FROZEN">{isAr ? 'مجمد (FROZEN)' : 'Frozen'}</option>
                <option value="LOCKED">{isAr ? 'مقفل (LOCKED)' : 'Locked'}</option>
                <option value="INACTIVE">{isAr ? 'غير نشط (INACTIVE)' : 'Inactive'}</option>
              </select>
            </div>
          </div>

          {/* Registry Data Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right text-gray-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase border-b border-gray-100 dark:border-slate-700">
                  <tr>
                    <th className="p-4">{isAr ? 'الهوية والمستخدم' : 'Identity & User'}</th>
                    <th className="p-4">{isAr ? 'نوع الهوية' : 'Identity Type'}</th>
                    <th className="p-4">{isAr ? 'الدور والوصول' : 'Role & Level'}</th>
                    <th className="p-4">{isAr ? 'الحالة الحالية' : 'Account Status'}</th>
                    <th className="p-4">{isAr ? 'MFA' : 'MFA Status'}</th>
                    <th className="p-4">{isAr ? 'إجراءات الحساب' : 'Actions'}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        {isAr ? 'جاري تحميل سجل الهويات...' : 'Loading identity registry...'}
                      </td>
                    </tr>
                  ) : filteredIdentities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        {isAr ? 'لا توجد سجلات مطابقة للبحث' : 'No matching identity records found'}
                      </td>
                    </tr>
                  ) : (
                    filteredIdentities.map((item) => (
                      <tr key={item.identityId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">
                              {item.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">{item.username}</div>
                              <div className="text-xs text-gray-500">{item.primaryEmail}</div>
                              <div className="text-[11px] text-gray-400">ID: {item.identityId}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-lg">
                            {item.identityType}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-gray-800 dark:text-slate-200">{item.role}</div>
                          <div className="text-xs text-gray-500">Security: L{item.securityLevel}</div>
                        </td>

                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            item.accountStatus === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : item.accountStatus === 'SUSPENDED' || item.accountStatus === 'LOCKED'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}>
                            {item.accountStatus}
                          </span>
                        </td>

                        <td className="p-4">
                          {item.mfaEnabled ? (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              {item.mfaType || 'TOTP'}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">{isAr ? 'غير مفعل' : 'Disabled'}</span>
                          )}
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => {
                              setSelectedIdentity(item);
                              setNewStatus(item.accountStatus);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg transition"
                          >
                            {isAr ? 'تحديث الحالة' : 'Manage Status'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: My Profile */}
      {activeTab === 'my-profile' && <IdentityProfileView />}

      {/* TAB CONTENT: SSO Providers */}
      {activeTab === 'sso-providers' && <SSOProviderManager />}

      {/* TAB CONTENT: Connected Accounts */}
      {activeTab === 'connected-accounts' && <ConnectedAccountsView />}

      {/* TAB CONTENT: Passkeys */}
      {activeTab === 'passkeys' && <PasskeyManagerView />}

      {/* TAB CONTENT: Adaptive Security Monitor */}
      {activeTab === 'adaptive-security' && <AdaptiveSecurityMonitorView />}

      {/* TAB CONTENT: IGA User Lifecycle */}
      {activeTab === 'iga-lifecycle' && <UserLifecycleView />}

      {/* TAB CONTENT: IGA Access Certification */}
      {activeTab === 'iga-certification' && <AccessCertificationView />}

      {/* TAB CONTENT: IGA Role Governance */}
      {activeTab === 'iga-roles' && <RoleGovernanceView />}

      {/* TAB CONTENT: IGA Delegated Administration */}
      {activeTab === 'iga-delegation' && <DelegatedAdminView />}

      {/* TAB CONTENT: IGA Separation of Duties (SoD) */}
      {activeTab === 'iga-sod' && <SoDRuleManagerView />}

      {/* TAB CONTENT: IGA Governance Analytics */}
      {activeTab === 'iga-analytics' && <GovernanceAnalyticsView />}

      {/* TAB CONTENT: Active Sessions */}
      {activeTab === 'sessions' && <SessionManagerView />}

      {/* TAB CONTENT: Trusted Devices */}
      {activeTab === 'devices' && <DeviceManagerView />}

      {/* TAB CONTENT: Security & Password Policies */}
      {activeTab === 'security-policies' && (
        <div className="space-y-6">
          <SecuritySettingsView />

          {/* System Admin Password Policy Editor */}
          {passwordPolicy && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  {isAr ? 'تخصيص سياسة المرور المؤسسية (System Password Policy)' : 'Enterprise Password Policy Controls'}
                </h4>

                {!isEditingPolicy ? (
                  <button
                    onClick={() => setIsEditingPolicy(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-800 dark:text-white rounded-lg transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isAr ? 'تعديل السياسة' : 'Edit Policy'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSavePolicy}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isAr ? 'حفظ السياسة' : 'Save Policy'}
                    </button>
                    <button
                      onClick={() => setIsEditingPolicy(false)}
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-1">
                  <label className="text-xs font-medium text-gray-500">{isAr ? 'الحد الأدنى للطول' : 'Min Length'}</label>
                  {isEditingPolicy && policyForm ? (
                    <input
                      type="number"
                      value={policyForm.minLength}
                      onChange={(e) => setPolicyForm({ ...policyForm, minLength: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  ) : (
                    <div className="text-base font-bold text-gray-900 dark:text-white">{passwordPolicy.minLength} {isAr ? 'أحرف' : 'chars'}</div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-1">
                  <label className="text-xs font-medium text-gray-500">{isAr ? 'صلاحية كلمة المرور (أيام)' : 'Expiry Days'}</label>
                  {isEditingPolicy && policyForm ? (
                    <input
                      type="number"
                      value={policyForm.expiryDays}
                      onChange={(e) => setPolicyForm({ ...policyForm, expiryDays: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  ) : (
                    <div className="text-base font-bold text-gray-900 dark:text-white">{passwordPolicy.expiryDays} {isAr ? 'يوم' : 'days'}</div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-1">
                  <label className="text-xs font-medium text-gray-500">{isAr ? 'أقصى محاولات خاسرة' : 'Max Failed Attempts'}</label>
                  {isEditingPolicy && policyForm ? (
                    <input
                      type="number"
                      value={policyForm.maxFailedAttempts}
                      onChange={(e) => setPolicyForm({ ...policyForm, maxFailedAttempts: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  ) : (
                    <div className="text-base font-bold text-gray-900 dark:text-white">{passwordPolicy.maxFailedAttempts} {isAr ? 'محاولات' : 'attempts'}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Status Modal */}
      {selectedIdentity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isAr ? 'تعديل حالة حساب الهوية' : 'Update Account Lifecycle Status'}
              </h3>
              <button onClick={() => setSelectedIdentity(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-slate-300">
              {isAr ? 'المستخدم:' : 'User:'} <strong className="text-gray-900 dark:text-white">{selectedIdentity.username}</strong> ({selectedIdentity.primaryEmail})
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">{isAr ? 'الحالة الجديدة (Account Status)' : 'New Account Status'}</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AccountStatus)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white"
                >
                  <option value="ACTIVE">{isAr ? 'نشط (ACTIVE)' : 'Active'}</option>
                  <option value="PENDING">{isAr ? 'معلق (PENDING)' : 'Pending'}</option>
                  <option value="SUSPENDED">{isAr ? 'موقوف (SUSPENDED)' : 'Suspended'}</option>
                  <option value="LOCKED">{isAr ? 'مقفل (LOCKED)' : 'Locked'}</option>
                  <option value="INACTIVE">{isAr ? 'غير نشط (INACTIVE)' : 'Inactive'}</option>
                  <option value="EXPIRED">{isAr ? 'منتهي الصلاحية (EXPIRED)' : 'Expired'}</option>
                  <option value="DISABLED">{isAr ? 'معطل (DISABLED)' : 'Disabled'}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">{isAr ? 'سبب تغيير الحالة (لتسجيل التدقيق)' : 'Reason (for audit log)'}</label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder={isAr ? 'توضيح أسباب الإيقاف أو التفعيل...' : 'Enter reason for change...'}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-slate-700 pt-3">
              <button
                onClick={() => setSelectedIdentity(null)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleUpdateAccountStatus}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
              >
                {isAr ? 'حفظ وحظر/تفعيل' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
