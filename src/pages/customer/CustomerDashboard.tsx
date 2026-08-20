import React, { useState, useEffect } from 'react';
import { 
  Package, 
  FileText, 
  Plus, 
  Clock, 
  ArrowLeft, 
  AlertCircle, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  MessageSquare, 
  Zap, 
  Calculator,
  Search,
  Download,
  Eye,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Calendar,
  Truck,
  Ship,
  Plane,
  X,
  FileCheck,
  Building2,
  PhoneCall,
  ChevronRight,
  Filter,
  RefreshCw,
  Scale
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { UnitConversionCalculator } from '../../components/customer/UnitConversionCalculator';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Shipment } from '../../types/shipment';
import { QuoteRequest } from '../../types/quote';
import { jsPDF } from 'jspdf';

interface CustomerDashboardProps {
  onNavigate: (tab: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'CUSTOMS' | 'DELIVERED'>('ALL');

  // Modal states
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [quoteAcceptSuccess, setQuoteAcceptSuccess] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [shipmentsData, quotesData] = await Promise.all([
        fetch('/api/shipments', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch('/api/quotes', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);
      setShipments(Array.isArray(shipmentsData) ? shipmentsData : []);
      setQuotes(Array.isArray(quotesData) ? quotesData : []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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

  // PDF Account Summary Export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(8, 47, 73); // #082F49
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('AJA INTERNATIONAL LOGISTICS', 15, 20);
    doc.setFontSize(10);
    doc.text('ACCOUNT SUMMARY REPORT & SHIPMENT STATEMENT', 15, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, 145, 28);

    // Customer info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text('CUSTOMER INFORMATION:', 15, 52);
    doc.setFontSize(10);
    doc.text(`Client Name: ${user?.fullName || 'Valued Client'}`, 15, 60);
    doc.text(`Company: ${user?.companyName || 'Corporate Client'}`, 15, 66);
    doc.text(`Email: ${user?.email || 'N/A'}`, 15, 72);

    // Summary Statistics
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 80, 180, 25, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 80, 180, 25, 'S');

    const activeCount = shipments.filter((s) => s.status !== 'DELIVERED').length;
    const deliveredCount = shipments.filter((s) => s.status === 'DELIVERED').length;
    const quotesCount = quotes.length;

    doc.setFontSize(10);
    doc.text(`Total Active Freight: ${activeCount}`, 25, 95);
    doc.text(`Delivered Cargo: ${deliveredCount}`, 85, 95);
    doc.text(`Total Quote Requests: ${quotesCount}`, 145, 95);

    // Active Shipments Table Header
    doc.setFontSize(12);
    doc.text('CURRENT RECENT SHIPMENTS:', 15, 120);

    let startY = 130;
    doc.setFillColor(15, 76, 117);
    doc.rect(15, startY, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Tracking #', 20, startY + 5.5);
    doc.text('Service', 60, startY + 5.5);
    doc.text('Origin -> Destination', 95, startY + 5.5);
    doc.text('Status', 160, startY + 5.5);

    startY += 12;
    doc.setTextColor(30, 41, 59);

    if (shipments.length === 0) {
      doc.text('No active shipments recorded.', 20, startY);
    } else {
      shipments.slice(0, 10).forEach((s) => {
        doc.text(s.trackingNumber || s.id, 20, startY);
        doc.text(s.serviceType || 'FREIGHT', 60, startY);
        doc.text(`${s.origin || 'KSA'} -> ${s.destination || 'Global'}`, 95, startY);
        doc.text(s.status || 'IN_TRANSIT', 160, startY);
        startY += 8;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('AJA International Logistics - Licensed Customs & Freight Operations Provider', 15, 285);
    
    doc.save(`AJA_Logistics_Summary_${user?.fullName || 'Client'}.pdf`);
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      setQuoteAcceptSuccess(true);
      fetchData();
      setTimeout(() => {
        setQuoteAcceptSuccess(false);
        setSelectedQuote(null);
      }, 1800);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner label={isAr ? "جاري تحميل بيانات البوابة اللوجستية..." : "Loading logistics portal..."} />;

  const activeShipments = shipments.filter((s) => s.status !== 'DELIVERED');
  const pendingQuotes = quotes.filter((q) => q.status === 'NEW' || q.status === 'UNDER_REVIEW');
  const completedShipments = shipments.filter((s) => s.status === 'DELIVERED');

  // Filtered Shipments for Table
  const filteredShipments = shipments.filter((s) => {
    const matchesSearch = 
      (s.trackingNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.origin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.destination || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.serviceType || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'ACTIVE') return s.status !== 'DELIVERED';
    if (activeFilter === 'CUSTOMS') return s.status === 'CUSTOMS_CLEARANCE';
    if (activeFilter === 'DELIVERED') return s.status === 'DELIVERED';
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#082F49] via-[#0F4C75] to-[#0B172A] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-[#00F0FF]/20">
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#0EA5E9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>{isAr ? 'حساب عميل تجاري معتمد' : 'Verified Business Client'}</span>
              </span>
              <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isAr ? `مرحباً بك، ${user?.fullName || 'عزيزي العميل'}` : `Welcome back, ${user?.fullName || 'Valued Client'}`}
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {user?.companyName
                ? (isAr ? `لوحة التحكم اللوجستية الخاصة بشركة (${user.companyName}) لمتابعة مسارات الشحن المباشرة والتخليص الجمركي.` : `Logistics management center for ${user.companyName}. Track live shipments & manage quotes.`)
                : (isAr ? 'مركز متابعة الشحنات المباشرة، طلبات عروض الأسعار التنافسية، والمستندات الجمركية.' : 'Central hub for live freight tracking, competitive quote requests, and customs documents.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => onNavigate('quote-request')}
              className="flex-1 sm:flex-initial gap-2 font-black text-xs bg-[#00F0FF] text-[#030712] hover:bg-[#38BDF8] shadow-[0_0_20px_rgba(0,240,255,0.3)] min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-[#030712]" />
              <span>{isAr ? 'طلب عرض سعر جديد' : 'New Quote Request'}</span>
            </Button>

            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
              title={isAr ? 'تحميل كشف حساب وشحنات PDF' : 'Download PDF Statement'}
            >
              <Download className="w-4 h-4 text-[#00F0FF]" />
              <span className="hidden sm:inline">{isAr ? 'تصدير كشف حساب PDF' : 'Export PDF'}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              title={isAr ? 'تحديث البيانات' : 'Refresh Data'}
            >
              <RefreshCw className={`w-4 h-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-[#0B172A] to-[#082F49] text-white p-5 rounded-2xl border border-[#00F0FF]/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center font-black shrink-0 shadow-md">
            <Bot className="w-7 h-7 text-[#00F0FF]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>{isAr ? 'مساعد أجا الذكي متوفر الآن للإجابة الفورية' : 'AJA Smart AI Assistant is ready to help'}</span>
              <Sparkles className="w-4 h-4 text-[#00F0FF] animate-pulse" />
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isAr
                ? 'استعلم فورياً عن متطلبات التخليص الجمركي، شهادات سابر، حساب أوزان الحاويات، ومسار شحنتك المباشر.'
                : 'Instant responses regarding customs clearance, SABER certificates, container volume math & tracking.'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => onNavigate('customer-ai')}
          className="bg-[#00F0FF] hover:bg-[#38BDF8] text-[#030712] font-black text-xs px-5 py-2.5 rounded-xl shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer self-stretch md:self-auto justify-center"
        >
          <span>{isAr ? 'تحدث مع المساعد الذكي AI' : 'Start AI Consultation'}</span>
          <ArrowLeft className="w-4 h-4 text-[#030712] rtl:rotate-0 rotate-180" />
        </Button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Shipments */}
        <div 
          onClick={() => setActiveFilter('ACTIVE')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            activeFilter === 'ACTIVE' 
              ? 'bg-[#0B172A] border-[#00F0FF] text-white shadow-lg ring-2 ring-[#00F0FF]/30' 
              : 'bg-white dark:bg-[#0B172A] border-slate-200 dark:border-white/10 hover:border-[#00F0FF]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'الشحنات قيد الشحن (Active)' : 'Active Freight'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#00F0FF]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{activeShipments.length}</span>
            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isAr ? 'مسارات حية' : 'Live Routes'}</span>
            </span>
          </div>
        </div>

        {/* KPI 2: Quotes Under Review */}
        <div 
          onClick={() => onNavigate('customer-quotes')}
          className="p-5 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl hover:border-amber-500/50 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'عروض الأسعار القائمة' : 'Pending Quotes'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{pendingQuotes.length}</span>
            <span className="text-[11px] font-bold text-amber-500">
              {isAr ? 'تتطلب متابعة' : 'In Review'}
            </span>
          </div>
        </div>

        {/* KPI 3: Completed Shipments */}
        <div 
          onClick={() => setActiveFilter('DELIVERED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            activeFilter === 'DELIVERED' 
              ? 'bg-[#0B172A] border-emerald-500 text-white shadow-lg ring-2 ring-emerald-500/30' 
              : 'bg-white dark:bg-[#0B172A] border-slate-200 dark:border-white/10 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'الشحنات المكتملة' : 'Delivered Cargo'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{completedShipments.length}</span>
            <span className="text-[11px] font-bold text-emerald-500">
              {isAr ? 'تم التسليم بنجاح' : 'Success'}
            </span>
          </div>
        </div>

        {/* KPI 4: Total Freight Cargo */}
        <div 
          onClick={() => onNavigate('customer-documents')}
          className="p-5 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl hover:border-[#0EA5E9]/50 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'المستندات الجمركية' : 'Customs Documents'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-500 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-sky-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{shipments.length * 3 + quotes.length * 2}</span>
            <span className="text-[11px] font-bold text-sky-500">
              {isAr ? 'بوالص وفواتير' : 'Waybills & Invoices'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Hub (4 Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00F0FF]" />
            <span>{isAr ? 'الإجراءات السريعة (Quick Operations Hub)' : 'Quick Operations Hub'}</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            {isAr ? 'انتقال مباشر للخدمات التنفيذية' : 'Direct shortcut to services'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: New Quote */}
          <div
            onClick={() => onNavigate('quote-request')}
            className="group p-5 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-t-4 border-t-[#00F0FF] relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00F0FF] transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mt-4 group-hover:text-[#00F0FF] transition-colors">
              {isAr ? 'طلب عرض سعر جديد' : 'New Quote Request'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {isAr ? 'احصل على تسعيرة فورية مخصصة لشحنتك الجوية، البحرية، أو البرية.' : 'Get instant customized freight quote for air, sea or road.'}
            </p>
          </div>

          {/* Action 2: Track Shipment */}
          <div
            onClick={() => onNavigate('tracking')}
            className="group p-5 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-t-4 border-t-amber-500 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mt-4 group-hover:text-amber-500 transition-colors">
              {isAr ? 'تتبع شحنة مباشرة' : 'Live Shipment Tracking'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {isAr ? 'استعرض مسارات الخريطة المباشرة وحالة التخليص الجمركي.' : 'View live map routes and customs clearance status.'}
            </p>
          </div>

          {/* Action 3: Upload Documents */}
          <div
            onClick={() => onNavigate('customer-documents')}
            className="group p-5 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-t-4 border-t-emerald-500 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mt-4 group-hover:text-emerald-500 transition-colors">
              {isAr ? 'إرفاق المستندات والبوالص' : 'Customs & Waybill Docs'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {isAr ? 'رفع الفواتير التجارية، شهادات المنشأ، وبوالص الشحن.' : 'Upload commercial invoices, certificates & bills of lading.'}
            </p>
          </div>

          {/* Action 4: Messages & Support */}
          <div
            onClick={() => onNavigate('customer-messages')}
            className="group p-5 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-t-4 border-t-purple-500 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mt-4 group-hover:text-purple-500 transition-colors">
              {isAr ? 'المراسلات والتذليل' : 'Customer Support & Tickets'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {isAr ? 'تواصل مباشر مع فريق التخليص والعمليات اللوجستية 24/7.' : 'Direct 24/7 communication with operations & customs team.'}
            </p>
          </div>
        </div>
      </div>

      {/* FREIGHT UNIT CONVERSION CALCULATOR SECTION */}
      <div id="freight-unit-calculator-section">
        <UnitConversionCalculator />
      </div>

      {/* Main Section: Interactive Shipments Table & Live Filter */}
      <Card
        title={isAr ? 'سجل وتتبع الشحنات المباشرة (Active Shipments Stream)' : 'Live Shipments & Tracking Stream'}
        subtitle={isAr ? 'البحث الفوري وتصفية الشحنات حسب الحالة ونوع الخدمة' : 'Real-time search and filter by status and transport type'}
      >
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث برقم التتبع، الميناء، المدينة، أو نوع الشحن...' : 'Search by B/L #, origin, destination or service...'}
              className="w-full ps-10 pe-4 py-2.5 bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                activeFilter === 'ALL'
                  ? 'bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-[#030712] shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? 'الكل' : 'All'} ({shipments.length})
            </button>

            <button
              onClick={() => setActiveFilter('ACTIVE')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                activeFilter === 'ACTIVE'
                  ? 'bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-[#030712] shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? 'قيد الشحن' : 'In Transit'} ({activeShipments.length})
            </button>

            <button
              onClick={() => setActiveFilter('CUSTOMS')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                activeFilter === 'CUSTOMS'
                  ? 'bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-[#030712] shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? 'التخليص الجمركي' : 'Customs'} ({shipments.filter((s) => s.status === 'CUSTOMS_CLEARANCE').length})
            </button>

            <button
              onClick={() => setActiveFilter('DELIVERED')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                activeFilter === 'DELIVERED'
                  ? 'bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-[#030712] shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? 'تم التسليم' : 'Delivered'} ({completedShipments.length})
            </button>
          </div>
        </div>

        {/* Table View */}
        {filteredShipments.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'لا توجد شحنات مطابقة للبحث أو التصفية الحالية.' : 'No shipments matched your search criteria.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setActiveFilter('ALL'); }}>
              {isAr ? 'إعادة ضبط البحث' : 'Reset Search Filters'}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-100 dark:bg-[#030712] border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 text-start">{isAr ? 'رقم التتبع البوليصة' : 'Tracking B/L #'}</th>
                  <th className="p-3.5 text-start">{isAr ? 'الخدمة' : 'Service'}</th>
                  <th className="p-3.5 text-start">{isAr ? 'المسار (من ← إلى)' : 'Route (Origin → Dest)'}</th>
                  <th className="p-3.5 text-start">{isAr ? 'الحالة الحالية' : 'Status'}</th>
                  <th className="p-3.5 text-start">{isAr ? 'الموقع الحالي / الميناء' : 'Current Location'}</th>
                  <th className="p-3.5 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10 bg-white dark:bg-[#0B172A]">
                {filteredShipments.map((shp) => (
                  <tr key={shp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-[#0EA5E9] dark:text-[#00F0FF]">
                      <div className="flex items-center gap-2">
                        {String(shp.serviceType).includes('LAND') ? <Truck className="w-4 h-4 text-amber-400" /> : String(shp.serviceType).includes('CUSTOMS') ? <FileCheck className="w-4 h-4 text-[#00F0FF]" /> : <Ship className="w-4 h-4 text-[#00F0FF]" />}
                        <span>{shp.trackingNumber}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {shp.serviceType || 'FREIGHT'}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5 dir-ltr justify-end sm:justify-start">
                        <span>{shp.origin}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-bold text-slate-900 dark:text-white">{shp.destination}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge type="shipment" status={shp.status} />
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{shp.currentLocation || (isAr ? 'في الطريق' : 'In Transit')}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedShipment(shp)}
                          className="px-3 py-1.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/30 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تتبع تفصيلي' : 'Track'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent Quotes Section */}
      <Card
        title={isAr ? 'طلبات عروض الأسعار التنافسية (Recent Quote Requests)' : 'Recent Freight Quote Requests'}
        headerAction={
          <Button variant="ghost" size="sm" onClick={() => onNavigate('customer-quotes')} className="text-[#0EA5E9] font-bold">
            {isAr ? 'عرض كافة الطلبات ←' : 'View All Quotes →'}
          </Button>
        }
      >
        {quotes.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
            {isAr ? 'لا توجد طلبات عروض أسعار قائمة حالياً.' : 'No active quote requests found.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotes.slice(0, 4).map((q) => (
              <div 
                key={q.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#00F0FF]/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#0EA5E9] dark:text-[#00F0FF]">
                    #{q.requestNumber || q.id}
                  </span>
                  <StatusBadge type="quote" status={q.status} />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>{q.shipmentType} Freight</span>
                  <span className="text-amber-500 dir-ltr font-mono">{q.pickupLocation} → {q.deliveryLocation}</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {isAr ? `البضاعة: ${q.cargoType} | الوزن المقدر: ${q.approximateWeight || 'غير محدد'} كجم` : `Cargo: ${q.cargoType} | Weight: ${q.approximateWeight || 'N/A'}`}
                </p>

                <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {new Date(q.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                  </span>
                  <button
                    onClick={() => setSelectedQuote(q)}
                    className="text-xs font-black text-[#0EA5E9] dark:text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isAr ? 'عرض تفاصيل العرض والتسعير' : 'View Offer Details'}</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Detailed Shipment Modal */}
      {selectedShipment && (
        <Modal
          isOpen={!!selectedShipment}
          onClose={() => setSelectedShipment(null)}
          title={`${isAr ? 'تفاصيل ومسار الشحنة:' : 'Shipment Tracking Journey:'} ${selectedShipment.trackingNumber}`}
        >
          <div className="space-y-6 pt-2">
            {/* Header info */}
            <div className="p-4 bg-slate-100 dark:bg-[#030712] rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#0EA5E9] dark:text-[#00F0FF] block">
                  B/L WAYBILL: {selectedShipment.trackingNumber}
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedShipment.origin} ← {selectedShipment.destination}
                </h4>
              </div>
              <StatusBadge type="shipment" status={selectedShipment.status} />
            </div>

            {/* Journey Timeline Steps */}
            <div className="space-y-3">
              <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isAr ? 'تتبع مراحل الشحن والجمرك المباشر:' : 'Freight & Clearance Checkpoints:'}
              </h5>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  <span>{isAr ? '1. تأكيد الحجز' : '1. Confirmed'}</span>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  <span>{isAr ? '2. استلام البضاعة' : '2. Picked Up'}</span>
                </div>
                <div className={`p-3 rounded-xl font-bold border ${selectedShipment.status === 'IN_TRANSIT' || selectedShipment.status === 'DELIVERED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                  <Clock className="w-4 h-4 mx-auto mb-1" />
                  <span>{isAr ? '3. العبور الإقليمي' : '3. In Transit'}</span>
                </div>
                <div className={`p-3 rounded-xl font-bold border ${selectedShipment.status === 'DELIVERED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-500/10 border-slate-500/30 text-slate-400'}`}>
                  <Package className="w-4 h-4 mx-auto mb-1" />
                  <span>{isAr ? '4. التسليم النهائي' : '4. Delivered'}</span>
                </div>
              </div>
            </div>

            {/* Details Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
              <div>
                <span className="text-slate-400 block">{isAr ? 'نوع الوسيلة:' : 'Transport Mode:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedShipment.serviceType || 'Ocean Freight'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isAr ? 'الموقع الحالي:' : 'Current Position:'}</span>
                <span className="font-bold text-amber-500">{selectedShipment.currentLocation || 'In Transit'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isAr ? 'تاريخ المغادرة:' : 'Departure Date:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedShipment.createdAt ? new Date(selectedShipment.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isAr ? 'الميناء المستهدف:' : 'Destination Port:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedShipment.destination}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedShipment(null)}>
                {isAr ? 'إغلاق' : 'Close'}
              </Button>
              <Button variant="primary" className="flex-1 font-bold" onClick={() => { setSelectedShipment(null); onNavigate('tracking'); }}>
                <Compass className="w-4 h-4" />
                <span>{isAr ? 'عرض الخريطة الحية' : 'Full Live Map'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quote Details Modal */}
      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title={`${isAr ? 'عرض السعر والتسعير والتفاصيل:' : 'Quote Request Details:'} #${selectedQuote.requestNumber || selectedQuote.id}`}
        >
          <div className="space-y-4 pt-2">
            {quoteAcceptSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'تم الموافقة على عرض السعر بنجاح وجاري تحويله لشحنة فعلية!' : 'Quote accepted successfully! Converting to active freight.'}</span>
              </div>
            )}

            <div className="p-4 bg-slate-100 dark:bg-[#030712] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'نوع الشحن المطلوب:' : 'Freight Type:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedQuote.shipmentType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'نقطة التحميل (Origin):' : 'Pickup Origin:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedQuote.pickupLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'وجهة التسليم (Destination):' : 'Delivery Destination:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedQuote.deliveryLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'تفاصيل البضاعة:' : 'Cargo Description:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedQuote.cargoType}</span>
              </div>
            </div>

            <div className="p-4 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#0EA5E9] dark:text-[#00F0FF] uppercase tracking-wider block">
                  {isAr ? 'التكلفة الإجمالية التقديرية' : 'Estimated Total Freight Cost'}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  12,500 <span className="text-xs font-bold text-slate-400">SAR</span>
                </span>
              </div>
              <StatusBadge type="quote" status={selectedQuote.status} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedQuote(null)}>
                {isAr ? 'إغلاق' : 'Close'}
              </Button>
              {selectedQuote.status !== 'AGREED' && (
                <Button variant="primary" className="flex-1 font-bold" onClick={() => handleAcceptQuote(selectedQuote.id)}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'قبول عرض السعر' : 'Accept Quote'}</span>
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
