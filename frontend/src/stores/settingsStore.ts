import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY';

interface SettingsState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),
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
