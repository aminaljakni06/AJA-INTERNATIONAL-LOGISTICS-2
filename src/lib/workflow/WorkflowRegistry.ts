import { WorkflowTemplate, WorkflowCategory } from '../../types/workflow';

export class WorkflowRegistry {
  private static templates: Map<string, WorkflowTemplate> = new Map();

  static {
    this.registerStandardTemplates();
  }

  private static registerStandardTemplates() {
    // 1. Shipment Approval Template
    const shipmentTemplate: WorkflowTemplate = {
      id: 'tmpl_shipment_approval',
      code: 'SHIPMENT_APPROVAL',
      name: 'Shipment Booking Approval Workflow',
      description: 'Standard multi-stage approval for high-value or hazardous cargo shipments',
      module: 'SHIPPING',
      category: 'SHIPMENT_APPROVAL',
      version: '1.0',
      active: true,
      initialStepId: 'step_submit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'step_submit',
          name: 'Shipment Submitted',
          stepType: 'START',
          stateOnEntry: 'SUBMITTED',
          transitions: [{ targetStepId: 'step_ops_review' }],
        },
        {
          id: 'step_ops_review',
          name: 'Logistics Operations Review',
          stepType: 'APPROVAL',
          stateOnEntry: 'UNDER_REVIEW',
          approvalPolicy: 'ROLE_BASED',
          requiredRoles: ['DISPATCHER', 'BRANCH_MANAGER', 'ADMIN'],
          minApprovalsRequired: 1,
          sla: {
            dueDurationMinutes: 120,
            responseDurationMinutes: 60,
            escalationLevel: 'LEVEL_1_WARNING',
          },
          transitions: [
            { actionName: 'APPROVE', targetStepId: 'step_compliance_check' },
            { actionName: 'REJECT', targetStepId: 'step_rejected' },
          ],
        },
        {
          id: 'step_compliance_check',
          name: 'Customs & Compliance Review',
          stepType: 'APPROVAL',
          stateOnEntry: 'UNDER_REVIEW',
          approvalPolicy: 'DEPARTMENT_BASED',
          requiredRoles: ['COMPLIANCE_OFFICER', 'ADMIN'],
          minApprovalsRequired: 1,
          sla: {
            dueDurationMinutes: 240,
            responseDurationMinutes: 120,
            escalationLevel: 'LEVEL_2_MANAGER',
          },
          transitions: [
            { actionName: 'APPROVE', targetStepId: 'step_approved' },
            { actionName: 'REJECT', targetStepId: 'step_rejected' },
          ],
        },
        {
          id: 'step_approved',
          name: 'Shipment Approved',
          stepType: 'END',
          stateOnEntry: 'APPROVED',
          transitions: [],
        },
        {
          id: 'step_rejected',
          name: 'Shipment Rejected',
          stepType: 'END',
          stateOnEntry: 'REJECTED',
          transitions: [],
        },
      ],
    };

    // 2. Freight Quote Approval Template
    const quoteTemplate: WorkflowTemplate = {
      id: 'tmpl_quote_approval',
      code: 'QUOTE_APPROVAL',
      name: 'Freight Quote Approval Workflow',
      description: 'Approval workflow for custom discounted rate quotations',
      module: 'SALES',
      category: 'QUOTE_APPROVAL',
      version: '1.0',
      active: true,
      initialStepId: 'step_quote_draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'step_quote_draft',
          name: 'Quote Drafted',
          stepType: 'START',
          stateOnEntry: 'DRAFT',
          transitions: [{ targetStepId: 'step_sales_manager' }],
        },
        {
          id: 'step_sales_manager',
          name: 'Sales Manager Approval',
          stepType: 'APPROVAL',
          stateOnEntry: 'PENDING',
          approvalPolicy: 'ROLE_BASED',
          requiredRoles: ['SALES_MANAGER', 'COMMERCIAL_DIRECTOR', 'ADMIN'],
          minApprovalsRequired: 1,
          sla: {
            dueDurationMinutes: 180,
            responseDurationMinutes: 60,
            escalationLevel: 'LEVEL_1_WARNING',
          },
          transitions: [
            { actionName: 'APPROVE', targetStepId: 'step_approved' },
            { actionName: 'REJECT', targetStepId: 'step_rejected' },
          ],
        },
        {
          id: 'step_approved',
          name: 'Quote Approved',
          stepType: 'END',
          stateOnEntry: 'APPROVED',
          transitions: [],
        },
        {
          id: 'step_rejected',
          name: 'Quote Rejected',
          stepType: 'END',
          stateOnEntry: 'REJECTED',
          transitions: [],
        },
      ],
    };

    // 3. Invoice & Expense Approval Template
    const invoiceTemplate: WorkflowTemplate = {
      id: 'tmpl_invoice_approval',
      code: 'INVOICE_APPROVAL',
      name: 'Financial Invoice & Expense Approval',
      description: 'Dual-level finance approval chain for vendor invoices and corporate expenses',
      module: 'FINANCE',
      category: 'INVOICE_APPROVAL',
      version: '1.0',
      active: true,
      initialStepId: 'step_invoice_submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'step_invoice_submitted',
          name: 'Invoice Submitted',
          stepType: 'START',
          stateOnEntry: 'SUBMITTED',
          transitions: [{ targetStepId: 'step_finance_review' }],
        },
        {
          id: 'step_finance_review',
          name: 'Finance Controller Review',
          stepType: 'APPROVAL',
          stateOnEntry: 'UNDER_REVIEW',
          approvalPolicy: 'DEPARTMENT_BASED',
          requiredRoles: ['ACCOUNTANT', 'FINANCE_MANAGER', 'ADMIN'],
          minApprovalsRequired: 1,
          sla: {
            dueDurationMinutes: 300,
            responseDurationMinutes: 120,
            escalationLevel: 'LEVEL_2_MANAGER',
          },
          transitions: [
            { actionName: 'APPROVE', targetStepId: 'step_cfo_approval' },
            { actionName: 'REJECT', targetStepId: 'step_rejected' },
          ],
        },
        {
          id: 'step_cfo_approval',
          name: 'CFO Final Approval',
          stepType: 'APPROVAL',
          stateOnEntry: 'WAITING',
          approvalPolicy: 'ROLE_BASED',
          requiredRoles: ['CFO', 'EXECUTIVE', 'ADMIN'],
          minApprovalsRequired: 1,
          sla: {
            dueDurationMinutes: 480,
            responseDurationMinutes: 240,
            escalationLevel: 'LEVEL_3_DIRECTOR',
          },
          transitions: [
            { actionName: 'APPROVE', targetStepId: 'step_approved' },
            { actionName: 'REJECT', targetStepId: 'step_rejected' },
          ],
        },
        {
          id: 'step_approved',
          name: 'Invoice Approved for Disbursement',
          stepType: 'END',
          stateOnEntry: 'APPROVED',
          transitions: [],
        },
        {
          id: 'step_rejected',
          name: 'Invoice Rejected',
          stepType: 'END',
          stateOnEntry: 'REJECTED',
          transitions: [],
        },
      ],
    };

    // 4. General Business Workflow Template
    const generalTemplate: WorkflowTemplate = {
      id: 'tmpl_general_workflow',
      code: 'GENERAL_BUSINESS',
      name: 'General Business Operations Workflow',
      description: 'Flexible operational task and approval workflow',
      module: 'SYSTEM',
      category: 'GENERAL_BUSINESS',
      version: '1.0',
      active: true,
      initialStepId: 'step_init',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'step_init',
          name: 'Initiated',
          stepType: 'START',
          stateOnEntry: 'PENDING',
          transitions: [{ targetStepId: 'step_review' }],
        },
        {
          id: 'step_review',
          name: 'Operational Review',
          stepType: 'APPROVAL',
          stateOnEntry: 'UNDER_REVIEW',
          approvalPolicy: 'SINGLE',
          requiredRoles: ['MANAGER', 'ADMIN', 'STAFF'],
          minApprovalsRequired: 1,
          sla: {
            dueDurationMinutes: 1440,
            responseDurationMinutes: 360,
            escalationLevel: 'LEVEL_1_WARNING',
          },
          transitions: [
            { actionName: 'APPROVE', targetStepId: 'step_completed' },
            { actionName: 'REJECT', targetStepId: 'step_rejected' },
          ],
        },
        {
          id: 'step_completed',
          name: 'Workflow Completed',
          stepType: 'END',
          stateOnEntry: 'COMPLETED',
          transitions: [],
        },
        {
          id: 'step_rejected',
          name: 'Workflow Rejected',
          stepType: 'END',
          stateOnEntry: 'REJECTED',
          transitions: [],
        },
      ],
    };

    this.registerTemplate(shipmentTemplate);
    this.registerTemplate(quoteTemplate);
    this.registerTemplate(invoiceTemplate);
    this.registerTemplate(generalTemplate);
  }

  public static getTemplate(code: string): WorkflowTemplate | undefined {
    return this.templates.get(code);
  }

  public static registerTemplate(template: WorkflowTemplate): void {
    this.templates.set(template.code, template);
  }

  public static listTemplates(category?: WorkflowCategory): WorkflowTemplate[] {
    const list = Array.from(this.templates.values());
    if (category) {
      return list.filter((t) => t.category === category);
    }
    return list;
  }
}
