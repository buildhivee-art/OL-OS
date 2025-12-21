import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import Goal from '../models/Goal';
import Budget from '../models/Budget';

// ... (Existing Functions: getTransactions, addTransaction, deleteTransaction, getFinanceSummary) ...

// --- GOALS ---
// @desc    Get user goals
// @route   GET /api/v1/finance/goals
// @access  Private
export const getGoals = async (req: any, res: Response) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort({ deadline: 1 });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Add a goal
// @route   POST /api/v1/finance/goals
// @access  Private
export const addGoal = async (req: any, res: Response) => {
    try {
        const { title, targetAmount, deadline, color, currentAmount } = req.body;
        const goal = await Goal.create({
            user: req.user.id,
            title,
            targetAmount,
            currentAmount: currentAmount || 0,
            deadline,
            color
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Update a goal (contribution or edit)
// @route   PUT /api/v1/finance/goals/:id
// @access  Private
export const updateGoal = async (req: any, res: Response) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.user.toString() !== req.user.id) {
             res.status(404).json({ message: 'Goal not found' });
             return;
        }

        const updatedGoal = await Goal.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.status(200).json(updatedGoal);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/v1/finance/goals/:id
// @access  Private
export const deleteGoal = async (req: any, res: Response) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.user.toString() !== req.user.id) {
             res.status(404).json({ message: 'Goal not found' });
             return;
        }
        await goal.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// --- BUDGETS ---
// @desc    Get budgets
// @route   GET /api/v1/finance/budgets
// @access  Private
export const getBudgets = async (req: any, res: Response) => {
    try {
        const budgets = await Budget.find({ user: req.user.id });
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Add a budget
// @route   POST /api/v1/finance/budgets
// @access  Private
export const addBudget = async (req: any, res: Response) => {
    try {
        const { category, limit, period } = req.body;
        const budget = await Budget.create({
            user: req.user.id,
            category,
            limit,
            period
        });
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Delete a budget
// @route   DELETE /api/v1/finance/budgets/:id
// @access  Private
export const deleteBudget = async (req: any, res: Response) => {
    try {
        const budget = await Budget.findById(req.params.id);
         if (!budget || budget.user.toString() !== req.user.id) {
             res.status(404).json({ message: 'Budget not found' });
             return;
        }
        await budget.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
         res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Get all transactions for a user
// @route   GET /api/v1/finance
// @access  Private
export const getTransactions = async (req: any, res: Response) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Add a transaction
// @route   POST /api/v1/finance
// @access  Private
export const addTransaction = async (req: any, res: Response) => {
  try {
    const { type, amount, category, date, description } = req.body;

    if (!type || !amount) {
        res.status(400).json({ message: 'Type and amount are required' });
        return;
    }

    const transaction = await Transaction.create({
        user: req.user.id,
        type,
        amount,
        category,
        date: date || Date.now(),
        description
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/v1/finance/:id
// @access  Private
export const deleteTransaction = async (req: any, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
        res.status(404).json({ message: 'Transaction not found' });
        return;
    }

    if (transaction.user.toString() !== req.user.id) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    await transaction.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get Finance Summary (Balance, Income, Expense)
// @route   GET /api/v1/finance/summary
// @access  Private
export const getFinanceSummary = async (req: any, res: Response) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });
        
        let income = 0;
        let expense = 0;

        transactions.forEach((t: any) => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });

        res.status(200).json({
            balance: income - expense,
            totalIncome: income,
            totalExpense: expense
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
