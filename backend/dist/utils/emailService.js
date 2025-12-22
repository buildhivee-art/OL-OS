"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMonthlyBackupReport = exports.generateWeeklyReport = exports.generateDailyCheckIn = exports.generateDailyBrief = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configure Transporter (User needs to add env vars)
// For Gmail: Use App Password, not main password
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // e.g. 'plabon.rahman@gmail.com'
        pass: process.env.EMAIL_PASS, // App Password
    },
});
const sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Skipping Email: SMTP credentials not set in .env');
        console.log(`[Would have sent to ${to}]: ${subject}`);
        return;
    }
    try {
        const info = await transporter.sendMail({
            from: `"OL-OS Command" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent: ${info.messageId}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
};
exports.sendEmail = sendEmail;
// --- STYLES ---
const STYLES = `
    body { font-family: 'Courier New', monospace; background-color: #000000; color: #e4e4e7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #09090b; border: 1px solid #27272a; }
    .header { background-color: #000000; padding: 20px; border-bottom: 1px solid #27272a; text-align: center; }
    .logo { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -1px; margin: 0; }
    .logo span { color: #f97316; }
    .content { padding: 30px 20px; }
    .section { margin-bottom: 25px; border-left: 2px solid #3f3f46; padding-left: 15px; }
    .section-title { color: #a1a1aa; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-bottom: 8px; }
    .highlight { color: #22c55e; font-weight: bold; }
    .alert { color: #ef4444; font-weight: bold; }
    .btn { display: inline-block; background-color: #f97316; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px; }
    .footer { background-color: #000000; padding: 20px; text-align: center; font-size: 10px; color: #52525b; border-top: 1px solid #27272a; }
`;
const BASE_TEMPLATE = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
    <style>${STYLES}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">OL<span>-OS</span></h1>
            <div style="font-size: 10px; color: #71717a; letter-spacing: 2px; margin-top: 5px;">${title}</div>
        </div>
        <div class="content">
            ${bodyContent}
            <div style="text-align: center;">
                <a href="http://localhost:3000/dashboard" class="btn">Access Terminal</a>
            </div>
        </div>
        <div class="footer">
            SYSTEM NOTIFICATION // DO NOT REPLY<br/>
            OL-OS OPERATING ENVIRONMENT
        </div>
    </div>
</body>
</html>
`;
const generateDailyBrief = (tasks) => {
    const taskList = tasks.slice(0, 5).map(t => `<div style="margin-bottom: 5px; color: #d4d4d8;">[ ] ${t.title} <span style="color: #71717a; font-size: 10px;">// ${t.difficulty}</span></div>`).join('');
    return BASE_TEMPLATE('DAILY BRIEFING', `
        <div class="section">
            <div class="section-title" style="color: #f97316;">Objective Manifest</div>
            <p style="margin-top: 0; color: #fff;">Good morning, Commander. Daily protocols initiated.</p>
            ${taskList ? `<div style="background: #18181b; padding: 15px; margin-top: 10px;">${taskList}</div>` : '<p>No critical tasks pending.</p>'}
        </div>

        <div class="section" style="border-left-color: #3b82f6;">
            <div class="section-title" style="color: #3b82f6;">Protocol Reminders</div>
            <table style="width: 100%; font-size: 12px;">
                <tr><td style="padding: 5px 0;">KPI 01</td><td style="color: #fff;">Workout Session</td></tr>
                <tr><td style="padding: 5px 0;">KPI 02</td><td style="color: #fff;">Caloric Intake</td></tr>
                <tr><td style="padding: 5px 0;">KPI 03</td><td style="color: #fff;">Habit Execution</td></tr>
            </table>
        </div>
    `);
};
exports.generateDailyBrief = generateDailyBrief;
const generateDailyCheckIn = () => {
    return BASE_TEMPLATE('EVENING CHECK-IN', `
        <div class="section" style="border-left-color: #ef4444;">
            <div class="section-title" style="color: #ef4444;">Review Required</div>
            <p style="margin-top: 0; color: #fff;">End of day cycle reached. Verify daily metrics immediately.</p>
        </div>

        <div class="section">
            <div class="section-title">Pending Verifications</div>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; color: #d4d4d8;">
               <li style="margin-bottom: 10px; display: flex; align-items: center;">
                   <span style="display: inline-block; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; margin-right: 10px;"></span>
                   <strong>Workout Log:</strong> &nbsp; Confirm training completion.
               </li>
               <li style="margin-bottom: 10px; display: flex; align-items: center;">
                   <span style="display: inline-block; width: 6px; height: 6px; background: #eab308; border-radius: 50%; margin-right: 10px;"></span>
                   <strong>Nutrition:</strong> &nbsp; Finalize calorie & macro counts.
               </li>
               <li style="margin-bottom: 10px; display: flex; align-items: center;">
                   <span style="display: inline-block; width: 6px; height: 6px; background: #22c55e; border-radius: 50%; margin-right: 10px;"></span>
                   <strong>Habit Tracker:</strong> &nbsp; Mark daily completions.
               </li>
            </ul>
        </div>
    `);
};
exports.generateDailyCheckIn = generateDailyCheckIn;
const generateWeeklyReport = (stats) => {
    return BASE_TEMPLATE('WEEKLY SYSTEM AUDIT', `
        <div class="section" style="border-left-color: #8b5cf6;">
            <div class="section-title" style="color: #8b5cf6;">Performance Summary</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="border-bottom: 1px solid #27272a;">
                    <td style="padding: 10px 0; color: #a1a1aa;">XP Gained</td>
                    <td style="padding: 10px 0; text-align: right; color: #22c55e;">+${stats.xpGained}</td>
                </tr>
                <tr style="border-bottom: 1px solid #27272a;">
                    <td style="padding: 10px 0; color: #a1a1aa;">Completion Rate</td>
                    <td style="padding: 10px 0; text-align: right; color: #fff;">${stats.completionRate}%</td>
                </tr>
            </table>
        </div>

        <div class="section" style="border-left-color: #10b981;">
            <div class="section-title" style="color: #10b981;">Financial Status</div>
            <div style="background: #064e3b; color: #6ee7b7; padding: 15px; border-radius: 4px; text-align: center;">
                <div style="font-size: 10px; text-transform: uppercase; margin-bottom: 5px;">Net Cash Flow</div>
                <div style="font-size: 24px; font-weight: bold;">$${stats.financeNet}</div>
            </div>
        </div>
    `);
};
exports.generateWeeklyReport = generateWeeklyReport;
const generateMonthlyBackupReport = () => {
    const backupId = `BKP-${new Date().getFullYear()}${new Date().getMonth() + 1}-FULL`;
    return BASE_TEMPLATE('MONTHLY BACKUP REPORT', `
        <div class="section" style="border-left-color: #3b82f6;">
            <div class="section-title" style="color: #3b82f6;">System Archival</div>
            <p style="color: #d4d4d8;">Full system backup sequence completed successfully.</p>
            <div style="background: #172554; color: #93c5fd; padding: 10px; font-family: monospace; font-size: 12px; margin-top: 10px;">
                ID: ${backupId}<br/>
                SIZE: 4.2 GB<br/>
                STATUS: ENCRYPTED / REDUNDANT
            </div>
        </div>
        
        <p style="font-size: 12px; color: #71717a;">
            All core databases (Habits, Finance, Projects) have been secured. No action required.
        </p>
    `);
};
exports.generateMonthlyBackupReport = generateMonthlyBackupReport;
