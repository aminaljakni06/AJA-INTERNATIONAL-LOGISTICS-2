/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Lookup Drawer Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Business Interaction Patterns
 * Version: 1.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Check, ListFilter, Inbox } from 'lucide-react';
import { EnterpriseLookupDrawerProps, LookupItem } from '../../types/drawerBusinessFramework';
import { DrawerHeader } from './DrawerHeader';
import { DrawerBody } from './DrawerBody';
import { DrawerFooter } from './DrawerFooter';
import { DrawerSearch } from './DrawerSearch';
import { EnterpriseDrawer } from './EnterpriseDrawer';

export const EnterpriseLookupDrawer: React.FC<EnterpriseLookupDrawerProps> = ({
  id,
  isOpen,
  onClose,
  titleEn,
  titleAr,
  items,
  selectedIds = [],
  multiSelect = false,
  isLoading = false,
  searchPlaceholderEn = 'Search lookup records...',
  searchPlaceholderAr = 'البحث في سجلات البحث...',
  onSearch,
  onSelect,
  size = 'md',
  position = 'right',
  isAr = false,
}) => {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(selectedIds);
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.titleEn.toLowerCase().includes(q) ||
        (item.titleAr && item.titleAr.includes(q)) ||
        (item.code && item.code.toLowerCase().includes(q))
    );
  }, [items, query]);

  const handleToggle = (item: LookupItem) => {
    if (item.disabled) return;

    if (multiSelect) {
      if (internalSelectedIds.includes(item.id)) {
        setInternalSelectedIds(internalSelectedIds.filter((id) => id !== item.id));
      } else {
        setInternalSelectedIds([...internalSelectedIds, item.id]);
      }
    } else {
      setInternalSelectedIds([item.id]);
      onSelect([item]);
      onClose();
    }
  };

  const handleConfirmMulti = () => {
    const selectedObjList = items.filter((item) => internalSelectedIds.includes(item.id));
    onSelect(selectedObjList);
    onClose();
  };

  return (
    <EnterpriseDrawer
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      position={position}
      isAr={isAr}
    >
      <DrawerHeader
        titleEn={titleEn}
        titleAr={titleAr}
        descriptionEn={multiSelect ? 'Select one or more items' : 'Select an item from the list'}
        descriptionAr={multiSelect ? 'اختر عنصرًا واحدًا أو أكثر' : 'اختر عنصرًا من القائمة'}
        icon={<ListFilter className="w-5 h-5 text-brand-navy dark:text-brand-gold" />}
        onClose={onClose}
        isAr={isAr}
      />

      <DrawerBody isLoading={isLoading} isAr={isAr}>
        <div className="space-y-4">
          <DrawerSearch
            value={query}
            onChange={(q) => {
              setQuery(q);
              if (onSearch) onSearch(q);
            }}
            placeholderEn={searchPlaceholderEn}
            placeholderAr={searchPlaceholderAr}
            isAr={isAr}
          />

          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-text-muted flex flex-col items-center justify-center space-y-2">
              <Inbox className="w-8 h-8 text-text-muted/50" />
              <p className="text-xs font-medium">
                {isAr ? 'لم يتم العثور على أي عناصر مطابقة' : 'No matching lookup records found'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {filteredItems.map((item) => {
                const isSelected = internalSelectedIds.includes(item.id);
                const title = isAr ? item.titleAr || item.titleEn : item.titleEn;
                const subtitle = isAr ? item.subtitleAr || item.subtitleEn : item.subtitleEn;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-brand-navy bg-brand-navy/5 dark:border-brand-gold dark:bg-brand-gold/10'
                        : 'border-border-default bg-surface-primary hover:bg-surface-secondary/60'
                    } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                          {title}
                        </h5>
                        {item.code && (
                          <span className="text-[10px] px-1.5 py-0.5 font-mono rounded-xs bg-surface-secondary text-text-muted border border-border-default">
                            {item.code}
                          </span>
                        )}
                      </div>
                      {subtitle && (
                        <p className="text-xs text-text-muted truncate mt-0.5">{subtitle}</p>
                      )}
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-brand-navy text-white border-brand-navy dark:bg-brand-gold dark:text-brand-navy dark:border-brand-gold'
                          : 'border-border-default bg-surface-primary'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DrawerBody>

      {multiSelect && (
        <DrawerFooter
          isAr={isAr}
          actions={[
            {
              id: 'cancel',
              labelEn: 'Cancel',
              labelAr: 'إلغاء',
              onClick: onClose,
            },
            {
              id: 'confirm',
              labelEn: `Confirm Selection (${internalSelectedIds.length})`,
              labelAr: `تأكيد الاختيار (${internalSelectedIds.length})`,
              onClick: handleConfirmMulti,
              variant: 'primary',
            },
          ]}
        />
      )}
    </EnterpriseDrawer>
  );
};
