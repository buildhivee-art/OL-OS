import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getFoods, createFood, deleteFood, updateFood } from '../controllers/foodController';

const router = express.Router();

router.use(protect);

router.get('/', getFoods);
router.post('/', createFood);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);

export default router;
