import { create } from 'zustand';
import api from '@/lib/axios';
import { useAuthStore } from './authStore';

export interface ExerciseSet {
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
}

export interface Exercise {
  _id?: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface Workout {
  _id: string;
  user: string;
  name: string;
  date: string;
  duration: number;
  exercises: Exercise[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Routine {
    _id: string;
    user: string;
    name: string;
    days: string[]; // ['Mon', 'Fri']
    exercises: Exercise[];
    notes?: string;
    isActive: boolean;
}

interface WorkoutState {
  workouts: Workout[];
  routines: Routine[];
  isLoading: boolean;
  error: string | null;
  
  fetchWorkouts: () => Promise<void>;
  createWorkout: (workout: Partial<Workout>) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;

  fetchRoutines: () => Promise<void>;
  createRoutine: (routine: Partial<Routine>) => Promise<void>;
  updateRoutine: (id: string, routine: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  seedRoutines: () => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  workouts: [],
  routines: [],
  isLoading: false,
  error: null,

  fetchWorkouts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/workouts');
      set({ workouts: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch workouts',
        isLoading: false 
      });
    }
  },

  createWorkout: async (workoutData: Partial<Workout>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/workouts', workoutData);
      set(state => ({ 
        workouts: [response.data, ...state.workouts],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create workout',
        isLoading: false 
      });
      throw error;
    }
  },

  updateWorkout: async (id: string, workoutData: Partial<Workout>) => {
    set({ isLoading: true, error: null });
    try {
        const response = await api.put(`/workouts/${id}`, workoutData);
        set(state => ({ 
          workouts: state.workouts.map(w => w._id === id ? response.data : w),
          isLoading: false 
        }));
      } catch (error: any) {
        set({ 
          error: error.response?.data?.message || 'Failed to update workout',
          isLoading: false 
        });
        throw error;
      }
  },

  deleteWorkout: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/workouts/${id}`);
      set(state => ({ 
        workouts: state.workouts.filter(w => w._id !== id),
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete workout',
        isLoading: false 
      });
    }
  },

  fetchRoutines: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get('/routines');
        set({ routines: response.data, isLoading: false });
      } catch (error: any) {
        set({ 
          error: error.response?.data?.message || 'Failed to fetch routines',
          isLoading: false 
        });
      }
  },

  createRoutine: async (routineData: Partial<Routine>) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.post('/routines', routineData);
        set(state => ({ 
          routines: [...state.routines, response.data],
          isLoading: false 
        }));
      } catch (error: any) {
        set({ 
          error: error.response?.data?.message || 'Failed to create routine',
          isLoading: false 
        });
        throw error;
      }
  },

  updateRoutine: async (id: string, routineData: Partial<Routine>) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.put(`/routines/${id}`, routineData);
        set(state => ({ 
          routines: state.routines.map(r => r._id === id ? response.data : r),
          isLoading: false 
        }));
      } catch (error: any) {
        set({ 
          error: error.response?.data?.message || 'Failed to update routine',
          isLoading: false 
        });
        throw error;
      }
  },

  deleteRoutine: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        await api.delete(`/routines/${id}`);
        set(state => ({ 
          routines: state.routines.filter(r => r._id !== id),
          isLoading: false 
        }));
      } catch (error: any) {
        set({ 
          error: error.response?.data?.message || 'Failed to delete routine',
          isLoading: false 
        });
      }
  },

  seedRoutines: async () => {
      set({ isLoading: true, error: null });
      try {
        await api.post('/routines/seed', {});
        // Refresh routines
        const response = await api.get('/routines');
        set({ routines: response.data, isLoading: false });
      } catch (error: any) {
        set({ 
          error: error.response?.data?.message || 'Failed to seed routines',
          isLoading: false 
        });
      }
  }
}));
