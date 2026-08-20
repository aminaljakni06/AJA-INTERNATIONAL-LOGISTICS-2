/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Alert Banner Component
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Wrench,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { useEnterpriseAlert } from '../../hooks/useEnterpriseAlert';
import { AlertItem } from '../../types/feedbackFramework';

interface EnterpriseAlertBannerProps {
  isAr?: boolean;
}

export const EnterpriseAlertBanner: React.FC<EnterpriseAlertBannerProps> = ({ isAr = false }) => {
  const { alerts, dismissAlert } = useEnterpriseAlert();
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  if (!alerts || alerts.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSeverityStyle = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'emergency':
      case 'critical':
        return 'bg-rose-600 text-white border-rose-700';
      case 'maintenance':
        return 'bg-amber-600 text-white border-amber-700';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800';
      case 'error':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800';
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-800';
    }
  };

  const renderSeverityIcon = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'emergency':
      case 'critical':
        return <ShieldAlert className="w-5 h-5 shrink-0" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 shrink-0" />;
      default:
        return <Info className="w-5 h-5 shrink-0" />;
    }
  };

  return (
    <div
      role="region"
      aria-label={isAr ? 'تنبيهات النظام' : 'System Alerts'}
      dir={isAr ? 'rtl' : 'ltr'}
      className="w-full flex flex-col gap-2 z-40"
    >
      {alerts.map((alert) => {
        const title = isAr ? alert.titleAr : alert.titleEn;
        const description = isAr ? alert.descriptionAr : alert.descriptionEn;
        const details = isAr ? alert.expandedDetailsAr : alert.expandedDetailsEn;
        const isExpanded = expandedIds[alert.id] || false;

        return (
          <div
            key={alert.id}
            role="alert"
            className={`w-full px-4 py-3 border-b transition-all flex flex-col gap-2 ${getSeverityStyle(
              alert.severity
            )}`}
          >
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {renderSeverityIcon(alert.severity)}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="font-semibold text-sm">{title}</span>
                  {description && (
                    <span className="text-xs opacity-90 font-normal">{description}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {alert.expandable && details && (
                  <button
                    onClick={() => toggleExpand(alert.id)}
                    className="text-xs flex items-center gap-1 underline opacity-90 hover:opacity-100"
                  >
                    <span>{isAr ? 'التفاصيل' : 'Details'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}

                {alert.dismissible && (
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    aria-label={isAr ? 'إغلاق' : 'Dismiss'}
                    className="p-1 opacity-80 hover:opacity-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Expandable details section */}
            {isExpanded && details && (
              <div className="max-w-7xl mx-auto w-full pt-2 text-xs border-t border-black/10 dark:border-white/10 opacity-90 leading-relaxed">
                {details}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
