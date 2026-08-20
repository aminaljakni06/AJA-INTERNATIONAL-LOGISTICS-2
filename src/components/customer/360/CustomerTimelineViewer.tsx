import React, { useState } from 'react';
import {
  Clock,
  Filter,
  Search,
  Download,
  Plus,
  FileText,
  DollarSign,
  Package,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { CustomerTimelineEntry, TimelineEventType } from '../../../types/customer360';

interface CustomerTimelineViewerProps {
  timeline: CustomerTimelineEntry[];
  onRecordEvent: (event: Omit<CustomerTimelineEntry, 'id'>) => Promise<void>;
}

export const CustomerTimelineViewer: React.FC<CustomerTimelineViewerProps> = ({
  timeline,
  onRecordEvent,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Event Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'OPERATIONS' | 'FINANCE' | 'SUPPORT' | 'SALES' | 'SYSTEM' | 'COMPLIANCE'>('OPERATIONS');
  const [type, setType] = useState<TimelineEventType>('NOTE');
  const [saving, setSaving] = useState(false);

  const filteredTimeline = timeline.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory || item.type === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.actorName.toLowerCase().includes(term);

    return matchesCat && matchesSearch;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setSaving(true);

    await onRecordEvent({
      customerId: timeline[0]?.customerId || 'CUST-360-1001',
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      actorId: 'user_staff',
      actorName: 'مسؤول المتابعة اللوجستية',
      actorRole: 'STAFF',
      category,
    });

    setSaving(false);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  const getEventIcon = (cat?: string) => {
    switch (cat) {
      case 'FINANCE':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'OPERATIONS':
        return <Package className="w-4 h-4 text-blue-400" />;
      case 'SUPPORT':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'COMPLIANCE':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="space-y-6 text-slate-100 text-xs">
      {/* Top Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-800 border border-slate-700 rounded-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-300">تصفية السجل:</span>

          {['ALL', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'SALES', 'COMPLIANCE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'الكل' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="بحث في الأحداث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 py-1.5 bg-slate-900 border-slate-700 text-white w-48 text-xs"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-1 bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
          >
            <Plus className="w-3.5 h-3.5" /> إضافة حدث
          </Button>
        </div>
      </div>

      {/* Chronological Timeline Stream */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        {filteredTimeline.length === 0 ? (
          <div className="text-center py-12 text-slate-400">لا توجد أحداث حيز المتابعة لهذا العميل.</div>
        ) : (
          <div className="relative border-r-2 border-slate-700 pr-6 space-y-6">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Node icon */}
                <div className="absolute -right-[31px] top-1 p-1.5 bg-slate-900 border-2 border-slate-700 rounded-full group-hover:border-amber-400 transition-colors">
                  {getEventIcon(item.category)}
                </div>

                <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-2 hover:border-slate-600 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300 text-sm">{item.title}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>{new Date(item.timestamp).toLocaleString('ar-SA')}</span>
                    </div>
                  </div>

                  <p className="text-slate-200 leading-relaxed text-xs">{item.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <span>المنفّذ:</span> <strong className="text-slate-200">{item.actorName}</strong> ({item.actorRole})
                    </span>
                    {item.status && (
                      <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded font-bold">
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal to Add Timeline Event */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2 border-b border-slate-700 pb-2">
              <Plus className="w-5 h-5" /> تسجيل حدث جديد في التسلسل الزمني 360
            </h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">عنوان الحدث *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: توثيق مكالمة المتابعة الحالية"
                  required
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">التصنيف الرئيسي</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="OPERATIONS">تشغيل لوجستي (OPERATIONS)</option>
                    <option value="FINANCE">مالي وحسابات (FINANCE)</option>
                    <option value="SUPPORT">دعم واستفسارات (SUPPORT)</option>
                    <option value="SALES">مبيعات وتعاقد (SALES)</option>
                    <option value="COMPLIANCE">امتثال وتفتيش (COMPLIANCE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">نوع الحدث</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="NOTE">ملاحظة (NOTE)</option>
                    <option value="PHONE_CALL">مكالمة هاتفية (PHONE_CALL)</option>
                    <option value="MEETING">اجتماع مباشر (MEETING)</option>
                    <option value="CONTRACT_SIGN">توقيع عقد (CONTRACT_SIGN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">التفاصيل والوصف *</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل ملخص الملاحظة أو النتيجة..."
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
                <Button type="submit" variant="primary" isLoading={saving} className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
                  تأكيد وحفظ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
