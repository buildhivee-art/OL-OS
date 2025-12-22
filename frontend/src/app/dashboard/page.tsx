'use client';

import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useContentStore } from '@/stores/contentStore';
import { useSettingsStore, formatCurrencyValue } from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Target, Zap, LayoutList, Trophy, Flame, Calendar, ArrowRight, Share2, Crown, Wallet, CheckCircle2, Circle, Quote, TrendingUp, ImageIcon, Grid, Headphones, Dumbbell, Video } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "The only easier day was yesterday.", author: "Navy SEALs" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Do not wait; the time will never be 'just right'.", author: "Napoleon Hill" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },

  // 🔥 Anime Quotes
  { text: "Push through the pain. Giving up hurts more.", author: "Vegeta (Dragon Ball Z)" },
  { text: "If you don't take risks, you can't create a future.", author: "Monkey D. Luffy (One Piece)" },
  { text: "Whatever you lose, you'll find it again.", author: "Eren Yeager (Attack on Titan)" },
  { text: "A real ninja never gives up.", author: "Jiraiya (Naruto)" },
  { text: "If you can't do something, then don't. Believe in someone who can.", author: "Erwin Smith (Attack on Titan)" },
  { text: "Hard work is worthless for those that don't believe in themselves.", author: "Naruto Uzumaki (Naruto)" },
  { text: "If you don't like your destiny, don't accept it.", author: "Naruto Uzumaki (Naruto)" },
  { text: "No matter how deep the night, it always turns to day.", author: "Brook (One Piece)" },
  { text: "When you give up, that&apos;s when the game ends.", author: "Mitsuyoshi Anzai (Slam Dunk)" },
  { text: "If you can't do it, then don't. Believe in someone who can.", author: "Levi Ackerman (Attack on Titan)" },
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { tasks, logs, fetchTasks, fetchLogs, toggleLog, metrics } = useTaskStore();
  const { summary, fetchSummary } = useFinanceStore();
  const { workouts, fetchWorkouts } = useWorkoutStore();
  const { contents, fetchContents } = useContentStore();
  const { currency } = useSettingsStore();
  const router = useRouter();
  
  const [quote, setQuote] = useState(QUOTES[0]);
  const [time, setTime] = useState(new Date());
  const [isPrime, setIsPrime] = useState(false);
  const [neuralLink, setNeuralLink] = useState('');

  useEffect(() => {
      setNeuralLink(localStorage.getItem('neural-link') || '');
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchTasks();
    fetchSummary();
    fetchWorkouts();
    fetchContents();
    
    // Fetch logs for stats
    const end = new Date();
    const start = subDays(end, 90);
    fetchLogs(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));

    // Fetch daily metrics for nutrition widget
    // Using taskStore's fetchMetrics
    useTaskStore.getState().fetchMetrics(format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd'));

    // Random Quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    
    // Clock Timer
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    return () => {
        clearInterval(timer);
    };
  }, [isAuthenticated, fetchTasks, fetchSummary, fetchWorkouts, fetchContents, fetchLogs]);

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

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 5) return "Late Night Hustle";
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
  };
  
  // HEATMAP CALCULATION
  const heatmapData = useMemo(() => {
      const days = [];
      const today = new Date();
      // Last 14 weeks (approx 100 days) grid
      for(let i=120; i>=0; i--) {
          const d = subDays(today, i);
          const dateStr = format(d, 'yyyy-MM-dd');
          // Count logs for this date
          let count = 0;
          tasks.forEach(t => {
              if (logs[`${t._id}-${dateStr}`]) count++;
          });
          days.push({ date: d, count });
      }
      return days;
  }, [tasks, logs]);

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

  // Content Stats
  const contentStats = useMemo(() => {
      const ideas = contents.filter(c => c.status === 'idea').length;
      const inProgress = contents.filter(c => ['scripting', 'filming', 'editing'].includes(c.status)).length;
      const published = contents.filter(c => c.status === 'published').length;
      return { ideas, inProgress, published };
  }, [contents]);

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
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* ... HERO ... */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-2xl border border-zinc-800">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-900/50"></div>
        
         {/* Top Bar with Live Clock */}
         <div className="relative z-10 flex justify-between items-start p-8 pb-0">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                System Online
            </div>
            <div className="text-right">
                <div className="text-3xl font-mono font-bold tracking-tighter text-zinc-200">
                    {format(time, 'HH:mm:ss')}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono">
                    {format(time, 'EEEE, MMM do')}
                </div>
            </div>
         </div>
        
        <div className="relative z-10 p-8 pt-4 md:p-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20", rank.color)}>
                        {rank.title} Rank
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                   {getGreeting()}, <span className="text-zinc-500">{user.name}</span>.
                </h1>
                <p className="text-lg text-zinc-400 max-w-xl">
                    Ready to optimize your existence?
                </p>
            </div>

            <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-inner">
                <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-zinc-300">Level {level} Progress</span>
                    <span className="text-white">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2 bg-white/10" />
                <div className="mt-2 text-xs text-zinc-500 text-right font-mono">
                    {1000 - (xp % 1000)} XP to next tier
                </div>
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
        <Card className="md:col-span-2 bg-gradient-to-br from-yellow-500/5 to-transparent border-zinc-200 dark:border-zinc-800 shadow-lg relative overflow-hidden hover:border-yellow-500/20 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/finance')}>
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

        {/* FITNESS & NUTRITION INTELLIGENCE */}
        <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer hover:border-blue-500/20 transition-colors group relative overflow-hidden" onClick={() => router.push('/dashboard/fitness')}>
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Dumbbell className="w-32 h-32 text-blue-500" />
             </div>
             
             <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-blue-500" /> Bio-Metrics & Fuel
                </CardTitle>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
             </CardHeader>
             <CardContent className="relative z-10">
                 <div className="grid grid-cols-2 gap-4">
                     {/* Workout Side */}
                     <div className="space-y-3">
                         <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                             <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1 flex items-center gap-1">
                                <Activity className="w-3 h-3 text-emerald-500"/> Last Session
                             </div>
                             {workouts.length > 0 ? (
                                 <div>
                                     <div className="font-bold truncate text-sm">{workouts[0].name}</div>
                                     <div className="text-[10px] text-muted-foreground font-mono mt-1">{format(parseISO(workouts[0].date), 'MMM dd')} • {workouts[0].duration} min</div>
                                 </div>
                             ) : (
                                 <div className="text-sm text-muted-foreground italic">No recent activity</div>
                             )}
                         </div>

                         <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                              <div>
                                  <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Morning Weight</div>
                                  <div className="flex items-end gap-1">
                                      <span className="text-xl font-black tabular-nums">178.4</span>
                                      <span className="text-[10px] text-muted-foreground mb-1 font-bold">lbs</span>
                                  </div>
                              </div>
                              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                  <TrendingUp className="w-4 h-4" />
                              </div>
                         </div>
                     </div>

     {/* Nutrition Side (Vibrant) */}
     {(() => {
         const todayMetric = metrics[todayStr] || {};
         const cal = todayMetric.calories || 0;
         const calTarget = 2700; // Hardcoded fallback or use store setting if available
         const p = todayMetric.macros?.protein || 0;
         const c = todayMetric.macros?.carbs || 0;
         const f = todayMetric.macros?.fats || 0;
         const pTarget = 140; const cTarget = 350; const fTarget = 75;

         return (
             <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 relative overflow-hidden flex flex-col justify-between">
                 <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                 
                 <div className="flex justify-between items-start relative z-10">
                     <div className="text-[10px] uppercase font-bold text-orange-400 flex items-center gap-1">
                         <Flame className="w-3 h-3" /> Calories
                     </div>
                     <div className="text-[10px] font-bold text-zinc-500">
                         {cal.toLocaleString()} / {calTarget.toLocaleString()}
                     </div>
                 </div>

                 <div className="relative z-10 my-2">
                     <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-black text-white tracking-tighter">{cal.toLocaleString()}</span>
                         <span className="text-[10px] text-zinc-500 font-bold uppercase">kcal</span>
                     </div>
                     <Progress value={Math.min(100, (cal/calTarget)*100)} className="h-1.5 bg-zinc-800 mt-2" indicatorClassName="bg-gradient-to-r from-orange-600 to-yellow-500" />
                 </div>

                 <div className="flex justify-between gap-1 relative z-10">
                     <div className="flex flex-col items-center flex-1">
                         <div className="h-1 w-full bg-red-500/20 rounded-full overflow-hidden">
                             <div className="h-full bg-red-500" style={{ width: `${Math.min(100, (p/pTarget)*100)}%` }} />
                         </div>
                         <span className="text-[9px] font-bold text-zinc-400 mt-1">{p}g P</span>
                     </div>
                     <div className="flex flex-col items-center flex-1 mx-2">
                         <div className="h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (c/cTarget)*100)}%` }} />
                         </div>
                         <span className="text-[9px] font-bold text-zinc-400 mt-1">{c}g C</span>
                     </div>
                     <div className="flex flex-col items-center flex-1">
                         <div className="h-1 w-full bg-yellow-500/20 rounded-full overflow-hidden">
                             <div className="h-full bg-yellow-500" style={{ width: `${Math.min(100, (f/fTarget)*100)}%` }} />
                         </div>
                         <span className="text-[9px] font-bold text-zinc-400 mt-1">{f}g F</span>
                     </div>
                 </div>
             </div>
         );
     })()}
                 </div>
             </CardContent>
        </Card>

        {/* CONTENT CARD */}
        <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer hover:border-purple-500/20 transition-colors group" onClick={() => router.push('/dashboard/content')}>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-500" /> Content Factory
                </CardTitle>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
             </CardHeader>
             <CardContent>
                  <div className="flex gap-4">
                      <div className="flex-1 p-3 bg-purple-500/10 rounded-lg text-center">
                          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{contentStats.ideas}</div>
                          <div className="text-[10px] font-bold uppercase text-purple-500/70">Ideas</div>
                      </div>
                      <div className="flex-1 p-3 bg-blue-500/10 rounded-lg text-center">
                          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{contentStats.inProgress}</div>
                          <div className="text-[10px] font-bold uppercase text-blue-500/70">In Progress</div>
                      </div>
                      <div className="flex-1 p-3 bg-green-500/10 rounded-lg text-center">
                          <div className="text-2xl font-black text-green-600 dark:text-green-400">{contentStats.published}</div>
                          <div className="text-[10px] font-bold uppercase text-green-500/70">Live</div>
                      </div>
                  </div>
             </CardContent>
        </Card>

        {/* WIDGETS ROW - SYSTEM MODULES */}
        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Quick Capture (Note) */}
             <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 cursor-pointer" onClick={() => router.push('/dashboard/vault')}>
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <CardContent className="p-6 flex items-center gap-4 relative z-10">
                     <div className="p-4 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Share2 className="w-6 h-6" />
                     </div>
                     <div>
                         <h3 className="font-bold text-lg">The Vault</h3>
                         <p className="text-xs text-muted-foreground">Capture thoughts & ideas.</p>
                     </div>
                     <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                 </CardContent>
             </Card>

             {/* Focus Mode Widget */}
             <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 cursor-pointer" onClick={() => router.push('/dashboard/focus')}>
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <CardContent className="p-6 flex items-center gap-4 relative z-10">
                     <div className="p-4 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <Zap className="w-6 h-6" />
                     </div>
                     <div>
                         <h3 className="font-bold text-lg">Deep Focus</h3>
                         <p className="text-xs text-muted-foreground">Enter flow state.</p>
                     </div>
                     <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                 </CardContent>
             </Card>

             {/* System Roadmap Widget */}
             <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 cursor-pointer" onClick={() => router.push('/dashboard/roadmap')}>
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <CardContent className="p-6 flex items-center gap-4 relative z-10">
                     <div className="p-4 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <LayoutList className="w-6 h-6" />
                     </div>
                     <div>
                         <h3 className="font-bold text-lg">System Roadmap</h3>
                         <p className="text-xs text-muted-foreground">View upcoming features.</p>
                     </div>
                     <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                 </CardContent>
             </Card>
        </div>

        {/* ROW 3: MISSION CONTROL & SIDEBAR */}
        <div className="md:col-span-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LEFT COLUMN (TASKS & OPERATIONS) */}
            <div className="lg:col-span-3 space-y-8">
                
                {/* SYSTEM PULSE (HEATMAP) */}
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Grid className="w-4 h-4" /> System Pulse (Last 120 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-hidden pb-6">
                        <div className="flex flex-wrap gap-1 content-start h-[120px] overflow-hidden">
                            {heatmapData.map((d, i) => (
                                <div 
                                    key={i} 
                                    title={`${format(d.date, 'MMM do')}: ${d.count} activities`}
                                    className={cn(
                                        "w-3 h-3 rounded-[2px] transition-colors hover:ring-2 hover:ring-offset-1 ring-offset-background hover:ring-zinc-400", 
                                        d.count === 0 ? "bg-zinc-100 dark:bg-zinc-800/50" : 
                                        d.count < 3 ? "bg-green-500/40" : 
                                        d.count < 5 ? "bg-green-500/70" : "bg-green-500"
                                    )}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* ACTIVE OPERATION (CHALLENGE) */}
                <Card className="bg-gradient-to-r from-red-500/10 to-transparent border-red-500/20">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Active Operation
                            </CardTitle>
                            <span className="text-xs font-mono text-red-500 animate-pulse">LIVE</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Project: Superhuman</h3>
                            <p className="text-sm text-muted-foreground">Day 12 of 30 • Phase 1: Foundation</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10" onClick={() => router.push('/dashboard/habits/challenges')}>
                            View Intel
                        </Button>
                    </CardContent>
                </Card>

                {/* TODAY'S MISSION */}
                <Card className="flex flex-col border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[400px]">
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
            </div>

            {/* RIGHT COLUMN (SIDEBAR) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                
                {/* FOCUS PROTOCOL (REPLACES VISION BOARD) */}
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg relative overflow-hidden h-48 bg-zinc-950">
                     <div className={cn("absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay transition-opacity duration-1000", isPrime ? "opacity-40" : "opacity-20")} />
                     <div className={cn("absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent transition-opacity duration-1000", isPrime ? "opacity-100" : "opacity-0")} />
                     
                     <CardContent className="relative z-10 h-full flex flex-col justify-between p-6">
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                                <Headphones className="w-4 h-4" /> Focus Protocol
                            </div>
                            {isPrime && <div className="flex gap-1"><span className="w-1 h-3 bg-indigo-500 animate-pulse delay-75"/><span className="w-1 h-4 bg-indigo-500 animate-pulse delay-150"/><span className="w-1 h-3 bg-indigo-500 animate-pulse delay-0"/></div>}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{isPrime ? "Neural Sync Active" : "Silence"}</h3>
                            <Button 
                                size="sm" 
                                className={cn("w-full transition-all duration-500", isPrime ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300")}
                                onClick={() => setIsPrime(!isPrime)}
                            >
                                {isPrime ? "Disengage Protocol" : "Initialize Focus"}
                            </Button>
                        </div>
                     </CardContent>
                </Card>

                {/* DAILY WISDOM */}
                <Card className="bg-zinc-950 text-white border-zinc-800 shadow-2xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
                    <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10"><Quote className="w-32 h-32 rotate-12" /></div>
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

                {/* NEURAL LINK (SCRATCHPAD) */}
                 <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Zap className="w-3 h-3" /> Neural Link</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <textarea 
                            className="w-full h-32 bg-transparent border-none resize-none focus:outline-none text-sm font-mono placeholder:text-muted-foreground/50" 
                            placeholder="Initialize thought stream..."
                            value={neuralLink}
                            onChange={(e) => {
                                setNeuralLink(e.target.value);
                                localStorage.setItem('neural-link', e.target.value);
                            }}
                        />
                    </CardContent>
                </Card>

                {/* QUICK ACTIONS */}
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Command Center</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 space-y-1" onClick={() => router.push('/dashboard/habits/track')}>
                            <Activity className="w-5 h-5 text-primary" />
                            <span className="text-[10px] uppercase font-bold tracking-wide">Log</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-green-500/50 hover:bg-green-500/5 space-y-1" onClick={() => router.push('/dashboard/finance')}>
                            <Wallet className="w-5 h-5 text-green-500" />
                            <span className="text-[10px] uppercase font-bold tracking-wide">Finance</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-blue-500/50 hover:bg-blue-500/5 space-y-1" onClick={() => router.push('/dashboard/vault')}>
                            <Share2 className="w-5 h-5 text-blue-500" />
                            <span className="text-[10px] uppercase font-bold tracking-wide">Brain Dump</span>
                        </Button>
                         <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-indigo-500/50 hover:bg-indigo-500/5 space-y-1" onClick={() => router.push('/dashboard/focus')}>
                            <Headphones className="w-5 h-5 text-indigo-500" />
                            <span className="text-[10px] uppercase font-bold tracking-wide">Focus</span>
                        </Button>
                    </CardContent>
                </Card>

                {/* KNOWLEDGE BASE (NEW) */}
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Grid className="w-3 h-3" /> Knowledge Base
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer group">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-500/10 text-pink-500 rounded-md group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                    <Target className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-medium">Atomic Habits</div>
                             </div>
                             <span className="text-xs text-muted-foreground">Reading • 45%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer group">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-md group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-medium">Deep Work</div>
                             </div>
                             <span className="text-xs text-muted-foreground">Queue</span>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground mt-2">Access Library &rarr;</Button>
                    </CardContent>
                </Card>

                {/* NETWORK STATUS (NEW) */}
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Network Uplink
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-4 gap-2">
                        {[1,2,3,4].map((i) => (
                            <div key={i} className="aspect-square rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-primary hover:text-primary transition-colors cursor-pointer">
                                <span className="text-xs font-mono opacity-50">#{i}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>
    </div>
  );
}
