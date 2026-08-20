import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    options?: { mfaTransactionId?: string; mfaCode?: string }
  ) => Promise<{
    success: boolean;
    user?: User;
    error?: string;
    mfaRequired?: boolean;
    mfaTransactionId?: string;
    mfaEnrollmentRequired?: boolean;
    expiresAt?: string;
  }>;
  register: (data: { email: string; password: string; fullName: string; phone: string; companyName?: string }) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; resetCode?: string; message?: string; error?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { fullName: string; phone: string; email?: string; companyName?: string; address?: string; city?: string; country?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('aja_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount or token change
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Stale token or session expired
          localStorage.removeItem('aja_auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string, options?: { mfaTransactionId?: string; mfaCode?: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...options }),
      });

      const data = await res.json();
      if (data.mfaRequired) {
        return {
          success: false,
          error: data.message || 'MFA verification is required',
          mfaRequired: true,
          mfaTransactionId: data.mfaTransactionId,
          expiresAt: data.expiresAt,
        };
      }

      if (!res.ok) {
        return {
          success: false,
          error: data.error || data.message || 'فشل تسجيل الدخول',
          mfaEnrollmentRequired: data.mfaEnrollmentRequired,
        };
      }

      if (!data.token) {
        return { success: false, error: 'لم يصدر الخادم رمز جلسة صالح' };
      }

      localStorage.setItem('aja_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const register = async (formData: { email: string; password: string; fullName: string; phone: string; companyName?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل إنشاء الحساب' };
      }

      localStorage.setItem('aja_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل طلب إعادة التعيين' };
      }
      return { success: true, resetCode: data.resetCode, message: data.message };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل إعادة تعيين كلمة المرور' };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const updateProfile = async (data: { fullName: string; phone: string; email?: string; companyName?: string; address?: string; city?: string; country?: string }) => {
    try {
      if (!token) return { success: false, error: 'غير مسجل الدخول' };
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'فشل تحديث الملف الشخصي' };
      }
      if (resData.token) {
        localStorage.setItem('aja_auth_token', resData.token);
        setToken(resData.token);
      }
      setUser(resData.user);
      return { success: true };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore network errors during logout
      }
    }
    localStorage.removeItem('aja_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
