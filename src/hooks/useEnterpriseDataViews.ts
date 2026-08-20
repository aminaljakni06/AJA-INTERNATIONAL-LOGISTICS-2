/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Data Views Hook
 * Phase: Enterprise UI System
 * Module: Data Views, Saved Views & Personalization (STEP 05.16)
 * Version: 1.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  EnterpriseDataView,
  TablePersonalizationConfig,
} from '../types/dataViewFramework';
import { EnterpriseQueryState } from '../types/queryFramework';
import { TableDensity } from '../types/tableFramework';
import { DataViewClient } from '../services/dataViewClient';
import { getResourceAdapter } from '../lib/dataView/resourceAdapters';
import { isDataViewModified } from '../lib/dataView/enterpriseDataViewEngine';
import { enterpriseNotificationService } from '../services/notificationService';

export interface UseEnterpriseDataViewsOptions {
  resource: string;
  userId?: string;
  userName?: string;
  onViewActivated?: (view: EnterpriseDataView) => void;
}

export function useEnterpriseDataViews({
  resource,
  userId = 'usr_default',
  userName = 'User',
  onViewActivated,
}: UseEnterpriseDataViewsOptions) {
  const adapter = useMemo(() => getResourceAdapter(resource), [resource]);

  const [views, setViews] = useState<EnterpriseDataView[]>([adapter.systemDefaultView]);
  const [activeView, setActiveView] = useState<EnterpriseDataView>(adapter.systemDefaultView);
  const [tableConfig, setTableConfig] = useState<TablePersonalizationConfig>(
    adapter.systemDefaultView.table
  );
  const [isLoadingViews, setIsLoadingViews] = useState<boolean>(true);

  // Load Views for Resource
  const refreshViews = useCallback(async () => {
    setIsLoadingViews(true);
    try {
      const fetchedViews = await DataViewClient.listViews(resource);
      setViews(fetchedViews);

      // Determine active view: Keep current if valid, else pick user default, else system default
      setActiveView((current) => {
        const foundCurrent = fetchedViews.find((v) => v.id === current.id);
        if (foundCurrent) return foundCurrent;

        const userDefault = fetchedViews.find((v) => v.isDefault && !v.isSystem);
        if (userDefault) return userDefault;

        return adapter.systemDefaultView;
      });
    } catch (err: any) {
      console.warn('[useEnterpriseDataViews] Failed to load views from API, using fallback:', err);
      setViews([adapter.systemDefaultView]);
    } finally {
      setIsLoadingViews(false);
    }
  }, [resource, userId, adapter]);

  useEffect(() => {
    refreshViews();
  }, [refreshViews]);

  // Activate View Atomically (Updates Query State and Table Personalization)
  const activateView = useCallback(
    (
      viewId: string,
      updateQueryStateFn?: (updater: (prev: EnterpriseQueryState) => Partial<EnterpriseQueryState>) => void
    ) => {
      const targetView = views.find((v) => v.id === viewId) || adapter.systemDefaultView;

      setActiveView(targetView);
      setTableConfig(targetView.table);

      // Apply saved query to Query State controller
      if (updateQueryStateFn) {
        updateQueryStateFn((_prev) => ({
          search: targetView.query.search || '',
          filters: targetView.query.filters || {},
          sort: targetView.query.sort || null,
          pagination: {
            page: 1, // Reset to page 1 on view switch
            pageSize: targetView.query.pageSize || adapter.defaultPageSize,
          },
          cursor: undefined, // Clear cursor tokens
        }));
      }

      if (onViewActivated) {
        onViewActivated(targetView);
      }

      enterpriseNotificationService.dispatch({
        category: 'SYSTEM',
        severity: 'INFO',
        type: 'data_view.activated',
        titleEn: `View Activated: ${targetView.nameEn}`,
        titleAr: `تم تفعيل العرض: ${targetView.nameAr}`,
        messageEn: `Switched active data view to "${targetView.nameEn}".`,
        messageAr: `تم الانتقال إلى عرض البيانات "${targetView.nameAr}".`,
      });
    },
    [views, adapter, onViewActivated]
  );

  // Unsaved Change Detection
  const isModified = useCallback(
    (currentQuery: EnterpriseQueryState) => {
      return isDataViewModified(activeView, currentQuery, tableConfig);
    },
    [activeView, tableConfig]
  );

  // Table Personalization Controls
  const setDensity = useCallback((density: TableDensity) => {
    setTableConfig((prev) => ({ ...prev, density }));
  }, []);

  const setVisibleColumns = useCallback((visibleColumns: string[]) => {
    setTableConfig((prev) => ({ ...prev, visibleColumns }));
  }, []);

  const setColumnOrder = useCallback((columnOrder: string[]) => {
    setTableConfig((prev) => ({ ...prev, columnOrder }));
  }, []);

  // Save Current Changes
  const saveCurrentView = useCallback(
    async (
      currentQuery: EnterpriseQueryState,
      customNameEn?: string,
      customNameAr?: string,
      isDefault?: boolean
    ) => {
      try {
        if (activeView.isSystem || activeView.ownerType === 'SYSTEM') {
          // Cannot overwrite system view -> Save As new user view
          const created = await DataViewClient.createView(
            {
              resource,
              nameEn: customNameEn || `${activeView.nameEn} (Custom)`,
              nameAr: customNameAr || `${activeView.nameAr} (مخصص)`,
              isDefault,
              query: {
                search: currentQuery.search,
                filters: currentQuery.filters,
                sort: currentQuery.sort,
                pageSize: currentQuery.pagination.pageSize,
              },
              table: tableConfig,
            },
            userId,
            userName
          );

          await refreshViews();
          setActiveView(created);

          enterpriseNotificationService.dispatch({
            category: 'SYSTEM',
            severity: 'INFO',
            type: 'data_view.saved',
            titleEn: 'Custom View Saved',
            titleAr: 'تم حفظ العرض المخصص',
            messageEn: `Saved new view "${created.nameEn}".`,
            messageAr: `تم حفظ العرض الجديد "${created.nameAr}".`,
          });
          return created;
        } else {
          // Update existing custom view
          const updated = await DataViewClient.updateView(
            activeView.id,
            {
              nameEn: customNameEn || activeView.nameEn,
              nameAr: customNameAr || activeView.nameAr,
              isDefault: isDefault !== undefined ? isDefault : activeView.isDefault,
              query: {
                search: currentQuery.search,
                filters: currentQuery.filters,
                sort: currentQuery.sort,
                pageSize: currentQuery.pagination.pageSize,
              },
              table: tableConfig,
            },
            userId,
            userName
          );

          await refreshViews();
          setActiveView(updated);

          enterpriseNotificationService.dispatch({
            category: 'SYSTEM',
            severity: 'INFO',
            type: 'data_view.updated',
            titleEn: 'View Updated',
            titleAr: 'تم تحديث العرض',
            messageEn: `Updated view "${updated.nameEn}".`,
            messageAr: `تم تحديث العرض "${updated.nameAr}".`,
          });
          return updated;
        }
      } catch (err: any) {
        enterpriseNotificationService.dispatch({
          category: 'SYSTEM',
          severity: 'CRITICAL',
          type: 'data_view.save_error',
          titleEn: 'Save View Failed',
          titleAr: 'فشل حفظ العرض',
          messageEn: err.message || 'Could not save Data View.',
          messageAr: err.message || 'تعذر حفظ عرض البيانات.',
        });
        throw err;
      }
    },
    [activeView, resource, tableConfig, userId, userName, refreshViews]
  );

  // Save As New View
  const saveViewAs = useCallback(
    async (
      nameEn: string,
      nameAr: string,
      currentQuery: EnterpriseQueryState,
      isDefault: boolean = false
    ) => {
      try {
        const created = await DataViewClient.createView(
          {
            resource,
            nameEn,
            nameAr,
            isDefault,
            query: {
              search: currentQuery.search,
              filters: currentQuery.filters,
              sort: currentQuery.sort,
              pageSize: currentQuery.pagination.pageSize,
            },
            table: tableConfig,
          },
          userId,
          userName
        );

        await refreshViews();
        setActiveView(created);

        enterpriseNotificationService.dispatch({
          category: 'SYSTEM',
          severity: 'INFO',
          type: 'data_view.created',
          titleEn: 'View Created',
          titleAr: 'تم إنشاء العرض',
          messageEn: `Created new view "${created.nameEn}".`,
          messageAr: `تم إنشاء عرض جديد "${created.nameAr}".`,
        });
        return created;
      } catch (err: any) {
        enterpriseNotificationService.dispatch({
          category: 'SYSTEM',
          severity: 'CRITICAL',
          type: 'data_view.save_as_error',
          titleEn: 'Save As Failed',
          titleAr: 'فشل حفظ العرض باسم جديد',
          messageEn: err.message || 'Failed to save view.',
          messageAr: err.message || 'فشل عملية حفظ العرض.',
        });
        throw err;
      }
    },
    [resource, tableConfig, userId, userName, refreshViews]
  );

  // Delete Active or Specific View
  const deleteView = useCallback(
    async (viewId: string) => {
      try {
        await DataViewClient.deleteView(viewId, userId, resource);
        await refreshViews();

        if (activeView.id === viewId) {
          setActiveView(adapter.systemDefaultView);
          setTableConfig(adapter.systemDefaultView.table);
        }

        enterpriseNotificationService.dispatch({
          category: 'SYSTEM',
          severity: 'INFO',
          type: 'data_view.deleted',
          titleEn: 'View Deleted',
          titleAr: 'تم حذف العرض',
          messageEn: 'The data view was deleted.',
          messageAr: 'تم حذف عرض البيانات بنجاح.',
        });
      } catch (err: any) {
        enterpriseNotificationService.dispatch({
          category: 'SYSTEM',
          severity: 'CRITICAL',
          type: 'data_view.delete_error',
          titleEn: 'Delete Failed',
          titleAr: 'فشل الحذف',
          messageEn: err.message || 'Could not delete view.',
          messageAr: err.message || 'تعذر حذف العرض.',
        });
      }
    },
    [userId, resource, activeView, adapter, refreshViews]
  );

  // Set Default View
  const setDefaultView = useCallback(
    async (viewId: string) => {
      try {
        await DataViewClient.setDefaultView(viewId, userId, resource);
        await refreshViews();

        enterpriseNotificationService.dispatch({
          category: 'SYSTEM',
          severity: 'INFO',
          type: 'data_view.default_set',
          titleEn: 'Default View Set',
          titleAr: 'تم تعيين العرض الافتراضي',
          messageEn: 'Set view as your default.',
          messageAr: 'تم تعيين العرض كافتراضي لحسابك.',
        });
      } catch (err: any) {
        console.error(err);
      }
    },
    [userId, resource, refreshViews]
  );

  // Reset View to Persisted State
  const resetActiveView = useCallback(
    (updateQueryStateFn?: (updater: (prev: EnterpriseQueryState) => Partial<EnterpriseQueryState>) => void) => {
      setTableConfig(activeView.table);

      if (updateQueryStateFn) {
        updateQueryStateFn((_prev) => ({
          search: activeView.query.search || '',
          filters: activeView.query.filters || {},
          sort: activeView.query.sort || null,
          pagination: {
            page: 1,
            pageSize: activeView.query.pageSize || adapter.defaultPageSize,
          },
          cursor: undefined,
        }));
      }
    },
    [activeView, adapter]
  );

  // Reset to System Default
  const resetToSystemDefault = useCallback(
    (updateQueryStateFn?: (updater: (prev: EnterpriseQueryState) => Partial<EnterpriseQueryState>) => void) => {
      const sysDefault = adapter.systemDefaultView;
      setActiveView(sysDefault);
      setTableConfig(sysDefault.table);

      if (updateQueryStateFn) {
        updateQueryStateFn((_prev) => ({
          search: sysDefault.query.search || '',
          filters: sysDefault.query.filters || {},
          sort: sysDefault.query.sort || null,
          pagination: {
            page: 1,
            pageSize: sysDefault.query.pageSize || adapter.defaultPageSize,
          },
          cursor: undefined,
        }));
      }
    },
    [adapter]
  );

  const systemViews = useMemo(() => views.filter((v) => v.isSystem || v.ownerType === 'SYSTEM'), [views]);
  const userViews = useMemo(() => views.filter((v) => !v.isSystem && v.visibility === 'PRIVATE'), [views]);
  const sharedViews = useMemo(
    () => views.filter((v) => !v.isSystem && (v.visibility === 'SHARED' || v.visibility === 'ORGANIZATION')),
    [views]
  );

  return {
    resourceAdapter: adapter,
    views,
    systemViews,
    userViews,
    sharedViews,
    activeView,
    tableConfig,
    density: tableConfig.density || 'comfortable',
    visibleColumns: tableConfig.visibleColumns || adapter.defaultColumns,
    columnOrder: tableConfig.columnOrder || adapter.defaultColumns,
    isLoadingViews,
    // Actions
    activateView,
    isModified,
    setDensity,
    setVisibleColumns,
    setColumnOrder,
    saveCurrentView,
    saveViewAs,
    deleteView,
    setDefaultView,
    resetActiveView,
    resetToSystemDefault,
    refreshViews,
  };
}
