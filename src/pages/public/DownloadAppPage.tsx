import React, { useState } from 'react';
import { Smartphone, ShieldCheck, BellRing, MapPin, QrCode, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const DownloadAppPage: React.FC<{ onNavigate?: (tab: string) => void }> = () => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | null>(null);

  const handleDownload = (platform: 'ios' | 'android') => {
    setSelectedPlatform(platform);
    setDownloadModalOpen(true);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <section className="bg-[#082F49] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#0F4C75]">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F4C75] text-white text-xs font-bold">
            <Smartphone className="w-4 h-4 text-[#EA580C]" />
            <span>تطبيق أجا للخدمات اللوجستية الذكية</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            إدارة شحناتك وتتبعها أينما كنت مباشرة من هاتفك
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            حمل تطبيق Aja Logistics على جهازك المحمول واستمتع بتنبيهات التتبع الفورية، ومسح المستندات الجمركية، وطلب عروض الأسعار بسرعة فائقة.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => handleDownload('ios')}
              className="gap-2 font-bold shadow-lg bg-[#EA580C] hover:bg-[#C2410C] text-white border-0 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>تحميل لأجهزة Apple App Store</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleDownload('android')}
              className="gap-2 font-bold text-white border-slate-500 hover:bg-white/10"
            >
              <Download className="w-5 h-5" />
              <span>تحميل لأجهزة Google Play</span>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* App Features Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">مميزات تطبيق أجا اللوجستي</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">كل ما تحتاجه للتحكم الكامل في أسطولك وشحناتك البحرية والبرية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="w-12 h-12 bg-[#0F4C75]/20 text-[#0F4C75] dark:text-sky-400 rounded-xl flex items-center justify-center mb-4 font-bold">
                <BellRing className="w-6 h-6 text-[#EA580C]" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">تنبيهات فورية Push Notifications</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                اشعارات فورية عند مغادرة الشحنة، دخولها الميناء، انتهاء التخليص الجمركي، أو التوصيل النهائي.
              </p>
            </Card>

            <Card>
              <div className="w-12 h-12 bg-[#0F4C75]/20 text-[#0F4C75] dark:text-sky-400 rounded-xl flex items-center justify-center mb-4 font-bold">
                <MapPin className="w-6 h-6 text-[#EA580C]" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">تتبع الخريطة الحي GPS</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                متابعة حركة الشاحنات والحاويات على خريطة تفاعلية حية مع تقدير زمن الوصول الدقيق (ETA).
              </p>
            </Card>

            <Card>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">ماسح الباركود والمستندات</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                امسح بوالص الشحن والفواتير بكاميرا الهاتف لرفعها الجمركي المباشر دون الحاجة لأجهزة إضافية.
              </p>
            </Card>
          </div>
        </div>

        {/* QR Code Banner */}
        <Card className="bg-[#082F49] text-white p-8 border border-[#0F4C75]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-right">
              <span className="px-3 py-1 rounded bg-[#0F4C75] text-white text-xs font-bold">
                امسح الكود للتحميل المباشر
              </span>
              <h3 className="text-2xl font-bold text-white">حمل التطبيق على هاتفك خلال ثوانٍ</h3>
              <p className="text-xs text-slate-300 max-w-md">
                وجه كاميرا هاتفك الذكي نحو رمز QR المرفق ليتم توجيهك مباشرة لمتجر التطبيقات المعتمد.
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تطبيق مجاني 100%</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>آمن ومعتمد</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-xl shrink-0 text-center">
              <div className="w-36 h-36 bg-[#082F49] rounded-xl p-2 flex flex-col items-center justify-center text-white border border-[#0F4C75]">
                <QrCode className="w-24 h-24 text-[#EA580C]" />
                <span className="text-[10px] text-slate-300 font-mono mt-1">AJA LOGISTICS APP</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Download Confirmation Modal */}
      <Modal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title="تحميل تطبيق شركة أجا للخدمات اللوجستية"
      >
        <div className="space-y-4 pt-2 text-center">
          <div className="w-16 h-16 bg-[#0F4C75]/20 text-[#0F4C75] rounded-full flex items-center justify-center mx-auto">
            <Smartphone className="w-8 h-8 text-[#EA580C]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {selectedPlatform === 'ios' ? 'تطبيق iOS (Apple App Store)' : 'تطبيق Android (Google Play Store)'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            سيتم البدء بتنزيل حزمة تثبيت التطبيق التجريبي (v1.2.0) أو إعادة توجيهك لمتجر التطبيقات المعتمد لحساب شركة أجا اللوجستية.
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
            Aja_Logistics_v1.2.0_{selectedPlatform === 'ios' ? 'iOS.ipa' : 'Android.apk'}
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                alert('جاري بدء التنزيل... شكراً لاستخدامك تطبيق شركة أجا للخدمات اللوجستية');
                setDownloadModalOpen(false);
              }}
              className="gap-2 font-bold"
            >
              <ExternalLink className="w-4 h-4" />
              <span>بدء التحميل الآن</span>
            </Button>
            <Button variant="outline" onClick={() => setDownloadModalOpen(false)}>
              إغلاق
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
