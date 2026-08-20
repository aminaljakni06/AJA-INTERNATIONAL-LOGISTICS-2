import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Lock,
  Sparkles,
  Zap,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export interface RecurringProfile {
  id: string;
  userId: string;
  recurringDetailReference: string;
  variant: 'mada' | 'visa' | 'mc' | 'scheme';
  cardLastFour: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  billingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'AUTO_INVOICE';
  maxAutoChargeLimit: number;
  autoDebitEnabled: boolean;
  createdAt: string;
  lastChargedAt?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
}

export interface RecurringBillingManagerProps {
  onProfileSelected?: (profile: RecurringProfile) => void;
  className?: string;
}

export const RecurringBillingManager: React.FC<RecurringBillingManagerProps> = ({
  onProfileSelected,
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { token, user } = useAuth();

  const [profiles, setProfiles] = useState<RecurringProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Profile Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.fullName || '');
  const [expiry, setExpiry] = useState('');
  const [variant, setVariant] = useState<'mada' | 'visa'>('mada');
  const [billingFrequency, setBillingFrequency] = useState<'AUTO_INVOICE' | 'MONTHLY'>('AUTO_INVOICE');
  const [maxAutoChargeLimit, setMaxAutoChargeLimit] = useState(25000);
  const [isSaving, setIsSaving] = useState(false);

  // Charge simulation state
  const [chargingId, setChargingId] = useState<string | null>(null);
  const [chargeSuccessMsg, setChargeSuccessMsg] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/adyen/recurring/methods', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setProfiles(data.profiles || []);
      } else {
        setError(data.error || 'Failed to fetch recurring profiles');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading recurring payment profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [token]);

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cardHolder) {
      setError(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/adyen/recurring/tokenize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          cardNumber,
          cardHolder,
          expiry,
          variant,
          billingFrequency,
          maxAutoChargeLimit,
          autoDebitEnabled: true,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCardNumber('');
        setExpiry('');
        setShowAddForm(false);
        fetchProfiles();
      } else {
        setError(data.error || 'Failed to save recurring payment profile');
      }
    } catch (err: any) {
      setError(err.message || 'Error tokenizing payment card');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/payments/adyen/recurring/methods/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting recurring profile:', err);
    }
  };

  const handleTestAutoCharge = async (profile: RecurringProfile) => {
    setChargingId(profile.id);
    setChargeSuccessMsg(null);
    setError(null);

    try {
      const res = await fetch('/api/payments/adyen/recurring/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          profileId: profile.id,
          amount: 4500,
          currency: 'SAR',
          invoiceNumber: `INV-MONTHLY-${Date.now().toString().slice(-6)}`,
          description: 'Monthly Logistics Contract Auto-Debit via Adyen',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setChargeSuccessMsg(
          isAr
            ? `تم الخصم الآلي للفاتورة الشهري بنجاح! مرجع Adyen: ${data.pspReference}`
            : `Monthly invoice charged via recurring token! Adyen Ref: ${data.pspReference}`
        );
        fetchProfiles();
      } else {
        setError(data.error || 'Auto charge failed');
      }
    } catch (err: any) {
      setError(err.message || 'Auto charge error');
    } finally {
      setChargingId(null);
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-2xl ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#082F49] border border-[#00F0FF]/30 text-[#00F0FF] flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {isAr ? 'حسابات وسداد الفواتير الكبار للشركات' : 'Enterprise Recurring Billing'}
              </h3>
              <span className="px-2 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-full text-[10px] font-mono font-bold">
                Adyen Vault Tokenized
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'إدارة بطاقات مدى والائتمانية المشفرة للسداد الآلي المباشر للفواتير والشحنات الشهرية.'
                : 'Secure tokenized recurring profiles for automatic monthly logistics invoice debiting.'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#00F0FF] text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 hover:brightness-110 shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة بطاقة سداد دوري' : 'Add Recurring Profile'}</span>
        </Button>
      </div>

      {/* Alert / Error Messages */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {chargeSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{chargeSuccessMsg}</span>
        </div>
      )}

      {/* Add New Recurring Method Form */}
      {showAddForm && (
        <form onSubmit={handleSaveToken} className="p-5 bg-slate-950 rounded-2xl border border-[#00F0FF]/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-[#00F0FF] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              {isAr ? 'حفظ بطاقة جديدة في Adyen Token Vault' : 'Add Card to Encrypted Token Vault'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">PCI-DSS Tokenized</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Payment Variant (MADA vs Visa) */}
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">{isAr ? 'نوع البطاقة:' : 'Card Type:'}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVariant('mada')}
                  className={`flex-1 p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                    variant === 'mada'
                      ? 'bg-[#082F49] border-[#00F0FF] text-[#00F0FF]'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {isAr ? 'بطاقة مدى MADA' : 'MADA Card'}
                </button>
                <button
                  type="button"
                  onClick={() => setVariant('visa')}
                  className={`flex-1 p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                    variant === 'visa'
                      ? 'bg-[#082F49] border-[#00F0FF] text-[#00F0FF]'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Visa / MasterCard
                </button>
              </div>
            </div>

            {/* Card Holder */}
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">{isAr ? 'اسم الشركة / حامل البطاقة:' : 'Cardholder / Company Name:'}</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="AJA Enterprise Corp"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:border-[#00F0FF] focus:outline-none"
              />
            </div>

            {/* Card Number */}
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">{isAr ? 'رقم البطاقة:' : 'Card Number:'}</label>
              <input
                type="text"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="5888 4000 1234 8845"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:border-[#00F0FF] focus:outline-none"
              />
            </div>

            {/* Expiry & Limit */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">{isAr ? 'تاريخ الانتهاء:' : 'Expiry (MM/YY):'}</label>
                <input
                  type="text"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="12/28"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">{isAr ? 'سقف الخصم الآلي:' : 'Auto Limit (SAR):'}</label>
                <input
                  type="number"
                  value={maxAutoChargeLimit}
                  onChange={(e) => setMaxAutoChargeLimit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{isAr ? 'تشفير وحفظ الملف الدوري' : 'Save Encrypted Profile'}</span>
            </Button>
          </div>
        </form>
      )}

      {/* Profile List */}
      {loading ? (
        <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#00F0FF]" />
          <span>{isAr ? 'جاري جلب ملحقات السداد الدوري...' : 'Loading recurring profiles...'}</span>
        </div>
      ) : profiles.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl space-y-2">
          <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">
            {isAr ? 'لا توجد بطاقات سداد دوري مسجلة حالياً للشركات.' : 'No active recurring profiles found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                  <CreditCard className={`w-5 h-5 ${profile.variant === 'mada' ? 'text-emerald-400' : 'text-sky-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-white text-sm">
                      •••• •••• •••• {profile.cardLastFour}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                      {profile.variant}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                      {profile.billingFrequency}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>{profile.cardHolder}</span>
                    <span>•</span>
                    <span>{isAr ? 'ينتهي:' : 'Exp:'} {profile.expiryMonth}/{profile.expiryYear}</span>
                    <span>•</span>
                    <span className="text-[#00F0FF]">{isAr ? 'السقف:' : 'Limit:'} {profile.maxAutoChargeLimit.toLocaleString()} SAR</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  onClick={() => handleTestAutoCharge(profile)}
                  disabled={chargingId === profile.id}
                  className="bg-[#082F49] hover:bg-[#00F0FF] text-[#00F0FF] hover:text-slate-950 border border-[#00F0FF]/30 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {chargingId === profile.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span>{isAr ? 'خصم شهري آلي (تجربة)' : 'Debit Monthly Invoice'}</span>
                </Button>

                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-900"
                  title={isAr ? 'إزالة البطاقة' : 'Remove Profile'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
