import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  Plus,
  RefreshCw,
  Star,
  Award,
  Globe,
  Radio,
  FileSpreadsheet,
  AlertCircle,
  Truck,
  TrendingUp,
  Cpu,
  Layers,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  CarrierPartnerProfile,
  FreightRateSheet,
  FreightTender,
  CarrierBid,
  EdiIntegrationSpec,
  AICarrierIntelligenceResult
} from '../../types/carrier3pl';
import { Carrier3PLClient } from '../../services/carrier3plClient';

export const Carrier3PLMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'partners' | 'tenders' | 'rates' | 'compliance' | 'edi' | 'ai-carrier'>('partners');
  const [partners, setPartners] = useState<CarrierPartnerProfile[]>([]);
  const [rateSheets, setRateSheets] = useState<FreightRateSheet[]>([]);
  const [tenders, setTenders] = useState<FreightTender[]>([]);
  const [bids, setBids] = useState<CarrierBid[]>([]);
  const [ediSpecs, setEdiSpecs] = useState<EdiIntegrationSpec[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<CarrierPartnerProfile | null>(null);

  // AI Tender evaluation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AICarrierIntelligenceResult | null>(null);

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    setLoading(true);
    try {
      const [pList, rList, tenderData, eList] = await Promise.all([
        Carrier3PLClient.getCarrierPartners(),
        Carrier3PLClient.getFreightRateSheets(),
        Carrier3PLClient.getFreightTendersAndBids(),
        Carrier3PLClient.getEdiSpecs(),
      ]);
      setPartners(pList);
      setRateSheets(rList);
      setTenders(tenderData.tenders);
      setBids(tenderData.bids);
      setEdiSpecs(eList);
      if (pList.length > 0) {
        setSelectedPartner(pList[0]);
      }
    } catch (err) {
      console.error('Error loading carrier 3PL data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiTenderEvaluation = async (tender: FreightTender) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const tenderBids = bids.filter(b => b.tenderId === tender.id);
      const response = await fetch('/api/carrier3pl/ai/tender-evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenderId: tender.id,
          tenderTitle: tender.title,
          cargoDescription: tender.cargoDescription,
          bids: tenderBids,
        }),
      });
      const data = await response.json();
      if (data.success && data.result) {
        setAiResult(data.result);
      }
    } catch (err) {
      console.error('AI Tender error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredPartners = partners.filter(p =>
    p.companyName.includes(searchTerm) ||
    p.partnerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contactPerson.name.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8 space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl text-white shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {isAr ? 'منصة الشركاء والناقلين والـ 3PL/4PL' : 'Carrier, Vendor & 3PL/4PL Enterprise Platform'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'إدارة العقود، المناقصات، أسعار الشحن، الالتزام بـ SLA والتكامل الإلكتروني EDI' : 'Contract Freight Rates, Tenders, Partner Portals, SLA & EDI Standard Gateways'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPartnerData}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isAr ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all">
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'تسجيل ناقل / شرك 3PL جديد' : 'Add Partner Carrier'}</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'شركاء النقل المعتمدون' : 'Active Partner Carriers'}</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {partners.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'شركة' : 'Partners'}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>عقود 3PL/4PL سارية ومستوفية للشروط</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'المناقصات النشطة' : 'Active Freight Tenders'}</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {tenders.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'مناقصة' : 'Tenders'}</span>
          </div>
          <div className="text-[10px] text-gray-500">
            مستلم {bids.length} عروض تنافسية
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'معدل الالتزام بـ SLA' : 'Partner SLA Compliance'}</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
            98.8%
          </div>
          <div className="text-[10px] text-teal-600 font-bold">
            أداء تسليم استثنائي ضمن النطاق المعتمد
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'ربط التبادل الإلكتروني EDI' : 'Active EDI Integrations'}</span>
            <Radio className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {ediSpecs.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'قناة' : 'Gateways'}</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-bold">
            EDIFACT / ANSI X12 / REST APIs
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'partners', label: isAr ? 'سجل الناقلين والشركاء' : 'Partner Registry', icon: Users },
          { id: 'tenders', label: isAr ? 'المناقصات والمزايدات' : 'Freight Tenders & Bids', icon: FileText },
          { id: 'rates', label: isAr ? 'قوائم الأسعار ورسوم الوقود' : 'Contract Rates & Fuel', icon: DollarSign },
          { id: 'compliance', label: isAr ? 'التراخيص والالتزام بـ SLA' : 'Compliance & SLA', icon: ShieldCheck },
          { id: 'edi', label: isAr ? 'تكامل EDI والربط الإلكتروني' : 'EDI & API Gateway', icon: Radio },
          { id: 'ai-carrier', label: isAr ? 'ذكاء الناقلين والمناقصات AI' : 'AI Carrier Intelligence', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="space-y-6">
        {/* TAB 1: PARTNERS REGISTRY */}
        {activeTab === 'partners' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAr ? 'بحث باسم الشركة، كود الشريك، جهة الاتصال...' : 'Search partner name, code, contact...'}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-3">
                {filteredPartners.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPartner(p)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      selectedPartner?.id === p.id
                        ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                          {p.partnerCode} ({p.partnerType})
                        </span>
                        <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 mt-1">
                          {p.companyName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-amber-500 text-xs">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {p.overallRatingStars}
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
                      <span>المسؤول: <strong>{p.contactPerson.name}</strong> ({p.contactPerson.role})</span>
                      <span className="text-emerald-600 font-bold">حجم الأسطول: {p.fleetSizeCount} شاحنة</span>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-500">
                      <span>مناطق التشغيل: {p.operatingRegions.join(' • ')}</span>
                      <span className="font-bold text-teal-600">SLA: {p.slaOnTimeDeliveryRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PARTNER DETAILS CARD */}
            {selectedPartner && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600">{selectedPartner.partnerCode}</span>
                  <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mt-1">
                    {selectedPartner.companyName}
                  </h2>
                  <p className="text-xs text-gray-500">{selectedPartner.partnerType}</p>
                </div>

                <div className="space-y-3 text-xs border-t border-b border-gray-100 dark:border-gray-700 py-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">البريد الإلكتروني:</span>
                    <span className="font-mono text-blue-600">{selectedPartner.contactPerson.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الهاتف:</span>
                    <span className="font-mono">{selectedPartner.contactPerson.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الحساب البنكي IBAN:</span>
                    <span className="font-mono">{selectedPartner.ibanNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الرقم الضريبي VAT:</span>
                    <span className="font-mono">{selectedPartner.vatTaxNumber}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>مؤشر الأسطول الأخضر:</span>
                    <span>{selectedPartner.greenFleetScore} / 100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200">التراخيص والالتزام الجمركي:</h4>
                  <div className="space-y-2 text-xs">
                    {selectedPartner.complianceDocs.map((doc) => (
                      <div key={doc.id} className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-bold">{doc.docType}</p>
                          <p className="text-[10px] text-gray-400">{doc.issuingAuthority} - {doc.documentNumber}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {doc.verificationStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TENDERS & BIDS */}
        {activeTab === 'tenders' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {isAr ? 'مناقصات شحن البضائع والعروض التنافسية (Freight Tenders)' : 'Active Freight Tenders & Bids'}
              </h3>

              {tenders.map((tender) => {
                const tenderBids = bids.filter(b => b.tenderId === tender.id);
                return (
                  <div key={tender.id} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-blue-600">{tender.tenderNumber}</span>
                        <h4 className="font-extrabold text-base text-gray-900 dark:text-gray-100">{tender.title}</h4>
                      </div>
                      <button
                        onClick={() => handleRunAiTenderEvaluation(tender)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>تحليل الذكاء الاصطناعي وترسية العرض</span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300">{tender.cargoDescription}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div>المسار: <strong>{tender.originRegion} ← {tender.destinationRegion}</strong></div>
                      <div>الحجم الكلي: <strong>{tender.totalEstimatedTons.toLocaleString()} طن</strong></div>
                      <div>موعد الإغلاق: <strong>{tender.bidDeadlineDate}</strong></div>
                      <div>الحالة: <strong className="text-emerald-600">{tender.status}</strong></div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-xs text-gray-800 dark:text-gray-200">العروض التنافسية المقدمة من الناقلين ({tenderBids.length}):</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {tenderBids.map((b) => (
                          <div key={b.id} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-100">{b.carrierName}</p>
                              <p className="text-[10px] text-gray-400">زمن العبور: {b.committedTransitDays} أيام • ضمان SLA: {b.guaranteedOnTimeSlaPercent}%</p>
                            </div>
                            <span className="font-extrabold text-sm text-emerald-600">{b.bidAmountSAR.toLocaleString()} ر.س</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CONTRACT RATES */}
        {activeTab === 'rates' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              {isAr ? 'جدول أسعار الشحن المتعاقد عليها ورسوم الوقود' : 'Contract Freight Rate Sheets'}
            </h3>

            <div className="space-y-3 text-xs">
              {rateSheets.map((rate) => (
                <div key={rate.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{rate.carrierName}</p>
                    <p className="text-gray-500">{rate.originCity} ← {rate.destinationCity} ({rate.mode})</p>
                    <p className="text-gray-400 text-[10px]">ساري حتى: {rate.effectiveTo}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="font-extrabold text-base text-emerald-600">{rate.baseRateSARPerTon} ر.س / طن</span>
                    <p className="text-[10px] text-indigo-600 font-bold">+ {rate.fuelSurchargePercentage}% رسم الوقود الإضافي</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COMPLIANCE & SLA */}
        {activeTab === 'compliance' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-teal-600">
              <ShieldCheck className="w-5 h-5" />
              {isAr ? 'مراقبة الالتزام بالتراخيص واتفاقيات مستوى الخدمة SLA' : 'Partner Compliance & SLA Monitoring'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {partners.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>{p.companyName}</span>
                    <span className="text-teal-600">SLA: {p.slaOnTimeDeliveryRate}%</span>
                  </div>
                  <p className="text-gray-500 text-[11px]">حالة العقد: <strong className="text-emerald-600">{p.contractStatus}</strong></p>
                  <p className="text-gray-400 text-[10px]">الرقم الضريبي: {p.vatTaxNumber}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EDI & API GATEWAY */}
        {activeTab === 'edi' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-600">
              <Radio className="w-5 h-5" />
              {isAr ? 'قنوات الربط الإلكتروني للشركاء (EDI & API Gateways)' : 'EDI Transactions & Partner API Integration'}
            </h3>

            <div className="space-y-3 text-xs">
              {ediSpecs.map((edi) => (
                <div key={edi.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{edi.partnerName}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">{edi.protocol}</span>
                  </div>
                  <p className="font-mono text-gray-500 text-[11px]">{edi.endpointUrl}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-gray-400">المعاملات المدعومة:</span>
                    {edi.supportedEdiTransactions.map((tx) => (
                      <span key={tx} className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-[10px] font-mono">
                        {tx}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AI CARRIER INTELLIGENCE */}
        {activeTab === 'ai-carrier' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
                {isAr ? 'محرك التقييم الذكي للمناقصات والناقلين AI' : 'AI Carrier & Tender Evaluation Engine'}
              </h3>
              <p className="text-xs text-gray-500">
                استخدام نماذج Gemini لتحليل عروض المناقصات وحساب التوفير المالي ونسب أداء SLA والمخاطر
              </p>
            </div>

            {tenders.length > 0 && (
              <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-purple-700">المناقصة المختارة:</span>
                    <h4 className="font-black text-base text-gray-900 dark:text-gray-100">{tenders[0].title}</h4>
                  </div>
                  <button
                    onClick={() => handleRunAiTenderEvaluation(tenders[0])}
                    disabled={aiLoading}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                    <span>{aiLoading ? 'جاري تقييم العروض...' : 'تشغيل محرك التقييم وترسية العرض'}</span>
                  </button>
                </div>

                {aiResult && (
                  <div className="space-y-4 pt-4 border-t border-purple-200 dark:border-purple-800 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40">
                        <span className="text-gray-400 text-[10px] block">الناقل الموصى به</span>
                        <strong className="text-base text-purple-700 dark:text-purple-300">{aiResult.recommendedCarrierName}</strong>
                        <p className="text-emerald-600 font-bold mt-1">نسبة الثقة: {aiResult.confidenceScorePercent}%</p>
                      </div>

                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40">
                        <span className="text-gray-400 text-[10px] block">التوفير المالي المتوقع</span>
                        <strong className="text-base text-emerald-600">{aiResult.estimatedCostSavingsSAR.toLocaleString()} ر.س</strong>
                      </div>

                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40">
                        <span className="text-gray-400 text-[10px] block">الأداء المتوقع SLA</span>
                        <strong className="text-base text-teal-600">{aiResult.predictedSlaPerformancePercent}%</strong>
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                      <p className="font-bold text-gray-900 dark:text-gray-100">تحليل المخاطر والأسباب:</p>
                      <p className="text-gray-600 dark:text-gray-300">{aiResult.riskEvaluationReasoning}</p>
                      <p className="font-bold text-indigo-600 mt-2">نصيحة التفاوض: {aiResult.negotiationRecommendationTip}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Carrier3PLMainView;
