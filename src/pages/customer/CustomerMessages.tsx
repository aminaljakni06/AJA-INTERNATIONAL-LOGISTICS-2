import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  MessageCircle, 
  Paperclip, 
  Package, 
  CheckCheck, 
  Clock, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Download,
  AlertCircle,
  HelpCircle,
  Building2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { Shipment } from '../../types/shipment';
import { MessageDoc } from '../../types/firestore';

interface CustomerMessagesProps {
  onNavigate?: (tab: string) => void;
  initialShipmentId?: string;
}

export const CustomerMessages: React.FC<CustomerMessagesProps> = ({ onNavigate, initialShipmentId }) => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form State
  const [messageText, setMessageText] = useState('');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(initialShipmentId || '');
  const [attachment, setAttachment] = useState<{ base64: string; name: string; type: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const COMPANY_PHONE = '+442079460000';
  const COMPANY_WHATSAPP = '447700900000';

  const fetchData = async () => {
    if (!token) return;
    try {
      const [msgRes, shpRes] = await Promise.all([
        fetch('/api/customer/messages', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/shipments', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(Array.isArray(msgData) ? msgData : []);
      }
      if (shpRes.ok) {
        const shpData = await shpRes.json();
        setShipments(Array.isArray(shpData) ? shpData : []);
      }
    } catch (err) {
      console.error('Error fetching support data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'حجم الملف يجب ألا يتجاوز 5 ميجابايت' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        base64: reader.result as string,
        name: file.name,
        type: file.type,
      });
      setStatusMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !token) return;

    setSending(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/customer/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageText.trim(),
          shipmentId: selectedShipmentId || null,
          attachment: attachment?.base64 || null,
          attachmentName: attachment?.name || null,
          attachmentType: attachment?.type || null,
        }),
      });

      if (res.ok) {
        setMessageText('');
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setStatusMsg({ type: 'success', text: 'تم إرسال استفسارك بنجاح إلى فريق الدعم الفني!' });
        await fetchData();
      } else {
        const data = await res.json();
        setStatusMsg({ type: 'error', text: data.error || 'فشل إرسال الرسالة' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'خطأ في شبكة الاتصال' });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner label="جاري استدعاء محادثات الدعم والخدمات..." />;

  return (
    <div className="space-y-6">
      {/* Quick Contact & Action Bar */}
      <div className="bg-[#082F49] text-white p-6 rounded-2xl shadow-sm border border-[#0F4C75]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#EA580C]" />
              الدعم الفني والمساعدة المباشرة
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              تواصل مع موظفي شركة أجا اللوجستية لمتابعة شحناتك، الاستفسار عن المواعيد، أو طلب المساعدة الفورية
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Direct Phone Call */}
            <a
              href={`tel:${COMPANY_PHONE}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>اتصال مباشر</span>
            </a>

            {/* Direct WhatsApp Link */}
            <a
              href={`https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن الشحنات وخدمات شركة أجا اللوجستية')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat / Message Feed */}
        <div className="lg:col-span-2 space-y-4 flex flex-col h-[650px]">
          <Card title="محادثة الدعم والاستفسارات" className="flex-1 flex flex-col overflow-hidden p-0">
            {/* Messages Feed Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">لا توجد رسائل سابقة</p>
                  <p className="text-xs text-slate-500">
                    أرسل رسالتك الأولى أدناه وسيتلقاها فريق الدعم فوراً للرد عليك
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isCustomer = msg.senderRole === 'CUSTOMER' || msg.senderId === user?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 space-y-2 shadow-sm ${
                          isCustomer
                            ? 'bg-[#082F49] text-white rounded-tr-none border border-[#0F4C75]'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[11px] opacity-80 border-b border-white/10 pb-1">
                          <span className="font-bold">
                            {isCustomer ? user?.fullName || 'أنت' : 'فريق دعم شركة أجا اللوجستية 🎧'}
                          </span>
                          <span className="font-mono dir-ltr">
                            {new Date(msg.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                        {/* Associated Shipment Badge */}
                        {msg.shipmentId && (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                            isCustomer ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            <Package className="w-3 h-3" />
                            <span>الشحنة المرتبطة: {msg.shipmentId}</span>
                          </div>
                        )}

                        {/* Attachment Preview */}
                        {msg.attachment && (
                          <div className="pt-2">
                            {msg.attachmentType?.startsWith('image/') || msg.attachment.startsWith('data:image') ? (
                              <a href={msg.attachment} target="_blank" rel="noopener noreferrer" className="block mt-1">
                                <img
                                  src={msg.attachment}
                                  alt="مرفق"
                                  className="max-h-48 rounded-lg border border-white/20 object-contain bg-black/10"
                                />
                              </a>
                            ) : (
                              <a
                                href={msg.attachment}
                                download={msg.attachmentName || 'attachment'}
                                className={`inline-flex items-center gap-2 p-2 rounded-lg text-xs font-bold border ${
                                  isCustomer ? 'bg-slate-800/80 text-amber-300 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-200'
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                                <span className="truncate max-w-[150px]">{msg.attachmentName || 'تحميل المرفق'}</span>
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composition Input */}
            <div className="p-4 bg-white border-t border-slate-200 space-y-3">
              {statusMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center justify-between ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <span>{statusMsg.text}</span>
                  <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Attachment Badge Preview */}
              {attachment && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-amber-800 truncate">
                    <Paperclip className="w-4 h-4 shrink-0 text-amber-600" />
                    <span className="font-bold truncate">{attachment.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-amber-700 hover:text-rose-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="flex items-center gap-2">
                  {/* Related Shipment Dropdown */}
                  <div className="flex-1">
                    <select
                      value={selectedShipmentId}
                      onChange={(e) => setSelectedShipmentId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-[#0F4C75]"
                    >
                      <option value="">-- ربط الاستفسار بشحنة (اختياري) --</option>
                      {shipments.map((s) => (
                        <option key={s.id} value={s.id}>
                          📦 {s.trackingNumber} ({s.origin} → {s.destination})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Attachment File Input Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5 text-xs border-slate-300 text-slate-700 hover:bg-slate-100 shrink-0"
                    title="إرفاق صورة أو ملف"
                  >
                    <Paperclip className="w-4 h-4 text-[#0F4C75]" />
                    <span className="hidden sm:inline">إرفاق ملف</span>
                  </Button>
                </div>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="اكتب استفسارك أو ملاحظتك هنا ليصلك الرد المباشر من موظفي الدعم..."
                    required
                    className="flex-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#0F4C75] resize-none"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={sending}
                    className="bg-[#082F49] hover:bg-[#0F4C75] text-white font-bold px-5 shrink-0 self-end h-full gap-2 text-xs rounded-xl border border-[#0F4C75]"
                  >
                    <Send className="w-4 h-4 text-[#EA580C]" />
                    <span>إرسال</span>
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>

        {/* Support Direct Contacts Info Box */}
        <div className="space-y-6">
          <Card title="معلومات التواصل المباشر" className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                ساعات عمل خدمة العملاء
              </p>
              <p className="text-[11px] text-amber-800">
                من الأحد إلى الخميس: 8:00 صباحاً - 8:00 مساءً
              </p>
              <p className="text-[11px] text-amber-800">
                الجمعة والسبت: 2:00 ظهراً - 8:00 مساءً
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">الهاتف المجاني / الموحد (لندن)</p>
                  <p className="font-bold font-mono dir-ltr text-slate-900">+44 20 7946 0000</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">واتساب الدعم السريع</p>
                  <p className="font-bold font-mono dir-ltr text-slate-900">+44 7700 900000</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">البريد الإلكتروني للعمليات</p>
                  <p className="font-bold font-mono text-slate-900">support@ajalogistics.com</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
