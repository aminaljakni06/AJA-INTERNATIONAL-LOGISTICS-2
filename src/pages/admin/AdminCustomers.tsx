import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Eye, Edit2, Shield, Phone, Mail, Building, FileText, Package, CheckCircle2, XCircle, RefreshCw, Sparkles, Building2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { Customer360MainView } from '../../components/customer/360/Customer360MainView';
import { EnterpriseDataTable } from '../../components/common/EnterpriseDataTable';

interface CustomerItem {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  companyName?: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  role: string;
  createdAt: string;
  quotesCount?: number;
  shipmentsCount?: number;
}

export const AdminCustomers: React.FC<{ onNavigate?: (tab: string) => void }> = () => {
  const { token } = useAuth();
  const [viewMode, setViewMode] = useState<'360' | 'LIST'>('360');
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [customerDetails, setCustomerDetails] = useState<{
    customer: CustomerItem;
    quotes: any[];
    shipments: any[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit Modal State
  const [editCustomer, setEditCustomer] = useState<CustomerItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const handleOpenDetails = async (cust: CustomerItem) => {
    setSelectedCustomer(cust);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/customers/${cust.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerDetails(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenEdit = (cust: CustomerItem) => {
    setEditCustomer(cust);
    setEditName(cust.displayName || '');
    setEditEmail(cust.email || '');
    setEditPhone(cust.phone || '');
    setEditCompany(cust.companyName || '');
    setEditStatus(cust.status || 'ACTIVE');
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer || !token) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${editCustomer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: editName,
          email: editEmail,
          phone: editPhone,
          companyName: editCompany,
          status: editStatus,
        }),
      });

      if (res.ok) {
        setEditCustomer(null);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cust: CustomerItem) => {
    if (!token) return;
    const newStatus = cust.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/customers/${cust.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    const name = (c.displayName || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const company = (c.companyName || '').toLowerCase();

    return name.includes(term) || phone.includes(term) || email.includes(term) || company.includes(term);
  });

  if (loading) return <LoadingSpinner label="جاري تحميل إدارة العملاء..." />;

  return (
    <div className="space-y-6">
      {/* Top View Switcher */}
      <div className="flex items-center justify-between p-3 bg-slate-800/90 border border-slate-700 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('360')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              viewMode === '360'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>منصة العميل 360 الموحدة (Customer 360 Platform)</span>
          </button>

          <button
            onClick={() => setViewMode('LIST')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              viewMode === 'LIST'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>سجلات حسابات العملاء البسيطة</span>
          </button>
        </div>
      </div>

      {viewMode === '360' ? (
        <Customer360MainView />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            إدارة سجلات وشحنات العملاء
          </h2>
          <p className="text-xs text-slate-300">متابعة حسابات العملاء، البحث بالاسم أو الجوال، وتنشيط وإيقاف الحسابات</p>
        </div>
        <Button onClick={fetchCustomers} variant="outline" size="sm" className="gap-2 text-slate-200 border-slate-600 self-start">
          <RefreshCw className="w-3.5 h-3.5" />
          تحديث السجلات
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="ابحث بالاسم، رقم الجوال، البريد أو الشركة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-9 py-2 text-xs bg-slate-800 border-slate-700 text-white placeholder-slate-400"
        />
      </div>

      <EnterpriseDataTable<CustomerItem>
        titleEn="Customer Accounts Directory"
        titleAr="إدارة سجلات وشحنات العملاء"
        subtitleEn="Track accounts, phone numbers, active quotes, shipments, and status"
        subtitleAr="متابعة حسابات العملاء، البحث بالاسم أو الجوال، وتنشيط وإيقاف الحسابات"
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        searchableKeys={['displayName', 'companyName', 'phone', 'email']}
        loading={loading}
        onRefresh={fetchCustomers}
        isAr={true}
        resourceName="customers"
        exportConfig={{
          resource: 'customers',
          enabled: true,
          supportedFormats: ['csv', 'xlsx'],
          defaultFieldMode: 'VISIBLE_COLUMNS',
        }}
        columns={[
          {
            key: 'displayName',
            headerEn: 'Customer Name',
            headerAr: 'اسم العميل',
            sortable: true,
            accessor: (cust) => <span className="font-bold text-slate-100">{cust.displayName}</span>,
          },
          {
            key: 'companyName',
            headerEn: 'Company',
            headerAr: 'اسم الشركة',
            sortable: true,
            accessor: (cust) => <span className="text-amber-300 font-semibold">{cust.companyName || 'فرد'}</span>,
          },
          {
            key: 'phone',
            headerEn: 'Phone Number',
            headerAr: 'رقم الجوال',
            accessor: (cust) => <span className="font-mono text-slate-300" dir="ltr">{cust.phone || '-'}</span>,
          },
          {
            key: 'email',
            headerEn: 'Email Address',
            headerAr: 'البريد الإلكتروني',
            sortable: true,
            accessor: (cust) => <span className="font-mono text-slate-300">{cust.email}</span>,
          },
          {
            key: 'quotesCount',
            headerEn: 'Quotes',
            headerAr: 'طلبات العروض',
            sortable: true,
            accessor: (cust) => <span className="font-bold text-amber-400">{cust.quotesCount || 0}</span>,
          },
          {
            key: 'shipmentsCount',
            headerEn: 'Active Shipments',
            headerAr: 'الشحنات النشطة',
            sortable: true,
            accessor: (cust) => <span className="font-bold text-blue-400">{cust.shipmentsCount || 0}</span>,
          },
          {
            key: 'status',
            headerEn: 'Account Status',
            headerAr: 'حالة الحساب',
            sortable: true,
            accessor: (cust) => (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                  cust.status === 'ACTIVE'
                    ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-900/50 text-rose-300 border border-rose-500/40'
                }`}
              >
                {cust.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {cust.status === 'ACTIVE' ? 'نشط' : 'معطل'}
              </span>
            ),
          },
        ]}
        rowActions={(cust) => [
          {
            labelEn: 'View 360 Profile',
            labelAr: 'عرض الملف والأنشطة',
            icon: Eye,
            onClick: () => handleOpenDetails(cust),
          },
          {
            labelEn: 'Edit Customer',
            labelAr: 'تعديل بيانات العميل',
            icon: Edit2,
            onClick: () => handleOpenEdit(cust),
          },
        ]}
      />

      {/* View Full Customer Profile Modal */}
      <Modal isOpen={!!selectedCustomer} onClose={() => { setSelectedCustomer(null); setCustomerDetails(null); }} title={`ملف العميل: ${selectedCustomer?.displayName}`}>
        {loadingDetails ? (
          <LoadingSpinner label="جاري استدعاء كافة سجلات العميل..." />
        ) : customerDetails ? (
          <div className="space-y-6 text-slate-900 text-xs">
            {/* Customer Summary Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <p><span className="font-bold text-slate-500">الاسم الكامل:</span> {customerDetails.customer.displayName}</p>
                <p><span className="font-bold text-slate-500">الشركة:</span> {customerDetails.customer.companyName || 'فرد'}</p>
                <p><span className="font-bold text-slate-500">رقم الجوال:</span> <span dir="ltr">{customerDetails.customer.phone || '-'}</span></p>
                <p><span className="font-bold text-slate-500">البريد الإلكتروني:</span> {customerDetails.customer.email}</p>
              </div>
            </div>

            {/* Customer Quote Requests */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#082F49] dark:text-white flex items-center gap-1.5 border-r-2 border-[#0F4C75] pr-2">
                <FileText className="w-4 h-4 text-[#0F4C75]" />
                <span>طلبات عروض الأسعار ({customerDetails.quotes.length})</span>
              </h4>
              {customerDetails.quotes.length === 0 ? (
                <p className="text-slate-400 italic">لا توجد طلبات أسعار مسجلة.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerDetails.quotes.map((q) => (
                    <div key={q.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#082F49] dark:text-white">{q.requestNumber || q.id} - {q.shipmentType || q.serviceType}</p>
                        <p className="text-[11px] text-slate-500">{q.pickupLocation || q.origin} ← {q.deliveryLocation || q.destination}</p>
                      </div>
                      <StatusBadge type="quote" status={q.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Shipments */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#082F49] dark:text-white flex items-center gap-1.5 border-r-2 border-[#0F4C75] pr-2">
                <Package className="w-4 h-4 text-[#0F4C75]" />
                <span>الشحنات والبوالص الصادرة ({customerDetails.shipments.length})</span>
              </h4>
              {customerDetails.shipments.length === 0 ? (
                <p className="text-slate-400 italic">لا توجد شحنات مسجلة للعميل.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerDetails.shipments.map((s) => (
                    <div key={s.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-bold text-amber-700 font-mono">{s.trackingNumber}</p>
                        <p className="text-[11px] text-slate-500">{s.pickupLocation} ← {s.deliveryLocation}</p>
                      </div>
                      <StatusBadge type="shipment" status={s.currentStatus || s.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <Button variant="outline" onClick={() => { setSelectedCustomer(null); setCustomerDetails(null); }}>
                إغلاق
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Edit Customer Profile Modal */}
      <Modal isOpen={!!editCustomer} onClose={() => setEditCustomer(null)} title={`تعديل بيانات العميل: ${editCustomer?.displayName}`}>
        {editCustomer && (
          <form onSubmit={handleSaveCustomer} className="space-y-4 text-slate-900 text-xs">
            <Input
              label="الاسم الكامل *"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <Input
              label="البريد الإلكتروني *"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
            <Input
              label="رقم الجوال *"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              required
            />
            <Input
              label="اسم الشركة"
              value={editCompany}
              onChange={(e) => setEditCompany(e.target.value)}
            />

            <div className="space-y-1">
              <label className="block font-medium text-slate-700">حالة الحساب</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0F4C75]"
              >
                <option value="ACTIVE">نشط (ACTIVE)</option>
                <option value="INACTIVE">معطل (INACTIVE)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setEditCustomer(null)}>
                إلغاء
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                حفظ التحديثات
              </Button>
            </div>
          </form>
        )}
      </Modal>
        </>
      )}
    </div>
  );
};
