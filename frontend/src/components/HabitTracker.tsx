'use client';

import { useState, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Check, Activity, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type ViewMode = 'week' | 'month' | 'quarter';

export function HabitTracker() {
  const { tasks, logs, metrics, fetchLogs, fetchMetrics, toggleLog, updateMetric } = useTaskStore();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Metric Editing State
  const [editingMetric, setEditingMetric] = useState<{date: Date, type: 'weight' | 'hp', value: string} | null>(null);

  // Calculate Date Range based on View Mode
  const getDateRange = () => {
    let start, end;
    if (viewMode === 'week') {
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

  const getDailyScore = (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let completedCount = 0;
      tasks.forEach(task => {
          if (logs[`${task._id}-${dateStr}`]) completedCount++;
      });
      return completedCount * 2;
  };

  const saveMetric = async () => {
      if (!editingMetric) return;
      const dateStr = format(editingMetric.date, 'yyyy-MM-dd');
      try {
          await updateMetric(dateStr, { [editingMetric.type]: parseFloat(editingMetric.value) });
          setEditingMetric(null);
          toast.success('Metric updated');
      } catch {
          toast.error('Failed to update metric');
      }
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
                            isToday ? "bg-primary/5 " : "bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        )}>
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isToday ? "text-primary" : "text-muted-foreground")}>{format(day, 'EEE')}</span>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                isToday ? "bg-primary dark:bg-white text-white dark:text-black shadow-lg shadow-primary/20 scale-110" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
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

                {/* VISUAL SEPARATOR */}
                <div className="sticky left-0 z-10 p-2 bg-zinc-50 dark:bg-zinc-900 border-b border-r border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-[4px_0_15px_-5px_rgba(0,0,0,0.1)]">
                    Vital Metrics
                </div>
                {days.map(day => (
                     <div key={`sep-${day.toISOString()}`} className="border-b border-r border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30" />
                ))}

                {/* ROW: DAILY SCORE */}
                <div className="sticky left-0 z-10 p-3 px-5 text-sm font-semibold border-b border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between shadow-[4px_0_15px_-5px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Daily Score</span>
                    </div>
                </div>
                {days.map(day => {
                    const score = getDailyScore(day);
                    return (
                        <div key={`score-${day.toISOString()}`} className="p-1 border-b border-r border-zinc-100 dark:border-zinc-800/50 flex items-center justify-center bg-white dark:bg-zinc-950">
                            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{score}</span>
                        </div>
                    );
                })}

                {/* ROW: WEIGHT */}
                <div className="sticky left-0 z-10 p-3 px-5 text-sm font-semibold border-b border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between shadow-[4px_0_15px_-5px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>Weight (kg)</span>
                    </div>
                </div>
                {days.map(day => {
                   const dateStr = format(day, 'yyyy-MM-dd');
                   const val = metrics[dateStr]?.weight;
                   const isFuture = day > new Date();
                   return (
                       <div key={`weight-${day.toISOString()}`} className="p-1 border-b border-r border-zinc-100 dark:border-zinc-800/50 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/30">
                           <button 
                                disabled={isFuture}
                                onClick={() => setEditingMetric({ date: day, type: 'weight', value: val ? val.toString() : '' })}
                                className="w-full h-full min-h-[40px] rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs font-mono text-muted-foreground hover:text-foreground flex items-center justify-center"
                           >
                               {val || '-'}
                           </button>
                       </div>
                   );
                })}

                {/* ROW: HP */}
                <div className="sticky left-0 z-10 p-3 px-5 text-sm font-semibold border-b border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between shadow-[4px_0_15px_-5px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span>Sleep / HP</span>
                    </div>
                </div>
                {days.map(day => {
                   const dateStr = format(day, 'yyyy-MM-dd');
                   const val = metrics[dateStr]?.hp;
                   const isFuture = day > new Date();
                   return (
                       <div key={`hp-${day.toISOString()}`} className="p-1 border-b border-r border-zinc-100 dark:border-zinc-800/50 flex items-center justify-center bg-white dark:bg-zinc-950">
                           <button 
                                disabled={isFuture}
                                onClick={() => setEditingMetric({ date: day, type: 'hp', value: val ? val.toString() : '' })}
                                className="w-full h-full min-h-[40px] rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs font-mono text-muted-foreground hover:text-foreground flex items-center justify-center"
                           >
                               {val || '-'}
                           </button>
                       </div>
                   );
                })}
                
                {/* VISUAL SEPARATOR */}
                <div className="sticky left-0 z-10 p-2 bg-zinc-50 dark:bg-zinc-900 border-b border-r border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-[4px_0_15px_-5px_rgba(0,0,0,0.1)]">
                    Directives
                </div>
                {days.map(day => (
                     <div key={`sep-task-${day.toISOString()}`} className="border-b border-r border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30" />
                ))}

                {/* Task Rows */}
                {tasks.map((task, idx) => (
                    <div key={task._id} style={{ display: 'contents' }}>
                        {/* Task Title Cell */}
                        <div className={cn(
                            "sticky left-0 z-10 p-3 px-5 text-sm font-semibold border-b border-r border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-[4px_0_15px_-5px_rgba(0,0,0,0.1)] transition-colors",
                            idx % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-zinc-50/50 dark:bg-zinc-900/30"
                        )}>
                            <div className="flex items-center gap-3 truncate">
                                <span className={cn("w-1.5 h-1.5 rounded-full", task.active ? "bg-green-500 animate-pulse" : "bg-zinc-300")} />
                                <span className="truncate max-w-[140px]">{task.title}</span>
                            </div>
                             <div className="flex items-center gap-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                                 {task.difficulty || 'Med'}
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
                                        disabled={isFutureDate || (isPastDate && !isTodayDate)} 
                                        onClick={() => handleToggle(task._id, day)}
                                        className={cn(
                                            "relative w-full h-full min-h-[40px] min-w-[40px] m-1 rounded-lg flex items-center justify-center transition-all duration-300 group",
                                            isCompleted 
                                                ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-md shadow-green-500/20 md:hover:scale-105" 
                                                : (isPastDate && !isTodayDate)
                                                    ? "bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50" // Stylized for missed
                                                    : isPastDate 
                                                        ? "bg-zinc-100 dark:bg-zinc-900 md:hover:bg-zinc-200 dark:md:hover:bg-zinc-800"
                                                        : "opacity-0", // Future
                                            !isCompleted && isPastDate && !isTodayDate && "cursor-not-allowed opacity-80" 
                                        )}
                                        title={`${task.title} - ${format(day, 'MMM d')}`}
                                    >
                                        {isCompleted && (
                                            <Check className="h-5 w-5 text-white stroke-[3]" />
                                        )}
                                        
                                        {/* Missed Indicator (Red Cross) */}
                                        {!isCompleted && isPastDate && !isTodayDate && (
                                            <X className="h-5 w-5 text-red-500 dark:text-red-400 stroke-[3]" />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
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

        {/* METRIC EDIT DIALOG */}
        <Dialog open={!!editingMetric} onOpenChange={(open) => !open && setEditingMetric(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log {editingMetric?.type === 'weight' ? 'Body Weight' : 'Sleep / HP'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                         <Label>{editingMetric?.type === 'weight' ? 'Weight (kg)' : 'HP Level (0-10)'}</Label>
                         <Input 
                            type="number" 
                            step="0.1"
                            autoFocus
                            value={editingMetric?.value || ''}
                            onChange={(e) => setEditingMetric(prev => prev ? ({ ...prev, value: e.target.value }) : null)}
                            onKeyDown={(e) => e.key === 'Enter' && saveMetric()}
                         />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={saveMetric}>Save Log</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
