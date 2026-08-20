import React, { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAr = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await register(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.error || (isAr ? 'فشل إنشاء الحساب' : 'Registration failed'));
    } else {
      onNavigate('customer-dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card className="p-6 sm:p-8 space-y-6 shadow-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B172A]">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-amber-500 text-slate-900 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.auth.registerTitle}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.auth.registerDesc}</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={`${t.auth.fullName} *`}
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder={isAr ? 'عبد الله الشمري' : 'John Doe'}
            required
          />

          <Input
            label={`${t.auth.companyName} (${isAr ? 'اختياري' : 'Optional'})`}
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder={isAr ? 'شركة النجاح اللوجستية' : 'Al-Najah Trading Co.'}
          />

          <Input
            label={`${t.auth.email} *`}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@example.com"
            required
          />

          <Input
            label={`${t.auth.phone} *`}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0500000000"
            required
          />

          <Input
            label={`${t.auth.password} *`}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
          />

          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full justify-center font-bold">
            {t.auth.registerBtn}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-2">
          <span>{t.auth.haveAccount} </span>
          <button onClick={() => onNavigate('login')} className="text-[#0EA5E9] dark:text-[#00F0FF] font-extrabold hover:underline cursor-pointer">
            {t.auth.loginBtn}
          </button>
        </div>
      </Card>
    </div>
  );
};
