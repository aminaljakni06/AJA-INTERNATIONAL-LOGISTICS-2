/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Advanced Input Components
 * Phase: Enterprise UI System
 * Module: Enterprise Input Components System
 * Version: 1.0
 */

import React, { useState, useRef, ChangeEvent } from 'react';
import { Star, Sliders, MapPin, QrCode, PenTool, Check } from 'lucide-react';
import { AdvancedInputProps } from '../../types/inputComponentsFramework';
import { EnterpriseInputWrapper } from './EnterpriseInputWrapper';

export const EnterpriseAdvancedInputs: React.FC<AdvancedInputProps> = (props) => {
  const {
    fieldId,
    mode = 'otp',
    value,
    defaultValue,
    onChange,
    otpLength = 6,
    ratingStars = 5,
    sliderMin = 0,
    sliderMax = 100,
    sliderStep = 1,
    disabled = false,
    readOnly = false,
    isAr = false,
    isDisabled,
    isReadOnly,
  } = props;

  const effectiveDisabled = disabled || isDisabled;
  const effectiveReadOnly = readOnly || isReadOnly;

  // --- 1. OTP / PIN INPUT ---
  if (mode === 'otp' || mode === 'pin') {
    const [otpValues, setOtpValues] = useState<string[]>(() => {
      const initial = String(value || defaultValue || '');
      return Array.from({ length: otpLength }, (_, i) => initial[i] || '');
    });
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleOtpChange = (index: number, val: string) => {
      if (effectiveDisabled || effectiveReadOnly) return;
      const digit = val.slice(-1);
      const next = [...otpValues];
      next[index] = digit;
      setOtpValues(next);

      const fullStr = next.join('');
      if (onChange) onChange(fullStr);

      if (digit && index < otpLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    return (
      <EnterpriseInputWrapper {...props}>
        <div className="flex items-center gap-2 justify-center" dir="ltr">
          {Array.from({ length: otpLength }).map((_, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otpValues[idx]}
              disabled={effectiveDisabled}
              readOnly={effectiveReadOnly}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-12 text-center text-lg font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
          ))}
        </div>
      </EnterpriseInputWrapper>
    );
  }

  // --- 2. RATING INPUT ---
  if (mode === 'rating') {
    const [ratingVal, setRatingVal] = useState<number>(Number(value || defaultValue || 0));

    const handleStarClick = (starIndex: number) => {
      if (effectiveDisabled || effectiveReadOnly) return;
      setRatingVal(starIndex);
      if (onChange) onChange(starIndex);
    };

    return (
      <EnterpriseInputWrapper {...props}>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: ratingStars }).map((_, idx) => {
            const starNum = idx + 1;
            const isFilled = starNum <= ratingVal;
            return (
              <button
                key={idx}
                type="button"
                disabled={effectiveDisabled || effectiveReadOnly}
                onClick={() => handleStarClick(starNum)}
                className="p-1 text-amber-500 hover:scale-110 transition-transform disabled:opacity-50"
              >
                <Star className={`w-6 h-6 ${isFilled ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
              </button>
            );
          })}
          <span className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {ratingVal} / {ratingStars}
          </span>
        </div>
      </EnterpriseInputWrapper>
    );
  }

  // --- 3. SLIDER INPUT ---
  if (mode === 'slider') {
    const [sliderVal, setSliderVal] = useState<number>(Number(value || defaultValue || sliderMin));

    const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      setSliderVal(v);
      if (onChange) onChange(v);
    };

    return (
      <EnterpriseInputWrapper {...props}>
        <div className="flex items-center gap-4 w-full">
          <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            value={sliderVal}
            disabled={effectiveDisabled}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[36px] text-center">
            {sliderVal}
          </span>
        </div>
      </EnterpriseInputWrapper>
    );
  }

  // --- 4. COLOR PICKER INPUT ---
  if (mode === 'color') {
    const [colorVal, setColorVal] = useState<string>(String(value || defaultValue || '#f59e0b'));

    const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      setColorVal(hex);
      if (onChange) onChange(hex);
    };

    return (
      <EnterpriseInputWrapper {...props}>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={colorVal}
            disabled={effectiveDisabled}
            onChange={handleColorChange}
            className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer overflow-hidden p-0"
          />
          <input
            type="text"
            value={colorVal}
            disabled={effectiveDisabled}
            onChange={handleColorChange}
            className="px-3 py-2 text-sm font-mono border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl outline-none"
          />
        </div>
      </EnterpriseInputWrapper>
    );
  }

  // --- 5. MAP LOCATION PICKER SIMULATOR ---
  if (mode === 'map') {
    const [coords, setCoords] = useState<{ lat: number; lng: number }>({
      lat: 24.7136,
      lng: 46.6753, // Riyadh default
    });

    return (
      <EnterpriseInputWrapper {...props}>
        <div className="flex flex-col gap-2 p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>{isAr ? 'موقع الخريطة (الرياض)' : 'Map Location (Riyadh)'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
          </div>

          <div className="h-28 bg-amber-100/40 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
            <button
              type="button"
              disabled={effectiveDisabled}
              onClick={() => {
                const next = { lat: coords.lat + 0.001, lng: coords.lng + 0.001 };
                setCoords(next);
                if (onChange) onChange(next);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-100"
            >
              {isAr ? 'تثبيت نقطة الخريطة' : 'Pin Location on Map'}
            </button>
          </div>
        </div>
      </EnterpriseInputWrapper>
    );
  }

  // --- 6. BARCODE / QR SCANNER SIMULATOR ---
  if (mode === 'barcode' || mode === 'qr') {
    const [scannedVal, setScannedVal] = useState<string>(String(value || defaultValue || ''));

    const handleSimulateScan = () => {
      const code = `AJA_BAR_${Math.floor(100000 + Math.random() * 900000)}`;
      setScannedVal(code);
      if (onChange) onChange(code);
    };

    return (
      <EnterpriseInputWrapper {...props}>
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <QrCode className={`w-4 h-4 absolute ${isAr ? 'right-3' : 'left-3'} top-3 text-slate-400`} />
            <input
              type="text"
              value={scannedVal}
              placeholder={isAr ? 'مسح رمز الباركود / QR' : 'Scan Barcode / QR Code'}
              onChange={(e) => {
                setScannedVal(e.target.value);
                if (onChange) onChange(e.target.value);
              }}
              disabled={effectiveDisabled}
              className={`w-full py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl ${
                isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
          </div>
          <button
            type="button"
            disabled={effectiveDisabled}
            onClick={handleSimulateScan}
            className="px-3 py-2.5 text-xs font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700 shrink-0 transition-colors"
          >
            {isAr ? 'مسح ضوئي' : 'Scan'}
          </button>
        </div>
      </EnterpriseInputWrapper>
    );
  }

  // Fallback signature pad simulator
  return (
    <EnterpriseInputWrapper {...props}>
      <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-400">
        <PenTool className="w-4 h-4" />
        <span>{isAr ? 'منطقة التوقيع الإلكتروني' : 'Digital Signature Area'}</span>
      </div>
    </EnterpriseInputWrapper>
  );
};
