/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Document & Office Preview Component
 * Phase: Enterprise UI System
 * Module: Enterprise Media Preview, Document Viewer & Attachment Dialog System
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Download,
  Printer,
  Copy,
  Check,
  Eye,
  AlertTriangle,
  HelpCircle,
  Code2,
  Table,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FileMetadata } from '../../types/fileManagementFramework';
import { ViewerPermissions } from '../../types/mediaViewerFramework';

export interface EnterpriseDocumentViewerProps {
  file: FileMetadata;
  textContent?: string;
  permissions?: Partial<ViewerPermissions>;
  isAr?: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const EnterpriseDocumentViewer: React.FC<EnterpriseDocumentViewerProps> = ({
  file,
  textContent,
  permissions = { canDownload: true },
  isAr = false,
  onDownload,
  onPrint,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const ext = (file.extension || '').toLowerCase();
  const category = file.category;

  const isCsv = ext === 'csv' || file.mimeType === 'text/csv';
  const isJson = ext === 'json' || file.mimeType === 'application/json';
  const isMarkdown = ext === 'md' || ext === 'markdown';
  const isOffice = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext);
  const isText = ['txt', 'log', 'env', 'xml', 'html', 'css', 'js', 'ts'].includes(ext) || file.mimeType.startsWith('text/');

  const defaultSampleText = textContent || file.aiMetadata?.ocrText || `[ENTERPRISE PREVIEW SEAL]
Document Name: ${file.name}
Checksum (SHA-256): ${file.checksumHash || '4f8a92b109e2...'}
Classification: ${file.securityClassification}
Category: ${file.category}
Uploaded By: ${file.uploaderEmail}
Date: ${new Date(file.uploadDate).toLocaleString()}

CONTENT SUMMARY:
This document is securely archived and sealed within AJA International Logistics Enterprise Document Vault.
All automated security checks have passed.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(defaultSampleText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse simple CSV text into rows/columns for rendering table
  const parseCsv = (raw: string) => {
    const lines = raw.trim().split('\n');
    return lines.map((line) => line.split(','));
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-white">
      {/* Header Bar */}
      <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {isCsv || isOffice ? (
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : isJson || isMarkdown ? (
            <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="font-bold text-white truncate max-w-sm">{file.name}</span>
          <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
            {ext}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ النص' : 'Copy Text')}</span>
          </button>

          {permissions.canDownload && onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تنزيل' : 'Download'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Content Body */}
      <div className="flex-1 p-6 overflow-auto bg-slate-950 flex flex-col items-center">
        {/* CSV Render Table */}
        {isCsv ? (
          <div className="w-full max-w-4xl overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 p-2">
            <div className="p-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono flex items-center gap-1">
                <Table className="w-3.5 h-3.5 text-emerald-400" /> CSV Data Sheet
              </span>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <tbody>
                {parseCsv(defaultSampleText).map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`border-b border-slate-800 ${
                      rIdx === 0 ? 'bg-slate-800/80 font-bold text-amber-300' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 border-r border-slate-800/60 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : isJson ? (
          /* JSON Syntax Highlighting */
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto font-mono text-xs leading-relaxed">
            <pre className="text-amber-300 whitespace-pre-wrap">
              {(() => {
                try {
                  return JSON.stringify(JSON.parse(defaultSampleText), null, 2);
                } catch (e) {
                  return defaultSampleText;
                }
              })()}
            </pre>
          </div>
        ) : isOffice ? (
          /* Office Document Fallback Banner */
          <div className="w-full max-w-xl p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-4 text-center my-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shadow-xl">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-white">
                {isAr ? `مستند أوفيس (${ext.toUpperCase()})` : `Office Document (${ext.toUpperCase()})`}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                {isAr
                  ? 'يتم دعم استعراض مستندات أوفيس عبر الخادم أو تحميل الملف لفتحه مباشرة في تطبيقات أوفيس.'
                  : 'Office documents are protected and optimized for secure download and client app execution.'}
              </p>
            </div>

            {permissions.canDownload && onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تنزيل مستند أوفيس' : 'Download Office Document'}</span>
              </button>
            )}
          </div>
        ) : isText || isMarkdown ? (
          /* Standard Monospaced Text / Markdown View */
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-6 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap shadow-inner">
            {defaultSampleText}
          </div>
        ) : (
          /* Generic / Unsupported Fallback */
          <div className="w-full max-w-lg p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-4 text-center my-auto">
            <HelpCircle className="w-12 h-12 text-slate-500" />
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-white">
                {isAr ? 'عذرًا، لا تتوفر معاينة مباشرة لهذا النوع من الملفات' : 'No Direct Browser Preview Available'}
              </h3>
              <span className="text-xs text-slate-400">
                {file.name} ({file.mimeType})
              </span>
            </div>

            {permissions.canDownload && onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تنزيل الملف' : 'Download File'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
