import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

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
