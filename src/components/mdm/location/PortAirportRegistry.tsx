import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Anchor, Plane, Plus, Search, ShieldCheck, MapPin, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import { PortMaster, AirportMaster } from '../../../types/locationMaster';
import { LocationMasterClient as LocationMasterService } from '../../../services/locationMasterClient';

export const PortAirportRegistry: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'SEA_PORTS' | 'AIRPORTS'>('SEA_PORTS');
  const [ports, setPorts] = useState<PortMaster[]>([]);
  const [airports, setAirports] = useState<AirportMaster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Sea Port Form State
  const [unLocode, setUnLocode] = useState('');
  const [portNameEn, setPortNameEn] = useState('');
  const [portNameAr, setPortNameAr] = useState('');
  const [countryCode, setCountryCode] = useState('SA');
  const [annualTeu, setAnnualTeu] = useState(2000000);

  // Airport Form State
  const [iataCode, setIataCode] = useState('');
  const [icaoCode, setIcaoCode] = useState('');
  const [airportNameEn, setAirportNameEn] = useState('');
  const [airportNameAr, setAirportNameAr] = useState('');

  const loadData = async () => {
    const [pList, aList] = await Promise.all([
      LocationMasterService.getPorts(),
      LocationMasterService.getAirports()
    ]);
    setPorts(pList);
    setAirports(aList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unLocode || !portNameEn) return;

    await LocationMasterService.createPort(
      {
        unLocode: unLocode.toUpperCase(),
        portNameEn,
        portNameAr: portNameAr || portNameEn,
        portType: 'SEA_PORT',
        countryCode: countryCode.toUpperCase(),
        latitude: 26.5,
        longitude: 50.1,
        annualTeuCapacity: annualTeu,
        supportedCargoTypes: ['CONTAINER', 'HAZMAT', 'REEFER'],
        status: 'OPERATIONAL'
      },
      'admin'
    );
    setIsAdding(false);
    loadData();
  };

  const handleCreateAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iataCode || !airportNameEn) return;

    await LocationMasterService.createAirport(
      {
        iataCode: iataCode.toUpperCase(),
        icaoCode: icaoCode.toUpperCase() || 'OE' + iataCode.toUpperCase(),
        airportNameEn,
        airportNameAr: airportNameAr || airportNameEn,
        airportType: 'INTERNATIONAL',
        countryCode: countryCode.toUpperCase(),
        cityName: 'Metropolitan',
        latitude: 24.9,
        longitude: 46.7,
        cargoTerminalCapacityTonsPerYear: 500000,
        hasReeferColdChain: true,
        hasHazmatHub: true,
        status: 'OPERATIONAL'
      },
      'admin'
    );
    setIsAdding(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{isAr ? 'سجل الموانئ البحرية والمطارات الدولية' : 'Global Ports & Airports Master'}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{isAr ? 'رموز الأمم المتحدة UN/LOCODE ورموز IATA/ICAO لمسارات الشحن الدولي' : 'UN/LOCODE maritime hubs & IATA/ICAO air cargo terminals'}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold border border-slate-200">
            <button
              onClick={() => setActiveTab('SEA_PORTS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activeTab === 'SEA_PORTS' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Anchor className="w-3.5 h-3.5" />
              <span>{isAr ? 'الموانئ البحرية' : 'Sea Ports'} ({ports.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('AIRPORTS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activeTab === 'AIRPORTS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>{isAr ? 'المطارات الجوية' : 'Airports'} ({airports.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'SEA_PORTS' ? (isAr ? 'إضافة ميناء' : 'Add Port') : (isAr ? 'إضافة مطار' : 'Add Airport')}</span>
          </button>
        </div>
      </div>

      {/* Adding Form Modal / Expandable */}
      {isAdding && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
          <h3 className="font-bold text-sm text-amber-400">
            {activeTab === 'SEA_PORTS'
              ? (isAr ? 'تسجيل ميناء بحري جديد (UN/LOCODE)' : 'Register Sea Port (UN/LOCODE)')
              : (isAr ? 'تسجيل مطار شحن جديد (IATA / ICAO)' : 'Register Air Cargo Airport (IATA/ICAO)')}
          </h3>

          {activeTab === 'SEA_PORTS' ? (
            <form onSubmit={handleCreatePort} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">UN/LOCODE Code</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={unLocode}
                  onChange={e => setUnLocode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
                  placeholder="SADMM"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{isAr ? 'اسم الميناء بالإنجليزي' : 'Port Name (EN)'}</label>
                <input
                  type="text"
                  required
                  value={portNameEn}
                  onChange={e => setPortNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  placeholder="Dammam Port"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{isAr ? 'اسم الميناء بالعربي' : 'Port Name (AR)'}</label>
                <input
                  type="text"
                  value={portNameAr}
                  onChange={e => setPortNameAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  placeholder="ميناء الدمام"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{isAr ? 'رمز الدولة (ISO-2)' : 'Country Code (ISO-2)'}</label>
                <input
                  type="text"
                  maxLength={2}
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{isAr ? 'الطاقة الاستيعابية (TEU/سنة)' : 'TEU Annual Capacity'}</label>
                <input
                  type="number"
                  value={annualTeu}
                  onChange={e => setAnnualTeu(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 items-end col-span-full">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400">{isAr ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl">{isAr ? 'حفظ الميناء' : 'Save Port'}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateAirport} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">IATA Code</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={iataCode}
                  onChange={e => setIataCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
                  placeholder="RUH"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">ICAO Code</label>
                <input
                  type="text"
                  maxLength={4}
                  value={icaoCode}
                  onChange={e => setIcaoCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
                  placeholder="OERK"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{isAr ? 'اسم المطار بالإنجليزي' : 'Airport Name (EN)'}</label>
                <input
                  type="text"
                  required
                  value={airportNameEn}
                  onChange={e => setAirportNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  placeholder="Riyadh Airport"
                />
              </div>
              <div className="flex justify-end gap-2 items-end col-span-full">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400">{isAr ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl">{isAr ? 'حفظ المطار' : 'Save Airport'}</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={isAr ? 'بحث بالاسم، رمز UN/LOCODE أو رمز IATA...' : 'Search by name, UN/LOCODE, IATA...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table Content */}
      {activeTab === 'SEA_PORTS' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">{isAr ? 'الميناء البحري' : 'Port Name'}</th>
                <th className="p-4">UN/LOCODE</th>
                <th className="p-4">{isAr ? 'الدولة / النوع' : 'Country / Type'}</th>
                <th className="p-4">{isAr ? 'الطاقة الاستيعابية (TEU)' : 'TEU Capacity'}</th>
                <th className="p-4">{isAr ? 'أنواع الشحنات المدعومة' : 'Supported Cargo'}</th>
                <th className="p-4">{isAr ? 'الحالة التشغيلية' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ports
                .filter(p => p.portNameEn.toLowerCase().includes(searchTerm.toLowerCase()) || p.unLocode.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Anchor className="w-4 h-4 text-cyan-600" />
                        <div>
                          <div>{isAr ? p.portNameAr : p.portNameEn}</div>
                          <div className="text-[11px] font-normal text-slate-500">{p.portNameEn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-600">{p.unLocode}</td>
                    <td className="p-4 text-slate-700">
                      <div className="font-bold">{p.countryCode}</div>
                      <div className="text-[10px] text-slate-400">{p.portType}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {p.annualTeuCapacity ? `${(p.annualTeuCapacity / 1000000).toFixed(1)}M TEU` : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.supportedCargoTypes.map(c => (
                          <span key={c} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px]">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">{isAr ? 'المطار الدولي' : 'Airport Name'}</th>
                <th className="p-4">IATA / ICAO</th>
                <th className="p-4">{isAr ? 'الدولة والمدينة' : 'Country / City'}</th>
                <th className="p-4">{isAr ? 'طاقة الشحن (طن/سنة)' : 'Cargo Capacity'}</th>
                <th className="p-4">{isAr ? 'محتويات المرفق' : 'Capabilities'}</th>
                <th className="p-4">{isAr ? 'الحالة التشغيلية' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {airports
                .filter(a => a.airportNameEn.toLowerCase().includes(searchTerm.toLowerCase()) || a.iataCode.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-indigo-600" />
                        <div>
                          <div>{isAr ? a.airportNameAr : a.airportNameEn}</div>
                          <div className="text-[11px] font-normal text-slate-500">{a.airportNameEn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-indigo-600">
                      {a.iataCode} / {a.icaoCode}
                    </td>
                    <td className="p-4 text-slate-700">
                      <div className="font-bold">{a.countryCode}</div>
                      <div className="text-[10px] text-slate-400">{a.cityName}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {a.cargoTerminalCapacityTonsPerYear ? `${(a.cargoTerminalCapacityTonsPerYear / 1000).toFixed(0)}k Tons` : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5">
                        {a.hasReeferColdChain && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">ColdChain</span>}
                        {a.hasHazmatHub && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px]">Hazmat</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px]">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
