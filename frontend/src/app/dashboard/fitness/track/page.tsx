'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWorkoutStore, Routine, ExerciseSet } from '@/stores/workoutStore';
import { FitnessNav } from '@/components/FitnessNav';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Play, Pause, Save, RotateCcw, ChevronLeft, ChevronRight, 
    Timer, Dumbbell, CheckCircle2, History, X, Plus 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrackSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineId = searchParams.get('routine');
  
  const { routines, createWorkout, fetchRoutines } = useWorkoutStore();
  
  // Session State
  const [activeRoutine, setActiveRoutine] = useState<Partial<Routine> | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0); // seconds
  const [isPaused, setIsPaused] = useState(false);
  
  // Exercise Navigation
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  // Rest Timer
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load data on mount
  useEffect(() => {
      fetchRoutines();
  }, [fetchRoutines]);

  // Initialize Session (Auto-detect if no ID)
  useEffect(() => {
    // If we already have an active routine, don't reset it
    if (activeRoutine) return;

    let foundRoutine: Routine | undefined;

    if (routineId && routines.length > 0) {
        foundRoutine = routines.find(r => r._id === routineId);
    } else if (routines.length > 0) {
        // Auto-detect for TODAY
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        foundRoutine = routines.find(r => r.days && r.days.includes(today));
    }

    if (foundRoutine) {
        setActiveRoutine(foundRoutine);
        // Deep copy exercises to local state for tracking
        setExercises(JSON.parse(JSON.stringify(foundRoutine.exercises)).map((ex: any) => ({
            ...ex,
            sets: ex.sets.map((s: any) => ({ ...s, completed: false, weight: s.weight || 0, reps: s.reps || 0 }))
        })));
        setSessionStartTime(new Date());
    }
  }, [routineId, routines, activeRoutine]);

  // Main Session Timer
  useEffect(() => {
      const interval = setInterval(() => {
          if (!isPaused && sessionStartTime) {
              setSessionDuration(prev => prev + 1);
          }
      }, 1000);
      return () => clearInterval(interval);
  }, [isPaused, sessionStartTime]);

  // Rest Timer
  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isResting && restTimer > 0) {
          interval = setInterval(() => {
              setRestTimer(prev => {
                  if (prev <= 1) {
                      setIsResting(false);
                      // Play sound here ideally
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(interval!);
  }, [isResting, restTimer]);


  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpdateSet = (exIndex: number, setIndex: number, field: keyof ExerciseSet, val: number) => {
      const newEx = [...exercises];
      newEx[exIndex].sets[setIndex][field] = val;
      setExercises(newEx);
  };

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
      const newEx = [...exercises];
      const isComplete = !newEx[exIndex].sets[setIndex].completed;
      newEx[exIndex].sets[setIndex].completed = isComplete;
      setExercises(newEx);

      if (isComplete) {
          // Auto-start rest timer (e.g., 60s default)
          setRestTimer(60);
          setIsResting(true);
      }
  };

  const addSet = (exIndex: number) => {
      const newEx = [...exercises];
      // Clone previous set values for convenience
      const prevSet = newEx[exIndex].sets[newEx[exIndex].sets.length - 1] || { weight: 0, reps: 0 };
      newEx[exIndex].sets.push({ 
          weight: prevSet.weight, 
          reps: prevSet.reps, 
          completed: false 
      });
      setExercises(newEx);
  };

  const finishWorkout = async () => {
      if (!exercises.length) return;
      
      const workoutData = {
          name: activeRoutine?.name || 'Untitled Session',
          date: new Date().toISOString(),
          duration: Math.floor(sessionDuration / 60), // minutes
          exercises: exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets.filter((s: any) => s.completed) // Only save completed sets or all? Usually all logged ones.
          })),
          notes: "Completed via Live Tracker"
      };

      await createWorkout(workoutData);
      router.push('/dashboard/fitness/manage');
  };

  if (!activeRoutine) {
      return (
          <div className="flex flex-col h-[calc(100vh-2rem)] gap-6 pb-6 relative animate-in fade-in">
              <FitnessNav />
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 animate-pulse">
                      <Dumbbell className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Rest Day / Unscheduled</h2>
                  <p className="text-muted-foreground max-w-md mb-8">
                      There is no routine scheduled for <span className="font-bold text-primary">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>.
                      <br/>You can manage your schedule or start a freestyle workout.
                  </p>
                  <div className="flex gap-4">
                      <Button variant="outline" onClick={() => router.push('/dashboard/fitness/manage')}>
                          Manage Protocols
                      </Button>
                      <Button onClick={() => {
                          setActiveRoutine({ name: 'Freestyle Session' });
                          setExercises([]);
                          setSessionStartTime(new Date());
                      }}>
                          Start Freestyle
                      </Button>
                  </div>
              </div>
          </div>
      )
  }

  const currentExercise = exercises[currentExerciseIndex];
  const progress = (exercises.reduce((acc, ex) => acc + ex.sets.filter((s:any) => s.completed).length, 0) / 
                   exercises.reduce((acc, ex) => acc + ex.sets.length, 0)) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] animate-in fade-in duration-500 gap-6 pb-6 relative">
      <FitnessNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* LEFT SIDE: Focus View */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full relative">
           {/* HEADER */}
           <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-md z-10">
               <div>
                   <Badge variant="outline" className={cn("mb-2 border-primary/30 uppercase tracking-widest text-[10px]", isPaused ? "text-amber-500 border-amber-500/30" : "text-primary animate-pulse")}>
                       {isPaused ? "Session Paused" : "Live Session"}
                   </Badge>
                   <h1 className="text-2xl font-black uppercase tracking-tight truncate max-w-[300px] md:max-w-md">{activeRoutine.name}</h1>
               </div>
               <div className="text-right">
                   <div className={cn("text-4xl font-mono font-bold tabular-nums tracking-wider transition-colors", isPaused ? "text-amber-500" : "text-white")}>
                       {formatTime(sessionDuration)}
                   </div>
                   <div className="text-xs text-muted-foreground font-mono uppercase">Total Time</div>
               </div>
           </div>

           {/* MAIN EXERCISE CARD (Animated Switcher) */}
           <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/20 bg-zinc-900/40 backdrop-blur-sm shadow-2xl shadow-primary/5">
               <AnimatePresence mode="wait">
                   <motion.div
                       key={currentExerciseIndex}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       transition={{ duration: 0.2 }}
                       className="absolute inset-0 flex flex-col"
                   >
                       <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-950/30 z-10">
                           <div className="flex justify-between items-start">
                              <div>
                                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                                      <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[10px]">Step {currentExerciseIndex + 1}</span>
                                      of {exercises.length}
                                  </div>
                                  <CardTitle className="text-3xl md:text-4xl font-black italic tracking-tighter flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                                      {currentExercise?.name}
                                  </CardTitle>
                              </div>
                              <div className="flex gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
                                   <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      disabled={currentExerciseIndex === 0}
                                      onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
                                      className="hover:bg-zinc-800"
                                   >
                                       <ChevronLeft className="w-5 h-5" />
                                   </Button>
                                   <Button 
                                      variant="ghost" 
                                      size="icon"
                                      disabled={currentExerciseIndex === exercises.length - 1}
                                      onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                                      className="hover:bg-zinc-800"
                                   >
                                       <ChevronRight className="w-5 h-5" />
                                   </Button>
                              </div>
                           </div>
                       </CardHeader>
                       
                       <CardContent className="flex-1 overflow-y-auto p-0 scroll-smooth">
                           <div className="w-full min-w-[600px] md:min-w-full">
                               <div className="grid grid-cols-12 gap-2 p-3 bg-zinc-950/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-zinc-800/50 sticky top-0 z-10 backdrop-blur-md">
                                   <div className="col-span-1 text-center">Set</div>
                                   <div className="col-span-4 pl-2">Previous Data</div>
                                   <div className="col-span-3 text-center">Load (lbs)</div>
                                   <div className="col-span-3 text-center">Reps</div>
                                   <div className="col-span-1 text-center">Log</div>
                               </div>
                               
                               <div className="divide-y divide-zinc-800/50 pb-20">
                                   {currentExercise?.sets.map((set: any, idx: number) => (
                                       <motion.div 
                                          key={idx} 
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className={cn(
                                              "grid grid-cols-12 gap-4 p-4 items-center transition-all duration-300 group",
                                              set.completed ? "bg-primary/5" : "hover:bg-zinc-800/10"
                                          )}
                                       >
                                           <div className="col-span-1 flex justify-center">
                                               <div className={cn(
                                                   "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all",
                                                   set.completed 
                                                    ? "bg-primary text-primary-foreground border-primary" 
                                                    : "bg-zinc-900 border-zinc-700 text-muted-foreground group-hover:border-zinc-500"
                                               )}>
                                                   {idx + 1}
                                               </div>
                                           </div>
                                           
                                           <div className="col-span-4 text-xs text-muted-foreground pl-2 border-l border-zinc-800 flex flex-col justify-center">
                                               {/* Mocking previous history visualization */}
                                               <div className="h-1.5 w-12 bg-zinc-800 rounded-full mb-1" />
                                               <span className="text-[10px] opacity-50">No history</span>
                                           </div>

                                           <div className="col-span-3 relative">
                                                <Input 
                                                  type="number" 
                                                  className="h-12 text-center text-xl font-bold bg-zinc-950/50 border-zinc-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl" 
                                                  value={set.weight || ''}
                                                  placeholder="0"
                                                  onChange={(e) => handleUpdateSet(currentExerciseIndex, idx, 'weight', parseFloat(e.target.value))}
                                                />
                                                <span className="absolute right-3 top-4 text-[10px] text-muted-foreground pointer-events-none">LBS</span>
                                           </div>

                                           <div className="col-span-3 relative">
                                                <Input 
                                                  type="number" 
                                                  className="h-12 text-center text-xl font-bold bg-zinc-950/50 border-zinc-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl"
                                                  value={set.reps || ''}
                                                  placeholder="0"
                                                  onChange={(e) => handleUpdateSet(currentExerciseIndex, idx, 'reps', parseFloat(e.target.value))}    
                                                />
                                                <span className="absolute right-3 top-4 text-[10px] text-muted-foreground pointer-events-none">REPS</span>
                                           </div>

                                           <div className="col-span-1 flex justify-center">
                                               <button 
                                                  onClick={() => toggleSetComplete(currentExerciseIndex, idx)}
                                                  className={cn(
                                                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                                                      set.completed 
                                                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                                                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-white"
                                                  )}
                                               >
                                                   <CheckCircle2 className={cn("w-6 h-6 transition-transform", set.completed && "scale-110")} />
                                               </button>
                                           </div>
                                       </motion.div>
                                   ))}
                               </div>
                           </div>
                           
                           {/* Sticky Footer Add Button */}
                           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 to-transparent">
                               <Button variant="outline" className="w-full border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all h-12" onClick={() => addSet(currentExerciseIndex)}>
                                   <Plus className="w-4 h-4 mr-2" /> Add Additional Set
                               </Button>
                           </div>
                       </CardContent>
                   </motion.div>
               </AnimatePresence>
           </div>
        </div>

        {/* RIGHT SIDE: Overview & Controls */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
            
            {/* CONTROL PANEL */}
            <Card className="bg-zinc-950/80 border-zinc-800 backdrop-blur-md shadow-xl">
                <CardContent className="p-4 grid grid-cols-2 gap-3">
                    <Button 
                      variant={isPaused ? "default" : "outline"} 
                      className={cn("h-16 text-lg font-bold border-zinc-800", isPaused ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:bg-zinc-800")}
                      onClick={() => setIsPaused(!isPaused)}
                    >
                        {isPaused ? <Play className="w-6 h-6 mr-2 fill-current" /> : <Pause className="w-6 h-6 mr-2 fill-current" />}
                        {isPaused ? "Resume" : "Pause"}
                    </Button>
                    <Button 
                      className="h-16 text-lg font-bold bg-gradient-to-br from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white shadow-lg shadow-green-500/20 border-0"
                      onClick={finishWorkout}
                    >
                        <Save className="w-6 h-6 mr-2" />
                        Finish
                    </Button>
                </CardContent>
            </Card>

            {/* REST TIMER WIDGET */}
            <AnimatePresence>
                {isResting && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-amber-500/50 bg-amber-950/20 relative overflow-hidden backdrop-blur-md">
                            <div className="absolute top-0 left-0 h-1 bg-amber-500 transition-all duration-1000 ease-linear" style={{width: `${(restTimer/60)*100}%`}} />
                            
                            <CardContent className="p-6 text-center relative z-10">
                                <div className="text-xs font-bold uppercase tracking-widest text-amber-500/80 mb-1 flex justify-center items-center gap-2">
                                    <Timer className="w-3 h-3 animate-spin duration-[3s]" /> Rest Period
                                </div>
                                <div className="text-6xl font-black tabular-nums tracking-tighter text-amber-500 drop-shadow-sm font-mono my-2">
                                    {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
                                </div>
                                <div className="flex justify-center gap-2">
                                    <Button size="sm" variant="ghost" className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 h-8" onClick={() => setRestTimer(prev => prev + 30)}>+30s</Button>
                                    <Button size="sm" variant="ghost" className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 h-8" onClick={() => setIsResting(false)}>Skip</Button>
                                </div>
                            </CardContent>
                            
                            {/* Decorative background pulse */}
                            <div className="absolute inset-0 bg-amber-500/5 animate-pulse z-0" />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EXERCISE LIST / PROGRESS */}
            <Card className="flex-1 overflow-hidden flex flex-col border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
                <CardHeader className="py-3 px-4 bg-zinc-950/50 border-b border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                       <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-400">Session Plan</CardTitle>
                       <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-zinc-800" indicatorClassName="bg-primary" />
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {exercises.map((ex, idx) => {
                            const isCurrent = idx === currentExerciseIndex;
                            const setsDone = ex.sets.filter((s:any) => s.completed).length;
                            const totalSets = ex.sets.length;
                            const isDone = setsDone === totalSets && totalSets > 0;

                            return (
                                <motion.div 
                                  key={idx} 
                                  whileHover={{ scale: 1.02, x: 2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setCurrentExerciseIndex(idx)}
                                  className={cn(
                                      "p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all border group",
                                      isCurrent 
                                          ? "bg-primary/10 border-primary/30 shadow-inner" 
                                          : "bg-transparent border-transparent hover:bg-zinc-800/50"
                                  )}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors",
                                            isCurrent ? "bg-primary shadow-[0_0_10px_rgba(249,115,22,0.5)]" : (isDone ? "bg-green-500" : "bg-zinc-800")
                                        )} />
                                        <div className="truncate">
                                            <div className={cn(
                                                "text-sm font-bold truncate transition-colors",
                                                isDone ? "text-muted-foreground line-through decoration-zinc-700" : (isCurrent ? "text-primary": "text-zinc-300")
                                            )}>{ex.name}</div>
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <span>{setsDone}/{totalSets} Sets</span>
                                                {isCurrent && <span className="text-primary italic ml-1">- Current</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {isDone && <motion.div initial={{scale:0}} animate={{scale:1}}><CheckCircle2 className="w-4 h-4 text-green-500" /></motion.div>}
                                </motion.div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </Card>

            {/* QUICK ACTIONS WIDGET */}
             <Card className="bg-zinc-950/30 border-dashed border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-center text-muted-foreground text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4 mr-2" /> Add Freestyle Exercise
                  </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
