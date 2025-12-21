'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Dumbbell, Type, CheckSquare, Clock } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTaskStore } from '@/stores/taskStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useContentStore } from '@/stores/contentStore';

import { useSettingsStore } from '@/stores/settingsStore';

// Unified Event Interface
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'workout' | 'content';
  completed?: boolean;
}

export default function SchedulePage() {
    // Stores
    const { tasks, fetchTasks } = useTaskStore();
    const { workouts, fetchWorkouts } = useWorkoutStore();
    const { contents, fetchContents } = useContentStore();
    const { weekStart } = useSettingsStore();

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Initial Fetch
    useEffect(() => {
        fetchTasks();
        fetchWorkouts();
        fetchContents();
    }, [fetchTasks, fetchWorkouts, fetchContents]);

    // Data Processing: Merge into unified events
    const events = useMemo(() => {
        const allEvents: CalendarEvent[] = [];

        // Tasks
        tasks.forEach(task => {
            if (task.startDate) {
                allEvents.push({
                    id: task._id,
                    title: task.title,
                    date: new Date(task.startDate),
                    type: 'task',
                    completed: !task.active // Assuming active=false means completed or archived? Or maybe we need a status field. Using !active for now.
                });
            }
        });

        // Workouts
        workouts.forEach(workout => {
             // Workouts are usually past logs, but we might have routines scheduled? 
             // For now mapping actual workout logs
             if (workout.date) {
                 allEvents.push({
                     id: workout._id,
                     title: workout.name,
                     date: new Date(workout.date),
                     type: 'workout',
                     completed: true
                 });
             }
        });

        // Content
        contents.forEach(content => {
            if (content.scheduledDate) {
                allEvents.push({
                    id: content._id || 'temp-id',
                    title: content.title,
                    date: new Date(content.scheduledDate),
                    type: 'content',
                    completed: content.status === 'published'
                });
            }
        });

        return allEvents;
    }, [tasks, workouts, contents]);

    // Calendar Generation
    const days = useMemo(() => {
        const weekStartsOn = weekStart === 'monday' ? 1 : 0;
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn });
        const endDate = endOfWeek(monthEnd, { weekStartsOn });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentDate, weekStart]);

    // Selected Day Events
    const selectedDayEvents = useMemo(() => {
        return events.filter(event => isSameDay(event.date, selectedDate));
    }, [events, selectedDate]);

    // Render Helpers
    const getEventsForDay = (day: Date) => events.filter(e => isSameDay(e.date, day));

    const getEventTypeColor = (type: string) => {
        switch(type) {
            case 'task': return 'bg-blue-500 text-blue-50';
            case 'workout': return 'bg-emerald-500 text-emerald-50';
            case 'content': return 'bg-purple-500 text-purple-50';
            default: return 'bg-gray-500';
        }
    };

    const getEventIcon = (type: string) => {
        switch(type) {
            case 'task': return <CheckSquare className="w-4 h-4" />;
            case 'workout': return <Dumbbell className="w-4 h-4" />;
            case 'content': return <Type className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const weekDays = weekStart === 'monday' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Schedule</h1>
                    <p className="text-muted-foreground">Unified Timeline Operation</p>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                         <ChevronLeft className="w-4 h-4" />
                     </Button>
                     <div className="text-lg font-bold w-40 text-center">
                         {format(currentDate, 'MMMM yyyy')}
                     </div>
                     <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                         <ChevronRight className="w-4 h-4" />
                     </Button>
                     <Button variant="secondary" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>
                         Today
                     </Button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* CALENDAR GRID */}
                <Card className="flex-1 flex flex-col shadow-xl border-zinc-200 dark:border-zinc-800">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
                        {weekDays.map(day => (
                            <div key={day} className="py-3 text-center text-sm font-semibold text-muted-foreground bg-zinc-50/50 dark:bg-zinc-900/50">
                                {day}
                            </div>
                        ))}
                    </div>
                    
                    {/* Days */}
                    <div className="flex-1 grid grid-cols-7 grid-rows-6">
                        {days.map((day, dayIdx) => {
                            const dayEvents = getEventsForDay(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, currentDate);

                            return (
                                <div 
                                    key={day.toString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "min-h-[80px] p-2 border-b border-r border-zinc-100 dark:border-zinc-800/50 transition-colors cursor-pointer relative hover:bg-zinc-50 dark:hover:bg-zinc-900/40",
                                        !isCurrentMonth && "bg-zinc-50/30 dark:bg-zinc-950/30 text-muted-foreground/30",
                                        isSelected && "bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-inset ring-primary z-10"
                                    )}
                                >
                                    <div className={cn(
                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                                        isToday(day) ? "bg-primary text-primary-foreground" : "text-zinc-700 dark:text-zinc-300"
                                    )}>
                                        {format(day, 'd')}
                                    </div>
                                    
                                    {/* Event Dots */}
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map(event => (
                                            <div key={event.id} className={cn("text-[10px] truncate px-1 rounded-sm w-full font-medium flex items-center gap-1", getEventTypeColor(event.type))}>
                                                 <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                                                 {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="text-[10px] text-muted-foreground pl-1">
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* SIDEBAR: Selected Day Agenda */}
                <div className="w-80 flex flex-col gap-4">
                     <Card className="flex-1 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col">
                        <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 py-4">
                            <CardTitle className="flex justify-between items-center">
                                <span>{format(selectedDate, 'EEEE')}</span>
                                <span className="text-muted-foreground font-normal text-sm">{format(selectedDate, 'MMM d, yyyy')}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-0">
                            {selectedDayEvents.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
                                     <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                         <CalendarIcon className="w-8 h-8 opacity-20" />
                                     </div>
                                     <p>No events scheduled.</p>
                                     <Button variant="outline" size="sm">Add Event</Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {selectedDayEvents.map(event => (
                                        <div key={event.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                            <div className="flex items-start gap-3">
                                                <div className={cn("p-2 rounded-lg mt-0.5", getEventTypeColor(event.type), "bg-opacity-10 text-opacity-100")}>
                                                    {getEventIcon(event.type)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <h4 className={cn("font-medium text-sm leading-none", event.completed && "line-through text-muted-foreground")}>
                                                        {event.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider h-5 px-1.5">
                                                            {event.type}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(event.date, 'h:mm a')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    );
}
