/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Data View Bar
 * Phase: Enterprise UI System
 * Module: Data Views, Saved Views & Personalization (STEP 05.16)
 * Version: 1.0
 */

import React from 'react';
import { DataViewResourceAdapter, EnterpriseDataView } from '../../types/dataViewFramework';
import { EnterpriseQueryState } from '../../types/queryFramework';
import { TableDensity } from '../../types/tableFramework';
import { EnterpriseDataViewSelector } from './EnterpriseDataViewSelector';

export interface EnterpriseDataViewBarProps {
  adapter: DataViewResourceAdapter;
  views: EnterpriseDataView[];
  systemViews: EnterpriseDataView[];
  userViews: EnterpriseDataView[];
  sharedViews: EnterpriseDataView[];
  activeView: EnterpriseDataView;
  currentQuery: EnterpriseQueryState;
  visibleColumns: string[];
  columnOrder: string[];
  density: TableDensity;
  isModified: boolean;
  isAr?: boolean;
  onActivateView: (viewId: string) => void;
  onSaveCurrentView: (customNameEn?: string, customNameAr?: string, isDefault?: boolean) => Promise<any>;
  onSaveViewAs: (nameEn: string, nameAr: string, isDefault?: boolean) => Promise<any>;
  onDeleteView: (viewId: string) => Promise<any>;
  onSetDefaultView: (viewId: string) => Promise<any>;
  onResetActiveView: () => void;
  onVisibleColumnsChange: (cols: string[]) => void;
  onColumnOrderChange: (order: string[]) => void;
  onDensityChange: (density: TableDensity) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const EnterpriseDataViewBar: React.FC<EnterpriseDataViewBarProps> = (props) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100">
      <div className="flex items-center gap-3">
        <EnterpriseDataViewSelector {...props} />
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>
          {props.isAr ? 'عرض الأعمدة:' : 'Active Columns:'}{' '}
          <strong className="text-[#00F0FF]">{props.visibleColumns.length}</strong>
        </span>
        <span className="text-slate-700">•</span>
        <span>
          {props.isAr ? 'الكثافة:' : 'Density:'}{' '}
          <strong className="text-slate-200 capitalize">{props.density}</strong>
        </span>
      </div>
    </div>
  );
};
