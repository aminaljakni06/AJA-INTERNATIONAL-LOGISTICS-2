/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Related Records Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Interaction System
 * Version: 1.0
 */

import React from 'react';
import { Plus, ChevronRight, ChevronLeft, FileText, Loader2, Inbox } from 'lucide-react';
import { DrawerRelatedRecordsProps } from '../../types/drawerInteractionFramework';

export const DrawerRelatedRecords: React.FC<DrawerRelatedRecordsProps> = ({
  titleEn = 'Related Records & Entities',
  titleAr = 'السجلات والكيانات المرتبطة',
  records,
  isLoading = false,
  emptyTitleEn = 'No related records found',
  emptyTitleAr = 'لم يتم العثور على سجلات مرتبطة',
  onAddRecord,
  addLabelEn = 'Add Record',
  addLabelAr = 'إضافة سجل',
  isAr = false,
  className = '',
}) => {
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className={`flex flex-col space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-default">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          {isAr ? titleAr : titleEn}
        </h4>
        {onAddRecord && (
          <button
            type="button"
            onClick={onAddRecord}
            className="text-xs font-semibold text-brand-navy dark:text-brand-gold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? addLabelAr : addLabelEn}</span>
          </button>
        )}
      </div>

      {/* Record List */}
      {isLoading ? (
        <div className="py-8 flex items-center justify-center text-text-muted space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand-navy dark:text-brand-gold" />
          <span className="text-xs font-medium">{isAr ? 'جاري التحميل...' : 'Loading records...'}</span>
        </div>
      ) : records.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center space-y-2 border border-dashed border-border-default rounded-xl">
          <Inbox className="w-8 h-8 text-text-muted/60" />
          <p className="text-xs font-medium text-text-muted">
            {isAr ? emptyTitleAr : emptyTitleEn}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((rec) => {
            const title = isAr ? rec.titleAr || rec.titleEn : rec.titleEn;
            const subtitle = isAr ? rec.subtitleAr || rec.subtitleEn : rec.subtitleEn;

            return (
              <div
                key={rec.id}
                onClick={() => rec.onClick && rec.onClick(rec.id)}
                className={`p-3 rounded-xl border border-border-default bg-surface-primary hover:border-brand-navy/30 dark:hover:border-brand-gold/30 hover:bg-surface-secondary/50 transition-all flex items-center justify-between gap-3 ${
                  rec.onClick ? 'cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-surface-secondary text-brand-navy dark:text-brand-gold shrink-0">
                    {rec.icon || <FileText className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                        {title}
                      </h5>
                      {rec.statusBadge && (
                        <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-brand-navy/10 text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold">
                          {isAr
                            ? rec.statusBadge.labelAr || rec.statusBadge.labelEn
                            : rec.statusBadge.labelEn}
                        </span>
                      )}
                    </div>
                    {subtitle && (
                      <p className="text-xs text-text-muted truncate mt-0.5">{subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {rec.actions?.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        act.onClick(rec.id);
                      }}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors cursor-pointer text-xs flex items-center gap-1"
                    >
                      {act.icon}
                      <span className="hidden sm:inline">
                        {isAr ? act.labelAr || act.labelEn : act.labelEn}
                      </span>
                    </button>
                  ))}
                  {rec.onClick && <ChevronIcon className="w-4 h-4 text-text-muted" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
