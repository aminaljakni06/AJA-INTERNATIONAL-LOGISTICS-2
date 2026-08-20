/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Alert & Notification Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Confirmation, Alert & Decision Dialogs
 * Version: 1.0
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Clock,
  WifiOff,
  Lock,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { DialogSeverity } from '../../types/decisionFramework';
import { EnterpriseDialog } from './EnterpriseDialog';

export interface EnterpriseAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  severity?: DialogSeverity;
  autoDismissSeconds?: number;
  actionLabelEn?: string;
  actionLabelAr?: string;
  onAction?: () => void | Promise<void>;
  isAr?: boolean;
  systemNotificationType?: 'GENERAL' | 'SESSION_EXPIRING' | 'MAINTENANCE' | 'NETWORK_LOST' | 'SECURITY_BREACH';
}

export const EnterpriseAlertDialog: React.FC<EnterpriseAlertDialogProps> = ({
  isOpen,
  onClose,
  titleEn,
  titleAr,
  messageEn,
  messageAr,
  severity = 'info',
  autoDismissSeconds,
  actionLabelEn,
  actionLabelAr,
  onAction,
  isAr = false,
  systemNotificationType = 'GENERAL',
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(autoDismissSeconds || null);

  useEffect(() => {
    if (!isOpen || !autoDismissSeconds) return;

    setRemainingSeconds(autoDismissSeconds);
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoDismissSeconds, onClose]);

  const getSeverityIcon = () => {
    switch (systemNotificationType) {
      case 'SESSION_EXPIRING':
        return <Clock className="w-6 h-6 text-amber-600 animate-pulse" />;
      case 'NETWORK_LOST':
        return <WifiOff className="w-6 h-6 text-rose-600" />;
      case 'SECURITY_BREACH':
        return <Lock className="w-6 h-6 text-rose-600" />;
      case 'MAINTENANCE':
        return <Bell className="w-6 h-6 text-blue-600" />;
      default:
        break;
    }

    switch (severity) {
      case 'critical':
      case 'danger':
        return <ShieldAlert className="w-6 h-6 text-rose-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBadgeVariant = () => {
    if (severity === 'critical' || severity === 'danger' || severity === 'error') return 'danger';
    if (severity === 'warning') return 'warning';
    if (severity === 'success') return 'success';
    return 'info';
  };

  const handleActionClick = async () => {
    if (onAction) {
      await onAction();
    }
    onClose();
  };

  return (
    <EnterpriseDialog
      id="enterprise_alert_dialog"
      isOpen={isOpen}
      onClose={onClose}
      titleEn={titleEn}
      titleAr={titleAr}
      icon={getSeverityIcon()}
      isAr={isAr}
      statusBadge={{
        labelEn: severity.toUpperCase(),
        labelAr: severity === 'error' || severity === 'danger' ? 'خطأ تنبيهي' : 'تنبيه نظام',
        variant: getBadgeVariant(),
      }}
      config={{
        size: 'sm',
        variant: 'alert',
        closeOnBackdropClick: severity !== 'critical',
        closeOnEscape: true,
      }}
      actions={[
        {
          id: 'dismiss',
          labelEn: remainingSeconds !== null ? `Dismiss (${remainingSeconds}s)` : 'Dismiss',
          labelAr: remainingSeconds !== null ? `تجاهل (${remainingSeconds}ث)` : 'تجاهل',
          variant: 'ghost',
          onClick: onClose,
        },
        ...(onAction
          ? [
              {
                id: 'action',
                labelEn: actionLabelEn || 'Proceed',
                labelAr: actionLabelAr || 'متابعة',
                variant: severity === 'danger' || severity === 'critical' ? ('danger' as const) : ('primary' as const),
                onClick: handleActionClick,
              },
            ]
          : []),
      ]}
    >
      <div className="flex flex-col gap-3 py-2" aria-live="assertive">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {isAr ? messageAr : messageEn}
        </p>

        {remainingSeconds !== null && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-amber-600 h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${((remainingSeconds / (autoDismissSeconds || 1)) * 100).toFixed(0)}%`,
              }}
            />
          </div>
        )}
      </div>
    </EnterpriseDialog>
  );
};
