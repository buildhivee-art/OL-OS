import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface WeeklyLog {
    _id?: string;
    weekStartDate: string;
    title: string;
    content: string;
    mainFocus: string;
    wins: string[];
    lessons: string[];
    rating: number;
    energyLevel: number;
    goalsForNextWeek: string;
    mood: string;
}

interface WeeklyLogStore {
    logs: WeeklyLog[];
    currentLog: WeeklyLog | null;
    fetchLogs: () => Promise<void>;
    fetchLogByDate: (date: string) => Promise<void>;
    updateLog: (log: WeeklyLog) => Promise<void>;
}

export const useWeeklyLogStore = create<WeeklyLogStore>((set, get) => ({
    logs: [],
    currentLog: null,

    fetchLogs: async () => {
        try {
            const token = useAuthStore.getState().token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/weekly-logs`, config);
            set({ logs: response.data });
        } catch (error) {
            console.error('Fetch Logs Error', error);
        }
    },

    fetchLogByDate: async (date: string) => {
        try {
            const token = useAuthStore.getState().token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/weekly-logs/${date}`, config);
            set({ currentLog: response.data });
        } catch (error) {
            console.error('Fetch Log Error', error);
        }
    },

    updateLog: async (logData) => {
        try {
            const token = useAuthStore.getState().token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_URL}/weekly-logs`, logData, config);
            set({ currentLog: response.data });
            // Refresh list if needed
            get().fetchLogs();
        } catch (error) {
            console.error('Update Log Error', error);
            throw error;
        }
    }
}));
