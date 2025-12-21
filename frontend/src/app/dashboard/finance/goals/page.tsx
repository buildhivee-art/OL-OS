'use client';

import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore, formatCurrencyValue, getCurrencySymbol } from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FinanceNav } from '@/components/FinanceNav';
import { Plus, Trash2, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from "@/components/ui/progress";

export default function FinanceGoalsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { currency } = useSettingsStore();
  const { 
      goals, fetchGoals, addGoal, updateGoal, deleteGoal,
  } = useFinanceStore();
  const router = useRouter();

  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '', currentAmount: '', deadline: '', color: '#f59e0b' });

  useEffect(() => {
    if (useAuthStore.getState().isHydrated && !isAuthenticated) {
        router.push('/login');
    } else if (isAuthenticated) {
        fetchGoals();
    }
  }, [isAuthenticated, fetchGoals]);

  const handleGoalSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await addGoal({ ...goalForm, targetAmount: Number(goalForm.targetAmount), currentAmount: Number(goalForm.currentAmount) });
      setIsGoalOpen(false);
      setGoalForm({ title: '', targetAmount: '', currentAmount: '', deadline: '', color: '#f59e0b' });
  };

  const formatMoney = (amount: number) => formatCurrencyValue(amount, currency);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <FinanceNav />
        
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase">Savings Goals</h1>
                <p className="text-muted-foreground">Visualize and conquer your financial targets.</p>
            </div>
            <Dialog open={isGoalOpen} onOpenChange={setIsGoalOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                        <Plus className="w-4 h-4 mr-2"/> New Goal
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create Savings Goal</DialogTitle></DialogHeader>
                    <form onSubmit={handleGoalSubmit} className="space-y-4">
                        <div className="space-y-2"><Label>Goal Title</Label><Input value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} required placeholder="e.g. New Car" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Target ({getCurrencySymbol(currency)})</Label><Input type="number" required value={goalForm.targetAmount} onChange={e => setGoalForm({...goalForm, targetAmount: e.target.value})} /></div>
                            <div className="space-y-2"><Label>Starting Amount</Label><Input type="number" value={goalForm.currentAmount} onChange={e => setGoalForm({...goalForm, currentAmount: e.target.value})} /></div>
                        </div>
                        <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={goalForm.deadline} onChange={e => setGoalForm({...goalForm, deadline: e.target.value})} /></div>
                        <Button type="submit" className="w-full">Create Goal</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map(goal => {
                const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                return (
                    <Card key={goal._id} className="relative overflow-hidden group hover:shadow-xl transition-all border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Target className="w-24 h-24" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl font-black tracking-tight">{goal.title}</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteGoal(goal._id)}><Trash2 className="w-3 h-3 text-red-500"/></Button>
                            </div>
                            <CardDescription className="uppercase text-xs font-bold tracking-wider">
                                {goal.deadline ? `Target: ${format(parseISO(goal.deadline), 'MMM yyyy')}` : 'No deadline'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-2xl">{formatMoney(goal.currentAmount)}</span>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground uppercase">Goal</div>
                                        <div className="text-muted-foreground">{formatMoney(goal.targetAmount)}</div>
                                    </div>
                                </div>
                                <Progress value={percent} className="h-4 bg-zinc-200 dark:bg-zinc-800" indicatorClassName="bg-gradient-to-r from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/20" />
                                <div className="text-right mt-1 text-xs font-bold text-amber-500">{Math.round(percent)}% Funded</div>
                            </div>
                            
                            <div className="bg-zinc-100 dark:bg-zinc-950 p-3 rounded-lg flex gap-2">
                                <Button className="flex-1 font-bold" variant="outline" size="sm" onClick={() => updateGoal(goal._id, { currentAmount: goal.currentAmount + 100 })}>
                                    <Plus className="w-3 h-3 mr-1"/> 100
                                </Button>
                                <Button className="flex-1 font-bold" variant="outline" size="sm" onClick={() => updateGoal(goal._id, { currentAmount: goal.currentAmount + 500 })}>
                                    <Plus className="w-3 h-3 mr-1"/> 500
                                </Button>
                                <Button className="flex-1 font-bold" variant="outline" size="sm" onClick={() => updateGoal(goal._id, { currentAmount: goal.currentAmount + 1000 })}>
                                     <Plus className="w-3 h-3 mr-1"/> 1k
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    </div>
  );
}
