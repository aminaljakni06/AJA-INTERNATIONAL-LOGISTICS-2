import React from 'react';
import { EnterpriseDialog } from '../dialog/EnterpriseDialog';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullWidth';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  return (
    <EnterpriseDialog
      isOpen={isOpen}
      onClose={onClose}
      titleEn={title}
      titleAr={title}
      config={{
        size,
        closeOnEscape: true,
        closeOnBackdropClick: true,
        showCloseButton: true,
      }}
    >
      {children}
    </EnterpriseDialog>
  );
};

