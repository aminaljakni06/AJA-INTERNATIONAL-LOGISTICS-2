import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Send
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Shipment, ShipmentStatus } from '../../types/shipment';
import { QuoteRequest } from '../../types/quote';
import { jsPDF } from 'jspdf';

// Dashboard Sub-components
import { ExecutiveWelcome } from '../../components/admin/dashboard/ExecutiveWelcome';
import { BusinessOverviewGrid } from '../../components/admin/dashboard/BusinessOverviewGrid';
import { OperationsCenterWidget } from '../../components/admin/dashboard/OperationsCenterWidget';
import { LiveShipmentStatusWidget } from '../../components/admin/dashboard/LiveShipmentStatusWidget';
import { FinancialOverviewWidget } from '../../components/admin/dashboard/FinancialOverviewWidget';
import { WarehouseOverviewWidget } from '../../components/admin/dashboard/WarehouseOverviewWidget';
import { FleetOverviewWidget } from '../../components/admin/dashboard/FleetOverviewWidget';
import { CustomerOverviewWidget } from '../../components/admin/dashboard/CustomerOverviewWidget';
import { RecentActivityTimeline } from '../../components/admin/dashboard/RecentActivityTimeline';
import { AlertsCenterWidget } from '../../components/admin/dashboard/AlertsCenterWidget';
import { CalendarTasksWidget } from '../../components/admin/dashboard/CalendarTasksWidget';
import { QuickActionsHub } from '../../components/admin/dashboard/QuickActionsHub';
import { DashboardChartsGrid } from '../../components/admin/dashboard/DashboardChartsGrid';

export const AdminDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals for editing/updating
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [updateLocationText, setUpdateLocationText] = useState('');
  const [updateStatusText, setUpdateStatusText] = useState<ShipmentStatus>('IN_TRANSIT');
  const [updateLoading, setUpdateLoading] = useState(false);

  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [offerPriceText, setOfferPriceText] = useState('15000');
  const [quoteUpdateLoading, setQuoteUpdateLoading] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [shipmentsData, quotesData, messagesData, auditData] = await Promise.all([
        fetch('/api/shipments', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch('/api/quotes', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => []),
        fetch('/api/audit-logs', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => []),
      ]);

      setShipments(Array.isArray(shipmentsData) ? shipmentsData : []);
      setQuotes(Array.isArray(quotesData) ? quotesData : []);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setAuditLogs(Array.isArray(auditData) ? auditData : []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Handle Shipment Status & Location Update
  const handleSaveShipmentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !token) return;

    setUpdateLoading(true);
    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentLocation: updateLocationText,
          status: updateStatusText
        })
      });

      if (res.ok) {
        setSelectedShipment(null);
        fetchData();
      } else {
        alert(isAr ? 'حدث خطأ أثناء تحديث حالة الشحنة' : 'Failed to update shipment status');
      }
    } catch (err) {
      console.error('Update shipment error:', err);
      alert(isAr ? 'فشل التوصيل بالسيرفر' : 'Network error updating shipment');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle Quote Price Offer Submission
  const handleSendQuoteOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote || !token) return;

    setQuoteUpdateLoading(true);
    try {
      const res = await fetch(`/api/quotes/${selectedQuote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          offeredPriceSAR: Number(offerPriceText),
          status: 'OFFER_SENT'
        })
      });

      if (res.ok) {
        setSelectedQuote(null);
        fetchData();
      } else {
        alert(isAr ? 'حدث خطأ أثناء إرسال عرض السعر' : 'Failed to send quote offer');
      }
    } catch (err) {
      console.error('Quote offer error:', err);
      alert(isAr ? 'فشل التوصيل بالسيرفر' : 'Network error submitting quote offer');
    } finally {
      setQuoteUpdateLoading(false);
    }
  };

  // Handle Export Executive PDF Operations Report
  const handleExportOperationsReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('AJA INTERNATIONAL LOGISTICS', 14, 20);
    doc.setFontSize(12);
    doc.text('Executive Operations & Telematics Overview Report', 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);
    doc.text(`Administrator: ${user?.fullName || user?.email || 'Executive Admin'}`, 14, 40);

    doc.setFontSize(10);
    doc.text(`Total Active Waybills: ${shipments.length}`, 14, 52);
    doc.text(`In-Transit Shipments: ${shipments.filter(s => s.status === 'IN_TRANSIT').length}`, 14, 58);
    doc.text(`Delivered PODs: ${shipments.filter(s => s.status === 'DELIVERED').length}`, 14, 64);
    doc.text(`New Quote Requests: ${quotes.length}`, 14, 70);

    doc.text('System Status: ALL SYSTEMS OPERATIONAL (ZATCA, Port Customs API, Fleet GPS)', 14, 82);

    doc.save(`AJA_Executive_Operations_Report_${Date.now()}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
          {isAr ? 'جاري تحميل لوحة التحكم القيادية...' : 'Loading Executive Command Center...'}
        </p>
      </div>
    );
  }

  const activeShipmentsCount = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'CUSTOMS_CLEARANCE').length;
  const deliveredShipmentsCount = shipments.filter(s => s.status === 'DELIVERED').length;
  const newQuotesCount = quotes.filter(q => q.status === 'NEW' || q.status === 'UNDER_REVIEW').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* 1. Executive Welcome Header */}
      <ExecutiveWelcome
        userName={user?.fullName || user?.email || 'Executive Admin'}
        userRole={user?.role || 'SYSTEM_ADMIN'}
        isAr={isAr}
        newQuotesCount={newQuotesCount}
        activeShipmentsCount={activeShipmentsCount}
        onNavigate={onNavigate}
        onExportReport={handleExportOperationsReport}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* 2. Business Overview Grid */}
      <BusinessOverviewGrid
        isAr={isAr}
        totalShipmentsCount={shipments.length}
        activeShipmentsCount={activeShipmentsCount}
        deliveredShipmentsCount={deliveredShipmentsCount}
        newQuotesCount={newQuotesCount}
        onNavigate={onNavigate}
      />

      {/* 3. Operations Center Widget */}
      <OperationsCenterWidget
        isAr={isAr}
        onNavigate={onNavigate}
      />

      {/* 4. Live Shipment Status & Route Control */}
      <LiveShipmentStatusWidget
        isAr={isAr}
        shipments={shipments}
        onSelectShipmentToUpdate={(s) => {
          setSelectedShipment(s);
          setUpdateLocationText(s.currentLocation || '');
          setUpdateStatusText(s.status || 'IN_TRANSIT');
        }}
        onNavigate={onNavigate}
      />

      {/* 5. Financial Overview & Analytics */}
      <FinancialOverviewWidget
        isAr={isAr}
        onNavigate={onNavigate}
      />

      {/* 6. Dashboard Charts Grid */}
      <DashboardChartsGrid
        isAr={isAr}
        onNavigate={onNavigate}
      />

      {/* 7 & 8. Warehouse & Fleet Overview (Responsive 2-column) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WarehouseOverviewWidget
          isAr={isAr}
          onNavigate={onNavigate}
        />
        <FleetOverviewWidget
          isAr={isAr}
          onNavigate={onNavigate}
        />
      </div>

      {/* 9 & 10. Customer 360 & Activity Timeline (Responsive 2-column) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerOverviewWidget
          isAr={isAr}
          onNavigate={onNavigate}
        />
        <RecentActivityTimeline
          isAr={isAr}
          auditLogs={auditLogs}
          onNavigate={onNavigate}
        />
      </div>

      {/* 11 & 12. Alerts Center & Calendar/Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsCenterWidget
          isAr={isAr}
          onNavigate={onNavigate}
        />
        <CalendarTasksWidget
          isAr={isAr}
          onNavigate={onNavigate}
        />
      </div>

      {/* 13. Quick Action Command Hub */}
      <QuickActionsHub
        isAr={isAr}
        onNavigate={onNavigate}
      />

      {/* MODAL 1: Update Shipment Status & Location */}
      {selectedShipment && (
        <Modal
          isOpen={!!selectedShipment}
          onClose={() => setSelectedShipment(null)}
          title={`${isAr ? 'تحديث موقع وحالة الشحنة:' : 'Update Shipment Status & Location:'} ${selectedShipment.trackingNumber}`}
        >
          <form onSubmit={handleSaveShipmentUpdate} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isAr ? 'الموقع الحالي (المدينة / الميناء / البحر) *' : 'Current Location *'}
              </label>
              <input
                type="text"
                value={updateLocationText}
                onChange={(e) => setUpdateLocationText(e.target.value)}
                placeholder="ميناء الجبيل التجاري - المحطة 2"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#030712] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isAr ? 'حالة الشحن والتخليص *' : 'Shipment Status *'}
              </label>
              <select
                value={updateStatusText}
                onChange={(e) => setUpdateStatusText(e.target.value as ShipmentStatus)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#030712] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
              >
                <option value="BOOKING_CONFIRMED">{isAr ? 'تأكيد الحجز (Booking Confirmed)' : 'Booking Confirmed'}</option>
                <option value="CARGO_PICKED_UP">{isAr ? 'تم استلام البضاعة (Cargo Picked Up)' : 'Cargo Picked Up'}</option>
                <option value="DEPARTURE_CUSTOMS">{isAr ? 'التخليص بميناء المغادرة' : 'Departure Customs'}</option>
                <option value="IN_TRANSIT">{isAr ? 'في الطريق / عبور البحر أو الجو (In Transit)' : 'In Transit'}</option>
                <option value="CUSTOMS_CLEARANCE">{isAr ? 'التخليص بميناء الوصول' : 'Destination Customs'}</option>
                <option value="OUT_FOR_DELIVERY">{isAr ? 'خرج للتسليم الشاحنات' : 'Out For Delivery'}</option>
                <option value="DELIVERED">{isAr ? 'تم التسليم بنجاح (Delivered)' : 'Delivered'}</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedShipment(null)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" className="flex-1 font-bold" isLoading={updateLoading}>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'حفظ التحديث' : 'Save Changes'}</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Quote Price Offer */}
      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title={`${isAr ? 'تسعير وإصدار عرض سعر للطلب:' : 'Price Freight Request:'} #${selectedQuote.requestNumber || selectedQuote.id}`}
        >
          <form onSubmit={handleSendQuoteOffer} className="space-y-4 pt-2">
            <div className="p-3 bg-slate-100 dark:bg-[#030712] rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">العميل: {selectedQuote.customerName} ({selectedQuote.customerPhone})</p>
              <p className="text-slate-500">المسار: {selectedQuote.pickupLocation} ← {selectedQuote.deliveryLocation}</p>
              <p className="text-slate-500">البضاعة: {selectedQuote.cargoType}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isAr ? 'السعر المقترح للتكلفة الإجمالية (بالريال السعودي SAR) *' : 'Offered Freight Price (SAR) *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={offerPriceText}
                  onChange={(e) => setOfferPriceText(e.target.value)}
                  placeholder="15000"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#030712] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00F0FF] pe-16"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">SAR</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedQuote(null)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" className="flex-1 font-bold" isLoading={quoteUpdateLoading}>
                <Send className="w-4 h-4" />
                <span>{isAr ? 'إرسال العرض للعميل' : 'Send Offer'}</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
