import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Anchor, Plane, Building2, Plus, Edit2, Search, Globe, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface LocationHub {
  id: string;
  apiKind?: 'ports' | 'airports' | 'warehouses';
  locCode: string;
  nameAr: string;
  nameEn: string;
  type: 'SEA_PORT' | 'AIR_PORT' | 'DRY_PORT' | 'WAREHOUSE_HUB' | 'CITY';
  countryCode: string;
  latitude: number;
  longitude: number;
  isOperational: boolean;
}

const DEFAULT_LOCATIONS: LocationHub[] = [
  {
    id: 'loc-1',
    locCode: 'SAJED',
    nameAr: 'ميناء جدة الإسلامي',
    nameEn: 'Jeddah Islamic Port',
    type: 'SEA_PORT',
    countryCode: 'SA',
    latitude: 21.4858,
    longitude: 39.1925,
    isOperational: true,
  },
  {
    id: 'loc-2',
    locCode: 'SADMM',
    nameAr: 'ميناء الملك عبدالعزيز بالدمام',
    nameEn: 'King Abdulaziz Port Dammam',
    type: 'SEA_PORT',
    countryCode: 'SA',
    latitude: 26.4344,
    longitude: 50.1033,
    isOperational: true,
  },
  {
    id: 'loc-3',
    locCode: 'SARUH',
    nameAr: 'مطار الملك خالد الدولي بالرياض',
    nameEn: 'King Khalid Intl Airport Riyadh',
    type: 'AIR_PORT',
    countryCode: 'SA',
    latitude: 24.9576,
    longitude: 46.6988,
    isOperational: true,
  },
  {
    id: 'loc-4',
    locCode: 'CNNGB',
    nameAr: 'ميناء نينغبو-تشوشان (الصين)',
    nameEn: 'Ningbo-Zhoushan Port (China)',
    type: 'SEA_PORT',
    countryCode: 'CN',
    latitude: 29.8683,
    longitude: 121.544,
    isOperational: true,
  },
  {
    id: 'loc-5',
    locCode: 'CNSHA',
    nameAr: 'ميناء شنغهاي (الصين)',
    nameEn: 'Shanghai Port (China)',
    type: 'SEA_PORT',
    countryCode: 'CN',
    latitude: 31.2304,
    longitude: 121.4737,
    isOperational: true,
  },
  {
    id: 'loc-6',
    locCode: 'AEJEA',
    nameAr: 'ميناء جبل علي (دبي)',
    nameEn: 'Jebel Ali Port (Dubai)',
    type: 'SEA_PORT',
    countryCode: 'AE',
    latitude: 24.9857,
    longitude: 55.0273,
    isOperational: true,
  },
  {
    id: 'loc-7',
    locCode: 'SAJEC',
    nameAr: 'الميناء الجاف بالرياض',
    nameEn: 'Riyadh Dry Port',
    type: 'DRY_PORT',
    countryCode: 'SA',
    latitude: 24.6468,
    longitude: 46.7322,
    isOperational: true,
  },
];

export const AdminLocations: React.FC = () => {
  const { isAr } = useLanguage();
  const { token } = useAuth();
  const [locations, setLocations] = useState<LocationHub[]>(DEFAULT_LOCATIONS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState<LocationHub | null>(null);

  const [formData, setFormData] = useState({
    locCode: '',
    nameAr: '',
    nameEn: '',
    type: 'SEA_PORT' as LocationHub['type'],
    countryCode: 'SA',
    latitude: 24.7136,
    longitude: 46.6753,
    isOperational: true,
  });

  const getLocIcon = (type: LocationHub['type']) => {
    switch (type) {
      case 'SEA_PORT':
        return <Anchor className="w-5 h-5 text-blue-400" />;
      case 'AIR_PORT':
        return <Plane className="w-5 h-5 text-indigo-400" />;
      case 'DRY_PORT':
        return <Navigation className="w-5 h-5 text-amber-400" />;
      case 'WAREHOUSE_HUB':
        return <Building2 className="w-5 h-5 text-purple-400" />;
      default:
        return <MapPin className="w-5 h-5 text-emerald-400" />;
    }
  };

  const normalizePort = (port: any): LocationHub => ({
    id: String(port.id),
    apiKind: 'ports',
    locCode: String(port.unLocode || port.locCode || port.id),
    nameAr: String(port.portNameAr || port.nameAr || ''),
    nameEn: String(port.portNameEn || port.nameEn || ''),
    type: port.portType === 'DRY_PORT' ? 'DRY_PORT' : 'SEA_PORT',
    countryCode: String(port.countryCode || 'SA'),
    latitude: Number(port.latitude || 0),
    longitude: Number(port.longitude || 0),
    isOperational: port.status !== 'CLOSED',
  });

  const normalizeAirport = (airport: any): LocationHub => ({
    id: String(airport.id),
    apiKind: 'airports',
    locCode: String(airport.iataCode || airport.locCode || airport.id),
    nameAr: String(airport.airportNameAr || airport.nameAr || ''),
    nameEn: String(airport.airportNameEn || airport.nameEn || ''),
    type: 'AIR_PORT',
    countryCode: String(airport.countryCode || 'SA'),
    latitude: Number(airport.latitude || 0),
    longitude: Number(airport.longitude || 0),
    isOperational: airport.status !== 'CLOSED',
  });

  const normalizeWarehouse = (warehouse: any): LocationHub => ({
    id: String(warehouse.id),
    apiKind: 'warehouses',
    locCode: String(warehouse.warehouseCode || warehouse.locCode || warehouse.id),
    nameAr: String(warehouse.warehouseNameAr || warehouse.nameAr || ''),
    nameEn: String(warehouse.warehouseNameEn || warehouse.nameEn || ''),
    type: 'WAREHOUSE_HUB',
    countryCode: String(warehouse.countryCode || 'SA'),
    latitude: Number(warehouse.latitude || 0),
    longitude: Number(warehouse.longitude || 0),
    isOperational: warehouse.status !== 'DECOMMISSIONED',
  });

  const getEndpointKind = (type: LocationHub['type']): LocationHub['apiKind'] => {
    if (type === 'AIR_PORT') return 'airports';
    if (type === 'WAREHOUSE_HUB') return 'warehouses';
    return 'ports';
  };

  const toApiPayload = (data: typeof formData, existing?: LocationHub | null) => {
    if (data.type === 'AIR_PORT') {
      return {
        iataCode: data.locCode.slice(0, 3).toUpperCase(),
        icaoCode: data.locCode.length >= 4 ? data.locCode.toUpperCase() : `${data.countryCode}${data.locCode}`.slice(0, 4).toUpperCase(),
        airportNameAr: data.nameAr,
        airportNameEn: data.nameEn,
        airportType: 'INTERNATIONAL',
        countryCode: data.countryCode,
        cityName: data.nameEn,
        latitude: data.latitude,
        longitude: data.longitude,
        hasReeferColdChain: true,
        hasHazmatHub: true,
        status: data.isOperational ? 'OPERATIONAL' : 'CLOSED',
      };
    }

    if (data.type === 'WAREHOUSE_HUB') {
      return {
        warehouseCode: data.locCode,
        warehouseNameAr: data.nameAr,
        warehouseNameEn: data.nameEn,
        type: 'DISTRIBUTION_CENTER',
        countryCode: data.countryCode,
        cityName: data.nameEn,
        addressStreet: data.nameAr,
        latitude: data.latitude,
        longitude: data.longitude,
        totalCapacitySqm: 10000,
        storageZoneCount: 1,
        dockCount: 1,
        supportsHazmat: false,
        supportsTemperatureControlled: false,
        workingHours: '24/7',
        status: data.isOperational ? 'ACTIVE' : 'DECOMMISSIONED',
      };
    }

    return {
      unLocode: data.locCode,
      portNameAr: data.nameAr,
      portNameEn: data.nameEn,
      portType: data.type === 'DRY_PORT' ? 'DRY_PORT' : 'SEA_PORT',
      countryCode: data.countryCode,
      latitude: data.latitude,
      longitude: data.longitude,
      supportedCargoTypes: ['CONTAINER'],
      status: data.isOperational ? 'OPERATIONAL' : 'CLOSED',
    };
  };

  const fetchLocations = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [portsRes, airportsRes, warehousesRes] = await Promise.all([
        fetch('/api/locations/ports', { headers }),
        fetch('/api/locations/airports', { headers }),
        fetch('/api/locations/warehouses', { headers }),
      ]);

      const [ports, airports, warehouses] = await Promise.all([
        portsRes.ok ? portsRes.json() : [],
        airportsRes.ok ? airportsRes.json() : [],
        warehousesRes.ok ? warehousesRes.json() : [],
      ]);

      const next = [
        ...(Array.isArray(ports) ? ports.map(normalizePort) : []),
        ...(Array.isArray(airports) ? airports.map(normalizeAirport) : []),
        ...(Array.isArray(warehouses) ? warehouses.map(normalizeWarehouse) : []),
      ];

      setLocations(next.length > 0 ? next : DEFAULT_LOCATIONS);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [token]);

  const getTypeLabel = (type: LocationHub['type']) => {
    switch (type) {
      case 'SEA_PORT':
        return isAr ? 'ميناء بحري' : 'Sea Port';
      case 'AIR_PORT':
        return isAr ? 'مطار جوي' : 'Airport';
      case 'DRY_PORT':
        return isAr ? 'ميناء جاف' : 'Dry Port';
      case 'WAREHOUSE_HUB':
        return isAr ? 'مركز لوجستي / مستودع' : 'Logistics Hub';
      default:
        return isAr ? 'مدينة' : 'City';
    }
  };

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setFormData({
      locCode: 'SANEW',
      nameAr: '',
      nameEn: '',
      type: 'SEA_PORT',
      countryCode: 'SA',
      latitude: 24.7136,
      longitude: 46.6753,
      isOperational: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (loc: LocationHub) => {
    setEditingLoc(loc);
    setFormData({
      locCode: loc.locCode,
      nameAr: loc.nameAr,
      nameEn: loc.nameEn,
      type: loc.type,
      countryCode: loc.countryCode,
      latitude: loc.latitude,
      longitude: loc.longitude,
      isOperational: loc.isOperational,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const kind = getEndpointKind(formData.type);
    const method = editingLoc ? 'PUT' : 'POST';
    const url = editingLoc ? `/api/locations/${kind}/${editingLoc.id}` : `/api/locations/${kind}`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(toApiPayload(formData, editingLoc)),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      const normalized =
        kind === 'airports' ? normalizeAirport(saved) :
        kind === 'warehouses' ? normalizeWarehouse(saved) :
        normalizePort(saved);

      setLocations((prev) => {
        const exists = prev.some((loc) => loc.id === normalized.id);
        return exists ? prev.map((loc) => (loc.id === normalized.id ? normalized : loc)) : [normalized, ...prev];
      });
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = locations.filter((loc) => {
    const matchesSearch =
      loc.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      loc.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      loc.locCode.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || loc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
          {isAr ? 'جاري تحميل المواقع من سجل المواقع...' : 'Loading locations from master data...'}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-amber-400 flex items-center gap-2">
            <Globe className="w-6 h-6 text-amber-400" />
            {isAr ? 'دليل الموانئ والمواقع اللوجستية (Locations)' : 'Logistics Ports & Hubs Catalog'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {isAr
              ? 'إدارة الموانئ البحرية، الجوية، والمراكز اللوجستية مع ترميز UN/LOCODE والإحداثيات الجغرافية'
              : 'Configure UN/LOCODE sea ports, airports, and inland dry ports'}
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة ميناء / موقع جديد' : 'Add New Location/Port'}
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث باسم الموقع أو الرمز الدولي (e.g., SAJED)...' : 'Search by name or UN/LOCODE...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-9 pl-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'SEA_PORT', 'AIR_PORT', 'DRY_PORT', 'WAREHOUSE_HUB'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === type
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type === 'ALL'
                ? isAr ? 'الكل' : 'All'
                : getTypeLabel(type as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((loc) => (
          <Card key={loc.id} className="bg-slate-800 border-slate-700 hover:border-amber-400/50 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                  {getLocIcon(loc.type)}
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  {loc.locCode}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? loc.nameAr : loc.nameEn}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <span className="font-bold text-slate-300">[{loc.countryCode}]</span>
                  <span>•</span>
                  <span>{getTypeLabel(loc.type)}</span>
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60 font-mono text-[11px] text-slate-400 flex justify-between">
                <span>LAT: {loc.latitude}</span>
                <span>LNG: {loc.longitude}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between">
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isAr ? 'يعمل بكامل الطاقة' : 'Fully Operational'}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenEdit(loc)}
                className="text-xs font-bold text-slate-200 bg-slate-700 hover:bg-slate-600 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {isAr ? 'تعديل' : 'Edit'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white">
            <h2 className="text-lg font-bold text-amber-400">
              {editingLoc
                ? isAr ? 'تعديل بيانات الموقع/الميناء' : 'Edit Logistics Hub'
                : isAr ? 'إضافة موقع / ميناء جديد' : 'Add Logistics Hub'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'رمز UN/LOCODE' : 'UN/LOCODE'}</label>
                  <input
                    type="text"
                    required
                    value={formData.locCode}
                    onChange={(e) => setFormData({ ...formData, locCode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'رمز الدولة' : 'Country Code'}</label>
                  <input
                    type="text"
                    required
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'اسم الموقع بالعربية' : 'Arabic Name'}</label>
                <input
                  type="text"
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'اسم الموقع بالإنجليزية' : 'English Name'}</label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'نوع المرفق' : 'Facility Type'}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="SEA_PORT">{isAr ? 'ميناء بحري (Sea Port)' : 'Sea Port'}</option>
                  <option value="AIR_PORT">{isAr ? 'مطار شحن جوي (Airport)' : 'Airport'}</option>
                  <option value="DRY_PORT">{isAr ? 'ميناء جاف (Dry Port)' : 'Dry Port'}</option>
                  <option value="WAREHOUSE_HUB">{isAr ? 'مركز لوجستي وتخزين' : 'Logistics Hub'}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'خط العرض (Latitude)' : 'Latitude'}</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'خط الطول (Longitude)' : 'Longitude'}</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="border-slate-700 text-slate-300">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-amber-400 text-slate-950 font-bold">
                  {isAr ? 'حفظ الموقع' : 'Save Location'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
