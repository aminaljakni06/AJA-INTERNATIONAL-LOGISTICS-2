import {
  WorkflowTask,
  TaskPriority,
  TaskStatus,
  WorkflowTaskComment,
  WorkflowTaskAttachment,
} from '../../types/workflow';

export interface CreateTaskInput {
  workflowInstanceId: string;
  templateCode: string;
  stepId: string;
  stepName: string;
  title: string;
  description?: string;
  entityType: string;
  entityId: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
  assignedUserId?: string;
  assignedRole?: string;
  assignedDepartmentId?: string;
  assignedBranchId?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export class TaskEngine {
  /**
   * Instantiate a new human/system task
   */
  public static createTask(input: CreateTaskInput): WorkflowTask {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    return {
      id: taskId,
      workflowInstanceId: input.workflowInstanceId,
      templateCode: input.templateCode,
      stepId: input.stepId,
      stepName: input.stepName,
      title: input.title,
      description: input.description,
      entityType: input.entityType,
      entityId: input.entityId,
      companyId: input.companyId,
      branchId: input.branchId,
      departmentId: input.departmentId,
      assignedUserId: input.assignedUserId,
      assignedRole: input.assignedRole,
      assignedDepartmentId: input.assignedDepartmentId,
      assignedBranchId: input.assignedBranchId,
      status: 'PENDING',
      priority: input.priority || 'NORMAL',
      dueDate: input.dueDate,
      escalated: false,
      escalationLevel: 'NONE',
      comments: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Reassign a task to another user
   */
  public static reassignTask(
    task: WorkflowTask,
    newUserId: string,
    reassignedByUserId: string,
    commentText?: string
  ): WorkflowTask {
    const updated = { ...task };
    updated.assignedUserId = newUserId;
    updated.status = 'REASSIGNED';
    updated.updatedAt = new Date().toISOString();

    if (commentText) {
      this.addComment(updated, reassignedByUserId, 'User', commentText);
    }
    return updated;
  }

  /**
   * Delegate a task
   */
  public static delegateTask(
    task: WorkflowTask,
    targetUserId: string,
    delegatedByUserId: string,
    commentText?: string
  ): WorkflowTask {
    const updated = { ...task };
    updated.delegatedFromUserId = task.assignedUserId || delegatedByUserId;
    updated.assignedUserId = targetUserId;
    updated.status = 'DELEGATED';
    updated.updatedAt = new Date().toISOString();

    if (commentText) {
      this.addComment(
        updated,
        delegationCommentAuthor(delegatedByUserId),
        'User',
        `Task delegated to ${targetUserId}. Note: ${commentText}`
      );
    }
    return updated;
  }

  /**
   * Complete a task
   */
  public static completeTask(
    task: WorkflowTask,
    completedByUserId: string,
    commentText?: string
  ): WorkflowTask {
    const updated = { ...task };
    updated.status = 'COMPLETED';
    updated.completedByUserId = completedByUserId;
    updated.completedAt = new Date().toISOString();
    updated.updatedAt = new Date().toISOString();

    if (commentText) {
      this.addComment(updated, completedByUserId, 'User', commentText);
    }
    return updated;
  }

  /**
   * Add comment to task
   */
  public static addComment(
    task: WorkflowTask,
    userId: string,
    userName: string,
    commentText: string,
    userRole?: string
  ): WorkflowTaskComment {
    const comment: WorkflowTaskComment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName,
      userRole,
      comment: commentText,
      createdAt: new Date().toISOString(),
    };
    task.comments.push(comment);
    task.updatedAt = new Date().toISOString();
    return comment;
  }

  /**
   * Add attachment to task
   */
  public static addAttachment(
    task: WorkflowTask,
    name: string,
    url: string,
    uploadedBy?: string,
    size?: number
  ): WorkflowTaskAttachment {
    const attachment: WorkflowTaskAttachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      url,
      size,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
    };
    task.attachments.push(attachment);
    task.updatedAt = new Date().toISOString();
    return attachment;
  }
}

function delegationCommentAuthor(userId: string): string {
  return userId || 'System';
}
