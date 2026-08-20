import React from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { Calendar, Clock, Globe, Shield, Save } from 'lucide-react';

export const OrganizationSettingsForm: React.FC = () => {
  const { settings, company } = useOrganization();

  if (!settings) return null;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Organizational & Regional Policies
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure working days, business hours, weekend schedules, and regional holiday calendars for {company?.tradeName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Working Days & Weekends */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            Working Days & Weekend Rules
          </h4>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => {
              const isWorkDay = settings.workingDays.includes(day as any);
              const isWeekend = settings.weekendDays.includes(day as any);
              return (
                <span
                  key={day}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    isWorkDay
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : isWeekend
                      ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            Official Business Hours
          </h4>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Start Time</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{settings.businessHours.start} AST</span>
            </div>
            <span className="text-slate-400 font-bold">TO</span>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">End Time</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{settings.businessHours.end} AST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Holiday Calendar List */}
      <div>
        <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-slate-500" />
          Official National & Regional Holidays
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {settings.holidays.map((h) => (
            <div
              key={h.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{h.name}</p>
                {h.nameAr && <p className="text-[11px] text-slate-400 font-arabic">{h.nameAr}</p>}
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                {h.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
