/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Cache Abstraction Layer
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { CacheEntry, CacheOptions } from '../types/sharedServices';

class EnterpriseCacheEngine {
  private cache: Map<string, CacheEntry> = new Map();
  private maxEntries: number = 500;
  private defaultTTLMs: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Set cache entry
   */
  public set<T>(key: string, data: T, options?: CacheOptions): void {
    const ttl = options?.ttlMs ?? this.defaultTTLMs;
    const tags = options?.tags ?? [];

    // Enforce max entries eviction (LRU-like oldest entry removal)
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      key,
      data,
      timestamp: Date.now(),
      ttlMs: ttl,
      tags,
    });
  }

  /**
   * Get cache entry if valid and not expired
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if valid cache key exists
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific cache entry
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate all entries matching tag (e.g., 'shipments', 'customers')
   */
  public invalidateTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Invalidate entries matching key prefix or regex
   */
  public invalidatePattern(pattern: RegExp | string): number {
    let count = 0;
    const isRegex = pattern instanceof RegExp;

    for (const key of this.cache.keys()) {
      const match = isRegex ? (pattern as RegExp).test(key) : key.startsWith(pattern as string);
      if (match) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get total cache entry count
   */
  public get size(): number {
    return this.cache.size;
  }
}

export const enterpriseCache = new EnterpriseCacheEngine();
