/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Global Drawer Registry
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer / Side Panel Foundation
 * Version: 1.0
 */

import React from 'react';
import { DrawerType, DrawerRegistryEntry } from '../../types/drawerFramework';
import { EnterpriseDrawer } from '../../components/drawer/EnterpriseDrawer';

class DrawerRegistryClass {
  private registry: Map<DrawerType, DrawerRegistryEntry> = new Map();

  constructor() {
    this.registerDefaults();
  }

  /**
   * Register default enterprise drawer components
   */
  private registerDefaults() {
    this.register({
      type: 'standard',
      component: EnterpriseDrawer,
      defaultPosition: 'right',
      defaultSize: 'md',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'detail',
      component: EnterpriseDrawer,
      defaultPosition: 'right',
      defaultSize: 'lg',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'form',
      component: EnterpriseDrawer,
      defaultPosition: 'right',
      defaultSize: 'lg',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'filter',
      component: EnterpriseDrawer,
      defaultPosition: 'right',
      defaultSize: 'sm',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'inspector',
      component: EnterpriseDrawer,
      defaultPosition: 'right',
      defaultSize: 'md',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'navigation',
      component: EnterpriseDrawer,
      defaultPosition: 'left',
      defaultSize: 'sm',
      defaultPriority: 'high',
    });

    this.register({
      type: 'context',
      component: EnterpriseDrawer,
      defaultPosition: 'right',
      defaultSize: 'md',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'workflow',
      component: EnterpriseDrawer,
      defaultPosition: 'right',
      defaultSize: 'xl',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'attachment',
      component: EnterpriseDrawer,
      defaultPosition: 'right',
      defaultSize: 'lg',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'custom',
      component: EnterpriseDrawer,
      defaultPosition: 'right',
      defaultSize: 'md',
      defaultPriority: 'normal',
    });
  }

  /**
   * Register a new or custom drawer component
   */
  public register(entry: DrawerRegistryEntry): void {
    this.registry.set(entry.type, entry);
  }

  /**
   * Get registered entry for a given drawer type
   */
  public get(type: DrawerType): DrawerRegistryEntry | undefined {
    return this.registry.get(type);
  }

  /**
   * Check if a type is registered
   */
  public has(type: DrawerType): boolean {
    return this.registry.has(type);
  }

  /**
   * Get all registered drawer types
   */
  public getRegisteredTypes(): DrawerType[] {
    return Array.from(this.registry.keys());
  }
}

export const DrawerRegistry = new DrawerRegistryClass();
