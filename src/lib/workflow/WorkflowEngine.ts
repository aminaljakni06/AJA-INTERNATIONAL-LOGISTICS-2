import {
  WorkflowInstance,
  StartWorkflowInput,
  WorkflowTransitionInput,
  WorkflowTask,
  WorkflowHistoryRecord,
} from '../../types/workflow';
import { WorkflowRegistry } from './WorkflowRegistry';
import { ApprovalEngine } from './ApprovalEngine';
import { TaskEngine } from './TaskEngine';
import { SLAEngine } from './SLAEngine';
import { AutomationEngine } from './AutomationEngine';
import { eventBus } from '../events/EventBus';

export class WorkflowEngine {
  private static instance: WorkflowEngine;

  private instances: Map<string, WorkflowInstance> = new Map();
  private tasks: Map<string, WorkflowTask> = new Map();

  private constructor() {}

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  /**
   * Start a new workflow instance from template code
   */
  public async startWorkflow(input: StartWorkflowInput): Promise<{
    instance: WorkflowInstance;
    initialTask?: WorkflowTask;
  }> {
    const template = WorkflowRegistry.getTemplate(input.templateCode);
    if (!template) {
      throw new Error(`[WorkflowEngine] Template not found for code: ${input.templateCode}`);
    }

    const initialStep = template.steps.find((s) => s.id === template.initialStepId) || template.steps[0];
    const instanceId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const slaDeadline = initialStep.sla
      ? SLAEngine.calculateDueDate(
          initialStep.sla.dueDurationMinutes,
          initialStep.sla.workingHoursOnly
        )
      : undefined;

    const instance: WorkflowInstance = {
      id: instanceId,
      templateId: template.id,
      templateCode: template.code,
      category: template.category,
      module: template.module,
      title: input.title,
      entityType: input.entityType,
      entityId: input.entityId,
      companyId: input.companyId || 'aja-holding',
      branchId: input.branchId,
      departmentId: input.departmentId,
      currentState: initialStep.stateOnEntry,
      currentStepId: initialStep.id,
      status: 'ACTIVE',
      initiatedByUserId: input.initiatedByUserId,
      initiatedByUserName: input.initiatedByUserName,
      priority: input.priority || 'NORMAL',
      minApprovalsRequired: initialStep.minApprovalsRequired || 1,
      currentApprovals: [],
      rejections: [],
      history: [
        {
          id: `hist_${Date.now()}_1`,
          workflowInstanceId: instanceId,
          stepId: initialStep.id,
          fromState: 'DRAFT',
          toState: initialStep.stateOnEntry,
          action: 'WORKFLOW_STARTED',
          performedByUserId: input.initiatedByUserId,
          performedByUserName: input.initiatedByUserName,
          timestamp: now,
          comments: `Workflow instance started for ${input.title}`,
        },
      ],
      slaDeadline,
      isSLAViolated: false,
      metadata: input.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    // Generate AI Suggestion
    instance.aiSuggestion = AutomationEngine.generateAISuggestion(instance, initialStep);

    this.instances.set(instanceId, instance);

    // Create Initial Task if step type is TASK or APPROVAL
    let initialTask: WorkflowTask | undefined;
    if (initialStep.stepType === 'TASK' || initialStep.stepType === 'APPROVAL') {
      initialTask = TaskEngine.createTask({
        workflowInstanceId: instanceId,
        templateCode: template.code,
        stepId: initialStep.id,
        stepName: initialStep.name,
        title: `${initialStep.name}: ${input.title}`,
        description: `Approval required for ${input.entityType} ${input.entityId}`,
        entityType: input.entityType,
        entityId: input.entityId,
        companyId: input.companyId,
        branchId: input.branchId,
        departmentId: input.departmentId,
        assignedRole: initialStep.requiredRoles?.[0],
        assignedDepartmentId: initialStep.requiredDepartmentId,
        assignedBranchId: initialStep.requiredBranchId,
        assignedUserId: initialStep.assignedUsers?.[0],
        priority: input.priority || 'NORMAL',
        dueDate: slaDeadline,
      });

      this.tasks.set(initialTask.id, initialTask);
    }

    // Publish Domain Event
    eventBus.publish({
      name: 'WorkflowStarted',
      aggregateId: instanceId,
      aggregateType: 'WorkflowInstance',
      module: template.module,
      priority: 'HIGH',
      payload: {
        instanceId,
        templateCode: template.code,
        entityType: input.entityType,
        entityId: input.entityId,
        initiatedBy: input.initiatedByUserId,
      },
    });

    return { instance, initialTask };
  }

  /**
   * Transition an active workflow instance
   */
  public async transitionWorkflow(input: WorkflowTransitionInput): Promise<{
    instance: WorkflowInstance;
    nextTask?: WorkflowTask;
  }> {
    const instance = this.instances.get(input.instanceId);
    if (!instance) {
      throw new Error(`[WorkflowEngine] Workflow instance not found: ${input.instanceId}`);
    }

    if (instance.status !== 'ACTIVE') {
      throw new Error(`[WorkflowEngine] Cannot transition instance in state ${instance.status}`);
    }

    const template = WorkflowRegistry.getTemplate(instance.templateCode);
    if (!template) {
      throw new Error(`[WorkflowEngine] Template not found for code: ${instance.templateCode}`);
    }

    const currentStep = template.steps.find((s) => s.id === instance.currentStepId);
    if (!currentStep) {
      throw new Error(`[WorkflowEngine] Current step definition not found: ${instance.currentStepId}`);
    }

    const now = new Date().toISOString();

    // Check action
    if (input.action === 'APPROVE') {
      if (!instance.currentApprovals.includes(input.userId)) {
        instance.currentApprovals.push(input.userId);
      }
    } else if (input.action === 'REJECT') {
      if (!instance.rejections.includes(input.userId)) {
        instance.rejections.push(input.userId);
      }
    }

    // Evaluate approval policy
    const evalResult = ApprovalEngine.evaluateApprovalState(instance, currentStep);

    let nextStepId = input.targetStepId;

    if (!nextStepId) {
      const matchingTransition = currentStep.transitions.find((t) => {
        if (input.action === 'APPROVE' && t.actionName === 'APPROVE') return true;
        if (input.action === 'REJECT' && t.actionName === 'REJECT') return true;
        if (!t.actionName) return true;
        return false;
      });

      nextStepId = matchingTransition ? matchingTransition.targetStepId : currentStep.transitions[0]?.targetStepId;
    }

    const nextStep = template.steps.find((s) => s.id === nextStepId);
    const fromState = instance.currentState;

    if (input.action === 'REJECT' || evalResult.isRejected) {
      instance.status = 'REJECTED';
      instance.currentState = nextStep ? nextStep.stateOnEntry : 'REJECTED';
    } else if (evalResult.isApproved) {
      if (nextStep) {
        instance.currentStepId = nextStep.id;
        instance.currentState = nextStep.stateOnEntry;
        if (nextStep.stepType === 'END' || nextStep.stateOnEntry === 'APPROVED' || nextStep.stateOnEntry === 'COMPLETED') {
          instance.status = 'COMPLETED';
        }
      } else {
        instance.status = 'COMPLETED';
        instance.currentState = 'APPROVED';
      }
    }

    // Update SLA deadline if step changed
    if (nextStep && nextStep.sla) {
      instance.slaDeadline = SLAEngine.calculateDueDate(
        nextStep.sla.dueDurationMinutes,
        nextStep.sla.workingHoursOnly
      );
    }

    // Record History Log
    const historyEntry: WorkflowHistoryRecord = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workflowInstanceId: instance.id,
      stepId: currentStep.id,
      fromState,
      toState: instance.currentState,
      action: input.action,
      performedByUserId: input.userId,
      performedByUserName: input.userName,
      performedByUserRole: input.userRole,
      comments: input.comments,
      timestamp: now,
    };

    instance.history.unshift(historyEntry);
    instance.updatedAt = now;

    // Complete existing task for current step
    for (const task of this.tasks.values()) {
      if (task.workflowInstanceId === instance.id && task.stepId === currentStep.id && task.status === 'PENDING') {
        TaskEngine.completeTask(task, input.userId, input.comments);
      }
    }

    // Create next task if instance remains active
    let nextTask: WorkflowTask | undefined;
    if (instance.status === 'ACTIVE' && nextStep && (nextStep.stepType === 'TASK' || nextStep.stepType === 'APPROVAL')) {
      nextTask = TaskEngine.createTask({
        workflowInstanceId: instance.id,
        templateCode: template.code,
        stepId: nextStep.id,
        stepName: nextStep.name,
        title: `${nextStep.name}: ${instance.title}`,
        description: `Action required for ${instance.entityType} ${instance.entityId}`,
        entityType: instance.entityType,
        entityId: instance.entityId,
        companyId: instance.companyId,
        branchId: instance.branchId,
        departmentId: instance.departmentId,
        assignedRole: nextStep.requiredRoles?.[0],
        assignedDepartmentId: nextStep.requiredDepartmentId,
        assignedBranchId: nextStep.requiredBranchId,
        assignedUserId: nextStep.assignedUsers?.[0],
        priority: instance.priority,
        dueDate: instance.slaDeadline,
      });

      this.tasks.set(nextTask.id, nextTask);
    }

    // Refresh AI Suggestion
    if (nextStep) {
      instance.aiSuggestion = AutomationEngine.generateAISuggestion(instance, nextStep);
    }

    // Publish Domain Events
    eventBus.publish({
      name: 'WorkflowStateChanged',
      aggregateId: instance.id,
      aggregateType: 'WorkflowInstance',
      module: template.module,
      priority: 'HIGH',
      payload: {
        instanceId: instance.id,
        fromState,
        toState: instance.currentState,
        action: input.action,
        userId: input.userId,
      },
    });

    if (instance.status === 'COMPLETED') {
      eventBus.publish({
        name: 'WorkflowCompleted',
        aggregateId: instance.id,
        aggregateType: 'WorkflowInstance',
        module: template.module,
        priority: 'CRITICAL',
        payload: { instanceId: instance.id, finalState: instance.currentState },
      });
    }

    return { instance, nextTask };
  }

  /**
   * Get workflow instance by ID
   */
  public getInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Get active tasks for user/role/department
   */
  public getPendingTasks(user?: {
    userId?: string;
    role?: string;
    departmentId?: string;
    branchId?: string;
  }): WorkflowTask[] {
    const allTasks = Array.from(this.tasks.values()).filter(
      (t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS' || t.status === 'DELEGATED'
    );

    if (!user) return allTasks;

    return allTasks.filter((task) => {
      if (user.userId && task.assignedUserId === user.userId) return true;
      if (user.role === 'ADMIN') return true;
      if (user.role && task.assignedRole === user.role) return true;
      if (user.departmentId && task.assignedDepartmentId === user.departmentId) return true;
      if (user.branchId && task.assignedBranchId === user.branchId) return true;
      return false;
    });
  }

  /**
   * Run background SLA check on all active instances and tasks
   */
  public checkSLAViolations(): { escalatedInstances: number; escalatedTasks: number } {
    let escalatedInstances = 0;
    let escalatedTasks = 0;

    for (const instance of this.instances.values()) {
      if (instance.status === 'ACTIVE') {
        const result = SLAEngine.applySLAToInstance(instance);
        if (result.escalated) {
          escalatedInstances++;
          eventBus.publish({
            name: 'SLAEscalated',
            aggregateId: instance.id,
            aggregateType: 'WorkflowInstance',
            module: instance.module,
            priority: 'CRITICAL',
            payload: {
              instanceId: instance.id,
              currentStepId: instance.currentStepId,
              escalationLevel: result.escalationLevel,
            },
          });
        }
      }
    }

    for (const task of this.tasks.values()) {
      if (task.status === 'PENDING') {
        const result = SLAEngine.applySLAToTask(task);
        if (result.escalated) {
          escalatedTasks++;
        }
      }
    }

    return { escalatedInstances, escalatedTasks };
  }
}

export const workflowEngine = WorkflowEngine.getInstance();
