import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Users,
  CheckSquare,
  Plus,
  Clock,
  Send,
  Calendar,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { CustomerCommunicationEntry, CustomerActivityTask } from '../../../types/customer360';

interface CustomerActivityCenterProps {
  communications: CustomerCommunicationEntry[];
  activities: CustomerActivityTask[];
  onAddCommunication: (comm: Omit<CustomerCommunicationEntry, 'id'>) => Promise<void>;
  onAddActivity: (act: Omit<CustomerActivityTask, 'id' | 'createdAt'>) => Promise<void>;
}

export const CustomerActivityCenter: React.FC<CustomerActivityCenterProps> = ({
  communications,
  activities,
  onAddCommunication,
  onAddActivity,
}) => {
  const [activeTab, setActiveTab] = useState<'COMMUNICATIONS' | 'TASKS'>('COMMUNICATIONS');

  // Form states for Communication
  const [commType, setCommType] = useState<'EMAIL' | 'PHONE' | 'MEETING' | 'NOTE'>('PHONE');
  const [commSubject, setCommSubject] = useState('');
  const [commContent, setCommContent] = useState('');
  const [savingComm, setSavingComm] = useState(false);

  // Form states for Activity Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  const handleCreateComm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commSubject || !commContent) return;
    setSavingComm(true);

    await onAddCommunication({
      customerId: communications[0]?.customerId || 'CUST-360-1001',
      type: commType,
      subject: commSubject,
      content: commContent,
      agentName: 'م. عمر الفارسي',
      agentId: 'agent_omar',
      channel: commType === 'EMAIL' ? 'EMAIL' : 'PHONE',
      timestamp: new Date().toISOString(),
      direction: 'OUTBOUND',
    });

    setSavingComm(false);
    setCommSubject('');
    setCommContent('');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    setSavingTask(true);

    await onAddActivity({
      customerId: activities[0]?.customerId || 'CUST-360-1001',
      type: 'TASK',
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
      priority: taskPriority,
      status: 'OPEN',
      assignedTo: taskAssignedTo || 'فريق المتابعة',
    });

    setSavingTask(false);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskAssignedTo('');
  };

  return (
    <div className="space-y-6 text-slate-100 text-xs">
      {/* Sub-Tabs selection */}
      <div className="flex items-center gap-3 p-2 bg-slate-800 border border-slate-700 rounded-xl">
        <button
          onClick={() => setActiveTab('COMMUNICATIONS')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'COMMUNICATIONS' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>مركز الاتصالات والمكالمات ({communications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TASKS')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'TASKS' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>إدارة المهام والمتابعات ({activities.length})</span>
        </button>
      </div>

      {activeTab === 'COMMUNICATIONS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form to log communication */}
          <Card className="bg-slate-800 border-slate-700 p-4 space-y-3 lg:col-span-1">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
              <Phone className="w-4 h-4" />
              <span>توثيق تواصل جديد</span>
            </h3>

            <form onSubmit={handleCreateComm} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">نوع التواصل</label>
                <select
                  value={commType}
                  onChange={(e) => setCommType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="PHONE">مكالمة هاتفية (PHONE)</option>
                  <option value="EMAIL">بريد إلكتروني (EMAIL)</option>
                  <option value="MEETING">اجتماع مباشر (MEETING)</option>
                  <option value="NOTE">ملاحظة داخلية (NOTE)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">الموضوع الرئيسي *</label>
                <Input
                  value={commSubject}
                  onChange={(e) => setCommSubject(e.target.value)}
                  placeholder="عنوان الموضوع..."
                  required
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">المحتوى ومحاور الحديث *</label>
                <textarea
                  rows={4}
                  value={commContent}
                  onChange={(e) => setCommContent(e.target.value)}
                  placeholder="أدخل التفاصيل المطلوبة..."
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={savingComm}
                className="w-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                تأكيد وتوثيق السجل
              </Button>
            </form>
          </Card>

          {/* List of communications */}
          <Card className="bg-slate-800 border-slate-700 p-4 space-y-3 lg:col-span-2">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
              <MessageSquare className="w-4 h-4" />
              <span>سجل المحادثات والمراسلات السابقة</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {communications.map((c) => (
                <div key={c.id} className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-mono">
                        {c.type}
                      </span>
                      <span>{c.subject}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(c.timestamp).toLocaleString('ar-SA')}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs">{c.content}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>مسؤول المتابعة: <strong className="text-slate-200">{c.agentName}</strong></span>
                    <span className="text-slate-400 font-mono">{c.direction}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Task */}
          <Card className="bg-slate-800 border-slate-700 p-4 space-y-3 lg:col-span-1">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
              <CheckSquare className="w-4 h-4" />
              <span>إسناد مهمة / متابعة جديدة</span>
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">عنوان المهمة *</label>
                <Input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="عنوان المهمة..."
                  required
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">أولويات التنفيذ</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="LOW">منخفضة (LOW)</option>
                  <option value="MEDIUM">متوسطة (MEDIUM)</option>
                  <option value="HIGH">عالية (HIGH)</option>
                  <option value="URGENT">طارئة (URGENT)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">المسند إليه</label>
                <Input
                  value={taskAssignedTo}
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                  placeholder="اسم الشخص أو القسم..."
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">تفاصيل المهمة</label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="الوصف التفصيلي للمهمة..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={savingTask}
                className="w-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                إصدار المهمة
              </Button>
            </form>
          </Card>

          {/* List of Tasks */}
          <Card className="bg-slate-800 border-slate-700 p-4 space-y-3 lg:col-span-2">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
              <CheckSquare className="w-4 h-4" />
              <span>قائمة المهام القائمة والمجدولة</span>
            </h3>

            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.priority === 'URGENT' || a.priority === 'HIGH'
                            ? 'bg-rose-900/60 text-rose-300 border border-rose-500/40'
                            : 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {a.priority}
                      </span>
                      <span>{a.title}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-amber-400 rounded font-bold text-[10px]">
                      {a.status}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs">{a.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                    <span>المسند إليه: <strong className="text-slate-200">{a.assignedTo}</strong></span>
                    <span>تاريخ الاستحقاق: {new Date(a.dueDate).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
