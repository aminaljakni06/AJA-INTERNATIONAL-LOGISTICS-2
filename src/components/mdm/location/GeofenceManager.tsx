import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Compass, Plus, ShieldCheck, MapPin, Bell, CheckCircle2 } from 'lucide-react';
import { GeofenceZone } from '../../../types/locationMaster';
import { LocationMasterClient as LocationMasterService } from '../../../services/locationMasterClient';

export const GeofenceManager: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [zoneCode, setZoneCode] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(500);

  const loadData = async () => {
    const list = await LocationMasterService.getGeofences();
    setGeofences(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneCode || !zoneName) return;

    await LocationMasterService.createGeofence(
      {
        zoneCode: zoneCode.toUpperCase(),
        zoneName,
        type: 'CIRCLE',
        centerLat: 24.62,
        centerLng: 46.78,
        radiusMeters,
        entryAlertEnabled: true,
        exitAlertEnabled: true,
        speedLimitKmh: 20
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
          <h2 className="text-xl font-black text-slate-900">{isAr ? 'منصة التسيير الجغرافي والحدود الذكية (Geofencing)' : 'Geofencing & Spatial Zone Platform'}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{isAr ? 'إدارة النطاقات الجغرافية الآمنة، وتنبيهات الدخول والخروج والتتبع الآلي' : 'Set spatial security boundaries around hubs, ports & delivery corridors'}</p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إنشاء نطاق جغرافي' : 'Create Geofence Zone'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
          <h3 className="font-bold text-sm text-amber-400">{isAr ? 'إنشاء نطاق أمان جغرافي (Geofence)' : 'Create Geofence Boundary'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'كود النطاق' : 'Zone Code'}</label>
              <input
                type="text"
                required
                value={zoneCode}
                onChange={e => setZoneCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase"
                placeholder="GF-JED-01"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'اسم النطاق الجغرافي' : 'Zone Name'}</label>
              <input
                type="text"
                required
                value={zoneName}
                onChange={e => setZoneName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="Jeddah Port Outer Perimeter"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'نصف القطر (أمتار)' : 'Radius (Meters)'}</label>
              <input
                type="number"
                value={radiusMeters}
                onChange={e => setRadiusMeters(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400">{isAr ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl">{isAr ? 'حفظ النطاق' : 'Save Geofence'}</button>
          </div>
        </form>
      )}

      {/* Geofences List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {geofences.map(gf => (
          <div key={gf.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-amber-500 transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {gf.zoneCode}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-2">{gf.zoneName}</h3>
                <div className="text-slate-500 text-xs mt-0.5">
                  Type: <span className="font-bold text-slate-700">{gf.type}</span> ({gf.radiusMeters}m radius)
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                Active Monitoring
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl text-xs text-slate-700">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'التنبيهات:' : 'Alert Hooks:'} Entry Trigger ✓ | Exit Trigger ✓ | Speed Limit: {gf.speedLimitKmh} km/h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
