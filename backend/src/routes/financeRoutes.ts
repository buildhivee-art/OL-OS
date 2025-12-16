import express from 'express';
import { getTransactions, addTransaction, deleteTransaction, getFinanceSummary } from '../controllers/financeController';
import { getDebts, addDebt, toggleDebtStatus, deleteDebt } from '../controllers/debtController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getTransactions)
    .post(protect, addTransaction);

router.route('/summary').get(protect, getFinanceSummary);

router.route('/debts')
    .get(protect, getDebts)
    .post(protect, addDebt);

router.route('/debts/:id')
    .put(protect, toggleDebtStatus)
    .delete(protect, deleteDebt);

router.route('/:id')
    .delete(protect, deleteTransaction);

export default router;
