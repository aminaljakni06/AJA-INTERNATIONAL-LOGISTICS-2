import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Globe, MapPin, Anchor, Plane, Building2, Compass, Search, Plus, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { LocationAnalytics, CountryMaster, PortMaster, AirportMaster, WarehouseMaster } from '../../../types/locationMaster';
import { LocationMasterClient as LocationMasterService } from '../../../services/locationMasterClient';

interface LocationExplorerProps {
  onOpenCountryManager: () => void;
  onOpenPortRegistry: () => void;
  onOpenWarehouseRegistry: () => void;
  onOpenTradeLaneManager: () => void;
}

export const LocationExplorer: React.FC<LocationExplorerProps> = ({
  onOpenCountryManager,
  onOpenPortRegistry,
  onOpenWarehouseRegistry,
  onOpenTradeLaneManager
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [analytics, setAnalytics] = useState<LocationAnalytics | null>(null);
  const [countries, setCountries] = useState<CountryMaster[]>([]);
  const [ports, setPorts] = useState<PortMaster[]>([]);
  const [airports, setAirports] = useState<AirportMaster[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [an, cList, pList, aList, wList] = await Promise.all([
        LocationMasterService.getAnalytics(),
        LocationMasterService.getCountries(),
        LocationMasterService.getPorts(),
        LocationMasterService.getAirports(),
        LocationMasterService.getWarehouses()
      ]);
      setAnalytics(an);
      setCountries(cList);
      setPorts(pList);
      setAirports(aList);
      setWarehouses(wList);
    } catch (err) {
      console.error('Failed to load location master data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCountries = countries.filter(c => 
    c.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.arabicName.includes(searchTerm) ||
    c.isoAlpha2.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Globe className="w-4 h-4" />
              <span>{isAr ? 'السجل الجغرافي واللوجستي العالمي' : 'Global Logistics Master Reference'}</span>
            </div>
            <h2 className="text-2xl font-black">
              {isAr ? 'مرجع المواقع الجغرافية وشبكة اللوجستيات' : 'Enterprise Location & Network Master'}
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              {isAr
                ? 'مصدر الحقيقة الموحد لإدارة الدول، الموانئ البحرية، المطارات، المستودعات، والممرات التجارية العالمية'
                : 'Single source of truth for global countries, sea ports, air cargo hubs, logistics parks & trade lanes.'}
            </p>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'تحديث البيانات' : 'Refresh Metrics'}</span>
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="text-slate-400 text-[11px] font-semibold">{isAr ? 'الدول المسجلة' : 'Countries'}</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{analytics?.totalCountries || 0}</div>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="text-slate-400 text-[11px] font-semibold">{isAr ? 'الموانئ البحرية' : 'Sea Ports'}</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">{analytics?.totalPorts || 0}</div>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="text-slate-400 text-[11px] font-semibold">{isAr ? 'المطارات ومراكز الشحن' : 'Air Cargo Hubs'}</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{analytics?.totalAirports || 0}</div>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="text-slate-400 text-[11px] font-semibold">{isAr ? 'المستودعات والمرافق' : 'Warehouses'}</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{analytics?.totalWarehouses || 0}</div>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="text-slate-400 text-[11px] font-semibold">{isAr ? 'مساحة التخزين (م²)' : 'Capacity (Sqm)'}</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{(analytics?.totalWarehouseSqm || 0).toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="text-slate-400 text-[11px] font-semibold">{isAr ? 'المسارات التجارية' : 'Trade Lanes'}</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{analytics?.totalTradeLanes || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={onOpenCountryManager}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition text-right group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{isAr ? 'سجل الدول والضرائب' : 'Country Master'}</h3>
          <p className="text-slate-500 text-xs mt-1">{isAr ? 'إدارة ISO، الضرائب VAT، والعقوبات' : 'ISO-3166, VAT rules & sanction audit'}</p>
        </button>

        <button
          onClick={onOpenPortRegistry}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-cyan-500 hover:shadow-md transition text-right group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Anchor className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{isAr ? 'الموانئ والمطارات (UN/LOCODE)' : 'Ports & Airports'}</h3>
          <p className="text-slate-500 text-xs mt-1">{isAr ? 'سجل UN/LOCODE ورموز IATA/ICAO' : 'UN/LOCODE ports & airport terminals'}</p>
        </button>

        <button
          onClick={onOpenWarehouseRegistry}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition text-right group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{isAr ? 'سجل المستودعات والمرافق' : 'Warehouse Hubs'}</h3>
          <p className="text-slate-500 text-xs mt-1">{isAr ? 'المستودعات، مناطق التبريد والخطرة' : 'DCs, cold storage & hazmat zones'}</p>
        </button>

        <button
          onClick={onOpenTradeLaneManager}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition text-right group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{isAr ? 'الممرات التجارية وشبكة الطرق' : 'Trade Lanes & Routes'}</h3>
          <p className="text-slate-500 text-xs mt-1">{isAr ? 'المسارات البحرية، الجوية والبرية' : 'Sea, air, land routes & carbon scores'}</p>
        </button>
      </div>

      {/* Global Countries Explorer Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-900 text-base">{isAr ? 'الدول المعتمدة في النظام' : 'Registered Country Entities'}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{isAr ? 'بيانات ISO وحالة الامتثال والتداول التجاري' : 'ISO-3166 codes, tax compliance & sanction status'}</p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={isAr ? 'بحث عن دولة أو رمز...' : 'Search country or code...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">{isAr ? 'الدولة' : 'Country'}</th>
                <th className="p-4">{isAr ? 'رموز ISO' : 'ISO Codes'}</th>
                <th className="p-4">{isAr ? 'العملة والمنطقة الزمانية' : 'Currency & Timezone'}</th>
                <th className="p-4">{isAr ? 'ضريبة القيمة المضافة' : 'VAT Rate'}</th>
                <th className="p-4">{isAr ? 'مجلس التعاون الخليجي' : 'GCC Status'}</th>
                <th className="p-4">{isAr ? 'حالة العقوبات والامتثال' : 'Sanction Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCountries.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.flagEmoji || '🌐'}</span>
                      <div>
                        <div>{isAr ? c.arabicName : c.englishName}</div>
                        <div className="text-[11px] font-normal text-slate-500">{c.englishName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-mono font-bold mr-1">{c.isoAlpha2}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">{c.isoAlpha3}</span>
                  </td>
                  <td className="p-4 text-slate-700">
                    <div className="font-bold text-slate-900">{c.currency} ({c.phoneCode})</div>
                    <div className="text-[11px] text-slate-500">{c.timeZone}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-900">{c.vatRatePercent}%</td>
                  <td className="p-4">
                    {c.isGccMember ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[11px] inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {isAr ? 'عضو الخليج (GCC)' : 'GCC Member'}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">{isAr ? 'دولي' : 'Non-GCC'}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {c.sanctionStatus === 'CLEAR' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px]">
                        {isAr ? 'آمن متاح' : 'Clear / Active'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-lg text-[11px] inline-flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        {c.sanctionStatus}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
