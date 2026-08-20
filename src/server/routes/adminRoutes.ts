import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { listUsers, getUserById, updateUser } from '../../db/repositories/userRepository';
import { listAllQuotes, getQuoteById, updateQuoteRequest } from '../../db/repositories/quoteRequestRepository';
import { listAllShipments, createShipment } from '../../db/repositories/shipmentRepository';
import { addShipmentEvent } from '../../db/repositories/shipmentEventRepository';
import { createNotification } from '../../db/repositories/notificationRepository';
import { NotificationService } from '../../services/notificationService';
import { getAllCMSContent, upsertCMSContent } from '../../db/repositories/cmsContentRepository';
import { getCompanyById, updateCompany } from '../../db/repositories/companyRepository';
import { getAllFAQs, upsertFAQ, deleteFAQ } from '../../db/repositories/faqRepository';
import { getAllServices, upsertService, deleteService } from '../../db/repositories/serviceRepository';
import { getAllMessages, createMessage, deleteMessage, markMessagesAsRead } from '../../db/repositories/messageRepository';
import { createAuditLog } from '../../db/repositories/auditLogRepository';

const router = Router();

// All routes here require STAFF or ADMIN role
router.use(requireAuth, requireRoles('STAFF', 'ADMIN'));

// ==========================================
// CUSTOMER MANAGEMENT
// ==========================================

// GET /api/admin/customers - List customers with metrics
router.get('/customers', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await listUsers('CUSTOMER');
    const quotes = await listAllQuotes();
    const shipments = await listAllShipments();

    const result = users.map((u) => {
      const userQuotes = quotes.filter((q) => q.customerId === u.id);
      const userShipments = shipments.filter((s) => s.customerId === u.id);
      return {
        ...u,
        quotesCount: userQuotes.length,
        shipmentsCount: userShipments.length,
      };
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching customers';
    res.status(500).json({ error: msg });
  }
});

// GET /api/admin/customers/:id - Single customer full details
router.get('/customers/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    const quotes = await listAllQuotes();
    const shipments = await listAllShipments();

    const customerQuotes = quotes.filter((q) => q.customerId === id);
    const customerShipments = shipments.filter((s) => s.customerId === id);

    res.json({
      customer: user,
      quotes: customerQuotes,
      shipments: customerShipments,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching customer profile';
    res.status(500).json({ error: msg });
  }
});

// PATCH /api/admin/customers/:id - Update customer data / activate / deactivate
router.patch('/customers/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { displayName, email, phone, companyName, status, role } = req.body;
    const actor = req.user!;

    const existing = await getUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    const updates: Record<string, any> = {};
    if (displayName) updates.displayName = String(displayName).trim();
    if (email) updates.email = String(email).trim();
    if (phone) updates.phone = String(phone).trim();
    if (companyName !== undefined) updates.companyName = String(companyName).trim();
    if (status) updates.status = String(status);
    if (role && actor.role === 'ADMIN') updates.role = String(role);

    const updatedUser = await updateUser(id, updates);

    await createAuditLog({
      actorUserId: actor.userId,
      action: 'UPDATE_CUSTOMER_PROFILE',
      entityType: 'USER',
      entityId: id,
      before: existing as unknown as Record<string, unknown>,
      after: updatedUser as unknown as Record<string, unknown>,
    });

    res.json(updatedUser);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating customer';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// CONVERT QUOTE TO SHIPMENT
// ==========================================

// POST /api/admin/quotes/:id/convert - Convert agreed quote request into shipment safely and idempotently
router.post('/quotes/:id/convert', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actor = req.user!;

    const quote = await getQuoteById(id);
    if (!quote) {
      res.status(404).json({ error: 'طلب عرض السعر غير موجود' });
      return;
    }

    // Check duplicate conversion: check if shipment already exists with quoteRequestId == quote.id
    const existingShipments = await listAllShipments();
    const existing = existingShipments.find((s) => s.quoteRequestId === quote.id);
    if (existing) {
      res.status(400).json({
        error: `تم تحويل طلب عرض السعر هذا مسبقاً إلى شحنة رسمية (رقم التتبع: ${existing.trackingNumber})`,
        shipment: existing,
      });
      return;
    }

    const randNum = Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = `AJA-${randNum}-KSA`;

    const shippingDate = quote.expectedShippingDate || new Date().toISOString().split('T')[0];
    const estimatedArrivalDate =
      req.body?.estimatedArrivalDate ||
      quote.expectedShippingDate ||
      new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    const customerVisibleNotes =
      req.body?.customerVisibleNotes ||
      `تم تحويل طلب السعر رقم (${quote.requestNumber || quote.id}) إلى شحنة رسمية بنجاح وصدور رقم بوليصة التتبع.`;

    const internalNotes = req.body?.internalNotes || `تحويل من طلب السعر رقم ${quote.requestNumber || quote.id}`;

    const newShipment = await createShipment({
      trackingNumber,
      customerId: quote.customerId,
      quoteRequestId: quote.id,
      shipmentType: quote.shipmentType || 'SEA',
      pickupLocation: quote.pickupLocation,
      deliveryLocation: quote.deliveryLocation,
      shippingDate,
      estimatedArrivalDate,
      currentStatus: 'RECEIVED',
      customerVisibleNotes,
      internalNotes,
    });

    // Create first shipment tracking event
    await addShipmentEvent({
      shipmentId: newShipment.id,
      status: 'RECEIVED',
      location: newShipment.pickupLocation,
      description: 'تم إصدار بوليصة الشحنة وتأكيد حجز المسار في النظام اللوجستي',
      visibleToCustomer: true,
      createdBy: actor.userId,
    });

    // Update quote request status and link converted shipment
    await updateQuoteRequest(quote.id, {
      status: 'AGREED',
      internalNotes: `${quote.internalNotes || ''}\n[تم التحويل لشحنة رقم ${trackingNumber}]`.trim(),
    });

    // Notify Customer using NotificationService
    if (quote.customerId && quote.customerId !== 'GUEST_USER') {
      try {
        await NotificationService.notifyShipmentCreated({
          id: newShipment.id,
          trackingNumber,
          customerId: quote.customerId,
        });
      } catch (notifErr) {
        console.error('Failed notification on conversion:', notifErr);
      }
    }

    // Audit Log
    await createAuditLog({
      actorUserId: actor.userId,
      action: 'CONVERT_QUOTE_TO_SHIPMENT',
      entityType: 'SHIPMENT',
      entityId: newShipment.id,
      before: { quoteId: quote.id, quoteStatus: quote.status },
      after: { quoteId: quote.id, trackingNumber, shipmentId: newShipment.id },
    });

    res.status(201).json({
      success: true,
      shipment: newShipment,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error converting quote to shipment';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// NOTIFICATIONS
// ==========================================

// POST /api/admin/notifications - Send notification
router.post('/notifications', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientUserId, title, body, type, relatedEntityId } = req.body;
    const actor = req.user!;

    if (!title || !body) {
      res.status(400).json({ error: 'العنوان ومحتوى الإشعار مطلوبة' });
      return;
    }

    if (recipientUserId === 'ALL') {
      const users = await listUsers('CUSTOMER');
      const sentList = [];
      for (const u of users) {
        const notif = await createNotification({
          recipientUserId: u.id,
          title: String(title),
          body: String(body),
          type: type || 'GENERAL',
          relatedEntityId: relatedEntityId ? String(relatedEntityId) : undefined,
        });
        sentList.push(notif);
      }
      res.json({ success: true, count: sentList.length });
      return;
    }

    if (!recipientUserId) {
      res.status(400).json({ error: 'مستلم الإشعار مطلوب' });
      return;
    }

    const notif = await createNotification({
      recipientUserId: String(recipientUserId),
      title: String(title),
      body: String(body),
      type: type || 'GENERAL',
      relatedEntityId: relatedEntityId ? String(relatedEntityId) : undefined,
    });

    await createAuditLog({
      actorUserId: actor.userId,
      action: 'SEND_NOTIFICATION',
      entityType: 'NOTIFICATION',
      entityId: notif.id,
      after: { recipientUserId, title },
    });

    res.status(201).json(notif);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error sending notification';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// CMS & FAQS
// ==========================================

// GET /api/admin/cms - Get all CMS content
router.get('/cms', async (_req, res: Response) => {
  try {
    const cmsItems = await getAllCMSContent();
    const company = await getCompanyById('cmp_aja_1');
    res.json({ cmsItems, company });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching CMS data';
    res.status(500).json({ error: msg });
  }
});

// POST /api/admin/cms - Update CMS content
router.post('/cms', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key, titleAr, titleEn, bodyAr, bodyEn, metadata, companyData } = req.body;
    const actor = req.user!;

    if (companyData) {
      const updatedComp = await updateCompany('cmp_aja_1', companyData);
      res.json({ success: true, company: updatedComp });
      return;
    }

    if (!key) {
      res.status(400).json({ error: 'مفتاح CMS (key) مطلوب' });
      return;
    }

    const updatedCms = await upsertCMSContent(String(key), {
      titleAr: titleAr || '',
      titleEn: titleEn || '',
      contentAr: bodyAr || '',
      contentEn: bodyEn || '',
      bodyAr: bodyAr || '',
      bodyEn: bodyEn || '',
    } as any);

    await createAuditLog({
      actorUserId: actor.userId,
      action: 'UPDATE_CMS',
      entityType: 'CMS',
      entityId: updatedCms.id,
      after: { key, titleAr },
    });

    res.json(updatedCms);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating CMS';
    res.status(500).json({ error: msg });
  }
});

// GET /api/admin/faqs - Get FAQs
router.get('/faqs', async (_req, res: Response) => {
  try {
    const faqs = await getAllFAQs();
    res.json(faqs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching FAQs';
    res.status(500).json({ error: msg });
  }
});

// POST /api/admin/faqs - Create / Update FAQ
router.post('/faqs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, category, questionAr, questionEn, answerAr, answerEn, order } = req.body;
    const actor = req.user!;

    const faq = await upsertFAQ({
      id,
      category: category || 'GENERAL',
      questionAr: String(questionAr),
      questionEn: String(questionEn),
      answerAr: String(answerAr),
      answerEn: String(answerEn),
      order: Number(order || 0),
    } as any);

    await createAuditLog({
      actorUserId: actor.userId,
      action: 'UPSERT_FAQ',
      entityType: 'FAQ',
      entityId: faq.id,
      after: { category, questionAr },
    });

    res.json(faq);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error upserting FAQ';
    res.status(500).json({ error: msg });
  }
});

// DELETE /api/admin/faqs/:id - Delete FAQ
router.delete('/faqs/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await deleteFAQ(id);
    res.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting FAQ';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// SERVICES CATALOG
// ==========================================

// GET /api/admin/services - List editable services catalog
router.get('/services', async (_req, res: Response) => {
  try {
    const services = await getAllServices();
    res.json(services);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching services';
    res.status(500).json({ error: msg });
  }
});

// POST /api/admin/services - Create or update a service
router.post('/services', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.user!;
    const service = await upsertService(req.body as any);

    await createAuditLog({
      actorUserId: actor.userId,
      action: 'UPSERT_SERVICE',
      entityType: 'SERVICE',
      entityId: service.id,
      after: service as unknown as Record<string, unknown>,
    });

    res.json(service);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error saving service';
    res.status(500).json({ error: msg });
  }
});

// DELETE /api/admin/services/:id - Delete a service
router.delete('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await deleteService(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting service';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// SUPPORT MESSAGES
// ==========================================

// GET /api/admin/messages - List all messages
router.get('/messages', async (_req, res: Response) => {
  try {
    const messages = await getAllMessages();
    const users = await listUsers();

    const userMap = new Map(users.map((u) => [u.id, u]));

    const enriched = messages.map((m) => ({
      ...m,
      customer: userMap.get(m.customerId) || null,
      sender: userMap.get(m.senderId) || null,
    }));

    res.json(enriched);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching messages';
    res.status(500).json({ error: msg });
  }
});

// POST /api/admin/messages/:id/reply - Reply to customer message
router.post('/messages/:id/reply', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { replyMessage, customerId } = req.body;
    const actor = req.user!;

    if (!replyMessage || !customerId) {
      res.status(400).json({ error: 'الرد ومعرف العميل مطلوبة' });
      return;
    }

    const reply = await createMessage({
      customerId: String(customerId),
      senderId: actor.userId,
      message: String(replyMessage).trim(),
    });

    await markMessagesAsRead([id]);

    try {
      await NotificationService.notifySupportReply({
        id: reply.id,
        customerId: String(customerId),
        senderId: actor.userId,
        senderRole: actor.role,
        message: reply.message,
      });
    } catch (notifErr) {
      console.error('Failed notification on admin reply:', notifErr);
    }

    res.status(201).json(reply);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error replying to message';
    res.status(500).json({ error: msg });
  }
});

// DELETE /api/admin/messages/:id - Delete message
router.delete('/messages/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await deleteMessage(id);
    res.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting message';
    res.status(500).json({ error: msg });
  }
});

export default router;
