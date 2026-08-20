import React, { useState, useEffect } from 'react';
import { Globe, Building, Phone, Mail, FileText, Image, HelpCircle, Save, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

interface CompanyData {
  name: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  headquartersAddress: string;
  commercialRegistration: string;
}

interface FAQItem {
  id?: string;
  category: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export const AdminCMS: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'company' | 'hero' | 'faqs'>('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Company Form
  const [company, setCompany] = useState<CompanyData>({
    name: 'شركة أجا اللوجستية (Aja Logistics Global)',
    phone: '+44 20 7946 0000',
    whatsappNumber: '+44 7700 900000',
    email: 'info@aja-logistics.com',
    headquartersAddress: 'شارع كندا 1، الكناري وورف، مدينة لندن، المملكة المتحدة',
    commercialRegistration: 'UK-CR-8849201',
  });

  // Hero Announcement
  const [announcementAr, setAnnouncementAr] = useState('أهلاً بكم في شركة أجا اللوجستية - شريككم الموثوق للنقل والشحن البحري والبري والتخليص الجمركي.');
  const [announcementEn, setAnnouncementEn] = useState('Welcome to Aja Logistics - Your trusted partner for Sea, Land freight and Customs clearance.');

  // FAQs
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [newFaq, setNewFaq] = useState<FAQItem>({
    category: 'GENERAL',
    questionAr: '',
    questionEn: '',
    answerAr: '',
    answerEn: '',
  });

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resCms = await fetch('/api/admin/cms', { headers: { Authorization: `Bearer ${token}` } });
      if (resCms.ok) {
        const data = await resCms.json();
        if (data.company) {
          setCompany({
            name: data.company.name || company.name,
            phone: data.company.phone || company.phone,
            whatsappNumber: data.company.whatsappNumber || company.whatsappNumber,
            email: data.company.email || company.email,
            headquartersAddress: data.company.headquartersAddress || company.headquartersAddress,
            commercialRegistration: data.company.commercialRegistration || company.commercialRegistration,
          });
        }
      }

      const resFaqs = await fetch('/api/admin/faqs', { headers: { Authorization: `Bearer ${token}` } });
      if (resFaqs.ok) {
        const dataFaqs = await resFaqs.json();
        setFaqs(Array.isArray(dataFaqs) ? dataFaqs : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyData: company }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', message: 'تم تحديث بيانات ومعلومات التواصل للشركة بنجاح.' });
      } else {
        setStatusMsg({ type: 'error', message: 'فشل حفظ بيانات الشركة' });
      }
    } catch {
      setStatusMsg({ type: 'error', message: 'خطأ في الاتصال بالشبكة' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: 'homepage_announcement',
          bodyAr: announcementAr,
          bodyEn: announcementEn,
        }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', message: 'تم نشر شريط الإعلان الرئيسي للموقع بنجاح.' });
      }
    } catch {
      setStatusMsg({ type: 'error', message: 'خطأ في الحفظ' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newFaq.questionAr.trim() || !newFaq.answerAr.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFaq),
      });

      if (res.ok) {
        setNewFaq({
          category: 'GENERAL',
          questionAr: '',
          questionEn: '',
          answerAr: '',
          answerEn: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner label="جاري استدعاء لوحة التحكم بمحتوى الموقع CMS..." />;

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-700">
        <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          إدارة المحتوى والموقع الإلكتروني (CMS)
        </h2>
        <p className="text-xs text-slate-300">التحكم ببيانات الشركة، أرقام الواتساب والهاتف، الإعلانات، والأسئلة الشائعة</p>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'company' ? 'bg-[#082F49] text-white border border-[#0F4C75]' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          بيانات الشركة والتواصل
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'hero' ? 'bg-[#082F49] text-white border border-[#0F4C75]' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          الإعلانات والرئيسية
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'faqs' ? 'bg-[#082F49] text-white border border-[#0F4C75]' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          الأسئلة الشائعة (FAQ)
        </button>
      </div>

      {/* Company Info Form */}
      {activeTab === 'company' && (
        <Card title="معلومات وتفاصيل التواصل الرسمية للشركة" className="bg-slate-800 border-slate-700 text-slate-100">
          <form onSubmit={handleSaveCompany} className="space-y-4 max-w-2xl text-xs">
            <Input
              label="اسم الشركة الرسمي *"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              required
              className="bg-slate-900 border-slate-700 text-white"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رقم الهاتف الرئيسي *"
                value={company.phone}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                required
                className="bg-slate-900 border-slate-700 text-white font-mono"
              />

              <Input
                label="رقم الواتساب الرسمي *"
                value={company.whatsappNumber}
                onChange={(e) => setCompany({ ...company, whatsappNumber: e.target.value })}
                required
                className="bg-slate-900 border-slate-700 text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="البريد الإلكتروني الرسمي *"
                type="email"
                value={company.email}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                required
                className="bg-slate-900 border-slate-700 text-white font-mono"
              />

              <Input
                label="رقم السجل التجاري *"
                value={company.commercialRegistration}
                onChange={(e) => setCompany({ ...company, commercialRegistration: e.target.value })}
                required
                className="bg-slate-900 border-slate-700 text-white font-mono"
              />
            </div>

            <Input
              label="عنوان المقر الرئيسي *"
              value={company.headquartersAddress}
              onChange={(e) => setCompany({ ...company, headquartersAddress: e.target.value })}
              required
              className="bg-slate-900 border-slate-700 text-white"
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="secondary" isLoading={saving} className="gap-2 text-xs">
                <Save className="w-4 h-4" />
                <span>حفظ بيانات التواصل</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Hero Announcement Form */}
      {activeTab === 'hero' && (
        <Card title="إدارة شريط الإعلانات في واجهة الموقع" className="bg-slate-800 border-slate-700 text-slate-100">
          <form onSubmit={handleSaveAnnouncement} className="space-y-4 max-w-2xl text-xs">
            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">الإعلان الرئيسي باللغة العربية</label>
              <textarea
                rows={3}
                value={announcementAr}
                onChange={(e) => setAnnouncementAr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">الإعلان الرئيسي باللغة الإنجليزية</label>
              <textarea
                rows={3}
                value={announcementEn}
                onChange={(e) => setAnnouncementEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="secondary" isLoading={saving} className="gap-2 text-xs">
                <Save className="w-4 h-4" />
                <span>نشر الإعلان</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* FAQs Management */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <Card title="إضافة سؤال شائع جديد" className="bg-slate-800 border-slate-700 text-slate-100">
            <form onSubmit={handleAddFaq} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="السؤال (بالعربية) *"
                  value={newFaq.questionAr}
                  onChange={(e) => setNewFaq({ ...newFaq, questionAr: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Input
                  label="السؤال (بالإنجليزية)"
                  value={newFaq.questionEn}
                  onChange={(e) => setNewFaq({ ...newFaq, questionEn: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">الإجابة (بالعربية) *</label>
                  <textarea
                    rows={3}
                    value={newFaq.answerAr}
                    onChange={(e) => setNewFaq({ ...newFaq, answerAr: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">الإجابة (بالإنجليزية)</label>
                  <textarea
                    rows={3}
                    value={newFaq.answerEn}
                    onChange={(e) => setNewFaq({ ...newFaq, answerEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="secondary" isLoading={saving} className="gap-2 text-xs">
                  <Plus className="w-4 h-4" />
                  <span>إضافة السؤال الشائع</span>
                </Button>
              </div>
            </form>
          </Card>

          <Card title={`قائمة الأسئلة الشائعة الحالية (${faqs.length})`} className="bg-slate-800 border-slate-700 text-slate-100">
            {faqs.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">لا توجد أسئلة شائعة حتى الآن.</p>
            ) : (
              <div className="space-y-3">
                {faqs.map((f) => (
                  <div key={f.id} className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex items-start justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-amber-400">{f.questionAr}</p>
                      <p className="text-slate-300">{f.answerAr}</p>
                    </div>
                    {f.id && (
                      <button
                        onClick={() => handleDeleteFaq(f.id!)}
                        className="text-slate-400 hover:text-rose-400 p-1 shrink-0"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
