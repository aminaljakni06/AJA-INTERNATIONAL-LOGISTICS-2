import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check, Share } from 'lucide-react';
import { Button } from './Button';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const inStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (inStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Listen for beforeinstallprompt on Android/Chrome/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS tip if on iOS and not dismissed before
    const iosDismissed = localStorage.getItem('aja_pwa_ios_dismissed');
    if (iosDevice && !iosDismissed) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('aja_pwa_ios_dismissed', 'true');
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-[#082F49] text-white p-4 rounded-2xl shadow-2xl border border-[#0F4C75] animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0F4C75] text-white flex items-center justify-center shrink-0 border border-[#0F4C75]">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>تثبيت تطبيق أجا اللوجستية</span>
              <span className="bg-[#0F4C75] text-white text-[10px] px-2 py-0.5 rounded-full border border-[#0F4C75]">PWA App</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              احصل على تجربة سريعة مع متابعة الشحنات والإشعارات مباشرة من شاشة هاتفك
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
        {isIOS ? (
          <div className="text-[11px] text-slate-200 flex items-center gap-1.5 w-full bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <Share className="w-4 h-4 text-sky-400 shrink-0" />
            <span>اضغط على زر المشاركة <strong className="text-white">Share</strong> ثم اختر <strong className="text-white">"إضافة إلى الشاشة الرئيسية"</strong></span>
          </div>
        ) : (
          <>
            <span className="text-[11px] text-slate-300 font-medium">جاهز للتثبيت بنقرة واحدة</span>
            <Button
              onClick={handleInstallClick}
              variant="primary"
              size="sm"
              className="bg-[#0F4C75] hover:bg-[#082F49] text-white font-black text-xs gap-1.5 px-4 rounded-xl shadow-md border border-[#0F4C75]"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت الآن</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
