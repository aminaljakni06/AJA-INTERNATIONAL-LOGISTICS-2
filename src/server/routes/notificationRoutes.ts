/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notification API Routes
 * Phase: Enterprise UI System
 * Module: Enterprise Notifications API
 * Version: 1.0
 */

import { Router, Request, Response } from 'express';
import { buildSuccessResponse, buildErrorResponse } from '../utils/apiResponseBuilder';
import { EnterpriseErrorCode } from '../../types/apiResponse';
import { enterpriseNotificationService } from '../../services/notificationService';
import { NotificationCategory, NotificationSeverity } from '../../types/notificationFramework';

export const notificationRoutes = Router();

/**
 * GET /api/notifications
 * Query params: category, severity, isRead, searchQuery, page, limit
 */
notificationRoutes.get('/', (req: Request, res: Response) => {
  try {
    const { category, severity, isRead, searchQuery, page, limit } = req.query;

    const queryResult = enterpriseNotificationService.query({
      category: category as NotificationCategory,
      severity: severity as NotificationSeverity,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      searchQuery: searchQuery as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    });

    return res.json(buildSuccessResponse(queryResult));
  } catch (err: any) {
    return res.status(500).json(
      buildErrorResponse(EnterpriseErrorCode.INTERNAL_SERVER_ERROR, err.message || 'Failed to fetch notifications')
    );
  }
});

/**
 * GET /api/notifications/unread-count
 */
notificationRoutes.get('/unread-count', (_req: Request, res: Response) => {
  try {
    const unreadCount = enterpriseNotificationService.unreadCount;
    return res.json(buildSuccessResponse({ unreadCount }));
  } catch (err: any) {
    return res.status(500).json(
      buildErrorResponse(EnterpriseErrorCode.INTERNAL_SERVER_ERROR, err.message || 'Failed to calculate unread count')
    );
  }
});

/**
 * PATCH /api/notifications/:id/read
 */
notificationRoutes.patch('/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    enterpriseNotificationService.markAsRead(id);
    return res.json(buildSuccessResponse({ id, isRead: true, readAt: new Date().toISOString() }));
  } catch (err: any) {
    return res.status(500).json(
      buildErrorResponse(EnterpriseErrorCode.INTERNAL_SERVER_ERROR, err.message || 'Failed to mark notification as read')
    );
  }
});

/**
 * PATCH /api/notifications/:id/unread
 */
notificationRoutes.patch('/:id/unread', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    enterpriseNotificationService.markAsUnread(id);
    return res.json(buildSuccessResponse({ id, isRead: false }));
  } catch (err: any) {
    return res.status(500).json(
      buildErrorResponse(EnterpriseErrorCode.INTERNAL_SERVER_ERROR, err.message || 'Failed to mark notification as unread')
    );
  }
});

/**
 * PATCH /api/notifications/read-all
 */
notificationRoutes.patch('/read-all', (_req: Request, res: Response) => {
  try {
    enterpriseNotificationService.markAllAsRead();
    return res.json(buildSuccessResponse({ success: true, message: 'All notifications marked as read' }));
  } catch (err: any) {
    return res.status(500).json(
      buildErrorResponse(EnterpriseErrorCode.INTERNAL_SERVER_ERROR, err.message || 'Failed to mark all as read')
    );
  }
});

/**
 * POST /api/notifications
 * Dispatch/Create a new notification from server or admin actions
 */
notificationRoutes.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.titleEn || !body.messageEn) {
      return res.status(400).json(
        buildErrorResponse(EnterpriseErrorCode.VALIDATION_FAILED, 'titleEn and messageEn are required')
      );
    }

    const newNotif = enterpriseNotificationService.dispatch({
      category: body.category || 'SYSTEM',
      severity: body.severity || 'INFO',
      type: body.type || 'system.general',
      titleEn: body.titleEn,
      titleAr: body.titleAr || body.titleEn,
      messageEn: body.messageEn,
      messageAr: body.messageAr || body.messageEn,
      entityType: body.entityType,
      entityId: body.entityId,
      action: body.action,
      metadata: body.metadata,
      source: body.source || 'USER_ACTION',
    });

    return res.status(201).json(buildSuccessResponse(newNotif));
  } catch (err: any) {
    return res.status(500).json(
      buildErrorResponse(EnterpriseErrorCode.INTERNAL_SERVER_ERROR, err.message || 'Failed to create notification')
    );
  }
});

/**
 * DELETE /api/notifications/:id
 */
notificationRoutes.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    enterpriseNotificationService.deleteNotification(id);
    return res.json(buildSuccessResponse({ id, deleted: true }));
  } catch (err: any) {
    return res.status(500).json(
      buildErrorResponse(EnterpriseErrorCode.INTERNAL_SERVER_ERROR, err.message || 'Failed to delete notification')
    );
  }
});
