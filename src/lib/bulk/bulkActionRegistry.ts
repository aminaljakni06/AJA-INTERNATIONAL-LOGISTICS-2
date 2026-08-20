/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Bulk Action Registry
 * Phase: Enterprise UI System
 * Module: Bulk Actions, Selection & Mass Operations (STEP 05.17)
 * Version: 1.0
 */

import { BulkActionDefinition } from '../../types/bulkFramework';

// Global Bulk Action Registry mapping resource -> BulkActionDefinition[]
const resourceBulkActionRegistry = new Map<string, BulkActionDefinition[]>();

/**
 * Register bulk actions for a specific resource
 */
export function registerBulkActions(
  resource: string,
  actions: BulkActionDefinition[]
): void {
  if (!resource) return;
  const existing = resourceBulkActionRegistry.get(resource) || [];
  
  // Merge by id (replace existing if duplicate id)
  const actionMap = new Map<string, BulkActionDefinition>();
  existing.forEach((a) => actionMap.set(a.id, a));
  actions.forEach((a) => actionMap.set(a.id, a));

  resourceBulkActionRegistry.set(resource, Array.from(actionMap.values()));
}

/**
 * Retrieve registered bulk actions for a given resource
 */
export function getBulkActionsForResource(resource: string): BulkActionDefinition[] {
  const custom = resourceBulkActionRegistry.get(resource);
  if (custom && custom.length > 0) {
    return custom;
  }
  return getDefaultBulkActionsForResource(resource);
}

/**
 * Get a specific bulk action definition by ID and resource
 */
export function getBulkActionById(
  resource: string,
  actionId: string
): BulkActionDefinition | null {
  const actions = getBulkActionsForResource(resource);
  return actions.find((a) => a.id === actionId) || null;
}

/**
 * Pre-defined Default Bulk Actions per Resource Architecture
 */
function getDefaultBulkActionsForResource(resource: string): BulkActionDefinition[] {
  if (resource === 'shipments') {
    return [
      {
        id: 'shipments.export',
        resource: 'shipments',
        labelEn: 'Export Selected',
        labelAr: 'تصدير المحدد',
        icon: 'Download',
        variant: 'secondary',
        supportsQuerySelection: true,
        executionPolicy: 'BEST_EFFORT',
      },
      {
        id: 'shipments.update_status',
        resource: 'shipments',
        labelEn: 'Update Status',
        labelAr: 'تحديث الحالة',
        icon: 'RefreshCw',
        variant: 'primary',
        permission: 'shipment.bulk.update',
        inputFields: [
          {
            name: 'status',
            labelEn: 'New Shipment Status',
            labelAr: 'حالة الشحنة الجديدة',
            type: 'select',
            required: true,
            options: [
              { value: 'BOOKED', labelEn: 'Booked / Registered', labelAr: 'تم الحجز / مسجلة' },
              { value: 'IN_TRANSIT', labelEn: 'In Transit', labelAr: 'قيد النقل بالطريق' },
              { value: 'CUSTOMS_CLEARANCE', labelEn: 'Customs Clearance', labelAr: 'التخليص الجمركي' },
              { value: 'OUT_FOR_DELIVERY', labelEn: 'Out for Delivery', labelAr: 'خارج للتسليم' },
              { value: 'DELIVERED', labelEn: 'Delivered', labelAr: 'تم التسليم' },
              { value: 'ON_HOLD', labelEn: 'On Hold / Exception', labelAr: 'معلقة / استثناء' },
            ],
          },
        ],
        supportsQuerySelection: true,
        executionPolicy: 'BEST_EFFORT',
      },
      {
        id: 'shipments.assign_carrier',
        resource: 'shipments',
        labelEn: 'Assign Carrier',
        labelAr: 'تعيين الناقل اللوجستي',
        icon: 'Users',
        variant: 'secondary',
        permission: 'shipment.bulk.assign',
        inputFields: [
          {
            name: 'carrierName',
            labelEn: 'Carrier Partner Name',
            labelAr: 'اسم الشريك الناقل',
            type: 'text',
            required: true,
            placeholderEn: 'e.g. Saudi Post / Aramex / DHL',
            placeholderAr: 'مثال: سبل / أرامكس / دي إتش إل',
          },
        ],
        supportsQuerySelection: true,
        executionPolicy: 'BEST_EFFORT',
      },
      {
        id: 'shipments.archive',
        resource: 'shipments',
        labelEn: 'Archive Records',
        labelAr: 'أرشفة السجلات',
        icon: 'Archive',
        variant: 'warning',
        permission: 'shipment.bulk.archive',
        requiresConfirmation: true,
        confirmation: {
          titleEn: 'Confirm Bulk Archive',
          titleAr: 'تأكيد أرشفة الشحنات الجماعية',
          messageEn: 'Are you sure you want to archive selected shipment record(s)? Archived records are preserved in audit history.',
          messageAr: 'هل أنت تأكد من رغبتك في أرشفة سجلات الشحنات المحددة؟ يتم حفظ السجلات المؤرشفة في سجل التدقيق.',
          isDestructive: false,
        },
        supportsQuerySelection: true,
        executionPolicy: 'BEST_EFFORT',
      },
      {
        id: 'shipments.delete',
        resource: 'shipments',
        labelEn: 'Delete Permanently',
        labelAr: 'حذف نهائي',
        icon: 'Trash2',
        variant: 'danger',
        permission: 'shipment.bulk.delete',
        requiresConfirmation: true,
        confirmation: {
          titleEn: 'Confirm Permanent Deletion',
          titleAr: 'تأكيد الحذف النهائي الشحنات',
          messageEn: 'WARNING: Selected shipment record(s) will be permanently deleted. This operation cannot be undone.',
          messageAr: 'تحذير: سيتم حذف سجلات الشحنات المحددة نهائياً. لا يمكن التراجع عن هذه العملية.',
          isDestructive: true,
          requiredTypedPhrase: 'DELETE',
        },
        supportsQuerySelection: false,
        maxExplicitSelection: 50,
        executionPolicy: 'ATOMIC',
      },
    ];
  }

  if (resource === 'customers') {
    return [
      {
        id: 'customers.export',
        resource: 'customers',
        labelEn: 'Export Selected',
        labelAr: 'تصدير المحدد',
        icon: 'Download',
        variant: 'secondary',
        supportsQuerySelection: true,
        executionPolicy: 'BEST_EFFORT',
      },
      {
        id: 'customers.update_status',
        resource: 'customers',
        labelEn: 'Change Account Status',
        labelAr: 'تغيير حالة الحساب',
        icon: 'UserCheck',
        variant: 'primary',
        permission: 'customer.bulk.update',
        inputFields: [
          {
            name: 'status',
            labelEn: 'Account Status',
            labelAr: 'حالة الحساب',
            type: 'select',
            required: true,
            options: [
              { value: 'ACTIVE', labelEn: 'Active', labelAr: 'نشط' },
              { value: 'SUSPENDED', labelEn: 'Suspended', labelAr: 'موقوف' },
              { value: 'INACTIVE', labelEn: 'Inactive', labelAr: 'غير نشط' },
            ],
          },
        ],
        supportsQuerySelection: true,
        executionPolicy: 'BEST_EFFORT',
      },
      {
        id: 'customers.assign_account_manager',
        resource: 'customers',
        labelEn: 'Assign Account Manager',
        labelAr: 'تعيين مدير الحساب',
        icon: 'Users',
        variant: 'secondary',
        permission: 'customer.bulk.assign',
        inputFields: [
          {
            name: 'managerName',
            labelEn: 'Account Manager Name',
            labelAr: 'اسم مدير الحساب',
            type: 'text',
            required: true,
          },
        ],
        supportsQuerySelection: true,
        executionPolicy: 'BEST_EFFORT',
      },
    ];
  }

  if (resource === 'quotes') {
    return [
      {
        id: 'quotes.export',
        resource: 'quotes',
        labelEn: 'Export Selected',
        labelAr: 'تصدير المحدد',
        icon: 'Download',
        variant: 'secondary',
        supportsQuerySelection: true,
        executionPolicy: 'BEST_EFFORT',
      },
      {
        id: 'quotes.approve',
        resource: 'quotes',
        labelEn: 'Approve Quotes',
        labelAr: 'اعتماد عروض الأسعار',
        icon: 'CheckCircle2',
        variant: 'success',
        permission: 'quote.bulk.approve',
        requiresConfirmation: true,
        confirmation: {
          titleEn: 'Approve Selected Quotes',
          titleAr: 'تأكيد اعتماد عروض الأسعار',
          messageEn: 'Are you sure you want to approve selected commercial quote request(s)?',
          messageAr: 'هل أنت تأكد من رغبتك في اعتماد طلبات عروض الأسعار المحددة؟',
        },
        supportsQuerySelection: true,
        executionPolicy: 'BEST_EFFORT',
      },
      {
        id: 'quotes.reject',
        resource: 'quotes',
        labelEn: 'Reject Quotes',
        labelAr: 'رفض عروض الأسعار',
        icon: 'XCircle',
        variant: 'danger',
        permission: 'quote.bulk.reject',
        inputFields: [
          {
            name: 'rejectionReason',
            labelEn: 'Rejection Reason',
            labelAr: 'سبب الرفض',
            type: 'textarea',
            required: true,
          },
        ],
        supportsQuerySelection: true,
        executionPolicy: 'BEST_EFFORT',
      },
    ];
  }

  // Fallback Generic Bulk Actions
  return [
    {
      id: `${resource}.export`,
      resource,
      labelEn: 'Export Selected',
      labelAr: 'تصدير المحدد',
      icon: 'Download',
      variant: 'secondary',
      supportsQuerySelection: true,
      executionPolicy: 'BEST_EFFORT',
    },
    {
      id: `${resource}.update_status`,
      resource,
      labelEn: 'Update Status',
      labelAr: 'تحديث الحالة',
      icon: 'RefreshCw',
      variant: 'primary',
      inputFields: [
        {
          name: 'status',
          labelEn: 'New Status',
          labelAr: 'الحالة الجديدة',
          type: 'select',
          required: true,
          options: [
            { value: 'ACTIVE', labelEn: 'Active', labelAr: 'نشط' },
            { value: 'ARCHIVED', labelEn: 'Archived', labelAr: 'مؤرشف' },
          ],
        },
      ],
      supportsQuerySelection: true,
      executionPolicy: 'BEST_EFFORT',
    },
    {
      id: `${resource}.delete`,
      resource,
      labelEn: 'Delete Selected',
      labelAr: 'حذف المحدد',
      icon: 'Trash2',
      variant: 'danger',
      requiresConfirmation: true,
      confirmation: {
        titleEn: 'Confirm Bulk Deletion',
        titleAr: 'تأكيد الحذف الجماعي',
        messageEn: 'Are you sure you want to delete selected item(s)?',
        messageAr: 'هل أنت تأكد من حذف السجلات المحددة؟',
        isDestructive: true,
      },
      supportsQuerySelection: false,
      maxExplicitSelection: 50,
      executionPolicy: 'ATOMIC',
    },
  ];
}
