import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Package, 
  FileCheck, 
  FileSpreadsheet, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ShipmentDocumentsManager } from '../../components/documents/ShipmentDocumentsManager';
import { useAuth } from '../../context/AuthContext';
import { Shipment } from '../../types/shipment';

export const CustomerDocuments: React.FC = () => {
  const { token, user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>('CUSTOMER_PROFILE');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchShipments = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/shipments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setShipments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [token]);

  if (loading) return <LoadingSpinner label="جاري استدعاء مركز مستندات ووثائق الشحنات..." />;

  const currentShipment = shipments.find((s) => s.id === selectedShipmentId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#082F49] text-white p-6 rounded-2xl shadow-sm border border-[#0F4C75]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#EA580C]" />
              مركز المستندات والوثائق الرسمية
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              مراجعة وتنزيل الفواتير التجارية، بوالص الشحن (CMR)، قائمة التعبئة، وشهادات الإفصاح الجمركي
            </p>
          </div>

          <div className="bg-white/10 text-white text-xs px-3 py-2 rounded-xl border border-white/20 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>حفظ رقمي آمن ومشفّر</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Selector Sidebar */}
        <div className="space-y-3">
          <Card title="اختر الشحنة أو مجلد الوثائق" className="space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث عن شحنة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C75]"
              />
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pt-1">
              {/* Customer Account Documents folder option */}
              <button
                type="button"
                onClick={() => setSelectedShipmentId('CUSTOMER_PROFILE')}
                className={`w-full text-right p-3 rounded-xl transition-all border flex items-center justify-between ${
                  selectedShipmentId === 'CUSTOMER_PROFILE'
                    ? 'bg-[#082F49] text-white border-[#0F4C75] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderOpen className={`w-4 h-4 ${selectedShipmentId === 'CUSTOMER_PROFILE' ? 'text-[#EA580C]' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-bold text-xs">وثائق الحساب والسجل التجاري</p>
                    <p className={`text-[10px] ${selectedShipmentId === 'CUSTOMER_PROFILE' ? 'text-slate-300' : 'text-slate-500'}`}>
                      المستندات العامة للشركة والتراخيص
                    </p>
                  </div>
                </div>
              </button>

              {/* Shipments List */}
              {shipments
                .filter((s) => !searchTerm || s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) || s.origin.includes(searchTerm) || s.destination.includes(searchTerm))
                .map((shp) => {
                  const isSelected = selectedShipmentId === shp.id;
                  return (
                    <button
                      key={shp.id}
                      type="button"
                      onClick={() => setSelectedShipmentId(shp.id)}
                      className={`w-full text-right p-3 rounded-xl transition-all border flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#082F49] text-white border-[#0F4C75] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Package className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-mono font-bold text-xs">{shp.trackingNumber}</p>
                          <p className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {shp.origin} ← {shp.destination}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </Card>
        </div>

        {/* Selected Documents Viewer */}
        <div className="lg:col-span-2">
          {selectedShipmentId === 'CUSTOMER_PROFILE' ? (
            <ShipmentDocumentsManager
              ownerType="CUSTOMER"
              ownerId={user?.id || 'default_cust'}
              title="مستندات ووثائق الشركة الهوية/السجل التجاري"
            />
          ) : (
            <ShipmentDocumentsManager
              ownerType="SHIPMENT"
              ownerId={selectedShipmentId}
              title={`مستندات الشحنة (${currentShipment?.trackingNumber || selectedShipmentId})`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
