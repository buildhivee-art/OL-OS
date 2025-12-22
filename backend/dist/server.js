"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const metricRoutes_1 = __importDefault(require("./routes/metricRoutes"));
const weeklyLogRoutes_1 = __importDefault(require("./routes/weeklyLogRoutes"));
const financeRoutes_1 = __importDefault(require("./routes/financeRoutes"));
const contentRoutes_1 = __importDefault(require("./routes/contentRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Database
(0, db_1.connectDB)();
const scheduler_1 = require("./utils/scheduler");
// ...
// Seed Data
(0, scheduler_1.initScheduledJobs)();
// Routes
app.use('/api/v1/users', authRoutes_1.default);
app.use('/api/v1/categories', categoryRoutes_1.default);
app.use('/api/v1/tasks', taskRoutes_1.default);
app.use('/api/v1/metrics', metricRoutes_1.default);
app.use('/api/v1/weekly-logs', weeklyLogRoutes_1.default);
app.use('/api/v1/finance', financeRoutes_1.default);
app.use('/api/v1/content', contentRoutes_1.default);
const workoutRoutes_1 = __importDefault(require("./routes/workoutRoutes"));
const noteRoutes_1 = __importDefault(require("./routes/noteRoutes"));
const roadmapRoutes_1 = __importDefault(require("./routes/roadmapRoutes"));
const routineRoutes_1 = __importDefault(require("./routes/routineRoutes"));
app.use('/api/v1/workouts', workoutRoutes_1.default);
app.use('/api/v1/notes', noteRoutes_1.default);
app.use('/api/v1/roadmap', roadmapRoutes_1.default);
app.use('/api/v1/routines', routineRoutes_1.default);
const foodRoutes_1 = __importDefault(require("./routes/foodRoutes"));
app.use('/api/v1/foods', foodRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Life Tracking System API is running');
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
