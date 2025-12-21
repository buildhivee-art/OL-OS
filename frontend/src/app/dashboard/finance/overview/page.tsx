'use client';

import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore, formatCurrencyValue } from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FinanceNav } from '@/components/FinanceNav';
import { 
    TrendingUp, TrendingDown, Banknote, ArrowUpRight, ArrowDownLeft,
    Plus, Activity, Zap, Wallet, CreditCard, Target, PiggyBank
} from 'lucide-react';
import { format, subMonths, isSameMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
    AreaChart, Area, XAxis, YAxis, Legend, BarChart, Bar 
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function FinanceOverviewPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { currency } = useSettingsStore(); 
  const { 
      transactions, summary, goals, 
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

  // Stats Logic
  const stats = useMemo(() => {
     const categoryMap: Record<string, number> = {};
     transactions.filter(t => t.type === 'expense').forEach(t => {
         categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
     });
     // Sort by value desc
     const expenseData = Object.keys(categoryMap)
        .map(k => ({ name: k, value: categoryMap[k] }))
        .sort((a,b) => b.value - a.value);

     const monthlyData = [];
     for(let i=5; i>=0; i--) {
        const d = subMonths(new Date(), i);
        const income = transactions.filter(t => t.type === 'income' && isSameMonth(new Date(t.date), d)).reduce((a,b) => a+b.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense' && isSameMonth(new Date(t.date), d)).reduce((a,b) => a+b.amount, 0);
        monthlyData.push({ name: format(d, 'MMM'), Income: income, Expense: expense, Net: income - expense });
     }
     
     // Metrics
     const totalInc = summary.totalIncome;
     const totalExp = summary.totalExpense;
     const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc) * 100 : 0;
     const burnRate = totalInc > 0 ? (totalExp / totalInc) * 100 : 0;
     
     return { expenseData, monthlyData, savingsRate, burnRate };
  }, [transactions, summary]);

  const formatMoney = (amount: number) => formatCurrencyValue(amount, currency);
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <FinanceNav />
        
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg text-black shadow-lg shadow-amber-500/20">
                        <Banknote className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">CFO Dashboard</h1>
                </div>
                <p className="text-muted-foreground font-medium pl-1">Financial surveillance and asset allocation.</p>
            </div>
            
            <Dialog open={isTransOpen} onOpenChange={setIsTransOpen}>
                <DialogTrigger asChild>
                    <Button size="lg" className="bg-white dark:bg-zinc-100 text-black font-bold shadow-xl hover:bg-zinc-200 transaction-all">
                        <Plus className="mr-2 h-5 w-5" /> Record Transaction
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Ledger Entry</DialogTitle></DialogHeader>
                    <form onSubmit={handleTransSubmit} className="space-y-5 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button type="button" size="lg" variant={transForm.type === 'expense' ? 'destructive' : 'outline'} onClick={() => setTransForm({...transForm, type: 'expense'})}>
                                <ArrowUpRight className="mr-2 w-4 h-4" /> Expense
                            </Button>
                            <Button type="button" size="lg" variant={transForm.type === 'income' ? 'default' : 'outline'} className={transForm.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : ''} onClick={() => setTransForm({...transForm, type: 'income'})}>
                                <ArrowDownLeft className="mr-2 w-4 h-4" /> Income
                            </Button>
                        </div>
                        <div className="space-y-2"><Label>Amount</Label><div className="relative"><span className="absolute left-3 top-2.5 text-muted-foreground font-bold">$</span><Input type="number" step="0.01" required value={transForm.amount} onChange={e => setTransForm({...transForm, amount: e.target.value})} className="pl-8 text-lg font-bold font-mono" /></div></div>
                        <div className="space-y-2"><Label>Category</Label><Input value={transForm.category} onChange={e => setTransForm({...transForm, category: e.target.value})} placeholder="e.g. Groceries, Salary, Tech" /></div>
                        <div className="space-y-2"><Label>Description</Label><Input value={transForm.description} onChange={e => setTransForm({...transForm, description: e.target.value})} className="font-mono" /></div>
                        <div className="space-y-2"><Label>Date</Label><Input type="date" value={transForm.date} onChange={e => setTransForm({...transForm, date: e.target.value})} /></div>
                        <Button type="submit" size="lg" className="w-full font-bold">Commit to Ledger</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        {/* METRIC CARDS */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
             {/* Net Balance */}
             <Card className="col-span-1 md:col-span-2 bg-zinc-950 text-white border-zinc-900 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5"><Wallet className="w-48 h-48" /></div>
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
                 <CardHeader className="pb-2">
                     <CardTitle className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Net Liquid Assets</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <div className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-lg">{formatMoney(summary.balance)}</div>
                     <div className="flex gap-8 mt-6">
                         <div className="flex items-center gap-3">
                             <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500 border border-emerald-500/20"><TrendingUp className="w-4 h-4"/></div>
                             <div>
                                 <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Inflow</div>
                                 <div className="text-xl font-bold text-emerald-400 font-mono">{formatMoney(summary.totalIncome)}</div>
                             </div>
                         </div>
                         <div className="flex items-center gap-3">
                             <div className="p-2 bg-red-500/10 rounded-full text-red-500 border border-red-500/20"><TrendingDown className="w-4 h-4"/></div>
                             <div>
                                 <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Outflow</div>
                                 <div className="text-xl font-bold text-red-400 font-mono">{formatMoney(summary.totalExpense)}</div>
                             </div>
                         </div>
                     </div>
                 </CardContent>
             </Card>

             {/* Savings Rate Gauge */}
             <Card className="bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
                 <CardHeader className="pb-2">
                     <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                         <PiggyBank className="w-4 h-4 text-emerald-500" /> Savings Rate
                     </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="flex items-end gap-2">
                         <span className={cn("text-4xl font-black tracking-tighter", stats.savingsRate > 20 ? "text-emerald-500" : "text-amber-500")}>
                             {stats.savingsRate.toFixed(1)}%
                         </span>
                         <span className="text-sm text-muted-foreground mb-1 font-medium">of income saved</span>
                     </div>
                     <Progress value={Math.min(100, Math.max(0, stats.savingsRate))} className="h-2" />
                     <p className="text-xs text-muted-foreground">
                         Target: 20%+. {stats.savingsRate > 20 ? "You are on track." : "Optimize spending to increase this."}
                     </p>
                 </CardContent>
             </Card>

             {/* Burn Rate */}
             <Card className="bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
                 <CardHeader className="pb-2">
                     <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                         <Zap className="w-4 h-4 text-red-500" /> Burn Velocity
                     </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="flex items-end gap-2">
                         <span className={cn("text-4xl font-black tracking-tighter", stats.burnRate > 90 ? "text-red-500" : "text-zinc-700 dark:text-zinc-300")}>
                             {stats.burnRate.toFixed(1)}%
                         </span>
                         <span className="text-sm text-muted-foreground mb-1 font-medium">utilization</span>
                     </div>
                     <Progress value={Math.min(100, Math.max(0, stats.burnRate))} className="h-2 bg-zinc-200 dark:bg-zinc-800" indicatorClassName={stats.burnRate > 90 ? "bg-red-500" : "bg-zinc-600"} />
                     <p className="text-xs text-muted-foreground">
                         {stats.burnRate > 100 ? "CRITICAL: Spending exceeds income." : "Operating within income parameters."}
                     </p>
                 </CardContent>
             </Card>
        </div>

        {/* ANALYTICS ROW */}
        <div className="grid gap-6 md:grid-cols-2">
             {/* Net Worth Area Chart */}
             <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                 <CardHeader>
                     <div className="flex items-center justify-between">
                         <CardTitle className="text-base font-bold flex items-center gap-2">
                             <TrendingUp className="w-4 h-4 text-emerald-500"/> Financial Trajectory
                         </CardTitle>
                         <div className="flex gap-2 text-xs">
                             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Income</div>
                             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Expense</div>
                         </div>
                     </div>
                 </CardHeader>
                 <CardContent className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                            </defs>
                            <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dy={10} />
                            <YAxis fontSize={11} axisLine={false} tickLine={false} tickFormatter={val => `${val/1000}k`} tick={{ fill: '#71717a' }} />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                                itemStyle={{ color: '#fff', fontSize: '12px' }} 
                                formatter={(val: number | undefined) => formatMoney(val || 0)}
                            />
                            <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} />
                            <Area type="monotone" dataKey="Expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                 </CardContent>
             </Card>

             {/* Expense Breakdown Pie */}
             <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                 <CardHeader>
                     <CardTitle className="text-base font-bold flex items-center gap-2">
                         <Target className="w-4 h-4 text-blue-500"/> Capital Allocation
                     </CardTitle>
                 </CardHeader>
                 <CardContent className="h-[300px] flex items-center justify-center relative">
                    {stats.expenseData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={stats.expenseData} 
                                    cx="50%" cy="50%" 
                                    innerRadius={80} 
                                    outerRadius={100} 
                                    paddingAngle={4} 
                                    dataKey="value"
                                    cornerRadius={4}
                                >
                                    {stats.expenseData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} 
                                    itemStyle={{ color: '#fff', fontSize: '12px' }} 
                                    formatter={(val: number | undefined) => formatMoney(val || 0)} 
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "12px", fontFamily: "monospace" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-muted-foreground text-sm">No expense data to analyze.</div>
                    )}
                 </CardContent>
             </Card>
        </div>

        {/* DATA FEED */}
        <div className="grid gap-6 md:grid-cols-3">
             {/* RECENT TRANSACTIONS */}
             <div className="md:col-span-2">
                 <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 h-full">
                     <CardHeader>
                        <CardTitle className=" text-base font-bold">Recent Ledger Activity</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-1 p-2">
                         {transactions.length > 0 ? transactions.slice(0, 7).map(t => (
                             <div key={t._id} className="flex items-center justify-between group p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                                 <div className="flex items-center gap-4">
                                     <div className={cn("w-10 h-10 rounded-full flex items-center justify-center opacity-80", t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')}>
                                         {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                     </div>
                                     <div>
                                         <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{t.description || t.category}</div>
                                         <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{format(parseISO(t.date), 'MMM dd')} • {t.category}</div>
                                     </div>
                                 </div>
                                 <div className={cn("font-mono font-bold", t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100')}>
                                     {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                                 </div>
                             </div>
                         )) : <div className="p-4 text-center text-muted-foreground text-sm">No transaction history found.</div>}
                     </CardContent>
                     {transactions.length > 0 && (
                         <CardFooter className="pt-2">
                             <Button variant="ghost" className="w-full text-xs" onClick={() => router.push('/dashboard/finance/history')}>View Full Ledger</Button>
                         </CardFooter>
                     )}
                 </Card>
             </div>

             {/* GOALS MINI WIDGET */}
             <div>
                 <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 h-full">
                     <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Target className="w-4 h-4 text-amber-500" /> Active Goals
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                         {goals.length > 0 ? goals.slice(0, 3).map(goal => (
                             <div key={goal._id} className="space-y-2">
                                 <div className="flex justify-between text-sm">
                                     <span className="font-medium">{goal.title}</span>
                                     <span className="text-muted-foreground text-xs">{formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)}</span>
                                 </div>
                                 <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-1.5" />
                             </div>
                         )) : (
                             <div className="text-center py-8">
                                 <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                     <Target className="w-6 h-6 text-zinc-400" />
                                 </div>
                                 <p className="text-sm text-muted-foreground mb-3">No financial targets set.</p>
                                 <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/finance/goals')}>Set Goal</Button>
                             </div>
                         )}
                     </CardContent>
                 </Card>
             </div>
        </div>
    </div>
  );
}
