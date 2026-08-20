export class WorkflowOrchestrationService {
  private static readonly WORKFLOWS = [
    {
      workflowId: 'WF-B2B-EDI-01',
      nameEn: 'B2B EDI 204/214 Shipment Automation',
      nameAr: 'أتمتة تبادل البيانات الإلكترونية B2B EDI لشحنات الموردين',
      category: 'B2B_INTEGRATION',
      triggerType: 'EDI_X12_INBOUND',
      slaMinutes: 15,
      activeExecutions: 24,
      totalToday: 1420,
      successRatePct: 99.8,
      lastExecutedAt: new Date().toISOString(),
      steps: [
        'Parse EDI 204 Tender Document',
        'Validate Customer Account & Credit Line',
        'Generate Internal Order & Acknowledgment EDI 997',
        'Dispatch Rate Agreement to Carrier',
      ],
    },
    {
      workflowId: 'WF-FIN-SETTLE-02',
      nameEn: 'Automated Carrier Settlement & ZATCA Clear',
      nameAr: 'التسوية الآلية للناقلين والفسح الضريبي من الزكاة ZATCA',
      category: 'FINANCE',
      triggerType: 'PROOF_OF_DELIVERY_CONFIRMED',
      slaMinutes: 5,
      activeExecutions: 8,
      totalToday: 890,
      successRatePct: 100.0,
      lastExecutedAt: new Date().toISOString(),
      steps: [
        'Verify E-POD Signature & GPS Geofence',
        'Calculate Net Payable via Rate Card',
        'Generate ZATCA Phase 2 Cryptographic Stamp',
        'Trigger Adyen Mass Payout API to Carrier Account',
      ],
    },
    {
      workflowId: 'WF-WH-AUTO-DISPATCH-03',
      nameEn: 'Smart Warehouse Automated Pick & Putaway Workflow',
      nameAr: 'مسار عمل التوجيه الآلي للالتقاط والتخزين بالمستودعات',
      category: 'WAREHOUSE',
      triggerType: 'SAP_ERP_OUTBOUND_DELIVERY',
      slaMinutes: 2,
      activeExecutions: 45,
      totalToday: 3200,
      successRatePct: 99.9,
      lastExecutedAt: new Date().toISOString(),
      steps: [
        'Receive ERP Outbound Delivery Note',
        'Optimize Pick Path via WES AI Engine',
        'Assign Task to AGV Robot & Forklift Terminal',
        'Publish Inventory Subtraction Event to Lakehouse',
      ],
    },
  ];

  public static getWorkflows() {
    return this.WORKFLOWS;
  }

  public static triggerWorkflow(workflowId: string, customContext?: any) {
    const wf = this.WORKFLOWS.find((w) => w.workflowId === workflowId) || this.WORKFLOWS[0];
    return {
      executionInstanceId: `EXEC-${wf.workflowId}-${Date.now()}`,
      workflowId: wf.workflowId,
      nameAr: wf.nameAr,
      status: 'RUNNING',
      triggeredAt: new Date().toISOString(),
      currentStepIndex: 1,
      totalSteps: wf.steps.length,
      nextStepName: wf.steps[0],
      context: customContext || { initiatedBy: 'Enterprise-iPaaS-Console' },
    };
  }
}
