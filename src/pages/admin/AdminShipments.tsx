import React, { useState, useEffect } from 'react';
import { Package, Plus, MapPin, Calendar, Clock, CheckCircle, Edit3, Search } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ShipmentDocumentsManager } from '../../components/documents/ShipmentDocumentsManager';
import { EnterpriseDataTable } from '../../components/common/EnterpriseDataTable';
import { DateRangePicker, DateRange } from '../../components/common/DateRangePicker';
import { useAuth } from '../../context/AuthContext';
import { Shipment, ShipmentStatus } from '../../types/shipment';
import { ServiceType } from '../../types/quote';

export const AdminShipments: React.FC = () => {
  const { token } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Date Range State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });

  // New Shipment Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newShipmentData, setNewShipmentData] = useState({
    customerName: '',
    customerPhone: '',
    serviceType: 'SEA_FREIGHT' as ServiceType,
    origin: '',
    destination: '',
    senderName: '',
    receiverName: '',
    estimatedDelivery: '',
    containerNumber: '',
  });

  // New Timeline Event Modal State
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [eventStatus, setEventStatus] = useState<ShipmentStatus>('IN_TRANSIT');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescAr, setEventDescAr] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchShipments = () => {
    if (!token) return;
    fetch('/api/shipments', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setShipments(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShipments();
  }, [token]);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newShipmentData),
      });

      if (res.ok) {
        setIsNewModalOpen(false);
        fetchShipments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !token) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: eventStatus,
          location: eventLocation,
          descriptionAr: eventDescAr,
        }),
      });

      if (res.ok) {
        setSelectedShipment(null);
        setEventLocation('');
        setEventDescAr('');
        fetchShipments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="جاري تحميل إدارة الشحنات..." />;

  const filteredShipments = shipments.filter((shp) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      (shp.trackingNumber && shp.trackingNumber.toLowerCase().includes(q)) ||
      (shp.customerName && shp.customerName.toLowerCase().includes(q)) ||
      (shp.origin && shp.origin.toLowerCase().includes(q)) ||
      (shp.destination && shp.destination.toLowerCase().includes(q)) ||
      (shp.serviceType && shp.serviceType.toLowerCase().includes(q));

    let matchesDate = true;
    if (dateRange.startDate || dateRange.endDate) {
      const sDateVal = shp.createdAt || shp.estimatedDelivery || (shp as any).createdDate || (shp as any).date;
      if (sDateVal) {
        const itemDateStr = typeof sDateVal === 'string' ? sDateVal.substring(0, 10) : '';
        if (itemDateStr) {
          if (dateRange.startDate && itemDateStr < dateRange.startDate) matchesDate = false;
          if (dateRange.endDate && itemDateStr > dateRange.endDate) matchesDate = false;
        }
      }
    }

    return matchesQuery && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-default">
        <div>
          <h2 className="text-xl font-bold text-text-primary">إدارة ومتابعة الشحنات المباشرة</h2>
          <p className="text-xs text-text-secondary">إصدار بوالص الشحنات وتحديث المحطات والمواقع اللوجستية</p>
        </div>
        <Button variant="secondary" onClick={() => setIsNewModalOpen(true)} className="gap-2 font-bold text-xs">
          <Plus className="w-4 h-4" />
          <span>إنشاء بوليصة شحنة جديدة</span>
        </Button>
      </div>

      {/* Filter Toolbar Container */}
      <div className="p-4 rounded-2xl bg-surface-primary border border-border-default shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="بحث باسم العميل، رقم التتبع، المصدر أو الوجهة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3.5 py-2 text-xs rounded-xl border border-border-default focus:border-border-focus focus:ring-2 focus:ring-border-focus/20 bg-surface-primary text-text-primary placeholder:text-text-muted transition-all outline-none"
          />
        </div>

        {/* DateRangePicker Filter */}
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            isAr={true}
            placeholder="تصفية حسب نطاق التاريخ"
          />
        </div>
      </div>

      <EnterpriseDataTable<Shipment>
        titleEn="Shipments Management"
        titleAr="إدارة ومتابعة الشحنات المباشرة"
        subtitleEn="Issue waybills, manage customs checkpoints, and track shipments in real-time"
        subtitleAr="إصدار بوالص الشحنات وتحديث المحطات والمواقع اللوجستية"
        data={filteredShipments}
        keyExtractor={(item) => item.id}
        searchableKeys={['trackingNumber', 'customerName', 'origin', 'destination', 'serviceType', 'currentLocation']}
        loading={loading}
        onRefresh={fetchShipments}
        onCreateNew={() => setIsNewModalOpen(true)}
        createButtonLabelEn="New Waybill"
        createButtonLabelAr="إنشاء بوليصة شحنة جديدة"
        isAr={true}
        resourceName="shipments"
        exportConfig={{
          resource: 'shipments',
          enabled: true,
          supportedFormats: ['csv', 'xlsx'],
          defaultFieldMode: 'VISIBLE_COLUMNS',
        }}
        columns={[
          {
            key: 'trackingNumber',
            headerEn: 'Tracking Number',
            headerAr: 'رقم التتبع',
            sortable: true,
            accessor: (shp) => (
              <span className="font-bold font-mono text-[#00F0FF] hover:underline cursor-pointer">
                {shp.trackingNumber}
              </span>
            ),
          },
          {
            key: 'customerName',
            headerEn: 'Customer Name',
            headerAr: 'اسم العميل',
            sortable: true,
            accessor: (shp) => <span className="font-semibold">{shp.customerName}</span>,
          },
          {
            key: 'serviceType',
            headerEn: 'Service Type',
            headerAr: 'الخدمة',
            sortable: true,
            accessor: (shp) => (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                {shp.serviceType}
              </span>
            ),
          },
          {
            key: 'route',
            headerEn: 'Origin & Destination',
            headerAr: 'المصدر والوجهة',
            accessor: (shp) => (
              <span className="text-slate-600 dark:text-slate-300">
                {shp.origin} ← {shp.destination}
              </span>
            ),
          },
          {
            key: 'status',
            headerEn: 'Status',
            headerAr: 'الحالة الحالية',
            sortable: true,
            accessor: (shp) => <StatusBadge type="shipment" status={shp.status} />,
          },
          {
            key: 'currentLocation',
            headerEn: 'Current Location',
            headerAr: 'الموقع الحالي',
            accessor: (shp) => <span className="font-medium text-slate-300">{shp.currentLocation || '-'}</span>,
          },
        ]}
        rowActions={(shp) => [
          {
            labelEn: 'Update Location',
            labelAr: 'إضافة محطة/تحديث',
            icon: MapPin,
            onClick: () => {
              setSelectedShipment(shp);
              setEventStatus(shp.status);
              setEventLocation(shp.currentLocation || shp.destination);
            },
          },
        ]}
        bulkActions={[
          {
            id: 'export-selected',
            labelEn: 'Export Selected',
            labelAr: 'تصدير المحدد',
            onClick: (selected) => {
              console.log('Bulk exporting:', selected);
            },
          },
        ]}
      />

      {/* New Shipment Modal */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="إصدار بوليصة شحنة جديدة">
        <form onSubmit={handleCreateShipment} className="space-y-4 text-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم العميل *"
              value={newShipmentData.customerName}
              onChange={(e) => setNewShipmentData({ ...newShipmentData, customerName: e.target.value })}
              required
            />
            <Input
              label="جوال العميل *"
              value={newShipmentData.customerPhone}
              onChange={(e) => setNewShipmentData({ ...newShipmentData, customerPhone: e.target.value })}
              required
            />
          </div>

          <Select
            label="نوع الخدمة *"
            value={newShipmentData.serviceType}
            onChange={(e) => setNewShipmentData({ ...newShipmentData, serviceType: e.target.value as ServiceType })}
            options={[
              { value: 'SEA_FREIGHT', label: 'شحن بحري (SEA_FREIGHT)' },
              { value: 'LAND_FREIGHT', label: 'شحن بري (LAND_FREIGHT)' },
              { value: 'CUSTOMS_CLEARANCE', label: 'تخليص جمركي (CUSTOMS_CLEARANCE)' },
              { value: 'WAREHOUSING', label: 'تخزين ومستودعات (WAREHOUSING)' },
              { value: 'DOOR_TO_DOOR', label: 'من الباب للباب (DOOR_TO_DOOR)' },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="المنشأ (المصدر) *"
              value={newShipmentData.origin}
              onChange={(e) => setNewShipmentData({ ...newShipmentData, origin: e.target.value })}
              placeholder="مثال: Ningbo Port"
              required
            />
            <Input
              label="الوجهة والوصول *"
              value={newShipmentData.destination}
              onChange={(e) => setNewShipmentData({ ...newShipmentData, destination: e.target.value })}
              placeholder="مثال: الرياض"
              required
            />
            <Input
              label="اسم المرسل *"
              value={newShipmentData.senderName}
              onChange={(e) => setNewShipmentData({ ...newShipmentData, senderName: e.target.value })}
              required
            />
            <Input
              label="اسم المستلم *"
              value={newShipmentData.receiverName}
              onChange={(e) => setNewShipmentData({ ...newShipmentData, receiverName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="رقم الحاوية (إن وجد)"
              value={newShipmentData.containerNumber}
              onChange={(e) => setNewShipmentData({ ...newShipmentData, containerNumber: e.target.value })}
              placeholder="MSCU-90123"
            />
            <Input
              label="تاريخ الوصول المتوقع"
              type="date"
              value={newShipmentData.estimatedDelivery}
              onChange={(e) => setNewShipmentData({ ...newShipmentData, estimatedDelivery: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              حفظ وإصدار البوليصة
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Event Modal */}
      <Modal isOpen={!!selectedShipment} onClose={() => setSelectedShipment(null)} title={`تحديث محطة الشحنة #${selectedShipment?.trackingNumber}`}>
        {selectedShipment && (
          <div className="space-y-6">
            <form onSubmit={handleAddEvent} className="space-y-4 text-slate-900">
              <Select
                label="الحالة الجديدة للشحنة *"
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value as ShipmentStatus)}
                options={[
                  { value: 'RECEIVED', label: 'تم استلام الشحنة (RECEIVED)' },
                  { value: 'BOOKING_CONFIRMED', label: 'تأكيد الحجز (BOOKING_CONFIRMED)' },
                  { value: 'PREPARING', label: 'تجهيز الشحنة (PREPARING)' },
                  { value: 'LOADING', label: 'تحميل الشحنة (LOADING)' },
                  { value: 'IN_TRANSIT', label: 'في الطريق (IN_TRANSIT)' },
                  { value: 'ARRIVED_AT_PORT', label: 'وصلت للميناء (ARRIVED_AT_PORT)' },
                  { value: 'CUSTOMS_CLEARANCE', label: 'التخليص الجمركي (CUSTOMS_CLEARANCE)' },
                  { value: 'OUT_FOR_DELIVERY', label: 'خرجت للتسليم (OUT_FOR_DELIVERY)' },
                  { value: 'DELIVERED', label: 'تم التسليم بنجاح (DELIVERED)' },
                ]}
              />

              <Input
                label="الموقع الحالي *"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="مثال: ميناء جدة الإسلامي - رصيف 4"
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">الوصف المباشر للحدث (عربي) *</label>
                <textarea
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0F4C75]"
                  placeholder="مثال: تم إنهاء إجراءات الفحص الجمركي واستخراج إذن الإفراج..."
                  value={eventDescAr}
                  onChange={(e) => setEventDescAr(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedShipment(null)}>
                  إلغاء
                </Button>
                <Button type="submit" variant="primary" isLoading={saving}>
                  حفظ الحدث والخط الزمني
                </Button>
              </div>
            </form>

            {/* Admin Shipment Documents Management */}
            <div className="border-t border-slate-200 pt-4">
              <ShipmentDocumentsManager
                ownerType="SHIPMENT"
                ownerId={selectedShipment.id}
                title={`إدارة مستندات الشحنة #${selectedShipment.trackingNumber}`}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
