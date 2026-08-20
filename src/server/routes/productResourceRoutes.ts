import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth, requireRoles } from '../auth';
import { ProductResourceMasterService } from '../../services/productResourceMasterService';
import {
  ProductResourceEntity,
  ProductResourceValidationMode,
  validateProductResourcePayload
} from '../../utils/productResourceValidators';

const router = Router();

router.use(requireAuth);

function handleError(res: Response, err: unknown, fallbackMessage: string): void {
  const message = err instanceof Error ? err.message : fallbackMessage;
  res.status(500).json({ error: message });
}

function rejectInvalidPayload(
  res: Response,
  entity: ProductResourceEntity,
  payload: Record<string, unknown>,
  mode: ProductResourceValidationMode
): boolean {
  const validation = validateProductResourcePayload(entity, payload, mode);
  if (validation.valid) return false;

  res.status(400).json({
    error: validation.issues.map(issue => issue.messageEn).join(' '),
    errors: validation.issues
  });
  return true;
}

router.get('/products', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getProducts());
  } catch (err) {
    handleError(res, err, 'Failed to fetch products');
  }
});

router.post('/products', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (rejectInvalidPayload(res, 'product', req.body || {}, 'create')) return;
    const created = await ProductResourceMasterService.createProduct(req.body, req.user?.userId || 'usr_system');
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err, 'Failed to create product');
  }
});

router.put('/products/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (rejectInvalidPayload(res, 'product', req.body || {}, 'update')) return;
    const updated = await ProductResourceMasterService.updateProduct(req.params.id, req.body, req.user?.userId || 'usr_system');
    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Failed to update product');
  }
});

router.delete('/products/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await ProductResourceMasterService.deleteProduct(req.params.id, req.user?.userId || 'usr_system');
    if (!deleted) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete product');
  }
});

router.get('/services', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getServices());
  } catch (err) {
    handleError(res, err, 'Failed to fetch service catalog');
  }
});

router.post('/services', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (rejectInvalidPayload(res, 'service', req.body || {}, 'create')) return;
    const created = await ProductResourceMasterService.createService(req.body, req.user?.userId || 'usr_system');
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err, 'Failed to create service catalog item');
  }
});

router.put('/services/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (rejectInvalidPayload(res, 'service', req.body || {}, 'update')) return;
    const updated = await ProductResourceMasterService.updateService(req.params.id, req.body, req.user?.userId || 'usr_system');
    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Failed to update service catalog item');
  }
});

router.delete('/services/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await ProductResourceMasterService.deleteService(req.params.id, req.user?.userId || 'usr_system');
    if (!deleted) {
      res.status(404).json({ error: 'Service catalog item not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete service catalog item');
  }
});

router.get('/service-packages', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getServicePackages());
  } catch (err) {
    handleError(res, err, 'Failed to fetch service packages');
  }
});

router.get('/shipment-types', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getShipmentTypes());
  } catch (err) {
    handleError(res, err, 'Failed to fetch shipment types');
  }
});

router.get('/vehicles', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getVehicles());
  } catch (err) {
    handleError(res, err, 'Failed to fetch vehicles');
  }
});

router.post('/vehicles', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (rejectInvalidPayload(res, 'vehicle', req.body || {}, 'create')) return;
    const created = await ProductResourceMasterService.createVehicle(req.body, req.user?.userId || 'usr_system');
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err, 'Failed to create vehicle');
  }
});

router.put('/vehicles/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (rejectInvalidPayload(res, 'vehicle', req.body || {}, 'update')) return;
    const updated = await ProductResourceMasterService.updateVehicle(req.params.id, req.body, req.user?.userId || 'usr_system');
    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Failed to update vehicle');
  }
});

router.delete('/vehicles/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await ProductResourceMasterService.deleteVehicle(req.params.id, req.user?.userId || 'usr_system');
    if (!deleted) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete vehicle');
  }
});

router.get('/containers', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getContainers());
  } catch (err) {
    handleError(res, err, 'Failed to fetch containers');
  }
});

router.post('/containers', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (rejectInvalidPayload(res, 'container', req.body || {}, 'create')) return;
    const created = await ProductResourceMasterService.createContainer(req.body, req.user?.userId || 'usr_system');
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err, 'Failed to create container');
  }
});

router.put('/containers/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (rejectInvalidPayload(res, 'container', req.body || {}, 'update')) return;
    const updated = await ProductResourceMasterService.updateContainer(req.params.id, req.body, req.user?.userId || 'usr_system');
    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Failed to update container');
  }
});

router.delete('/containers/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await ProductResourceMasterService.deleteContainer(req.params.id, req.user?.userId || 'usr_system');
    if (!deleted) {
      res.status(404).json({ error: 'Container not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete container');
  }
});

router.get('/drivers', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getDrivers());
  } catch (err) {
    handleError(res, err, 'Failed to fetch drivers');
  }
});

router.put('/drivers/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await ProductResourceMasterService.updateDriver(req.params.id, req.body, req.user?.userId || 'usr_system');
    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Failed to update driver');
  }
});

router.delete('/drivers/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await ProductResourceMasterService.deleteDriver(req.params.id, req.user?.userId || 'usr_system');
    if (!deleted) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete driver');
  }
});

router.get('/equipment', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getEquipment());
  } catch (err) {
    handleError(res, err, 'Failed to fetch equipment');
  }
});

router.put('/equipment/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await ProductResourceMasterService.updateEquipment(req.params.id, req.body, req.user?.userId || 'usr_system');
    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Failed to update equipment');
  }
});

router.delete('/equipment/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await ProductResourceMasterService.deleteEquipment(req.params.id, req.user?.userId || 'usr_system');
    if (!deleted) {
      res.status(404).json({ error: 'Equipment not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete equipment');
  }
});

router.get('/assets', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getAssets());
  } catch (err) {
    handleError(res, err, 'Failed to fetch assets');
  }
});

router.put('/assets/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await ProductResourceMasterService.updateAsset(req.params.id, req.body, req.user?.userId || 'usr_system');
    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Failed to update asset');
  }
});

router.delete('/assets/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await ProductResourceMasterService.deleteAsset(req.params.id, req.user?.userId || 'usr_system');
    if (!deleted) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete asset');
  }
});

router.get('/digital-assets', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getDigitalAssets());
  } catch (err) {
    handleError(res, err, 'Failed to fetch digital assets');
  }
});

router.put('/digital-assets/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await ProductResourceMasterService.updateDigitalAsset(req.params.id, req.body, req.user?.userId || 'usr_system');
    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Failed to update digital asset');
  }
});

router.delete('/digital-assets/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await ProductResourceMasterService.deleteDigitalAsset(req.params.id, req.user?.userId || 'usr_system');
    if (!deleted) {
      res.status(404).json({ error: 'Digital asset not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete digital asset');
  }
});

router.get('/uoms', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getUoms());
  } catch (err) {
    handleError(res, err, 'Failed to fetch UOM records');
  }
});

router.post('/uoms', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  if (rejectInvalidPayload(res, 'uom', req.body, 'create')) return;

  try {
    const created = await ProductResourceMasterService.createUom(req.body, req.user?.userId || 'usr_system');
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err, 'Failed to create UOM record');
  }
});

router.put('/uoms/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  if (rejectInvalidPayload(res, 'uom', req.body, 'update')) return;

  try {
    const updated = await ProductResourceMasterService.updateUom(req.params.id, req.body, req.user?.userId || 'usr_system');
    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Failed to update UOM record');
  }
});

router.delete('/uoms/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await ProductResourceMasterService.deleteUom(req.params.id, req.user?.userId || 'usr_system');
    if (!deleted) {
      res.status(404).json({ error: 'UOM record not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete UOM record');
  }
});

router.get('/commodities', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(await ProductResourceMasterService.getCommodities());
  } catch (err) {
    handleError(res, err, 'Failed to fetch commodities');
  }
});

router.post('/commodities', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  if (rejectInvalidPayload(res, 'commodity', req.body, 'create')) return;

  try {
    const created = await ProductResourceMasterService.createCommodity(req.body, req.user?.userId || 'usr_system');
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err, 'Failed to create commodity');
  }
});

router.put('/commodities/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  if (rejectInvalidPayload(res, 'commodity', req.body, 'update')) return;

  try {
    const updated = await ProductResourceMasterService.updateCommodity(req.params.id, req.body, req.user?.userId || 'usr_system');
    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Failed to update commodity');
  }
});

router.delete('/commodities/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await ProductResourceMasterService.deleteCommodity(req.params.id, req.user?.userId || 'usr_system');
    if (!deleted) {
      res.status(404).json({ error: 'Commodity not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete commodity');
  }
});

router.post('/uom-conversion', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { value, fromCode, toCode } = req.body || {};
    const result = ProductResourceMasterService.convertUomValue(Number(value), String(fromCode || ''), String(toCode || ''));
    res.json(result);
  } catch (err) {
    handleError(res, err, 'Failed to convert UOM value');
  }
});

export default router;
