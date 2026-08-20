import React, { useState } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  FileText, 
  Users, 
  Network, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  DollarSign, 
  Award,
  Globe,
  Tag
} from 'lucide-react';
import { BusinessPartner } from '../../../types/businessPartner';

interface PartnerProfileViewProps {
  partner: BusinessPartner;
  onBack: () => void;
  onEdit: () => void;
}

export const PartnerProfileView: React.FC<PartnerProfileViewProps> = ({
  partner,
  onBack,
  onEdit
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONTACTS' | 'ADDRESSES' | 'BANKING' | 'CREDIT' | 'COMPLIANCE' | 'DOCUMENTS'>('OVERVIEW');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md">
                  {partner.bpNumber}
                </span>
                <span className="text-xs font-bold bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-md border border-slate-700">
                  {partner.status}
                </span>
                <span className="text-xs font-bold bg-slate-800 text-amber-400 px-2.5 py-0.5 rounded-md border border-slate-700">
                  {partner.classification}
                </span>
              </div>
              <h2 className="text-xl font-black mt-1">
                {isAr ? partner.arabicName || partner.legalName : partner.englishName || partner.legalName}
              </h2>
              <p className="text-xs text-slate-400 font-medium">{partner.legalName} ({partner.tradingName})</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-sm transition"
            >
              {isAr ? 'تعديل بيانات الشريك' : 'Edit Partner Info'}
            </button>
          </div>
        </div>

        {/* Quick Roles Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-bold">{isAr ? 'الأدوار النشطة:' : 'Active Roles:'}</span>
          {partner.roles.map(role => (
            <span key={role} className="text-[11px] font-mono font-bold bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded-md border border-slate-700">
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-black">
        {[
          { id: 'OVERVIEW', labelEn: 'Overview', labelAr: 'نظرة عامة', icon: Building2 },
          { id: 'CONTACTS', labelEn: 'Contacts', labelAr: 'جهات الاتصال', icon: Users },
          { id: 'ADDRESSES', labelEn: 'Addresses', labelAr: 'العناوين والمواقع', icon: MapPin },
          { id: 'BANKING', labelEn: 'Banking Details', labelAr: 'الحسابات البنكية', icon: CreditCard },
          { id: 'CREDIT', labelEn: 'Credit & Finance', labelAr: 'الائتمان والمالية', icon: DollarSign },
          { id: 'COMPLIANCE', labelEn: 'Compliance & KYC', labelAr: 'الامتثال والترخيص', icon: ShieldCheck },
          { id: 'DOCUMENTS', labelEn: 'Documents Registry', labelAr: 'سجل المستندات', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-amber-600 bg-amber-50/50 text-amber-900 font-black'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'الاسم القانوني (Legal Name)' : 'Legal Name'}</span>
              <p className="font-extrabold text-slate-900 text-sm">{partner.legalName}</p>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'الاسم التجاري (Trading Name)' : 'Trading Name'}</span>
              <p className="font-extrabold text-slate-900 text-sm">{partner.tradingName}</p>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'السجل التجاري (Commercial Registration)' : 'Commercial Registration'}</span>
              <p className="font-mono font-extrabold text-slate-900 text-sm">{partner.commercialRegistration || 'N/A'}</p>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'الرقم الضريبي (VAT Number)' : 'VAT Number'}</span>
              <p className="font-mono font-extrabold text-slate-900 text-sm">{partner.vatNumber || 'N/A'}</p>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'قطاع الصناعة وحجم الشركة' : 'Industry & Business Size'}</span>
              <p className="font-bold text-slate-800">{partner.industry} ({partner.businessSize})</p>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'العملة وشروط الدفع' : 'Currency & Payment Terms'}</span>
              <p className="font-mono font-extrabold text-slate-900">{partner.preferredCurrency} | {partner.paymentTerms}</p>
            </div>
          </div>
        )}

        {activeTab === 'CONTACTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 text-sm">{isAr ? 'قائمة جهات الاتصال' : 'Registered Contacts'}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partner.contacts.map(contact => (
                <div key={contact.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 font-medium">{contact.jobTitle} - {contact.department}</p>
                  <div className="pt-2 border-t border-slate-200 space-y-1 font-mono text-[11px]">
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {contact.email}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {contact.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ADDRESSES' && (
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 text-sm">{isAr ? 'العناوين والمواقع المسجلة' : 'Registered Addresses'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partner.addresses.map(addr => (
                <div key={addr.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{addr.addressName}</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-mono font-bold rounded">
                      {addr.type}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{addr.street}, {addr.city}, {addr.country}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'BANKING' && (
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 text-sm">{isAr ? 'تفاصيل الحسابات البنكية' : 'Bank Accounts'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partner.bankAccounts.map(bank => (
                <div key={bank.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{bank.bankName}</span>
                    {bank.isPrimary && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        Primary Account
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 font-medium">{bank.accountName}</p>
                  <p className="font-mono text-slate-900 font-extrabold">IBAN: {bank.iban}</p>
                  <p className="font-mono text-slate-500 text-[11px]">SWIFT: {bank.swift}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CREDIT' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-700 font-bold block">{isAr ? 'الحد الائتماني (Credit Limit)' : 'Credit Limit'}</span>
                <p className="text-lg font-black text-emerald-950 font-mono">
                  SAR {(partner.credit?.creditLimit || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <span className="text-amber-700 font-bold block">{isAr ? 'التعرض الائتماني الحالي' : 'Credit Exposure'}</span>
                <p className="text-lg font-black text-amber-950 font-mono">
                  SAR {(partner.credit?.creditExposure || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block">{isAr ? 'التصنيف وفئة المخاطر' : 'Rating & Risk'}</span>
                <p className="text-lg font-black text-slate-900 font-mono">
                  {partner.credit?.creditRating} ({partner.credit?.riskCategory})
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'COMPLIANCE' && (
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 text-sm">{isAr ? 'حالة الامتثال والترخيص' : 'Compliance & Licensing Status'}</h4>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">KYC Status:</span>
                <span className="font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {partner.compliance?.kycStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">AML Status:</span>
                <span className="font-black text-slate-900">{partner.compliance?.amlCheckStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Sanctions Check:</span>
                <span className="font-black text-slate-900">{partner.compliance?.sanctionsStatus}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 text-sm">{isAr ? 'المستندات والعقود المسجلة' : 'Attached Documents & Contracts'}</h4>
            {partner.documents.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{isAr ? 'لا توجد مستندات مرفقة حتى الآن.' : 'No attached documents registered.'}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partner.documents.map(doc => (
                  <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900">{doc.title}</p>
                      <p className="text-slate-500 text-[11px] font-mono">{doc.documentType} v{doc.version}</p>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-[11px]"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
