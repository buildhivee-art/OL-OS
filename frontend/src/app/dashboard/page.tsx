
'use client';

import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useSettingsStore, formatCurrencyValue } from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Target, Zap, LayoutList, Trophy, Flame, Calendar, ArrowRight, Share2, Crown, Wallet, CheckCircle2, Circle, Quote, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

const QUOTES = [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "The only easier day was yesterday.", author: "Navy SEALs" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "Do not wait; the time will never be 'just right'.", author: "Napoleon Hill" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" }
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { tasks, logs, fetchTasks, fetchLogs, toggleLog } = useTaskStore();
  const { summary, fetchSummary } = useFinanceStore();
  const { currency } = useSettingsStore();
  const router = useRouter();
  
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchTasks();
    fetchSummary();
    
    // Fetch logs for last 30 days for stats
    const end = new Date();
    const start = subDays(end, 30);
    fetchLogs(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));

    // Random Quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, [isAuthenticated]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const handleToggle = async (taskId: string) => {
      await toggleLog(taskId, todayStr);
  };
  
  const getTaskStreak = (taskId: string) => {
      let s = 0;
      const tDay = new Date();
      // Check last 30 days for streak
      for(let i=1; i<=30; i++) { // Start checking from yesterday
          const d = subDays(tDay, i);
          const dStr = format(d, 'yyyy-MM-dd');
          if (logs[`${taskId}-${dStr}`]) {
              s++;
          } else {
              break;
          }
      }
      // If task done today, add 1? Usually streak is "consecutive days ending yesterday" + today if done.
      if (logs[`${taskId}-${todayStr}`]) s++;
      return s;
  };

  // ... stats calculation code ... lines 61-90 are fine ...
  // CALCULATION ENGINE
  const stats = useMemo(() => {
    if (!tasks.length) return { completion: 0, streak: 0, activeHabits: 0 };
    
    // 1. Completion Rate (Last 7 Days)
    const today = new Date();
    let totalScheduled = 0;
    let totalDone = 0;
    
    for(let i=0; i<7; i++) {
        const d = subDays(today, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        tasks.forEach(task => {
            totalScheduled++;
            if (logs[`${task._id}-${dateStr}`]) totalDone++;
        });
    }
    const completion = totalScheduled > 0 ? Math.round((totalDone / totalScheduled) * 100) : 0;

    // 2. Streak
    let currentStreak = 0;
    for(let i=0; i<365; i++) {
        const d = subDays(today, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const hasActivity = tasks.some(t => logs[`${t._id}-${dateStr}`]);
        
        if (hasActivity) {
            currentStreak++;
        } else if (i === 0 && !hasActivity) {
            continue; 
        } else {
            break;
        }
    }

    return {
        completion,
        streak: currentStreak,
        activeHabits: tasks.length
    };
  }, [tasks, logs]);

  if (!user) return null;
  // ... rank logic ...

  // Rank Logic
  const level = user.level || 1;
  const xp = user.xp || 0;
  const nextLevelXp = level * 1000;
  const currentLevelBaseXp = (level - 1) * 1000;
  const progressPercent = Math.min(100, Math.max(0, ((xp - currentLevelBaseXp) / 1000) * 100));
  
  const getRank = (lvl: number) => {
     if (lvl >= 100) return { title: 'Grandmaster', icon: Crown, color: 'text-yellow-500' };
     if (lvl >= 50) return { title: 'Elite', icon: Trophy, color: 'text-purple-500' };
     if (lvl >= 25) return { title: 'Veteran', icon: Zap, color: 'text-red-500' };
     if (lvl >= 10) return { title: 'Apprentice', icon: Target, color: 'text-blue-500' };
     return { title: 'Novice', icon: Activity, color: 'text-green-500' };
  };
  
  const rank = getRank(level);

  // ... return JSX ...
  // Only changing the Mission Control map
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* ... HERO ... */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white shadow-2xl border border-zinc-800">
        {/* ... hero content ... */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <rank.icon className="w-96 h-96" />
        </div>
        
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20", rank.color)}>
                        {rank.title} Rank
                    </span>
                    <span className="text-zinc-400 text-xs uppercase tracking-widest">System Operational</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                    Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">{user.name}</span>.
                </h1>
                <p className="text-lg text-zinc-400 max-w-xl">
                    Level {level} &bull; {1000 - (xp % 1000)} XP to next tier.
                </p>
            </div>

            <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-inner">
                <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-zinc-300">Level Progress</span>
                    <span className="text-white">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2 bg-white/10" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8">
        {/* ... stats cards ... */}
        <Card className="md:col-span-1 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 shadow-lg hover:shadow-orange-500/10 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-orange-500">Streak</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.streak} <span className="text-sm font-normal text-muted-foreground">days</span></div>
            </CardContent>
        </Card>

         <Card className="md:col-span-1 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 shadow-lg hover:shadow-emerald-500/10 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-500">Consistency</CardTitle>
                <Target className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completion}%</div>
            </CardContent>
        </Card>

        {/* FINANCE CARD */}
        <Card className="md:col-span-2 bg-gradient-to-br from-yellow-500/5 to-transparent border-zinc-200 dark:border-zinc-800 shadow-lg relative overflow-hidden hover:border-yellow-500/20 transition-colors">
             <div className="absolute right-4 top-4 opacity-10"><Wallet className="w-24 h-24" /></div>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Financial Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 relative z-10">
                <div className="text-4xl font-bold tracking-tight">{formatCurrencyValue(summary.balance, currency)}</div>
                <div className="flex gap-4 text-sm font-medium pt-2">
                    <span className="text-emerald-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{formatCurrencyValue(summary.totalIncome, currency)}</span>
                    <span className="text-red-500">-{formatCurrencyValue(summary.totalExpense, currency)}</span>
                </div>
            </CardContent>
        </Card>

        {/* WIDGETS ROW */}
        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Quick Capture (Note) */}
             <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => router.push('/dashboard/vault')}>
                 <CardContent className="p-6 flex items-center justify-center flex-col text-center gap-2">
                     <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <Share2 className="w-6 h-6" />
                     </div>
                     <h3 className="font-semibold">Quick Capture</h3>
                     <p className="text-xs text-muted-foreground">Log a thought into The Vault</p>
                 </CardContent>
             </Card>

             {/* Focus Mode Widget */}
             <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500/50 transition-colors cursor-pointer group" onClick={() => router.push('/dashboard/focus')}>
                 <CardContent className="p-6 flex items-center justify-center flex-col text-center gap-2">
                     <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6" />
                     </div>
                     <h3 className="font-semibold">Enter Flow State</h3>
                     <p className="text-xs text-muted-foreground">Start a deep work session</p>
                 </CardContent>
             </Card>

             {/* System Roadmap Widget */}
             <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-yellow-500/50 transition-colors cursor-pointer group" onClick={() => router.push('/dashboard/roadmap')}>
                 <CardContent className="p-6 flex items-center justify-center flex-col text-center gap-2">
                     <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500 group-hover:scale-110 transition-transform">
                        <LayoutList className="w-6 h-6" />
                     </div>
                     <h3 className="font-semibold">System Roadmap</h3>
                     <p className="text-xs text-muted-foreground">Suggest a feature or upgrade</p>
                 </CardContent>
             </Card>
        </div>

        {/* ROW 2: MISSION CONTROL (TODAY'S TASKS) */}
        <Card className="md:col-span-2 lg:col-span-3 row-span-2 flex flex-col border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
             <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="flex items-center gap-2"><LayoutList className="w-5 h-5 text-primary" /> Today&apos;s Mission</CardTitle>
                <CardDescription>{format(new Date(), 'EEEE, MMMM do')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[400px] space-y-2 p-4 custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                        <Zap className="w-10 h-10 mb-2 opacity-20" />
                        <p>No active protocols found.</p>
                        <Button variant="link" onClick={() => router.push('/dashboard/habits/track')}>Initialize Habit Protocols</Button>
                    </div>
                ) : (
                    tasks.map(task => {
                        const isDone = !!logs[`${task._id}-${todayStr}`];
                        const taskStreak = getTaskStreak(task._id);
                        return (
                            <div key={task._id} className={cn("group flex items-center justify-between p-4 rounded-xl border transition-all duration-300", 
                                isDone 
                                    ? "bg-green-500/10 border-green-500/20" 
                                    : "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
                            )}>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => handleToggle(task._id)}
                                        className={cn("transition-all duration-300 transform active:scale-90", isDone ? "text-green-500" : "text-zinc-300 hover:text-green-500")}
                                    >
                                        {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                    </button>
                                    <div>
                                        <p className={cn("font-medium text-lg transition-all", isDone && "text-muted-foreground line-through decoration-zinc-500/50")}>{task.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md tracking-wider">{(task.category as any)?.name || 'General'}</span>
                                            {taskStreak > 0 && <span className="text-[10px] text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md font-bold flex items-center gap-1"><Flame className="w-3 h-3" /> {taskStreak} Day Streak</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
            <CardFooter className="border-t bg-muted/20 p-3 justify-center">
                 <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => router.push('/dashboard/habits/track')}>manage protocols &rarr;</Button>
            </CardFooter>
        </Card>
        
        {/* SIDE BAR: QUOTE & ACTIONS */}
        <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-6">
            
            {/* DAILY WISDOM */}
            <Card className="bg-zinc-900 text-white border-zinc-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Quote className="w-32 h-32 rotate-12" /></div>
                <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Quote className="w-3 h-3" /> Daily Wisdom</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                    <blockquote className="space-y-4">
                         <p className="text-xl font-serif italic leading-relaxed text-zinc-100">&ldquo;{quote.text}&rdquo;</p>
                         <footer className="text-sm text-primary font-bold tracking-wide">— {quote.author}</footer>
                    </blockquote>
                </CardContent>
            </Card>

            {/* QUICK ACTIONS */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg">
                <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium text-muted-foreground">Command Center</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 space-y-1" onClick={() => router.push('/dashboard/habits/track')}>
                        <Activity className="w-6 h-6 text-primary" />
                        <span className="text-xs font-semibold">Log Habits</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-green-500/50 hover:bg-green-500/5 space-y-1" onClick={() => router.push('/dashboard/finance')}>
                        <Wallet className="w-6 h-6 text-green-500" />
                        <span className="text-xs font-semibold">Finance</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-orange-500/50 hover:bg-orange-500/5 space-y-1" onClick={() => router.push('/dashboard/habits/weekly-log')}>
                        <Calendar className="w-6 h-6 text-orange-500" />
                        <span className="text-xs font-semibold">Weekly Log</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-purple-500/50 hover:bg-purple-500/5 space-y-1" onClick={() => router.push('/dashboard/settings')}>
                         <Zap className="w-6 h-6 text-purple-500" />
                         <span className="text-xs font-semibold">Settings</span>
                    </Button>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
