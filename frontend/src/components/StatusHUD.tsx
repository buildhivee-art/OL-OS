'use client';

import { useAuthStore } from '@/stores/authStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useTaskStore } from '@/stores/taskStore';
import { useSettingsStore, getCurrencySymbol, formatCurrencyValue } from '@/stores/settingsStore';
import { ModeToggle } from '@/components/mode-toggle';
import { useEffect, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy, Coins, Activity, Zap } from 'lucide-react';
import { format } from 'date-fns';

export function StatusHUD() {
  const { user } = useAuthStore();
  const { currency } = useSettingsStore();
  const { summary, fetchSummary } = useFinanceStore();
  const { tasks, logs, fetchTasks, fetchLogs } = useTaskStore();

  useEffect(() => {
    // Ensure we have fresh data for the HUD
    fetchSummary();
    fetchTasks();
    const today = new Date();
    fetchLogs(format(today, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'));
  }, []);

  // Calculate Daily Score
  const dailyScore = useMemo(() => {
      if (!tasks.length) return 0;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const completed = tasks.filter(t => logs[`${t._id}-${todayStr}`]).length;
      return Math.round((completed / tasks.length) * 100);
  }, [tasks, logs]);

  // Level Progress
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const progressToNext = ((xp % 1000) / 1000) * 100;

  return (
    <div className="flex w-full items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
        
        {/* Left: Welcome / Date */}
        <div className="hidden md:flex flex-col">
            <h2 className="text-sm font-bold text-muted-foreground">{format(new Date(), 'EEEE, MMMM do')}</h2>
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg">Cmdr. {user?.name}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Lvl {level}</span>
            </div>
        </div>

        {/* Center: HUD Stats */}
        <div className="flex items-center gap-6">
            
            {/* XP Bar */}
            <div className="flex flex-col w-32 md:w-48 gap-1">
                <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> XP</span>
                    <span>{Math.floor(progressToNext)}%</span>
                </div>
                <Progress value={progressToNext} className="h-1.5" />
            </div>

            {/* Money */}
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary/50 border border-border">
                <div className="p-1.5 rounded-full bg-emerald-500/10">
                    <Coins className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Net Worth</span>
                    <span className="text-sm font-bold font-mono leading-none">{formatCurrencyValue(summary.balance, currency)}</span>
                </div>
            </div>

            {/* Daily Score */}
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary/50 border border-border">
                 <div className="p-1.5 rounded-full bg-blue-500/10">
                    <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Daily Sync</span>
                    <span className={`text-sm font-bold font-mono leading-none ${dailyScore === 100 ? 'text-green-500' : 'text-foreground'}`}>{dailyScore}%</span>
                </div>
            </div>

        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
            <ModeToggle />
        </div>
    </div>
  );
}
