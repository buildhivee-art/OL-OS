'use client';

import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore, formatCurrencyValue } from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FinanceNav } from '@/components/FinanceNav';
import { Trash2, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function FinanceHistoryPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { currency } = useSettingsStore();
  const { 
      transactions, fetchTransactions, deleteTransaction
  } = useFinanceStore();
  const router = useRouter();

  useEffect(() => {
    if (useAuthStore.getState().isHydrated && !isAuthenticated) {
        router.push('/login');
    } else if (isAuthenticated) {
        fetchTransactions();
    }
  }, [isAuthenticated, fetchTransactions]);

  const formatMoney = (amount: number) => formatCurrencyValue(amount, currency);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <FinanceNav />
        
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase">Transaction History</h1>
                <p className="text-muted-foreground">Detailed log of all financial movements.</p>
            </div>
            <div className="relative w-64 hidden md:block">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search records..." className="pl-8" />
            </div>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader><CardTitle>Full Ledger</CardTitle></CardHeader>
            <CardContent className="space-y-1">
                {transactions.length === 0 && <p className="text-center py-10 text-muted-foreground">No transactions recorded.</p>}
                {transactions.map(t => (
                    <div key={t._id} className="flex items-center justify-between p-4 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group border-b last:border-0 border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-full", t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')}>
                                {t.type === 'income' ? <TrendingUp className="h-5 w-5"/> : <TrendingDown className="h-5 w-5"/>}
                            </div>
                            <div>
                                <p className="font-bold text-base">{t.description || t.category}</p>
                                <p className="text-xs text-muted-foreground">{t.category} • {format(parseISO(t.date), 'MMM dd, yyyy')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className={cn("font-bold font-mono text-lg", t.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500')}>
                                {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                            </span>
                            <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteTransaction(t._id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground/50 hover:text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
  );
}
