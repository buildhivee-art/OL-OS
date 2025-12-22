import { create } from 'zustand';
import api from '@/lib/axios';
import { useAuthStore } from './authStore';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

export interface Link {
  _id: string;
  source: string;
  target: string;
  type: 'relates_to' | 'blocks' | 'subtask_of';
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  category?: { _id: string; name: string } | string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  startDate: string;
  endDate?: string;
  active: boolean;
  status?: 'todo' | 'in-progress' | 'completed';
  links?: Link[];
}

export interface TaskLog {
  _id: string;
  task: string; // task id
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Micros {
    magnesium: number;
    calcium: number;
    vitaminD: number;
    zinc: number;
    iron: number;
    potassium: number;
    vitaminC: number;
}

export interface Food {
    _id: string;
    name: string;
    calories: number;
    servingSize: { amount: number; unit: string };
    macros: { protein: number; carbs: number; fats: number };
    micros?: Micros;
    category?: string;
    tags?: string[];
}

export interface Meal {
    id: string;
    name: string; // food name or meal name
    calories: number;
    macros: { protein: number; carbs: number; fats: number };
    micros?: Micros; 
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

export interface DailyMetricsData {
  weight: number;
  hp: number;
  calories?: number;
  water?: number;
  macros?: { protein: number; carbs: number; fats: number };
  micros?: Micros;
  body?: BodyMetrics;
  meals?: {
      breakfast: Meal[];
      lunch: Meal[];
      dinner: Meal[];
      snacks: Meal[];
  };
  supplements?: { id: string; name: string; taken: boolean }[];
}

interface TaskState {
  tasks: Task[];
  logs: Record<string, boolean>; // Key: "taskId-date", Value: true (completed)
  isLoading: boolean;
  error: string | null;
  
  // Tasks
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Omit<Task, '_id'>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  fetchLogs: (startDate: string, endDate: string) => Promise<void>;
  toggleLog: (taskId: string, date: string) => Promise<void>;
  
  // Metrics & Nutrition
  metrics: Record<string, DailyMetricsData>; // Key: date "YYYY-MM-DD"
  foods: Food[];
  fetchMetrics: (startDate: string, endDate: string) => Promise<void>;
  updateMetric: (date: string, data: Partial<DailyMetricsData>) => Promise<void>;
  seedMetrics: () => Promise<void>;

  // Inventory
  fetchFoods: () => Promise<void>;
  createFood: (food: Partial<Food>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  logs: {},
  metrics: {},
  foods: [],
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
              micros: m.micros,
              body: m.body,
              meals: m.meals,
              supplements: m.supplements
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
  },

  // Inventory Management
  fetchFoods: async () => {
      try {
          const response = await api.get('/foods');
          set({ foods: response.data });
      } catch (error) {
          console.error("Failed to fetch foods", error);
      }
  },

  createFood: async (food) => {
      try {
          const response = await api.post('/foods', food);
          set(state => ({ foods: [...state.foods, response.data] }));
      } catch (error) {
          console.error("Failed to create food", error);
          throw error;
      }
  },

  deleteFood: async (id) => {
      try {
          await api.delete(`/foods/${id}`);
          set(state => ({ foods: state.foods.filter(f => f._id !== id) }));
      } catch (error) {
          console.error("Failed to delete food", error);
          throw error;
      }
  }

}));
