import { Router } from 'express';
import { getAllServices } from '../../db/repositories/serviceRepository';
import { getAllFAQs } from '../../db/repositories/faqRepository';
import { SERVICES_DATA, getServiceBySlug } from '../../data/services';

const router = Router();

// GET /api/services - Public list of services
router.get('/', async (_req, res) => {
  try {
    const dbServices = await getAllServices();
    if (dbServices && dbServices.length > 0) {
      res.json(dbServices);
      return;
    }
    // Return structured SERVICES_DATA if DB empty
    res.json(SERVICES_DATA);
  } catch (err: unknown) {
    res.json(SERVICES_DATA);
  }
});

// GET /api/services/faqs - Public list of FAQs
router.get('/faqs', async (_req, res) => {
  try {
    const faqs = await getAllFAQs();
    res.json(faqs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error listing FAQs';
    res.status(500).json({ error: msg });
  }
});

// GET /api/services/:slug - Get specific service by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const service = getServiceBySlug(slug);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json(service);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error retrieving service';
    res.status(500).json({ error: msg });
  }
});

export default router;
