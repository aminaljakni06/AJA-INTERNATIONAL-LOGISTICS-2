import { WorkflowEngine } from '../lib/workflow/WorkflowEngine';
import { WorkflowRegistry } from '../lib/workflow/WorkflowRegistry';
import {
  WorkflowInstance,
  StartWorkflowInput,
  WorkflowTransitionInput,
  WorkflowTask,
  WorkflowTemplate,
  WorkflowCategory,
} from '../types/workflow';
import { NotificationService } from './notificationService';
import { EventBusService } from './eventBusService';
import { getAdminFirestore } from '../server/firebaseAdmin';

export class WorkflowService {
  private static engine = WorkflowEngine.getInstance();

  /**
   * Start a new workflow instance
   */
  public static async startWorkflow(input: StartWorkflowInput): Promise<{
    instance: WorkflowInstance;
    initialTask?: WorkflowTask;
  }> {
    const result = await this.engine.startWorkflow(input);

    // Persist instance and task to Firestore
    this.persistInstanceToFirestore(result.instance).catch((err) =>
      console.warn('[WorkflowService] Firestore persist warning:', err.message)
    );

    if (result.initialTask) {
      this.persistTaskToFirestore(result.initialTask).catch((err) =>
        console.warn('[WorkflowService] Firestore task persist warning:', err.message)
      );

      // Notify initial assignees
      this.notifyTaskAssignee(result.initialTask).catch((err) =>
        console.warn('[WorkflowService] Task notification warning:', err.message)
      );
    }

    return result;
  }

  /**
   * Submit an action / transition on a workflow instance
   */
  public static async transitionWorkflow(input: WorkflowTransitionInput): Promise<{
    instance: WorkflowInstance;
    nextTask?: WorkflowTask;
  }> {
    const result = await this.engine.transitionWorkflow(input);

    this.persistInstanceToFirestore(result.instance).catch((err) =>
      console.warn('[WorkflowService] Firestore transition update warning:', err.message)
    );

    if (result.nextTask) {
      this.persistTaskToFirestore(result.nextTask).catch((err) =>
        console.warn('[WorkflowService] Firestore next task persist warning:', err.message)
      );

      this.notifyTaskAssignee(result.nextTask).catch((err) =>
        console.warn('[WorkflowService] Next task notification warning:', err.message)
      );
    }

    return result;
  }

  /**
   * Get instance details by ID
   */
  public static getInstance(instanceId: string): WorkflowInstance | undefined {
    return this.engine.getInstance(instanceId);
  }

  /**
   * Get pending tasks for a user or role
   */
  public static getPendingTasks(user?: {
    userId?: string;
    role?: string;
    departmentId?: string;
    branchId?: string;
  }): WorkflowTask[] {
    return this.engine.getPendingTasks(user);
  }

  /**
   * List available workflow templates
   */
  public static listTemplates(category?: WorkflowCategory): WorkflowTemplate[] {
    return WorkflowRegistry.listTemplates(category);
  }

  /**
   * Run SLA check background trigger
   */
  public static runSLACheck(): { escalatedInstances: number; escalatedTasks: number } {
    return this.engine.checkSLAViolations();
  }

  /**
   * Persist workflow instance to Firestore
   */
  private static async persistInstanceToFirestore(instance: WorkflowInstance): Promise<void> {
    try {
      await getAdminFirestore()
        .collection('workflow_instances')
        .doc(instance.id)
        .set({ ...instance, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      // Quiet fallback if offline
    }
  }

  /**
   * Persist workflow task to Firestore
   */
  private static async persistTaskToFirestore(task: WorkflowTask): Promise<void> {
    try {
      await getAdminFirestore()
        .collection('workflow_tasks')
        .doc(task.id)
        .set({ ...task, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      // Quiet fallback if offline
    }
  }

  /**
   * Dispatch notification to task assigned role or user
   */
  private static async notifyTaskAssignee(task: WorkflowTask): Promise<void> {
    try {
      await EventBusService.publishNotificationSent(
        task.assignedUserId || task.assignedRole || 'STAFF',
        'TASK_ASSIGNED',
        {
          taskId: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
        }
      );
    } catch (err) {
      // Quiet fail
    }
  }
}
