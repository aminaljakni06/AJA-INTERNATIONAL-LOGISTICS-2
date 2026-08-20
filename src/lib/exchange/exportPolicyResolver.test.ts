/**
 * AJA INTERNATIONAL LOGISTICS — Export Policy Resolver Verification Suite
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Data Export & Import (STEP 05.18.03)
 * Version: 1.0
 */

import {
  resolveExportPolicy,
  normalizeExportFormat,
  resolveSelectionDescriptor,
  ExportAuthContext,
} from './exportPolicyResolver';
import { EnterpriseExportRequest } from '../../types/dataTransferFramework';
import { User } from '../../types/user';

async function runTests() {
  console.log('=== STEP 05.18.03 EXPORT POLICY RESOLVER VERIFICATION SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  const mockAdminUser: User = {
    id: 'usr_admin',
    fullName: 'Admin User',
    phone: '+966500000000',
    email: 'admin@aja.sa',
    role: 'SYSTEM_ADMIN',
    companyId: 'COMP-AJA-01',
    branchId: 'BR-RUH-01',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const mockStaffUser: User = {
    id: 'usr_staff',
    fullName: 'Logistics Staff',
    phone: '+966500000001',
    email: 'staff@aja.sa',
    role: 'STAFF',
    companyId: 'COMP-AJA-01',
    branchId: 'BR-RUH-01',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const mockAuthContextAdmin: ExportAuthContext = {
    user: mockAdminUser,
    userId: mockAdminUser.id,
    companyId: mockAdminUser.companyId || undefined,
    branchId: mockAdminUser.branchId || undefined,
  };

  const mockAuthContextStaff: ExportAuthContext = {
    user: mockStaffUser,
    userId: mockStaffUser.id,
    companyId: mockStaffUser.companyId || undefined,
    branchId: mockStaffUser.branchId || undefined,
    userPermissions: ['shipments.export', 'customers.export', 'quotes.export'],
  };

  // 1. EXPLICIT selection mode with valid IDs resolves correctly
  {
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'csv',
      selection: {
        mode: 'EXPLICIT',
        ids: ['SHP-001', 'SHP-002'],
      },
    };
    const res = await resolveExportPolicy('shipments', req, mockAuthContextAdmin);
    assert(
      res.success && res.policy?.effectiveSelectionMode === 'EXPLICIT' && res.policy.estimatedRecordCount === 2,
      '1. EXPLICIT selection mode with valid IDs resolves correctly'
    );
  }

  // 2. QUERY selection mode preserves EnterpriseQueryState and excludedIds
  {
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'xlsx',
      selection: {
        mode: 'QUERY',
        resource: 'shipments',
        query: {
          search: 'Riyadh',
          filters: { status: 'IN_TRANSIT' },
          sort: { field: 'createdAt', direction: 'desc' },
          pagination: { page: 1, pageSize: 25 },
        },
        excludedIds: ['SHP-005'],
      },
    };
    const res = await resolveExportPolicy('shipments', req, mockAuthContextAdmin);
    assert(
      res.success &&
        res.policy?.effectiveSelectionMode === 'QUERY' &&
        res.policy.selection.mode === 'QUERY' &&
        res.policy.selection.excludedIds?.includes('SHP-005') &&
        res.policy.validatedQuery?.search === 'Riyadh',
      '2. QUERY selection mode preserves EnterpriseQueryState and excludedIds'
    );
  }

  // 3. PAGE selection mode resolves correctly
  {
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'json',
      selection: {
        mode: 'PAGE',
        ids: ['SHP-001', 'SHP-002', 'SHP-003'],
        page: 1,
      },
    };
    const res = await resolveExportPolicy('shipments', req, mockAuthContextAdmin);
    assert(
      res.success && res.policy?.effectiveSelectionMode === 'PAGE' && res.policy.estimatedRecordCount === 3,
      '3. PAGE selection mode resolves correctly'
    );
  }

  // 4. Legacy ExchangeScope normalizes correctly to BulkSelectionDescriptor
  {
    const req1: EnterpriseExportRequest = {
      resource: 'customers',
      format: 'csv',
      scope: 'selected',
      selectedIds: ['CUST-100'],
    };
    const desc1 = resolveSelectionDescriptor(req1);

    const req2: EnterpriseExportRequest = {
      resource: 'customers',
      format: 'csv',
      scope: 'query',
      queryState: { search: 'Saudi', filters: {}, sort: { field: 'displayName', direction: 'asc' }, pagination: { page: 1, pageSize: 25 } },
      excludedIds: ['CUST-999'],
    };
    const desc2 = resolveSelectionDescriptor(req2);

    assert(
      desc1.mode === 'EXPLICIT' && desc1.ids?.[0] === 'CUST-100' && desc2.mode === 'QUERY' && desc2.excludedIds?.[0] === 'CUST-999',
      '4. Legacy ExchangeScope normalizes correctly to BulkSelectionDescriptor'
    );
  }

  // 5. Legacy ExchangeScope 'all' is strictly constrained to tenant scope
  {
    const req: EnterpriseExportRequest = {
      resource: 'customers',
      format: 'csv',
      scope: 'all',
    };
    const res = await resolveExportPolicy('customers', req, mockAuthContextAdmin);
    assert(
      res.success &&
        res.policy?.tenantScope.companyId === 'COMP-AJA-01' &&
        res.policy?.validatedQuery?.filters?.companyId === 'COMP-AJA-01',
      "5. Legacy ExchangeScope 'all' is strictly constrained to tenant scope"
    );
  }

  // 6. Unknown resource fails with UNAUTHORIZED_RESOURCE
  {
    const req: EnterpriseExportRequest = {
      resource: 'unknown_secret_db',
      format: 'csv',
      selection: { mode: 'EXPLICIT', ids: ['1'] },
    };
    const res = await resolveExportPolicy('unknown_secret_db', req, mockAuthContextAdmin);
    assert(
      !res.success && res.errorCode === 'UNAUTHORIZED_RESOURCE',
      '6. Unknown resource fails with UNAUTHORIZED_RESOURCE error'
    );
  }

  // 7. User without resource export permission fails
  {
    const noPermAuth: ExportAuthContext = {
      userId: 'usr_restricted',
      user: {
        id: 'usr_restricted',
        fullName: 'Restricted User',
        phone: '+966500000000',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        email: 'res@aja.sa',
        role: 'READ_ONLY',
      },
      userPermissions: [],
    };
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'csv',
      selection: { mode: 'EXPLICIT', ids: ['SHP-001'] },
    };
    const res = await resolveExportPolicy('shipments', req, noPermAuth);
    assert(
      !res.success && res.errorCode === 'UNAUTHORIZED_RESOURCE',
      '7. User without resource export permission fails with UNAUTHORIZED_RESOURCE'
    );
  }

  // 8. CSV format normalizes to SUPPORTED
  {
    const norm = normalizeExportFormat('csv');
    assert(norm.normalizedFormat === 'csv' && norm.status === 'SUPPORTED', '8. CSV format normalizes to SUPPORTED');
  }

  // 9. XLSX / Excel formats normalize to SUPPORTED
  {
    const norm1 = normalizeExportFormat('xlsx');
    const norm2 = normalizeExportFormat('excel');
    assert(
      norm1.normalizedFormat === 'xlsx' && norm1.status === 'SUPPORTED' && norm2.normalizedFormat === 'xlsx',
      '9. XLSX / Excel formats normalize to SUPPORTED'
    );
  }

  // 10. JSON format normalizes to SUPPORTED
  {
    const norm = normalizeExportFormat('json');
    assert(norm.normalizedFormat === 'json' && norm.status === 'SUPPORTED', '10. JSON format normalizes to SUPPORTED');
  }

  // 11. PDF format normalizes to UNSUPPORTED / PARTIAL
  {
    const norm = normalizeExportFormat('pdf');
    assert(norm.status === 'UNSUPPORTED', '11. PDF format normalizes to UNSUPPORTED');
  }

  // 12. Unsupported formats return INVALID_FILE_TYPE error
  {
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'pdf',
      selection: { mode: 'EXPLICIT', ids: ['SHP-001'] },
    };
    const res = await resolveExportPolicy('shipments', req, mockAuthContextAdmin);
    assert(
      !res.success && res.errorCode === 'INVALID_FILE_TYPE',
      '12. Unsupported formats return INVALID_FILE_TYPE error'
    );
  }

  // 13. Export field output equals (requestedFields ∩ resourceAllowedFields ∩ permissionAllowedFields)
  {
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'csv',
      selectedFields: ['trackingNumber', 'originCity', 'non_existent_field'],
      selection: { mode: 'EXPLICIT', ids: ['SHP-001'] },
    };
    const res = await resolveExportPolicy('shipments', req, mockAuthContextAdmin);
    assert(
      res.success &&
        res.policy?.allowedFieldKeys.includes('trackingNumber') &&
        res.policy?.allowedFieldKeys.includes('originCity') &&
        !res.policy?.allowedFieldKeys.includes('non_existent_field'),
      '13. Export field output equals (requestedFields ∩ resourceAllowedFields ∩ permissionAllowedFields)'
    );
  }

  // 14. Sensitive fields excluded when user lacks sensitive permission
  {
    const req: EnterpriseExportRequest = {
      resource: 'customers',
      format: 'csv',
      selectedFields: ['companyName', 'creditLimitSar'],
      selection: { mode: 'EXPLICIT', ids: ['CUST-001'] },
    };
    // Staff user has customers.export but NOT customers.financial_view
    const res = await resolveExportPolicy('customers', req, mockAuthContextStaff);
    assert(
      res.success &&
        res.policy?.allowedFieldKeys.includes('companyName') &&
        !res.policy?.allowedFieldKeys.includes('creditLimitSar') &&
        res.policy?.sensitiveFieldsExcluded.includes('creditLimitSar'),
      '14. Sensitive fields are excluded when the user lacks sensitive field permissions'
    );
  }

  // 15. Sensitive fields included when user possesses explicit sensitive permission
  {
    const req: EnterpriseExportRequest = {
      resource: 'customers',
      format: 'csv',
      selectedFields: ['companyName', 'creditLimitSar'],
      selection: { mode: 'EXPLICIT', ids: ['CUST-001'] },
    };
    // Admin user has all permissions
    const res = await resolveExportPolicy('customers', req, mockAuthContextAdmin);
    assert(
      res.success && res.policy?.allowedFieldKeys.includes('creditLimitSar'),
      '15. Sensitive fields are included when the user possesses explicit sensitive field permissions'
    );
  }

  // 16. Requesting no fields falls back to resource default export fields
  {
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'csv',
      selection: { mode: 'EXPLICIT', ids: ['SHP-001'] },
    };
    const res = await resolveExportPolicy('shipments', req, mockAuthContextAdmin);
    assert(
      res.success && res.policy?.allowedFieldKeys.length! > 0 && res.policy?.allowedFieldKeys.includes('trackingNumber'),
      '16. Requesting no fields falls back to resource default export fields'
    );
  }

  // 17. Requesting only unauthorized fields returns INVALID_EXPORT_FIELDS error
  {
    const req: EnterpriseExportRequest = {
      resource: 'customers',
      format: 'csv',
      selectedFields: ['creditLimitSar'], // Staff lacks financial_view
      selection: { mode: 'EXPLICIT', ids: ['CUST-001'] },
    };
    const res = await resolveExportPolicy('customers', req, mockAuthContextStaff);
    assert(
      !res.success && res.errorCode === 'INVALID_EXPORT_FIELDS',
      '17. Requesting only unauthorized fields returns INVALID_EXPORT_FIELDS error'
    );
  }

  // 18. Query with invalid filters fails validation via validateServerQuery
  {
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'csv',
      selection: {
        mode: 'QUERY',
        resource: 'shipments',
        query: {
          search: 'Test',
          filters: { malicious_sql_injection: 'DROP TABLE;' },
          sort: { field: 'createdAt', direction: 'desc' },
          pagination: { page: 1, pageSize: 25 },
        },
        excludedIds: [],
      },
    };
    const res = await resolveExportPolicy('shipments', req, mockAuthContextAdmin);
    assert(
      !res.success && res.errorCode === 'INVALID_QUERY',
      '18. Query with invalid filters or invalid sort fields fails validation via validateServerQuery'
    );
  }

  // 19. Tenant scope (companyId, branchId) from auth context is authoritatively enforced
  {
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'csv',
      selection: {
        mode: 'QUERY',
        resource: 'shipments',
        query: {
          search: '',
          filters: { companyId: 'CLIENT_ATTEMPTED_OVERRIDE_COMP' },
          sort: { field: 'createdAt', direction: 'desc' },
          pagination: { page: 1, pageSize: 25 },
        },
        excludedIds: [],
      },
    };
    const res = await resolveExportPolicy('shipments', req, mockAuthContextAdmin);
    assert(
      res.success && res.policy?.validatedQuery?.filters?.companyId === 'COMP-AJA-01',
      '19. Tenant scope (companyId, branchId) from authentication context is authoritatively enforced'
    );
  }

  // 20. Export dataset size exceeding limit returns EXPORT_LIMIT_EXCEEDED
  {
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'csv',
      selection: {
        mode: 'EXPLICIT',
        ids: Array.from({ length: 10001 }, (_, i) => `SHP-${i}`),
      },
    };
    const res = await resolveExportPolicy('shipments', req, mockAuthContextAdmin);
    assert(
      !res.success && res.errorCode === 'EXPORT_LIMIT_EXCEEDED',
      '20. Export dataset size exceeding global limit (10,000) returns EXPORT_LIMIT_EXCEEDED error'
    );
  }

  // 21. Audit metadata contains all required alignment fields
  {
    const req: EnterpriseExportRequest = {
      resource: 'shipments',
      format: 'csv',
      selection: { mode: 'EXPLICIT', ids: ['SHP-001'] },
    };
    const res = await resolveExportPolicy('shipments', req, mockAuthContextAdmin);
    const meta = res.policy?.auditMetadata;
    assert(
      res.success &&
        meta?.resource === 'shipments' &&
        meta.format === 'csv' &&
        meta.selectionMode === 'EXPLICIT' &&
        meta.requestedByUserId === 'usr_admin' &&
        meta.effectiveLimit === 10000,
      '21. Audit metadata contains all required alignment fields'
    );
  }

  console.log(`\nVerification Complete: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
