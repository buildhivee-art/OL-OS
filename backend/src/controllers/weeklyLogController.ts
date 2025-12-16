import { Request, Response } from 'express';
import { WeeklyLog } from '../models/WeeklyLog';

export const getWeeklyLogs = async (req: Request, res: Response) => {
    try {
        const logs = await WeeklyLog.find({ user: (req as any).user.id }).sort({ weekStartDate: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getWeeklyLogByDate = async (req: Request, res: Response) => {
    try {
        const { weekStartDate } = req.params;
        const log = await WeeklyLog.findOne({ user: (req as any).user.id, weekStartDate });
        if (!log) {
            // Return empty skeleton if not found, don't 404, just let frontend know it's new
            return res.json({ weekStartDate, content: '', rating: 0, goalsForNextWeek: '', mood: '' });
        }
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

    export const updateWeeklyLog = async (req: Request, res: Response) => {
    try {
        const { weekStartDate, title, content, mainFocus, wins, lessons, rating, energyLevel, goalsForNextWeek, mood } = req.body;
        
        const log = await WeeklyLog.findOneAndUpdate(
            { user: (req as any).user.id, weekStartDate },
            { title, content, mainFocus, wins, lessons, rating, energyLevel, goalsForNextWeek, mood },
            { new: true, upsert: true }
        );
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
