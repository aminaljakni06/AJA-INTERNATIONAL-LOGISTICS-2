import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Clock, 
  Plus, 
  User, 
  Tag, 
  CheckCircle2, 
  Circle,
  ChevronRight
} from 'lucide-react';
import { Card } from '../../common/Card';

interface TaskItem {
  id: string;
  titleEn: string;
  titleAr: string;
  dueTime: string;
  category: 'PICKUP' | 'CUSTOMS' | 'MEETING' | 'APPROVAL';
  completed: boolean;
}

interface CalendarTasksWidgetProps {
  isAr: boolean;
  onNavigate: (tab: string) => void;
}

export const CalendarTasksWidget: React.FC<CalendarTasksWidgetProps> = ({
  isAr,
  onNavigate
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      titleEn: 'Review Customs Exemption Audit for SABIC Freight',
      titleAr: 'مراجعة طلب الإعفاء الجمركي لشحنة سابك',
      dueTime: '10:30 AM Today',
      category: 'CUSTOMS',
      completed: true
    },
    {
      id: 'task-2',
      titleEn: 'Sign Executive Logistics Agreement with Aramco Supply Chain',
      titleAr: 'توقيع عقود الخدمات اللوجستية مع أرامكو',
      dueTime: '01:00 PM Today',
      category: 'MEETING',
      completed: false
    },
    {
      id: 'task-3',
      titleEn: 'Approve Fleet Fuel Subsidy & Maintenance Invoices',
      titleAr: 'اعتماد فواتير وقود وصيانة الأسطول لشركة الحافلات',
      dueTime: '03:30 PM Today',
      category: 'APPROVAL',
      completed: false
    },
    {
      id: 'task-4',
      titleEn: 'Oversee Dammam Port Cold Chain Container Dispatch',
      titleAr: 'الإشراف على انطلاق حاويات سلسلة التبريد بميناء الدمام',
      dueTime: '05:00 PM Today',
      category: 'PICKUP',
      completed: false
    }
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <Card
      title={isAr ? 'المهام اليومية والمواعيد التنفيذية (Calendar & Daily Tasks)' : 'Executive Calendar & Daily Task Workflow'}
      subtitle={isAr ? 'متابعة المواعيد، اجتماعات الموانئ، والاعتمادات المطلوبة اليوم' : 'Daily operational milestones, customs clearances, and executive approvals'}
      headerAction={
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#00F0FF]">
            {progressPercent}% {isAr ? 'مكتمل' : 'Completed'}
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00F0FF] to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                task.completed
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400 opacity-70'
                  : 'bg-slate-50 dark:bg-[#030712] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-[#00F0FF]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <button className="shrink-0 text-[#00F0FF]">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <div className="space-y-0.5">
                  <span className={`font-bold block ${task.completed ? 'line-through text-slate-400' : ''}`}>
                    {isAr ? task.titleAr : task.titleEn}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>{task.dueTime}</span>
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                {task.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
