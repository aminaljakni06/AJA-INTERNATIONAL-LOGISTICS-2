import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { getDocumentsByOwner } from '../../db/repositories/documentRepository';
import { getNotificationsForUser, markNotificationAsRead, markAllNotificationsAsReadForUser } from '../../db/repositories/notificationRepository';
import { createMessage, getMessagesByCustomer } from '../../db/repositories/messageRepository';
import { NotificationService } from '../../services/notificationService';

const router = Router();

// GET /api/customer/documents - List documents for current authenticated user
router.get('/documents', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    // Get documents owned by customer
    const userDocs = await getDocumentsByOwner('CUSTOMER', user.userId);
    res.json(userDocs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching documents';
    res.status(500).json({ error: msg });
  }
});

// GET /api/customer/notifications - List notifications for current user
router.get('/notifications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Check for approaching arrival notifications
    try {
      if (user.role === 'CUSTOMER') {
        await NotificationService.checkAndNotifyApproachingArrivals(user.userId);
      }
    } catch (e) {
      console.error('Approaching arrival check failed:', e);
    }

    const notifications = await getNotificationsForUser(user.userId);
    res.json(notifications);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching notifications';
    res.status(500).json({ error: msg });
  }
});

// PATCH /api/customer/notifications/read-all - Mark all notifications as read
router.patch('/notifications/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    await markAllNotificationsAsReadForUser(user.userId);
    res.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error marking all notifications read';
    res.status(500).json({ error: msg });
  }
});

// PATCH /api/customer/notifications/:id/read - Mark single notification as read
router.patch('/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await markNotificationAsRead(id);
    res.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error marking notification read';
    res.status(500).json({ error: msg });
  }
});

// GET /api/customer/messages - List support messages for customer
router.get('/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    // For CUSTOMER, always isolate to user.userId
    const customerId = user.role === 'CUSTOMER' ? user.userId : String(req.query.customerId || user.userId);
    const messages = await getMessagesByCustomer(customerId);
    res.json(messages);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching messages';
    res.status(500).json({ error: msg });
  }
});

// POST /api/customer/messages - Send a support message
router.post('/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { message, shipmentId, attachment, attachmentName, attachmentType, triggerAgentResponse, isLiveWidget } = req.body;

    if (!message || String(message).trim().length === 0) {
      res.status(400).json({ error: 'محتوى الرسالة مطلوب' });
      return;
    }

    // Always isolate customerId to authenticated user if role is CUSTOMER
    const customerId = user.role === 'CUSTOMER' ? user.userId : String(req.body.customerId || user.userId);

    const newMsg = await createMessage({
      customerId,
      shipmentId: shipmentId ? String(shipmentId) : null,
      senderId: user.userId,
      senderRole: user.role,
      message: String(message).trim(),
      attachment: attachment ? String(attachment) : null,
      attachmentName: attachmentName ? String(attachmentName) : undefined,
      attachmentType: attachmentType ? String(attachmentType) : undefined,
    });

    // Send notification for customer's message to staff/admin
    try {
      await NotificationService.notifySupportReply({
        id: newMsg.id,
        customerId,
        senderId: user.userId,
        senderRole: user.role,
        message: newMsg.message,
        shipmentId: shipmentId ? String(shipmentId) : undefined,
      });
    } catch (notifErr) {
      console.error('Failed to notify message:', notifErr);
    }

    // If request originated from live chat widget or requested agent auto-reply
    if (triggerAgentResponse || isLiveWidget) {
      setTimeout(async () => {
        try {
          const lowerMsg = String(message).toLowerCase();
          let agentReplyText = 'أهلاً بك! معك م. عمر الفارسي من فريق العمليات اللوجستية بشركة أجا. تم استلام رسالتك وبدأ المتابعة المباشرة.';
          
          if (lowerMsg.includes('تتبع') || lowerMsg.includes('أين') || lowerMsg.includes('موقع') || lowerMsg.includes('شحنة') || lowerMsg.includes('وين')) {
            agentReplyText = `أهلاً بك. تم التحقق الميداني من الشحنة ${shipmentId ? `#${shipmentId}` : ''}. الشحنة على مسار النقل المحدد وفي طريقها بنجاح وفق الجدول المعتمد.`;
          } else if (lowerMsg.includes('جمارك') || lowerMsg.includes('فسح') || lowerMsg.includes('تخليص') || lowerMsg.includes('بيان')) {
            agentReplyText = 'أهلاً بك! البيان الجمركي قيد الإجراءات النهائية مع هيئة الزكاة والضريبة والجمارك، وسيصلك إشعار تلقائي فور اكتمال الفسح.';
          } else if (lowerMsg.includes('عنوان') || lowerMsg.includes('تعديل') || lowerMsg.includes('موقع') || lowerMsg.includes('تسليم')) {
            agentReplyText = 'تم تسليم طلب تحديث موقع التسليم إلى مسئول التوجيه اللوجستي والمندوب الميداني. سنقوم بتحديث التتبع فور الانتهاء.';
          } else if (lowerMsg.includes('سعر') || lowerMsg.includes('فاتورة') || lowerMsg.includes('تقسيط') || lowerMsg.includes('دفع')) {
            agentReplyText = 'تم تحويل استفسارك المالي إلى قسم الحسابات لتدقيق الفاتورة وحساب أقساط Adyen المتاحة لحسابكم.';
          }

          const agentMsg = await createMessage({
            customerId,
            shipmentId: shipmentId ? String(shipmentId) : null,
            senderId: 'staff_agent_omar',
            senderRole: 'STAFF',
            message: agentReplyText,
          });

          await NotificationService.notifySupportReply({
            id: agentMsg.id,
            customerId,
            senderId: 'staff_agent_omar',
            senderRole: 'STAFF',
            message: agentMsg.message,
            shipmentId: shipmentId ? String(shipmentId) : undefined,
          });
        } catch (e) {
          console.error('Failed sending auto agent response:', e);
        }
      }, 1500);
    }

    res.status(201).json(newMsg);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error sending message';
    res.status(500).json({ error: msg });
  }
});

export default router;
