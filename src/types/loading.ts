/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Loading Experience Types
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Loading Experience
 * Version: 1.0
 */

export type AsyncOperationStatus =
  | 'IDLE'
  | 'PREPARING'
  | 'LOADING'
  | 'REFRESHING'
  | 'PARTIAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING';

export type LoadingType =
  | 'PAGE'
  | 'ROUTE'
  | 'COMPONENT'
  | 'FORM'
  | 'TABLE'
  | 'SEARCH'
  | 'FILTER'
  | 'PAGINATION'
  | 'UPLOAD'
  | 'DOWNLOAD'
  | 'EXPORT'
  | 'IMPORT'
  | 'AI'
  | 'BACKGROUND'
  | 'SYNC'
  | 'REFRESH';

export type AILoadingStage =
  | 'THINKING'
  | 'PROCESSING'
  | 'STREAMING'
  | 'GENERATING'
  | 'COMPLETED'
  | 'FAILED';

export interface LoadingRequestTracker {
  requestId: string;
  key: string;
  module: string;
  type: LoadingType;
  endpoint?: string;
  startedTime: number;
  finishedTime?: number;
  durationMs?: number;
  retryCount: number;
  status: AsyncOperationStatus;
  progressPercent?: number;
  messageEn?: string;
  messageAr?: string;
}

export interface LoadingMetrics {
  totalRequests: number;
  averageDurationMs: number;
  slowRequestsCount: number;
  failedRequestsCount: number;
  activeRequestsCount: number;
}

export interface EnterpriseLoadingContextValue {
  activeRequests: Record<string, LoadingRequestTracker>;
  isGlobalLoading: boolean;
  isModuleLoading: (moduleName: string) => boolean;
  isKeyLoading: (key: string) => boolean;
  startLoading: (
    key: string,
    moduleName: string,
    type?: LoadingType,
    messageEn?: string,
    messageAr?: string
  ) => string; // returns requestId
  updateProgress: (key: string, percent: number, messageEn?: string, messageAr?: string) => void;
  stopLoading: (key: string, status?: AsyncOperationStatus) => void;
  clearAllLoading: () => void;
  metrics: LoadingMetrics;
}
