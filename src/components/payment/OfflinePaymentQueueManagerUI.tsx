import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  WifiOff,
  Wifi,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { offlinePaymentQueue, QueuedPaymentTransaction } from '../../utils/offlinePaymentQueue';

interface OfflinePaymentQueueManagerUIProps {
  className?: string;
}

export const OfflinePaymentQueueManagerUI: React.FC<OfflinePaymentQueueManagerUIProps> = ({
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { token } = useAuth();

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queue, setQueue] = useState<QueuedPaymentTransaction[]>([]);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncResultMsg, setSyncResultMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleManualSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = offlinePaymentQueue.subscribe((updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [token]);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncResultMsg(null);
    try {
      const res = await offlinePaymentQueue.autoSyncQueue(token || undefined);
      if (res.synced > 0 || res.failed > 0) {
        setSyncResultMsg(
          isAr
            ? `تمت المزامنة بنجاح: ${res.synced} معاملة (فشل: ${res.failed})`
            : `Synced: ${res.synced} transaction(s) (Failed: ${res.failed})`
        );
      }
    } catch (e: any) {
      setSyncResultMsg(isAr ? 'فشلت عملية المزامنة. يرجى إعادة المحاولة.' : 'Sync process failed. Please retry.');
    } finally {
      setSyncing(false);
    }
  };

  const pendingItems = queue.filter((tx) => tx.status === 'QUEUED' || tx.status === 'FAILED' || tx.status === 'SYNCING');
  const syncedItems = queue.filter((tx) => tx.status === 'SYNCED');

  if (queue.length === 0 && isOnline) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Network Status Banner */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between text-amber-200 text-xs shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 animate-pulse">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>{isAr ? 'وضع عدم الاتصال بالإنترنت (Offline Mode)' : 'Offline Connectivity Mode Active'}</span>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed mt-0.5">
                {isAr
                  ? 'يمكنك متابعة بدء الدفع بأمان. سيتم تخزين المعاملة ومزامنتها تلقائياً مع بوابة Adyen فور إعادة الاتصال.'
                  : 'You can initiate payments securely offline. Transactions are queued and automatically synced to Adyen once connected.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Online Back Alert Toast */}
      {isOnline && pendingItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between text-emerald-200 text-xs shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                {isAr ? 'تم استعادة الاتصال بالإنترنت' : 'Internet Connection Restored'}
              </span>
              <span className="text-[10px] text-emerald-300/80">
                {isAr
                  ? `توجد (${pendingItems.length}) معاملة في قائمة الانتظار جاهزة للمزامنة الفورية.`
                  : `${pendingItems.length} queued transaction(s) ready for instant Adyen sync.`}
              </span>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-[11px] flex items-center gap-1.5 hover:shadow-lg disabled:opacity-50 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'مزامنة الآن' : 'Sync Now'}</span>
          </button>
        </motion.div>
      )}

      {/* Sync Result Feedback */}
      {syncResultMsg && (
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-2.5 text-xs text-sky-200 flex items-center justify-between">
          <span className="font-mono">{syncResultMsg}</span>
          <button
            onClick={() => setSyncResultMsg(null)}
            className="text-slate-400 hover:text-white text-[10px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Queued Items Drawer Header */}
      {queue.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full p-3.5 flex items-center justify-between text-xs text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 font-bold">
              <Layers className="w-4 h-4 text-[#00F0FF]" />
              <span>
                {isAr
                  ? `قائمة انتظار المدفوعات غير المتصلة (${pendingItems.length} معلقة / ${syncedItems.length} مكتملة)`
                  : `Offline Payment Queue (${pendingItems.length} Pending / ${syncedItems.length} Synced)`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {pendingItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold animate-pulse">
                  {pendingItems.length} {isAr ? 'معلقة' : 'Pending'}
                </span>
              )}
              {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {/* Expanded Queue Item Cards */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-800 p-3 space-y-2 bg-slate-950/60"
              >
                {queue.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl border bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-slate-800"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-black text-white">{tx.amount.toLocaleString()} {tx.currency}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-sky-400 font-bold">{tx.referenceNumber}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 uppercase">{tx.paymentMethod}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(tx.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}</span>
                        {tx.retryCount > 0 && (
                          <span className="text-amber-400">({isAr ? `محاولات: ${tx.retryCount}` : `Retries: ${tx.retryCount}`})</span>
                        )}
                      </div>

                      {tx.lastErrorMessage && (
                        <p className="text-[10px] text-red-400 font-mono truncate max-w-md">
                          ⚠️ {tx.lastErrorMessage}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {tx.status === 'QUEUED' && (
                        <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {isAr ? 'في الانتظار' : 'Queued'}
                        </span>
                      )}

                      {tx.status === 'SYNCING' && (
                        <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 text-[10px] font-mono flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-3 h-3 text-[#00F0FF] animate-spin" />
                          {isAr ? 'جاري المزامنة...' : 'Syncing...'}
                        </span>
                      )}

                      {tx.status === 'SYNCED' && (
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {isAr ? 'تمت المزامنة' : 'Synced'}
                        </span>
                      )}

                      {tx.status === 'FAILED' && (
                        <span className="px-2 py-1 rounded bg-red-500/10 text-red-300 border border-red-500/30 text-[10px] font-mono flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          {isAr ? 'فشلت المزامنة' : 'Failed'}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => offlinePaymentQueue.removeTransaction(tx.id)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                        title={isAr ? 'حذف من الانتظار' : 'Remove from queue'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => offlinePaymentQueue.clearSynced()}
                    className="text-slate-400 hover:text-white font-mono"
                  >
                    {isAr ? 'تنظيف المعاملات المكتملة' : 'Clear Synced Items'}
                  </button>

                  <button
                    onClick={handleManualSync}
                    disabled={syncing || pendingItems.length === 0}
                    className="px-3 py-1 rounded-lg bg-sky-500/20 text-[#00F0FF] border border-sky-500/40 font-bold hover:bg-sky-500/30 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{isAr ? 'إعادة المحاولة للجميع' : 'Retry Sync All'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
