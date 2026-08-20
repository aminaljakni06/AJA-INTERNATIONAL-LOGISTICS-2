import React, { useState } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { X, Building2, Save, ShieldCheck, DollarSign, Users, MapPin, Tag } from 'lucide-react';
import { BusinessPartner, BPRole, BPClassification, BPStatus } from '../../../types/businessPartner';

interface PartnerEditorModalProps {
  partner?: BusinessPartner | null;
  onClose: () => void;
  onSaved: () => void;
}

const AVAILABLE_ROLES: BPRole[] = [
  'CUSTOMER',
  'VENDOR',
  'SUPPLIER',
  'CARRIER',
  'FREIGHT_FORWARDER',
  'CUSTOMS_BROKER',
  'SHIPPING_AGENT',
  'WAREHOUSE_PROVIDER',
  'INSURANCE_PROVIDER',
  'FINANCIAL_INSTITUTION',
  'GOVERNMENT_AGENCY',
  'CONTRACTOR',
  'CONSULTANT',
  '3PL',
  '4PL',
  'PARTNER'
];

export const PartnerEditorModal: React.FC<PartnerEditorModalProps> = ({
  partner,
  onClose,
  onSaved
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [legalName, setLegalName] = useState(partner?.legalName || '');
  const [tradingName, setTradingName] = useState(partner?.tradingName || '');
  const [arabicName, setArabicName] = useState(partner?.arabicName || '');
  const [englishName, setEnglishName] = useState(partner?.englishName || '');
  const [commercialRegistration, setCommercialRegistration] = useState(partner?.commercialRegistration || '');
  const [vatNumber, setVatNumber] = useState(partner?.vatNumber || '');
  const [taxNumber, setTaxNumber] = useState(partner?.taxNumber || '');
  const [classification, setClassification] = useState<BPClassification>(partner?.classification || 'CORPORATE');
  const [industry, setIndustry] = useState(partner?.industry || 'Logistics & Trade');
  const [businessSize, setBusinessSize] = useState(partner?.businessSize || 'MEDIUM');
  const [status, setStatus] = useState<BPStatus>(partner?.status || 'ACTIVE');
  const [preferredCurrency, setPreferredCurrency] = useState(partner?.preferredCurrency || 'SAR');
  const [paymentTerms, setPaymentTerms] = useState(partner?.paymentTerms || 'NET_30');
  const [incoterms, setIncoterms] = useState(partner?.incoterms || 'DDP');
  const [roles, setRoles] = useState<BPRole[]>(partner?.roles || ['CUSTOMER']);

  // Credit
  const [creditLimit, setCreditLimit] = useState(partner?.credit?.creditLimit || 1000000);

  // Primary Contact
  const primaryContact = partner?.contacts.find(c => c.isPrimary) || partner?.contacts[0];
  const [contactName, setContactName] = useState(primaryContact?.name || '');
  const [contactEmail, setContactEmail] = useState(primaryContact?.email || '');
  const [contactPhone, setContactPhone] = useState(primaryContact?.phone || '');

  // Primary Address
  const primaryAddr = partner?.addresses.find(a => a.isPrimary) || partner?.addresses[0];
  const [addressStreet, setAddressStreet] = useState(primaryAddr?.street || '');
  const [addressCity, setAddressCity] = useState(primaryAddr?.city || 'Riyadh');
  const [addressCountry, setAddressCountry] = useState(primaryAddr?.country || 'Saudi Arabia');

  const toggleRole = (role: BPRole) => {
    if (roles.includes(role)) {
      if (roles.length > 1) {
        setRoles(roles.filter(r => r !== role));
      }
    } else {
      setRoles([...roles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName.trim()) {
      setError(isAr ? 'الرجاء إدخال الاسم القانوني' : 'Legal Name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('aja_auth_token');
      const payload: Partial<BusinessPartner> = {
        legalName,
        tradingName: tradingName || legalName,
        arabicName: arabicName || legalName,
        englishName: englishName || legalName,
        commercialRegistration,
        vatNumber,
        taxNumber,
        classification,
        industry,
        businessSize: businessSize as any,
        status,
        preferredCurrency,
        paymentTerms,
        incoterms,
        roles,
        credit: {
          creditLimit: Number(creditLimit),
          creditExposure: partner?.credit?.creditExposure || 0,
          creditRating: partner?.credit?.creditRating || 'A',
          riskCategory: partner?.credit?.riskCategory || 'LOW',
          isOnCreditHold: partner?.credit?.isOnCreditHold || false,
          paymentTerms,
          incoterms,
          collectionStatus: partner?.credit?.collectionStatus || 'NORMAL'
        },
        contacts: [
          {
            id: primaryContact?.id || `c-${Date.now()}`,
            name: contactName || 'Primary Contact',
            jobTitle: 'Key Account Contact',
            email: contactEmail,
            phone: contactPhone,
            preferredLanguage: 'ar',
            roles: ['PRIMARY'],
            isPrimary: true,
            isEmergency: false
          }
        ],
        addresses: [
          {
            id: primaryAddr?.id || `a-${Date.now()}`,
            type: 'HEAD_OFFICE',
            addressName: 'Main Office',
            street: addressStreet || 'King Fahd Road',
            city: addressCity,
            country: addressCountry,
            isPrimary: true
          }
        ]
      };

      const url = partner ? `/api/business-partners/${partner.id}` : '/api/business-partners';
      const method = partner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to save business partner');
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Error saving business partner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black">
              {partner
                ? (isAr ? 'تعديل شريك الأعمال' : 'Edit Business Partner')
                : (isAr ? 'إضافة شريك أعمال جديد' : 'New Enterprise Business Partner')}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {isAr ? 'تسجيل شريك الأعمال وتحديد الأدوار والحد الائتماني' : 'Register business partner, assign roles & credit terms'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-800 p-4 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Basic & Names */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 flex items-center gap-2 border-b pb-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'البيانات الأساسية للشركة' : 'General Organization Details'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'الاسم القانوني (Legal Name) *' : 'Legal Name *'}</label>
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={e => setLegalName(e.target.value)}
                  placeholder="e.g. SABIC Logistics Co."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'الاسم التجاري (Trading Name)' : 'Trading Name'}</label>
                <input
                  type="text"
                  value={tradingName}
                  onChange={e => setTradingName(e.target.value)}
                  placeholder="e.g. SABIC Supply Chain"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'الاسم بالعربية' : 'Arabic Name'}</label>
                <input
                  type="text"
                  value={arabicName}
                  onChange={e => setArabicName(e.target.value)}
                  placeholder="شركة سابك اللوجستية"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'الاسم بالإنجليزية' : 'English Name'}</label>
                <input
                  type="text"
                  value={englishName}
                  onChange={e => setEnglishName(e.target.value)}
                  placeholder="SABIC Logistics Ltd"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Partner Roles Selection */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 flex items-center gap-2 border-b pb-2">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'أدوار شريك الأعمال (Business Partner Roles)' : 'Business Partner Roles'}</span>
            </h4>
            <p className="text-[11px] text-slate-500">{isAr ? 'يمكن اختيار أكثر من دور لنفس الكيان (مثال: عميل ومورد في نفس الوقت).' : 'Select multiple roles (e.g. entity can be both Customer & Vendor).'}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_ROLES.map(role => {
                const isSelected = roles.includes(role);
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition text-center ${
                      isSelected
                        ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Legal & Registration */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'السجل والضريبة والتصنيف' : 'Registration & Legal Info'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'رقم السجل التجاري (CR)' : 'Commercial Registration'}</label>
                <input
                  type="text"
                  value={commercialRegistration}
                  onChange={e => setCommercialRegistration(e.target.value)}
                  placeholder="1010000000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'الرقم الضريبي (VAT)' : 'VAT Registration Number'}</label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={e => setVatNumber(e.target.value)}
                  placeholder="300000000000003"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'التصنيف' : 'Classification'}</label>
                <select
                  value={classification}
                  onChange={e => setClassification(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="ENTERPRISE">ENTERPRISE</option>
                  <option value="CORPORATE">CORPORATE</option>
                  <option value="SME">SME</option>
                  <option value="GOVERNMENT">GOVERNMENT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Primary Contact & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 flex items-center gap-2 border-b pb-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'جهة الاتصال الرئيسية' : 'Primary Contact'}</span>
              </h4>
              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'الاسم' : 'Name'}</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Eng. Ahmed Al-Otaibi"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="ahmed@company.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-black text-slate-900 flex items-center gap-2 border-b pb-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'العنوان الرئيسي' : 'Primary Address'}</span>
              </h4>
              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'الشارع/المنطقة' : 'Street/District'}</label>
                <input
                  type="text"
                  value={addressStreet}
                  onChange={e => setAddressStreet(e.target.value)}
                  placeholder="King Saud Road"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isAr ? 'المدينة' : 'City'}</label>
                  <input
                    type="text"
                    value={addressCity}
                    onChange={e => setAddressCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isAr ? 'الدولة' : 'Country'}</label>
                  <input
                    type="text"
                    value={addressCountry}
                    onChange={e => setAddressCountry(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Credit & Terms */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 flex items-center gap-2 border-b pb-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'الائتمان وشروط الدفع' : 'Credit & Financial Terms'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'الحد الائتماني (SAR)' : 'Credit Limit (SAR)'}</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={e => setCreditLimit(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'شروط الدفع' : 'Payment Terms'}</label>
                <select
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="NET_30">NET 30 Days</option>
                  <option value="NET_60">NET 60 Days</option>
                  <option value="NET_90">NET 90 Days</option>
                  <option value="IMMEDIATE">Immediate / Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{isAr ? 'شرط التسليم (Incoterms)' : 'Incoterms'}</label>
                <select
                  value={incoterms}
                  onChange={e => setIncoterms(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="DDP">DDP - Delivered Duty Paid</option>
                  <option value="FOB">FOB - Free on Board</option>
                  <option value="CIF">CIF - Cost Insurance Freight</option>
                  <option value="EXW">EXW - Ex Works</option>
                  <option value="CPT">CPT - Carriage Paid To</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ البيانات' : 'Save Partner')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
