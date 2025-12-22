import { Request, Response } from 'express';
import DailyMetric from '../models/DailyMetric';
import TaskLog from '../models/TaskLog';

// @desc    Get metrics for date range
// @route   GET /api/v1/metrics
// @access  Private
export const getMetrics = async (req: any, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query: any = { user: req.user.id };
    if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
    }

    const metrics = await DailyMetric.find(query);
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update metric for a date
// @route   POST /api/v1/metrics
// @access  Private
export const updateMetric = async (req: any, res: Response) => {
  try {
    const { date, weight, hp, calories, water, macros, body, micros, foodLog, supplements } = req.body;

    if (!date) {
        res.status(400).json({ message: 'Date is required' });
        return;
    }

    const metric = await DailyMetric.findOneAndUpdate(
        { user: req.user.id, date },
        { 
            $set: { 
                ...(weight !== undefined && { weight }), 
                ...(hp !== undefined && { hp }),
                ...(calories !== undefined && { calories }),
                ...(water !== undefined && { water }),
                ...(macros !== undefined && { macros }),
                ...(body !== undefined && { body }),
                ...(micros !== undefined && { micros }),
                ...(foodLog !== undefined && { foodLog }),
                ...(supplements !== undefined && { supplements }),
            } 
        },
        { new: true, upsert: true }
    );

    res.status(200).json(metric);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Seed initial metrics
// @route   POST /api/v1/metrics/seed
// @access  Private (or Public for dev)
export const seedMetrics = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        
        // Seed Dec 1 to Dec 16 2025? User said "1 dec to 16 dec".
        // Assuming current year (2025 in this context).
        
        const updates = [];
        for (let i = 1; i <= 16; i++) {
            const day = i < 10 ? `0${i}` : `${i}`;
            const date = `2025-12-${day}`;
            
            // Random HP between 6.5 and 7.2
            const hp = parseFloat((Math.random() * (7.2 - 6.5) + 6.5).toFixed(1));
            
            // Random Weight between 70.0 and 70.5 (just placeholder)
            const weight = parseFloat((Math.random() * (70.5 - 70.0) + 70.0).toFixed(1));

            updates.push({
                updateOne: {
                    filter: { user: userId, date },
                    update: { $set: { hp, weight } },
                    upsert: true
                }
            });
        }
        
        if (updates.length > 0) {
            await DailyMetric.bulkWrite(updates);
        }

        res.status(200).json({ message: 'Seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}
