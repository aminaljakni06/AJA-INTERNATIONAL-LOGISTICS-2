import React from 'react';
import { ShieldCheck, Award, FileCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const PartnersCertificationsSection: React.FC = () => {
  const { isAr } = useLanguage();

  const certs = [
    {
      title: 'IATA Cargo Agent',
      code: 'IATA Accredited',
      desc: isAr ? 'اعتماد الاتحاد الدولي للنقل الجوي معايير الشحن الجوي الآمن' : 'International Air Transport Association accredited cargo agent',
    },
    {
      title: 'FIATA Member',
      code: 'Global Freight Federation',
      desc: isAr ? 'عضوية الاتحاد الدولي لجمعيات وكلاء الشحن والمخلصين' : 'International Federation of Freight Forwarders Associations',
    },
    {
      title: 'FASAH Authorized',
      code: 'ZATCA Digital Customs',
      desc: isAr ? 'اعتماد التخليص الإلكتروني السريع عبر منصة فسح السعودية' : 'Official ZATCA FASAH rapid electronic clearance integration',
    },
    {
      title: 'ISO 9001 & 27001',
      code: 'Quality & Data Security',
      desc: isAr ? 'شهادات الجودة العالمية وأمن المعلومات والبيانات اللوجستية' : 'Quality Management & Information Security Management Certified',
    },
    {
      title: 'SFDA GDP Certified',
      code: 'Pharma Cold-Chain',
      desc: isAr ? 'ترخيص الهيئة العامة للغذاء والدواء لنقل وتخزين الأدوية' : 'Saudi Food & Drug Authority compliant cold-chain transport',
    },
    {
      title: 'WCA World Network',
      code: 'Global Logistics Alliance',
      desc: isAr ? 'عضوية تحالف الشحن العالمي الموثوق لأكثر من 190 دولة' : 'Premier network connecting 10,000+ logistics offices worldwide',
    },
  ];

  return (
    <section className="py-16 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <p className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">
            {isAr ? 'الاعتمادات والتراخيص الرسمية' : 'CERTIFICATIONS & REGULATORY COMPLIANCE'}
          </p>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white">
            {isAr ? 'حاصلون على أرفع الشهادات والتراخيص الدولية' : 'Licensed & Accredited by Global Logistics Bodies'}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {certs.map((c, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-2 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit mx-auto">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">{c.title}</div>
                <div className="text-[10px] text-cyan-400 font-mono">{c.code}</div>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
