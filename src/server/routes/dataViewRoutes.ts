/**
 * AJA INTERNATIONAL LOGISTICS — Express API Routes for Data Views
 * Phase: Enterprise UI System
 * Module: Data Views, Saved Views & Personalization (STEP 05.16)
 * Version: 1.0
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { DataViewService } from '../../services/dataViewService';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/data-views?resource=shipments
 * Fetch all available data views (system, user, shared) for a resource
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const resource = (req.query.resource as string) || 'shipments';
    const userId = req.user!.userId;

    const views = await DataViewService.listViews(resource, userId);
    return res.json({ success: true, data: views, meta: { resource, count: views.length } });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATA_VIEW_LIST_ERROR',
        message: err.message || 'Failed to list Data Views.',
      },
    });
  }
});

/**
 * GET /api/data-views/:id
 * Get a specific Data View by ID
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resource = req.query.resource as string;

    const view = await DataViewService.getViewById(id, resource);
    if (!view) {
      return res.status(404).json({
        success: false,
        error: { code: 'DATA_VIEW_NOT_FOUND', message: 'Data View not found.' },
      });
    }
    return res.json({ success: true, data: view });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATA_VIEW_FETCH_ERROR',
        message: err.message || 'Failed to fetch Data View.',
      },
    });
  }
});

/**
 * POST /api/data-views
 * Create a new Data View
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userName = req.user!.fullName || req.user!.email;

    const newView = await DataViewService.createView(req.body, userId, userName);
    return res.status(201).json({ success: true, data: newView });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATA_VIEW_CREATE_ERROR',
        message: err.message || 'Failed to create Data View.',
      },
    });
  }
});

/**
 * PATCH /api/data-views/:id
 * Update an existing Data View
 */
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userName = req.user!.fullName || req.user!.email;

    const updatedView = await DataViewService.updateView(id, req.body, userId, userName);
    return res.json({ success: true, data: updatedView });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATA_VIEW_UPDATE_ERROR',
        message: err.message || 'Failed to update Data View.',
      },
    });
  }
});

/**
 * DELETE /api/data-views/:id
 * Delete a Data View
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resource = req.query.resource as string;
    const userId = req.user!.userId;

    await DataViewService.deleteView(id, userId, resource);
    return res.json({ success: true, data: { deleted: true, id } });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATA_VIEW_DELETE_ERROR',
        message: err.message || 'Failed to delete Data View.',
      },
    });
  }
});

/**
 * POST /api/data-views/:id/duplicate
 * Duplicate a Data View (Save As)
 */
router.post('/:id/duplicate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nameEn, nameAr } = req.body;
    const userId = req.user!.userId;
    const userName = req.user!.fullName || req.user!.email;

    const duplicated = await DataViewService.duplicateView(
      id,
      nameEn || 'Copy View',
      nameAr || 'نسخة من العرض',
      userId,
      userName
    );
    return res.status(201).json({ success: true, data: duplicated });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATA_VIEW_DUPLICATE_ERROR',
        message: err.message || 'Failed to duplicate Data View.',
      },
    });
  }
});

/**
 * POST /api/data-views/:id/default
 * Set or clear default status for a view
 */
router.post('/:id/default', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { resource } = req.body;
    const userId = req.user!.userId;

    await DataViewService.setDefaultView(id, userId, resource || 'shipments');
    return res.json({ success: true, data: { defaultSet: true, id } });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATA_VIEW_DEFAULT_ERROR',
        message: err.message || 'Failed to set default Data View.',
      },
    });
  }
});

export default router;
