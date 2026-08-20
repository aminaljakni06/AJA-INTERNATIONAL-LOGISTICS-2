import React, { useState, useEffect } from 'react';
import { FileText, Search, Edit3, Eye, Paperclip, MessageCircle, PhoneCall, Mail, Tag, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EnterpriseDataTable } from '../../components/common/EnterpriseDataTable';
import { useAuth } from '../../context/AuthContext';
import { QuoteRequest, QuoteRequestStatus } from '../../types/quote';

export const AdminQuotes: React.FC = () => {
  const { token } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [viewDetailsQuote, setViewDetailsQuote] = useState<QuoteRequest | null>(null);

  // Edit State
  const [editStatus, setEditStatus] = useState<QuoteRequestStatus>('NEW');
  const [editPrice, setEditPrice] = useState<string>('');
  const [editCurrency, setEditCurrency] = useState<string>('SAR');
  const [editValidUntil, setEditValidUntil] = useState<string>('');
  const [editTerms, setEditTerms] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchQuotes = () => {
    if (!token) return;
    fetch('/api/quotes', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setQuotes(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotes();
  }, [token]);

  const handleOpenEdit = (quote: QuoteRequest) => {
    const q = quote as any;
    setSelectedQuote(quote);
    setEditStatus(quote.status);
    setEditPrice(q.quoteResponse?.offeredPrice ? String(q.quoteResponse.offeredPrice) : quote.offeredPrice ? String(quote.offeredPrice) : '');
    setEditCurrency(q.quoteResponse?.currency || 'SAR');
    setEditValidUntil(q.quoteResponse?.validUntil || '');
    setEditTerms(q.quoteResponse?.terms || '');
    setEditNotes(q.internalNotes || quote.adminNotes || '');
  };

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote || !token) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/quotes/${selectedQuote.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: editStatus,
          offeredPrice: editPrice ? Number(editPrice) : null,
          currency: editCurrency,
          validUntil: editValidUntil,
          terms: editTerms,
          internalNotes: editNotes,
        }),
      });

      if (res.ok) {
        setSelectedQuote(null);
        fetchQuotes();
      }
    } catch (err) {
      console.error('Error updating quote:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    const reqNo = (q.requestNumber || q.id).toLowerCase();
    const name = (q.customerName || '').toLowerCase();
    const company = (q.companyName || '').toLowerCase();
    const phone = (q.customerPhone || '').toLowerCase();
    const cargo = (q.cargoType || q.cargoDetails || '').toLowerCase();

    const matchesTerm =
      reqNo.includes(term) || name.includes(term) || company.includes(term) || phone.includes(term) || cargo.includes(term);

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;

    return matchesTerm && matchesStatus;
  });

  if (loading) return <LoadingSpinner label="جاري تحميل طلبات الأسعار للعمليات..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-amber-400">إدارة ومراجعة طلبات عروض الأسعار</h2>
        <p className="text-xs text-slate-300">مراجعة بيانات الشحنة، تحديد أسعار العروض، وإدارة الاتصال بالعملاء</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="ابحث برقم الطلب، اسم العميل، الشركة، رقم الجوال، نوع البضاعة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9 py-2 text-xs bg-slate-800 border-slate-700 text-white placeholder-slate-400"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'جميع الحالات (All Statuses)' },
            { value: 'NEW', label: 'طلبات جديدة (NEW)' },
            { value: 'UNDER_REVIEW', label: 'قيد المراجعة (UNDER_REVIEW)' },
            { value: 'CONTACTED', label: 'تم التواصل (CONTACTED)' },
            { value: 'QUOTE_SENT', label: 'تم إرسال العرض (QUOTE_SENT)' },
            { value: 'NEGOTIATING', label: 'قيد التفاوض (NEGOTIATING)' },
            { value: 'AGREED', label: 'تم الاتفاق (AGREED)' },
            { value: 'REJECTED', label: 'مرفوض (REJECTED)' },
            { value: 'CLOSED', label: 'مغلق (CLOSED)' },
          ]}
          className="bg-slate-800 border-slate-700 text-white text-xs"
        />
      </div>

      <EnterpriseDataTable<QuoteRequest>
        titleEn="Quotes Management"
        titleAr="إدارة ومراجعة طلبات عروض الأسعار"
        subtitleEn="Review shipment details, set pricing, and manage customer communications"
        subtitleAr="مراجعة بيانات الشحنة، تحديد أسعار العروض، وإدارة الاتصال بالعملاء"
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        searchableKeys={['requestNumber', 'customerName', 'companyName', 'customerPhone', 'cargoType', 'origin', 'destination']}
        loading={loading}
        onRefresh={fetchQuotes}
        isAr={true}
        resourceName="quotes"
        exportConfig={{
          resource: 'quotes',
          enabled: true,
          supportedFormats: ['csv', 'xlsx'],
          defaultFieldMode: 'VISIBLE_COLUMNS',
        }}
        columns={[
          {
            key: 'requestNumber',
            headerEn: 'Request No.',
            headerAr: 'رقم الطلب',
            sortable: true,
            accessor: (q) => (
              <span className="font-bold font-mono text-amber-400">
                {q.requestNumber || q.id}
              </span>
            ),
          },
          {
            key: 'customerName',
            headerEn: 'Customer & Company',
            headerAr: 'العميل والشركة',
            sortable: true,
            accessor: (q) => (
              <div>
                <p className="font-bold text-slate-100">{q.customerName || 'عميل'}</p>
                <p className="text-[10px] text-amber-300/80">{q.companyName || 'فرد'}</p>
                <p className="text-[10px] text-slate-400" dir="ltr">{q.customerPhone}</p>
              </div>
            ),
          },
          {
            key: 'shipmentType',
            headerEn: 'Freight Type',
            headerAr: 'نوع الشحن',
            sortable: true,
            accessor: (q) => <span className="font-bold text-blue-300">{q.shipmentType || q.serviceType}</span>,
          },
          {
            key: 'route',
            headerEn: 'Route',
            headerAr: 'مسار النقل',
            accessor: (q) => (
              <span className="text-slate-300">
                {(q.pickupLocation || q.origin || '-')} ← {(q.deliveryLocation || q.destination || '-')}
              </span>
            ),
          },
          {
            key: 'status',
            headerEn: 'Status',
            headerAr: 'الحالة',
            sortable: true,
            accessor: (q) => <StatusBadge type="quote" status={q.status} />,
          },
          {
            key: 'offeredPrice',
            headerEn: 'Offered Price',
            headerAr: 'السعر المقدم',
            sortable: true,
            accessor: (q) => {
              const price = q.quoteResponse?.offeredPrice || q.offeredPrice;
              return (
                <span className="font-bold text-emerald-400">
                  {price ? `${Number(price).toLocaleString()} ${q.quoteResponse?.currency || 'SAR'}` : 'لم يحدد'}
                </span>
              );
            },
          },
        ]}
        rowActions={(q) => [
          {
            labelEn: 'View Details',
            labelAr: 'عرض التفاصيل',
            icon: Eye,
            onClick: () => setViewDetailsQuote(q),
          },
          {
            labelEn: 'Update Quote',
            labelAr: 'تحديث العرض',
            icon: Edit3,
            onClick: () => handleOpenEdit(q),
          },
        ]}
      />

      {/* View Details Modal */}
      <Modal isOpen={!!viewDetailsQuote} onClose={() => setViewDetailsQuote(null)} title={`تفاصيل طلب عرض السعر: ${viewDetailsQuote?.requestNumber || viewDetailsQuote?.id}`}>
        {viewDetailsQuote && (
          <div className="space-y-4 text-slate-900 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <p><span className="font-bold">اسم العميل:</span> {viewDetailsQuote.customerName}</p>
                <p><span className="font-bold">الشركة:</span> {viewDetailsQuote.companyName || 'لا يوجد'}</p>
                <p><span className="font-bold">الجوال:</span> <span dir="ltr">{viewDetailsQuote.customerPhone}</span></p>
                <p><span className="font-bold">البريد:</span> {viewDetailsQuote.customerEmail}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-lg space-y-2 border border-slate-200">
              <h4 className="font-bold text-[#082F49] dark:text-white">تفاصيل الشحنة والنقل</h4>
              <p><span className="font-bold">نوع الخدمة:</span> {viewDetailsQuote.shipmentType || viewDetailsQuote.serviceType}</p>
              <p><span className="font-bold">طبيعة البضاعة:</span> {viewDetailsQuote.cargoType || viewDetailsQuote.cargoDetails}</p>
              <p><span className="font-bold">خط النقل:</span> {viewDetailsQuote.pickupLocation || viewDetailsQuote.origin} ← {viewDetailsQuote.deliveryLocation || viewDetailsQuote.destination}</p>
              <p><span className="font-bold">الوزن / العدد:</span> {viewDetailsQuote.approximateWeight || viewDetailsQuote.weightKg || '-'} كجم / {viewDetailsQuote.packageOrContainerCount || viewDetailsQuote.volumeCbm || '-'} طرد</p>
              {viewDetailsQuote.expectedShippingDate && <p><span className="font-bold">تاريخ الشحن المتوقع:</span> {viewDetailsQuote.expectedShippingDate}</p>}
            </div>

            {viewDetailsQuote.attachments && viewDetailsQuote.attachments.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-1">المرفقات والملفات:</h4>
                <div className="flex flex-wrap gap-2">
                  {viewDetailsQuote.attachments.map((att, idx) => (
                    <span key={idx} className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1.5 text-slate-700">
                      <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                      <span>{typeof att === 'string' ? att : att.name || 'ملف'}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Contact Actions for Admin */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${viewDetailsQuote.customerPhone?.replace(/\+/g, '')}?text=${encodeURIComponent(`مرحباً ${viewDetailsQuote.customerName}، بخصوص طلب عرض السعر رقم (${viewDetailsQuote.requestNumber || viewDetailsQuote.id}) من شركة أجا للخدمات اللوجستية.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>واتساب العميل</span>
                </a>
                <a
                  href={`tel:${viewDetailsQuote.customerPhone}`}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-bold flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>اتصال</span>
                </a>
              </div>
              <Button variant="outline" onClick={() => setViewDetailsQuote(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Quote Status & Price Modal */}
      <Modal isOpen={!!selectedQuote} onClose={() => setSelectedQuote(null)} title={`تعديل وتسعير الطلب: ${selectedQuote?.requestNumber || selectedQuote?.id}`}>
        {selectedQuote && (
          <form onSubmit={handleSaveQuote} className="space-y-4 text-slate-900 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
              <p><span className="font-bold">العميل:</span> {selectedQuote.customerName} ({selectedQuote.companyName || 'فرد'})</p>
              <p><span className="font-bold">البضاعة والخط:</span> {selectedQuote.cargoType || selectedQuote.cargoDetails} ({selectedQuote.pickupLocation || selectedQuote.origin} ← {selectedQuote.deliveryLocation || selectedQuote.destination})</p>
            </div>

            <Select
              label="تحديث حالة الطلب *"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as QuoteRequestStatus)}
              options={[
                { value: 'NEW', label: 'جديد (NEW)' },
                { value: 'UNDER_REVIEW', label: 'قيد المراجعة (UNDER_REVIEW)' },
                { value: 'CONTACTED', label: 'تم التواصل مع العميل (CONTACTED)' },
                { value: 'QUOTE_SENT', label: 'تم إرسال عرض السعر (QUOTE_SENT)' },
                { value: 'NEGOTIATING', label: 'قيد التفاوض (NEGOTIATING)' },
                { value: 'AGREED', label: 'تم الاتفاق والموافقة (AGREED)' },
                { value: 'REJECTED', label: 'مرفوض من العميل/الشركة (REJECTED)' },
                { value: 'CLOSED', label: 'مغلق ومكتمل (CLOSED)' },
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="السعر المعروض للعميل"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="مثال: 18500"
              />
              <Input
                label="العملة"
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value)}
                placeholder="SAR"
              />
            </div>

            <Input
              label="العرض ساري حتى تاريخ"
              type="date"
              value={editValidUntil}
              onChange={(e) => setEditValidUntil(e.target.value)}
            />

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">شروط وأحكام عرض السعر</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0F4C75]"
                value={editTerms}
                onChange={(e) => setEditTerms(e.target.value)}
                placeholder="مثال: العرض يشمل الرسوم الجمركية، ولا يشمل رسوم الأرضيات بالموانئ..."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">ملاحظات داخلية لفريق العمليات</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0F4C75]"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="ملاحظات سرية للعمليات..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setSelectedQuote(null)}>
                إلغاء
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                حفظ التحديثات وإرسال الإشعار
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

