/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Feedback Provider
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import React from 'react';
import { EnterpriseToastContainer } from './EnterpriseToastContainer';
import { EnterpriseAlertBanner } from './EnterpriseAlertBanner';
import { EnterpriseConfirmationModal } from './EnterpriseConfirmationModal';

interface EnterpriseFeedbackProviderProps {
  children: React.ReactNode;
  isAr?: boolean;
}

export const EnterpriseFeedbackProvider: React.FC<EnterpriseFeedbackProviderProps> = ({
  children,
  isAr = false,
}) => {
  return (
    <>
      <EnterpriseAlertBanner isAr={isAr} />
      {children}
      <EnterpriseToastContainer isAr={isAr} />
      <EnterpriseConfirmationModal isAr={isAr} />
    </>
  );
};
