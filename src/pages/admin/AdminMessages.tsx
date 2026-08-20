import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  Building, 
  RefreshCw, 
  AlertCircle,
  Paperclip,
  FileText,
  Download,
  Package,
  Check
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

interface MessageItem {
  id: string;
  customerId: string;
  senderId: string;
  senderRole?: string;
  message: string;
  shipmentId?: string;
  attachment?: string;
  attachmentName?: string;
  attachmentType?: string;
  status: string;
  createdAt: string;
  customer?: {
    displayName: string;
    email: string;
    phone?: string;
    companyName?: string;
  };
}

export const AdminMessages: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply State
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMessages = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [token]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !replyText.trim() || !token) return;

    setSendingReply(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/admin/messages/${selectedCustomer.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          replyMessage: replyText.trim(),
        }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', message: 'تم إرسال الرد المباشر للعميل بنجاح وتحديث الحالة.' });
        setReplyText('');
        fetchMessages();
      } else {
        setStatusMsg({ type: 'error', message: 'فشل إرسال الرد' });
      }
    } catch {
      setStatusMsg({ type: 'error', message: 'حدث خطأ في الاتصال بالشبكة' });
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!token || !window.confirm('هل أنت تأكد من رغبتك في حذف هذه الرسالة من السجل؟')) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner label="جاري استدعاء رسائل الدعم الفني والاستفسارات..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            مركز رسائل الدعم الفني وتواصل العملاء
          </h2>
          <p className="text-xs text-slate-300">مراجعة استفسارات العملاء، المستندات المرفقة، الردود المباشرة، وإدارة الرسائل</p>
        </div>
        <Button onClick={fetchMessages} variant="outline" size="sm" className="gap-2 text-slate-200 border-slate-600 self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" />
          تحديث الرسائل
        </Button>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2 space-y-4">
          {messages.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 text-center py-12 text-slate-400 text-xs">
              لا توجد رسائل دعم أو استفسارات حتى الآن.
            </Card>
          ) : (
            messages.map((msg) => {
              const isAdminSender = msg.senderRole === 'STAFF' || msg.senderRole === 'ADMIN' || msg.senderId.startsWith('staff_') || msg.senderId.startsWith('admin_');

              return (
                <Card
                  key={msg.id}
                  className={`bg-slate-800 border ${
                    isAdminSender ? 'border-amber-500/30 bg-amber-950/10' : 'border-slate-700'
                  } text-slate-100 space-y-3`}
                >
                  <div className="flex items-start justify-between border-b border-slate-700/60 pb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#082F49] text-white font-bold flex items-center justify-center text-xs border border-[#0F4C75]">
                        {msg.customer?.displayName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-white">
                            {msg.customer?.displayName || `عميل (${msg.customerId})`}
                          </p>
                          {msg.customer?.companyName && (
                            <span className="text-[10px] font-semibold bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                              {msg.customer.companyName}
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            isAdminSender ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                          }`}>
                            {isAdminSender ? 'رد الفريق' : 'رسالة عميل'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {msg.customer?.email} {msg.customer?.phone ? `| ${msg.customer.phone}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleString('ar-SA')}
                      </span>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors rounded-lg hover:bg-slate-700"
                        title="حذف الرسالة من السجل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Message Body */}
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  {/* Related Shipment Badge */}
                  {msg.shipmentId && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/40 border border-amber-500/30 text-amber-300 rounded-lg text-[11px] font-mono">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span>الشحنة المرتبطة: {msg.shipmentId}</span>
                    </div>
                  )}

                  {/* Attachment Preview */}
                  {msg.attachment && (
                    <div className="pt-1">
                      {msg.attachmentType?.startsWith('image/') || msg.attachment.startsWith('data:image') ? (
                        <a href={msg.attachment} target="_blank" rel="noopener noreferrer" className="inline-block">
                          <img
                            src={msg.attachment}
                            alt="مرفق العميل"
                            className="max-h-40 rounded-xl border border-slate-700 object-contain bg-slate-900/60 p-1"
                          />
                        </a>
                      ) : (
                        <a
                          href={msg.attachment}
                          download={msg.attachmentName || 'attachment'}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 text-amber-300 rounded-xl text-xs font-bold hover:bg-slate-950"
                        >
                          <FileText className="w-4 h-4 text-amber-400" />
                          <span className="truncate max-w-[200px]">{msg.attachmentName || 'تحميل المستند المرفق'}</span>
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Reply Action */}
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedCustomer({
                          id: msg.customerId,
                          name: msg.customer?.displayName || msg.customerId,
                        })
                      }
                      className="text-xs gap-1.5 border-slate-600 text-amber-300 hover:bg-slate-700"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>رد على العميل</span>
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Reply Box Sidebar */}
        <div>
          <Card title="إرسال رد موجه للعميل" className="bg-slate-800 border-slate-700 text-slate-100 sticky top-6">
            {selectedCustomer ? (
              <form onSubmit={handleSendReply} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                  <p className="font-bold text-amber-400">توجيه الرد إلى العميل:</p>
                  <p className="text-slate-100 font-bold text-sm">{selectedCustomer.name}</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">محتوى نص الرد *</label>
                  <textarea
                    rows={6}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب رد فريق الدعم والعمليات الذي سيصل للعميل كإشعار ورسالة في حسابه..."
                    required
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" variant="secondary" isLoading={sendingReply} className="flex-1 gap-2 text-xs">
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال الرد</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs border-slate-600 text-slate-300"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-500" />
                <p className="font-bold text-slate-300">رد مباشر على العميل</p>
                <p>اختر أي رسالة من القائمة بالضغط على "رد على العميل" لفتح شباك الكتابة الفورية.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
