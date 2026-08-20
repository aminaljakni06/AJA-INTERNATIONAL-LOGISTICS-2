import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { 
  createDocument, 
  getDocumentById, 
  getDocumentsByOwner, 
  deleteDocument 
} from '../../db/repositories/documentRepository';
import { getShipmentById } from '../../db/repositories/shipmentRepository';
import { getQuoteById } from '../../db/repositories/quoteRequestRepository';
import { createAuditLog } from '../../db/repositories/auditLogRepository';
import { NotificationService } from '../../services/notificationService';

const router = Router();

const ALLOWED_CATEGORIES = [
  'COMMERCIAL_INVOICE',
  'PACKING_LIST',
  'IDENTITY_OR_COMPANY',
  'ADDITIONAL',
];

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper to check user ownership of shipment or quote
async function verifyOwnerAccess(user: { userId: string; role: string }, ownerType: string, ownerId: string): Promise<boolean> {
  if (user.role === 'ADMIN' || user.role === 'STAFF') {
    return true;
  }

  if (ownerType === 'CUSTOMER') {
    return ownerId === user.userId;
  }

  if (ownerType === 'SHIPMENT') {
    const shipment = await getShipmentById(ownerId);
    return !!(shipment && shipment.customerId === user.userId);
  }

  if (ownerType === 'QUOTE') {
    const quote = await getQuoteById(ownerId);
    return !!(quote && quote.customerId === user.userId);
  }

  return false;
}

// POST /api/documents/upload - Upload document securely
router.post('/upload', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { ownerType, ownerId, category, fileName, fileType, fileSize, fileData } = req.body;

    if (!ownerType || !ownerId || !fileName || !fileType || !fileData) {
      res.status(400).json({ error: 'جميع الحقول الأساسية لرفع المستند مطلوبة' });
      return;
    }

    // Category validation
    const validCategory = ALLOWED_CATEGORIES.includes(category) ? category : 'ADDITIONAL';

    // File type validation
    const normalizedFileType = String(fileType).toLowerCase();
    const isAllowedType = ALLOWED_FILE_TYPES.some((t) => normalizedFileType.includes(t) || fileName.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.png') || fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg') || fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc'));

    if (!isAllowedType) {
      res.status(400).json({ error: 'نوع الملف غير مدعوم. يرجى رفع ملفات PDF، صور (PNG, JPG, WEBP)، أو مستندات Word' });
      return;
    }

    // File size validation
    const sizeInBytes = Number(fileSize) || 0;
    if (sizeInBytes > MAX_FILE_SIZE) {
      res.status(400).json({ error: 'حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميجابايت)' });
      return;
    }

    // Authorization check
    const hasAccess = await verifyOwnerAccess(user, ownerType, ownerId);
    if (!hasAccess) {
      res.status(403).json({ error: 'غير مصرح لك برفع مستندات لهذه الشحنة أو الحساب' });
      return;
    }

    // Save document
    const docRecord = await createDocument({
      ownerType: String(ownerType),
      ownerId: String(ownerId),
      category: validCategory,
      fileName: String(fileName).trim(),
      fileType: String(fileType),
      fileSize: sizeInBytes,
      storagePath: `/uploads/${ownerType.toLowerCase()}_${ownerId}_${Date.now()}_${fileName}`,
      fileData: String(fileData),
      uploadedBy: user.userId,
      uploadedByRole: user.role,
    });

    // Create Audit Log
    await createAuditLog({
      actorUserId: user.userId,
      action: 'UPLOAD_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: docRecord.id,
      after: { ownerType, ownerId, fileName, category: validCategory, sizeInBytes },
    });

    // Trigger Document Upload Notification via NotificationService
    try {
      let targetCustId: string | undefined;
      let trackingNum: string | undefined;

      if (ownerType === 'SHIPMENT') {
        const shipment = await getShipmentById(ownerId);
        if (shipment) {
          targetCustId = shipment.customerId;
          trackingNum = shipment.trackingNumber;
        }
      } else if (ownerType === 'QUOTE') {
        const quote = await getQuoteById(ownerId);
        if (quote && quote.customerId !== 'GUEST_USER') {
          targetCustId = quote.customerId;
        }
      } else if (ownerType === 'CUSTOMER') {
        targetCustId = ownerId;
      }

      await NotificationService.notifyDocumentUploaded({
        id: docRecord.id,
        fileName: String(fileName).trim(),
        ownerType: String(ownerType),
        ownerId: String(ownerId),
        uploadedBy: user.userId,
        uploadedByRole: user.role,
        targetCustomerId: targetCustId,
        trackingNumber: trackingNum,
      });
    } catch (notifErr) {
      console.error('Failed document notification:', notifErr);
    }

    // Return sanitized document metadata (exclude heavy fileData string in standard list response)
    const { fileData: _data, ...sanitized } = docRecord;
    res.status(201).json(sanitized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error uploading document';
    res.status(500).json({ error: msg });
  }
});

// GET /api/documents/owner/:ownerType/:ownerId - List documents for an owner
router.get('/owner/:ownerType/:ownerId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { ownerType, ownerId } = req.params;

    const hasAccess = await verifyOwnerAccess(user, ownerType, ownerId);
    if (!hasAccess) {
      res.status(403).json({ error: 'غير مصرح لمشاهدة مستندات هذا الكيان' });
      return;
    }

    const docs = await getDocumentsByOwner(ownerType, ownerId);

    // Sanitize: remove heavy fileData from list view for performance
    const sanitizedList = docs.map(({ fileData, ...rest }) => rest);

    res.json(sanitizedList);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error listing documents';
    res.status(500).json({ error: msg });
  }
});

// GET /api/documents/:id - Get metadata of a single document
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const docRecord = await getDocumentById(id);
    if (!docRecord) {
      res.status(404).json({ error: 'المستند غير موجود' });
      return;
    }

    const hasAccess = await verifyOwnerAccess(user, docRecord.ownerType, docRecord.ownerId);
    if (!hasAccess) {
      res.status(403).json({ error: 'غير مصرح لمشاهدة هذا المستند' });
      return;
    }

    const { fileData, ...sanitized } = docRecord;
    res.json(sanitized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching document';
    res.status(500).json({ error: msg });
  }
});

// GET /api/documents/:id/download - Download document content
router.get('/:id/download', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const docRecord = await getDocumentById(id);
    if (!docRecord) {
      res.status(404).json({ error: 'المستند غير موجود' });
      return;
    }

    const hasAccess = await verifyOwnerAccess(user, docRecord.ownerType, docRecord.ownerId);
    if (!hasAccess) {
      res.status(403).json({ error: 'غير مصرح لتحميل هذا المستند' });
      return;
    }

    // Audit log download
    await createAuditLog({
      actorUserId: user.userId,
      action: 'DOWNLOAD_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: docRecord.id,
      after: { fileName: docRecord.fileName },
    });

    // If client requests raw JSON payload containing base64 data
    if (req.query.format === 'json') {
      res.json({
        id: docRecord.id,
        fileName: docRecord.fileName,
        fileType: docRecord.fileType,
        fileData: docRecord.fileData || '',
      });
      return;
    }

    // Serve binary stream from base64 string
    if (docRecord.fileData && docRecord.fileData.includes('base64,')) {
      const base64Part = docRecord.fileData.split('base64,')[1];
      const buffer = Buffer.from(base64Part, 'base64');

      res.setHeader('Content-Type', docRecord.fileType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(docRecord.fileName)}"`);
      res.send(buffer);
      return;
    }

    res.status(400).json({ error: 'محتوى المستند غير متاح للتحميل المباشر' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error downloading document';
    res.status(500).json({ error: msg });
  }
});

// DELETE /api/documents/:id - Delete document (Staff/Admin or Uploader)
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const docRecord = await getDocumentById(id);
    if (!docRecord) {
      res.status(404).json({ error: 'المستند غير موجود' });
      return;
    }

    const isStaffOrAdmin = user.role === 'ADMIN' || user.role === 'STAFF';
    const isUploader = docRecord.uploadedBy === user.userId;

    if (!isStaffOrAdmin && !isUploader) {
      res.status(403).json({ error: 'يتطلب حذف المستندات صلاحيات إدارية أو أن تكون صاحب الملف' });
      return;
    }

    await deleteDocument(id);

    await createAuditLog({
      actorUserId: user.userId,
      action: 'DELETE_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: id,
      before: { fileName: docRecord.fileName, ownerType: docRecord.ownerType, ownerId: docRecord.ownerId },
    });

    res.json({ message: 'تم حذف المستند بنجاح', id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting document';
    res.status(500).json({ error: msg });
  }
});

export default router;
