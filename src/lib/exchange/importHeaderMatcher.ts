/**
 * AJA INTERNATIONAL LOGISTICS — Server Header Matching & Mapping Engine
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Schema Mapping & Validation Engine (STEP 05.18.08)
 * Version: 1.0
 */

import { ImportSchema, ImportColumnMappingEntry, MappingStatus, ImportColumnDefinition } from '../../types/dataTransferFramework';
import { PROHIBITED_INTERNAL_FIELDS } from './importSchemaResolver';
import { ImportParserError } from './importParsers/importParserInterface';

/**
 * Normalize text safely for matching comparisons without mutating original text
 */
export function normalizeHeaderString(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s_\-\.\:\(\)]+/g, '') // collapse punctuation & whitespace for comparison
    .trim();
}

/**
 * Auto-detect column mappings for source file headers against target ImportSchema
 */
export function autoMapImportHeaders(
  sourceHeaders: string[],
  schema: ImportSchema
): ImportColumnMappingEntry[] {
  if (!sourceHeaders || sourceHeaders.length === 0) {
    return [];
  }

  const importableCols = schema.columns.filter((c) => c.allowImport);
  const mappings: ImportColumnMappingEntry[] = [];
  const targetAssignedCount: Record<string, number> = {};

  for (const rawHeader of sourceHeaders) {
    const cleanHeader = (rawHeader || '').trim();
    const normalizedHeader = normalizeHeaderString(cleanHeader);

    if (!cleanHeader) {
      mappings.push({
        sourceColumn: rawHeader,
        targetField: '',
        mappingStatus: 'UNMAPPED',
        confidence: 0,
      });
      continue;
    }

    let bestMatch: ImportColumnDefinition | null = null;
    let bestPriority = 999;
    let isAmbiguous = false;

    for (const col of importableCols) {
      if (PROHIBITED_INTERNAL_FIELDS.has(col.field.toLowerCase())) continue;

      const normField = normalizeHeaderString(col.field);
      const normLabelEn = normalizeHeaderString(col.labelEn);
      const normLabelAr = normalizeHeaderString(col.labelAr);
      const normAliases = (col.aliases || []).map((a) => normalizeHeaderString(a));

      let priority = 999;

      // Priority 1: Exact field key
      if (cleanHeader === col.field || normalizedHeader === normField) {
        priority = 1;
      }
      // Priority 2: Configured alias match
      else if ((col.aliases || []).includes(cleanHeader) || normAliases.includes(normalizedHeader)) {
        priority = 2;
      }
      // Priority 3: English label match
      else if (cleanHeader === col.labelEn || normalizedHeader === normLabelEn) {
        priority = 3;
      }
      // Priority 4: Arabic label match
      else if (cleanHeader === col.labelAr || normalizedHeader === normLabelAr) {
        priority = 4;
      }

      if (priority < bestPriority) {
        bestPriority = priority;
        bestMatch = col;
        isAmbiguous = false;
      } else if (priority === bestPriority && priority < 999 && bestMatch?.field !== col.field) {
        // Equal priority match with two different target fields -> ambiguous!
        isAmbiguous = true;
      }
    }

    if (bestMatch && !isAmbiguous && bestPriority <= 4) {
      const targetField = bestMatch.field;
      targetAssignedCount[targetField] = (targetAssignedCount[targetField] || 0) + 1;

      mappings.push({
        sourceColumn: cleanHeader,
        targetField,
        mappingStatus: 'MATCHED',
        confidence: bestPriority === 1 ? 1.0 : bestPriority === 2 ? 0.95 : 0.9,
      });
    } else if (isAmbiguous) {
      mappings.push({
        sourceColumn: cleanHeader,
        targetField: '',
        mappingStatus: 'MANUAL',
        confidence: 0,
      });
    } else {
      mappings.push({
        sourceColumn: cleanHeader,
        targetField: '',
        mappingStatus: 'UNMAPPED',
        confidence: 0,
      });
    }
  }

  // Post-processing: Check for duplicate target field assignments
  for (const m of mappings) {
    if (m.targetField && targetAssignedCount[m.targetField] > 1) {
      m.mappingStatus = 'INVALID';
    }
  }

  return mappings;
}

/**
 * Validate manual or auto-generated mappings against target schema rules and security allow-lists
 */
export function validateImportMappings(
  mappings: ImportColumnMappingEntry[],
  schema: ImportSchema
): { isValid: boolean; errors: string[]; validatedMappings: ImportColumnMappingEntry[] } {
  const errors: string[] = [];
  const validatedMappings: ImportColumnMappingEntry[] = [];
  const mappedTargets = new Map<string, string[]>(); // targetField -> sourceColumns[]

  const schemaFieldMap = new Map<string, ImportColumnDefinition>();
  for (const col of schema.columns) {
    schemaFieldMap.set(col.field, col);
  }

  for (const m of mappings) {
    const entry: ImportColumnMappingEntry = { ...m };

    if (!entry.targetField || entry.targetField.trim() === '') {
      entry.mappingStatus = 'UNMAPPED';
      validatedMappings.push(entry);
      continue;
    }

    const target = entry.targetField.trim();

    // 1. Check prohibited internal fields
    if (PROHIBITED_INTERNAL_FIELDS.has(target.toLowerCase())) {
      entry.mappingStatus = 'INVALID';
      errors.push(`Column "${entry.sourceColumn}" cannot be mapped to system internal field "${target}".`);
      validatedMappings.push(entry);
      continue;
    }

    // 2. Check field existence in schema & allowImport capability
    const colDef = schemaFieldMap.get(target);
    if (!colDef) {
      entry.mappingStatus = 'INVALID';
      errors.push(`Column "${entry.sourceColumn}" mapped to unknown target field "${target}".`);
      validatedMappings.push(entry);
      continue;
    }

    if (!colDef.allowImport) {
      entry.mappingStatus = 'INVALID';
      errors.push(`Target field "${target}" does not accept import values.`);
      validatedMappings.push(entry);
      continue;
    }

    // Track duplicate target mappings
    if (!mappedTargets.has(target)) {
      mappedTargets.set(target, []);
    }
    mappedTargets.get(target)!.push(entry.sourceColumn);

    entry.mappingStatus = entry.mappingStatus === 'INVALID' ? 'MATCHED' : entry.mappingStatus;
    validatedMappings.push(entry);
  }

  // 3. Enforce One-to-One Target Mapping: Reject duplicate target fields
  for (const [targetField, sources] of mappedTargets.entries()) {
    if (sources.length > 1) {
      errors.push(
        `Multiple source columns [${sources.join(', ')}] are mapped to the same target field "${targetField}". Duplicate target field mappings are not allowed.`
      );
      for (const m of validatedMappings) {
        if (m.targetField === targetField) {
          m.mappingStatus = 'INVALID';
        }
      }
    }
  }

  // 4. Required Fields Coverage Check
  for (const reqField of schema.requiredFields) {
    const isMapped = Array.from(mappedTargets.keys()).includes(reqField);
    if (!isMapped) {
      const colDef = schemaFieldMap.get(reqField);
      const labelName = colDef ? colDef.labelEn : reqField;
      errors.push(`Required field "${labelName}" (${reqField}) is not mapped to any source column.`);
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    validatedMappings,
  };
}
