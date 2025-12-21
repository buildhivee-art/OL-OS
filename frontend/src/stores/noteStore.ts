import { create } from 'zustand';
import api from '@/lib/axios';
import { useAuthStore } from './authStore';

export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color: string;
  updatedAt: string;
}

interface NoteState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  
  fetchNotes: () => Promise<void>;
  createNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notes');
      set({ notes: response.data, isLoading: false });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      set({ error: error.message, isLoading: false });
    }
  },

  createNote: async (noteData: Partial<Note>) => {
    try {
      const response = await api.post('/notes', noteData);
      set(state => ({ notes: [response.data, ...state.notes] }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
       console.error(error);
    }
  },

  updateNote: async (id: string, noteData: Partial<Note>) => {
    try {
      const response = await api.put(`/notes/${id}`, noteData);
      set(state => ({ 
        notes: state.notes.map(n => n._id === id ? response.data : n) 
      }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error(error);
    }
  },

  deleteNote: async (id: string) => {
    try {
      await api.delete(`/notes/${id}`);
      set(state => ({ 
        notes: state.notes.filter(n => n._id !== id) 
      }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error(error);
    }
  },
}));
