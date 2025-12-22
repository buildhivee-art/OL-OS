"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduledJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = __importDefault(require("../models/User"));
const Task_1 = __importDefault(require("../models/Task"));
const emailService_1 = require("./emailService");
// Initialize Cron Jobs
const initScheduledJobs = () => {
    console.log('Initializing Cron Jobs...');
    // 1. DAILY START: 8:00 AM - Morning Briefing
    node_cron_1.default.schedule('0 8 * * *', async () => {
        console.log('Running Morning Brief Job...');
        // Send to all Admins
        const admins = await User_1.default.find({ role: 'admin' });
        for (const admin of admins) {
            const tasks = await Task_1.default.find({ user: admin._id, active: true });
            // Always send providing there is a user to send to, even if no tasks (template handles empty case gracefully)
            if (admin.email) {
                const html = (0, emailService_1.generateDailyBrief)(tasks);
                await (0, emailService_1.sendEmail)(admin.email, `MORNING BRIEF :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    });
    // 2. DAILY END: 9:00 PM - Evening Check-in (Fitness, Habit, Nutrition)
    node_cron_1.default.schedule('0 21 * * *', async () => {
        console.log('Running Evening Check-in Job...');
        const admins = await User_1.default.find({ role: 'admin' });
        for (const admin of admins) {
            if (admin.email) {
                const html = (0, emailService_1.generateDailyCheckIn)();
                await (0, emailService_1.sendEmail)(admin.email, `EVENING CHECK :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    });
    // 3. WEEKLY REVIEW: Sunday 9:00 AM - Verification & Updates (Finance, Status)
    node_cron_1.default.schedule('0 9 * * 0', async () => {
        console.log('Running Weekly Review Job...');
        const admins = await User_1.default.find({ role: 'admin' });
        for (const admin of admins) {
            // Mock Stats (In future, aggregate actual data)
            const stats = {
                xpGained: 1250,
                tasksCompleted: 42,
                completionRate: 91,
                financeNet: 25000
            };
            if (admin.email) {
                const html = (0, emailService_1.generateWeeklyReport)(stats);
                await (0, emailService_1.sendEmail)(admin.email, `WEEKLY UPDATE :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    });
    // 4. MONTHLY BACKUP: 1st of Month 4:00 AM
    node_cron_1.default.schedule('0 4 1 * *', async () => {
        console.log('Running Monthly Backup Job...');
        const admins = await User_1.default.find({ role: 'admin' });
        for (const admin of admins) {
            if (admin.email) {
                const html = (0, emailService_1.generateMonthlyBackupReport)();
                await (0, emailService_1.sendEmail)(admin.email, `SYSTEM BACKUP :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    });
};
exports.initScheduledJobs = initScheduledJobs;
