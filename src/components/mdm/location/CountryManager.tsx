import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Globe, Plus, Search, ShieldCheck, AlertTriangle, CheckCircle2, Edit3, MapPin } from 'lucide-react';
import { CountryMaster, CityMaster } from '../../../types/locationMaster';
import { LocationMasterClient as LocationMasterService } from '../../../services/locationMasterClient';

export const CountryManager: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [countries, setCountries] = useState<CountryMaster[]>([]);
  const [cities, setCities] = useState<CityMaster[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryMaster | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCountry, setIsAddingCountry] = useState(false);

  // New country form state
  const [isoAlpha2, setIsoAlpha2] = useState('');
  const [isoAlpha3, setIsoAlpha3] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [currency, setCurrency] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [timeZone, setTimeZone] = useState('Asia/Riyadh (UTC+3)');
  const [vatRate, setVatRate] = useState(15);
  const [isGcc, setIsGcc] = useState(false);

  const loadData = async () => {
    const list = await LocationMasterService.getCountries();
    setCountries(list);
    if (list.length > 0 && !selectedCountry) {
      setSelectedCountry(list[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      LocationMasterService.getCities(selectedCountry.isoAlpha2).then(setCities);
    }
  }, [selectedCountry]);

  const handleCreateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isoAlpha2 || !englishName || !arabicName) return;

    await LocationMasterService.createCountry(
      {
        isoAlpha2: isoAlpha2.toUpperCase(),
        isoAlpha3: isoAlpha3.toUpperCase() || isoAlpha2.toUpperCase() + 'X',
        numericCode: '000',
        arabicName,
        englishName,
        currency: currency || 'USD',
        phoneCode: phoneCode || '+000',
        timeZone,
        vatRatePercent: vatRate,
        sanctionStatus: 'CLEAR',
        tradeStatus: 'ACTIVE',
        primaryLanguages: ['Arabic', 'English'],
        isGccMember: isGcc
      },
      'admin'
    );

    setIsAddingCountry(false);
    setIsoAlpha2('');
    setIsoAlpha3('');
    setArabicName('');
    setEnglishName('');
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{isAr ? 'إدارة الدول والأقاليم والجغرافيا' : 'Country & Territory Master'}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{isAr ? 'ضبط رموز ISO الـ 3166 والعملات ونسب ضريبة القيمة المضافة' : 'Manage ISO-3166 standards, currencies, tax formats & regional boundaries'}</p>
        </div>

        <button
          onClick={() => setIsAddingCountry(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة دولة جديدة' : 'Register New Country'}</span>
        </button>
      </div>

      {isAddingCountry && (
        <form onSubmit={handleCreateCountry} className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-xl border border-slate-800">
          <h3 className="font-bold text-sm text-amber-400">{isAr ? 'إضافة دولة جديدة لسجل الماستر' : 'Register New Master Country'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'الاسم بالإنجليزي' : 'English Name'}</label>
              <input
                type="text"
                required
                value={englishName}
                onChange={e => setEnglishName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="e.g. Qatar"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'الاسم بالعربي' : 'Arabic Name'}</label>
              <input
                type="text"
                required
                value={arabicName}
                onChange={e => setArabicName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="مثال: دولة قطر"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">ISO Alpha-2</label>
              <input
                type="text"
                required
                maxLength={2}
                value={isoAlpha2}
                onChange={e => setIsoAlpha2(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
                placeholder="QA"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">ISO Alpha-3</label>
              <input
                type="text"
                maxLength={3}
                value={isoAlpha3}
                onChange={e => setIsoAlpha3(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
                placeholder="QAT"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'العملة' : 'Currency'}</label>
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase"
                placeholder="QAR"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'رمز الهاتف' : 'Phone Code'}</label>
              <input
                type="text"
                value={phoneCode}
                onChange={e => setPhoneCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="+974"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'نسبة القيمة المضافة (%)' : 'VAT Rate (%)'}</label>
              <input
                type="number"
                value={vatRate}
                onChange={e => setVatRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="gccCheck"
                checked={isGcc}
                onChange={e => setIsGcc(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <label htmlFor="gccCheck" className="text-slate-300 font-bold">{isAr ? 'عضو مجلس التعاون الخليجي (GCC)' : 'GCC Member Country'}</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingCountry(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
            >
              {isAr ? 'حفظ الدولة' : 'Save Country'}
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Country List + Detail Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country Selector */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={isAr ? 'بحث عن دولة...' : 'Filter countries...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {countries
              .filter(c => c.englishName.toLowerCase().includes(searchTerm.toLowerCase()) || c.arabicName.includes(searchTerm))
              .map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCountry(c)}
                  className={`w-full p-3 rounded-2xl text-right flex items-center justify-between transition ${
                    selectedCountry?.id === c.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'hover:bg-slate-50 text-slate-700 border border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{c.flagEmoji || '🌐'}</span>
                    <div>
                      <div className="text-xs">{isAr ? c.arabicName : c.englishName}</div>
                      <div className={`text-[10px] ${selectedCountry?.id === c.id ? 'text-slate-800' : 'text-slate-400'}`}>
                        {c.isoAlpha2} • {c.currency}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-black/10 font-mono">
                    {c.isoAlpha3}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Selected Country Details & Cities */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCountry ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCountry.flagEmoji || '🌐'}</span>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {isAr ? selectedCountry.arabicName : selectedCountry.englishName}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                      <span>{selectedCountry.englishName}</span>
                      <span>•</span>
                      <span className="font-mono text-amber-600 font-bold">ISO: {selectedCountry.isoAlpha2} / {selectedCountry.isoAlpha3} ({selectedCountry.numericCode})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCountry.isGccMember && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-xl text-xs">
                      {isAr ? 'عضو مجلس التعاون' : 'GCC Member'}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                    {selectedCountry.sanctionStatus}
                  </span>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <div className="text-slate-400">{isAr ? 'العملة الوطنية' : 'Currency'}</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedCountry.currency}</div>
                </div>
                <div>
                  <div className="text-slate-400">{isAr ? 'رمز الاتصال الدولي' : 'Phone Prefix'}</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedCountry.phoneCode}</div>
                </div>
                <div>
                  <div className="text-slate-400">{isAr ? 'نسبة الضريبة VAT' : 'VAT Rate'}</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedCountry.vatRatePercent}%</div>
                </div>
                <div>
                  <div className="text-slate-400">{isAr ? 'المنطقة الزمنية' : 'Timezone'}</div>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">{selectedCountry.timeZone}</div>
                </div>
              </div>

              {/* Cities & Urban Centers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>{isAr ? 'المدن والمحافظات التابعة' : 'Cities & Metropolitan Districts'}</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-500">{cities.length} {isAr ? 'مدينة مسجلة' : 'cities'}</span>
                </div>

                {cities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cities.map(ct => (
                      <div key={ct.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">{isAr ? ct.cityNameAr : ct.cityNameEn}</div>
                          <div className="text-slate-500 text-[11px]">{ct.provinceRegion} {ct.district ? `• ${ct.district}` : ''}</div>
                          <div className="text-slate-400 text-[10px] mt-1 font-mono">
                            GPS: {ct.latitude}, {ct.longitude}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          {ct.deliveryCoverageStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    {isAr ? 'لا توجد مدن مسجلة لهذه الدولة حالياً' : 'No cities configured for this country yet.'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              {isAr ? 'اختر دولة من القائمة لعرض التفاصيل والمدن' : 'Select a country to view details.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
