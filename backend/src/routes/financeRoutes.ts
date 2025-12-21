import express from 'express';
import { 
    getTransactions, addTransaction, deleteTransaction, getFinanceSummary,
    getGoals, addGoal, updateGoal, deleteGoal,
    getBudgets, addBudget, deleteBudget
} from '../controllers/financeController';
import { getDebts, addDebt, toggleDebtStatus, deleteDebt } from '../controllers/debtController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getTransactions)
    .post(protect, addTransaction);

router.route('/summary').get(protect, getFinanceSummary);

// Goals
router.route('/goals')
    .get(protect, getGoals)
    .post(protect, addGoal);
    
router.route('/goals/:id')
    .put(protect, updateGoal)
    .delete(protect, deleteGoal);

// Budgets
router.route('/budgets')
    .get(protect, getBudgets)
    .post(protect, addBudget);

router.route('/budgets/:id')
    .delete(protect, deleteBudget);

router.route('/debts')
    .get(protect, getDebts)
    .post(protect, addDebt);

router.route('/debts/:id')
    .put(protect, toggleDebtStatus)
    .delete(protect, deleteDebt);

router.route('/:id')
    .delete(protect, deleteTransaction);

export default router;
