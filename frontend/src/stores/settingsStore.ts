import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY';

interface SettingsState {
  currency: Currency;
  notifications: boolean;
  sound: boolean;
  weekStart: 'sunday' | 'monday';
  setCurrency: (currency: Currency) => void;
  setWeekStart: (start: 'sunday' | 'monday') => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      notifications: true,
      sound: true,
      weekStart: 'sunday',
      setCurrency: (currency) => set({ currency }),
      setWeekStart: (weekStart) => set({ weekStart }),
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
      toggleSound: () => set((state) => ({ sound: !state.sound })),
    }),
    {
      name: 'settings-storage',
    }
  )
);

export const getCurrencySymbol = (currency: Currency) => {
    switch(currency) {
        case 'USD': return '$';
        case 'INR': return '₹';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'JPY': return '¥';
        default: return '$';
    }
};

export const formatCurrencyValue = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: currency,
        currencyDisplay: 'symbol'
    }).format(amount);
};
