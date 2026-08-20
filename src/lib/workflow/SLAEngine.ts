import {
  WorkflowSLARule,
  EscalationLevel,
  WorkflowInstance,
  WorkflowTask,
} from '../../types/workflow';

export interface SLACheckResult {
  isViolated: boolean;
  isWarning: boolean;
  minutesRemaining: number;
  escalationLevel: EscalationLevel;
  shouldNotifyManager: boolean;
  shouldNotifyDirector: boolean;
}

export class SLAEngine {
  /**
   * Calculate due date ISO string based on duration in minutes
   */
  public static calculateDueDate(durationMinutes: number, workingHoursOnly: boolean = false): string {
    const now = new Date();

    if (!workingHoursOnly) {
      const due = new Date(now.getTime() + durationMinutes * 60 * 1000);
      return due.toISOString();
    }

    // Working hours logic: assuming 9 AM to 5 PM (8h per day), Monday-Friday
    let minutesToAdd = durationMinutes;
    const current = new Date(now);

    while (minutesToAdd > 0) {
      // Advance by 1 minute
      current.setMinutes(current.getMinutes() + 1);

      const day = current.getDay();
      const hour = current.getHours();

      // Skip weekends (0=Sun, 6=Sat)
      if (day === 0 || day === 6) continue;
      // Skip off-working hours (outside 9am to 5pm)
      if (hour < 9 || hour >= 17) continue;

      minutesToAdd--;
    }

    return current.toISOString();
  }

  /**
   * Evaluate SLA status for an active workflow instance or task
   */
  public static evaluateSLA(
    deadlineIso?: string,
    rule?: WorkflowSLARule
  ): SLACheckResult {
    if (!deadlineIso) {
      return {
        isViolated: false,
        isWarning: false,
        minutesRemaining: 999999,
        escalationLevel: 'NONE',
        shouldNotifyManager: false,
        shouldNotifyDirector: false,
      };
    }

    const now = new Date().getTime();
    const deadline = new Date(deadlineIso).getTime();
    const diffMs = deadline - now;
    const minutesRemaining = Math.floor(diffMs / (1000 * 60));

    const isViolated = minutesRemaining < 0;

    // Warning state if under 20% of due duration or under 30 minutes
    const warningThreshold = rule?.warningDurationMinutes || 30;
    const isWarning = !isViolated && minutesRemaining <= warningThreshold;

    let escalationLevel: EscalationLevel = 'NONE';
    let shouldNotifyManager = false;
    let shouldNotifyDirector = false;

    if (isViolated) {
      const overdueMinutes = Math.abs(minutesRemaining);
      if (overdueMinutes > 240) {
        // > 4 hours overdue
        escalationLevel = 'LEVEL_3_DIRECTOR';
        shouldNotifyManager = true;
        shouldNotifyDirector = true;
      } else if (overdueMinutes > 60) {
        // > 1 hour overdue
        escalationLevel = 'LEVEL_2_MANAGER';
        shouldNotifyManager = true;
      } else {
        escalationLevel = 'LEVEL_1_WARNING';
      }
    } else if (isWarning) {
      escalationLevel = 'LEVEL_1_WARNING';
    }

    return {
      isViolated,
      isWarning,
      minutesRemaining,
      escalationLevel,
      shouldNotifyManager,
      shouldNotifyDirector,
    };
  }

  /**
   * Apply SLA check to workflow instance
   */
  public static applySLAToInstance(instance: WorkflowInstance, rule?: WorkflowSLARule): {
    instance: WorkflowInstance;
    escalated: boolean;
    escalationLevel: EscalationLevel;
  } {
    const slaResult = this.evaluateSLA(instance.slaDeadline, rule);
    let escalated = false;

    if (slaResult.isViolated && !instance.isSLAViolated) {
      instance.isSLAViolated = true;
      escalated = true;

      instance.history.push({
        id: `hist_sla_${Date.now()}`,
        workflowInstanceId: instance.id,
        stepId: instance.currentStepId,
        fromState: instance.currentState,
        toState: instance.currentState,
        action: 'SLA_VIOLATED',
        timestamp: new Date().toISOString(),
        comments: `SLA Deadline violated by ${Math.abs(slaResult.minutesRemaining)} minutes. Escalation level: ${slaResult.escalationLevel}`,
      });
    }

    return {
      instance,
      escalated,
      escalationLevel: slaResult.escalationLevel,
    };
  }

  /**
   * Apply SLA check to individual task
   */
  public static applySLAToTask(task: WorkflowTask, rule?: WorkflowSLARule): {
    task: WorkflowTask;
    escalated: boolean;
  } {
    const slaResult = this.evaluateSLA(task.dueDate, rule);
    let escalated = false;

    if (slaResult.isViolated && !task.escalated) {
      task.escalated = true;
      task.escalationLevel = slaResult.escalationLevel;
      task.priority = 'HIGH';
      task.updatedAt = new Date().toISOString();
      escalated = true;
    }

    return { task, escalated };
  }
}
