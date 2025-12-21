import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  seedRoutines,
} from '../controllers/routineController';

const router = express.Router();

router.use(protect);

router.post('/seed', seedRoutines);

router.route('/')
  .get(getRoutines)
  .post(createRoutine);

router.route('/:id')
  .put(updateRoutine)
  .delete(deleteRoutine);

export default router;
