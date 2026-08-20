/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Global Dialog Host Component
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog Manager & Global Dialog Orchestration
 * Version: 1.0
 */

import React, { useEffect, useState } from 'react';
import { DialogInstance } from '../../types/dialogOrchestrationFramework';
import { DialogManagerService } from '../../services/dialog/dialogManager';
import { DialogRegistry } from '../../services/dialog/dialogRegistry';
import { EnterpriseDialog } from './EnterpriseDialog';

export const EnterpriseDialogHost: React.FC = () => {
  const [instances, setInstances] = useState<DialogInstance[]>([]);

  useEffect(() => {
    const unsubscribe = DialogManagerService.subscribe((activeStack) => {
      setInstances([...activeStack]);
    });
    return unsubscribe;
  }, []);

  if (instances.length === 0) return null;

  return (
    <>
      {instances.map((instance, idx) => {
        const isTopMost = idx === instances.length - 1;
        const computedZIndex = instance.config.zIndex || 1000 + idx * 20;

        // Custom or Registered Component Resolution
        const Component =
          instance.props.component ||
          DialogRegistry.get(instance.type)?.component ||
          EnterpriseDialog;

        const handleClose = (status: any = 'cancelled') => {
          DialogManagerService.closeDialog(instance.id, status);
        };

        return (
          <div
            key={instance.id}
            data-dialog-id={instance.id}
            data-dialog-type={instance.type}
            data-topmost={isTopMost}
            style={{ zIndex: computedZIndex }}
            className="relative"
          >
            <Component
              id={instance.id}
              isOpen={true}
              onClose={() => handleClose('cancelled')}
              onConfirm={() => handleClose('completed')}
              titleEn={instance.props.titleEn}
              titleAr={instance.props.titleAr}
              subtitleEn={instance.props.subtitleEn}
              subtitleAr={instance.props.subtitleAr}
              statusBadge={instance.props.statusBadge}
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
