import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface DateRangePreset {
  label: string;
  labelAr?: string;
  getValue: () => DateRange;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  isAr?: boolean;
  align?: 'left' | 'right';
  minDate?: string;
  maxDate?: string;
}

// Helper formatting utilities
const formatDateStr = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const parseDateStr = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return isNaN(d.getTime()) ? null : d;
};

const formatDisplayDate = (dateStr: string, isAr: boolean = false): string => {
  const d = parseDateStr(dateStr);
  if (!d) return '';
  return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Standard presets
const getPresets = (): DateRangePreset[] => {
  const today = new Date();
  
  return [
    {
      label: 'Today',
      labelAr: 'اليوم',
      getValue: () => {
        const d = formatDateStr(today);
        return { startDate: d, endDate: d };
      },
    },
    {
      label: 'Last 7 Days',
      labelAr: 'آخر 7 أيام',
      getValue: () => {
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        return { startDate: formatDateStr(start), endDate: formatDateStr(today) };
      },
    },
    {
      label: 'Last 30 Days',
      labelAr: 'آخر 30 يوماً',
      getValue: () => {
        const start = new Date(today);
        start.setDate(today.getDate() - 29);
        return { startDate: formatDateStr(start), endDate: formatDateStr(today) };
      },
    },
    {
      label: 'This Month',
      labelAr: 'هذا الشهر',
      getValue: () => {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        return { startDate: formatDateStr(start), endDate: formatDateStr(today) };
      },
    },
    {
      label: 'Last Month',
      labelAr: 'الشهر الماضي',
      getValue: () => {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        return { startDate: formatDateStr(start), endDate: formatDateStr(end) };
      },
    },
    {
      label: 'This Year',
      labelAr: 'هذه السنة',
      getValue: () => {
        const start = new Date(today.getFullYear(), 0, 1);
        return { startDate: formatDateStr(start), endDate: formatDateStr(today) };
      },
    },
  ];
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value = { startDate: '', endDate: '' },
  onChange,
  label,
  placeholder,
  className = '',
  isAr = false,
  align = 'left',
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Calendar View Month state
  const initialMonthDate = parseDateStr(value.startDate) || new Date();
  const [viewDate, setViewDate] = useState<Date>(initialMonthDate);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state if props change
  useEffect(() => {
    setTempRange(value);
  }, [value.startDate, value.endDate]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDayClick = (dateStr: string) => {
    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      // Start a new range
      setTempRange({ startDate: dateStr, endDate: '' });
    } else {
      // Complete the range
      if (dateStr < tempRange.startDate) {
        setTempRange({ startDate: dateStr, endDate: tempRange.startDate });
      } else {
        setTempRange({ ...tempRange, endDate: dateStr });
      }
    }
  };

  const handlePresetSelect = (preset: DateRangePreset) => {
    const newRange = preset.getValue();
    setTempRange(newRange);
    if (onChange) {
      onChange(newRange);
    }
    setIsOpen(false);
  };

  const handleApply = () => {
    if (onChange) {
      onChange(tempRange);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    const emptyRange = { startDate: '', endDate: '' };
    setTempRange(emptyRange);
    if (onChange) {
      onChange(emptyRange);
    }
    setIsOpen(false);
  };

  // Month navigation
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Calendar days calculation
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(year, month, i));
  }

  const presets = getPresets();

  const isSelectedStart = (dateStr: string) => tempRange.startDate === dateStr;
  const isSelectedEnd = (dateStr: string) => tempRange.endDate === dateStr;

  const isInRange = (dateStr: string) => {
    if (tempRange.startDate && tempRange.endDate) {
      return dateStr >= tempRange.startDate && dateStr <= tempRange.endDate;
    }
    if (tempRange.startDate && hoverDate && !tempRange.endDate) {
      const start = tempRange.startDate;
      return (dateStr >= start && dateStr <= hoverDate) || (dateStr <= start && dateStr >= hoverDate);
    }
    return false;
  };

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const weekDaysEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const weekDaysAr = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  const currentMonthName = isAr ? monthNamesAr[month] : monthNamesEn[month];
  const currentWeekDays = isAr ? weekDaysAr : weekDaysEn;

  const displayText = tempRange.startDate
    ? tempRange.endDate
      ? `${formatDisplayDate(tempRange.startDate, isAr)} - ${formatDisplayDate(tempRange.endDate, isAr)}`
      : `${formatDisplayDate(tempRange.startDate, isAr)} - ...`
    : placeholder || (isAr ? 'اختر النطاق الزمني' : 'Select date range');

  return (
    <div className={`relative inline-block text-left w-full sm:w-auto ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-text-primary mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto min-w-[240px] px-3.5 py-2.5 rounded-xl bg-surface-primary text-text-primary border border-border-default hover:border-border-focus focus:border-border-focus focus:ring-2 focus:ring-border-focus/20 transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-sm cursor-pointer"
      >
        <div className="flex items-center gap-2.5 truncate">
          <Calendar className="w-4 h-4 text-action-primary shrink-0" />
          <span className={tempRange.startDate ? 'text-text-primary font-semibold' : 'text-text-muted'}>
            {displayText}
          </span>
        </div>
        {(tempRange.startDate || tempRange.endDate) ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="p-1 hover:bg-surface-soft rounded-lg text-text-muted hover:text-status-error transition-colors cursor-pointer"
            title={isAr ? 'إلغاء التحديد' : 'Clear selection'}
          >
            <X className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="text-text-muted text-[10px]">▼</span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 z-50 ${
            align === 'right' || isAr ? 'right-0' : 'left-0'
          } bg-surface-primary border border-border-default rounded-2xl shadow-2xl p-4 w-[320px] sm:w-[580px] max-w-[95vw] flex flex-col sm:flex-row gap-4 text-text-primary animate-fadeIn`}
        >
          {/* Presets Sidebar */}
          <div className="sm:w-44 border-b sm:border-b-0 sm:border-r border-border-default pb-3 sm:pb-0 sm:pr-3 flex flex-row sm:flex-col flex-wrap gap-1">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2 py-1 block w-full mb-1">
              {isAr ? 'اختصارات سريعة' : 'Quick Presets'}
            </span>
            {presets.map((preset, idx) => {
              const activeRange = preset.getValue();
              const isSelected =
                tempRange.startDate === activeRange.startDate &&
                tempRange.endDate === activeRange.endDate;

              return (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-action-primary text-text-on-brand font-bold'
                      : 'text-text-secondary hover:bg-surface-soft hover:text-text-primary'
                  }`}
                >
                  <span>{isAr ? preset.labelAr : preset.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Main Calendar View */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Header: Month & Navigation */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-surface-soft text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  title={isAr ? 'الشهر السابق' : 'Previous Month'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-bold text-text-primary">
                  {currentMonthName} {year}
                </span>

                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-surface-soft text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  title={isAr ? 'الشهر التالي' : 'Next Month'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Weekdays Header */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {currentWeekDays.map((day, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-text-muted py-1">
                    {day}
                  </span>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysArray.map((dateObj, idx) => {
                  if (!dateObj) {
                    return <div key={`empty-${idx}`} className="h-8" />;
                  }

                  const dateStr = formatDateStr(dateObj);
                  const isStart = isSelectedStart(dateStr);
                  const isEnd = isSelectedEnd(dateStr);
                  const inRange = isInRange(dateStr);
                  const isToday = formatDateStr(new Date()) === dateStr;

                  let btnClass = 'text-text-primary hover:bg-surface-soft';

                  if (isStart || isEnd) {
                    btnClass = 'bg-action-primary text-text-on-brand font-bold shadow-sm';
                  } else if (inRange) {
                    btnClass = 'bg-surface-soft text-brand-gentian-blue font-semibold';
                  } else if (isToday) {
                    btnClass = 'border border-action-primary text-action-primary font-bold';
                  }

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDayClick(dateStr)}
                      onMouseEnter={() => setHoverDate(dateStr)}
                      className={`h-8 w-full rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer ${btnClass}`}
                    >
                      {dateObj.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1 hover:bg-surface-soft rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-soft rounded-lg transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!tempRange.startDate}
                  className="px-4 py-1.5 text-xs font-bold bg-action-primary hover:bg-action-primary-hover text-text-on-brand rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAr ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
