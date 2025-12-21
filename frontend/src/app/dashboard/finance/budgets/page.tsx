'use client';

import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore, formatCurrencyValue, getCurrencySymbol } from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FinanceNav } from '@/components/FinanceNav';
import { Plus, Trash2, PiggyBank, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { isSameMonth, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';

export default function FinanceBudgetsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { currency } = useSettingsStore();
  const { 
      budgets, transactions, fetchBudgets, fetchTransactions, addBudget, deleteBudget,
  } = useFinanceStore();
  const router = useRouter();

  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ category: '', limit: '' });

  useEffect(() => {
    if (useAuthStore.getState().isHydrated && !isAuthenticated) {
        router.push('/login');
    } else if (isAuthenticated) {
        fetchBudgets();
        fetchTransactions();
    }
  }, [isAuthenticated, fetchBudgets, fetchTransactions]);

  const handleBudgetSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await addBudget({ category: budgetForm.category, limit: Number(budgetForm.limit), period: 'monthly' });
      setIsBudgetOpen(false);
      setBudgetForm({ category: '', limit: '' });
  };

  const spendingMap = useMemo(() => {
     const currentMonthSpending: Record<string, number> = {};
     const now = new Date();
     transactions.filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), now)).forEach(t => {
         const cat = t.category.toLowerCase();
         currentMonthSpending[cat] = (currentMonthSpending[cat] || 0) + t.amount;
     });
     return currentMonthSpending;
  }, [transactions]);

  const formatMoney = (amount: number) => formatCurrencyValue(amount, currency);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <FinanceNav />
        
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase">Monthly Budgets</h1>
                <p className="text-muted-foreground">Control your spending in key areas.</p>
            </div>
            <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                        <Plus className="w-4 h-4 mr-2"/> Set Budget
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Set Category Budget</DialogTitle></DialogHeader>
                    <form onSubmit={handleBudgetSubmit} className="space-y-4">
                        <div className="space-y-2"><Label>Category</Label><Input value={budgetForm.category} onChange={e => setBudgetForm({...budgetForm, category: e.target.value})} required placeholder="e.g. Food" /></div>
                        <div className="space-y-2"><Label>Monthly Limit ({getCurrencySymbol(currency)})</Label><Input type="number" required value={budgetForm.limit} onChange={e => setBudgetForm({...budgetForm, limit: e.target.value})} /></div>
                        <Button type="submit" className="w-full">Set Budget</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {budgets.length === 0 && (
                 <div className="col-span-full py-10 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                     <PiggyBank className="w-12 h-12 mb-4 opacity-20" />
                     <p>No budgets set yet. Create one to start tracking.</p>
                 </div>
             )}
             {budgets.map(budget => {
                  const spent = spendingMap[budget.category.toLowerCase()] || 0;
                  const percent = Math.min(100, (spent / budget.limit) * 100);
                  const isOver = spent > budget.limit;
                  const remaining = budget.limit - spent;
                  
                  return (
                      <Card key={budget._id} className={cn("border-l-4 transition-all hover:shadow-lg", isOver ? "border-l-red-500 bg-red-50/50 dark:bg-red-950/10" : "border-l-emerald-500 bg-card")}>
                          <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-3">
                                      <div className={cn("p-2 rounded-full", isOver ? "bg-red-100 dark:bg-red-900/30 text-red-500" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500")}>
                                          {isOver ? <AlertTriangle className="w-5 h-5"/> : <PiggyBank className="w-5 h-5"/>}
                                      </div>
                                      <div>
                                          <h3 className="font-black text-lg">{budget.category}</h3>
                                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Limit</p>
                                      </div>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => deleteBudget(budget._id)}><Trash2 className="w-4 h-4 text-muted-foreground/50 hover:text-red-500"/></Button>
                              </div>
                              
                              <div className="space-y-4">
                                  <div className="flex items-end justify-between">
                                      <div className="text-2xl font-black">{formatMoney(spent)}</div>
                                      <div className="text-sm font-medium text-muted-foreground">of {formatMoney(budget.limit)}</div>
                                  </div>
                                  
                                  <Progress value={percent} className="h-3 bg-zinc-100 dark:bg-zinc-800" indicatorClassName={cn(isOver ? "bg-red-500" : "bg-emerald-500")} />
                                  
                                  <div className="flex justify-between text-xs font-bold pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 mt-4">
                                      <span className={cn(isOver ? "text-red-500" : "text-emerald-500")}>{isOver ? 'Over Budget' : 'Remaining'}</span>
                                      <span className={cn(isOver ? "text-red-500" : "text-emerald-500")}>{isOver ? `+${formatMoney(spent - budget.limit)}` : formatMoney(remaining)}</span>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  )
             })}
         </div>
    </div>
  );
}
