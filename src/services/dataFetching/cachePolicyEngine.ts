/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Cache Policy Engine
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Data Fetching & Cache Layer
 * Version: 1.0
 */

import { AdvancedCacheEntry, CachePolicy } from '../../types/dataFetchingFramework';

class EnterpriseCachePolicyEngine {
  private memoryCache: Map<string, AdvancedCacheEntry> = new Map();
  private maxMemoryEntries: number = 1000;
  private defaultTTLMs: number = 5 * 60 * 1000; // 5 mins

  /**
   * Set item in memory and optionally browser persistent cache
   */
  public set<T>(
    key: string,
    data: T,
    options?: {
      ttlMs?: number;
      tags?: string[];
      module?: string;
      companyId?: string;
      persistOffline?: boolean;
    }
  ): void {
    const ttl = options?.ttlMs ?? this.defaultTTLMs;
    const entry: AdvancedCacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttlMs: ttl,
      tags: options?.tags || [],
      module: options?.module,
      companyId: options?.companyId,
      isStale: false,
    };

    // LRU eviction if capacity exceeded
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) this.memoryCache.delete(oldestKey);
    }

    this.memoryCache.set(key, entry);

    if (options?.persistOffline) {
      try {
        localStorage.setItem(`aja_cache_${key}`, JSON.stringify(entry));
      } catch (err) {
        // Safe fallback if localstorage is full or disabled
      }
    }
  }

  /**
   * Retrieve item based on policy and freshness
   */
  public get<T>(
    key: string,
    policy: CachePolicy = 'cache-first'
  ): { data: T | null; isStale: boolean; hit: boolean } {
    if (policy === 'no-cache' || policy === 'network-only') {
      return { data: null, isStale: false, hit: false };
    }

    let entry = this.memoryCache.get(key) as AdvancedCacheEntry<T> | undefined;

    // Check localStorage fallback if missing in memory
    if (!entry) {
      try {
        const stored = localStorage.getItem(`aja_cache_${key}`);
        if (stored) {
          entry = JSON.parse(stored) as AdvancedCacheEntry<T>;
          this.memoryCache.set(key, entry); // Hydrate back to memory
        }
      } catch (err) {
        // Safe catch
      }
    }

    if (!entry) {
      return { data: null, isStale: false, hit: false };
    }

    const age = Date.now() - entry.timestamp;
    const isExpired = age > entry.ttlMs;

    if (policy === 'cache-only') {
      return { data: isExpired ? null : entry.data, isStale: isExpired, hit: !isExpired };
    }

    if (policy === 'stale-while-revalidate') {
      // Return cached data even if stale, mark isStale = true
      return { data: entry.data, isStale: isExpired, hit: true };
    }

    if (isExpired) {
      this.memoryCache.delete(key);
      try {
        localStorage.removeItem(`aja_cache_${key}`);
      } catch (err) {
        // Ignore
      }
      return { data: null, isStale: true, hit: false };
    }

    return { data: entry.data, isStale: false, hit: true };
  }

  /**
   * Tag-based bulk cache invalidation (e.g. 'shipments', 'quotes', 'finance')
   */
  public invalidateTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags && entry.tags.includes(tag)) {
        this.memoryCache.delete(key);
        try {
          localStorage.removeItem(`aja_cache_${key}`);
        } catch (err) {
          // Ignore
        }
        count++;
      }
    }
    return count;
  }

  /**
   * Module-based cache invalidation
   */
  public invalidateModule(moduleName: string): number {
    let count = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.module === moduleName) {
        this.memoryCache.delete(key);
        try {
          localStorage.removeItem(`aja_cache_${key}`);
        } catch (err) {
          // Ignore
        }
        count++;
      }
    }
    return count;
  }

  /**
   * Tenant isolation cache invalidation
   */
  public invalidateTenant(companyId: string): number {
    let count = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.companyId === companyId) {
        this.memoryCache.delete(key);
        try {
          localStorage.removeItem(`aja_cache_${key}`);
        } catch (err) {
          // Ignore
        }
        count++;
      }
    }
    return count;
  }

  /**
   * Single key deletion
   */
  public delete(key: string): boolean {
    const deletedMemory = this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`aja_cache_${key}`);
    } catch (err) {
      // Ignore
    }
    return deletedMemory;
  }

  /**
   * Clear all cache
   */
  public clear(): void {
    this.memoryCache.clear();
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('aja_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (err) {
      // Safe catch
    }
  }
}

export const cachePolicyEngine = new EnterpriseCachePolicyEngine();
