import { PermissionDefinition, ERPModule } from '../../types/permissions';
import { UserRole } from '../../types/user';

export const PERMISSION_REGISTRY: PermissionDefinition[] = [
  // ==================== SHIPPING MODULE ====================
  {
    id: 'shipping:shipment:view',
    module: 'shipping',
    resource: 'shipment',
    action: 'view',
    name: 'View Shipments',
    nameAr: 'عرض الشحنات',
    description: 'Allows viewing shipment tracking and details',
    defaultRoles: [
      'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO', 'OPERATIONS_MANAGER',
      'BRANCH_MANAGER', 'DISPATCHER', 'STAFF', 'CUSTOMER_SERVICE_MANAGER',
      'EMPLOYEE', 'CUSTOMER', 'DRIVER', 'PARTNER', 'AGENT', 'READ_ONLY'
    ],
    requireABAC: true
  },
  {
    id: 'shipping:shipment:create',
    module: 'shipping',
    resource: 'shipment',
    action: 'create',
    name: 'Create Shipment',
    nameAr: 'إنشاء شحنة جديدة',
    description: 'Allows creating new shipments and booking orders',
    defaultRoles: [
      'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO', 'OPERATIONS_MANAGER',
      'BRANCH_MANAGER', 'DISPATCHER', 'STAFF', 'CUSTOMER', 'AGENT', 'SALES_MANAGER'
    ]
  },
  {
    id: 'shipping:shipment:update',
    module: 'shipping',
    resource: 'shipment',
    action: 'update',
    name: 'Update Shipment',
    nameAr: 'تحديث الشحنة',
    description: 'Allows editing shipment details, routes, and statuses',
    defaultRoles: [
      'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO', 'OPERATIONS_MANAGER',
      'BRANCH_MANAGER', 'DISPATCHER', 'STAFF', 'DRIVER', 'AGENT'
    ],
    requireABAC: true
  },
  {
    id: 'shipping:shipment:delete',
    module: 'shipping',
    resource: 'shipment',
    action: 'delete',
    name: 'Delete Shipment',
    nameAr: 'حذف الشحنة',
    description: 'Allows canceling or deleting shipment records',
    defaultRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO', 'OPERATIONS_MANAGER']
  },
  {
    id: 'shipping:shipment:assign',
    module: 'shipping',
    resource: 'shipment',
    action: 'assign',
    name: 'Assign Shipment Driver/Courier',
    nameAr: 'تعيين السائق/المندوب للشحنة',
    description: 'Allows assigning drivers, vehicles, and couriers to shipments',
    defaultRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'COO', 'OPERATIONS_MANAGER', 'BRANCH_MANAGER', 'DISPATCHER']
  },

  // ==================== FINANCE MODULE ====================
  {
    id: 'finance:invoice:view',
    module: 'finance',
    resource: 'invoice',
    action: 'view',
    name: 'View Invoices',
    nameAr: 'عرض الفواتير',
    description: 'Allows viewing customer and vendor invoices',
    defaultRoles: [
      'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'CFO', 'FINANCE_MANAGER',
      'FINANCE_OFFICER', 'ACCOUNTANT' as UserRole, 'STAFF', 'CUSTOMER', 'AUDITOR', 'READ_ONLY'
    ],
    requireABAC: true
  },
  {
    id: 'finance:invoice:create',
    module: 'finance',
    resource: 'invoice',
    action: 'create',
    name: 'Generate Invoice',
    nameAr: 'إصدار فاتورة',
    description: 'Allows creating and issuing financial invoices',
    defaultRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'CFO', 'FINANCE_MANAGER', 'FINANCE_OFFICER']
  },
  {
    id: 'finance:invoice:approve',
    module: 'finance',
    resource: 'invoice',
    action: 'approve',
    name: 'Approve High-Value Invoice',
    nameAr: 'اعتماد الفواتير ذات القيمة العالية',
    description: 'Allows approving high-value transactions and credit limits',
    defaultRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'CFO', 'FINANCE_MANAGER'],
    requireABAC: true
  },
  {
    id: 'finance:payment:process',
    module: 'finance',
    resource: 'payment',
    action: 'manage',
    name: 'Process Payments & Offline Sync',
    nameAr: 'معالجة المدفوعات والمزامنة غير المتصلة',
    description: 'Allows collecting payments, processing card charges, and syncing offline queues',
    defaultRoles: [
      'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'CFO', 'FINANCE_MANAGER',
      'FINANCE_OFFICER', 'STAFF', 'CUSTOMER', 'AGENT'
    ]
  },

  // ==================== WAREHOUSE MODULE ====================
  {
    id: 'warehouse:inventory:view',
    module: 'warehouse',
    resource: 'inventory',
    action: 'view',
    name: 'View Inventory',
    nameAr: 'عرض المخزون',
    description: 'Allows viewing warehouse inventory, bin locations, and stock levels',
    defaultRoles: [
      'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO', 'WAREHOUSE_MANAGER',
      'OPERATIONS_MANAGER', 'BRANCH_MANAGER', 'STAFF', 'AUDITOR', 'READ_ONLY'
    ]
  },
  {
    id: 'warehouse:inventory:update',
    module: 'warehouse',
    resource: 'inventory',
    action: 'update',
    name: 'Update Stock Levels',
    nameAr: 'تحديث مستويات المخزون',
    description: 'Allows stock adjustments, receiving goods, and outbound pick/pack',
    defaultRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'COO', 'WAREHOUSE_MANAGER', 'OPERATIONS_MANAGER', 'STAFF']
  },

  // ==================== FLEET MODULE ====================
  {
    id: 'fleet:vehicle:view',
    module: 'fleet',
    resource: 'vehicle',
    action: 'view',
    name: 'View Vehicles & Fleet',
    nameAr: 'عرض أسطول المركبات',
    description: 'Allows viewing vehicle registry, GPS tracking, and telematics',
    defaultRoles: [
      'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO', 'FLEET_MANAGER',
      'OPERATIONS_MANAGER', 'DISPATCHER', 'BRANCH_MANAGER', 'AUDITOR', 'READ_ONLY'
    ]
  },
  {
    id: 'fleet:vehicle:manage',
    module: 'fleet',
    resource: 'vehicle',
    action: 'manage',
    name: 'Manage Vehicles & Maintenance',
    nameAr: 'إدارة المركبات والصيانة',
    description: 'Allows registering vehicles, scheduling maintenance, and logging fuel',
    defaultRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO', 'FLEET_MANAGER', 'OPERATIONS_MANAGER']
  },

  // ==================== CRM & SALES ====================
  {
    id: 'crm:lead:view',
    module: 'crm',
    resource: 'lead',
    action: 'view',
    name: 'View CRM Leads & Deals',
    nameAr: 'عرض العملاء المحتملين والصفقات',
    description: 'Allows viewing sales pipeline, lead contacts, and deal status',
    defaultRoles: [
      'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO', 'SALES_MANAGER',
      'CUSTOMER_SERVICE_MANAGER', 'STAFF', 'AGENT', 'READ_ONLY'
    ],
    requireABAC: true
  },
  {
    id: 'crm:lead:manage',
    module: 'crm',
    resource: 'lead',
    action: 'manage',
    name: 'Manage Leads & Customer Accounts',
    nameAr: 'إدارة صفقات وحسابات العملاء',
    description: 'Allows creating, assigning, and converting CRM sales leads',
    defaultRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'SALES_MANAGER', 'AGENT', 'STAFF']
  },

  // ==================== HR & PAYROLL ====================
  {
    id: 'hr:employee:view',
    module: 'hr',
    resource: 'employee',
    action: 'view',
    name: 'View Employee Directory',
    nameAr: 'عرض دليل الموظفين',
    description: 'Allows viewing employee profiles and organizational chart',
    defaultRoles: [
      'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO', 'HR_MANAGER',
      'BRANCH_MANAGER', 'TEAM_LEADER', 'AUDITOR', 'READ_ONLY'
    ],
    requireABAC: true
  },
  {
    id: 'hr:payroll:view',
    module: 'hr',
    resource: 'payroll',
    action: 'view',
    name: 'View Confidential Payroll',
    nameAr: 'عرض كشوف المرتبات السرية',
    description: 'Allows viewing employee salaries, bonuses, and slips',
    defaultRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'CFO', 'HR_MANAGER', 'FINANCE_MANAGER'],
    requireABAC: true
  },

  // ==================== COMPLIANCE & CUSTOMS ====================
  {
    id: 'compliance:customs:manage',
    module: 'compliance',
    resource: 'customs',
    action: 'manage',
    name: 'Manage Customs Clearance',
    nameAr: 'إدارة التخليص الجمركي',
    description: 'Allows handling customs declarations, tariff codes, and duty fees',
    defaultRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'CUSTOMS_MANAGER', 'OPERATIONS_MANAGER', 'AGENT']
  },

  // ==================== AI PLATFORM ====================
  {
    id: 'ai_platform:copilot:use',
    module: 'ai_platform',
    resource: 'copilot',
    action: 'view',
    name: 'Use AI Logistics Copilot',
    nameAr: 'استخدام المساعد الذكي للوجستيات',
    description: 'Allows querying AI copilot for shipment analytics, summaries, and chat',
    defaultRoles: [
      'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO', 'CFO', 'HR_MANAGER',
      'FINANCE_MANAGER', 'SALES_MANAGER', 'CUSTOMER_SERVICE_MANAGER', 'WAREHOUSE_MANAGER',
      'CUSTOMS_MANAGER', 'FLEET_MANAGER', 'OPERATIONS_MANAGER', 'BRANCH_MANAGER',
      'TEAM_LEADER', 'EMPLOYEE', 'DISPATCHER', 'FINANCE_OFFICER', 'STAFF', 'CUSTOMER', 'AGENT'
    ]
  },

  // ==================== SYSTEM & SETTINGS ====================
  {
    id: 'system:settings:manage',
    module: 'settings',
    resource: 'config',
    action: 'manage',
    name: 'Manage Enterprise System Configuration',
    nameAr: 'إدارة إعدادات النظام وتوزيع الصلاحيات',
    description: 'Full administrative rights to modify system configurations, security policies, and RBAC roles',
    defaultRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'ADMIN']
  }
];

/**
 * Quick lookup index for permissions
 */
const permissionMap = new Map<string, PermissionDefinition>(
  PERMISSION_REGISTRY.map((p) => [p.id, p])
);

export function getPermissionById(id: string): PermissionDefinition | undefined {
  return permissionMap.get(id);
}

export function getPermissionsByModule(moduleName: ERPModule): PermissionDefinition[] {
  return PERMISSION_REGISTRY.filter((p) => p.module === moduleName);
}
