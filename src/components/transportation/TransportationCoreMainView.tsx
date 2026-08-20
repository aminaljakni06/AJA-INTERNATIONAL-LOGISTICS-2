import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Compass,
  Layers,
  Sparkles,
  Zap,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  User,
  Box,
  Navigation,
  Gauge,
  DollarSign,
  ArrowRight,
  Flame,
  Activity,
  Star,
  Leaf,
  Anchor,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  TransportationOrder,
  TransportationKpis,
  TransportOrderStatus,
  TransportMode,
  AITransportOptimizationResponse,
  DockScheduleSlot,
  CarrierPerformanceProfile,
  CarbonEmissionMetrics,
  ShipmentConsolidationPlan
} from '../../types/transportation';
import { TransportationClient } from '../../services/transportationClient';

const INITIAL_TMS_KPIS: TransportationKpis = {
  onTimePickupRate: 0,
  onTimeDeliveryRate: 0,
  avgTransitTimeHours: 0,
  fleetCapacityUtilization: 0,
  totalDistanceKm: 0,
  totalFreightCostSAR: 0,
  avgCostPerShipmentSAR: 0,
};

export const TransportationCoreMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'orders' | 'dispatch' | 'docks' | 'load-planner' | 'route-planner' | 'carriers' | 'carbon' | 'kpis' | 'ai-tms'>('orders');
  const [orders, setOrders] = useState<TransportationOrder[]>([]);
  const [docks, setDocks] = useState<DockScheduleSlot[]>([]);
  const [carriers, setCarriers] = useState<CarrierPerformanceProfile[]>([]);
  const [carbonMetrics, setCarbonMetrics] = useState<CarbonEmissionMetrics | null>(null);
  const [consolidationPlans, setConsolidationPlans] = useState<ShipmentConsolidationPlan[]>([]);
  const [kpis, setKpis] = useState<TransportationKpis>(INITIAL_TMS_KPIS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<TransportationOrder | null>(null);

  // New Transportation Order Modal State
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newMode, setNewMode] = useState<TransportMode>('ROAD_FREIGHT');
  const [newWeight, setNewWeight] = useState<number>(15000);
  const [newVolume, setNewVolume] = useState<number>(50);
  const [newPallets, setNewPallets] = useState<number>(20);
  const [isReefer, setIsReefer] = useState(true);

  // Dispatch Assignment Modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchDriver, setDispatchDriver] = useState('');
  const [dispatchVehicle, setDispatchVehicle] = useState('');

  // AI Optimization State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AITransportOptimizationResponse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderData, dockData, carrierData, carbonData, consolData] = await Promise.all([
        TransportationClient.getOrders(),
        TransportationClient.getDockScheduleSlots(),
        TransportationClient.getCarrierPerformanceProfiles(),
        TransportationClient.getCarbonAnalytics(),
        TransportationClient.getConsolidationPlans(),
      ]);
      setOrders(orderData.orders);
      setKpis(orderData.kpis);
      setDocks(dockData);
      setCarriers(carrierData);
      setCarbonMetrics(carbonData);
      setConsolidationPlans(consolData);
      if (orderData.orders.length > 0) {
        setSelectedOrder(orderData.orders[0]);
      }
    } catch (err) {
      console.error('Error loading TMS orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newOrigin || !newDestination) return;

    try {
      const created = await TransportationClient.createOrder({
        transportOrderNumber: `AJA-TO-${Math.floor(9000 + Math.random() * 1000)}`,
        customerId: `CUST-${Date.now()}`,
        customerName: newCustomerName,
        transportMode: newMode,
        originName: newOrigin,
        destinationName: newDestination,
        pickupWindowStart: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        pickupWindowEnd: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        deliveryWindowStart: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
        deliveryWindowEnd: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
        estimatedEta: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH',
        status: 'PLANNED',
        carrierName: 'أسطول أجا للخدمات اللوجستية',
        distanceKm: 380,
        loadDetails: {
          weightKg: newWeight,
          volumeCbm: newVolume,
          palletCount: newPallets,
          containerType: isReefer ? '40FT_REEFER' : '40FT_DRY',
          containerUtilizationPercentage: Math.min(100, Math.round((newWeight / 20000) * 100)),
          isDangerousGoods: false,
          temperatureControlled: isReefer,
          targetTempRange: isReefer ? '+2°C إلى +8°C' : undefined,
        },
        waypoints: [
          { id: 'WP-1', locationName: 'نقطة الانطلاق العادية', latitude: 24.7, longitude: 46.7, sequenceOrder: 1, estimatedArrival: new Date().toISOString() }
        ],
        documents: [],
        trackingEvents: [
          { id: 'TRK-1', timestamp: new Date().toISOString(), status: 'PLANNED', locationName: newOrigin, notes: 'تم تخطيط أمر النقل وإدخال الحمولات بنجاح', updatedBy: 'مخطط النقل' }
        ],
        costAmount: 3500,
        revenueAmount: 5500,
        currency: 'SAR',
      });

      setOrders([created, ...orders]);
      setSelectedOrder(created);
      setShowNewOrderModal(false);
      setNewCustomerName('');
      setNewOrigin('');
      setNewDestination('');
    } catch (err) {
      console.error('Error creating TMS order:', err);
    }
  };

  const handleUpdateStatus = async (status: TransportOrderStatus) => {
    if (!selectedOrder) return;
    try {
      const updated = await TransportationClient.updateOrderStatus(selectedOrder.id, status, `تم تحديث الحالة إلى ${status}`);
      if (updated) {
        setSelectedOrder(updated);
        setOrders(orders.map(o => o.id === updated.id ? updated : o));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAssignDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !dispatchDriver || !dispatchVehicle) return;

    try {
      const updated = await TransportationClient.assignDriverAndVehicle(selectedOrder.id, dispatchDriver, dispatchVehicle);
      if (updated) {
        setSelectedOrder(updated);
        setOrders(orders.map(o => o.id === updated.id ? updated : o));
        setShowDispatchModal(false);
        setDispatchDriver('');
        setDispatchVehicle('');
      }
    } catch (err) {
      console.error('Error assigning dispatch:', err);
    }
  };

  const runAiOptimization = async () => {
    if (!selectedOrder) return;
    setAiAnalyzing(true);
    setAiResult(null);

    try {
      const result = await TransportationClient.optimizeRoute({
        origin: selectedOrder.originName,
        destination: selectedOrder.destinationName,
        weightKg: selectedOrder.loadDetails.weightKg,
        volumeCbm: selectedOrder.loadDetails.volumeCbm,
        transportMode: selectedOrder.transportMode,
        temperatureControlled: selectedOrder.loadDetails.temperatureControlled,
      });
      setAiResult(result);
    } catch (err) {
      console.error('AI TMS optimization error:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.transportOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.originName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.destinationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAr ? 'منصة إدارة النقل الشاملة والأسطول (Enterprise TMS Platform)' : 'Enterprise Transportation Management Platform'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isAr
                ? 'تخطيط أوامر النقل، المندوبين، أساليب الشحن المبرّد والمتعدد، تتبع المسارات وGPS، واستغلال السعات الذكي'
                : 'Centralized Transport Orders, Dispatch, Fleet Capacity, GPS Route Milestones, and AI Optimization'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('ai-tms');
              runAiOptimization();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-medium text-sm transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {isAr ? 'مستشار النقل الذكي' : 'AI Route Optimizer'}
          </button>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'أمر نقل جديد' : 'New Transport Order'}
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-1">
        {[
          { id: 'orders', label: isAr ? 'أوامر النقل والرحلات' : 'Transport Orders Workspace', icon: Truck },
          { id: 'dispatch', label: isAr ? 'لوحة الترحيل والسائقين' : 'Dispatch & Fleet Board', icon: User },
          { id: 'docks', label: isAr ? 'جدولة أرصفة الشحن Docks' : 'Dock Scheduling', icon: Anchor },
          { id: 'load-planner', label: isAr ? 'مخطط الأحمال والتجميع' : 'Load & Consolidation Planner', icon: Box },
          { id: 'route-planner', label: isAr ? 'تتبع المسارات وGPS' : 'Route & GPS Milestones', icon: Navigation },
          { id: 'carriers', label: isAr ? 'بطاقة تقييم الناقلين' : 'Carrier Scorecard', icon: Award },
          { id: 'carbon', label: isAr ? 'استدامة الأسطول Carbon Analytics' : 'Green Fleet & Carbon', icon: Leaf },
          { id: 'kpis', label: isAr ? 'مؤشرات أداء النقل KPIs' : 'Transportation Analytics', icon: Gauge },
          { id: 'ai-tms', label: isAr ? 'المحسن الذكي للمسارات' : 'AI Transportation Engine', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TAB 1: TRANSPORT ORDERS WORKSPACE */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: List & Filters */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 flex-1 w-full">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={isAr ? 'بحث برقم الأمر، العميل، الوجهة...' : 'Search orders...'}
                      className="w-full bg-transparent border-none text-sm focus:outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 font-medium"
                  >
                    <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
                    <option value="PLANNED">PLANNED</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                    <option value="IN_TRANSIT">IN_TRANSIT</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredOrders.map((o) => {
                    const isSelected = selectedOrder?.id === o.id;
                    return (
                      <div
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm'
                            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            {o.transportOrderNumber}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {o.status}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm mt-2">{o.customerName}</h3>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            {isAr ? 'من:' : 'From:'} {o.originName}
                          </p>
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            {isAr ? 'إلى:' : 'To:'} {o.destinationName}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-500">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{o.transportMode}</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400">{o.distanceKm} كم</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Order Detail & Actions */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
                {selectedOrder ? (
                  <>
                    <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            {selectedOrder.transportOrderNumber}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                            {selectedOrder.status}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold mt-2">{selectedOrder.customerName}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {isAr ? 'وسيلة النقل:' : 'Transport Mode:'} {selectedOrder.transportMode} | {selectedOrder.distanceKm} كم
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowDispatchModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <User className="w-3.5 h-3.5" />
                          {isAr ? 'إسناد السائق والوسيلة' : 'Dispatch'}
                        </button>
                      </div>
                    </div>

                    {/* Status Progress Bar */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-3 border border-gray-200 dark:border-gray-800">
                      <span className="text-xs font-bold block">{isAr ? 'تحديث مرحلة أمر النقل بسرعة:' : 'Quick Status Action:'}</span>
                      <div className="flex flex-wrap gap-2">
                        {['READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(st as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              selectedOrder.status === st
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Load & Vehicle Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-400 block">{isAr ? 'الوزن والحجم' : 'Weight & Volume'}</span>
                        <span className="font-bold text-sm mt-0.5 block">{selectedOrder.loadDetails.weightKg} كجم / {selectedOrder.loadDetails.volumeCbm} CBM</span>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-400 block">{isAr ? 'السائق المكلّف' : 'Assigned Driver'}</span>
                        <span className="font-bold text-sm mt-0.5 block text-blue-600 dark:text-blue-400">
                          {selectedOrder.assignedDriverName || (isAr ? 'غير معيّن' : 'Unassigned')}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-400 block">{isAr ? 'رقم اللوحة / الشاحنة' : 'Vehicle Plate'}</span>
                        <span className="font-bold text-sm mt-0.5 block">
                          {selectedOrder.assignedVehiclePlate || (isAr ? 'غير معينة' : 'Unassigned')}
                        </span>
                      </div>
                    </div>

                    {/* Tracking Events Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        {isAr ? 'سجل التتبع والمحطات التشغيلية' : 'Tracking Milestones History'}
                      </h4>

                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                        {selectedOrder.trackingEvents.map((evt) => (
                          <div key={evt.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-blue-600 dark:text-blue-400">{evt.status} - {evt.locationName}</span>
                              <span className="text-[10px] text-gray-400">{new Date(evt.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{evt.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    {isAr ? 'اختر أمر نقل لعرض التفاصيل' : 'Select a transport order'}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: DISPATCH BOARD */}
          {activeTab === 'dispatch' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {isAr ? 'جدول التوزيع اليومي للرحلات والسائقين' : 'Daily Dispatch & Fleet Scheduling'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {orders.map((o) => (
                    <div key={o.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600">{o.transportOrderNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
                          {o.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm">{o.customerName}</h4>
                      <p className="text-gray-500">{o.originName} ➔ {o.destinationName}</p>

                      <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-gray-700 dark:text-gray-300 font-medium">
                        <span>السائق: {o.assignedDriverName || 'غير مسند'}</span>
                        <span>المركبة: {o.assignedVehiclePlate || 'غير مسندة'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: DOCK SCHEDULING */}
          {activeTab === 'docks' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Anchor className="w-5 h-5 text-indigo-600" />
                    {isAr ? 'جدولة ومواعيد أرصفة التحميل والتفريغ (Dock Slots Management)' : 'Dock Scheduling & Slot Reservation'}
                  </h3>
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 rounded-full">
                    {docks.length} {isAr ? 'أرصفة نشطة' : 'Active Docks'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {docks.map((dock) => (
                    <div key={dock.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-3">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-blue-600 dark:text-blue-400">{dock.dockNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dock.dockStatus === 'LOADING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                          dock.dockStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {dock.dockStatus}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">{dock.facilityLocation}</p>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-800 text-gray-500 space-y-1">
                        <p>أمر النقل: <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{dock.orderRef}</span></p>
                        <p>الشاحنة: <span className="font-bold text-gray-800 dark:text-gray-200">{dock.assignedVehiclePlate}</span></p>
                        <p>المدة التقديرية: <span className="text-indigo-600 font-bold">{dock.estimatedDurationMinutes} دقيقة</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: LOAD PLANNER */}
          {activeTab === 'load-planner' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6"
            >
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Box className="w-5 h-5 text-emerald-600" />
                {isAr ? 'استغلال سعة الشاحنات والحاويات (Load Matrix)' : 'Container Utilization & Load Matrix'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((o) => {
                  const util = o.loadDetails.containerUtilizationPercentage;
                  return (
                    <div key={o.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-xs space-y-3">
                      <div className="flex items-center justify-between font-bold">
                        <span>{o.transportOrderNumber} - {o.loadDetails.containerType || '40FT Container'}</span>
                        <span className="text-emerald-600 font-extrabold">{util}% ممتلئة</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            util > 90 ? 'bg-emerald-500' : util > 70 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${util}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-gray-500">
                        <span>الوزن: {o.loadDetails.weightKg} كجم</span>
                        <span>الحجم: {o.loadDetails.volumeCbm} CBM</span>
                        <span>عدد الطبليات: {o.loadDetails.palletCount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Consolidation Plans Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  {isAr ? 'خطط التجميع المقترحة للرحلات (Load Consolidation Plans)' : 'Consolidation Plans'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {consolidationPlans.map((plan) => (
                    <div key={plan.id} className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-blue-700 dark:text-blue-300">{plan.planNumber}</span>
                        <span className="text-emerald-600">توفير {plan.estimatedCostSavingsSAR} ر.س</span>
                      </div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{plan.routeRegion}</p>
                      <div className="flex items-center justify-between text-gray-500 pt-1">
                        <span>الوزن الكلي: {plan.totalWeightKg} كجم</span>
                        <span>الحجم: {plan.totalVolumeCbm} CBM</span>
                        <span className="font-bold text-blue-600">نسبة الاستغلال: {plan.utilizationPercentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: ROUTE PLANNER */}
          {activeTab === 'route-planner' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6"
            >
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Navigation className="w-5 h-5 text-indigo-600" />
                {isAr ? 'مخطط الطرق والمسارات والمحطات الميدانية' : 'Route & Waypoint Planner'}
              </h3>

              {selectedOrder ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-xl space-y-1">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 block">
                      مسار الشحنة: {selectedOrder.transportOrderNumber} ({selectedOrder.distanceKm} كم)
                    </span>
                    <p className="text-gray-600 dark:text-gray-300">
                      الانطلاق: {selectedOrder.originName} ➔ الوصول: {selectedOrder.destinationName}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold block">المحطات والنقاط التفتيشية المحددة:</span>
                    {selectedOrder.waypoints.map((wp) => (
                      <div key={wp.id} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          #{wp.sequenceOrder} - {wp.locationName}
                        </span>
                        <span className="text-gray-500 font-mono">
                          الوصول المتوقع: {new Date(wp.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">يرجى تحديد أمر نقل أولاً</div>
              )}
            </motion.div>
          )}

          {/* TAB: CARRIERS SCORECARD */}
          {activeTab === 'carriers' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    {isAr ? 'تقييم أداء الشركاء والناقلين (Carrier Scorecard & SLA Ranking)' : 'Carrier Performance Scorecard & SLA Ranking'}
                  </h3>
                  <span className="text-xs bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-bold px-3 py-1 rounded-full">
                    {carriers.length} {isAr ? 'ناقلين معتمدين' : 'Approved Carriers'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {carriers.map((car) => (
                    <div key={car.id} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{car.carrierName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {car.preferredStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{car.ratingStars} / 5.0</span>
                        <span className="text-gray-400 font-normal">({car.totalCompletedShipments} رحلة أكملت)</span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center justify-between">
                          <span>نسبة الالتزام بالوقت SLA:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{car.slaOnTimeRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>تكلفة الكيلومتر:</span>
                          <span className="font-bold">{car.costPerKmSAR} ر.س / كم</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>الأسطول النشط:</span>
                          <span className="font-bold">{car.activeVehiclesCount} شاحنة</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-600 font-bold">
                          <span>مؤشر الاستدامة الخضراء:</span>
                          <span>{car.greenScore} / 100</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: CARBON & SUSTAINABILITY ANALYTICS */}
          {activeTab === 'carbon' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                    {isAr ? 'لوحة تحليلات الانبعاثات الكربونية والأسطول الأخضر (Sustainability Analytics)' : 'Green Fleet & Carbon Footprint Analytics'}
                  </h3>
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full">
                    {isAr ? 'مُطابق لمعايير رؤية 2030 الخضراء' : 'ESG & Green Fleet Compliant'}
                  </span>
                </div>

                {carbonMetrics && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-1">
                      <span className="text-gray-500 font-medium">إجمالي الانبعاثات الحالية</span>
                      <span className="text-2xl font-extrabold block text-emerald-800 dark:text-emerald-300">
                        {carbonMetrics.totalCo2Tons} طن CO₂
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        تم توفير {carbonMetrics.co2SavedTonsThisMonth} طن هذا الشهر
                      </span>
                    </div>

                    <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-2xl space-y-1">
                      <span className="text-gray-500 font-medium">كفاءة استهلاك الوقود</span>
                      <span className="text-2xl font-extrabold block text-blue-800 dark:text-blue-300">
                        {carbonMetrics.fuelEfficiencyKmPerLiter} كم / لتر
                      </span>
                      <span className="text-[10px] text-blue-600 font-bold">
                        نسبة الشاحنات الكهربائية/المستدامة: {carbonMetrics.electricVehicleSharePercentage}%
                      </span>
                    </div>

                    <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl space-y-1">
                      <span className="text-gray-500 font-medium">مؤشر أداء الأسطول الأخضر</span>
                      <span className="text-2xl font-extrabold block text-indigo-800 dark:text-indigo-300">
                        {carbonMetrics.fleetGreenScore} / 100
                      </span>
                      <span className="text-[10px] text-indigo-600 font-bold">
                        متوسط CO₂ لكل كيلومتر: {carbonMetrics.avgCo2PerKmKg} كجم
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: TRANSPORTATION KPIS */}
          {activeTab === 'kpis' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: isAr ? 'نسبة الاستلام في الموعد (On-Time Pickup)' : 'On-Time Pickup', value: `${kpis.onTimePickupRate}%`, icon: Clock },
                  { title: isAr ? 'نسبة التسليم في الموعد (On-Time Delivery)' : 'On-Time Delivery', value: `${kpis.onTimeDeliveryRate}%`, icon: CheckCircle2 },
                  { title: isAr ? 'استغلال سعة الأسطول الكلية' : 'Fleet Utilization', value: `${kpis.fleetCapacityUtilization}%`, icon: Box },
                  { title: isAr ? 'متوسط زمن الرحلة (Transit Time)' : 'Avg Transit Time', value: `${kpis.avgTransitTimeHours} ساعة`, icon: Navigation },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">{item.title}</span>
                        <span className="text-xl font-bold mt-0.5 block">{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 6: AI TRANSPORTATION PANEL */}
          {activeTab === 'ai-tms' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2 text-blue-600">
                  <Sparkles className="w-5 h-5" />
                  {isAr ? 'محرك تحسين الطرق والمخاطر الذكي' : 'AI Route & Capacity Optimizer'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isAr
                    ? 'تحليل حمولة أمر النقل الحالي واقتراح المسار الأمثل ووسيلة الشحن وتقليل مخاطر التأخير'
                    : 'Analyze order load & route using Gemini model.'}
                </p>

                <button
                  onClick={runAiOptimization}
                  disabled={aiAnalyzing || !selectedOrder}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {aiAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري التحليل...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>تشغيل تحسين المسار لأمر النقل الحالي</span>
                    </>
                  )}
                </button>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
                {aiResult ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl space-y-2">
                      <span className="font-bold text-blue-900 dark:text-blue-300 block">
                        المسار المقترح من الذكاء الاصطناعي:
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">{aiResult.recommendedRoute}</p>
                      <div className="flex items-center gap-4 text-gray-500 pt-1">
                        <span>المسافة: {aiResult.distanceKm} كم</span>
                        <span>الزمن التقديري: {aiResult.estimatedTransitTimeHours} ساعة</span>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-2">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                        استغلال السعة والوسيلة الموصى بها:
                      </span>
                      <p className="text-gray-700 dark:text-gray-300">{aiResult.recommendedVehicleType} (سعة {aiResult.containerUtilizationPercentage}%)</p>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-2">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block">
                        تقييم مخاطر التأخير والتوفير:
                      </span>
                      <p className="text-gray-700 dark:text-gray-300">{aiResult.delayRiskFactor}</p>
                      <p className="text-emerald-600 font-medium mt-1">{aiResult.fuelOptimizationSuggestion}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400 text-xs">
                    اضغط على تشغيل تحسين المسار لتوليد نتائج التحليل
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* NEW ORDER MODAL */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg">{isAr ? 'إنشاء أمر نقل جديد' : 'New Transport Order'}</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">{isAr ? 'اسم العميل' : 'Customer Name'}</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder={isAr ? 'شركة المراعي / شركة السيف' : 'Customer name'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">{isAr ? 'نقطة الانطلاق (Origin)' : 'Origin'}</label>
                  <input
                    type="text"
                    required
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    placeholder={isAr ? 'ميناء الدمام' : 'Origin'}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{isAr ? 'الوجهة (Destination)' : 'Destination'}</label>
                  <input
                    type="text"
                    required
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder={isAr ? 'الرياض الجاف' : 'Destination'}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">{isAr ? 'الوزن (كجم)' : 'Weight (kg)'}</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{isAr ? 'الحجم (CBM)' : 'Volume (CBM)'}</label>
                  <input
                    type="number"
                    value={newVolume}
                    onChange={(e) => setNewVolume(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{isAr ? 'الطبليات' : 'Pallets'}</label>
                  <input
                    type="number"
                    value={newPallets}
                    onChange={(e) => setNewPallets(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reeferCheck"
                  checked={isReefer}
                  onChange={(e) => setIsReefer(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="reeferCheck" className="font-semibold cursor-pointer">
                  {isAr ? 'حاوية مبردة / تبريد مقتضى (+2°C إلى +8°C)' : 'Refrigerated Transport Required'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
                >
                  {isAr ? 'إنشاء أمر النقل' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH MODAL */}
      {showDispatchModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg">{isAr ? 'إسناد السائق والوسيلة لأمر النقل' : 'Assign Driver & Vehicle'}</h3>
            <p className="text-xs text-gray-500">{selectedOrder.transportOrderNumber} - {selectedOrder.customerName}</p>

            <form onSubmit={handleAssignDispatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">{isAr ? 'اسم السائق الكابتن' : 'Driver Name'}</label>
                <input
                  type="text"
                  required
                  value={dispatchDriver}
                  onChange={(e) => setDispatchDriver(e.target.value)}
                  placeholder={isAr ? 'الكابتن / سعد القحطاني' : 'Driver name'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{isAr ? 'رقم اللوحة ووصف الشاحنة' : 'Vehicle Plate & Type'}</label>
                <input
                  type="text"
                  required
                  value={dispatchVehicle}
                  onChange={(e) => setDispatchVehicle(e.target.value)}
                  placeholder={isAr ? 'أ ج ا - 5582 (تريلا مبردة 40 قدم)' : 'Vehicle plate'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  {isAr ? 'تأكيد الإسناد والترحيل' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
