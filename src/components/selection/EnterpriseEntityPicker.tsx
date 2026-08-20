/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Entity Picker Component
 * Phase: Enterprise UI System
 * Module: Enterprise Selection, Lookup & Autocomplete System
 * Version: 1.0
 */

import React, { useState } from 'react';
import { Search, X, Building2, Package, Truck, Anchor, Plus } from 'lucide-react';
import { LookupType, LookupItem } from '../../types/selectionLookupFramework';
import { EnterpriseLookupDialog } from './EnterpriseLookupDialog';
import { EnterpriseInputWrapper } from '../inputs/EnterpriseInputWrapper';

export interface EnterpriseEntityPickerProps {
  fieldId: string;
  lookupType: LookupType;
  labelEn?: string;
  labelAr?: string;
  allowMultiple?: boolean;
  value?: LookupItem[];
  onChange?: (items: LookupItem[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  isAr?: boolean;
  errorEn?: string;
  errorAr?: string;
  required?: boolean;
}

export const EnterpriseEntityPicker: React.FC<EnterpriseEntityPickerProps> = (props) => {
  const {
    fieldId,
    lookupType,
    labelEn = 'Reference Record',
    labelAr = 'السجل المرجعي',
    allowMultiple = false,
    value = [],
    onChange,
    disabled = false,
    readOnly = false,
    isAr = false,
  } = props;

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<LookupItem[]>(value);

  const handleRemoveItem = (itemId: string) => {
    if (disabled || readOnly) return;
    const next = selectedItems.filter((i) => i.id !== itemId);
    setSelectedItems(next);
    if (onChange) onChange(next);
  };

  const handleSelectFromDialog = (items: LookupItem[]) => {
    setSelectedItems(items);
    if (onChange) onChange(items);
  };

  const getIcon = () => {
    switch (lookupType) {
      case 'customer':
      case 'company':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'shipment':
      case 'container':
        return <Package className="w-4 h-4 text-sky-600" />;
      case 'carrier':
      case 'driver':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'port':
        return <Anchor className="w-4 h-4 text-indigo-600" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <EnterpriseInputWrapper fieldName={fieldId} {...props} labelEn={labelEn} labelAr={labelAr}>
      <div className="flex flex-col gap-2 w-full">
        {/* Selected Chips Container */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl min-h-[44px]">
          {selectedItems.length === 0 ? (
            <span className="text-xs text-slate-400">
              {isAr ? 'لم يتم اختيار سجل مرجعي...' : 'No reference item selected...'}
            </span>
          ) : (
            selectedItems.map((item) => (
              <div
                key={item.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-lg shadow-sm"
              >
                {getIcon()}
                <span>{isAr ? item.nameAr : item.nameEn}</span>
                <span className="text-[10px] font-mono opacity-70">({item.code})</span>
                {!disabled && !readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="hover:text-rose-500 transition-colors ml-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}

          {/* Trigger Browse Dialog Button */}
          {!disabled && !readOnly && (
            <button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="ml-auto px-3 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'استعراض السجلات' : 'Browse Records'}</span>
            </button>
          )}
        </div>

        {/* Modal Lookup Dialog */}
        <EnterpriseLookupDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          lookupType={lookupType}
          allowMultiple={allowMultiple}
          selectedIds={selectedItems.map((i) => i.id)}
          onSelectItems={handleSelectFromDialog}
          isAr={isAr}
        />
      </div>
    </EnterpriseInputWrapper>
  );
};
