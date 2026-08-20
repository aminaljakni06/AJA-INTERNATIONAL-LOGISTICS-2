/**
 * AJA INTERNATIONAL LOGISTICS — Import Parser Interface & Contracts
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Upload & Parser Framework (STEP 05.18.07)
 * Version: 1.0
 */

import { ImportFileMetadata, ParsedImportFile, DataTransferErrorCode } from '../../../types/dataTransferFramework';

export interface ImportParserOptions {
  worksheetName?: string;
  locale?: 'en' | 'ar';
  maxRows?: number;
  maxColumns?: number;
  maxCellLength?: number;
}

export class ImportParserError extends Error {
  code: DataTransferErrorCode;
  messageAr?: string;

  constructor(code: DataTransferErrorCode, messageEn: string, messageAr?: string) {
    super(messageEn);
    this.name = 'ImportParserError';
    this.code = code;
    this.messageAr = messageAr;
  }
}

export interface ImportParser {
  readonly format: 'csv' | 'xlsx';
  canParse(mimeType: string, extension: string): boolean;
  parse(
    buffer: Buffer,
    fileMetadata: ImportFileMetadata,
    options?: ImportParserOptions
  ): Promise<ParsedImportFile>;
}
