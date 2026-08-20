import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { X, Save, Database, Shield, Globe, Tag, Calendar, Layers } from 'lucide-react';
import { MasterDataRecord, MasterDataDomain, MasterRecordStatus } from '../../types/mdm';

interface MasterDataEditorModalProps {
  record?: MasterDataRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

const DOMAINS: { key: MasterDataDomain; label: string }[] = [
  { key: 'CUSTOMER', label: 'Customer Master (سجل العملاء)' },
  { key: 'VENDOR', label: 'Vendor Master (سجل الموردين)' },
  { key: 'CARRIER', label: 'Carrier Master (سجل الناقلين)' },
  { key: 'WAREHOUSE', label: 'Warehouse Master (سجل المستودعات)' },
  { key: 'FLEET', label: 'Fleet Master (سجل الأسطول)' },
  { key: 'VEHICLE', label: 'Vehicle Master (سجل المركبات)' },
  { key: 'DRIVER', label: 'Driver Master (سجل السائقين)' },
  { key: 'EMPLOYEE', label: 'Employee Master (سجل الموظفين)' },
  { key: 'COMPANY', label: 'Company Master (سجل الشركات)' },
  { key: 'BRANCH', label: 'Branch Master (سجل الفروع)' },
  { key: 'DEPARTMENT', label: 'Department Master (سجل الأقسام)' },
  { key: 'COUNTRY', label: 'Country Master (سجل الدول)' },
  { key: 'CITY', label: 'City Master (سجل المدن)' },
  { key: 'PORT', label: 'Port Master (سجل الموانئ)' },
  { key: 'AIRPORT', label: 'Airport Master (سجل المطارات)' },
  { key: 'CURRENCY', label: 'Currency Master (سجل العملات)' },
  { key: 'EXCHANGE_RATE', label: 'Exchange Rate Master (سجل أسعار الصرف)' },
  { key: 'UOM', label: 'Unit of Measure (وحدات القياس)' },
  { key: 'INCOTERM', label: 'Incoterms (شروط الشحن)' },
  { key: 'TAX_CODE', label: 'Tax & VAT Codes (الضرائب)' },
  { key: 'HAZMAT', label: 'Hazardous Materials (المواد الخطرة)' },
  { key: 'CONTAINER_TYPE', label: 'Container Types (أنواع الحاويات)' },
  { key: 'SERVICE_CATALOG', label: 'Service Catalog (دليل الخدمات)' },
  { key: 'DOCUMENT_TYPE', label: 'Document Types (أنواع المستندات)' }
];

export const MasterDataEditorModal: React.FC<MasterDataEditorModalProps> = ({
  record,
  onClose,
  onSaved
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [domain, setDomain] = useState<MasterDataDomain>(record?.domain || 'CUSTOMER');
  const [code, setCode] = useState(record?.code || '');
  const [nameAr, setNameAr] = useState(record?.nameAr || '');
  const [nameEn, setNameEn] = useState(record?.nameEn || '');
  const [description, setDescription] = useState(record?.description || '');
  const [status, setStatus] = useState<MasterRecordStatus>(record?.status || 'ACTIVE');
  const [owner, setOwner] = useState(record?.owner || 'usr_admin_01');
  const [steward, setSteward] = useState(record?.steward || 'Aja Logistics Data Steward');
  const [effectiveDate, setEffectiveDate] = useState(record?.effectiveDate ? record.effectiveDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [expirationDate, setExpirationDate] = useState(record?.expirationDate ? record.expirationDate.slice(0, 10) : '');
  const [tagsInput, setTagsInput] = useState(record?.tags ? record.tags.join(', ') : '');
  const [metadataJson, setMetadataJson] = useState(record?.metadata ? JSON.stringify(record.metadata, null, 2) : '{\n  "customField": "value"\n}');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !nameAr || !nameEn) {
      setErrorMsg(isAr ? 'يرجى تعبئة كافة الحقول المطلوبة (الكود، الاسم بالعربية، والاسم بالإنجليزية)' : 'Please fill all required fields (code, Arabic name, English name).');
      return;
    }

    let parsedMetadata = {};
    try {
      parsedMetadata = JSON.parse(metadataJson);
    } catch {
      setErrorMsg(isAr ? 'صيغة بيانات Metadata غير صالحة (JSON غير صحيح)' : 'Invalid JSON format in Metadata field.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('aja_auth_token');
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

      const payload = {
        domain,
        code,
        nameAr,
        nameEn,
        description,
        status,
        approvalStatus: record?.approvalStatus || 'APPROVED',
        owner,
        steward,
        effectiveDate: new Date(effectiveDate).toISOString(),
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
        companyScope: ['GLOBAL'],
        branchScope: ['GLOBAL'],
        metadata: parsedMetadata,
        tags
      };

      const url = record ? `/api/mdm/records/${record.id}` : '/api/mdm/records';
      const method = record ? 'PUT' : 'POST';

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
        setErrorMsg(err.error || 'Failed to save master record');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">
              {record ? (isAr ? 'تعديل سجل رئيسي' : 'Edit Master Data Record') : (isAr ? 'إنشاء سجل رئيسي جديد' : 'Create Master Data Record')}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'مجال البيانات الرئيسية (Domain)' : 'Master Domain'}</label>
              <select
                value={domain}
                onChange={e => setDomain(e.target.value as MasterDataDomain)}
                disabled={Boolean(record)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {DOMAINS.map(d => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'كود الأعمال (Business Code)' : 'Business Code'}</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAJED, VAT15, USD"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'الاسم باللغة العربية' : 'Arabic Name'}</label>
              <input
                type="text"
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                placeholder="مثال: ميناء جدة الإسلامي"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'الاسم باللغة الإنجليزية' : 'English Name'}</label>
              <input
                type="text"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder="e.g. Jeddah Islamic Port"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'الوصف والتفاصيل' : 'Description'}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Primary logistics gateway details..."
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'حالة السجل' : 'Record Status'}</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as MasterRecordStatus)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE (نشط)</option>
                <option value="DRAFT">DRAFT (مسودة)</option>
                <option value="INACTIVE">INACTIVE (غير نشط)</option>
                <option value="SUSPENDED">SUSPENDED (موقوف)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'مالك البيانات (Owner)' : 'Data Owner'}</label>
              <input
                type="text"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'أمين البيانات (Steward)' : 'Data Steward'}</label>
              <input
                type="text"
                value={steward}
                onChange={e => setSteward(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'تاريخ السريان' : 'Effective Date'}</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'تاريخ الانتهاء (اختياري)' : 'Expiration Date (Optional)'}</label>
              <input
                type="date"
                value={expirationDate}
                onChange={e => setExpirationDate(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'الوسوم (Tags - مفصولة بفواصل)' : 'Tags (Comma separated)'}</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="GCC, SEA_PORT, CRITICAL"
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'بيانات إضافية خادمة (Metadata JSON)' : 'Domain Metadata (JSON)'}</label>
            <textarea
              value={metadataJson}
              onChange={e => setMetadataJson(e.target.value)}
              rows={4}
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ السجل الرئيسي' : 'Save Master Record')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
