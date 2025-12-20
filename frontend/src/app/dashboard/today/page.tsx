'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { format, isSameDay, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, Circle, Flame, Plus, Calendar as CalendarIcon, 
    Droplets, Battery, Scale, Brain, Quote, Sun, Cloud, Moon, 
    ArrowRight, ChevronRight, Sparkles, Filter 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// --- QUOTES DATABASE ---
const MOTIVATIONAL_QUOTES = [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" }
];

export default function TodayPage() {
    const { tasks, logs, metrics, fetchTasks, fetchLogs, toggleLog, updateMetric, createTask } = useTaskStore();
    const { user } = useAuthStore();
    
    // Local State
    const [todayStr] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [quoteIndex, setQuoteIndex] = useState(new Date().getDate() % MOTIVATIONAL_QUOTES.length);
    const [healthMetrics, setHealthMetrics] = useState({
        weight: '',
        mood: 5,
        energy: 5,
        water: 0
    });

    // Initial Data Fetch
    useEffect(() => {
        fetchTasks();
        fetchLogs(todayStr, todayStr);
        // Pre-fill metrics if available? (Not strictly part of store yet, but good for future)
    }, [fetchTasks, fetchLogs, todayStr]);

    // --- COMPUTED DATA ---
    const todayTasks = useMemo(() => {
        return tasks.filter(task => {
            // Simplified logic: Active tasks are shown. 
            // In a real app, check startDate/endDate overlap.
            return task.active !== false; 
        });
    }, [tasks]);

    const taskStats = useMemo(() => {
        const total = todayTasks.length;
        if (total === 0) return { completed: 0, total: 0, percent: 0, remaining: 0 };
        
        const completed = todayTasks.filter(t => logs[`${t._id}-${todayStr}`]).length;
        return {
            completed,
            total,
            percent: Math.round((completed / total) * 100),
            remaining: total - completed
        };
    }, [todayTasks, logs, todayStr]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: "Good Morning", icon: Sun, color: "text-amber-500" };
        if (hour < 18) return { text: "Good Afternoon", icon: Cloud, color: "text-blue-500" };
        return { text: "Good Evening", icon: Moon, color: "text-indigo-500" };
    }, []);

    // --- HANDLERS ---

    const handleToggle = async (taskId: string) => {
        try {
            await toggleLog(taskId, todayStr);
            // Optional: sound or subtle confetti could go here
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        
        try {
            setIsAddingTask(true);
            await createTask({
                title: newTaskTitle,
                difficulty: 'Medium',
                active: true,
                startDate: todayStr,
                category: 'General' // Default for quick add
            });
            setNewTaskTitle('');
            toast.success("Task added to your day");
        } catch (error) {
            toast.error("Failed to create task");
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleMetricUpdate = (key: string, value: any) => {
        setHealthMetrics(prev => ({ ...prev, [key]: value }));
        // Debounce or save on blur generally better, but for demo:
        // updateMetric(todayStr, { [key]: value }); 
    };

    const filteredTasks = useMemo(() => {
        if (activeTab === 'all') return todayTasks;
        if (activeTab === 'pending') return todayTasks.filter(t => !logs[`${t._id}-${todayStr}`]);
        if (activeTab === 'completed') return todayTasks.filter(t => logs[`${t._id}-${todayStr}`]);
        return todayTasks;
    }, [todayTasks, logs, todayStr, activeTab]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-background/50 backdrop-blur-sm sticky top-0 z-40 py-4 border-b border-border/40 -mx-6 px-6 md:-mx-8 md:px-8">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm font-medium uppercase tracking-wider">
                        <CalendarIcon className="w-4 h-4" />
                        {format(new Date(), 'EEEE, MMMM do, yyyy')}
                    </div>
                    <div className="flex items-center gap-3">
                         <greeting.icon className={cn("w-8 h-8", greeting.color)} />
                         <h1 className="text-4xl font-bold tracking-tight text-foreground">
                            {greeting.text}, {user?.name?.split(' ')[0] || 'Architect'}.
                         </h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Daily Progress</span>
                        <div className="text-2xl font-bold font-mono text-primary">{taskStats.percent}%</div>
                    </div>
                    <div className="w-full md:w-[200px] h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${taskStats.percent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: MAIN AGENDA */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* MOTIVATION CARD */}
                    <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Quote className="w-32 h-32 -rotate-12" />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <figure className="max-w-3xl">
                                <blockquote className="text-xl md:text-2xl font-serif italic leading-relaxed text-foreground/90">
                                    &ldquo;{MOTIVATIONAL_QUOTES[quoteIndex].text}&rdquo;
                                </blockquote>
                                <figcaption className="mt-4 flex items-center gap-2 text-muted-foreground font-medium">
                                    <span className="w-8 h-[1px] bg-primary"></span>
                                    {MOTIVATIONAL_QUOTES[quoteIndex].author}
                                </figcaption>
                            </figure>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
                                className="absolute bottom-4 right-4 text-xs text-muted-foreground hover:text-primary"
                            >
                                <Sparkles className="w-3 h-3 mr-1" /> New Wisdom
                            </Button>
                        </CardContent>
                    </Card>

                    {/* TASKS & HABITS */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <Brain className="w-6 h-6 text-indigo-500" />
                                Mission Control
                            </h2>
                            <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg">
                                <Button 
                                    variant={activeTab === 'all' ? "secondary" : "ghost"} 
                                    size="sm" 
                                    onClick={() => setActiveTab('all')}
                                    className="text-xs h-7"
                                >
                                    All
                                </Button>
                                <Button 
                                    variant={activeTab === 'pending' ? "secondary" : "ghost"} 
                                    size="sm" 
                                    onClick={() => setActiveTab('pending')}
                                    className="text-xs h-7"
                                >
                                    Pending
                                </Button>
                                <Button 
                                    variant={activeTab === 'completed' ? "secondary" : "ghost"} 
                                    size="sm" 
                                    onClick={() => setActiveTab('completed')}
                                    className="text-xs h-7"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>

                        {/* Quick Add
                        <form onSubmit={handleCreateTask} className="relative group">
                            <Input 
                                placeholder="What needs to be done today? Press Enter..." 
                                className="pl-12 py-6 bg-background/50 backdrop-blur-sm border-dashed border-border/60 focus:border-primary transition-all"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                disabled={isAddingTask}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {isAddingTask ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" /> : <Plus className="w-5 h-5" />}
                            </div>
                        </form> */}

                        {/* Task List */}
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {filteredTasks.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="py-12 text-center text-muted-foreground border border-dashed rounded-xl"
                                    >
                                        <p>No tasks found for this view.</p>
                                    </motion.div>
                                ) : (
                                    filteredTasks.map((task) => {
                                        const isDone = !!logs[`${task._id}-${todayStr}`];
                                        return (
                                            <motion.div
                                                key={task._id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={cn(
                                                    "group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 bg-background/60 hover:shadow-md hover:border-primary/20",
                                                    isDone ? "opacity-60 bg-muted/30 border-transparent" : "opacity-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <button 
                                                        onClick={() => handleToggle(task._id)}
                                                        className={cn(
                                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                                            isDone 
                                                                ? "bg-green-500 border-green-500 text-white" 
                                                                : "border-muted-foreground/30 text-transparent hover:border-green-500 hover:text-green-500/20"
                                                        )}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    
                                                    <div className="flex-1">
                                                        <p className={cn(
                                                            "font-medium text-base transition-all",
                                                            isDone && "line-through text-muted-foreground"
                                                        )}>
                                                            {task.title}
                                                        </p>
                                                        {task.category && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-[10px] h-5 px-2 font-normal text-muted-foreground">
                                                                    {(typeof task.category === 'object' ? task.category.name : task.category) || 'General'}
                                                                </Badge>
                                                                {task.description && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{task.description}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Filter className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: WELLNESS & EXTRAS */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* METRICS CARD */}
                    <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className=" flex items-center gap-2">
                                <Scale className="w-5 h-5 text-emerald-500" />
                                Daily Biometrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Morning Weight (kg)</label>
                                <div className="flex gap-2">
                                    <Input 
                                        type="number" 
                                        placeholder="0.0" 
                                        value={healthMetrics.weight} 
                                        onChange={(e) => handleMetricUpdate('weight', e.target.value)}
                                        className="font-mono"
                                    />
                                    <Button size="sm" variant="outline" onClick={() => updateMetric(todayStr, { weight: parseFloat(healthMetrics.weight) })}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Sun className="w-3 h-3" /> Energy</label>
                                    <Input 
                                        type="number" 
                                        max={10} min={1} 
                                        value={healthMetrics.energy} 
                                        onChange={(e) => handleMetricUpdate('energy', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Brain className="w-3 h-3" /> Mood</label>
                                    <Input 
                                        type="number" 
                                        max={10} min={1} 
                                        value={healthMetrics.mood} 
                                        onChange={(e) => handleMetricUpdate('mood', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                                    <Droplets className="w-3 h-3 text-blue-500" /> Water Intake ({healthMetrics.water} cups)
                                </label>
                                <div className="flex gap-1">
                                    {[1,2,3,4,5,6,7,8].map(i => (
                                        <button 
                                            key={i}
                                            onClick={() => handleMetricUpdate('water', i)}
                                            className={cn(
                                                "flex-1 h-8 rounded-md transition-all",
                                                i <= healthMetrics.water ? "bg-blue-500" : "bg-secondary hover:bg-blue-500/30"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* FOCUS TIMER WIDGET (Mini) */}
                    <Card className="bg-indigo-600 text-white overflow-hidden relative cursor-pointer hover:shadow-lg hover:shadow-indigo-500/20 transition-all group">
                         <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                         <CardContent className="p-6 relative z-10 flex flex-col items-center text-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                 <Flame className="w-6 h-6 text-white" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-lg">Deep Work Session</h3>
                                 <p className="text-indigo-100 text-sm">Ready to enter flow state?</p>
                             </div>
                             <Button variant="secondary" className="w-full text-indigo-700 font-bold">
                                 Start Timer
                             </Button>
                         </CardContent>
                    </Card>

                    {/* NEXT MILESTONE */}
                    <Card className="border-dashed border-border/60 bg-transparent">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Upcoming</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3 items-center opacity-50">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <div>
                                        <p className="text-sm font-medium">Weekly Review</p>
                                        <p className="text-xs text-muted-foreground">Sunday, 8:00 PM</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-center opacity-50">
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                    <div>
                                        <p className="text-sm font-medium">Monthly Reset</p>
                                        <p className="text-xs text-muted-foreground">Dec 31st</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
