import { create } from "zustand";
import { persist } from "zustand/middleware";

type AtmosphereMode = "focus" | "energy" | "zen";

interface AtmosphereStore {
  mode: AtmosphereMode;
  setMode: (mode: AtmosphereMode) => void;
}

export const useAtmosphereStore = create<AtmosphereStore>()(
  persist(
    (set) => ({
      mode: "focus",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "atmosphere-storage",
    }
  )
);
