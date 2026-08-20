/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Tabs Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Interaction System
 * Version: 1.0
 */

import React, { useState } from 'react';
import { DrawerTabsProps, DrawerTab } from '../../types/drawerInteractionFramework';

export const DrawerTabs: React.FC<DrawerTabsProps> = ({
  tabs,
  activeTabId,
  onChangeTab,
  isAr = false,
  density = 'comfortable',
  variant = 'underline',
  className = '',
}) => {
  const visibleTabs = tabs.filter((t) => t.visible !== false);
  const [internalActiveId, setInternalActiveId] = useState<string>(
    activeTabId || (visibleTabs[0] ? visibleTabs[0].id : '')
  );

  const currentTabId = activeTabId !== undefined ? activeTabId : internalActiveId;

  const handleSelectTab = (tab: DrawerTab) => {
    if (tab.disabled) return;
    if (onChangeTab) {
      onChangeTab(tab.id);
    } else {
      setInternalActiveId(tab.id);
    }
  };

  const getPaddingClass = () => {
    switch (density) {
      case 'compact':
        return 'px-3 py-1.5 text-xs';
      case 'spacious':
        return 'px-6 py-3 text-sm';
      case 'comfortable':
      default:
        return 'px-4 py-2.5 text-sm';
    }
  };

  const activeTab = visibleTabs.find((t) => t.id === currentTabId);

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className={`w-full flex flex-col ${className}`}>
      {/* Navigation Tab Bar */}
      <div className="border-b border-border-default bg-surface-primary/95 sticky top-0 z-10 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1 px-4" aria-label="Drawer Navigation Tabs">
          {visibleTabs.map((tab) => {
            const isActive = tab.id === currentTabId;
            const label = isAr ? tab.labelAr || tab.labelEn : tab.labelEn;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab)}
                disabled={tab.disabled}
                className={`relative flex items-center gap-2 font-medium transition-all whitespace-nowrap cursor-pointer rounded-t-lg focus:outline-hidden focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-gold ${getPaddingClass()} ${
                  isActive
                    ? 'text-brand-navy dark:text-brand-gold font-semibold border-b-2 border-brand-navy dark:border-brand-gold bg-brand-navy/5 dark:bg-brand-gold/10'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary/60'
                } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
                <span>{label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-xs rounded-full font-bold ${
                      isActive
                        ? 'bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy'
                        : 'bg-surface-secondary text-text-muted border border-border-default'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Active Content Area */}
      {activeTab && activeTab.content && (
        <div className="flex-1 py-4">{activeTab.content}</div>
      )}
    </div>
  );
};
