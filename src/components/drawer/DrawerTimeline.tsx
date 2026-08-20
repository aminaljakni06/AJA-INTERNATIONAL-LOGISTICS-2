/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Timeline Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Interaction System
 * Version: 1.0
 */

import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Circle, Loader2 } from 'lucide-react';
import { DrawerTimelineProps, TimelineEventStatus } from '../../types/drawerInteractionFramework';

export const DrawerTimeline: React.FC<DrawerTimelineProps> = ({
  titleEn = 'Activity & Milestone Timeline',
  titleAr = 'جدول أنشطة ومراحل المتابعة',
  events,
  isLoading = false,
  isAr = false,
  className = '',
}) => {
  const getStatusIcon = (status?: TimelineEventStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-status-success" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-status-error" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-status-warning animate-spin" />;
      case 'pending':
      default:
        return <Circle className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className={`flex flex-col space-y-4 ${className}`}>
      <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted pb-2 border-b border-border-default">
        {isAr ? titleAr : titleEn}
      </h4>

      {isLoading ? (
        <div className="py-8 flex items-center justify-center text-text-muted space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand-navy dark:text-brand-gold" />
          <span className="text-xs font-medium">{isAr ? 'جاري التحميل...' : 'Loading timeline...'}</span>
        </div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center text-xs text-text-muted">
          {isAr ? 'لا توجد أحداث مسجلة' : 'No activity timeline events recorded'}
        </div>
      ) : (
        <div className="relative pl-4 rtl:pl-0 rtl:pr-4 space-y-6 before:absolute before:inset-y-2 before:left-[23px] rtl:before:right-[23px] rtl:before:left-auto before:w-0.5 before:bg-border-default">
          {events.map((ev) => {
            const title = isAr ? ev.titleAr || ev.titleEn : ev.titleEn;
            const description = isAr ? ev.descriptionAr || ev.descriptionEn : ev.descriptionEn;

            return (
              <div key={ev.id} className="relative flex items-start gap-3">
                <div className="p-1 rounded-full bg-surface-primary border border-border-default z-10 shrink-0 mt-0.5">
                  {ev.icon || getStatusIcon(ev.status)}
                </div>

                <div className="flex-1 bg-surface-primary border border-border-default rounded-xl p-3 shadow-xs space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h5 className="text-xs font-bold text-text-primary">{title}</h5>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {String(ev.timestamp)}
                    </span>
                  </div>

                  {description && (
                    <p className="text-xs text-text-muted leading-relaxed">{description}</p>
                  )}

                  {ev.actor && (
                    <div className="pt-1 text-[10px] text-text-muted font-medium flex items-center gap-1.5">
                      <span>{isAr ? 'بواسطة:' : 'By:'}</span>
                      <span className="font-semibold text-text-primary">{ev.actor.name}</span>
                      {ev.actor.role && <span>({ev.actor.role})</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
