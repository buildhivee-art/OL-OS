import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getWeeklyLogs, getWeeklyLogByDate, updateWeeklyLog } from '../controllers/weeklyLogController';

const router = express.Router();

router.get('/', protect, getWeeklyLogs);
router.get('/:weekStartDate', protect, getWeeklyLogByDate);
router.post('/', protect, updateWeeklyLog);

export default router;
