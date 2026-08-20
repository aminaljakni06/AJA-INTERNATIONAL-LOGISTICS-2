import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { Lead, LeadQualificationStatus, LeadPriority, LeadSource } from '../../types/sales';

interface LeadManagerProps {
  leads: Lead[];
  loading: boolean;
  onRefresh: () => void;
  onSaveLead: (lead: Partial<Lead>) => Promise<void>;
  onConvertLead: (
    leadId: string,
    data: { opportunityName: string; expectedRevenue: number; expectedCloseDate: string; createCustomer360Profile: boolean }
  ) => Promise<void>;
}

export const LeadManager: React.FC<LeadManagerProps> = ({
  leads,
  loading,
  onRefresh,
  onSaveLead,
  onConvertLead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'KANBAN'>('LIST');

  // New / Edit Lead Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  // Lead Form State
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('الرياض');
  const [industry, setIndustry] = useState('التصنيع والتوزيع');
  const [businessSize, setBusinessSize] = useState<'MICRO' | 'SME' | 'MID_MARKET' | 'ENTERPRISE'>('ENTERPRISE');
  const [source, setSource] = useState<LeadSource>('WEBSITE');
  const [priority, setPriority] = useState<LeadPriority>('HIGH');
  const [expectedRevenue, setExpectedRevenue] = useState(250000);
  const [customerInterest, setCustomerInterest] = useState<any>('3PL_END_TO_END');
  const [notes, setNotes] = useState('');

  // Conversion Modal State
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [convertOppName, setConvertOppName] = useState('');
  const [convertRevenue, setConvertRevenue] = useState(0);
  const [convertCloseDate, setConvertCloseDate] = useState('');
  const [create360, setCreate360] = useState(true);
  const [converting, setConverting] = useState(false);

  const openNewLeadModal = () => {
    setSelectedLead(null);
    setCompanyName('');
    setContactName('');
    setJobTitle('مدير اللوجستيات');
    setEmail('');
    setPhone('');
    setCity('الرياض');
    setIndustry('الأغذية والمشروبات');
    setBusinessSize('ENTERPRISE');
    setSource('WEBSITE');
    setPriority('HIGH');
    setExpectedRevenue(350000);
    setCustomerInterest('COLD_CHAIN');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditLeadModal = (lead: Lead) => {
    setSelectedLead(lead);
    setCompanyName(lead.companyName);
    setContactName(lead.contactName);
    setJobTitle(lead.jobTitle || '');
    setEmail(lead.email);
    setPhone(lead.phone);
    setCity(lead.city || 'الرياض');
    setIndustry(lead.industry);
    setBusinessSize(lead.businessSize as any);
    setSource(lead.source);
    setPriority(lead.priority);
    setExpectedRevenue(lead.expectedRevenue);
    setCustomerInterest(lead.customerInterest);
    setNotes(lead.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveLead({
        id: selectedLead?.id,
        companyName,
        contactName,
        jobTitle,
        email,
        phone,
        city,
        industry,
        businessSize,
        source,
        priority,
        expectedRevenue: Number(expectedRevenue),
        customerInterest,
        notes,
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openConvertModal = (lead: Lead) => {
    setConvertingLead(lead);
    setConvertOppName(`صفقة - ${lead.companyName}`);
    setConvertRevenue(lead.expectedRevenue);
    setConvertCloseDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setCreate360(true);
    setConvertModalOpen(true);
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;
    setConverting(true);
    try {
      await onConvertLead(convertingLead.id, {
        opportunityName: convertOppName,
        expectedRevenue: Number(convertRevenue),
        expectedCloseDate: convertCloseDate,
        createCustomer360Profile: create360,
      });
      setConvertModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchSearch =
      l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.industry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || l.qualificationStatus === statusFilter;
    const matchSource = sourceFilter === 'ALL' || l.source === sourceFilter;
    const matchPriority = priorityFilter === 'ALL' || l.priority === priorityFilter;

    return matchSearch && matchStatus && matchSource && matchPriority;
  });

  const getSourceLabel = (src: LeadSource) => {
    const map: Record<LeadSource, string> = {
      WEBSITE: 'موقع الشركة',
      REFERRAL: 'توصية عميل',
      GOOGLE_ADS: 'إعلانات جوجل',
      META_ADS: 'فيسبوك وتطبيقات ميتا',
      TIKTOK_ADS: 'تيك توك',
      LINKEDIN: 'لينكد إن',
      TRADE_SHOW: 'معرض لوجستي',
      COLD_CALL: 'اتصال مباشر',
      PARTNER: 'شريك استراتيجي',
      EMAIL_CAMPAIGN: 'حملة بريدية',
      PHONE_INQUIRY: 'استفسار هاتفي',
      WALK_IN: 'زيارة مقر',
      API: 'ربط أوتوماتيكي API',
      MANUAL_ENTRY: 'إدخال يدوي',
    };
    return map[src] || src;
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="البحث برقم العميل، الشركة، أو القطاع..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-[#EA580C]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="NEW">جديد (NEW)</option>
            <option value="CONTACTED">تم التواصل (CONTACTED)</option>
            <option value="QUALIFIED">مؤهل (QUALIFIED)</option>
            <option value="UNQUALIFIED">غير مؤهل</option>
            <option value="CONVERTED">تم التحويل (CONVERTED)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none hidden md:block"
          >
            <option value="ALL">جميع والأولويات</option>
            <option value="URGENT">عاجل جداً</option>
            <option value="HIGH">مرتفع</option>
            <option value="MEDIUM">متوسط</option>
            <option value="LOW">منخفض</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex items-center">
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                viewMode === 'LIST' ? 'bg-[#0F4C75] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              قائمة
            </button>
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                viewMode === 'KANBAN' ? 'bg-[#0F4C75] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              كانبان
            </button>
          </div>

          <Button onClick={openNewLeadModal} className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>عميل محتمل جديد</span>
          </Button>
        </div>
      </div>

      {/* Main List View */}
      {viewMode === 'LIST' ? (
        <Card className="p-0 overflow-hidden border border-slate-700/80 bg-slate-900/90">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3.5">الرقم / الشركة</th>
                  <th className="p-3.5">مسؤول الاتصال</th>
                  <th className="p-3.5">المجال / المصدر</th>
                  <th className="p-3.5">درجة التأهيل AI</th>
                  <th className="p-3.5">الإيراد المتوقع</th>
                  <th className="p-3.5">الحالة الحالية</th>
                  <th className="p-3.5">المسؤول</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#EA580C]" />
                        <span>{lead.companyName}</span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{lead.leadNumber}</span>
                        <span>{lead.city}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-200 font-medium">{lead.contactName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{lead.email}</span>
                        <span>•</span>
                        <span>{lead.phone}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-200 text-xs font-semibold">{lead.industry}</div>
                      <div className="text-[11px] text-sky-400 mt-0.5">{getSourceLabel(lead.source)}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border ${
                            lead.leadScore >= 85
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : lead.leadScore >= 70
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {lead.leadScore}
                        </div>
                        {lead.leadScore >= 85 && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> فرصة ذهبية
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">
                        {lead.expectedRevenue.toLocaleString()} {lead.currency}
                      </div>
                      <div className="text-[11px] text-slate-400">{lead.customerInterest}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                          lead.qualificationStatus === 'CONVERTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : lead.qualificationStatus === 'QUALIFIED'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            : lead.qualificationStatus === 'CONTACTED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : lead.qualificationStatus === 'UNQUALIFIED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {lead.qualificationStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-slate-300">{lead.assignedSalespersonName}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {lead.qualificationStatus !== 'CONVERTED' ? (
                          <Button
                            size="sm"
                            onClick={() => openConvertModal(lead)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1 flex items-center gap-1.5"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>تحويل لصفقة</span>
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> محول
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditLeadModal(lead)}
                          className="text-xs px-2 py-1"
                        >
                          تعديل
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      لا يوجد عملاء محتملون يطابقون خيارات البحث الحالية.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'] as LeadQualificationStatus[]).map(statusKey => {
            const statusLeads = filteredLeads.filter(l => l.qualificationStatus === statusKey);
            const statusLabels: Record<LeadQualificationStatus, string> = {
              NEW: 'جديد (New Leads)',
              CONTACTED: 'تم التواصل (In Contact)',
              QUALIFIED: 'مؤهل (Qualified)',
              UNQUALIFIED: 'غير مؤهل',
              CONVERTED: 'تم التحويل (Converted)',
            };

            return (
              <div key={statusKey} className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/80 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-xs text-slate-200">{statusLabels[statusKey]}</span>
                  <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono border border-slate-700">
                    {statusLeads.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[350px]">
                  {statusLeads.map(lead => (
                    <Card key={lead.id} className="p-3 bg-slate-800 hover:border-[#EA580C]/50 transition-all cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-100">{lead.companyName}</h4>
                          <p className="text-xs text-slate-400">{lead.contactName}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          {lead.leadScore} pts
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{lead.expectedRevenue.toLocaleString()} SAR</span>
                        {lead.qualificationStatus !== 'CONVERTED' && (
                          <button
                            onClick={() => openConvertModal(lead)}
                            className="text-[11px] text-[#EA580C] hover:underline font-bold"
                          >
                            تحويل صفقة &rarr;
                          </button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT LEAD MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLead ? `تعديل عميل محتمل: ${selectedLead.companyName}` : 'تسجيل عميل محتمل جديد'}
      >
        <form onSubmit={handleSaveSubmit} className="space-y-4 text-right">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="اسم الشركة / المؤسسة *" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            <Input label="اسم جهة الاتصال الرئيسية *" value={contactName} onChange={e => setContactName(e.target.value)} required />
            <Input label="المسمى الوظيفي" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
            <Input label="البريد الإلكتروني *" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="رقم الهاتف / الجوال *" value={phone} onChange={e => setPhone(e.target.value)} required />
            <Input label="المدينة / المقر" value={city} onChange={e => setCity(e.target.value)} />

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">قطاع العمل / الصناعة</label>
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">حجم النشاط التجاري</label>
              <select
                value={businessSize}
                onChange={e => setBusinessSize(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              >
                <option value="MICRO">متناهية الصغر</option>
                <option value="SME">منشأة صغيرة / متوسطة</option>
                <option value="MID_MARKET">شركة متوسطة كبرى</option>
                <option value="ENTERPRISE">شركة كبرى (Enterprise)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">مصدر العميل (Lead Source)</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              >
                <option value="WEBSITE">الموقع الإلكتروني</option>
                <option value="REFERRAL">توصية عميل / شريك</option>
                <option value="TRADE_SHOW">معرض / مؤتمر لوجستي</option>
                <option value="GOOGLE_ADS">حملة إعلانات جوجل</option>
                <option value="LINKEDIN">شبكة لينكد إن</option>
                <option value="COLD_CALL">اتصال مباشر</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الإيراد المباشر المتوقع (SAR)</label>
              <input
                type="number"
                value={expectedRevenue}
                onChange={e => setExpectedRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظات الفرصة ومتطلبات الشحن</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              placeholder="اكتب أي متطلبات خاصة بالتخزين المبرد أو الشحن الدولي..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold">
              {saving ? 'جاري الحفظ...' : 'حفظ بيانات العميل'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONVERT LEAD MODAL */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title={`تحويل العميل المحتمل: ${convertingLead?.companyName}`}
      >
        <form onSubmit={handleConvertSubmit} className="space-y-4 text-right">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <p className="font-bold">تحويل الذكاء الاصطناعي التلقائي</p>
              <p className="mt-0.5">
                سيقوم النظام بإنشاء فرصة بيعية جديدة في أنبوب المبيعات، وإنشاء ملف عميل موحد 360 في الدليل المؤسسي تلقائياً.
              </p>
            </div>
          </div>

          <Input
            label="اسم الفرصة البيعية الجديدة *"
            value={convertOppName}
            onChange={e => setConvertOppName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="القيمة المالية المتوقعة (SAR) *"
              type="number"
              value={convertRevenue}
              onChange={e => setConvertRevenue(Number(e.target.value))}
              required
            />
            <Input
              label="تاريخ الإغلاق المتوقع *"
              type="date"
              value={convertCloseDate}
              onChange={e => setConvertCloseDate(e.target.value)}
              required
            />
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">إنشاء ملف Customer 360 ذكي للعميل تلقائياً</span>
            <input
              type="checkbox"
              checked={create360}
              onChange={e => setCreate360(e.target.checked)}
              className="w-4 h-4 accent-[#EA580C]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <Button type="button" variant="outline" onClick={() => setConvertModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={converting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
              {converting ? 'جاري التحويل...' : 'تأكيد تحويل الصفقة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
