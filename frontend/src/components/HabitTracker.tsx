'use client';

import { useState, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Check, X, Flame, Calendar, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ViewMode = 'week' | 'month' | 'quarter';

export function HabitTracker() {
  const { tasks, logs, metrics, fetchLogs, fetchMetrics, seedMetrics, toggleLog, updateMetric } = useTaskStore();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate Date Range based on View Mode
  const getDateRange = () => {
    let start, end;
    if (viewMode === 'week') {
       start = subDays(currentDate, 6); // Last 7 days rolling or strict week? 
       // Keeping strict week for better alignment usually
       start = startOfWeek(currentDate, { weekStartsOn: 1 }); 
       end = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else if (viewMode === 'month') {
        const d = new Date(currentDate);
        d.setDate(1); // Start of month
        start = d;
        // Last day of month
        end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    } else {
       // Quarter / 90 Days
       start = subDays(currentDate, 89);
       end = currentDate;
    }
    return { start, end };
  };

  const { start, end } = getDateRange();
  const startStr = format(start, 'yyyy-MM-dd');
  const endStr = format(end, 'yyyy-MM-dd');

  const days = eachDayOfInterval({ start, end });

  // Fetch logs and metrics when range changes
  useEffect(() => {
    fetchLogs(startStr, endStr);
    fetchMetrics(startStr, endStr);
  }, [startStr, endStr, fetchLogs, fetchMetrics]);

  const handleToggle = async (taskId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    try {
        await toggleLog(taskId, dateStr);
    } catch {
        toast.error('Failed to update habit');
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
      const daysToAdd = viewMode === 'week' ? 7 : (viewMode === 'month' ? 30 : 90);
      setCurrentDate(prev => direction === 'next' ? addDays(prev, daysToAdd) : subDays(prev, daysToAdd));
  };

  const getDayEfficiency = (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let completedCount = 0;
      if (tasks.length === 0) return 0;
      tasks.forEach(task => {
          if (logs[`${task._id}-${dateStr}`]) completedCount++;
      });
      return Math.round((completedCount / tasks.length) * 100);
  };

  return (
    <Card className="w-full overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl rounded-3xl">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800 space-y-4 md:space-y-0">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="w-6 h-6" />
            </div>
            <div>
                 <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                     Chronicle
                 </CardTitle>
                 <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Efficiency Grid</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
             <div className="flex items-center">
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                 <span className="w-32 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                     {viewMode === 'week' ? (
                         `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
                     ) : (
                         format(currentDate, 'MMMM yyyy')
                     )}
                 </span>
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigate('next')}><ChevronRight className="h-4 w-4" /></Button>
             </div>
             
             <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-700 mx-1" />

             <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                 <SelectTrigger className="h-8 w-[100px] border-none bg-transparent text-xs font-bold uppercase">
                     <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                     <SelectItem value="week">Week</SelectItem>
                     <SelectItem value="month">Month</SelectItem>
                     <SelectItem value="quarter">Quarter</SelectItem>
                 </SelectContent>
             </Select>
         </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-fit" style={{ 
                display: 'grid', 
                gridTemplateColumns: `250px repeat(${days.length}, minmax(48px, 1fr))` 
            }}>
                {/* Header Row */}
                <div className="sticky left-0 bg-zinc-50/95 dark:bg-zinc-900/95 z-20 font-bold text-xs uppercase tracking-widest text-muted-foreground p-4 border-b border-r border-zinc-200 dark:border-zinc-800 backdrop-blur-sm shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)] flex items-center justify-between">
                    <span>Protocol</span>
                    <Activity className="w-3 h-3 opacity-50" />
                </div>
                {days.map(day => {
                    const isToday = isSameDay(day, new Date());
                    const efficiency = getDayEfficiency(day);
                    return (
                        <div key={day.toISOString()} className={cn(
                            "group relative text-center p-2 flex flex-col items-center justify-center border-b border-r border-zinc-100 dark:border-zinc-800/50 last:border-r-0 transition-colors",
                            isToday ? "bg-primary/5" : "bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        )}>
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isToday ? "text-primary" : "text-muted-foreground")}>{format(day, 'EEE')}</span>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                isToday ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            )}>
                                {format(day, 'd')}
                            </div>
                            
                            {/* Efficiency Dot */}
                            <div className="mt-1 h-1 w-full max-w-[20px] rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                <div 
                                    className={cn("h-full transition-all", efficiency >= 100 ? "bg-emerald-500" : efficiency > 50 ? "bg-yellow-500" : "bg-transparent")} 
                                    style={{ width: `${efficiency}%` }} 
                                />
                            </div>
                        </div>
                    );
                })}

                {/* Task Rows */}
                {tasks.map((task, idx) => (
                    <>
                        {/* Task Title Cell */}
                        <div key={`title-${task._id}`} className={cn(
                            "sticky left-0 z-10 p-3 px-5 text-sm font-semibold border-b border-r border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-[4px_0_15px_-5px_rgba(0,0,0,0.1)] transition-colors",
                            idx % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-zinc-50/50 dark:bg-zinc-900/30"
                        )}>
                            <div className="flex items-center gap-3 truncate">
                                <span className={cn("w-1.5 h-1.5 rounded-full", task.active ? "bg-green-500 animate-pulse" : "bg-zinc-300")} />
                                <span className="truncate max-w-[140px]">{task.title}</span>
                            </div>
                            {/* Fire Icon for streak if relevant data existed in task object, simpler to just show category icon or similar */}
                             <div className="flex items-center gap-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                                 LVL 1
                             </div>
                        </div>

                        {/* Checkbox Cells */}
                        {days.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const isCompleted = logs[`${task._id}-${dateStr}`];
                            
                            const isFutureDate = day > new Date();
                            const isTodayDate = isSameDay(day, new Date());
                            const isPastDate = !isFutureDate;

                            return (
                                <div key={`${task._id}-${day.toISOString()}`} className={cn(
                                    "p-1 border-b border-r border-zinc-100 dark:border-zinc-800/50 last:border-r-0 flex items-center justify-center",
                                     idx % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-zinc-50/50 dark:bg-zinc-900/30"
                                )}>
                                    <button
                                        disabled={isFutureDate} 
                                        onClick={() => handleToggle(task._id, day)}
                                        className={cn(
                                            "relative w-full h-full min-h-[40px] min-w-[40px] m-1 rounded-lg flex items-center justify-center transition-all duration-300 group",
                                            isCompleted 
                                                ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-md shadow-green-500/20 md:hover:scale-105" 
                                                : isPastDate 
                                                    ? "bg-zinc-100 dark:bg-zinc-900 md:hover:bg-zinc-200 dark:md:hover:bg-zinc-800"
                                                    : "opacity-0", // Future
                                            !isCompleted && isPastDate && "bg-zinc-100/50 dark:bg-zinc-900/50" // Dim empty historical cells
                                        )}
                                        title={`${task.title} - ${format(day, 'MMM d')}`}
                                    >
                                        {isCompleted && (
                                            <Check className="h-5 w-5 text-white stroke-[3]" />
                                        )}
                                        {/* Missed Indicator (Subtle Dot) */}
                                        {!isCompleted && isPastDate && !isTodayDate && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-800 group-hover:bg-red-400 transition-colors" />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </>
                ))}
            </div>
            
            {tasks.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Protocol Matrix Empty</h3>
                        <p className="text-muted-foreground">Initialize habit protocols to begin tracking.</p>
                    </div>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
