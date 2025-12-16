'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFocusStore } from '@/stores/focusStore';
import { useTaskStore } from '@/stores/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Maximize2, Minimize2, Flame, Wand2, Zap, Palette, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type VisualTheme = 'nebula' | 'cyber' | 'sunset' | 'minimal';

export default function FocusPage() {
    const { 
        isActive, isPaused, timeLeft, initialTime, activeTaskId,
        startSession, pauseSession, resumeSession, stopSession, tick 
    } = useFocusStore();
    
    const { tasks, fetchTasks } = useTaskStore();
    
    // Local State
    const [selectedTask, setSelectedTask] = useState<string>('');
    const [customDuration, setCustomDuration] = useState<string>('25');
    const [intention, setIntention] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [theme, setTheme] = useState<VisualTheme>('nebula');

    useEffect(() => {
        fetchTasks();
    }, []);

    // Timer Ticker
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && !isPaused) {
            interval = setInterval(() => {
                tick();
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            // Completed
             toast.success("Session Complete! +X XP Gained");
             // The store handles reset, but we might want a summary screen later
        }
        return () => clearInterval(interval);
    }, [isActive, isPaused, tick, timeLeft]);

    // Format mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
    const gainedXp = Math.floor((initialTime - timeLeft) / 60 * 10); // 10 XP per min

    const handleStart = () => {
        const minutes = parseInt(customDuration);
        startSession(minutes, selectedTask || null);
        setIsFullscreen(true);
    };

    const activeTask = tasks.find(t => t._id === activeTaskId);

    // Dynamic styles based on theme
    const getThemeStyles = () => {
        switch(theme) {
            case 'cyber': return {
                bg: "bg-zinc-950",
                text: "text-green-500",
                accent: "border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]",
                progress: "bg-green-500",
                font: "font-mono"
            };
            case 'sunset': return {
                bg: "bg-orange-950",
                text: "text-orange-100",
                accent: "border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.2)]",
                progress: "bg-orange-500",
                font: "font-sans"
            };
            case 'minimal': return {
                bg: "bg-black",
                text: "text-white",
                accent: "border-white/20",
                progress: "bg-white",
                font: "font-sans"
            };
            default: return { // Nebula
                bg: "bg-slate-950",
                text: "text-slate-100",
                accent: "border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]",
                progress: "bg-indigo-500",
                font: "font-sans"
            };
        }
    };
    
    const style = getThemeStyles();

    return (
        <div className={cn(
            "flex flex-col items-center min-h-[calc(100vh-4rem)] transition-all duration-700 ease-in-out",
            isFullscreen ? `fixed inset-0 z-50 p-0 justify-center ${style.bg}` : "justify-start py-8 space-y-8 bg-background"
        )}>
            
            {/* SETUP SCREEN */}
            {!isActive && (
                <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 ring-1 ring-primary/20">
                            <Flame className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">Flow State</h1>
                        <p className="text-lg text-muted-foreground">Configuration required. Initialize deep work protocol.</p>
                    </div>

                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                                <Wand2 className="w-4 h-4" /> Session Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Main Objective</label>
                                <Input 
                                    placeholder="What are you trying to achieve?" 
                                    value={intention}
                                    onChange={(e) => setIntention(e.target.value)}
                                    className="h-12 text-lg bg-secondary/50 border-transparent focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold">Linked Habit Protocol</label>
                                <Select value={selectedTask} onValueChange={setSelectedTask}>
                                    <SelectTrigger className="h-12 bg-secondary/50 border-transparent">
                                        <SelectValue placeholder="Select a task (Optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="freestyle">Freestyle (No specific task)</SelectItem>
                                        {tasks.filter(t => t.active).map(task => (
                                            <SelectItem key={task._id} value={task._id}>{task.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold">Duration</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { m: '15', label: 'Quick' }, 
                                        { m: '25', label: 'Pomodoro' }, 
                                        { m: '45', label: 'Deep' }, 
                                        { m: '60', label: 'Marathon' }
                                    ].map(opt => (
                                        <Button 
                                            key={opt.m} 
                                            variant={customDuration === opt.m ? "default" : "outline"}
                                            onClick={() => setCustomDuration(opt.m)}
                                            className={cn("h-16 flex flex-col gap-1 transition-all", customDuration === opt.m ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100")}
                                        >
                                            <span className="text-xl font-bold">{opt.m}</span>
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{opt.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            
                            <Button size="lg" className="w-full h-14 text-xl font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform" onClick={handleStart}>
                                <Play className="mr-2 w-6 h-6 fill-current" /> Engage
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ACTIVE SESSION UI */}
            {isActive && (
                <div 
                    className={cn("relative w-full h-full flex flex-col items-center justify-center overflow-hidden", style.text)}
                    onMouseMove={() => { setShowControls(true); }}
                    onClick={() => { setShowControls(!showControls); }}
                >   
                    {/* VISUAL THEME BACKGROUNDS */}
                    <div className={cn("absolute inset-0 transition-opacity duration-1000", isPaused ? "opacity-10" : "opacity-100")}>
                        {theme === 'nebula' && (
                            <>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                                <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[100px] animate-bounce" style={{ animationDuration: '10s' }} />
                            </>
                        )}
                        {theme === 'cyber' && (
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,50,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,50,0,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                        )}
                        {theme === 'sunset' && (
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-500/20 to-transparent blur-3xl opacity-50" />
                        )}
                    </div>

                    {/* Navbar Controls (Fade out) */}
                    <div className={cn("absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 transition-opacity duration-500", showControls ? "opacity-100" : "opacity-0 pointer-events-none")}>
                        <div className="flex flex-col">
                             <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">Current Objective</h2>
                             <div className="text-2xl font-bold flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full animate-pulse", style.progress)} />
                                {intention || activeTask?.title || "Deep Focus"}
                             </div>
                             {/* XP Display */}
                             <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md">
                                 <Trophy className="w-3 h-3 text-yellow-500" />
                                 <span className="text-xs font-mono font-bold">+{gainedXp} XP Generated</span>
                             </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); }}>
                                {isFullscreen ? <Minimize2 /> : <Maximize2 />}
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-red-500/20 hover:text-red-500" onClick={(e) => { e.stopPropagation(); stopSession(); }}>
                                <Square className="w-4 h-4 fill-current" />
                            </Button>
                        </div>
                    </div>

                    {/* Main Timer Display */}
                    <div className={cn("relative z-10 flex flex-col items-center gap-8 scale-110 md:scale-150 transition-transform duration-500", style.font)}>
                         <div className={cn("relative font-black text-[8rem] md:text-[14rem] leading-none tracking-tighter select-none tabular-nums drop-shadow-2xl transition-colors", style.text)}>
                             {formatTime(timeLeft)}
                             
                             {/* Paused Overlay */}
                             {isPaused && (
                                 <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-20 rounded-3xl">
                                     <span className="text-lg font-bold uppercase tracking-[1rem] opacity-70 animate-pulse">Paused</span>
                                 </div>
                             )}
                         </div>

                         {/* Play/Pause Main Button */}
                         <div className={cn("transition-opacity duration-500", showControls ? "opacity-100" : "opacity-0")}>
                             <Button 
                                size="icon" 
                                className={cn("h-24 w-24 rounded-full shadow-2xl scale-100 hover:scale-105 transition-all text-white", style.progress, style.accent)}
                                onClick={(e) => { e.stopPropagation(); isPaused ? resumeSession() : pauseSession(); }}
                             >
                                 {isPaused ? <Play className="w-10 h-10 ml-2 fill-current" /> : <Pause className="w-10 h-10 fill-current" />}
                             </Button>
                         </div>
                    </div>

                    {/* Progress Bar (Bottom) */}
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-white/10">
                        <div 
                            className={cn("h-full transition-all duration-1000 ease-linear", style.progress)}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Theme Controls (Bottom Center) */}
                    <div className={cn("absolute bottom-12 z-50 transition-all duration-500 transform translate-y-0", showControls ? "opacity-100" : "opacity-0 translate-y-10")}>
                        <div className="flex items-center gap-2 p-1.5 rounded-full bg-zinc-900/90 text-white backdrop-blur-md border border-white/10 shadow-2xl">
                             <div className="px-3 text-xs uppercase font-bold tracking-widest text-zinc-500 flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Theme
                             </div>
                             {['nebula', 'cyber', 'sunset', 'minimal'].map(t => (
                                 <button
                                    key={t}
                                    onClick={(e) => { e.stopPropagation(); setTheme(t as VisualTheme); }}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all",
                                        theme === t ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                    )}
                                 >
                                     {t}
                                 </button>
                             ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
