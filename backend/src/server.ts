import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';

import categoryRoutes from './routes/categoryRoutes';
import { seedCategories } from './controllers/categoryController';
import taskRoutes from './routes/taskRoutes';
import metricRoutes from './routes/metricRoutes';
import weeklyLogRoutes from './routes/weeklyLogRoutes';
import financeRoutes from './routes/financeRoutes';
import contentRoutes from './routes/contentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

import { initScheduledJobs } from './utils/scheduler';
import { seedRoadmap } from './utils/seedRoadmap';

// ...
// Seed Data
seedCategories();
seedRoadmap();
initScheduledJobs();

// Routes
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/metrics', metricRoutes);
app.use('/api/v1/weekly-logs', weeklyLogRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/content', contentRoutes);
import workoutRoutes from './routes/workoutRoutes';
import noteRoutes from './routes/noteRoutes';
import roadmapRoutes from './routes/roadmapRoutes';

app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);

app.get('/', (req, res) => {
  res.send('Life Tracking System API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
