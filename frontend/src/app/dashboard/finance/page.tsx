'use client';

import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore, formatCurrencyValue, getCurrencySymbol } from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Wallet, TrendingUp, TrendingDown, Trash2, PieChart as PieIcon, BarChart3, DollarSign, IndianRupee, Euro, PoundSterling, JapaneseYen, CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format, subMonths, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

export default function FinancePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { currency } = useSettingsStore(); // Get global currency
  const { 
      transactions, debts, summary, 
      fetchTransactions, fetchDebts, fetchSummary, 
      addTransaction, addDebt, toggleDebt, deleteTransaction, deleteDebt, 
      isLoading 
  } = useFinanceStore();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDebtOpen, setIsDebtOpen] = useState(false);
  const [formData, setFormData] = useState({
      type: 'expense' as 'income'|'expense',
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
  });
  const [debtFormData, setDebtFormData] = useState({
      type: 'payable' as 'payable'|'receivable',
      person: '',
      amount: '',
      dueDate: '',
      notes: ''
  });

  useEffect(() => {
    if (useAuthStore.getState().isHydrated && !isAuthenticated) {
        router.push('/login');
    } else if (isAuthenticated) {
        fetchTransactions();
        fetchDebts();
        fetchSummary();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await addTransaction({
          type: formData.type,
          amount: Number(formData.amount),
          category: formData.category || 'General',
          description: formData.description,
          date: formData.date
      });
      setIsOpen(false);
      setFormData({ ...formData, amount: '', description: '', category: '' });
  };

  const handleDebtSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await addDebt({
          type: debtFormData.type,
          person: debtFormData.person,
          amount: Number(debtFormData.amount),
          dueDate: debtFormData.dueDate || undefined,
          notes: debtFormData.notes
      });
      setIsDebtOpen(false);
      setDebtFormData({ ...debtFormData, amount: '', person: '', notes: '' });
  };

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
     // ... (Existing charts logic) ...
     const categoryMap: Record<string, number> = {};
     transactions.filter(t => t.type === 'expense').forEach(t => {
         categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
     });
     const expenseData = Object.keys(categoryMap).map(k => ({ name: k, value: categoryMap[k] }));

     const monthlyData = [];
     for(let i=5; i>=0; i--) {
        const d = subMonths(new Date(), i);
        const monStr = format(d, 'MMM');
        const income = transactions.filter(t => t.type === 'income' && isSameMonth(new Date(t.date), d)).reduce((a,b) => a+b.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense' && isSameMonth(new Date(t.date), d)).reduce((a,b) => a+b.amount, 0);
        monthlyData.push({ name: monStr, Income: income, Expense: expense });
     }
     
     // Debt Stats
     const totalReceivable = debts.filter(d => d.type === 'receivable' && !d.isSettled).reduce((a,b) => a+b.amount, 0);
     const totalPayable = debts.filter(d => d.type === 'payable' && !d.isSettled).reduce((a,b) => a+b.amount, 0);

     return { expenseData, monthlyData, totalReceivable, totalPayable };
  }, [transactions, debts]);

  const formatCurrency = (amount: number) => {
      return formatCurrencyValue(amount, currency);
  };

  const CurrencyIcon = () => {
      switch(currency) {
          case 'USD': return <DollarSign className="w-32 h-32 text-yellow-500" />;
          case 'INR': return <IndianRupee className="w-32 h-32 text-yellow-500" />;
          case 'EUR': return <Euro className="w-32 h-32 text-yellow-500" />;
          case 'GBP': return <PoundSterling className="w-32 h-32 text-yellow-500" />;
          case 'JPY': return <JapaneseYen className="w-32 h-32 text-yellow-500" />;
          default: return <DollarSign className="w-32 h-32 text-yellow-500" />;
      }
  };

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-600 dark:from-amber-200 dark:to-yellow-500">
                    Finance Hub
                </h1>
                <p className="text-muted-foreground">Master your wealth. Track every rupee.</p>
            </div>
            
            <div className="flex gap-2">
                <Dialog open={isDebtOpen} onOpenChange={setIsDebtOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                            Add Debt/Loan
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record Debt or Loan</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleDebtSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <div className="flex gap-2">
                                    <Button type="button" variant={debtFormData.type === 'payable' ? 'destructive' : 'outline'} className="w-1/2" onClick={() => setDebtFormData({...debtFormData, type: 'payable'})}>I Owe (Payable)</Button>
                                    <Button type="button" variant={debtFormData.type === 'receivable' ? 'default' : 'outline'} className={cn("w-1/2", debtFormData.type === 'receivable' && "bg-blue-600 hover:bg-blue-700")} onClick={() => setDebtFormData({...debtFormData, type: 'receivable'})}>They Owe Me (Receivable)</Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Person/Entity</Label>
                                <Input required value={debtFormData.person} onChange={(e) => setDebtFormData({...debtFormData, person: e.target.value})} placeholder="Name..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount ({getCurrencySymbol(currency)})</Label>
                                <Input type="number" required value={debtFormData.amount} onChange={(e) => setDebtFormData({...debtFormData, amount: e.target.value})} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date (Optional)</Label>
                                <Input type="date" value={debtFormData.dueDate} onChange={(e) => setDebtFormData({...debtFormData, dueDate: e.target.value})} />
                            </div>
                            <Button type="submit" className="w-full">Save Record</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg shadow-yellow-500/20">
                            <Plus className="mr-2 h-4 w-4" /> Add Transaction
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Transaction</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* ... Existing Transaction Form ... */}
                            <div className="space-y-2">
                                 <Label>Type</Label>
                                 <div className="flex gap-2">
                                    <Button type="button" variant={formData.type === 'expense' ? 'destructive' : 'outline'} className="w-1/2" onClick={() => setFormData({...formData, type: 'expense'})}>Expense</Button>
                                    <Button type="button" variant={formData.type === 'income' ? 'default' : 'outline'} className={cn("w-1/2", formData.type === 'income' && "bg-green-600 hover:bg-green-700 text-white")} onClick={() => setFormData({...formData, type: 'income'})}>Income</Button>
                                 </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Amount ({getCurrencySymbol(currency)})</Label>
                                <Input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Food, Salary" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>Save Transaction</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="debts">Debts & Loans</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                 {/* SUMMARY CARDS */}
                <div className="grid gap-4 md:grid-cols-3">
                     {/* ... Existing Summary Cards ... */}
                     <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl overflow-hidden relative">
                         <div className="absolute -right-4 -top-4 opacity-10"><CurrencyIcon /></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-zinc-400">Total Net Worth</CardTitle>
                            <Wallet className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold text-white tracking-tight">{formatCurrency(summary.balance)}</div>
                        </CardContent>
                     </Card>
                     <Card className="bg-gradient-to-br from-emerald-950/30 to-emerald-900/10 border-emerald-500/20 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-emerald-500">Income</CardTitle><TrendingUp className="h-4 w-4 text-emerald-500" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-emerald-400">+{formatCurrency(summary.totalIncome)}</div></CardContent>
                     </Card>
                     <Card className="bg-gradient-to-br from-red-950/30 to-red-900/10 border-red-500/20 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-red-500">Expense</CardTitle><TrendingDown className="h-4 w-4 text-red-500" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-red-400">{formatCurrency(summary.totalExpense)}</div></CardContent>
                     </Card>
                </div>
                
                {/* CHARTS */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="text-base">Income vs Expense</CardTitle>
                            <CardDescription>Monthly financial performance</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.5} />
                                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${getCurrencySymbol(currency)}${val/1000}k`} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} formatter={(val: number | undefined) => `${getCurrencySymbol(currency)}${val}`} />
                                    <Legend />
                                    <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="text-base">Expense Structure</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {stats.expenseData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} formatter={(val: number | undefined) => `${getCurrencySymbol(currency)}${val}`} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="debts" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-blue-950/20 border-blue-500/20">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-400">Total Receivable (You Lent)</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-500">{formatCurrency(stats.totalReceivable)}</div>
                            <p className="text-xs text-muted-foreground">Money friends owe you</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-950/20 border-red-500/20">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-400">Total Payable (Debt)</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-500">{formatCurrency(stats.totalPayable)}</div>
                            <p className="text-xs text-muted-foreground">Money you owe others</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4">
                    {debts.length === 0 ? <p className="text-muted-foreground text-center py-8">No records found.</p> : debts.map(debt => (
                        <div key={debt._id} className={cn("flex items-center justify-between p-4 rounded-lg border", debt.isSettled ? "opacity-50 bg-muted" : "bg-card")}>
                             <div className="flex items-center gap-4">
                                <div className={cn("p-2 rounded-full", debt.type === 'receivable' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500')}>
                                     {debt.type === 'receivable' ? <ArrowUpRight className="h-5 w-5"/> : <ArrowDownLeft className="h-5 w-5"/>}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{debt.person}</p>
                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                        <span>{debt.type === 'receivable' ? 'Owes you' : 'You owe'}</span>
                                        {debt.dueDate && <span>• Due {format(new Date(debt.dueDate), 'MMM dd')}</span>}
                                        {debt.isSettled && <span className="text-green-500 font-bold">• SETTLED</span>}
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className={cn("text-xl font-bold font-mono", debt.type === 'receivable' ? 'text-blue-500' : 'text-red-500')}>
                                        {formatCurrency(debt.amount)}
                                    </div>
                                </div>
                                {!debt.isSettled && (
                                    <Button size="sm" variant="outline" onClick={() => toggleDebt(debt._id)}>
                                        Mark Paid
                                    </Button>
                                )}
                                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => deleteDebt(debt._id)}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                             </div>
                        </div>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="history">
                 <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Full Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.map(t => (
                                <div key={t._id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2 rounded-full", t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')}>
                                            {t.type === 'income' ? <TrendingUp className="h-5 w-5"/> : <TrendingDown className="h-5 w-5"/>}
                                        </div>
                                        <div>
                                            <p className="font-medium">{t.description || t.category}</p>
                                            <p className="text-xs text-muted-foreground">{t.category} • {format(new Date(t.date), 'MMM dd, yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={cn("font-bold font-mono tracking-tight", t.type === 'income' ? 'text-emerald-500' : 'text-red-500')}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </span>
                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteTransaction(t._id)}>
                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
