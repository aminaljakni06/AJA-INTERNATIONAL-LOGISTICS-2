import {
  SystemSettingItem,
  EvaluationContext,
  ConfigValidationIssue,
  ConfigScope,
} from '../../types/config';

export class ConfigEngine {
  private static SCOPE_PRIORITY: ConfigScope[] = [
    'USER',
    'TEAM',
    'DEPARTMENT',
    'BRANCH',
    'COMPANY',
    'GLOBAL',
  ];

  /**
   * Resolve a setting value based on hierarchical inheritance priority:
   * USER -> TEAM -> DEPARTMENT -> BRANCH -> COMPANY -> GLOBAL
   */
  public static resolveSettingValue(
    key: string,
    allSettings: SystemSettingItem[],
    context?: EvaluationContext
  ): SystemSettingItem | null {
    const candidates = allSettings.filter((s) => s.key === key);

    if (candidates.length === 0) {
      return null;
    }

    // Attempt to match highest priority scope in order
    for (const scope of this.SCOPE_PRIORITY) {
      let match: SystemSettingItem | undefined;

      switch (scope) {
        case 'USER':
          if (context?.userId) {
            match = candidates.find((s) => s.scope === 'USER' && s.scopeId === context.userId);
          }
          break;
        case 'TEAM':
          if (context?.teamId) {
            match = candidates.find((s) => s.scope === 'TEAM' && s.scopeId === context.teamId);
          }
          break;
        case 'DEPARTMENT':
          if (context?.departmentId) {
            match = candidates.find((s) => s.scope === 'DEPARTMENT' && s.scopeId === context.departmentId);
          }
          break;
        case 'BRANCH':
          if (context?.branchId) {
            match = candidates.find((s) => s.scope === 'BRANCH' && s.scopeId === context.branchId);
          }
          break;
        case 'COMPANY':
          if (context?.companyId) {
            match = candidates.find((s) => s.scope === 'COMPANY' && s.scopeId === context.companyId);
          }
          break;
        case 'GLOBAL':
          match = candidates.find((s) => s.scope === 'GLOBAL');
          break;
      }

      if (match) {
        return match;
      }
    }

    // Fallback to global or first candidate
    return candidates.find((s) => s.scope === 'GLOBAL') || candidates[0] || null;
  }

  /**
   * Validate setting value against expected type
   */
  public static validateSettingValue(setting: SystemSettingItem): ConfigValidationIssue | null {
    const { key, valueType, value } = setting;

    if (value === undefined || value === null) {
      return {
        key,
        type: 'MISSING',
        severity: 'WARNING',
        message: `Setting '${key}' has null or undefined value. Fallback to default.`,
      };
    }

    switch (valueType) {
      case 'BOOLEAN':
        if (typeof value !== 'boolean') {
          return {
            key,
            type: 'INVALID_TYPE',
            severity: 'ERROR',
            message: `Setting '${key}' expected boolean but got ${typeof value}.`,
          };
        }
        break;
      case 'NUMBER':
        if (typeof value !== 'number' || isNaN(value)) {
          return {
            key,
            type: 'INVALID_TYPE',
            severity: 'ERROR',
            message: `Setting '${key}' expected valid number but got ${typeof value}.`,
          };
        }
        break;
      case 'STRING':
      case 'SECRET':
        if (typeof value !== 'string') {
          return {
            key,
            type: 'INVALID_TYPE',
            severity: 'ERROR',
            message: `Setting '${key}' expected string but got ${typeof value}.`,
          };
        }
        break;
      case 'ARRAY':
        if (!Array.isArray(value)) {
          return {
            key,
            type: 'INVALID_TYPE',
            severity: 'ERROR',
            message: `Setting '${key}' expected array but got ${typeof value}.`,
          };
        }
        break;
      case 'JSON':
        if (typeof value !== 'object') {
          return {
            key,
            type: 'INVALID_TYPE',
            severity: 'ERROR',
            message: `Setting '${key}' expected object/JSON but got ${typeof value}.`,
          };
        }
        break;
    }

    return null;
  }

  /**
   * Mask secrets before sending to non-server contexts
   */
  public static maskSecretValues(settings: SystemSettingItem[]): SystemSettingItem[] {
    return settings.map((s) => {
      if (s.valueType === 'SECRET' || s.isEncrypted) {
        return {
          ...s,
          value: '••••••••••••••••',
        };
      }
      return s;
    });
  }
}
