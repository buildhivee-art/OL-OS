import { create } from 'zustand';
import api from '@/lib/axios';
import { useAuthStore } from './authStore';

export interface ContentItem {
  _id?: string;
  title: string;
  platform: 'twitter' | 'instagram' | 'youtube' | 'linkedin' | 'blog';
  type: 'tweet' | 'thread' | 'reel' | 'post' | 'video' | 'short' | 'story';
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'scheduled' | 'published';
  description?: string;
  script?: string;
  tags?: string[];
  scheduledDate?: string;
  publishedDate?: string;
}

interface ContentStore {
  contents: ContentItem[];
  isLoading: boolean;
  fetchContents: () => Promise<void>;
  createContent: (data: Partial<ContentItem>) => Promise<void>;
  updateContent: (id: string, data: Partial<ContentItem>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
}

export const useContentStore = create<ContentStore>((set) => ({
  contents: [],
  isLoading: false,

  fetchContents: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/content');
      set({ contents: response.data, isLoading: false });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Fetch contents error:', error);
      set({ isLoading: false });
    }
  },

  createContent: async (data: Partial<ContentItem>) => {
    try {
      const response = await api.post('/content', data);
      set((state) => ({ contents: [response.data, ...state.contents] }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Create content error:', error);
    }
  },

  updateContent: async (id: string, data: Partial<ContentItem>) => {
    try {
      const response = await api.put(`/content/${id}`, data);
      set((state) => ({
        contents: state.contents.map((c) => (c._id === id ? response.data : c)),
      }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Update content error:', error);
    }
  },

  deleteContent: async (id: string) => {
    try {
      await api.delete(`/content/${id}`);
      set((state) => ({
        contents: state.contents.filter((c) => c._id !== id),
      }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Delete content error:', error);
    }
  },
}));
