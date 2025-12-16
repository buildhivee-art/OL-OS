import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:5000/api/v1/tasks';

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
  createTask: (taskData: any) => Promise<void>;
  updateTask: (id: string, taskData: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  fetchLogs: (startDate: string, endDate: string) => Promise<void>;
  toggleLog: (taskId: string, date: string) => Promise<void>;
  
  // Metrics
  metrics: Record<string, { weight: number; hp: number }>; // Key: date "YYYY-MM-DD"
  fetchMetrics: (startDate: string, endDate: string) => Promise<void>;
  updateMetric: (date: string, data: { weight?: number; hp?: number }) => Promise<void>;
  seedMetrics: () => Promise<void>;
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
      const token = useAuthStore.getState().token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(API_URL, config);
      set({ tasks: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch tasks' 
      });
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(API_URL, taskData, config);
      
      set(state => ({ 
        tasks: [...state.tasks, response.data],
        isLoading: false 
      }));
    } catch (error: any) {
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
      const token = useAuthStore.getState().token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(`${API_URL}/${id}`, taskData, config);
      
      set(state => ({ 
        tasks: state.tasks.map(t => t._id === id ? response.data : t),
        isLoading: false 
      }));
    } catch (error: any) {
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
      const token = useAuthStore.getState().token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`${API_URL}/${id}`, config);
      
      set(state => ({ 
        tasks: state.tasks.filter(t => t._id !== id),
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to delete task' 
      });
      throw error;
    }
  },

  fetchLogs: async (startDate, endDate) => {
    // Don't set global loading true as this might be background or part of main load
    try {
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_URL}/logs?startDate=${startDate}&endDate=${endDate}`, config);
      
      const logsMap: Record<string, boolean> = {};
      response.data.forEach((log: any) => {
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
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(`${API_URL}/logs`, { taskId, date }, config);
      
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
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // We need to define API_URL specifically for metrics or reuse base
      // Assuming metrics route is at /api/v1/metrics
      // To fix this cleanly, I should probably split the store or have a base API url const.
      // I'll just hardcode the metrics endpoint relative to base for now.
      const METRICS_URL = 'http://localhost:5000/api/v1/metrics';
      
      const response = await axios.get(`${METRICS_URL}?startDate=${startDate}&endDate=${endDate}`, config);
      
      const metricsMap: Record<string, { weight: number; hp: number }> = {};
      response.data.forEach((m: any) => {
          metricsMap[m.date] = { weight: m.weight, hp: m.hp };
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
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const METRICS_URL = 'http://localhost:5000/api/v1/metrics';
      
      await axios.post(METRICS_URL, { date, ...data }, config);
    } catch (error) {
      set({ metrics: currentMetrics });
      console.error('Failed to update metric', error);
    }
  },

  seedMetrics: async () => {
      try {
        const token = useAuthStore.getState().token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const METRICS_URL = 'http://localhost:5000/api/v1/metrics';
        await axios.post(`${METRICS_URL}/seed`, {}, config);
        // Maybe refresh after seeding
      } catch (error) {
         console.error('Failed to seed', error); 
      }
  }
}));
