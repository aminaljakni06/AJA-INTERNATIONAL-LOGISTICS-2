/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Input Components Framework Types
 * Phase: Enterprise UI System
 * Module: Enterprise Input Components System
 * Version: 1.0
 */

import { ReactNode } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'outlined' | 'filled' | 'underlined' | 'ghost';
export type InputState = 'default' | 'focused' | 'hovered' | 'disabled' | 'readOnly' | 'loading' | 'valid' | 'invalid' | 'warning';

export interface InputMetadata {
  fieldId: string;
  fieldName: string;
  labelEn: string;
  labelAr: string;
  placeholderEn?: string;
  placeholderAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  tooltipEn?: string;
  tooltipAr?: string;
  helpTextEn?: string;
  helpTextAr?: string;
  required?: boolean;
  optional?: boolean;
  automationId?: string;
  analyticsKey?: string;
}

export interface PermissionState {
  canView?: boolean;
  canEdit?: boolean;
  isHidden?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  permissionKey?: string;
}

export interface ValidationState {
  isValid?: boolean;
  hasWarning?: boolean;
  errorEn?: string;
  errorAr?: string;
  warningEn?: string;
  warningAr?: string;
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export interface BaseInputProps extends InputMetadata, PermissionState, ValidationState {
  value?: any;
  defaultValue?: any;
  onChange?: (value: any) => void;
  onBlur?: (e: any) => void;
  onFocus?: (e: any) => void;
  size?: InputSize;
  variant?: InputVariant;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  className?: string;
  inputClassName?: string;
  isAr?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  clearable?: boolean;
  copyable?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
  autoFocus?: boolean;
  tabIndex?: number;
}

export interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'phone' | 'number' | 'currency' | 'percent' | 'url' | 'username' | 'hidden' | 'masked';
  maskPattern?: string; // e.g. "+966 ## ### ####"
  currencyCode?: string; // e.g. "SAR", "USD"
  min?: number;
  max?: number;
  step?: number;
  rows?: number; // if textarea mode
  multiline?: boolean;
}

export interface SelectOption {
  value: string | number;
  labelEn: string;
  labelAr: string;
  disabled?: boolean;
  icon?: ReactNode;
  badgeEn?: string;
  badgeAr?: string;
  groupEn?: string;
  groupAr?: string;
  meta?: Record<string, any>;
}

export interface SelectInputProps extends BaseInputProps {
  options: SelectOption[];
  multiple?: boolean;
  searchable?: boolean;
  combobox?: boolean;
  mode?: 'select' | 'combobox' | 'radio' | 'checkbox' | 'switch' | 'segmented' | 'tags';
  maxTags?: number;
  placeholderSearchEn?: string;
  placeholderSearchAr?: string;
}

export interface DateInputProps extends BaseInputProps {
  mode?: 'date' | 'time' | 'datetime' | 'daterange' | 'month' | 'year' | 'timezone';
  minDate?: string;
  maxDate?: string;
  formatPattern?: string;
  timezone?: string;
  presetRanges?: { labelEn: string; labelAr: string; range: [string, string] }[];
}

export interface UploadInputProps extends BaseInputProps {
  acceptTypes?: string[]; // e.g. ['.pdf', '.xlsx', 'image/*']
  maxSizeBytes?: number;
  maxFiles?: number;
  uploadCategory?: 'file' | 'image' | 'document' | 'pdf' | 'excel' | 'csv';
  dragDrop?: boolean;
  onUpload?: (files: File[]) => Promise<void> | void;
  existingFiles?: { id: string; name: string; sizeBytes: number; url?: string }[];
  onRemoveFile?: (id: string) => void;
}

export interface AdvancedInputProps extends BaseInputProps {
  mode?: 'otp' | 'pin' | 'rating' | 'slider' | 'color' | 'signature' | 'barcode' | 'qr' | 'map';
  otpLength?: number;
  ratingStars?: number;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
}
