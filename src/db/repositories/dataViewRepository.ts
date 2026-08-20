/**
 * AJA INTERNATIONAL LOGISTICS — Data View Repository
 * Phase: Enterprise UI System
 * Module: Data Views, Saved Views & Personalization (STEP 05.16)
 * Version: 1.0
 */

import { EnterpriseDataView } from '../../types/dataViewFramework';
import { normalizeDataView } from '../../lib/dataView/enterpriseDataViewEngine';
import { getResourceAdapter } from '../../lib/dataView/resourceAdapters';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const DATA_VIEWS_COLLECTION = 'data_views';

// In-memory cache store for offline/fast retrieval fallback
const inMemoryDataViews = new Map<string, EnterpriseDataView>();

function useLocalDataViewStore(): boolean {
  return (
    process.env.FORCE_LOCAL_DATA_FALLBACK === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true')
  );
}

function appendVisibleCachedViews(
  views: EnterpriseDataView[],
  resource: string,
  userId?: string
): void {
  Array.from(inMemoryDataViews.values()).forEach((v) => {
    if (v.resource !== resource || v.id === getResourceAdapter(resource).systemDefaultView.id) {
      return;
    }

    const isSystem = v.ownerType === 'SYSTEM' || v.visibility === 'SYSTEM';
    const isOwnView = userId && (v.ownerId === userId || v.createdBy === userId);
    const isShared = v.visibility === 'SHARED' || v.visibility === 'ORGANIZATION';

    if ((isSystem || isOwnView || isShared) && !views.some((existing) => existing.id === v.id)) {
      views.push(v);
    }
  });
}

/**
 * List all data views for a given resource available to a user
 */
export async function listDataViewsByResource(
  resource: string,
  userId?: string
): Promise<EnterpriseDataView[]> {
  const adapter = getResourceAdapter(resource);
  const views: EnterpriseDataView[] = [];

  // Always include System Default View
  views.push(adapter.systemDefaultView);

  if (useLocalDataViewStore()) {
    appendVisibleCachedViews(views, resource, userId);
    return views;
  }

  try {
    const snap = await getAdminFirestore()
      .collection(DATA_VIEWS_COLLECTION)
      .where('resource', '==', resource)
      .get();

    snap.docs.forEach((d: any) => {
      const data = d.data() as EnterpriseDataView;
      const normalized = normalizeDataView(data, adapter);

      // Visibility filter: System views, User's own views, or Shared views
      const isSystem = normalized.ownerType === 'SYSTEM' || normalized.visibility === 'SYSTEM';
      const isOwnView = userId && (normalized.ownerId === userId || normalized.createdBy === userId);
      const isShared = normalized.visibility === 'SHARED' || normalized.visibility === 'ORGANIZATION';

      if (isSystem || isOwnView || isShared) {
        // Avoid duplicate system default
        if (normalized.id !== adapter.systemDefaultView.id) {
          views.push(normalized);
          inMemoryDataViews.set(normalized.id, normalized);
        }
      }
    });
  } catch (err) {
    console.warn('[DataViewRepository] Firestore fetch fallback to in-memory/defaults:', err);
    appendVisibleCachedViews(views, resource, userId);
  }

  return views;
}

/**
 * Get a specific Data View by ID
 */
export async function getDataViewById(
  id: string,
  resource?: string
): Promise<EnterpriseDataView | null> {
  if (!id) return null;

  // Check system default views first
  if (id.startsWith('system-default-')) {
    const resKey = resource || id.replace('system-default-', '');
    const adapter = getResourceAdapter(resKey);
    return adapter.systemDefaultView;
  }

  // Check in-memory
  if (inMemoryDataViews.has(id)) {
    return inMemoryDataViews.get(id)!;
  }

  if (useLocalDataViewStore()) {
    return null;
  }

  try {
    const snap = await getAdminFirestore().collection(DATA_VIEWS_COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    const data = snap.data() as EnterpriseDataView;
    const normalized = normalizeDataView(data);
    inMemoryDataViews.set(normalized.id, normalized);
    return normalized;
  } catch (err) {
    console.warn('[DataViewRepository] Error fetching view by ID:', err);
    return null;
  }
}

/**
 * Create a new Data View
 */
export async function createDataViewInRepo(
  dataView: EnterpriseDataView
): Promise<EnterpriseDataView> {
  const adapter = getResourceAdapter(dataView.resource);
  const normalized = normalizeDataView(dataView, adapter);

  if (!useLocalDataViewStore()) {
    try {
      await getAdminFirestore().collection(DATA_VIEWS_COLLECTION).doc(normalized.id).set(normalized);
    } catch (err) {
      console.warn('[DataViewRepository] Firestore save warning, persisted in memory:', err);
    }
  }

  inMemoryDataViews.set(normalized.id, normalized);
  return normalized;
}

/**
 * Update an existing Data View
 */
export async function updateDataViewInRepo(
  id: string,
  updates: Partial<EnterpriseDataView>
): Promise<EnterpriseDataView> {
  const existing = await getDataViewById(id, updates.resource);
  if (!existing) {
    throw new Error(`Data View with ID ${id} not found.`);
  }

  if (existing.isSystem || existing.ownerType === 'SYSTEM') {
    throw new Error('System Data Views cannot be modified. Use "Save As" to create a copy.');
  }

  const updatedView: EnterpriseDataView = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const adapter = getResourceAdapter(updatedView.resource);
  const normalized = normalizeDataView(updatedView, adapter);

  if (!useLocalDataViewStore()) {
    try {
      await getAdminFirestore().collection(DATA_VIEWS_COLLECTION).doc(normalized.id).set(normalized);
    } catch (err) {
      console.warn('[DataViewRepository] Firestore update warning:', err);
    }
  }

  inMemoryDataViews.set(normalized.id, normalized);
  return normalized;
}

/**
 * Delete a Data View
 */
export async function deleteDataViewInRepo(id: string, resource?: string): Promise<void> {
  const existing = await getDataViewById(id, resource);
  if (existing && (existing.isSystem || existing.ownerType === 'SYSTEM')) {
    throw new Error('System Data Views cannot be deleted.');
  }

  if (!useLocalDataViewStore()) {
    try {
      await getAdminFirestore().collection(DATA_VIEWS_COLLECTION).doc(id).delete();
    } catch (err) {
      console.warn('[DataViewRepository] Firestore delete warning:', err);
    }
  }

  inMemoryDataViews.delete(id);
}
