import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FocusSession {
    taskId: string | null; // ID of task being focused on, or null for freestyle
    startTime: number; // Date.now()
    duration: number; // in seconds
    completed: boolean;
}

interface FocusStore {
    // Timer State
    isActive: boolean;
    isPaused: boolean;
    timeLeft: number; // seconds
    initialTime: number; // seconds
    activeTaskId: string | null;
    
    // Settings
    soundEnabled: boolean;
    soundType: 'rain' | 'forest' | 'white-noise' | 'none';
    
    // Actions
    startSession: (durationMinutes: number, taskId?: string | null) => void;
    pauseSession: () => void;
    resumeSession: () => void;
    stopSession: () => void; // Cancel
    completeSession: () => void; // Finished
    
    setSound: (type: 'rain' | 'forest' | 'white-noise' | 'none') => void;
    toggleSound: () => void;
    tick: () => void; // Call every second
}

export const useFocusStore = create<FocusStore>()(
  persist(
    (set, get) => ({
      isActive: false,
      isPaused: false,
      timeLeft: 25 * 60,
      initialTime: 25 * 60,
      activeTaskId: null,
      soundEnabled: false,
      soundType: 'none',

      startSession: (durationMinutes, taskId = null) => {
          const seconds = durationMinutes * 60;
          set({
              isActive: true,
              isPaused: false,
              timeLeft: seconds,
              initialTime: seconds,
              activeTaskId: taskId
          });
      },

      pauseSession: () => set({ isPaused: true }),
      resumeSession: () => set({ isPaused: false }),
      stopSession: () => set({ isActive: false, isPaused: false, activeTaskId: null }),
      
      completeSession: () => {
          // Here we could trigger a save to backend log
          set({ isActive: false, isPaused: false, activeTaskId: null });
      },

      setSound: (type) => set({ soundType: type }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      
      tick: () => {
          const { isActive, isPaused, timeLeft } = get();
          if (isActive && !isPaused && timeLeft > 0) {
              set({ timeLeft: timeLeft - 1 });
          } else if (isActive && !isPaused && timeLeft === 0) {
              // Timer finished
              get().completeSession();
          }
      }
    }),
    {
      name: 'focus-storage',
      partialize: (state) => ({ soundEnabled: state.soundEnabled, soundType: state.soundType }), // Only persist settings
    }
  )
);
