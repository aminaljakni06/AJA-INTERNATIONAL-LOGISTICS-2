import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { 
  getShipmentById, 
  getShipmentByTrackingNumber, 
  createShipment, 
  listShipmentsForCustomer, 
  listAllShipments, 
  updateShipment 
} from '../../db/repositories/shipmentRepository';
import { addShipmentEvent, getEventsForShipment } from '../../db/repositories/shipmentEventRepository';
import { createAuditLog } from '../../db/repositories/auditLogRepository';
import { NotificationService } from '../../services/notificationService';
import { db as localDb } from '../../db/database';

const router = Router();

function resolveCustomerIdFromRequest(body: any): string | null {
  if (body.customerId) {
    return String(body.customerId);
  }

  if (process.env.NODE_ENV === 'production' || process.env.DISABLE_LOCAL_DATA_FALLBACK === 'true') {
    return null;
  }

  const requestedName = String(body.customerName || '').trim().toLowerCase();
  const requestedPhone = String(body.customerPhone || '').trim();
  const customers = localDb.getRaw().users.filter((user: any) => user.role === 'CUSTOMER');

  const matched =
    customers.find((user: any) => requestedPhone && user.phone === requestedPhone) ||
    customers.find((user: any) => requestedName && user.fullName?.toLowerCase().includes(requestedName)) ||
    customers.find((user: any) => requestedName && user.companyName?.toLowerCase().includes(requestedName)) ||
    customers[0];

  return matched?.id || null;
}

// GET /api/shipments/track/:trackingNumber - Public shipment lookup
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    let shipment = await getShipmentByTrackingNumber(trackingNumber);
    if (!shipment) {
      shipment = await getShipmentById(trackingNumber);
    }

    if (!shipment) {
      res.status(404).json({ error: 'لم يتم العثور على أي شحنة برقم التتبع المدخل' });
      return;
    }

    const events = await getEventsForShipment(shipment.id, true);

    res.json({
      id: shipment.id,
      trackingNumber: shipment.trackingNumber,
      shipmentType: shipment.shipmentType,
      pickupLocation: shipment.pickupLocation,
      deliveryLocation: shipment.deliveryLocation,
      shippingDate: shipment.shippingDate || shipment.createdAt,
      currentStatus: shipment.currentStatus,
      currentLocation: (shipment as any).currentLocation || shipment.pickupLocation,
      customerVisibleNotes: shipment.customerVisibleNotes,
      estimatedArrivalDate: shipment.estimatedArrivalDate,
      events,
      updatedAt: shipment.updatedAt,
      createdAt: shipment.createdAt,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error tracking shipment';
    res.status(500).json({ error: msg });
  }
});

// GET /api/shipments - List shipments for authenticated customer or staff
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;

    // Check for approaching arrival dates
    try {
      await NotificationService.checkAndNotifyApproachingArrivals(user.role === 'CUSTOMER' ? user.userId : undefined);
    } catch (e) {
      console.error('Approaching arrival check failed:', e);
    }

    if (user.role === 'CUSTOMER') {
      const customerShipments = await listShipmentsForCustomer(user.userId);
      res.json(customerShipments);
      return;
    }

    const allShipments = await listAllShipments();
    res.json(allShipments);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error listing shipments';
    res.status(500).json({ error: msg });
  }
});

// GET /api/shipments/:id - Get single shipment detail with events
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    let shipment = await getShipmentById(id);
    if (!shipment) {
      shipment = await getShipmentByTrackingNumber(id);
    }

    if (!shipment) {
      res.status(404).json({ error: 'الشحنة غير موجودة' });
      return;
    }

    if (user.role === 'CUSTOMER' && shipment.customerId !== user.userId) {
      res.status(403).json({ error: 'غير مصرح لمشاهدة تفاصيل هذه الشحنة' });
      return;
    }

    const isStaffOrAdmin = user.role === 'STAFF' || user.role === 'ADMIN';
    const events = await getEventsForShipment(shipment.id, !isStaffOrAdmin);

    res.json({
      ...shipment,
      events,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching shipment details';
    res.status(500).json({ error: msg });
  }
});

// POST /api/shipments - Create new shipment (Staff/Admin only)
router.post('/', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      serviceType,
      shipmentType,
      pickupLocation,
      deliveryLocation,
      origin,
      destination,
      shippingDate,
      estimatedArrivalDate,
      estimatedDelivery,
      customerVisibleNotes,
      internalNotes,
    } = req.body;

    const actualServiceType = shipmentType || serviceType;
    const actualPickupLocation = pickupLocation || origin;
    const actualDeliveryLocation = deliveryLocation || destination;
    const resolvedCustomerId = resolveCustomerIdFromRequest(req.body);

    if (!resolvedCustomerId || !actualServiceType || !actualPickupLocation || !actualDeliveryLocation) {
      res.status(400).json({ error: 'جميع حقول الشحنة الأساسية مطلوبة' });
      return;
    }

    const user = req.user!;
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = `AJA-${randNum}-KSA`;

    const newShipment = await createShipment({
      trackingNumber,
      customerId: String(resolvedCustomerId),
      customerName: req.body.customerName ? String(req.body.customerName) : undefined,
      customerPhone: req.body.customerPhone ? String(req.body.customerPhone) : undefined,
      shipmentType: String(actualServiceType),
      pickupLocation: String(actualPickupLocation),
      deliveryLocation: String(actualDeliveryLocation),
      senderName: req.body.senderName ? String(req.body.senderName) : undefined,
      receiverName: req.body.receiverName ? String(req.body.receiverName) : undefined,
      shippingDate: shippingDate ? String(shippingDate) : new Date().toISOString().split('T')[0],
      currentStatus: 'RECEIVED',
      currentLocation: String(actualPickupLocation),
      estimatedArrivalDate: estimatedArrivalDate ? String(estimatedArrivalDate) : estimatedDelivery ? String(estimatedDelivery) : undefined,
      customerVisibleNotes: customerVisibleNotes ? String(customerVisibleNotes) : undefined,
      internalNotes: internalNotes ? String(internalNotes) : undefined,
    } as any);

    await addShipmentEvent({
      shipmentId: newShipment.id,
      status: 'RECEIVED',
      location: newShipment.pickupLocation,
      description: 'تم تسجيل الشحنة واستلامها في مركز العمليات اللوجستية',
      visibleToCustomer: true,
      createdBy: user.userId,
    });

    await createAuditLog({
      actorUserId: user.userId,
      action: 'CREATE_SHIPMENT',
      entityType: 'SHIPMENT',
      entityId: newShipment.id,
      after: { trackingNumber: newShipment.trackingNumber, shipmentType: newShipment.shipmentType },
    });

    await NotificationService.notifyShipmentCreated({
      id: newShipment.id,
      trackingNumber: newShipment.trackingNumber,
      customerId: String(resolvedCustomerId),
      customerName: req.body.customerName ? String(req.body.customerName) : undefined,
    });

    res.status(201).json(newShipment);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating shipment';
    res.status(500).json({ error: msg });
  }
});

// POST /api/shipments/:id/event - Add timeline event & update status (Staff/Admin only)
router.post('/:id/event', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, location, description, descriptionAr } = req.body;
    const user = req.user!;

    const eventDesc = descriptionAr || description;

    if (!status || !location || !eventDesc) {
      res.status(400).json({ error: 'الحالة، الموقع، والوصف جميعها مطلوبة لإضافة حدث جديد' });
      return;
    }

    let shipment = await getShipmentById(id);
    if (!shipment) {
      shipment = await getShipmentByTrackingNumber(id);
    }

    if (!shipment) {
      res.status(404).json({ error: 'الشحنة غير موجودة' });
      return;
    }

    const event = await addShipmentEvent({
      shipmentId: shipment.id,
      status: String(status),
      location: String(location).trim(),
      description: String(eventDesc).trim(),
      visibleToCustomer: true,
      createdBy: user.userId,
    });

    const updatedShipment = await updateShipment(shipment.id, {
      currentStatus: String(status),
      currentLocation: String(location).trim(),
    } as any);

    await createAuditLog({
      actorUserId: user.userId,
      action: 'ADD_SHIPMENT_EVENT',
      entityType: 'SHIPMENT',
      entityId: shipment.id,
      before: { currentStatus: shipment.currentStatus },
      after: { currentStatus: updatedShipment.currentStatus, eventId: event.id },
    });

    // Notify Customer using NotificationService
    if (shipment.customerId) {
      await NotificationService.notifyShipmentStatusChanged({
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        customerId: shipment.customerId,
        status: String(status),
        location: String(location).trim(),
      });
    }

    const events = await getEventsForShipment(shipment.id, false);

    res.json({
      ...updatedShipment,
      events,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error adding shipment event';
    res.status(500).json({ error: msg });
  }
});

export default router;
