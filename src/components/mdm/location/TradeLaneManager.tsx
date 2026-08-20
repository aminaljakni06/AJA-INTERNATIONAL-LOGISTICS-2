import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Compass, Plus, ArrowRight, Plane, Anchor, Truck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { TradeLane } from '../../../types/locationMaster';
import { LocationMasterClient as LocationMasterService } from '../../../services/locationMasterClient';

export const TradeLaneManager: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [lanes, setLanes] = useState<TradeLane[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [laneCode, setLaneCode] = useState('');
  const [originCountry, setOriginCountry] = useState('CN');
  const [originHub, setOriginHub] = useState('Shanghai Container Terminal');
  const [destCountry, setDestCountry] = useState('SA');
  const [destHub, setDestHub] = useState('Jeddah Islamic Port');
  const [mode, setMode] = useState<'SEA' | 'AIR' | 'ROAD' | 'RAIL'>('SEA');
  const [distanceKm, setDistanceKm] = useState(11000);
  const [transitDays, setTransitDays] = useState(21);

  const loadData = async () => {
    const list = await LocationMasterService.getTradeLanes();
    setLanes(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laneCode || !originHub || !destHub) return;

    await LocationMasterService.createTradeLane(
      {
        laneCode: laneCode.toUpperCase(),
        originCountryCode: originCountry.toUpperCase(),
        originHubName: originHub,
        destinationCountryCode: destCountry.toUpperCase(),
        destinationHubName: destHub,
        mode,
        distanceKm,
        estimatedTransitDays: transitDays,
        preferredCarrierName: 'Global Maritime Lines',
        carbonScoreCo2PerTon: 150,
        riskLevel: 'LOW',
        status: 'ACTIVE'
      },
      'admin'
    );

    setIsAdding(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{isAr ? 'إدارة الممرات التجارية وتدفق الشحنات' : 'Global Trade Lanes & Transport Networks'}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{isAr ? 'ضبط مسارات الاستيراد والتصدير، المسافات، مدة الترانزيت والانبعاثات' : 'Define import/export corridors, transit times, preferred carriers & carbon metrics'}</p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة ممر تجاري' : 'Register Trade Lane'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
          <h3 className="font-bold text-sm text-amber-400">{isAr ? 'تعريف ممر تجاري جديد' : 'Register Trade Lane Corridor'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'كود الممر التجاري' : 'Trade Lane Code'}</label>
              <input
                type="text"
                required
                value={laneCode}
                onChange={e => setLaneCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase"
                placeholder="TL-CN-SA-AIR"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'دولة المبدأ (ISO-2)' : 'Origin Country (ISO-2)'}</label>
              <input
                type="text"
                maxLength={2}
                value={originCountry}
                onChange={e => setOriginCountry(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'مركز المبدأ (Origin Hub)' : 'Origin Hub Name'}</label>
              <input
                type="text"
                value={originHub}
                onChange={e => setOriginHub(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'دولة الوصول (ISO-2)' : 'Destination Country (ISO-2)'}</label>
              <input
                type="text"
                maxLength={2}
                value={destCountry}
                onChange={e => setDestCountry(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'مركز الوصول (Destination Hub)' : 'Destination Hub Name'}</label>
              <input
                type="text"
                value={destHub}
                onChange={e => setDestHub(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'وسيلة النقل' : 'Transport Mode'}</label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="SEA">Sea Freight (شحن بحري)</option>
                <option value="AIR">Air Freight (شحن جوي)</option>
                <option value="ROAD">Road Freight (شحن بري)</option>
                <option value="RAIL">Rail Freight (سكك حديدية)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400">{isAr ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl">{isAr ? 'حفظ الممر' : 'Save Corridor'}</button>
          </div>
        </form>
      )}

      {/* Trade Lanes List */}
      <div className="space-y-3">
        {lanes.map(l => (
          <div key={l.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  {l.mode === 'SEA' && <Anchor className="w-6 h-6" />}
                  {l.mode === 'AIR' && <Plane className="w-6 h-6" />}
                  {l.mode === 'ROAD' && <Truck className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">
                      {l.laneCode}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{l.mode} Corridor</span>
                  </div>

                  <div className="flex items-center gap-2 text-base font-black text-slate-900 mt-1">
                    <span>{l.originHubName} ({l.originCountryCode})</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span>{l.destinationHubName} ({l.destinationCountryCode})</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div>
                  <div className="text-slate-400 text-[11px]">{isAr ? 'المسافة المقدرة' : 'Distance'}</div>
                  <div className="font-bold text-slate-900">{l.distanceKm.toLocaleString()} km</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{isAr ? 'مدة الترانزيت' : 'Transit Time'}</div>
                  <div className="font-bold text-slate-900">{l.estimatedTransitDays} {isAr ? 'أيام' : 'days'}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{isAr ? 'مؤشر الكربون (CO2)' : 'Carbon Score'}</div>
                  <div className="font-bold text-slate-900">{l.carbonScoreCo2PerTon} kg/ton</div>
                </div>
                <div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl">
                    {l.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
