/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Global Drawer Host Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer / Side Panel Foundation
 * Version: 1.0
 */

import React, { useEffect, useState } from 'react';
import { DrawerInstance } from '../../types/drawerFramework';
import { DrawerManagerService } from '../../services/drawer/drawerManager';
import { DrawerRegistry } from '../../services/drawer/drawerRegistry';
import { EnterpriseDrawer } from './EnterpriseDrawer';

export const EnterpriseDrawerHost: React.FC = () => {
  const [instances, setInstances] = useState<DrawerInstance[]>([]);

  useEffect(() => {
    const unsubscribe = DrawerManagerService.subscribe((activeStack) => {
      setInstances([...activeStack]);
    });
    return unsubscribe;
  }, []);

  if (instances.length === 0) return null;

  return (
    <>
      {instances.map((instance, idx) => {
        const isTopMost = idx === instances.length - 1;
        const computedZIndex = instance.config.zIndex || 900 + idx * 15;

        const Component =
          instance.props.component ||
          DrawerRegistry.get(instance.type)?.component ||
          EnterpriseDrawer;

        const handleClose = (status: any = 'cancelled') => {
          DrawerManagerService.closeDrawer(instance.id, status);
        };

        return (
          <div
            key={instance.id}
            data-drawer-id={instance.id}
            data-drawer-type={instance.type}
            data-topmost={isTopMost}
            style={{ zIndex: computedZIndex }}
            className="relative"
          >
            <Component
              id={instance.id}
              isOpen={true}
              onClose={() => handleClose('cancelled')}
              titleEn={instance.props.titleEn}
              titleAr={instance.props.titleAr}
              descriptionEn={instance.props.descriptionEn}
              descriptionAr={instance.props.descriptionAr}
              position={instance.position}
              size={instance.size}
              icon={instance.props.icon}
              actions={instance.props.actions}
              metadata={instance.props.metadata}
              config={{
                ...instance.config,
                zIndex: computedZIndex,
              }}
              state={instance.state}
              isAr={instance.props.isAr}
              {...instance.props}
            >
              {instance.props.children}
            </Component>
          </div>
        );
      })}
    </>
  );
};
