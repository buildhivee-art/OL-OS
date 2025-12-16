'use client';

import { useState, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
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
       start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
       end = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else if (viewMode === 'month') {
       if (viewMode === 'month') {
           start = subDays(currentDate, 29);
           end = currentDate;
       } else { // Quarter
           start = subDays(currentDate, 89);
           end = currentDate;
       }
    } else {
       start = subDays(currentDate, 6);
       end = currentDate;
    }
    
    if (viewMode === 'week') {
        const today = new Date();
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
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

  const handleMetricUpdate = async (type: 'weight' | 'hp', date: Date, currentValue: number) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const newValue = prompt(`Enter ${type} for ${dateStr}:`, currentValue?.toString());
      if (newValue !== null && !isNaN(parseFloat(newValue))) {
          await updateMetric(dateStr, { [type]: parseFloat(newValue) });
          toast.success('Updated');
      }
  };

  const calculateScore = (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let completedCount = 0;
      tasks.forEach(task => {
          if (logs[`${task._id}-${dateStr}`]) completedCount++;
      });
      return completedCount * 2;
  };

  const navigate = (direction: 'prev' | 'next') => {
      const daysToAdd = viewMode === 'week' ? 7 : viewMode === 'month' ? 30 : 90;
      setCurrentDate(prev => direction === 'next' ? addDays(prev, daysToAdd) : subDays(prev, daysToAdd));
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
         <div className="flex items-center gap-4">
            <CardTitle className="text-xl">Habit Tracker</CardTitle>
            <Button variant="outline" size="sm" onClick={() => seedMetrics().then(() => { toast.success('Seeded!'); fetchMetrics(startStr, endStr); })}>
                Seed Metrics
            </Button>
         </div>
         <div className="flex items-center gap-2">
             <div className="flex items-center rounded-md border bg-background">
                 <Button variant="ghost" size="icon" onClick={() => navigate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                 <span className="w-32 text-center text-sm font-medium">
                     {viewMode === 'week' ? (
                         `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
                     ) : (
                         `Ending ${format(end, 'MMM d')}`
                     )}
                 </span>
                 <Button variant="ghost" size="icon" onClick={() => navigate('next')}><ChevronRight className="h-4 w-4" /></Button>
             </div>
             
             <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                 <SelectTrigger className="w-[120px]">
                     <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                     <SelectItem value="week">Week</SelectItem>
                     <SelectItem value="month">Month</SelectItem>
                     <SelectItem value="quarter">3 Months</SelectItem>
                 </SelectContent>
             </Select>
         </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
            <div className="min-w-fit" style={{ 
                display: 'grid', 
                gridTemplateColumns: `200px repeat(${days.length}, minmax(44px, 1fr))` 
            }}>
                {/* Header Row */}
                <div className="sticky left-0 bg-background z-10 font-semibold text-sm p-4 border-b border-r shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] flex items-center">
                    Habit
                </div>
                {days.map(day => (
                    <div key={day.toISOString()} className={cn(
                        "text-center text-xs p-3 font-medium flex flex-col items-center justify-center border-b border-r last:border-r-0 transition-colors",
                        isSameDay(day, new Date()) ? "bg-primary/5 text-primary ring-inset ring-2 ring-primary/20" : "bg-zinc-50/50 dark:bg-zinc-900/20"
                    )}>
                        <span className="opacity-70">{format(day, 'EEE')}</span>
                        <span className="text-lg font-bold">{format(day, 'd')}</span>
                    </div>
                ))}

                {/* score Row */}
                <div className="sticky left-0 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur z-10 p-3 text-sm font-bold border-b border-r flex items-center text-primary">
                    Daily Score
                </div>
                {days.map(day => (
                    <div key={`score-${day.toISOString()}`} className="p-2 border-b border-r bg-zinc-50/30 dark:bg-zinc-900/10 flex items-center justify-center font-bold text-sm text-primary">
                        {calculateScore(day)}
                    </div>
                ))}
                
                {/* Metrics Rows */}
                <div className="sticky left-0 bg-background z-10 p-3 text-xs font-medium border-b border-r flex items-center text-muted-foreground">
                    Weight (kg)
                </div>
                {days.map(day => {
                   const dateStr = format(day, 'yyyy-MM-dd');
                   const val = metrics[dateStr]?.weight || '-';
                   return (
                    <div key={`weight-${day.toISOString()}`} 
                         onClick={() => handleMetricUpdate('weight', day, metrics[dateStr]?.weight || 0)}
                         className="p-2 border-b border-r cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-xs text-muted-foreground">
                        {val}
                    </div>
                   );
                })}

                <div className="sticky left-0 bg-background z-10 p-3 text-xs font-medium border-b border-r flex items-center text-muted-foreground">
                    HP (Sleep)
                </div>
                {days.map(day => {
                   const dateStr = format(day, 'yyyy-MM-dd');
                   const val = metrics[dateStr]?.hp || '-';
                   return (
                    <div key={`hp-${day.toISOString()}`} 
                         onClick={() => handleMetricUpdate('hp', day, metrics[dateStr]?.hp || 0)}
                         className="p-2 border-b border-r cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-xs text-muted-foreground">
                        {val}
                    </div>
                   );
                })}


                {/* Rows */}
                {tasks.map((task, idx) => (
                    <>
                        {/* Task Title Cell */}
                        <div key={`title-${task._id}`} className={cn(
                            "sticky left-0 bg-background z-10 p-3 text-sm font-medium border-b border-r flex items-center shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]",
                            idx % 2 === 0 ? "bg-background" : "bg-zinc-50/30 dark:bg-zinc-900/10"
                        )}>
                            <div className="truncate w-full" title={task.title}>
                                {task.title}
                            </div>
                        </div>

                        {/* Checkbox Cells */}
                        {days.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const isCompleted = logs[`${task._id}-${dateStr}`];
                            
                            const isFutureDate = day > new Date();
                            const isTodayDate = isSameDay(day, new Date());
                            const isPastDate = !isFutureDate && !isTodayDate;

                            return (
                                <div key={`${task._id}-${day.toISOString()}`} className={cn(
                                    "p-2 border-b border-r last:border-r-0 flex items-center justify-center transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50",
                                     idx % 2 === 0 ? "bg-background" : "bg-zinc-50/30 dark:bg-zinc-900/10"
                                )}>
                                    <button
                                        disabled={isFutureDate} 
                                        onClick={() => handleToggle(task._id, day)}
                                        className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300",
                                            isCompleted 
                                                ? "bg-green-500 text-white shadow-md scale-100" 
                                                : isPastDate 
                                                    ? "bg-red-100 text-red-500 dark:bg-red-900/20 scale-90 hover:bg-red-200 dark:hover:bg-red-900/40"
                                                    : "bg-zinc-200/50 dark:bg-zinc-800/50 text-transparent hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 scale-90 hover:scale-100",
                                            isFutureDate && "opacity-20 cursor-not-allowed"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-5 w-5" />
                                        ) : isPastDate ? (
                                            <X className="h-5 w-5" />
                                        ) : (
                                            <Check className="h-5 w-5 opacity-0" />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </>
                ))}
            </div>
            
            {tasks.length === 0 && (
                <div className="p-12 text-center text-muted-foreground bg-zinc-50/20">
                    <p>No habits to track. Go to "Manage Habits" to create one!</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
