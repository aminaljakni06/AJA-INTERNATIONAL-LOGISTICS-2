import React from 'react';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';

interface LegalPagesProps {
  type: 'privacy' | 'terms' | 'cookies';
}

export const LegalPages: React.FC<LegalPagesProps> = ({ type }) => {
  const isPrivacy = type === 'privacy';
  const isCookies = type === 'cookies';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold">
          {isPrivacy ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ) : isCookies ? (
            <CheckCircle2 className="w-4 h-4 text-[#0F4C75]" />
          ) : (
            <FileText className="w-4 h-4 text-[#0F4C75]" />
          )}
          <span>
            {isPrivacy
              ? 'وثيقة سياسة الخصوصية والحماية'
              : isCookies
              ? 'سياسة ملفات تعريف الارتباط (Cookies)'
              : 'الشروط والأحكام التنظيمية'}
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {isPrivacy
            ? 'سياسة الخصوصية وحماية البيانات - أجا الدولية'
            : isCookies
            ? 'سياسة استخدام ملفات تعريف الارتباط (Cookie Policy)'
            : 'الشروط والأحكام العامة لاستخدام الخدمات اللوجستية'}
        </h1>
        <p className="text-xs text-slate-500 font-mono">آخر تحديث: 01 يوليو 2026</p>
      </div>

      <Card className="space-y-6 leading-relaxed text-sm text-slate-700 dark:text-slate-300 p-8 border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        {isPrivacy ? (
          <>
            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">1. المقدمة ونطاق التطبيق</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                تلتزم شركة أجا الدولية للخدمات اللوجستية بحماية خصوصية وأمان بيانات كافة عملائها ومستخدمي منصتها الإلكترونية وتطبيقها الجوال وفقاً لنظام حماية البيانات الشخصية الصادر في المملكة العربية السعودية واللوائح التنظيمية ذات الصلة.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">2. البيانات التي نجمعها</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                نجمع البيانات الضرورية لتقديم وإدارة خدمات الشحن والتخليص الجمركي بفعالية، بما في ذلك: الاسم، البريد الإلكتروني، رقم الجوال، العنوان الجغرافي، اسم الشركة، بوالص الشحن، الفواتير التجارية، وبيانات السجل التجاري أو الهوية لأغراض التخليص الجمركي.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">3. استخدام البيانات ومشاركتها</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                تُستخدم بياناتك حصرياً لتنفيذ الشحنات، إصدار بوالص الشحن، التخليص عبر الموانئ والمنافذ الجمركية الرسمية (مثل منصة "فسح")، والتواصل معك بشأن حالة الشحنة. لا نقوم ببيع أو مشاركة بياناتك مع أي طرف ثالث لأغراض تسويقية.
              </p>
            </section>
          </>
        ) : isCookies ? (
          <>
            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">1. ما هي ملفات تعريف الارتباط؟</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة يُحفظ فيها جزء من التفضيلات الأساسية لتسهيل تسجيل الدخول، حفظ خيارات اللغة (العربية/الإنجليزية)، وتخصيص تجربة التتبع المباشر.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">2. كيف نستخدم ملفات الكوكيز في منصة أجا</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                نستخدم ملفات كوكيز أساسية لضمان عمل الجلسة والأمان (Session Authentication)، وحفظ تفضيلات المظهر الداكن أو الفاتح، دون تتبع أنشطتك خارج منصتنا.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">1. قبول الشروط والتراخيص</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                باستخدامك لمنصة أو خدمات شركة أجا الدولية للخدمات اللوجستية أو تقديم طلب عرض سعر، فإنك توافق التزامياً بهذه الشروط والأحكام وبأنك تملك الصفة القانونية للتعاقد وإصدار أذونات التخليص الجمركي.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">2. مسؤوليات العميل وصحة البضائع</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                يتعهد العميل بالإفصاح الكامل والصحيح عن محتويات الشحنة، وزنها، وأبعادها، وعدم شحن أي مواد محظورة أو خطرة دون موافقة كتابية وتصاريح رسمية مسبقة من الجهات المختصة.
              </p>
            </section>
          </>
        )}
      </Card>
    </div>
  );
};
