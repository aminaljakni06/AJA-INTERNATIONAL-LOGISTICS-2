import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, Package, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

interface UserOption {
  id: string;
  displayName: string;
  email: string;
}

export const AdminNotifications: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form State
  const [recipientUserId, setRecipientUserId] = useState<string>('ALL');
  const [type, setType] = useState<string>('GENERAL');
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [relatedEntityId, setRelatedEntityId] = useState<string>('');

  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/customers', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoadingUsers(false));
  }, [token]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title.trim() || !body.trim()) return;

    setSending(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientUserId,
          type,
          title: title.trim(),
          body: body.trim(),
          relatedEntityId: relatedEntityId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMsg({ type: 'error', message: data.error || 'فشل إرسال الإشعار' });
      } else {
        setStatusMsg({
          type: 'success',
          message:
            recipientUserId === 'ALL'
              ? `تم إرسال الإشعار التنبيهي العام إلى جميع العملاء (${data.count || ''}) بنجاح.`
              : 'تم إرسال الإشعار المباشر للعميل المحدد بنجاح.',
        });
        setTitle('');
        setBody('');
        setRelatedEntityId('');
      }
    } catch {
      setStatusMsg({ type: 'error', message: 'حدث خطأ أثناء التواصل مع سيرفر الإشعارات' });
    } finally {
      setSending(false);
    }
  };

  if (loadingUsers) return <LoadingSpinner label="جاري تحضير مركز الإشعارات والعملاء..." />;

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-700">
        <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          مركز بث وتوجيه الإشعارات للعملاء
        </h2>
        <p className="text-xs text-slate-300">إرسال تنبيهات مباشرة لشحنات معينة، إشعارات عروض الأسعار، أو إعلانات عامة لجميع العملاء</p>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Form */}
        <Card className="lg:col-span-2 bg-slate-800 border-slate-700 text-slate-100">
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">المستلم الموجه له الإشعار *</label>
                <select
                  value={recipientUserId}
                  onChange={(e) => setRecipientUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-amber-400"
                >
                  <option value="ALL">جميع العملاء المسجلين (عام - Broadcast)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <Select
                label="نوع وتصنيف الإشعار *"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'GENERAL', label: 'عام / إعلان للعميل (GENERAL)' },
                  { value: 'SHIPMENT', label: 'تحديث متعلق بشحنة (SHIPMENT)' },
                  { value: 'QUOTE', label: 'تحديث عرض سعر (QUOTE)' },
                ]}
                className="bg-slate-900 border-slate-700 text-white text-xs"
              />
            </div>

            <Input
              label="عنوان الإشعار *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تحديث أمني هام أو تم شحن حاويتك بنجاح"
              required
              className="bg-slate-900 border-slate-700 text-white text-xs placeholder-slate-500"
            />

            <Input
              label="معرف الشحنة أو طلب السعر المرتبط (اختياري)"
              value={relatedEntityId}
              onChange={(e) => setRelatedEntityId(e.target.value)}
              placeholder="مثال: AJA-891204-KSA أو REQ-90123"
              className="bg-slate-900 border-slate-700 text-white text-xs placeholder-slate-500"
            />

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">نص ومحتوى الإشعار التفصيلي *</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-400"
                placeholder="أدخل النص المباشر الذي سيظهر في جرس إشعارات العميل..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="secondary" isLoading={sending} className="gap-2 font-bold text-xs">
                <Send className="w-4 h-4" />
                <span>إرسال الإشعار الآن</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Guide */}
        <div className="space-y-4">
          <Card title="إرشادات نظام التنبيهات" className="bg-slate-800 border-slate-700 text-slate-100">
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700 space-y-1">
                <p className="font-bold text-amber-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  إشعار عام (Broadcast)
                </p>
                <p className="text-[11px] text-slate-400">يظهر فوراً في لوحة التحكم والتطبيق لجميع العملاء المسجلين.</p>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700 space-y-1">
                <p className="font-bold text-blue-400 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  إشعار شحنة مخصصة
                </p>
                <p className="text-[11px] text-slate-400">يربط التنبيه برقم تتبع الشحنة مع إمكانية تحويل العميل لمتابعتها مباشرة.</p>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700 space-y-1">
                <p className="font-bold text-emerald-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  إشعار عرض سعر
                </p>
                <p className="text-[11px] text-slate-400">ينبه العميل فور استكمال تسعير طلباته أو تحديث العروض.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
