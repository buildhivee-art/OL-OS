import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:5000/api/v1/finance';

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description?: string;
}

export interface Debt {
    _id: string;
    type: 'payable' | 'receivable'; // payable = I owe, receivable = They owe me
    person: string;
    amount: number;
    dueDate?: string;
    isSettled: boolean;
    notes?: string;
}

interface Summary {
    balance: number;
    totalIncome: number;
    totalExpense: number;
}

interface FinanceState {
  transactions: Transaction[];
  debts: Debt[];
  summary: Summary;
  isLoading: boolean;
  error: string | null;

  fetchTransactions: () => Promise<void>;
  fetchDebts: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  addTransaction: (data: Partial<Transaction>) => Promise<void>;
  addDebt: (data: Partial<Debt>) => Promise<void>;
  toggleDebt: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  debts: [],
  summary: { balance: 0, totalIncome: 0, totalExpense: 0 },
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
        const token = useAuthStore.getState().token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(API_URL, config);
        set({ transactions: response.data, isLoading: false });
    } catch (error: any) {
        set({ isLoading: false, error: error.message });
    }
  },

  fetchDebts: async () => {
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(`${API_URL}/debts`, config);
          set({ debts: response.data });
      } catch (error: any) {
          console.error('Failed to fetch debts', error);
      }
  },

  fetchSummary: async () => {
    try {
        const token = useAuthStore.getState().token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${API_URL}/summary`, config);
        set({ summary: response.data });
    } catch (error: any) {
        console.error('Failed to fetch summary', error);
    }
  },

  addTransaction: async (data) => {
    set({ isLoading: true });
    try {
        const token = useAuthStore.getState().token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(API_URL, data, config);
        
        set(state => ({
            transactions: [response.data, ...state.transactions],
            isLoading: false
        }));
        await get().fetchSummary(); 
    } catch (error: any) {
        set({ isLoading: false, error: error.message });
    }
  },

  addDebt: async (data) => {
      set({ isLoading: true });
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.post(`${API_URL}/debts`, data, config);
          
          set(state => ({
              debts: [response.data, ...state.debts],
              isLoading: false
          }));
      } catch (error: any) {
          set({ isLoading: false, error: error.message });
      }
  },

  toggleDebt: async (id) => {
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.put(`${API_URL}/debts/${id}`, {}, config);
          
          set(state => ({
              debts: state.debts.map(d => d._id === id ? response.data : d)
          }));
      } catch (error: any) {
          console.error('Failed to toggle debt', error);
      }
  },

  deleteTransaction: async (id) => {
    try {
        const token = useAuthStore.getState().token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_URL}/${id}`, config);
        
        set(state => ({
            transactions: state.transactions.filter(t => t._id !== id)
        }));
        await get().fetchSummary(); 
    } catch (error: any) {
        console.error('Failed to delete', error);
    }
  },

  deleteDebt: async (id) => {
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.delete(`${API_URL}/debts/${id}`, config);
          
          set(state => ({
              debts: state.debts.filter(d => d._id !== id)
          }));
      } catch (error: any) {
          console.error('Failed to delete debt', error);
      }
  }
}));
