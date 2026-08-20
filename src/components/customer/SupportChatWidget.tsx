import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Phone,
  MessageCircle,
  Package,
  CheckCheck,
  Headphones,
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
  UserCheck,
  Building2,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { MessageDoc, NotificationDoc } from '../../types/firestore';
import { Shipment } from '../../types/shipment';

interface SupportChatWidgetProps {
  onNavigate?: (tab: string, entityId?: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({
  onNavigate,
  isOpen: externalIsOpen,
  onClose,
}) => {
  const { token, user } = useAuth();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Form & Selection State
  const [inputMessage, setInputMessage] = useState('');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>('');
  const [attachment, setAttachment] = useState<{ base64: string; name: string; type: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  const AGENT_NAME = isAr ? 'م. عمر الفارسي' : 'Eng. Omar Al-Farsi';
  const AGENT_TITLE = isAr ? 'أخصائي العمليات اللوجستية الميدانية' : 'Lead Logistics Operations Specialist';
  const COMPANY_PHONE = '+442079460000';
  const COMPANY_WHATSAPP = '447700900000';

  // Play subtle web audio notification chime
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // AudioContext might be blocked until user interacts
    }
  };

  // Fetch messages & shipments
  const fetchMessagesAndShipments = async () => {
    if (!token) return;
    try {
      const [msgRes, shpRes] = await Promise.all([
        fetch('/api/customer/messages', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/shipments', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (msgRes.ok) {
        const msgData = await msgRes.json();
        const msgArray: MessageDoc[] = Array.isArray(msgData) ? msgData : [];
        
        // Count unread staff messages
        const unreadStaff = msgArray.filter(
          (m) => m.senderRole !== 'CUSTOMER' && m.status !== 'READ'
        ).length;
        setUnreadCount(unreadStaff);

        // If new staff message arrived while sound enabled
        if (msgArray.length > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
          const newest = msgArray[msgArray.length - 1];
          if (newest && newest.senderRole !== 'CUSTOMER') {
            playNotificationSound();
          }
        }
        lastMessageCountRef.current = msgArray.length;
        setMessages(msgArray);
      }

      if (shpRes.ok) {
        const shpData = await shpRes.json();
        setShipments(Array.isArray(shpData) ? shpData : []);
      }
    } catch (err) {
      console.error('Error polling chat widget data:', err);
    }
  };

  // Poll every 4s when open, 10s when closed
  useEffect(() => {
    fetchMessagesAndShipments();
    const interval = setInterval(fetchMessagesAndShipments, isOpen ? 4000 : 10000);
    return () => clearInterval(interval);
  }, [token, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, agentTyping]);

  // Handle File Upload Attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(isAr ? 'حجم الملف يجب ألا يتجاوز 5 ميجابايت' : 'File size must not exceed 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        base64: reader.result as string,
        name: file.name,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || inputMessage;
    if (!messageContent.trim() || sending || !token) return;

    setSending(true);
    setInputMessage('');

    try {
      const res = await fetch('/api/customer/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageContent.trim(),
          shipmentId: selectedShipmentId || undefined,
          attachment: attachment?.base64,
          attachmentName: attachment?.name,
          attachmentType: attachment?.type,
          isLiveWidget: true,
          triggerAgentResponse: true,
        }),
      });

      if (res.ok) {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setAgentTyping(true);

        // Fetch refreshed messages
        await fetchMessagesAndShipments();

        // Simulate agent typing indicator before reply arrives
        setTimeout(() => {
          setAgentTyping(false);
          fetchMessagesAndShipments();
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to send support message:', err);
    } finally {
      setSending(false);
    }
  };

  const toggleOpen = () => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(!internalIsOpen);
    } else if (onClose && externalIsOpen) {
      onClose();
    }
  };

  const selectedShipmentObj = shipments.find((s) => s.id === selectedShipmentId);

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 z-[1100] group cursor-pointer flex items-center gap-3 p-3.5 rounded-full bg-gradient-to-r from-[#00F0FF] via-sky-500 to-indigo-600 text-slate-950 font-extrabold shadow-[0_0_35px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.7)] transition-all duration-300 transform hover:scale-105 active:scale-95"
          title={isAr ? 'التواصل المباشر مع أخصائي الدعم اللوجستي' : 'Chat with Logistics Agent'}
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>

          <span className="hidden sm:inline-block font-extrabold text-xs tracking-tight text-slate-950 pl-1 pr-1">
            {isAr ? 'دعم العمليات اللوجستية' : 'Logistics Support'}
          </span>

          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black font-mono shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </motion.button>
      )}

      {/* Expanded Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-[1100] w-[calc(100vw-24px)] sm:w-[430px] h-[600px] max-h-[85vh] flex flex-col rounded-3xl border border-sky-500/30 bg-slate-950/95 backdrop-blur-2xl text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 border-b border-sky-500/20 p-3.5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                {/* Agent Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-[#00F0FF]">
                      <Headphones className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 shadow" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white">{AGENT_NAME}</h4>
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-mono">
                      {isAr ? 'متصل الآن' : 'Online'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                    {AGENT_TITLE}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title={soundEnabled ? (isAr ? 'كتم التنبيهات' : 'Mute sound') : (isAr ? 'تفعيل التنبيهات' : 'Unmute sound')}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00F0FF]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                </button>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('customer-messages');
                      toggleOpen();
                    }}
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-[#00F0FF] transition-colors cursor-pointer"
                    title={isAr ? 'فتح العرض الكامل للرسائل' : 'Open full messages view'}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleOpen}
                  className="p-1.5 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  title={isAr ? 'إغلاق المحادثة' : 'Close chat'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Contact & Shipment Selector Bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 p-2.5 px-3 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#00F0FF]" />
                  {isAr ? 'الشحنة المرتبطةبالاستفسار:' : 'Related Shipment:'}
                </span>

                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${COMPANY_PHONE}`}
                    className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{isAr ? 'اتصال مباشر' : 'Call Staff'}</span>
                  </a>
                  <a
                    href={`https://wa.me/${COMPANY_WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>

              <select
                value={selectedShipmentId}
                onChange={(e) => setSelectedShipmentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#00F0FF] rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none cursor-pointer"
              >
                <option value="">{isAr ? 'استفسار عام عن الخدمات اللوجستية' : 'General Logistics Inquiry'}</option>
                {shipments.map((shp) => (
                  <option key={shp.id} value={shp.id}>
                    #{shp.trackingNumber} - {shp.origin} {isAr ? 'إلى' : 'to'} {shp.destination} ({shp.status})
                  </option>
                ))}
              </select>

              {selectedShipmentObj && (
                <div className="flex items-center justify-between px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-lg text-[10px] font-mono text-sky-300">
                  <span>{isAr ? 'الحالة الحالية:' : 'Status:'} {selectedShipmentObj.status}</span>
                  <span>{selectedShipmentObj.trackingNumber}</span>
                </div>
              )}
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans">
              {messages.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-[#00F0FF] flex items-center justify-center mx-auto border border-sky-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      {isAr ? 'أهلاً بك في الدعم المباشر لشركة أجا' : 'Welcome to Aja Live Support'}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[260px] mx-auto">
                      {isAr
                        ? 'تواصل مباشرةً مع أخصائي العمليات لمتابعة الشحنات، الجمارك، والمستندات.'
                        : 'Connect directly with our logistics team for tracking, customs, and quotes.'}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderRole === 'CUSTOMER';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span className="font-bold text-slate-300">
                          {isMe ? (isAr ? 'أنت' : 'You') : AGENT_NAME}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 shadow-md ${
                          isMe
                            ? 'bg-gradient-to-br from-sky-600 to-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>

                        {/* Attachment Preview if exists */}
                        {msg.attachment && (
                          <div className="pt-2 border-t border-white/10">
                            {msg.attachmentType?.startsWith('image/') ? (
                              <img
                                src={msg.attachment}
                                alt={msg.attachmentName || 'Attachment'}
                                className="max-h-36 rounded-xl object-cover border border-white/20"
                              />
                            ) : (
                              <a
                                href={msg.attachment}
                                download={msg.attachmentName || 'document'}
                                className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-sky-300 border border-sky-500/30 text-[11px] font-mono transition-colors"
                              >
                                <FileText className="w-4 h-4 shrink-0" />
                                <span className="truncate">{msg.attachmentName || 'تحميل المستند'}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Read Status */}
                      {isMe && (
                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                          <CheckCheck className="w-3 h-3 text-[#00F0FF]" />
                          <span>{msg.status === 'READ' ? (isAr ? 'تمت القراءة' : 'Read') : (isAr ? 'تم الإرسال' : 'Sent')}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Agent Typing Animation */}
              {agentTyping && (
                <div className="flex items-center gap-2 text-xs text-sky-300 bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl w-fit">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {isAr ? `${AGENT_NAME} يكتب الرد...` : `${AGENT_NAME} is typing...`}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-1.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none text-[10px]">
              <button
                type="button"
                onClick={() => handleSendMessage(isAr ? 'أين موقع شحنتي الجارية؟' : 'Where is my active shipment?')}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
              >
                📦 {isAr ? 'موقع الشحنة' : 'Shipment Location'}
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage(isAr ? 'ما حالة التخليص الجمركي؟' : 'Customs clearance status?')}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
              >
                🛃 {isAr ? 'حالة الجمارك' : 'Customs Status'}
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage(isAr ? 'طلب تعديل عنوان التسليم النهائي' : 'Request delivery address change')}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
              >
                📍 {isAr ? 'تعديل العنوان' : 'Change Address'}
              </button>
            </div>

            {/* Attachment Preview Chip */}
            {attachment && (
              <div className="px-3 py-1.5 bg-sky-950/80 border-t border-sky-500/30 flex items-center justify-between text-xs text-sky-200">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span className="truncate font-mono text-[11px]">{attachment.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="p-1 hover:bg-sky-900 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input & Controls Footer */}
            <div className="p-3 bg-slate-950 border-t border-sky-500/20 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-[#00F0FF] border border-slate-800 transition-colors cursor-pointer"
                  title={isAr ? 'إرفاق مستند أو صورة' : 'Attach document/image'}
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={isAr ? 'اكتب رسالتك لأخصائي الدعم...' : 'Type message to logistics agent...'}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-[#00F0FF] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                />

                <button
                  type="submit"
                  disabled={(!inputMessage.trim() && !attachment) || sending}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-sky-500 text-slate-950 font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
