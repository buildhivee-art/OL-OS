import express from 'express';
import { getMetrics, updateMetric, seedMetrics } from '../controllers/metricController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getMetrics)
  .post(protect, updateMetric);

router.post('/seed', protect, seedMetrics);

export default router;
