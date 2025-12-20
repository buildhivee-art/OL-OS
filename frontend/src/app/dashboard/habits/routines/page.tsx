'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HabitNav } from '@/components/HabitNav';
import { Layers, Play, Clock, Plus, GripVertical, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Types
interface RoutineStep {
    id: string;
    title: string;
    duration: number; // minutes
}

interface Routine {
    id: string;
    title: string;
    icon: string;
    color: string;
    description: string;
    steps: RoutineStep[];
}

// Dummy Data
const DEFAULT_ROUTINES: Routine[] = [
    {
        id: '1',
        title: 'Morning Launchpad',
        icon: '☀️',
        color: 'bg-orange-500',
        description: 'High energy start to the day. Focus on hydration and movement.',
        steps: [
            { id: 'm1', title: 'Drink 500ml Water', duration: 1 },
            { id: 'm2', title: 'Stretch / Yoga', duration: 10 },
            { id: 'm3', title: 'Cold Shower', duration: 5 },
            { id: 'm4', title: 'Review Daily Goals', duration: 5 }
        ]
    },
    {
        id: '2',
        title: 'Deep Work Entry',
        icon: '🧠',
        color: 'bg-indigo-500',
        description: 'Transition ritual to enter flow state.',
        steps: [
            { id: 'd1', title: 'Clear Desk', duration: 2 },
            { id: 'd2', title: 'Put Phone Away', duration: 1 },
            { id: 'd3', title: 'Set Focus Music', duration: 1 },
            { id: 'd4', title: 'Define ONE Goal', duration: 2 }
        ]
    },
    {
        id: '3',
        title: 'Evening Shutdown',
        icon: '🌙',
        color: 'bg-slate-700',
        description: 'Detach from work and prepare for sleep.',
        steps: [
            { id: 'e1', title: 'Close open tabs', duration: 2 },
            { id: 'e2', title: 'Review tomorrow', duration: 5 },
            { id: 'e3', title: 'Tidy workspace', duration: 5 },
            { id: 'e4', title: 'Read fiction', duration: 20 }
        ]
    },
    {
        id: '4',
        title: 'Weekly Review',
        icon: '📅',
        color: 'bg-rose-500',
        description: 'Reflect on the past week and plan the next.',
        steps: [
            { id: 'w1', title: 'Review Calendar', duration: 5 },
            { id: 'w2', title: 'Check Finance', duration: 10 },
            { id: 'w3', title: 'Plan Next Week', duration: 15 },
            { id: 'w4', title: 'Journal Reflections', duration: 10 }
        ]
    },
    {
        id: '5',
        title: 'Fitness Protocol',
        icon: '💪',
        color: 'bg-emerald-600',
        description: 'Pre-workout activation sequence.',
        steps: [
            { id: 'f1', title: 'Put on Gear', duration: 5 },
            { id: 'f2', title: 'Pre-workout Meal', duration: 10 },
            { id: 'f3', title: 'Fill Water Bottle', duration: 2 },
            { id: 'f4', title: 'Dynamic Stretching', duration: 5 }
        ]
    }
];

export default function RoutineStacksPage() {
    const [routines, setRoutines] = useState<Routine[]>(DEFAULT_ROUTINES);
    const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
    const [playerMode, setPlayerMode] = useState(false);
    
    // Player State
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // New Routine Form
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const startRoutine = (routine: Routine) => {
        setActiveRoutine(routine);
        setPlayerMode(true);
        setCurrentStepIndex(0);
        setTimer(routine.steps[0].duration * 60);
        setIsPlaying(true);
    };

    const nextStep = () => {
        if (!activeRoutine) return;
        if (currentStepIndex < activeRoutine.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setTimer(activeRoutine.steps[currentStepIndex + 1].duration * 60);
        } else {
            // Finished
            setPlayerMode(false);
            setActiveRoutine(null);
            setIsPlaying(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer Effect
    // In a real app, use a proper hook or worker
    
    return (
        <div className="space-y-6 min-h-screen">
             <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight">Routine Stacks</h1>
                     <p className="text-muted-foreground">Chain habits together for frictionless execution.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                         <Button><Plus className="w-4 h-4 mr-2" /> Create Routine</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Routine Stack</DialogTitle>
                            <DialogDescription>Define a sequence of steps.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input placeholder="Routine Name (e.g. Sunday Reset)" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                             <p className="text-xs text-muted-foreground">Builder functionality coming in next update.</p>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsCreateOpen(false)}>Save Draft</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <HabitNav />

            {/* ROUTINE CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routines.map((routine) => (
                    <Card key={routine.id} className="relative overflow-hidden group hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: routine.color.replace('bg-', '') }}>
                        {/* Background Decoration */}
                        <div className={cn("absolute right-0 top-0 w-32 h-32 opacity-10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110", routine.color)} />
                        
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="text-4xl mb-2">{routine.icon}</div>
                                <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 shadow-sm" onClick={() => startRoutine(routine)}>
                                    <Play className="w-4 h-4 ml-0.5" />
                                </Button>
                            </div>
                            <CardTitle>{routine.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{routine.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {routine.steps.slice(0, 3).map((step, i) => (
                                    <div key={step.id} className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0">
                                            {i + 1}
                                        </div>
                                        <span className="truncate flex-1">{step.title}</span>
                                        <span className="text-xs opacity-50 whitespace-nowrap">{step.duration}m</span>
                                    </div>
                                ))}
                                {routine.steps.length > 3 && (
                                    <div className="text-xs text-center text-muted-foreground pt-1">
                                        + {routine.steps.length - 3} more steps
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex items-center justify-between text-xs font-medium text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {routine.steps.reduce((acc, s) => acc + s.duration, 0)} min total</span>
                                <span>{routine.steps.length} steps</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* FULL SCREEN PLAYER MODAL */}
            <AnimatePresence>
                {playerMode && activeRoutine && (
                    <motion.div 
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 bg-background flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 flex justify-between items-center border-b">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <span className="text-2xl">{activeRoutine.icon}</span> {activeRoutine.title}
                                </h2>
                                <p className="text-muted-foreground text-sm">Step {currentStepIndex + 1} of {activeRoutine.steps.length}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setPlayerMode(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 max-w-2xl mx-auto w-full">
                            
                            {/* Visual Progress */}
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div 
                                    className={cn("h-full", activeRoutine.color)} 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStepIndex) / activeRoutine.steps.length) * 100}%` }}
                                />
                            </div>

                            {/* Current Task */}
                            <AnimatePresence mode='wait'>
                                <motion.div 
                                    key={currentStepIndex}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="space-y-6"
                                >
                                    <Badge variant="outline" className="px-4 py-1 text-lg mb-4 mx-auto w-fit uppercase tracking-widest bg-background">
                                        Current Focus
                                    </Badge>
                                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                                        {activeRoutine.steps[currentStepIndex].title}
                                    </h1>
                                    <p className="text-3xl font-mono text-muted-foreground font-light">
                                        {activeRoutine.steps[currentStepIndex].duration}:00
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer Controls */}
                        <div className="p-8 border-t bg-secondary/10">
                            <div className="max-w-2xl mx-auto flex items-center justify-between">
                                <Button variant="outline" size="lg" className="px-8" onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))} disabled={currentStepIndex === 0}>
                                    Previous
                                </Button>
                                
                                <Button size="lg" className={cn("px-12 h-14 text-lg shadow-xl hover:scale-105 transition-transform", activeRoutine.color)} onClick={nextStep}>
                                    {currentStepIndex === activeRoutine.steps.length - 1 ? (
                                        <>Complete Routine <CheckCircle2 className="w-5 h-5 ml-2" /></>
                                    ) : (
                                        <>Next Step <ChevronRight className="w-5 h-5 ml-2" /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
