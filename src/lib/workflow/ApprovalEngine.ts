import { WorkflowStepDef, WorkflowInstance, ApprovalPolicyType } from '../../types/workflow';

export interface EvaluationUserContext {
  userId: string;
  role?: string;
  departmentId?: string;
  branchId?: string;
  companyId?: string;
}

export interface ApprovalEvaluationResult {
  isApproved: boolean;
  isRejected: boolean;
  minRequired: number;
  currentCount: number;
  rejectionCount: number;
  reason?: string;
}

export class ApprovalEngine {
  /**
   * Check if a user is eligible to perform an approval action on a workflow step
   */
  public static isUserEligible(
    step: WorkflowStepDef,
    user: EvaluationUserContext
  ): boolean {
    if (!step) return false;

    // Admin bypass
    if (user.role === 'ADMIN' || user.role === 'EXECUTIVE') {
      return true;
    }

    // Role check
    if (step.requiredRoles && step.requiredRoles.length > 0) {
      if (!user.role || !step.requiredRoles.includes(user.role)) {
        return false;
      }
    }

    // Department check
    if (step.requiredDepartmentId) {
      if (user.departmentId !== step.requiredDepartmentId) {
        return false;
      }
    }

    // Branch check
    if (step.requiredBranchId) {
      if (user.branchId !== step.requiredBranchId) {
        return false;
      }
    }

    // Specific user assignment
    if (step.assignedUsers && step.assignedUsers.length > 0) {
      if (!step.assignedUsers.includes(user.userId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluates if approval threshold is met for the current instance state
   */
  public static evaluateApprovalState(
    instance: WorkflowInstance,
    step: WorkflowStepDef
  ): ApprovalEvaluationResult {
    const policy: ApprovalPolicyType = step.approvalPolicy || 'SINGLE';
    const minRequired = step.minApprovalsRequired || 1;
    const currentCount = instance.currentApprovals.length;
    const rejectionCount = instance.rejections.length;

    if (rejectionCount > 0) {
      return {
        isApproved: false,
        isRejected: true,
        minRequired,
        currentCount,
        rejectionCount,
        reason: 'Step has been rejected by an approver',
      };
    }

    switch (policy) {
      case 'SINGLE':
      case 'ROLE_BASED':
      case 'DEPARTMENT_BASED':
      case 'BRANCH_BASED':
      case 'COMPANY_BASED':
        return {
          isApproved: currentCount >= minRequired,
          isRejected: false,
          minRequired,
          currentCount,
          rejectionCount,
        };

      case 'PARALLEL':
      case 'SEQUENTIAL':
      case 'MULTI_LEVEL':
        return {
          isApproved: currentCount >= minRequired,
          isRejected: false,
          minRequired,
          currentCount,
          rejectionCount,
        };

      case 'MAJORITY': {
        const totalEligible = step.assignedUsers?.length || minRequired || 1;
        const requiredMajority = Math.floor(totalEligible / 2) + 1;
        return {
          isApproved: currentCount >= requiredMajority,
          isRejected: false,
          minRequired: requiredMajority,
          currentCount,
          rejectionCount,
        };
      }

      default:
        return {
          isApproved: currentCount >= minRequired,
          isRejected: false,
          minRequired,
          currentCount,
          rejectionCount,
        };
    }
  }
}
