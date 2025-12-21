'use client';

import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore, formatCurrencyValue } from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FinanceNav } from '@/components/FinanceNav';
import { 
    TrendingUp, TrendingDown, Banknote, ArrowUpRight, ArrowDownLeft,
    Plus, Activity, Zap
} from 'lucide-react';
import { format, subMonths, isSameMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
    AreaChart, Area, XAxis, YAxis, Legend 
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FinanceOverviewPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { currency } = useSettingsStore(); 
  const { 
      transactions, summary, 
      fetchTransactions, fetchSummary, 
      addTransaction,
      isLoading 
  } = useFinanceStore();
  
  const router = useRouter();

  // Quick Add Transaction State
  const [isTransOpen, setIsTransOpen] = useState(false);
  const [transForm, setTransForm] = useState({ type: 'expense' as 'income'|'expense', amount: '', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });

  useEffect(() => {
    if (useAuthStore.getState().isHydrated && !isAuthenticated) {
        router.push('/login');
    } else if (isAuthenticated) {
        fetchTransactions();
        fetchSummary();
    }
  }, [isAuthenticated, fetchTransactions, fetchSummary]);

  const handleTransSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await addTransaction({ ...transForm, amount: Number(transForm.amount) });
      setIsTransOpen(false);
      setTransForm({ ...transForm, amount: '', description: '', category: '' });
  };

  // Stats
  const stats = useMemo(() => {
     const categoryMap: Record<string, number> = {};
     transactions.filter(t => t.type === 'expense').forEach(t => {
         categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
     });
     const expenseData = Object.keys(categoryMap).map(k => ({ name: k, value: categoryMap[k] }));

     const monthlyData = [];
     for(let i=5; i>=0; i--) {
        const d = subMonths(new Date(), i);
        const income = transactions.filter(t => t.type === 'income' && isSameMonth(new Date(t.date), d)).reduce((a,b) => a+b.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense' && isSameMonth(new Date(t.date), d)).reduce((a,b) => a+b.amount, 0);
        monthlyData.push({ name: format(d, 'MMM'), Income: income, Expense: expense });
     }
     
     // Health Score (Mock Logic)
     // 1. Savings Rate: (Income - Expense) / Income
     const totalInc = monthlyData.reduce((a,b) => a + b.Income, 0);
     const totalExp = monthlyData.reduce((a,b) => a + b.Expense, 0);
     const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc) * 100 : 0;
     let score = 50; // Base
     if (savingsRate > 20) score += 20;
     if (savingsRate > 50) score += 10;
     if (summary.balance > 0) score += 10;
     if (summary.totalExpense < summary.totalIncome) score += 10;
     
     return { expenseData, monthlyData, healthScore: Math.min(100, Math.max(0, Math.round(score))) };
  }, [transactions, summary]);

  const formatMoney = (amount: number) => formatCurrencyValue(amount, currency);
  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <FinanceNav />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-600 dark:from-amber-200 dark:to-yellow-500">
                    Wealth Command
                </h1>
                <p className="text-muted-foreground font-medium">Overview of your financial ecosystem.</p>
            </div>
            
            <Dialog open={isTransOpen} onOpenChange={setIsTransOpen}>
                <DialogTrigger asChild>
                    <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                        <Plus className="mr-2 h-5 w-5" /> Quick Transaction
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Transaction</DialogTitle></DialogHeader>
                    <form onSubmit={handleTransSubmit} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button type="button" variant={transForm.type === 'expense' ? 'destructive' : 'outline'} onClick={() => setTransForm({...transForm, type: 'expense'})}>Expense</Button>
                            <Button type="button" variant={transForm.type === 'income' ? 'default' : 'outline'} className={transForm.type === 'income' ? 'bg-emerald-600' : ''} onClick={() => setTransForm({...transForm, type: 'income'})}>Income</Button>
                        </div>
                        <div className="space-y-2"><Label>Amount</Label><Input type="number" step="0.01" required value={transForm.amount} onChange={e => setTransForm({...transForm, amount: e.target.value})} className="text-xl font-bold font-mono" /></div>
                        <div className="space-y-2"><Label>Category</Label><Input value={transForm.category} onChange={e => setTransForm({...transForm, category: e.target.value})} placeholder="e.g. Food" /></div>
                        <div className="space-y-2"><Label>Description</Label><Input value={transForm.description} onChange={e => setTransForm({...transForm, description: e.target.value})} className="font-mono" /></div>
                        <div className="space-y-2"><Label>Date</Label><Input type="date" value={transForm.date} onChange={e => setTransForm({...transForm, date: e.target.value})} /></div>
                        <Button type="submit" className="w-full font-bold">Save Record</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        {/* FINANCIAL HEALTH & STATUS */}
        <div className="grid gap-6 md:grid-cols-3">
             <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white border-zinc-800 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Banknote className="w-32 h-32" /></div>
                 <CardHeader>
                     <CardTitle className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Net Cash Balance</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <div className="text-6xl font-black tracking-tighter">{formatMoney(summary.balance)}</div>
                     <div className="flex gap-6 mt-6">
                         <div className="flex items-center gap-2">
                             <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-500"><ArrowDownLeft className="w-4 h-4"/></div>
                             <div>
                                 <div className="text-xs text-zinc-400 uppercase font-bold">Income</div>
                                 <div className="text-lg font-bold text-emerald-400">{formatMoney(summary.totalIncome)}</div>
                             </div>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className="p-2 bg-red-500/20 rounded-full text-red-500"><ArrowUpRight className="w-4 h-4"/></div>
                             <div>
                                 <div className="text-xs text-zinc-400 uppercase font-bold">Expense</div>
                                 <div className="text-lg font-bold text-red-400">{formatMoney(summary.totalExpense)}</div>
                             </div>
                         </div>
                     </div>
                 </CardContent>
             </Card>

             <Card className="bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                 <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-base">
                         <Activity className="w-5 h-5 text-blue-500" /> Financial Health
                     </CardTitle>
                 </CardHeader>
                 <CardContent className="flex flex-col items-center justify-center flex-grow">
                     <div className="relative flex items-center justify-center w-32 h-32">
                         <svg className="w-full h-full transform -rotate-90">
                             <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-200 dark:text-zinc-800" />
                             <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={350} strokeDashoffset={350 - (350 * stats.healthScore) / 100} className={cn("transition-all duration-1000 ease-out", stats.healthScore > 70 ? "text-emerald-500" : stats.healthScore > 40 ? "text-amber-500" : "text-red-500")} />
                         </svg>
                         <div className="absolute inset-0 flex items-center justify-center">
                             <span className="text-3xl font-black">{stats.healthScore}</span>
                         </div>
                     </div>
                     <p className="text-sm text-muted-foreground mt-4 font-medium text-center">
                         {stats.healthScore > 70 ? "Excellent. Keep compounding." : stats.healthScore > 40 ? "Stable. Room for optimization." : "Attention needed."}
                     </p>
                 </CardContent>
             </Card>
        </div>

        {/* CHARTS ROW */}
        <div className="grid gap-6 md:grid-cols-2">
             <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                 <CardHeader className="pb-2">
                     <CardTitle className="text-base font-bold flex items-center gap-2">
                         <TrendingUp className="w-4 h-4 text-emerald-500"/> Cash Flow Trend
                     </CardTitle>
                 </CardHeader>
                 <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.monthlyData}>
                            <defs>
                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                            </defs>
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={val => `${val/1000}k`} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#000', borderRadius: '8px', border: 'none' }} itemStyle={{ color: '#fff' }} />
                            <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} />
                            <Area type="monotone" dataKey="Expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                 </CardContent>
             </Card>

             <Card className="border-zinc-200 dark:border-zinc-800">
                 <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                         <Zap className="w-4 h-4 text-amber-500"/> Allocation
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={stats.expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {stats.expenseData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#000', borderRadius: '8px', border: 'none' }} itemStyle={{ color: '#fff' }} formatter={(val: number | undefined) => formatMoney(val || 0)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                 </CardContent>
             </Card>
        </div>

        {/* RECENT ACTIVITY */}
        <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader><CardTitle className="text-lg">Recent Transactions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {transactions.slice(0, 5).map(t => (
                    <div key={t._id} className="flex items-center justify-between group p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-2 h-10 rounded-full", t.type === 'income' ? 'bg-emerald-500' : 'bg-red-500')} />
                            <div>
                                <div className="font-bold text-sm">{t.description || t.category}</div>
                                <div className="text-xs text-muted-foreground">{format(parseISO(t.date), 'MMM dd')} • {t.category}</div>
                            </div>
                        </div>
                        <div className={cn("font-mono font-bold text-lg", t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                            {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
  );
}
