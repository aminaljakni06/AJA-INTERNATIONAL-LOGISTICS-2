import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Package, 
  FileText, 
  MessageSquare, 
  FileCheck, 
  Clock, 
  Search, 
  Filter, 
  ArrowLeft,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { NotificationDoc } from '../../types/firestore';

interface CustomerNotificationsProps {
  onNavigate: (tab: string, entityId?: string) => void;
}

export const CustomerNotifications: React.FC<CustomerNotificationsProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/customer/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!token) return;

    setActioningId(id);
    try {
      await fetch(`/api/customer/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/customer/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: NotificationDoc) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }

    if (notif.relatedEntityType === 'SHIPMENT' || notif.type === 'SHIPMENT') {
      onNavigate('customer-shipments', notif.relatedEntityId);
    } else if (notif.relatedEntityType === 'QUOTE_REQUEST' || notif.type === 'QUOTE' || notif.type === 'QUOTE_REQUEST') {
      onNavigate('customer-quotes', notif.relatedEntityId);
    } else if (notif.relatedEntityType === 'CUSTOMER' || notif.type === 'MESSAGE') {
      onNavigate('customer-messages');
    } else {
      onNavigate('customer-dashboard');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SHIPMENT':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'QUOTE':
      case 'QUOTE_REQUEST':
      case 'QUOTE_READY':
        return <FileText className="w-5 h-5 text-amber-600" />;
      case 'DOCUMENT':
        return <FileCheck className="w-5 h-5 text-emerald-600" />;
      case 'MESSAGE':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'SHIPMENT':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">شحنة</span>;
      case 'QUOTE':
      case 'QUOTE_REQUEST':
      case 'QUOTE_READY':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">عرض سعر</span>;
      case 'DOCUMENT':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">مستندات</span>;
      case 'MESSAGE':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded">رسالة دعم</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded">تنبيه عام</span>;
    }
  };

  if (loading) return <LoadingSpinner label="جاري تحميل سجل الإشعارات..." />;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterUnreadOnly && n.isRead) return false;
    if (filterType !== 'ALL') {
      if (filterType === 'SHIPMENT' && n.type !== 'SHIPMENT') return false;
      if (filterType === 'QUOTE' && n.type !== 'QUOTE' && n.type !== 'QUOTE_REQUEST' && n.type !== 'QUOTE_READY') return false;
      if (filterType === 'DOCUMENT' && n.type !== 'DOCUMENT') return false;
      if (filterType === 'MESSAGE' && n.type !== 'MESSAGE') return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        n.title.toLowerCase().includes(term) ||
        n.body.toLowerCase().includes(term) ||
        (n.relatedEntityId && n.relatedEntityId.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#082F49] dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#EA580C]" />
            مركز التنبيهات والإشعارات
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سجل مستمر للتحديثات المباشرة على شحناتك، عروض الأسعار، المستندات المرفوعة، واستجابات الدعم الفني
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="gap-2 text-xs border-[#0F4C75]/40 text-[#0F4C75] hover:bg-slate-50 font-bold self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>تحديد الكل كمقروء ({unreadCount})</span>
          </Button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'ALL'
                ? 'bg-[#082F49] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('SHIPMENT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'SHIPMENT'
                ? 'bg-[#082F49] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الشحنات
          </button>
          <button
            onClick={() => setFilterType('QUOTE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'QUOTE'
                ? 'bg-[#082F49] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            عروض الأسعار
          </button>
          <button
            onClick={() => setFilterType('DOCUMENT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'DOCUMENT'
                ? 'bg-[#082F49] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            المستندات
          </button>
          <button
            onClick={() => setFilterType('MESSAGE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'MESSAGE'
                ? 'bg-[#082F49] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الدعم الفني
          </button>

          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 mr-2 border-r pr-3 border-slate-300">
            <input
              type="checkbox"
              checked={filterUnreadOnly}
              onChange={(e) => setFilterUnreadOnly(e.target.checked)}
              className="rounded text-[#0F4C75] focus:ring-[#0F4C75]"
            />
            <span>غير المقروءة فقط ({unreadCount})</span>
          </label>
        </div>

        <Input
          placeholder="بحث في عنوان الإشعار أو تفاصيله..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-xs bg-slate-50"
        />
      </div>

      {/* Notifications List */}
      <Card>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-700">لا توجد إشعارات مطابقة</p>
            <p className="text-xs text-slate-400">ستظهر هنا جميع التنبيهات المحدثة فور وقوع أي تغييرات على طلباتك</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-amber-50/40 hover:bg-amber-50/70 border-r-4 border-r-[#EA580C]'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getNotificationBadge(notif.type)}
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" title="غير مقروء" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{notif.body}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {notif.relatedEntityId && (
                        <span className="font-mono text-slate-500 font-medium">
                          معرف المرجع: {notif.relatedEntityId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!notif.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      disabled={actioningId === notif.id}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-xs flex items-center gap-1"
                      title="تحديد كمقروء"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">تعيين كمقروء</span>
                    </button>
                  )}

                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-[#0F4C75] font-bold hover:bg-slate-100">
                    <span>متابعة</span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
