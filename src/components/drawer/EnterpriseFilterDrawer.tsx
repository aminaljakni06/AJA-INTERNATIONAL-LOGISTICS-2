/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Filter Drawer Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Business Interaction Patterns
 * Version: 1.0
 */

import React from 'react';
import { Filter } from 'lucide-react';
import { EnterpriseFilterDrawerProps } from '../../types/drawerBusinessFramework';
import { DrawerHeader } from './DrawerHeader';
import { DrawerBody } from './DrawerBody';
import { DrawerFilters } from './DrawerFilters';
import { EnterpriseDrawer } from './EnterpriseDrawer';

export const EnterpriseFilterDrawer: React.FC<EnterpriseFilterDrawerProps> = ({
  id,
  isOpen,
  onClose,
  titleEn = 'Filter Records',
  titleAr = 'تصفية السجلات',
  filterGroups,
  draftValues,
  activeCount,
  onChangeField,
  onApply,
  onReset,
  size = 'md',
  position = 'right',
  isAr = false,
}) => {
  const handleApply = () => {
    onApply();
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
        descriptionEn="Specify filter criteria to refine search and table records"
        descriptionAr="حدد معايير التصفية لتحديد البحث وسجلات الجدول"
        icon={<Filter className="w-5 h-5 text-brand-navy dark:text-brand-gold" />}
        onClose={onClose}
        isAr={isAr}
      />

      <DrawerBody isAr={isAr}>
        <DrawerFilters
          groups={filterGroups}
          draftValues={draftValues}
          activeCount={activeCount}
          onChangeField={onChangeField}
          onApplyFilters={handleApply}
          onResetFilters={onReset}
          isAr={isAr}
        />
      </DrawerBody>
    </EnterpriseDrawer>
  );
};
