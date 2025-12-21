import { create } from 'zustand';
import api from '@/lib/axios';
import { useAuthStore } from './authStore';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  category?: { _id: string; name: string } | string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface TaskLog {
  _id: string;
  task: string; // task id
  date: string; // YYYY-MM-DD
  completed: boolean;
}

interface TaskState {
  tasks: Task[];
  logs: Record<string, boolean>; // Key: "taskId-date", Value: true (completed)
  isLoading: boolean;
  error: string | null;
  
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Omit<Task, '_id'>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  fetchLogs: (startDate: string, endDate: string) => Promise<void>;
  toggleLog: (taskId: string, date: string) => Promise<void>;
  
  // Metrics
  metrics: Record<string, DailyMetricsData>; // Key: date "YYYY-MM-DD"
  fetchMetrics: (startDate: string, endDate: string) => Promise<void>;
  updateMetric: (date: string, data: Partial<DailyMetricsData>) => Promise<void>;
  seedMetrics: () => Promise<void>;
}

export interface BodyMetrics {
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  forearms?: number;
  thighs?: number;
  calves?: number;
}

export interface Meal {
    id: string;
    name: string;
    calories: number;
    macros: { protein: number; carbs: number; fats: number };
}

export interface DailyMetricsData {
  weight: number;
  hp: number;
  calories?: number;
  water?: number;
  macros?: { protein: number; carbs: number; fats: number };
  body?: BodyMetrics;
  // Meal Segmentation
  meals?: {
      breakfast: Meal[];
      lunch: Meal[];
      dinner: Meal[];
      snacks: Meal[];
  };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  logs: {},
  metrics: {},
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/tasks');
      set({ tasks: response.data, isLoading: false });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch tasks' 
      });
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/tasks', taskData);
      
      set(state => ({ 
        tasks: [...state.tasks, response.data],
        isLoading: false 
      }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to create task' 
      });
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      
      set(state => ({ 
        tasks: state.tasks.map(t => t._id === id ? response.data : t),
        isLoading: false 
      }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to update task' 
      });
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/tasks/${id}`);
      
      set(state => ({ 
        tasks: state.tasks.filter(t => t._id !== id),
        isLoading: false 
      }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to delete task' 
      });
      throw error;
    }
  },

  fetchLogs: async (startDate, endDate) => {
    try {
      const response = await api.get(`/tasks/logs?startDate=${startDate}&endDate=${endDate}`);
      
      const logsMap: Record<string, boolean> = {};
      response.data.forEach((log: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          logsMap[`${log.task}-${log.date}`] = true;
      });

      set({ logs: logsMap });
    } catch (error) {
      console.error('Failed to fetch logs', error);
    }
  },

  toggleLog: async (taskId, date) => {
    const key = `${taskId}-${date}`;
    // Optimistic update
    const currentLogs = get().logs;
    const isCompleted = !!currentLogs[key];
    
    const newLogs = { ...currentLogs };
    if (isCompleted) {
        delete newLogs[key];
    } else {
        newLogs[key] = true;
    }
    set({ logs: newLogs });

    try {
      const response = await api.post('/tasks/logs', { taskId, date });
      
      // Update User XP/Level if returned
      if (response.data.xp !== undefined) {
          useAuthStore.getState().updateUser({ 
              xp: response.data.xp, 
              level: response.data.level 
          });
      }
    } catch (error) {
      // Revert on error
      set({ logs: currentLogs });
      console.error('Failed to toggle log', error);
      throw error;
    }
  },

  fetchMetrics: async (startDate, endDate) => {
    try {
      const response = await api.get(`/metrics?startDate=${startDate}&endDate=${endDate}`);
      
      const metricsMap: Record<string, DailyMetricsData> = {};
      response.data.forEach((m: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          metricsMap[m.date] = { 
              weight: m.weight, 
              hp: m.hp,
              calories: m.calories,
              water: m.water,
              macros: m.macros,
              body: m.body,
              meals: m.meals
          };
      });

      set({ metrics: metricsMap });
    } catch (error) {
      console.error('Failed to fetch metrics', error);
    }
  },

  updateMetric: async (date, data) => {
    const currentMetrics = get().metrics;
    const currentDay = currentMetrics[date] || { weight: 0, hp: 0 };
    
    const newMetrics = { 
        ...currentMetrics,
        [date]: { ...currentDay, ...data }
    };
    set({ metrics: newMetrics });

    try {
      await api.post('/metrics', { date, ...data });
    } catch (error) {
      set({ metrics: currentMetrics });
      console.error('Failed to update metric', error);
    }
  },

  seedMetrics: async () => {
      try {
        await api.post('/metrics/seed', {});
      } catch (error) {
         console.error('Failed to seed', error); 
      }
  }
}));
