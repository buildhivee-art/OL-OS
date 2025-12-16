import { Request, Response } from 'express';
import Debt from '../models/Debt';

// @desc    Get all debts/loans
// @route   GET /api/v1/finance/debts
// @access  Private
export const getDebts = async (req: any, res: Response) => {
  try {
    const debts = await Debt.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(debts);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Add a debt/loan record
// @route   POST /api/v1/finance/debts
// @access  Private
export const addDebt = async (req: any, res: Response) => {
  try {
    const { type, person, amount, dueDate, notes } = req.body;

    const debt = await Debt.create({
        user: req.user.id,
        type,
        person,
        amount,
        dueDate,
        notes
    });

    res.status(201).json(debt);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Toggle settled status
// @route   PUT /api/v1/finance/debts/:id
// @access  Private
export const toggleDebtStatus = async (req: any, res: Response) => {
    try {
        const debt = await Debt.findById(req.params.id);
        
        if (!debt) return res.status(404).json({ message: 'Record not found' });
        if (debt.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        debt.isSettled = !debt.isSettled;
        await debt.save();

        res.status(200).json(debt);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Delete debt record
// @route   DELETE /api/v1/finance/debts/:id
// @access  Private
export const deleteDebt = async (req: any, res: Response) => {
    try {
        const debt = await Debt.findById(req.params.id);

        if (!debt) return res.status(404).json({ message: 'Record not found' });
        if (debt.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await debt.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
