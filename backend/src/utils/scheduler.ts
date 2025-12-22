import cron from 'node-cron';
import User from '../models/User';
import Task from '../models/Task';
import TaskLog from '../models/TaskLog';
import { sendEmail, generateDailyBrief, generateWeeklyReport, generateDailyCheckIn, generateMonthlyBackupReport } from './emailService';

// Initialize Cron Jobs
export const initScheduledJobs = () => {
    console.log('Initializing Cron Jobs...');

    // 1. DAILY START: 8:00 AM - Morning Briefing
    cron.schedule('0 8 * * *', async () => {
        console.log('Running Morning Brief Job...');
        // Send to all Admins
        const admins = await User.find({ role: 'admin' });
        
        for (const admin of admins) {
             const tasks = await Task.find({ user: admin._id, active: true });
             // Always send providing there is a user to send to, even if no tasks (template handles empty case gracefully)
             if (admin.email) {
                 const html = generateDailyBrief(tasks);
                 await sendEmail(admin.email, `MORNING BRIEF :: ${new Date().toLocaleDateString()}`, html);
             }
        }
    });

    // 2. DAILY END: 9:00 PM - Evening Check-in (Fitness, Habit, Nutrition)
    cron.schedule('0 21 * * *', async () => {
        console.log('Running Evening Check-in Job...');
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
            if (admin.email) {
                const html = generateDailyCheckIn();
                await sendEmail(admin.email, `EVENING CHECK :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    });

    // 3. WEEKLY REVIEW: Sunday 9:00 AM - Verification & Updates (Finance, Status)
    cron.schedule('0 9 * * 0', async () => {
        console.log('Running Weekly Review Job...');
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
            // Mock Stats (In future, aggregate actual data)
            const stats = {
                xpGained: 1250, 
                tasksCompleted: 42,
                completionRate: 91,
                financeNet: 25000
            };

            if (admin.email) {
                const html = generateWeeklyReport(stats);
                await sendEmail(admin.email, `WEEKLY UPDATE :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    });

    // 4. MONTHLY BACKUP: 1st of Month 4:00 AM
    cron.schedule('0 4 1 * *', async () => {
        console.log('Running Monthly Backup Job...');
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
             if (admin.email) {
                 const html = generateMonthlyBackupReport();
                 await sendEmail(admin.email, `SYSTEM BACKUP :: ${new Date().toLocaleDateString()}`, html);
             }
        }
    });
};
