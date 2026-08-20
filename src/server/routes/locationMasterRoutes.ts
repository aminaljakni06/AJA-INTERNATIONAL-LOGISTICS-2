import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { LocationMasterService } from '../../services/locationMasterService';

const router = Router();

// GET /api/locations/analytics - Analytical summary
router.get('/analytics', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = await LocationMasterService.getAnalytics();
    res.json(analytics);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch location analytics';
    res.status(500).json({ error: msg });
  }
});

// GET /api/locations/countries - Get country master list
router.get('/countries', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const sanctionStatus = req.query.sanctionStatus as string | undefined;
    const countries = await LocationMasterService.getCountries({ search, sanctionStatus });
    res.json(countries);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch countries';
    res.status(500).json({ error: msg });
  }
});

// POST /api/locations/countries - Create country
router.post('/countries', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const created = await LocationMasterService.createCountry(req.body, userId);
    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create country';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/locations/countries/:id - Update country
router.put('/countries/:id', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const updated = await LocationMasterService.updateCountry(req.params.id, req.body, userId);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update country';
    res.status(500).json({ error: msg });
  }
});

// GET /api/locations/cities - Get cities
router.get('/cities', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const countryCode = req.query.countryCode as string | undefined;
    const cities = await LocationMasterService.getCities(countryCode);
    res.json(cities);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch cities';
    res.status(500).json({ error: msg });
  }
});

// POST /api/locations/cities - Create city
router.post('/cities', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const created = await LocationMasterService.createCity(req.body, userId);
    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create city';
    res.status(500).json({ error: msg });
  }
});

// GET /api/locations/ports - Get ports
router.get('/ports', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const countryCode = req.query.countryCode as string | undefined;
    const ports = await LocationMasterService.getPorts(countryCode);
    res.json(ports);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch ports';
    res.status(500).json({ error: msg });
  }
});

// POST /api/locations/ports - Create port
router.post('/ports', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const created = await LocationMasterService.createPort(req.body, userId);
    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create port';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/locations/ports/:id - Update port
router.put('/ports/:id', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const updated = await LocationMasterService.updatePort(req.params.id, req.body, userId);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update port';
    res.status(500).json({ error: msg });
  }
});

// GET /api/locations/airports - Get airports
router.get('/airports', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const countryCode = req.query.countryCode as string | undefined;
    const airports = await LocationMasterService.getAirports(countryCode);
    res.json(airports);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch airports';
    res.status(500).json({ error: msg });
  }
});

// POST /api/locations/airports - Create airport
router.post('/airports', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const created = await LocationMasterService.createAirport(req.body, userId);
    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create airport';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/locations/airports/:id - Update airport
router.put('/airports/:id', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const updated = await LocationMasterService.updateAirport(req.params.id, req.body, userId);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update airport';
    res.status(500).json({ error: msg });
  }
});

// GET /api/locations/warehouses - Get warehouses
router.get('/warehouses', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const warehouses = await LocationMasterService.getWarehouses();
    res.json(warehouses);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch warehouses';
    res.status(500).json({ error: msg });
  }
});

// POST /api/locations/warehouses - Create warehouse
router.post('/warehouses', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const created = await LocationMasterService.createWarehouse(req.body, userId);
    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create warehouse';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/locations/warehouses/:id - Update warehouse
router.put('/warehouses/:id', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const updated = await LocationMasterService.updateWarehouse(req.params.id, req.body, userId);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update warehouse';
    res.status(500).json({ error: msg });
  }
});

// GET /api/locations/border-crossings
router.get('/border-crossings', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const crossings = await LocationMasterService.getBorderCrossings();
    res.json(crossings);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch border crossings';
    res.status(500).json({ error: msg });
  }
});

// GET /api/locations/trade-lanes
router.get('/trade-lanes', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const lanes = await LocationMasterService.getTradeLanes();
    res.json(lanes);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch trade lanes';
    res.status(500).json({ error: msg });
  }
});

// POST /api/locations/trade-lanes
router.post('/trade-lanes', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const created = await LocationMasterService.createTradeLane(req.body, userId);
    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create trade lane';
    res.status(500).json({ error: msg });
  }
});

// GET /api/locations/geofences
router.get('/geofences', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const geofences = await LocationMasterService.getGeofences();
    res.json(geofences);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch geofences';
    res.status(500).json({ error: msg });
  }
});

// POST /api/locations/geofences
router.post('/geofences', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const created = await LocationMasterService.createGeofence(req.body, userId);
    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create geofence';
    res.status(500).json({ error: msg });
  }
});

// GET /api/locations/holidays
router.get('/holidays', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const countryCode = req.query.countryCode as string | undefined;
    const holidays = await LocationMasterService.getHolidays(countryCode);
    res.json(holidays);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch holidays';
    res.status(500).json({ error: msg });
  }
});

export default router;
