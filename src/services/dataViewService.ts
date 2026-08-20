/**
 * AJA INTERNATIONAL LOGISTICS — Data View Application Service
 * Phase: Enterprise UI System
 * Module: Data Views, Saved Views & Personalization (STEP 05.16)
 * Version: 1.0
 */

import {
  EnterpriseDataView,
  CreateDataViewPayload,
  UpdateDataViewPayload,
} from '../types/dataViewFramework';
import {
  listDataViewsByResource,
  getDataViewById,
  createDataViewInRepo,
  updateDataViewInRepo,
  deleteDataViewInRepo,
} from '../db/repositories/dataViewRepository';
import { normalizeDataView } from '../lib/dataView/enterpriseDataViewEngine';
import { getResourceAdapter } from '../lib/dataView/resourceAdapters';
import { validateServerQuery } from '../lib/query/enterpriseQueryEngine';

export class DataViewService {
  /**
   * Fetch all views for a resource
   */
  static async listViews(resource: string, userId?: string): Promise<EnterpriseDataView[]> {
    if (!resource) {
      throw new Error('Resource identifier is required.');
    }
    return listDataViewsByResource(resource, userId);
  }

  /**
   * Fetch a single Data View by ID
   */
  static async getViewById(id: string, resource?: string): Promise<EnterpriseDataView | null> {
    return getDataViewById(id, resource);
  }

  /**
   * Create a new custom or shared Data View
   */
  static async createView(
    payload: CreateDataViewPayload,
    userId: string,
    userName?: string
  ): Promise<EnterpriseDataView> {
    if (!payload.resource) {
      throw new Error('Resource is required to save a Data View.');
    }
    if (!payload.nameEn?.trim() && !payload.nameAr?.trim()) {
      throw new Error('Data View must have a valid name.');
    }

    const adapter = getResourceAdapter(payload.resource);

    // Validate query security
    if (payload.query) {
      const validation = validateServerQuery(
        {
          search: payload.query.search || '',
          filters: payload.query.filters || {},
          sort: payload.query.sort || null,
          pagination: { page: 1, pageSize: payload.query.pageSize || 25 },
        },
        {
          allowedFilterKeys: adapter.allowedFilters,
          allowedSortFields: adapter.allowedSortFields,
        }
      );

      if (!validation.isValid) {
        throw new Error(
          validation.validationErrors?.[0]?.messageEn || 'Invalid query configuration for saved view.'
        );
      }
    }

    const nowISO = new Date().toISOString();
    const id = `dv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const rawView: Partial<EnterpriseDataView> = {
      id,
      schemaVersion: 1,
      resource: payload.resource,
      nameEn: payload.nameEn || payload.nameAr || 'Custom View',
      nameAr: payload.nameAr || payload.nameEn || 'عرض مخصص',
      descriptionEn: payload.descriptionEn || '',
      descriptionAr: payload.descriptionAr || '',
      ownerType: 'USER',
      ownerId: userId,
      visibility: payload.visibility || 'PRIVATE',
      isDefault: Boolean(payload.isDefault),
      isSystem: false,
      query: payload.query || {},
      table: payload.table || {},
      createdAt: nowISO,
      updatedAt: nowISO,
      createdBy: userName || userId,
      updatedBy: userName || userId,
    };

    const normalized = normalizeDataView(rawView, adapter);

    // If marked as user default, reset other non-system user defaults for this user & resource
    if (normalized.isDefault) {
      await this.resetUserDefaults(payload.resource, userId);
    }

    return createDataViewInRepo(normalized);
  }

  /**
   * Update an existing custom Data View
   */
  static async updateView(
    id: string,
    payload: UpdateDataViewPayload,
    userId: string,
    userName?: string
  ): Promise<EnterpriseDataView> {
    const existing = await getDataViewById(id);
    if (!existing) {
      throw new Error(`Data View ${id} not found.`);
    }

    if (existing.isSystem || existing.ownerType === 'SYSTEM') {
      throw new Error('System views are read-only and cannot be modified.');
    }

    // Security check: only owner or shared updater
    if (existing.ownerId && existing.ownerId !== userId) {
      throw new Error('You do not have permission to modify this Data View.');
    }

    const adapter = getResourceAdapter(existing.resource);

    // If marked as user default, reset other user defaults
    if (payload.isDefault && !existing.isDefault) {
      await this.resetUserDefaults(existing.resource, userId);
    }

    const updates: Partial<EnterpriseDataView> = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: userName || userId,
    };

    return updateDataViewInRepo(id, updates);
  }

  /**
   * Duplicate a Data View (Save As)
   */
  static async duplicateView(
    sourceViewId: string,
    newNameEn: string,
    newNameAr: string,
    userId: string,
    userName?: string
  ): Promise<EnterpriseDataView> {
    const source = await getDataViewById(sourceViewId);
    if (!source) {
      throw new Error(`Source Data View ${sourceViewId} not found.`);
    }

    return this.createView(
      {
        resource: source.resource,
        nameEn: newNameEn,
        nameAr: newNameAr,
        descriptionEn: source.descriptionEn ? `${source.descriptionEn} (Copy)` : 'Copy of view',
        descriptionAr: source.descriptionAr ? `${source.descriptionAr} (نسخة)` : 'نسخة من العرض',
        visibility: 'PRIVATE',
        isDefault: false,
        query: source.query,
        table: source.table,
      },
      userId,
      userName
    );
  }

  /**
   * Delete a Data View
   */
  static async deleteView(id: string, userId: string, resource?: string): Promise<void> {
    const existing = await getDataViewById(id, resource);
    if (!existing) return;

    if (existing.isSystem || existing.ownerType === 'SYSTEM') {
      throw new Error('System views cannot be deleted.');
    }

    if (existing.ownerId && existing.ownerId !== userId) {
      throw new Error('You do not have permission to delete this Data View.');
    }

    return deleteDataViewInRepo(id, resource);
  }

  /**
   * Set or Clear default view for a user and resource
   */
  static async setDefaultView(viewId: string, userId: string, resource: string): Promise<void> {
    await this.resetUserDefaults(resource, userId);

    const target = await getDataViewById(viewId, resource);
    if (target && !target.isSystem) {
      await updateDataViewInRepo(viewId, { isDefault: true, updatedAt: new Date().toISOString() });
    }
  }

  /**
   * Private helper to reset existing user default flags
   */
  private static async resetUserDefaults(resource: string, userId: string): Promise<void> {
    const userViews = await listDataViewsByResource(resource, userId);
    for (const v of userViews) {
      if (!v.isSystem && v.isDefault) {
        await updateDataViewInRepo(v.id, { isDefault: false });
      }
    }
  }
}
