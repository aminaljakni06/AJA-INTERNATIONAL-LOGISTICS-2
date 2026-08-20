import React, { useState, useEffect } from 'react';
import { Anchor, Plane, Truck, ShieldCheck, Warehouse, Plus, Edit2, CheckCircle2, XCircle, Search, Layers, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface ServiceItem {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  category: 'SEA' | 'AIR' | 'LAND' | 'CUSTOMS' | 'WAREHOUSE';
  descriptionAr: string;
  descriptionEn: string;
  sla: string;
  isActive: boolean;
  baseRateSAR: number;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    code: 'SEA_FREIGHT',
    titleAr: 'الشحن البحري الدولي (FCL / LCL)',
    titleEn: 'International Sea Freight (FCL / LCL)',
    category: 'SEA',
    descriptionAr: 'خدمات نقل الحاويات الكاملة والجزئية بأسعار تنافسية عبر خطوط الملاحة العالمية',
    descriptionEn: 'Full & Less-than Container Load shipping via global maritime lines',
    sla: '14 - 30 يوماً',
    isActive: true,
    baseRateSAR: 3500,
  },
  {
    id: 'srv-2',
    code: 'AIR_FREIGHT',
    titleAr: 'الشحن الجوي السريع',
    titleEn: 'Express Air Freight',
    category: 'AIR',
    descriptionAr: 'حلول الشحن الجوي العاجل والبضائع الحساسة مع ضمان السرعة والسلامة',
    descriptionEn: 'Urgent air cargo solutions for time-sensitive & high-value goods',
    sla: '3 - 7 أيام',
    isActive: true,
    baseRateSAR: 1800,
  },
  {
    id: 'srv-3',
    code: 'LAND_FREIGHT',
    titleAr: 'النقل البري والترانزيت',
    titleEn: 'Land Transport & Transit',
    category: 'LAND',
    descriptionAr: 'أسطول شاحنات مجهز لنقل البضائع داخلياً وبين دول الخليج والشرق الأوسط',
    descriptionEn: 'Fleet operations across Saudi Arabia, GCC & Middle East transit routes',
    sla: '1 - 5 أيام',
    isActive: true,
    baseRateSAR: 1200,
  },
  {
    id: 'srv-4',
    code: 'CUSTOMS_CLEARANCE',
    titleAr: 'التخليص الجمركي الشامل',
    titleEn: 'Customs Clearance Services',
    category: 'CUSTOMS',
    descriptionAr: 'إنهاء إجراءات الجمارك والفسح الفوري بالمنافذ البحرية والجوية والبرية',
    descriptionEn: 'Fast-track customs clearance & regulatory compliance at all KSA ports',
    sla: '24 - 48 ساعة',
    isActive: true,
    baseRateSAR: 850,
  },
  {
    id: 'srv-5',
    code: 'WAREHOUSING',
    titleAr: 'التخزين والحلول اللوجستية',
    titleEn: 'Warehousing & 3PL Logistics',
    category: 'WAREHOUSE',
    descriptionAr: 'مستودعات مؤمنة ومجهزة بالتكييف وأنظمة إدارة المخزون الحديثة',
    descriptionEn: 'Secure climate-controlled warehousing & fulfillment centers',
    sla: 'حسب الطلب',
    isActive: true,
    baseRateSAR: 2500,
  },
];

export const AdminServices: React.FC = () => {
  const { isAr } = useLanguage();
  const { token } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    titleAr: '',
    titleEn: '',
    category: 'SEA' as ServiceItem['category'],
    descriptionAr: '',
    descriptionEn: '',
    sla: '',
    baseRateSAR: 1000,
    isActive: true,
  });

  const getCategoryIcon = (category: ServiceItem['category']) => {
    switch (category) {
      case 'SEA':
        return <Anchor className="w-5 h-5 text-blue-400" />;
      case 'AIR':
        return <Plane className="w-5 h-5 text-indigo-400" />;
      case 'LAND':
        return <Truck className="w-5 h-5 text-amber-400" />;
      case 'CUSTOMS':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'WAREHOUSE':
        return <Warehouse className="w-5 h-5 text-purple-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  const mapServiceTypeToCategory = (type?: string): ServiceItem['category'] => {
    if (!type) return 'SEA';
    if (type.includes('AIR')) return 'AIR';
    if (type.includes('LAND') || type.includes('ROAD')) return 'LAND';
    if (type.includes('CUSTOMS')) return 'CUSTOMS';
    if (type.includes('WAREHOUSE')) return 'WAREHOUSE';
    return 'SEA';
  };

  const mapCategoryToServiceType = (category: ServiceItem['category']) => {
    switch (category) {
      case 'AIR':
        return 'AIR_FREIGHT';
      case 'LAND':
        return 'LAND_FREIGHT';
      case 'CUSTOMS':
        return 'CUSTOMS_CLEARANCE';
      case 'WAREHOUSE':
        return 'WAREHOUSING';
      case 'SEA':
      default:
        return 'SEA_FREIGHT';
    }
  };

  const normalizeService = (item: any): ServiceItem => ({
    id: String(item.id),
    code: String(item.code || item.type || item.serviceType || item.id),
    titleAr: String(item.titleAr || ''),
    titleEn: String(item.titleEn || item.titleAr || ''),
    category: mapServiceTypeToCategory(item.category || item.type || item.serviceType),
    descriptionAr: String(item.descriptionAr || ''),
    descriptionEn: String(item.descriptionEn || item.descriptionAr || ''),
    sla: String(item.sla || item.metadata?.sla || 'حسب الطلب'),
    isActive: item.isActive !== false,
    baseRateSAR: Number(item.baseRateSAR || item.metadata?.baseRateSAR || 0),
  });

  const toApiPayload = (service: Partial<ServiceItem> & { id?: string }) => ({
    id: service.id,
    type: mapCategoryToServiceType(service.category || 'SEA'),
    serviceType: mapCategoryToServiceType(service.category || 'SEA'),
    code: service.code,
    titleAr: service.titleAr,
    titleEn: service.titleEn,
    descriptionAr: service.descriptionAr,
    descriptionEn: service.descriptionEn,
    iconName:
      service.category === 'AIR' ? 'Plane' :
      service.category === 'LAND' ? 'Truck' :
      service.category === 'CUSTOMS' ? 'ShieldCheck' :
      service.category === 'WAREHOUSE' ? 'Warehouse' : 'Ship',
    featuresAr: [],
    featuresEn: [],
    sla: service.sla,
    baseRateSAR: service.baseRateSAR,
    isActive: service.isActive,
  });

  const fetchServices = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const next = Array.isArray(data) ? data.map(normalizeService) : [];
        setServices(next.length > 0 ? next : DEFAULT_SERVICES);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleToggleStatus = async (id: string) => {
    const existing = services.find((service) => service.id === id);
    if (!existing || !token) return;
    const updated = { ...existing, isActive: !existing.isActive };
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(toApiPayload(updated)),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error(err);
      setServices((prev) => prev.map((s) => (s.id === id ? existing : s)));
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      code: `SRV_${Date.now()}`,
      titleAr: '',
      titleEn: '',
      category: 'SEA',
      descriptionAr: '',
      descriptionEn: '',
      sla: '3 - 5 أيام',
      baseRateSAR: 1500,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setFormData({
      code: srv.code,
      titleAr: srv.titleAr,
      titleEn: srv.titleEn,
      category: srv.category,
      descriptionAr: srv.descriptionAr,
      descriptionEn: srv.descriptionEn,
      sla: srv.sla,
      baseRateSAR: srv.baseRateSAR,
      isActive: srv.isActive,
    });
    setShowModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const nextService: ServiceItem = {
      id: editingService?.id || `srv-${Date.now()}`,
      ...formData,
    };

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(toApiPayload(nextService)),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = normalizeService(await res.json());
      setServices((prev) => {
        const exists = prev.some((s) => s.id === saved.id);
        return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [saved, ...prev];
      });
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.titleAr.toLowerCase().includes(search.toLowerCase()) ||
      srv.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      srv.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || srv.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {loading && <LoadingSpinner label={isAr ? 'جاري تحميل دليل الخدمات...' : 'Loading services catalog...'} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-amber-400 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            {isAr ? 'دليل وإدارة الخدمات اللوجستية (Services)' : 'Logistics Services Catalog'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {isAr
              ? 'التحكم في خدمات الشحن البحري، الجوي، البري، التخليص الجمركي والتخزين وإعداد التعريفات'
              : 'Manage logistics service offerings, SLAs, tariffs, and availability'}
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة خدمة جديدة' : 'Add New Service'}
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث باسم الخدمة أو الرمز...' : 'Search by title or code...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-9 pl-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'SEA', 'AIR', 'LAND', 'CUSTOMS', 'WAREHOUSE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterCategory === cat
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL'
                ? isAr ? 'الكل' : 'All'
                : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((srv) => (
          <Card key={srv.id} className="bg-slate-800 border-slate-700 hover:border-amber-400/50 transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                  {getCategoryIcon(srv.category)}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      srv.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {srv.isActive ? (isAr ? 'نشطة' : 'Active') : (isAr ? 'معطلة' : 'Disabled')}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? srv.titleAr : srv.titleEn}
                </h3>
                <p className="text-xs text-amber-400 font-mono mt-0.5">{srv.code}</p>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                  {isAr ? srv.descriptionAr : srv.descriptionEn}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">{isAr ? 'مدة التسليم SLA' : 'SLA Target'}</span>
                  <span className="font-bold text-slate-200">{srv.sla}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{isAr ? 'السعر الأساسي' : 'Base Rate'}</span>
                  <span className="font-bold text-amber-400">{srv.baseRateSAR} SAR</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(srv.id)}
                className={`text-xs ${
                  srv.isActive ? 'text-rose-300 border-rose-800 hover:bg-rose-950/50' : 'text-emerald-300 border-emerald-800 hover:bg-emerald-950/50'
                }`}
              >
                {srv.isActive ? (isAr ? 'تعطيل الخدمة' : 'Disable') : (isAr ? 'تفعيل الخدمة' : 'Enable')}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenEdit(srv)}
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
              {editingService
                ? isAr ? 'تعديل بيانات الخدمة' : 'Edit Service Catalog Item'
                : isAr ? 'إضافة خدمة جديدة' : 'Add New Service Catalog Item'}
            </h2>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'الرمز (Code)' : 'Code'}</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'التصنيف' : 'Category'}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="SEA">{isAr ? 'شحن بحري (SEA)' : 'Sea Freight'}</option>
                    <option value="AIR">{isAr ? 'شحن جوي (AIR)' : 'Air Freight'}</option>
                    <option value="LAND">{isAr ? 'شحن بري (LAND)' : 'Land Freight'}</option>
                    <option value="CUSTOMS">{isAr ? 'تخليص جمركي (CUSTOMS)' : 'Customs Clearance'}</option>
                    <option value="WAREHOUSE">{isAr ? 'تخزين (WAREHOUSE)' : 'Warehousing'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'الاسم بالعربية' : 'Arabic Title'}</label>
                <input
                  type="text"
                  required
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'الاسم بالإنجليزية' : 'English Title'}</label>
                <input
                  type="text"
                  required
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'مدة التسليم SLA' : 'SLA'}</label>
                  <input
                    type="text"
                    required
                    value={formData.sla}
                    onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'السعر التقديري (SAR)' : 'Base Rate (SAR)'}</label>
                  <input
                    type="number"
                    required
                    value={formData.baseRateSAR}
                    onChange={(e) => setFormData({ ...formData, baseRateSAR: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{isAr ? 'الوصف بالعربية' : 'Arabic Description'}</label>
                <textarea
                  rows={2}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="border-slate-700 text-slate-300">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-amber-400 text-slate-950 font-bold">
                  {isAr ? 'حفظ الخدمة' : 'Save Service'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
