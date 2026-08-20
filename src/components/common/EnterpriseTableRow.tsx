import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Printer,
  Download,
  Share2,
  Archive,
  UserCheck,
  Building2,
  Truck,
  Boxes,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LucideIcon
} from 'lucide-react';

export type RowDensity = 'comfortable' | 'default' | 'compact';

export type StatusType =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'pending'
  | 'processing'
  | 'cancelled'
  | 'archived'
  | 'draft'
  | 'completed';

export interface RowBadge {
  labelEn: string;
  labelAr: string;
  type?: StatusType;
  variant?: 'solid' | 'subtle' | 'outline';
}

export interface RowAvatar {
  src?: string;
  nameEn?: string;
  nameAr?: string;
  icon?: LucideIcon;
  type?: 'user' | 'company' | 'vehicle' | 'warehouse' | 'default';
}

export interface RowAction {
  id: string;
  labelEn: string;
  labelAr: string;
  icon?: LucideIcon;
  variant?: 'default' | 'danger' | 'primary';
  onClick: () => void;
}

export interface EnterpriseTableRowProps<T = any> {
  item?: T;
  rowId: string;
  columns?: {
    key: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
    priority?: 1 | 2 | 3 | 4;
    accessor?: (item: T) => React.ReactNode;
  }[];
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  expandableContent?: React.ReactNode;
  density?: RowDensity;
  isAr?: boolean;
  inlineActions?: RowAction[];
  overflowActions?: RowAction[];
  avatar?: RowAvatar;
  primaryTextEn?: string;
  primaryTextAr?: string;
  secondaryTextEn?: string;
  secondaryTextAr?: string;
  statusBadge?: RowBadge;
  metadataEn?: string;
  metadataAr?: string;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessageEn?: string;
  errorMessageAr?: string;
  onClick?: () => void;
  className?: string;
}

export const StatusBadgeComponent: React.FC<{
  badge: RowBadge;
  isAr?: boolean;
}> = ({ badge, isAr = false }) => {
  const getBadgeStyles = (type?: StatusType) => {
    switch (type) {
      case 'success':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'warning':
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'danger':
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'processing':
      case 'info':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'archived':
      case 'draft':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (type?: StatusType) => {
    switch (type) {
      case 'success':
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'warning':
      case 'pending':
        return <AlertTriangle className="w-3 h-3 text-amber-400" />;
      case 'danger':
      case 'cancelled':
        return <XCircle className="w-3 h-3 text-rose-400" />;
      case 'processing':
      case 'info':
        return <Clock className="w-3 h-3 text-sky-400 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-colors ${getBadgeStyles(
        badge.type
      )}`}
    >
      {getStatusIcon(badge.type)}
      <span>{isAr ? badge.labelAr : badge.labelEn}</span>
    </span>
  );
};

export const AvatarComponent: React.FC<{
  avatar: RowAvatar;
  isAr?: boolean;
}> = ({ avatar, isAr = false }) => {
  if (avatar.src) {
    return (
      <img
        src={avatar.src}
        alt={isAr ? avatar.nameAr : avatar.nameEn}
        className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0"
        referrerPolicy="no-referrer"
      />
    );
  }

  const Icon = avatar.icon || (avatar.type === 'vehicle' ? Truck : avatar.type === 'warehouse' ? Boxes : avatar.type === 'company' ? Building2 : User);

  const initials = isAr
    ? (avatar.nameAr || 'ع').charAt(0)
    : (avatar.nameEn || 'A').charAt(0).toUpperCase();

  return (
    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[#00F0FF] font-bold text-xs flex items-center justify-center shrink-0">
      {avatar.icon ? <Icon className="w-3.5 h-3.5" /> : initials}
    </div>
  );
};

export const EnterpriseTableRow = <T extends Record<string, any>>({
  item,
  rowId,
  columns,
  isSelected = false,
  onToggleSelect,
  isExpanded = false,
  onToggleExpand,
  expandableContent,
  density = 'default',
  isAr = false,
  inlineActions = [],
  overflowActions = [],
  avatar,
  primaryTextEn,
  primaryTextAr,
  secondaryTextEn,
  secondaryTextAr,
  statusBadge,
  metadataEn,
  metadataAr,
  isLoading = false,
  hasError = false,
  errorMessageEn = 'Error rendering row',
  errorMessageAr = 'حدث خطأ في عرض السجل',
  onClick,
  className = '',
}: EnterpriseTableRowProps<T>) => {
  const [showOverflow, setShowOverflow] = useState(false);

  // Padding based on density
  const getRowPaddingClass = () => {
    switch (density) {
      case 'compact':
        return 'py-1.5 px-3 text-xs';
      case 'comfortable':
        return 'py-3.5 px-4 text-sm';
      case 'default':
      default:
        return 'py-2.5 px-3.5 text-xs';
    }
  };

  if (isLoading) {
    return (
      <tr className="animate-pulse border-b border-slate-100 dark:border-white/5">
        <td className="p-3 text-center">
          <div className="w-4 h-4 rounded bg-slate-200 dark:bg-white/10 mx-auto" />
        </td>
        {expandableContent && <td className="p-3" />}
        {columns
          ? columns.map((col) => (
              <td key={col.key} className="p-3">
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-24" />
              </td>
            ))
          : (
            <td colSpan={5} className="p-3">
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-full" />
            </td>
          )}
        <td className="p-3" />
      </tr>
    );
  }

  if (hasError) {
    return (
      <tr className="bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs font-bold">
        <td colSpan={100} className="p-3 text-center">
          <span>{isAr ? errorMessageAr : errorMessageEn}</span>
        </td>
      </tr>
    );
  }

  return (
    <React.Fragment>
      <tr
        onClick={onClick}
        className={`group transition-all duration-150 border-b border-slate-100 dark:border-white/5 select-none ${
          isSelected
            ? 'bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/30'
            : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
        } ${className}`}
      >
        {/* Selection Checkbox Cell */}
        {onToggleSelect && (
          <td className={`${getRowPaddingClass()} text-center shrink-0`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(rowId);
              }}
              className="text-slate-400 hover:text-[#00F0FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded transition-colors cursor-pointer"
              title={isSelected ? (isAr ? 'إلغاء التحديد' : 'Deselect') : (isAr ? 'تحديد' : 'Select')}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-[#00F0FF]" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
          </td>
        )}

        {/* Expand Toggle Cell */}
        {expandableContent && (
          <td className={`${getRowPaddingClass()} text-center shrink-0`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleExpand) onToggleExpand(rowId);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF]" />
              ) : isAr ? (
                <ChevronLeft className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </td>
        )}

        {/* Dynamic Column Accessors or Default Row Content Layout */}
        {columns && item ? (
          columns.map((col) => {
            const cellValue = col.accessor ? col.accessor(item) : item[col.key];
            const getPriorityClass = (p?: 1 | 2 | 3 | 4) => {
              if (p === 2) return 'hidden sm:table-cell';
              if (p === 3) return 'hidden md:table-cell';
              if (p === 4) return 'hidden lg:table-cell';
              return 'table-cell';
            };

            return (
              <td
                key={col.key}
                style={{ width: col.width }}
                className={`${getRowPaddingClass()} text-${col.align || 'start'} text-slate-800 dark:text-slate-200 font-medium ${getPriorityClass(col.priority)}`}
              >
                {cellValue}
              </td>
            );
          })
        ) : (
          /* Default Unified Row Template if columns not supplied directly */
          <td className={`${getRowPaddingClass()} w-full`}>
            <div className="flex items-center justify-between gap-3">
              {/* Left Side: Avatar + Primary & Secondary Info */}
              <div className="flex items-center gap-3 min-w-0">
                {avatar && <AvatarComponent avatar={avatar} isAr={isAr} />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {isAr ? primaryTextAr : primaryTextEn}
                    </span>
                    {statusBadge && <StatusBadgeComponent badge={statusBadge} isAr={isAr} />}
                  </div>
                  {(secondaryTextEn || secondaryTextAr) && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {isAr ? secondaryTextAr : secondaryTextEn}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side: Metadata Tag */}
              {(metadataEn || metadataAr) && (
                <span className="text-[10px] font-mono text-slate-400 shrink-0 hidden sm:inline">
                  {isAr ? metadataAr : metadataEn}
                </span>
              )}
            </div>
          </td>
        )}

        {/* Inline Actions & Overflow Context Menu Cell */}
        {(inlineActions.length > 0 || overflowActions.length > 0) && (
          <td className={`${getRowPaddingClass()} text-end shrink-0 relative`}>
            <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
              {/* Quick Inline Action Buttons */}
              {inlineActions.map((act) => {
                const Icon = act.icon || Eye;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      act.onClick();
                    }}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      act.variant === 'danger'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                        : act.variant === 'primary'
                        ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                    title={isAr ? act.labelAr : act.labelEn}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}

              {/* Context Overflow Trigger */}
              {overflowActions.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOverflow(!showOverflow);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title={isAr ? 'خيارات إضافية' : 'More Options'}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Overflow Contextual Menu Dropdown */}
                  {showOverflow && (
                    <div
                      onMouseLeave={() => setShowOverflow(false)}
                      className="absolute end-0 top-8 z-40 w-44 bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-1 divide-y divide-slate-100 dark:divide-white/5 text-start animate-in fade-in duration-100"
                    >
                      <div className="py-1">
                        {overflowActions.map((act) => {
                          const Icon = act.icon;
                          return (
                            <button
                              key={act.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowOverflow(false);
                                act.onClick();
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                                act.variant === 'danger'
                                  ? 'text-rose-400 hover:bg-rose-500/10'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                              }`}
                            >
                              {Icon && <Icon className="w-3.5 h-3.5" />}
                              <span>{isAr ? act.labelAr : act.labelEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </td>
        )}
      </tr>

      {/* Expandable Drawer Panel Sub-row */}
      {isExpanded && expandableContent && (
        <tr className="bg-slate-50/50 dark:bg-[#030712]/50 border-b border-slate-200 dark:border-white/10">
          <td colSpan={100} className="p-4">
            <div className="p-4 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-inner animate-in fade-in duration-150">
              {expandableContent}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};
