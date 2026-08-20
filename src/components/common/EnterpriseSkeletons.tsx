/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Skeleton System
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Loading Experience
 * Version: 1.0
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const BaseSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200/80 rounded-lg ${className}`}
    aria-hidden="true"
  />
);

export const DashboardSkeleton: React.FC<{ isAr?: boolean }> = ({ isAr = false }) => (
  <div className="w-full space-y-6" dir={isAr ? 'rtl' : 'ltr'} aria-busy="true" aria-label="Loading dashboard">
    {/* KPI Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <BaseSkeleton className="h-4 w-24" />
            <BaseSkeleton className="h-8 w-8 rounded-xl" />
          </div>
          <BaseSkeleton className="h-8 w-32" />
          <BaseSkeleton className="h-3 w-20" />
        </div>
      ))}
    </div>

    {/* Main Analytics + Side List */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <BaseSkeleton className="h-6 w-40" />
          <BaseSkeleton className="h-8 w-28 rounded-lg" />
        </div>
        <BaseSkeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
        <BaseSkeleton className="h-6 w-32" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
              <div className="space-y-1">
                <BaseSkeleton className="h-4 w-28" />
                <BaseSkeleton className="h-3 w-16" />
              </div>
              <BaseSkeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 6, cols = 5 }) => (
  <div className="w-full rounded-2xl border border-white/10 overflow-hidden bg-slate-900/60" aria-busy="true">
    {/* Header */}
    <div className="p-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
      <BaseSkeleton className="h-5 w-36" />
      <div className="flex items-center gap-2">
        <BaseSkeleton className="h-8 w-24 rounded-lg" />
        <BaseSkeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
    {/* Columns Header */}
    <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-white/5 bg-slate-900/40">
      {Array.from({ length: cols }).map((_, i) => (
        <BaseSkeleton key={i} className="h-4 w-20" />
      ))}
    </div>
    {/* Rows */}
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid grid-cols-5 gap-4 px-6 py-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <BaseSkeleton key={c} className={`h-4 ${c === 0 ? 'w-28 font-bold' : 'w-20'}`} />
          ))}
        </div>
      ))}
    </div>
    {/* Footer Pagination */}
    <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-950/40">
      <BaseSkeleton className="h-4 w-32" />
      <div className="flex items-center gap-2">
        <BaseSkeleton className="h-8 w-8 rounded-lg" />
        <BaseSkeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="w-full p-6 rounded-2xl border border-white/10 bg-slate-900/60 space-y-6" aria-busy="true">
    <div className="space-y-2">
      <BaseSkeleton className="h-6 w-48" />
      <BaseSkeleton className="h-4 w-72" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <BaseSkeleton className="h-4 w-24" />
          <BaseSkeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
    <div className="space-y-2">
      <BaseSkeleton className="h-4 w-28" />
      <BaseSkeleton className="h-24 w-full rounded-xl" />
    </div>
    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
      <BaseSkeleton className="h-10 w-24 rounded-xl" />
      <BaseSkeleton className="h-10 w-32 rounded-xl" />
    </div>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 space-y-4" aria-busy="true">
    <div className="flex items-center justify-between">
      <BaseSkeleton className="h-5 w-32" />
      <BaseSkeleton className="h-6 w-16 rounded-full" />
    </div>
    <BaseSkeleton className="h-4 w-full" />
    <BaseSkeleton className="h-4 w-3/4" />
    <div className="pt-2 flex items-center justify-between">
      <BaseSkeleton className="h-4 w-20" />
      <BaseSkeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);

export const DetailsSkeleton: React.FC = () => (
  <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 space-y-6" aria-busy="true">
    <div className="flex items-center justify-between border-b border-white/10 pb-4">
      <div className="space-y-2">
        <BaseSkeleton className="h-7 w-56" />
        <BaseSkeleton className="h-4 w-32" />
      </div>
      <BaseSkeleton className="h-9 w-28 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl bg-slate-800/40 space-y-1">
          <BaseSkeleton className="h-3 w-16" />
          <BaseSkeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
    <div className="space-y-3">
      <BaseSkeleton className="h-5 w-36" />
      <BaseSkeleton className="h-32 w-full rounded-xl" />
    </div>
  </div>
);

export const TimelineSkeleton: React.FC = () => (
  <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 space-y-6" aria-busy="true">
    <BaseSkeleton className="h-6 w-40" />
    <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-start pl-8 relative">
          <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-slate-700" />
          <div className="space-y-1 flex-1">
            <BaseSkeleton className="h-4 w-36" />
            <BaseSkeleton className="h-3 w-64" />
            <BaseSkeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
