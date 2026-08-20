/**
 * AJA INTERNATIONAL LOGISTICS — Express API Routes for Bulk Operations
 * Phase: Enterprise UI System
 * Module: Bulk Actions, Selection & Mass Operations (STEP 05.17)
 * Version: 1.0
 */

import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { BulkOperationService } from '../../services/bulkOperationService';
import { getBulkActionsForResource } from '../../lib/bulk/bulkActionRegistry';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/bulk-operations/actions?resource=shipments
 * List registered bulk actions available for a resource
 */
router.get('/actions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const resource = (req.query.resource as string) || 'shipments';
    const actions = getBulkActionsForResource(resource);
    return res.json({ success: true, data: actions });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'BULK_ACTIONS_FETCH_ERROR',
        message: err.message || 'Failed to list bulk actions.',
      },
    });
  }
});

/**
 * POST /api/bulk-operations
 * Execute a mass / bulk operation on selected items or query scope
 */
router.post('/', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userName = req.user!.fullName || req.user!.email;
    const tenantId = (req.headers['x-tenant-id'] as string) || (req.headers['x-company-id'] as string) || 'tenant_aja_default';

    const result = await BulkOperationService.executeBulkOperation(req.body, {
      userId,
      userName,
      tenantId,
      permissions: req.user?.role === 'ADMIN'
        ? ['shipment.bulk.update', 'shipment.bulk.archive', 'admin']
        : ['shipment.bulk.update', 'shipment.bulk.archive'],
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BULK_OPERATION_FAILED',
        message: err.message || 'Bulk operation execution failed.',
      },
    });
  }
});

export default router;
