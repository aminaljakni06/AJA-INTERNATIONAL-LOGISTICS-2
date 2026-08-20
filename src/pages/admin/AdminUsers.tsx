import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, Edit2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';

interface UserItem {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const AdminUsers: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    if (!token) return;
    setUpdatingId(targetUserId);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/auth/users/${targetUserId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMsg({ type: 'error', message: data.error || 'فشل تحديث دور المستخدم' });
      } else {
        setStatusMsg({ type: 'success', message: `تم تحديث صلاحية المستخدم إلى (${newRole}) بنجاح.` });
        setUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u)));
      }
    } catch {
      setStatusMsg({ type: 'error', message: 'خطأ في الاتصال بالخادم' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner label="جاري استدعاء سجل حسابات وصلاحيات النظام..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            إدارة صلاحيات المستخدمين والأدوار (RBAC)
          </h2>
          <p className="text-xs text-slate-300">التحكم في أدوار الحسابات (CUSTOMER / STAFF / ADMIN) وتطبيق مبدأ الأقل صلاحية</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm" className="gap-2 text-slate-200 border-slate-600">
          <RefreshCw className="w-3.5 h-3.5" />
          تحديث القائمة
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

      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 border-b border-slate-700 text-slate-300 font-bold">
              <tr>
                <th className="p-3">معرف المستخدم</th>
                <th className="p-3">الاسم الكامل</th>
                <th className="p-3">البريد الإلكتروني</th>
                <th className="p-3">رقم الهاتف</th>
                <th className="p-3">الدور الحالي (Role)</th>
                <th className="p-3">تغيير الصلاحية</th>
                <th className="p-3">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((u) => {
                const isSelf = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-3 font-mono text-slate-400 text-[11px]">{u.id}</td>
                    <td className="p-3 font-bold text-slate-100">
                      {u.displayName} {isSelf && <span className="text-[10px] text-amber-400 font-normal">(حسابك)</span>}
                    </td>
                    <td className="p-3 text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{u.phone || '-'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1.5 border ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-900/40 text-purple-300 border-purple-500/40'
                            : u.role === 'STAFF'
                            ? 'bg-amber-900/40 text-amber-300 border-amber-500/40'
                            : 'bg-blue-900/40 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        disabled={updatingId === u.id || isSelf}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-100 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                      >
                        <option value="CUSTOMER">CUSTOMER (عميل)</option>
                        <option value="STAFF">STAFF (فريق عمل)</option>
                        <option value="ADMIN">ADMIN (مدير)</option>
                      </select>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
