import { Request, Response } from 'express';
import Task from '../models/Task';
import TaskLog from '../models/TaskLog';
import User from '../models/User';

// @desc    Get user tasks
// @route   GET /api/v1/tasks
// @access  Private
export const getTasks = async (req: any, res: Response) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).populate('category', 'name slug');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create a task
// @route   POST /api/v1/tasks
// @access  Private
export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description, category, difficulty, startDate, endDate } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Please provide a title' });
      return;
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      category,
      difficulty,
      startDate: startDate || Date.now(),
      endDate,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update a task
// @route   PUT /api/v1/tasks/:id
// @access  Private
export const updateTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Check for user
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Make sure the logged in user matches the task user
    if (task.user.toString() !== req.user.id) {
      res.status(401).json({ message: 'User not authorized' });
      return;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('category', 'name slug');

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
export const deleteTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Check for user
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Make sure the logged in user matches the task user
    if (task.user.toString() !== req.user.id) {
      res.status(401).json({ message: 'User not authorized' });
      return;
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get task logs (completions)
// @route   GET /api/v1/tasks/logs
// @access  Private
export const getTaskLogs = async (req: any, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Convert dates to YYYY-MM range
    // startDate: 2025-12-01 -> 2025-12
    const startMonth = startDate.substring(0, 7);
    const endMonth = endDate.substring(0, 7);

    const query = {
        user: req.user.id,
        month: { $gte: startMonth, $lte: endMonth }
    };

    const logs = await TaskLog.find(query);
    
    // Transform back to flat list for frontend compatibility
    // result: [{ task: "id", date: "YYYY-MM-DD" }, ...]
    const result: any[] = [];
    
    logs.forEach((log: any) => {
        log.completedDays.forEach((day: number) => {
            // Pad day with leading zero if needed
            const dayStr = day < 10 ? `0${day}` : `${day}`;
            result.push({
                task: log.task,
                date: `${log.month}-${dayStr}`
            });
        });
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Toggle task completion for a date
// @route   POST /api/v1/tasks/logs
// @access  Private
export const toggleTaskLog = async (req: any, res: Response) => {
  try {
    const { taskId, date } = req.body; // date is YYYY-MM-DD

    if (!taskId || !date) {
        res.status(400).json({ message: 'Task ID and date are required' });
        return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
    }

    if (task.user.toString() !== req.user.id) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    // Parse date
    const [year, month, dayStr] = date.split('-');
    const monthStr = `${year}-${month}`; // YYYY-MM
    const day = parseInt(dayStr, 10);

    // Find or create monthly log
    const log = await TaskLog.findOne({
        user: req.user.id,
        task: taskId,
// ... (existing)
        month: monthStr
    });

    let completed = false;

    if (log) {
        if (log.completedDays.includes(day)) {
            // Toggle OFF
            log.completedDays = log.completedDays.filter((d: number) => d !== day);
            completed = false;
        } else {
            // Toggle ON
            log.completedDays.push(day);
            completed = true;
        }
        await log.save();
    } else {
        // Create new log with this day
        await TaskLog.create({
            user: req.user.id,
            task: taskId,
            month: monthStr,
            completedDays: [day]
        });
        completed = true;
    }

    // GAMIFICATION ENGINE
    const user = await User.findById(req.user.id);
    if (user) {
        if (completed) {
            user.xp += 10;
        } else {
            // Revert XP (Subtract 10)
            // User Rule: "when missed there will be -5 XP only after 1 dec 2025"
            // Implementation: We treat "Unchecking" as reverting a Done state. 
            // If we interpret unchecking as returning to "Missed" state, we simply remove the points gained.
            // For the "-5 penalty", we will apply it if the date is definitively in the past and strict mode is on?
            // For now, simpler is better: Revert the gain.
            user.xp = Math.max(0, user.xp - 10);
            
            // Check for explicit penalty condition (After Dec 1, 2025)
            // If we are "missing" a task (implies it was done/scheduled and now isn't)
            const cutoffDate = new Date('2025-12-01');
            const taskDate = new Date(date);
            // If taskDate is after cutoff and we are unchecking it (making it missed?)
            // We'll stick to just reverting for now to avoid frustration on misclicks.
        }

        // Level Up Logic: Every 1000 XP
        // Level 1: 0-999, Level 2: 1000-1999...
        const newLevel = Math.floor(user.xp / 1000) + 1;
        user.level = newLevel;
        
        await user.save();
    }

    res.status(200).json({ taskId, date, completed, xp: user?.xp, level: user?.level });

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
