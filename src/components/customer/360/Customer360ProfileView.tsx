import React, { useState } from 'react';
import {
  Building,
  UserCheck,
  FileText,
  CreditCard,
  Truck,
  ShieldCheck,
  Phone,
  Mail,
  Plus,
  Edit2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Globe,
  MapPin,
  Briefcase
} from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { Customer360Profile, CustomerContact360, CustomerAddress360 } from '../../../types/customer360';

interface Customer360ProfileViewProps {
  customer: Customer360Profile;
  onSaveProfile: (profile: Customer360Profile) => Promise<void>;
}

export const Customer360ProfileView: React.FC<Customer360ProfileViewProps> = ({
  customer,
  onSaveProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState(customer.companyName || '');
  const [arabicName, setArabicName] = useState(customer.arabicName || '');
  const [englishName, setEnglishName] = useState(customer.englishName || '');
  const [industry, setIndustry] = useState(customer.industry || '');
  const [customerType, setCustomerType] = useState(customer.customerType || 'ENTERPRISE');
  const [customerStatus, setCustomerStatus] = useState(customer.customerStatus || 'ACTIVE');
  const [segment, setSegment] = useState(customer.segment || 'ENTERPRISE');

  // Legal
  const [commercialRegistration, setCommercialRegistration] = useState(customer.legalInformation?.commercialRegistration || '');
  const [taxNumber, setTaxNumber] = useState(customer.legalInformation?.taxNumber || '');
  const [vatNumber, setVatNumber] = useState(customer.legalInformation?.vatNumber || '');

  // Billing
  const [paymentTerms, setPaymentTerms] = useState(customer.billingDetails?.paymentTerms || 'NET_60');
  const [creditLimit, setCreditLimit] = useState(customer.billingDetails?.creditLimit || 1000000);
  const [creditExposure, setCreditExposure] = useState(customer.billingDetails?.creditExposure || 200000);
  const [isOnCreditHold, setIsOnCreditHold] = useState(customer.billingDetails?.isOnCreditHold || false);

  // Contacts
  const [contacts, setContacts] = useState<CustomerContact360[]>(customer.contacts || []);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactTitle, setNewContactTitle] = useState('');

  const handleAddContact = () => {
    if (!newContactName || !newContactEmail) return;
    const newC: CustomerContact360 = {
      id: `CONT-${Date.now()}`,
      name: newContactName,
      email: newContactEmail,
      phone: newContactPhone,
      jobTitle: newContactTitle || 'مسؤول تواصل',
      department: 'العمليات',
      preferredLanguage: 'ar',
      role: 'Contact Lead',
      permissions: ['VIEW_SHIPMENTS'],
      isPrimary: contacts.length === 0,
      isEmergency: false,
      status: 'ACTIVE',
    };
    setContacts([...contacts, newC]);
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactTitle('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updatedProfile: Customer360Profile = {
      ...customer,
      companyName,
      arabicName,
      englishName,
      industry,
      customerType,
      customerStatus,
      segment,
      legalInformation: {
        ...customer.legalInformation,
        commercialRegistration,
        taxNumber,
        vatNumber,
      },
      billingDetails: {
        ...customer.billingDetails,
        paymentTerms,
        creditLimit: Number(creditLimit),
        creditExposure: Number(creditExposure),
        isOnCreditHold,
      },
      contacts,
      updatedAt: new Date().toISOString(),
    };

    await onSaveProfile(updatedProfile);
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-slate-100 text-xs">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-amber-400">{customer.companyName}</h2>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[10px]">
              {customer.id} / {customer.bpId}
            </span>
          </div>
          <p className="text-slate-300 text-xs mt-0.5">
            الملف الموحد للعميل 360 • السجل التجاري: {customer.legalInformation?.commercialRegistration || '-'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2 text-slate-200 border-slate-600"
            >
              <Edit2 className="w-3.5 h-3.5" />
              تعديل بيانات الملف الموحد
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                إلغاء
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-500">
                <Save className="w-3.5 h-3.5" />
                حفظ التعديلات
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic & Legal Information */}
        <Card className="bg-slate-800 border-slate-700 p-4 space-y-4">
          <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 pb-2 border-b border-slate-700">
            <Building className="w-4 h-4" />
            <span>البيانات الأساسية والقانونية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">اسم الشركة (عربي) *</label>
              <Input
                disabled={!isEditing}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">الاسم بالإنجليزي</label>
              <Input
                disabled={!isEditing}
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">السجل التجاري (CR)</label>
              <Input
                disabled={!isEditing}
                value={commercialRegistration}
                onChange={(e) => setCommercialRegistration(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">الرقم الضريبي (VAT)</label>
              <Input
                disabled={!isEditing}
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">القطاع / الصناعة</label>
              <Input
                disabled={!isEditing}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">فئة تصنيف العميل</label>
              <select
                disabled={!isEditing}
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="ENTERPRISE">مؤسسة كبرى (Enterprise)</option>
                <option value="CORPORATE">شركة متوسطة (Corporate)</option>
                <option value="SME">مؤسسة صغيرة (SME)</option>
                <option value="GOVERNMENT">جهة حكومية (Government)</option>
                <option value="RETAIL">تجزئة (Retail)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Billing & Credit Limits */}
        <Card className="bg-slate-800 border-slate-700 p-4 space-y-4">
          <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 pb-2 border-b border-slate-700">
            <CreditCard className="w-4 h-4" />
            <span>التسهيلات المالية والحدود الائتمانية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">شروط الدفع الفتورية</label>
              <select
                disabled={!isEditing}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="NET_30">آجل 30 يوم (NET_30)</option>
                <option value="NET_60">آجل 60 يوم (NET_60)</option>
                <option value="NET_90">آجل 90 يوم (NET_90)</option>
                <option value="IMMEDIATE">سداد فورى (Immediate)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">حالة الائتمان والحساب</label>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="holdCheck"
                  disabled={!isEditing}
                  checked={isOnCreditHold}
                  onChange={(e) => setIsOnCreditHold(e.target.checked)}
                  className="w-4 h-4 text-rose-500 rounded border-slate-700"
                />
                <label htmlFor="holdCheck" className={`font-bold ${isOnCreditHold ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isOnCreditHold ? 'حساب موقوف ائتمانياً' : 'ائتمان نشط ومتاح'}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">الحد الائتماني (SAR)</label>
              <Input
                type="number"
                disabled={!isEditing}
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="bg-slate-900 border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">المستحق الحالي (Exposure)</label>
              <Input
                type="number"
                disabled={!isEditing}
                value={creditExposure}
                onChange={(e) => setCreditExposure(Number(e.target.value))}
                className="bg-slate-900 border-slate-700 text-white font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700 flex items-center justify-between">
            <span className="text-slate-300">الرصيد المتبقي المتاح للعميل:</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              {(creditLimit - creditExposure).toLocaleString()} SAR
            </span>
          </div>
        </Card>
      </div>

      {/* Contacts List & Adding Section */}
      <Card className="bg-slate-800 border-slate-700 p-4 space-y-4">
        <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 pb-2 border-b border-slate-700">
          <UserCheck className="w-4 h-4" />
          <span>سجل جهات الاتصال والمخولين بالحساب</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((c) => (
            <div key={c.id} className="p-3 bg-slate-900/90 border border-slate-700 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span>{c.name}</span>
                  {c.isPrimary && (
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] rounded">
                      رئيسي
                    </span>
                  )}
                </span>
                <span className="text-slate-400 text-[10px]">{c.jobTitle}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300 text-[11px] font-mono pt-1">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-amber-400" /> {c.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-blue-400" /> {c.phone}</span>
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="p-3 bg-slate-900/50 border border-dashed border-slate-700 rounded-lg space-y-2 pt-3">
            <span className="font-bold text-slate-300 text-xs">إضافة مسؤول تواصل جديد:</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Input
                placeholder="اسم المسؤول *"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white text-xs"
              />
              <Input
                placeholder="البريد الإلكتروني *"
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white text-xs"
              />
              <Input
                placeholder="رقم الجوال"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white text-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddContact} className="gap-1 text-xs">
                <Plus className="w-3.5 h-3.5" /> إضافة
              </Button>
            </div>
          </div>
        )}
      </Card>
    </form>
  );
};
