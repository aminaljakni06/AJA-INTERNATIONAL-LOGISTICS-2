/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Data Exchange Hook
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Data Export & Import (STEP 05.18)
 * Version: 1.0
 */

import { useState, useCallback } from 'react';
import {
  buildEnterpriseExportRequest,
  downloadEnterpriseExport,
  ExportClientError,
  getStoredAuthHeaders,
} from '../lib/exchange/exportClient';
import {
  ExchangeFormat,
  FieldAllowlistEntry,
  ExportResult,
  ImportStage,
  ColumnMapping,
  ImportParseResult,
  ImportValidationResult,
  DuplicateHandlingStrategy,
  ImportExecutionResult,
  BulkExecutionPolicy,
  ImportExecutionPlan,
  ImportPreviewResponse,
} from '../types/dataTransferFramework';
import { BulkSelectionDescriptor } from '../types/bulkFramework';

export interface UseEnterpriseDataExchangeOptions {
  resource: string;
  selectionDescriptor?: BulkSelectionDescriptor | null;
  isAr?: boolean;
}

export function useEnterpriseDataExchange({
  resource,
  selectionDescriptor = null,
  isAr = false,
}: UseEnterpriseDataExchangeOptions) {
  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  // Import State Pipeline
  const [importStage, setImportStage] = useState<ImportStage>('UPLOAD');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportParseResult | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping>({});
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [duplicateDetectionResult, setDuplicateDetectionResult] = useState<any | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateHandlingStrategy>('SKIP');
  const [executionPolicy, setExecutionPolicy] = useState<BulkExecutionPolicy>('BEST_EFFORT');
  const [previewResponse, setPreviewResponse] = useState<ImportPreviewResponse | null>(null);
  const [executionPlan, setExecutionPlan] = useState<ImportExecutionPlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isPlanConfirmed, setIsPlanConfirmed] = useState(false);
  const [isExecutingImport, setIsExecutingImport] = useState(false);
  const [importResult, setImportResult] = useState<ImportExecutionResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [allowlistFields, setAllowlistFields] = useState<FieldAllowlistEntry[]>([]);

  // Fetch Allow-List Schema
  const fetchAllowlistSchema = useCallback(async () => {
    try {
      const res = await fetch(`/api/data-exchange/allowlist?resource=${resource}`, {
        headers: getStoredAuthHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data?.allowedFields) {
        setAllowlistFields(json.data.allowedFields);
      }
    } catch (err: any) {
      console.warn('[useEnterpriseDataExchange] Allow-list fetch error:', err);
    }
  }, [resource]);

  // Execute Server Export Reusing BulkSelectionDescriptor
  const executeExport = useCallback(
    async (
      format: ExchangeFormat = 'csv',
      selectedFields?: string[],
      fileName?: string
    ): Promise<ExportResult | null> => {
      if (!selectionDescriptor) {
        setExportError(isAr ? 'لم يتم تحديد أي سجلات أو استعلام للتصدير' : 'No selection descriptor available for export.');
        return null;
      }

      setIsExporting(true);
      setExportError(null);

      try {
        const req = buildEnterpriseExportRequest({
          resource,
          format,
          selection: selectionDescriptor,
          visibleFieldKeys: selectedFields,
          fieldMode: selectedFields && selectedFields.length > 0 ? 'VISIBLE_COLUMNS' : 'DEFAULT_FIELDS',
          fileName,
          locale: isAr ? 'ar' : 'en',
        });

        const dlResult = await downloadEnterpriseExport(req);

        const result: ExportResult = {
          operationId: `op_exp_${Date.now()}`,
          exportId: `exp_${Date.now()}`,
          resource,
          format: dlResult.format,
          status: 'COMPLETED',
          recordCount: 0,
          content: '',
          fileName: dlResult.fileName,
          fileSize: `${Math.round(dlResult.fileSize / 1024)} KB`,
          executionTimeMs: 0,
        };

        setExportResult(result);
        return result;
      } catch (err: any) {
        const msg = isAr && err instanceof ExportClientError && err.messageAr ? err.messageAr : err.message || 'Export failed.';
        setExportError(msg);
        return null;
      } finally {
        setIsExporting(false);
      }
    },
    [resource, selectionDescriptor, isAr]
  );

  // Import Pipeline Step 1 & 2: Upload & Parse
  const uploadAndParseFile = useCallback(
    async (file: File) => {
      setUploadedFile(file);
      setImportError(null);
      setImportStage('PARSING');

      try {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        let payload: any = {
          resource,
          fileName: file.name,
          fileMimeType: file.type,
        };

        if (ext === 'xlsx' || ext === 'excel') {
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          payload.fileBufferBase64 = base64;
        } else {
          const text = await file.text();
          payload.fileContent = text;
        }

        const res = await fetch('/api/data-exchange/import/parse', {
          method: 'POST',
          headers: getStoredAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (json.success && json.data) {
          const parseRes: ImportParseResult = json.data;
          setParsedData(parseRes);

          // Auto-infer column mappings
          const initialMappings: ColumnMapping = {};
          parseRes.headers.forEach((hdr) => {
            const cleanHdr = hdr.toLowerCase().replace(/[^a-z0-9]/g, '');
            const matchedField = allowlistFields.find(
              (f) =>
                f.key.toLowerCase() === cleanHdr ||
                f.labelEn.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanHdr
            );
            if (matchedField) {
              initialMappings[hdr] = matchedField.key;
            }
          });
          setColumnMappings(initialMappings);
          setImportStage('MAPPING');
        } else {
          const msg = isAr && json.error?.messageAr ? json.error.messageAr : json.error?.message || 'Failed to parse import file.';
          throw new Error(msg);
        }
      } catch (err: any) {
        setImportError(err.message || 'Parse error.');
        setImportStage('UPLOAD');
      }
    },
    [allowlistFields]
  );

  // Import Pipeline Step 3 & 4: Validate Mapped Data
  const validateMappedRows = useCallback(async () => {
    if (!parsedData || !parsedData.rows) return;

    setImportError(null);
    setImportStage('VALIDATION');

    try {
      const res = await fetch('/api/data-exchange/import/validate', {
        method: 'POST',
        headers: getStoredAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          resource,
          parsedFile: parsedData,
          userMappings: columnMappings,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const valRes: ImportValidationResult = json.data;
        setValidationResult(valRes);
        setImportStage('PREVIEW');
      } else {
        const msg = isAr && json.error?.messageAr ? json.error.messageAr : json.error?.message || 'Validation failed.';
        throw new Error(msg);
      }
    } catch (err: any) {
      setImportError(err.message || 'Validation error.');
      setImportStage('MAPPING');
    }
  }, [resource, parsedData, columnMappings, isAr]);

  // Import Pipeline Step 5: Duplicate Detection & Resolution Policy
  const runDuplicateCheck = useCallback(
    async (strategy?: DuplicateHandlingStrategy) => {
      if (!parsedData) return;

      const activeStrategy = strategy || duplicateStrategy;
      setImportError(null);
      setImportStage('DUPLICATE_CHECK');

      try {
        const res = await fetch('/api/data-exchange/import/duplicates', {
          method: 'POST',
          headers: getStoredAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            resource,
            parsedFile: parsedData,
            userMappings: columnMappings,
            duplicateStrategy: activeStrategy,
          }),
        });

        const json = await res.json();

        if (json.success && json.data) {
          setDuplicateDetectionResult(json.data);
          setDuplicateStrategy(activeStrategy);
        } else {
          const msg = isAr && json.error?.messageAr ? json.error.messageAr : json.error?.message || 'Duplicate check failed.';
          throw new Error(msg);
        }
      } catch (err: any) {
        setImportError(err.message || 'Duplicate check error.');
      }
    },
    [resource, parsedData, columnMappings, duplicateStrategy, isAr]
  );
  // Import Pipeline Step 6: Build Import Execution Plan & Preview
  const buildImportPlan = useCallback(
    async (strategy?: DuplicateHandlingStrategy, policy?: BulkExecutionPolicy) => {
      if (!parsedData) return;

      const activeStrategy = strategy || duplicateStrategy;
      const activePolicy = policy || executionPolicy;

      setIsPlanning(true);
      setImportError(null);
      setImportStage('PREVIEW');
      setIsPlanConfirmed(false);

      try {
        const res = await fetch('/api/data-exchange/import/plan', {
          method: 'POST',
          headers: getStoredAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            resource,
            parsedFile: parsedData,
            userMappings: columnMappings,
            duplicateStrategy: activeStrategy,
            executionPolicy: activePolicy,
          }),
        });

        const json = await res.json();

        if (json.success && json.data) {
          setPreviewResponse(json.data);
          setExecutionPlan(json.data.executionPlan);
          setDuplicateStrategy(activeStrategy);
          setExecutionPolicy(activePolicy);
        } else {
          const msg = isAr && json.error?.messageAr ? json.error.messageAr : json.error?.message || 'Plan generation failed.';
          throw new Error(msg);
        }
      } catch (err: any) {
        setImportError(err.message || 'Import plan building error.');
      } finally {
        setIsPlanning(false);
      }
    },
    [resource, parsedData, columnMappings, duplicateStrategy, executionPolicy, isAr]
  );

  // Import Pipeline Step 7: Confirm Execution Plan
  const confirmImportPlan = useCallback(
    async (typedPhrase?: string): Promise<boolean> => {
      if (!executionPlan) return false;

      setImportError(null);
      setImportStage('CONFIRMATION');

      try {
        const res = await fetch('/api/data-exchange/import/confirm', {
          method: 'POST',
          headers: getStoredAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            executionPlan,
            clientFingerprint: executionPlan.planFingerprint,
            typedPhrase,
          }),
        });

        const json = await res.json();

        if (json.success && json.data?.confirmed) {
          setIsPlanConfirmed(true);
          return true;
        } else {
          const msg = isAr && json.error?.messageAr ? json.error.messageAr : json.error?.message || 'Plan confirmation failed.';
          throw new Error(msg);
        }
      } catch (err: any) {
        setImportError(err.message || 'Plan confirmation error.');
        return false;
      }
    },
    [executionPlan, isAr]
  );

  const executeImport = useCallback(async (typedPhrase?: string) => {
    if (!executionPlan || !parsedData) return;

    setIsExecutingImport(true);
    setImportError(null);
    setImportStage('EXECUTING');

    const idempotencyKey = `idemp_${executionPlan.planId}_${Date.now()}`;

    try {
      const res = await fetch('/api/data-exchange/import/execute', {
        method: 'POST',
        headers: getStoredAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          resource,
          planId: executionPlan.planId,
          planFingerprint: executionPlan.planFingerprint,
          idempotencyKey,
          typedPhrase: typedPhrase || (executionPlan.updateCount > 0 ? 'OVERWRITE' : undefined),
          parsedFile: parsedData,
          userMappings: columnMappings,
          duplicateStrategy,
          executionPolicy,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const execRes: ImportExecutionResult = json.data;
        setImportResult(execRes);
        setImportStage('SUMMARY');
      } else {
        throw new Error(json.error?.message || 'Import execution failed.');
      }
    } catch (err: any) {
      setImportError(err.message || 'Import execution failed.');
      setImportStage('CONFIRMATION');
    } finally {
      setIsExecutingImport(false);
    }
  }, [resource, executionPlan, parsedData, columnMappings, duplicateStrategy, executionPolicy]);

  const downloadErrorReport = useCallback(async (operationId?: string) => {
    const opId = operationId || importResult?.operationId || importResult?.importId;
    if (!opId) return;

    try {
      const res = await fetch(`/api/data-exchange/import/errors/${opId}`, {
        headers: getStoredAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Failed to download error report.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import_errors_${opId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Download error report failed:', err);
    }
  }, [importResult]);

  // Reset Import Pipeline
  const resetImport = useCallback(() => {
    setImportStage('UPLOAD');
    setUploadedFile(null);
    setParsedData(null);
    setColumnMappings({});
    setValidationResult(null);
    setImportResult(null);
    setImportError(null);
  }, []);

  return {
    // Export State & Controls
    isExporting,
    exportError,
    exportResult,
    executeExport,
    fetchAllowlistSchema,
    allowlistFields,
    // Import Pipeline State & Controls
    importStage,
    setImportStage,
    uploadedFile,
    parsedData,
    columnMappings,
    setColumnMappings,
    validationResult,
    duplicateDetectionResult,
    duplicateStrategy,
    setDuplicateStrategy,
    executionPolicy,
    setExecutionPolicy,
    previewResponse,
    executionPlan,
    isPlanning,
    isPlanConfirmed,
    isExecutingImport,
    importResult,
    importError,
    // Import Actions
    uploadAndParseFile,
    validateMappedRows,
    runDuplicateCheck,
    buildImportPlan,
    confirmImportPlan,
    executeImport,
    downloadErrorReport,
    resetImport,
  };
}
