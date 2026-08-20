import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  Building2, 
  X, 
  Save, 
  MapPin, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  Tag, 
  Globe 
} from 'lucide-react';
import { MasterOrganizationNode, OrganizationType, OrganizationStatus } from '../../../types/organizationMaster';

interface OrganizationNodeEditorModalProps {
  node: MasterOrganizationNode | null;
  onClose: () => void;
  onSaved: () => void;
}

type EditorTab = 'GENERAL' | 'LEGAL' | 'GEOGRAPHIC' | 'FINANCIAL' | 'GOVERNANCE';

export const OrganizationNodeEditorModal: React.FC<OrganizationNodeEditorModalProps> = ({
  node,
  onClose,
  onSaved
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<EditorTab>('GENERAL');
  const [allNodes, setAllNodes] = useState<MasterOrganizationNode[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [code, setCode] = useState(node?.code || '');
  const [name, setName] = useState(node?.name || '');
  const [nameAr, setNameAr] = useState(node?.nameAr || '');
  const [shortName, setShortName] = useState(node?.shortName || '');
  const [type, setType] = useState<OrganizationType>(node?.type || 'BRANCH');
  const [parentId, setParentId] = useState<string | null>(node?.parentId || null);
  const [status, setStatus] = useState<OrganizationStatus>(node?.status || 'ACTIVE');

  // Legal
  const [legalName, setLegalName] = useState(node?.legalEntity?.legalName || '');
  const [tradeName, setTradeName] = useState(node?.legalEntity?.tradeName || '');
  const [crNumber, setCrNumber] = useState(node?.legalEntity?.commercialRegistration || '');
  const [vatNumber, setVatNumber] = useState(node?.legalEntity?.vatNumber || '');
  const [incCountry, setIncCountry] = useState(node?.legalEntity?.incorporationCountry || 'Saudi Arabia');

  // Geographic
  const [country, setCountry] = useState(node?.geographic?.country || 'Saudi Arabia');
  const [region, setRegion] = useState(node?.geographic?.region || 'Riyadh Province');
  const [city, setCity] = useState(node?.geographic?.city || 'Riyadh');
  const [address, setAddress] = useState(node?.geographic?.address || '');
  const [phone, setPhone] = useState(node?.phone || '+966 11 200 4000');
  const [email, setEmail] = useState(node?.email || 'info@aja-logistics.com');
  const [timeZone, setTimeZone] = useState(node?.timeZone || 'Asia/Riyadh');
  const [currency, setCurrency] = useState(node?.currency || 'SAR');

  // Financial
  const [costCenterCode, setCostCenterCode] = useState(node?.financial?.costCenterCode || '');
  const [costCenterName, setCostCenterName] = useState(node?.financial?.costCenterName || '');
  const [profitCenterCode, setProfitCenterCode] = useState(node?.financial?.profitCenterCode || '');
  const [budgetAllocated, setBudgetAllocated] = useState<number>(node?.financial?.budgetAllocated || 1000000);
  const [budgetOwnerName, setBudgetOwnerName] = useState(node?.financial?.budgetOwnerName || 'Tareq Al-Mansoor');

  // Governance
  const [dataSteward, setDataSteward] = useState(node?.dataSteward || 'Abdullah Al-Jaloud');
  const [effectiveDate, setEffectiveDate] = useState(node?.effectiveDate || new Date().toISOString().split('T')[0]);
  const [tagsInput, setTagsInput] = useState(node?.tags?.join(', ') || 'operations, branch');

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const token = localStorage.getItem('aja_auth_token');
        const res = await fetch('/api/organization/master/nodes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data: MasterOrganizationNode[] = await res.json();
          setAllNodes(data.filter(n => !node || n.id !== node.id));
        }
      } catch (err) {
        console.error('[EditorModal] Fetch nodes error:', err);
      }
    };
    fetchNodes();
  }, [node]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !nameAr) {
      alert(isAr ? 'يرجى تعبئة الحقول المطلوبة (الرمز، الاسم بالإنجليزية والاسم بالعربية)' : 'Code, English Name and Arabic Name are required.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const payload: Partial<MasterOrganizationNode> = {
        code,
        name,
        nameAr,
        shortName: shortName || code,
        type,
        parentId: parentId || null,
        status,
        legalEntity: crNumber ? {
          legalEntityId: node?.legalEntity?.legalEntityId || `le-${Date.now()}`,
          legalName: legalName || name,
          tradeName: tradeName || shortName,
          commercialRegistration: crNumber,
          vatNumber,
          incorporationCountry: incCountry,
          licenses: node?.legalEntity?.licenses || []
        } : undefined,
        geographic: {
          country,
          region,
          city,
          address
        },
        financial: costCenterCode ? {
          costCenterId: node?.financial?.costCenterId || `cc-${Date.now()}`,
          costCenterCode,
          costCenterName: costCenterName || name,
          profitCenterId: profitCenterCode ? `pc-${Date.now()}` : undefined,
          profitCenterCode,
          budgetAllocated: Number(budgetAllocated) || 0,
          budgetSpent: node?.financial?.budgetSpent || 0,
          currency,
          budgetOwnerName
        } : {
          budgetAllocated: 0,
          budgetSpent: 0,
          currency
        },
        phone,
        email,
        timeZone,
        currency,
        defaultLanguage: 'ar',
        dataSteward,
        effectiveDate,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      };

      const url = node ? `/api/organization/master/nodes/${node.id}` : '/api/organization/master/nodes';
      const method = node ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSaved();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save organization node');
      }
    } catch (err) {
      console.error('[OrganizationNodeEditorModal] Save error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <h3 className="text-base font-black flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>{node ? (isAr ? `تعديل الكيان التنظيمي: ${node.code}` : `Edit Org Node: ${node.code}`) : (isAr ? 'إضافة كيان تنظيمي جديد' : 'New Master Organization Node')}</span>
            </h3>
            <p className="text-xs text-slate-300">
              {isAr ? 'إدخال وحوكمة تفاصيل الكيان ضمن الهيكل التنظيمي الموحد للشركة.' : 'Configure global organization entity attributes, legal entity details, and cost centers.'}
            </p>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('GENERAL')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'GENERAL' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'البيانات الأساسية' : 'General Info'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LEGAL')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'LEGAL' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'السجل والتراخيص القانونية' : 'Legal & Registration'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GEOGRAPHIC')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'GEOGRAPHIC' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'الموقع والعنوان والتواصل' : 'Geographic & Contact'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FINANCIAL')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'FINANCIAL' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'مراكز التكلفة والميزانية' : 'Financial & Budget'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GOVERNANCE')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'GOVERNANCE' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'الحوكمة والإشراف' : 'Governance & Tags'}
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeTab === 'GENERAL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'رمز الكيان التنظيمي *' : 'Organization Code *'}</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BR-RUH-HQ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'نوع الكيان الهيكلي *' : 'Organization Entity Type *'}</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as OrganizationType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
                >
                  <option value="HOLDING_COMPANY">{isAr ? 'شركة قابضة (Holding Company)' : 'Holding Company'}</option>
                  <option value="SUBSIDIARY">{isAr ? 'شركة تابعة (Subsidiary)' : 'Subsidiary'}</option>
                  <option value="REGIONAL_OFFICE">{isAr ? 'مكتب إقليمي (Regional Office)' : 'Regional Office'}</option>
                  <option value="BRANCH">{isAr ? 'فرع رئيسي / تشغيلي (Branch)' : 'Branch'}</option>
                  <option value="DISTRIBUTION_CENTER">{isAr ? 'مركز توزيع (Distribution Center)' : 'Distribution Center'}</option>
                  <option value="WAREHOUSE">{isAr ? 'مستودع (Warehouse)' : 'Warehouse'}</option>
                  <option value="DEPARTMENT">{isAr ? 'إدارة / قسم (Department)' : 'Department'}</option>
                  <option value="BUSINESS_UNIT">{isAr ? 'وحدة أعمال (Business Unit)' : 'Business Unit'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الاسم باللغة الإنجليزية *' : 'English Name *'}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Riyadh Central Distribution Hub"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الاسم باللغة العربية *' : 'Arabic Name *'}</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  placeholder="مثال: مركز الفرز اللوجستي الرئيسي بالرياض"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الاسم المختصر' : 'Short Name'}</label>
                <input
                  type="text"
                  value={shortName}
                  onChange={e => setShortName(e.target.value)}
                  placeholder="RUH Hub"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الكيان الأب المباشر (Parent Node)' : 'Parent Node'}</label>
                <select
                  value={parentId || ''}
                  onChange={e => setParentId(e.target.value || null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">{isAr ? '-- مستوى أولي جذر (ROOT) --' : '-- Top Level (No Parent) --'}</option>
                  {allNodes.map(n => (
                    <option key={n.id} value={n.id}>
                      [{n.code}] {isAr ? n.nameAr : n.name} ({n.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'حالة الكيان' : 'Status'}</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as OrganizationStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
                >
                  <option value="ACTIVE">{isAr ? 'نشط (ACTIVE)' : 'ACTIVE'}</option>
                  <option value="INACTIVE">{isAr ? 'غير نشط (INACTIVE)' : 'INACTIVE'}</option>
                  <option value="SUSPENDED">{isAr ? 'معلق (SUSPENDED)' : 'SUSPENDED'}</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'LEGAL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الاسم القانوني الرسمي' : 'Official Legal Name'}</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={e => setLegalName(e.target.value)}
                  placeholder="e.g. AJA Logistics Services Co. LLC"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الاسم التجاري' : 'Trade Name'}</label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={e => setTradeName(e.target.value)}
                  placeholder="AJA Logistics"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'رقم السجل التجاري (CR Number)' : 'Commercial Registration (CR)'}</label>
                <input
                  type="text"
                  value={crNumber}
                  onChange={e => setCrNumber(e.target.value)}
                  placeholder="1010889201"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الرقم الضريبي (VAT Number)' : 'VAT Registration Number'}</label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={e => setVatNumber(e.target.value)}
                  placeholder="310098273400003"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'دولة التأسيس' : 'Incorporation Country'}</label>
                <input
                  type="text"
                  value={incCountry}
                  onChange={e => setIncCountry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>
          )}

          {activeTab === 'GEOGRAPHIC' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الدولة' : 'Country'}</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'المنطقة / المحافظة' : 'Region / Province'}</label>
                <input
                  type="text"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'المدينة' : 'City'}</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'العنوان المباشر' : 'Full Physical Address'}</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'البريد الإلكتروني الرسمي' : 'Official Email'}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>
          )}

          {activeTab === 'FINANCIAL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'رمز مركز التكلفة (Cost Center Code)' : 'Cost Center Code'}</label>
                <input
                  type="text"
                  value={costCenterCode}
                  onChange={e => setCostCenterCode(e.target.value.toUpperCase())}
                  placeholder="CC-OPS-100"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'اسم مركز التكلفة' : 'Cost Center Name'}</label>
                <input
                  type="text"
                  value={costCenterName}
                  onChange={e => setCostCenterName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'رمز مركز الربحية (Profit Center Code)' : 'Profit Center Code'}</label>
                <input
                  type="text"
                  value={profitCenterCode}
                  onChange={e => setProfitCenterCode(e.target.value.toUpperCase())}
                  placeholder="PC-KSA-101"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الميزانية المخصصة' : 'Allocated Budget'}</label>
                <input
                  type="number"
                  value={budgetAllocated}
                  onChange={e => setBudgetAllocated(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'العملة المالية' : 'Currency'}</label>
                <input
                  type="text"
                  value={currency}
                  onChange={e => setCurrency(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'المسؤول عن الميزانية' : 'Budget Owner Name'}</label>
                <input
                  type="text"
                  value={budgetOwnerName}
                  onChange={e => setBudgetOwnerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>
          )}

          {activeTab === 'GOVERNANCE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'مشرف البيانات الرئيسي (Data Steward)' : 'Data Steward'}</label>
                <input
                  type="text"
                  value={dataSteward}
                  onChange={e => setDataSteward(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'تاريخ بداية السريان' : 'Effective Date'}</label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={e => setEffectiveDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700">{isAr ? 'العلامات والتصنيفات (مفصولة بفاصلة)' : 'Tags (comma separated)'}</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="holding, operations, branch"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ الكيان التنظيمي' : 'Save Organization Node'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
