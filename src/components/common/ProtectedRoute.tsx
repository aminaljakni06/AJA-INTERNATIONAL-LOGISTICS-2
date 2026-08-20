import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import { LoadingSpinner } from './LoadingSpinner';
import { Card } from './Card';
import { Button } from './Button';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  onNavigate?: (tab: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  onNavigate,
}) => {
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Case 1: Unauthenticated user
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-4">
        <Card className="text-center p-8 border-amber-200 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {isAr ? 'تسجيل الدخول مطلوب' : 'Authentication Required'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {isAr
              ? 'يجب تسجيل الدخول بالبريد الإلكتروني وكلمة المرور للوصول إلى هذه الصفحة في بوابة شركة أجا للخدمات اللوجستية.'
              : 'You must log in to access this area of the Aja Logistics Portal.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {onNavigate && (
              <Button onClick={() => onNavigate('login')} variant="primary" className="gap-2">
                {isAr ? 'تسجيل الدخول الآن' : 'Log In Now'}
                <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </Button>
            )}
            {onNavigate && (
              <Button onClick={() => onNavigate('register')} variant="outline">
                {isAr ? 'إنشاء حساب جديد' : 'Create New Account'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Case 2: Authenticated user without required role
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-4">
        <Card className="text-center p-8 border-rose-200 bg-rose-50/40 dark:bg-rose-950/20">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {isAr ? 'وصول غير مصرح به (403)' : 'Access Denied (403 Forbidden)'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
            {isAr
              ? `دور حسابك الحالي هو (${user.role}). لا تملك صلاحية الوصول إلى قسم الإدارة أو العمليات التشغيلية.`
              : `Your account role is (${user.role}). You do not have permission to view administrative or operational tools.`}
          </p>
          <div className="text-sm text-slate-500 bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-rose-200/50 mb-6 font-mono text-center">
            {isAr
              ? `المسموح لهم بالدخول: [${allowedRoles.join(' ، ')}]`
              : `Allowed Roles: [${allowedRoles.join(', ')}]`}
          </div>
          {onNavigate && (
            <Button
              onClick={() => onNavigate(user.role === 'CUSTOMER' ? 'customer-dashboard' : 'home')}
              variant="secondary"
            >
              {isAr ? 'العودة إلى لوحتي الرئيسية' : 'Return to My Dashboard'}
            </Button>
          )}
        </Card>
      </div>
    );
  }

  // Case 3: Authorized
  return <>{children}</>;
};
