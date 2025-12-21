import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/finance`;

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

export interface Goal {
    _id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    color: string;
    isCompleted: boolean;
}

export interface Budget {
    _id: string;
    category: string;
    limit: number;
    period: string;
}

interface FinanceState {
  transactions: Transaction[];
  debts: Debt[];
  goals: Goal[];
  budgets: Budget[];
  summary: Summary;
  isLoading: boolean;
  error: string | null;

  fetchTransactions: () => Promise<void>;
  fetchDebts: () => Promise<void>;
  fetchGoals: () => Promise<void>;
  fetchBudgets: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  
  addTransaction: (data: Partial<Transaction>) => Promise<void>;
  addDebt: (data: Partial<Debt>) => Promise<void>;
  addGoal: (data: Partial<Goal>) => Promise<void>;
  addBudget: (data: Partial<Budget>) => Promise<void>;
  
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  toggleDebt: (id: string) => Promise<void>;
  
  deleteTransaction: (id: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  debts: [],
  goals: [],
  budgets: [],
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

  fetchGoals: async () => {
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(`${API_URL}/goals`, config);
          set({ goals: response.data });
      } catch (error: any) {
          console.error('Failed to fetch goals', error);
      }
  },

  fetchBudgets: async () => {
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(`${API_URL}/budgets`, config);
          set({ budgets: response.data });
      } catch (error: any) {
          console.error('Failed to fetch budgets', error);
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

  addTransaction: async (data: Partial<Transaction>) => {
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
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        set({ isLoading: false, error: error.message });
    }
  },

  addDebt: async (data: Partial<Debt>) => {
      set({ isLoading: true });
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.post(`${API_URL}/debts`, data, config);
          
          set(state => ({
              debts: [response.data, ...state.debts],
              isLoading: false
          }));
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
          set({ isLoading: false, error: error.message });
      }
  },

  addGoal: async (data: Partial<Goal>) => {
      set({ isLoading: true });
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.post(`${API_URL}/goals`, data, config);
          
          set(state => ({
              goals: [...state.goals, response.data],
              isLoading: false
          }));
      } catch (error: any) {
          set({ isLoading: false, error: error.message });
      }
  },

  addBudget: async (data: Partial<Budget>) => {
      set({ isLoading: true });
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.post(`${API_URL}/budgets`, data, config);
          
          set(state => ({
              budgets: [...state.budgets, response.data],
              isLoading: false
          }));
      } catch (error: any) {
          set({ isLoading: false, error: error.message });
      }
  },

  updateGoal: async (id, data) => {
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.put(`${API_URL}/goals/${id}`, data, config);
          
          set(state => ({
              goals: state.goals.map(g => g._id === id ? response.data : g)
          }));
      } catch (error: any) {
          console.error('Failed to update goal', error);
      }
  },

  toggleDebt: async (id: string) => {
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.put(`${API_URL}/debts/${id}`, {}, config);
          
          set(state => ({
              debts: state.debts.map(d => d._id === id ? response.data : d)
          }));
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
          console.error('Failed to toggle debt', error);
      }
  },

  deleteTransaction: async (id: string) => {
    try {
        const token = useAuthStore.getState().token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_URL}/${id}`, config);
        
        set(state => ({
            transactions: state.transactions.filter(t => t._id !== id)
        }));
        await get().fetchSummary(); 
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Failed to delete', error);
    }
  },

  deleteDebt: async (id: string) => {
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.delete(`${API_URL}/debts/${id}`, config);
          
          set(state => ({
              debts: state.debts.filter(d => d._id !== id)
          }));
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
          console.error('Failed to delete debt', error);
      }
  },

  deleteGoal: async (id: string) => {
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.delete(`${API_URL}/goals/${id}`, config);
          
          set(state => ({
              goals: state.goals.filter(g => g._id !== id)
          }));
      } catch (error: any) {
          console.error('Failed to delete goal', error);
      }
  },

  deleteBudget: async (id: string) => {
      try {
          const token = useAuthStore.getState().token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.delete(`${API_URL}/budgets/${id}`, config);
          
          set(state => ({
              budgets: state.budgets.filter(b => b._id !== id)
          }));
      } catch (error: any) {
          console.error('Failed to delete budget', error);
      }
  }
}));
