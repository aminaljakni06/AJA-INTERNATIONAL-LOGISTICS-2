import { FeatureFlag, EvaluationContext, ConfigValidationIssue } from '../../types/config';

export class FeatureFlagEngine {
  /**
   * Simple deterministic hashing string to integer (0 - 99)
   */
  private static hashUser(userId: string, flagKey: string): number {
    const combined = `${userId}:${flagKey}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash) % 100;
  }

  /**
   * Evaluate if a feature flag is active for a given evaluation context
   */
  public static isFlagEnabled(
    flag: FeatureFlag,
    allFlags: FeatureFlag[],
    context?: EvaluationContext
  ): { enabled: boolean; reason: string } {
    // 1. Kill Switch override
    if (flag.killSwitch) {
      return { enabled: false, reason: 'Kill switch active' };
    }

    // 2. Base enable check
    if (!flag.enabled) {
      return { enabled: false, reason: 'Flag disabled globally or in scope' };
    }

    // 3. Environment rollout check
    const currentEnv = context?.environment || (process.env.NODE_ENV as any) || 'development';
    if (flag.environmentRollout && flag.environmentRollout.length > 0) {
      if (!flag.environmentRollout.includes(currentEnv)) {
        return { enabled: false, reason: `Environment '${currentEnv}' not targeted` };
      }
    }

    // 4. Scheduled activation window check
    const now = new Date();
    if (flag.scheduledActivation) {
      const activeFrom = new Date(flag.scheduledActivation);
      if (now < activeFrom) {
        return { enabled: false, reason: `Scheduled activation not reached (${flag.scheduledActivation})` };
      }
    }

    if (flag.scheduledExpiration) {
      const expiresAt = new Date(flag.scheduledExpiration);
      if (now > expiresAt) {
        return { enabled: false, reason: `Scheduled activation expired (${flag.scheduledExpiration})` };
      }
    }

    // 5. Dependency check (All parent flags must be active)
    if (flag.dependencies && flag.dependencies.length > 0) {
      for (const parentKey of flag.dependencies) {
        const parentFlag = allFlags.find((f) => f.key === parentKey);
        if (!parentFlag) {
          return { enabled: false, reason: `Missing required parent flag '${parentKey}'` };
        }
        const parentEval = this.isFlagEnabled(parentFlag, allFlags, context);
        if (!parentEval.enabled) {
          return { enabled: false, reason: `Parent flag '${parentKey}' is inactive: ${parentEval.reason}` };
        }
      }
    }

    // 6. Percentage rollout check
    if (flag.percentageRollout !== undefined && flag.percentageRollout < 100) {
      if (context?.userId) {
        const userBucket = this.hashUser(context.userId, flag.key);
        if (userBucket >= flag.percentageRollout) {
          return {
            enabled: false,
            reason: `User bucket (${userBucket}%) exceeds rollout percentage (${flag.percentageRollout}%)`,
          };
        }
      }
    }

    return { enabled: true, reason: 'Active' };
  }

  /**
   * Detect circular dependencies among feature flags
   */
  public static detectCircularDependencies(flags: FeatureFlag[]): ConfigValidationIssue[] {
    const issues: ConfigValidationIssue[] = [];

    const visit = (flagKey: string, path: string[]) => {
      if (path.includes(flagKey)) {
        issues.push({
          key: flagKey,
          type: 'CIRCULAR_DEPENDENCY',
          severity: 'ERROR',
          message: `Circular feature flag dependency detected: ${[...path, flagKey].join(' -> ')}`,
        });
        return;
      }

      const flag = flags.find((f) => f.key === flagKey);
      if (!flag || !flag.dependencies) return;

      for (const depKey of flag.dependencies) {
        visit(depKey, [...path, flagKey]);
      }
    };

    for (const flag of flags) {
      visit(flag.key, []);
    }

    return issues;
  }
}
