import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest, verifyToken } from '../auth';
import { 
  createQuoteRequest, 
  getQuoteById, 
  updateQuoteRequest, 
  listQuotesForCustomer, 
  listAllQuotes 
} from '../../db/repositories/quoteRequestRepository';
import { createAuditLog } from '../../db/repositories/auditLogRepository';
import { NotificationService } from '../../services/notificationService';

const router = Router();

// POST /api/quotes - Create quote request (Public or Customer)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      companyName, 
      shipmentType, 
      serviceType,
      pickupLocation, 
      deliveryLocation, 
      cargoType, 
      approximateWeight, 
      packageOrContainerCount,
      expectedShippingDate,
      attachments,
      notes
    } = req.body;

    const finalShipmentType = shipmentType || serviceType || 'SEA';
    const finalPickup = pickupLocation || req.body.origin;
    const finalDelivery = deliveryLocation || req.body.destination;
    const finalCargo = cargoType || req.body.cargoDetails;

    if (!customerName || !customerEmail || !customerPhone || !finalPickup || !finalDelivery || !finalCargo) {
      res.status(400).json({ error: 'الرجاء تعبئة جميع الحقول الأساسية لطلب عرض السعر (الاسم، البريد، الجوال، نقطة التحميل، الوجهة، ونوع البضاعة)' });
      return;
    }

    let customerId = 'GUEST_USER';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const decoded = verifyToken(authHeader.split(' ')[1]);
      if (decoded) {
        customerId = decoded.userId;
      }
    }

    const newQuote = await createQuoteRequest({
      customerId,
      customerName: String(customerName),
      customerEmail: String(customerEmail),
      customerPhone: String(customerPhone),
      companyName: companyName ? String(companyName) : undefined,
      shipmentType: String(finalShipmentType),
      pickupLocation: String(finalPickup),
      deliveryLocation: String(finalDelivery),
      cargoType: String(finalCargo),
      approximateWeight: approximateWeight ? Number(approximateWeight) : null,
      packageOrContainerCount: packageOrContainerCount ? Number(packageOrContainerCount) : null,
      expectedShippingDate: expectedShippingDate ? String(expectedShippingDate) : null,
      attachments: Array.isArray(attachments) ? attachments : [],
      notes: notes ? String(notes) : undefined,
      status: 'NEW',
    } as any);

    // Audit log
    await createAuditLog({
      actorUserId: customerId,
      action: 'CREATE_QUOTE_REQUEST',
      entityType: 'QUOTE_REQUEST',
      entityId: newQuote.id,
      after: { 
        requestNumber: newQuote.requestNumber,
        shipmentType: newQuote.shipmentType, 
        pickupLocation: newQuote.pickupLocation, 
        deliveryLocation: newQuote.deliveryLocation 
      },
    });

    // Notify authorized staff, admins, and customer using NotificationService
    try {
      await NotificationService.notifyQuoteReceived({
        id: newQuote.id,
        requestNumber: newQuote.requestNumber,
        customerId,
        customerName: String(customerName),
        companyName: companyName ? String(companyName) : undefined,
      });
    } catch (notifErr) {
      console.error('Failed to notify staff/customer:', notifErr);
    }

    res.status(201).json(newQuote);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating quote request';
    res.status(500).json({ error: msg });
  }
});

// GET /api/quotes - List quotes
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role === 'CUSTOMER') {
      const customerQuotes = await listQuotesForCustomer(user.userId);
      res.json(customerQuotes);
      return;
    }

    const allQuotes = await listAllQuotes();
    res.json(allQuotes);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error listing quotes';
    res.status(500).json({ error: msg });
  }
});

// GET /api/quotes/:id - Get single quote
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const quote = await getQuoteById(id);
    if (!quote) {
      res.status(404).json({ error: 'طلب عرض السعر غير موجود' });
      return;
    }

    if (user.role === 'CUSTOMER' && quote.customerId !== user.userId) {
      res.status(403).json({ error: 'غير مصرح لمشاهدة هذا الطلب' });
      return;
    }

    res.json(quote);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching quote';
    res.status(500).json({ error: msg });
  }
});

// PATCH /api/quotes/:id/status - Update quote status & offered price (Staff/Admin only)
router.patch('/:id/status', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, offeredPrice, currency, validUntil, terms, internalNotes } = req.body;
    const user = req.user!;

    const existing = await getQuoteById(id);
    if (!existing) {
      res.status(404).json({ error: 'طلب عرض السعر غير موجود' });
      return;
    }

    const updates: Parameters<typeof updateQuoteRequest>[1] = {};
    if (status) updates.status = String(status);
    if (internalNotes !== undefined) updates.internalNotes = String(internalNotes);
    if (offeredPrice !== undefined || terms !== undefined || validUntil !== undefined) {
      updates.quoteResponse = {
        offeredPrice: offeredPrice !== null ? Number(offeredPrice) : null,
        currency: currency || 'SAR',
        validUntil: validUntil || undefined,
        terms: terms || undefined,
        respondedByUserId: user.userId,
        respondedAt: new Date().toISOString(),
      };
    }

    const updatedQuote = await updateQuoteRequest(id, updates);

    await createAuditLog({
      actorUserId: user.userId,
      action: 'UPDATE_QUOTE_STATUS',
      entityType: 'QUOTE_REQUEST',
      entityId: updatedQuote.id,
      before: { status: existing.status },
      after: { status: updatedQuote.status, quoteResponse: updatedQuote.quoteResponse },
    });

    // Notify customer using NotificationService
    if (updatedQuote.customerId && updatedQuote.customerId !== 'GUEST_USER') {
      try {
        if (offeredPrice !== undefined && offeredPrice !== null) {
          await NotificationService.notifyQuoteResponseCreated({
            id: updatedQuote.id,
            requestNumber: updatedQuote.requestNumber,
            customerId: updatedQuote.customerId,
            offeredPrice: Number(offeredPrice),
            currency: currency || 'SAR',
          });
        }
        
        if (status && status !== existing.status) {
          await NotificationService.notifyQuoteStatusChanged({
            id: updatedQuote.id,
            requestNumber: updatedQuote.requestNumber,
            customerId: updatedQuote.customerId,
            status: String(status),
          });
        }
      } catch (notifErr) {
        console.error('Failed to notify customer:', notifErr);
      }
    }

    res.json(updatedQuote);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating quote';
    res.status(500).json({ error: msg });
  }
});

// POST /api/quotes/:id/accept - Customer accepts quote offer
router.post('/:id/accept', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const quote = await getQuoteById(id);
    if (!quote) {
      res.status(404).json({ error: 'طلب عرض السعر غير موجود' });
      return;
    }

    if (user.role === 'CUSTOMER' && quote.customerId !== user.userId) {
      res.status(403).json({ error: 'غير مصرح للقيام بهذا الإجراء' });
      return;
    }

    const price = quote.quoteResponse?.offeredPrice || (quote as any).offeredPrice;
    if (!price) {
      res.status(400).json({ error: 'لم يتم تقديم عرض سعر لهذا الطلب حتى الآن' });
      return;
    }

    const updatedQuote = await updateQuoteRequest(id, {
      status: 'AGREED',
      internalNotes: `${quote.internalNotes || ''}\n[تمت موافقة العميل على العرض بتاريخ ${new Date().toLocaleDateString('ar-SA')}]`.trim(),
    });

    await createAuditLog({
      actorUserId: user.userId,
      action: 'CUSTOMER_ACCEPT_QUOTE',
      entityType: 'QUOTE_REQUEST',
      entityId: updatedQuote.id,
      before: { status: quote.status },
      after: { status: updatedQuote.status },
    });

    // Notify staff/admin that customer agreed
    try {
      await NotificationService.notifyQuoteStatusChanged({
        id: updatedQuote.id,
        requestNumber: updatedQuote.requestNumber,
        customerId: updatedQuote.customerId,
        status: 'AGREED',
      });
    } catch (notifErr) {
      console.error('Failed to notify staff:', notifErr);
    }

    res.json(updatedQuote);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error accepting quote';
    res.status(500).json({ error: msg });
  }
});

// POST /api/quotes/:id/decline - Customer declines quote offer
router.post('/:id/decline', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { reason } = req.body;

    const quote = await getQuoteById(id);
    if (!quote) {
      res.status(404).json({ error: 'طلب عرض السعر غير موجود' });
      return;
    }

    if (user.role === 'CUSTOMER' && quote.customerId !== user.userId) {
      res.status(403).json({ error: 'غير مصرح للقيام بهذا الإجراء' });
      return;
    }

    const updatedQuote = await updateQuoteRequest(id, {
      status: 'REJECTED',
      internalNotes: `${quote.internalNotes || ''}\n[تم رفض العرض من العميل: ${reason || 'بدون سبب'}]`.trim(),
    });

    await createAuditLog({
      actorUserId: user.userId,
      action: 'CUSTOMER_DECLINE_QUOTE',
      entityType: 'QUOTE_REQUEST',
      entityId: updatedQuote.id,
      before: { status: quote.status },
      after: { status: updatedQuote.status },
    });

    res.json(updatedQuote);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error declining quote';
    res.status(500).json({ error: msg });
  }
});

export default router;

