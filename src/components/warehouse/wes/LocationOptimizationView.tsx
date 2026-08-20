import React, { useState } from 'react';
import { ShieldCheck, Scale, Maximize2, Thermometer, Flame, Lock, CheckCircle2, XCircle, Search } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { LocationConstraintValidation } from '../../../types/warehouseExecution';

export const LocationOptimizationView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [skuCode, setSkuCode] = useState('SKU-PHARM-2201');
  const [candidateBin, setCandidateBin] = useState('B-A01-R02-S03');

  const mockValidation: LocationConstraintValidation = {
    binCode: candidateBin,
    skuCode: skuCode,
    weightValid: true,
    volumeValid: true,
    heightValid: true,
    dimensionValid: true,
    temperatureValid: true,
    hazmatValid: true,
    securityValid: true,
    compatibilityValid: true,
    overallStatus: 'APPROVED'
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>{isAr ? 'منظومة التحقق والتوافق المكاني الخاطف (Location Optimization & Multi-Constraint Matrix)' : 'Location Constraint & Validation Engine'}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'التحقق اللحظي من الوزن، الحجم، الارتفاع، درجة الحرارة، فئة المواد الخطرة والتوافق بين المنتجات' : 'Real-time validation for Weight, Volume, Height, Dimensions, Temperature, Hazmat & Compatibility'}
          </p>
        </div>
      </div>

      {/* SEARCH / VALIDATION CONTROLLER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">{isAr ? 'محاكاة اختبار التوافق بين الشحنة والرف' : 'Run Bin Compatibility Test'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{isAr ? 'رمز الصنف المراد إيداعه (SKU Code)' : 'SKU Code'}</label>
            <input
              type="text"
              value={skuCode}
              onChange={(e) => setSkuCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{isAr ? 'كود الخانة/الرف المستهدف (Bin Code)' : 'Target Bin Code'}</label>
            <input
              type="text"
              value={candidateBin}
              onChange={(e) => setCandidateBin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold"
            />
          </div>

          <div className="flex items-end">
            <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'فحص القيود والتوافق الآن' : 'Validate Constraints'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* VALIDATION MATRIX RESULTS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: isAr ? 'قيود الوزن Max Weight' : 'Weight Capacity', valid: mockValidation.weightValid, icon: Scale, detail: '450kg / 1200kg (37.5%)' },
          { label: isAr ? 'قيود الحجم Volume' : 'Volume Capacity', valid: mockValidation.volumeValid, icon: Maximize2, detail: '1.8 CBM / 4.0 CBM' },
          { label: isAr ? 'نطاق الحرارة Temp Range' : 'Temperature Limit', valid: mockValidation.temperatureValid, icon: Thermometer, detail: '2°C - 8°C (Cold Active)' },
          { label: isAr ? 'تصنيف المواد الخطرة Hazmat' : 'Hazmat Rules', valid: mockValidation.hazmatValid, icon: Flame, detail: 'No Hazmat Conflict' },
          { label: isAr ? 'الارتفاع والأبعاد Dimensions' : 'Height & Dimensions', valid: mockValidation.heightValid, icon: Maximize2, detail: '1.4m / 2.0m Shelf Clearance' },
          { label: isAr ? 'الأمان والحماية Security' : 'Security Level', valid: mockValidation.securityValid, icon: Lock, detail: 'Restricted Access Zone A' },
          { label: isAr ? 'التوافق الكيميائي Compatibility' : 'Chemical Compatibility', valid: mockValidation.compatibilityValid, icon: ShieldCheck, detail: 'Non-reactive Storage' },
          { label: isAr ? 'قواعد التخزين المختلط Mixed Rules' : 'Mixed Storage Policy', valid: true, icon: CheckCircle2, detail: 'Single SKU per Bin Rule' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.valid ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
              <div className="flex items-center gap-2">
                {item.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm font-extrabold ${item.valid ? 'text-emerald-600' : 'text-red-600'}`}>
                  {item.valid ? (isAr ? 'مطابق ومجاز' : 'PASS') : (isAr ? 'غير مطابق' : 'FAIL')}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono">{item.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
