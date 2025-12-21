'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWorkoutStore, Routine, ExerciseSet } from '@/stores/workoutStore';
import { FitnessNav } from '@/components/FitnessNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Play, Pause, Save, ChevronLeft, ChevronRight, 
    Timer, Dumbbell, CheckCircle2, X, Plus, Trophy,
    Calendar, Clock, Flame
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
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
  const [isFinished, setIsFinished] = useState(false);
  
  // Exercise Navigation
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  // Rest Timer
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  
  // Load data on mount
  useEffect(() => {
      fetchRoutines();
  }, [fetchRoutines]);

  // Initialize Session (Auto-detect if no ID)
  useEffect(() => {
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
          if (!isPaused && sessionStartTime && !isFinished) {
              setSessionDuration(prev => prev + 1);
          }
      }, 1000);
      return () => clearInterval(interval);
  }, [isPaused, sessionStartTime, isFinished]);

  // Rest Timer
  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isResting && restTimer > 0) {
          interval = setInterval(() => {
              setRestTimer(prev => {
                  if (prev <= 1) {
                      setIsResting(false);
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
          setRestTimer(60);
          setIsResting(true);
          
          // Check if all sets in this exercise are complete
          const allSetsDone = newEx[exIndex].sets.every((s: any) => s.completed);
          if (allSetsDone && exIndex < exercises.length - 1) {
              // Optional: Auto-advance after small delay
              // setTimeout(() => setCurrentExerciseIndex(prev => prev + 1), 1000);
          }
      }
  };

  const addSet = (exIndex: number) => {
      const newEx = [...exercises];
      const prevSet = newEx[exIndex].sets[newEx[exIndex].sets.length - 1] || { weight: 0, reps: 0 };
      newEx[exIndex].sets.push({ 
          weight: prevSet.weight, 
          reps: prevSet.reps, 
          completed: false 
      });
      setExercises(newEx);
  };

  const finishWorkout = async () => {
      setIsFinished(true);
      // Wait for animation or user confirmation before saving? 
      // For now, we'll just show the overlay state immediately.
  };

  const confirmSaveAndExit = async () => {
      if (!exercises.length) return;
      
      const workoutData = {
          name: activeRoutine?.name || 'Untitled Session',
          date: new Date().toISOString(),
          duration: Math.floor(sessionDuration / 60),
          exercises: exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets.filter((s: any) => s.completed)
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
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 animate-pulse shadow-xl">
                      <Dumbbell className="w-12 h-12 text-zinc-400" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tight">Rest Day / Free Flow</h2>
                  <p className="text-muted-foreground max-w-md mb-8 text-lg">
                      No specific protocol scheduled for today. 
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                      <Button size="lg" className="w-full font-bold h-14 rounded-xl" onClick={() => {
                          setActiveRoutine({ name: 'Freestyle Session' });
                          setExercises([]);
                          setSessionStartTime(new Date());
                      }}>
                          Start Freestyle
                      </Button>
                      <Button size="lg" variant="outline" className="w-full font-bold h-14 rounded-xl" onClick={() => router.push('/dashboard/fitness/manage')}>
                          Open Manager
                      </Button>
                  </div>
              </div>
          </div>
      )
  }

  const currentExercise = exercises[currentExerciseIndex];
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter((s:any) => s.completed).length, 0);
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] animate-in fade-in duration-500 gap-6 pb-6 relative">
      <FitnessNav />

      {/* FINISH OVERLAY */}
      <AnimatePresence>
        {isFinished && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center p-6"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-8 text-center"
                >
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/20">
                        <Trophy className="w-12 h-12 text-emerald-500" />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Session Complete!</h2>
                        <p className="text-zinc-400">Excellent work. Protocol successfully executed.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                            <Clock className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{Math.floor(sessionDuration / 60)}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Minutes</div>
                        </div>
                        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{completedSets}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sets Done</div>
                        </div>
                        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                            <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">TODAY</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Date</div>
                        </div>
                    </div>

                    <Button onClick={confirmSaveAndExit} size="lg" className="w-full h-16 text-lg font-bold rounded-2xl bg-white text-black hover:bg-zinc-200">
                        Save & Close
                    </Button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* LEFT SIDE: Active Exercise */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full relative">
           {/* HEADER */}
           <div className="flex justify-between items-center bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800 backdrop-blur-md z-10">
               <div>
                   <Badge variant="outline" className={cn("mb-2 border-primary/30 uppercase tracking-widest text-[10px]", isPaused ? "text-amber-500 border-amber-500/30" : "text-emerald-500 border-emerald-500/30 animate-pulse")}>
                       {isPaused ? "Timer Paused" : "Live Active"}
                   </Badge>
                   <h1 className="text-3xl font-black uppercase tracking-tight truncate max-w-[300px] md:max-w-md">{activeRoutine.name}</h1>
               </div>
               <div className="text-right">
                   <div className={cn("text-5xl font-mono font-bold tabular-nums tracking-tighter transition-colors", isPaused ? "text-amber-500" : "text-white")}>
                       {formatTime(sessionDuration)}
                   </div>
               </div>
           </div>

           {/* MAIN CARD */}
           <div className="flex-1 relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-2xl">
               <AnimatePresence mode="wait">
                   <motion.div
                       key={currentExerciseIndex}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       transition={{ duration: 0.3, ease: "circOut" }}
                       className="absolute inset-0 flex flex-col"
                   >
                       <CardHeader className="pb-6 border-b border-zinc-800/50 bg-zinc-950/30 z-10 flex flex-row items-center justify-between">
                           <div className="w-full">
                               <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                   <span className="bg-emerald-500/10 px-2 py-1 rounded text-[10px]">Movement {currentExerciseIndex + 1}/{exercises.length}</span>
                               </div>
                               <CardTitle className="text-4xl md:text-5xl font-black italic tracking-tighter text-white truncate w-full pr-4">
                                   {currentExercise?.name}
                               </CardTitle>
                           </div>
                           <div className="flex gap-2 flex-shrink-0">
                                   <Button 
                                      variant="outline" size="icon" className="w-12 h-12 rounded-xl"
                                      disabled={currentExerciseIndex === 0}
                                      onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
                                   >
                                       <ChevronLeft className="w-6 h-6" />
                                   </Button>
                                   <Button 
                                      variant="outline" size="icon" className="w-12 h-12 rounded-xl"
                                      disabled={currentExerciseIndex === exercises.length - 1}
                                      onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                                   >
                                       <ChevronRight className="w-6 h-6" />
                                   </Button>
                           </div>
                       </CardHeader>
                       
                       <CardContent className="flex-1 overflow-y-auto p-0 scroll-smooth">
                           <div className="w-full">
                               {/* Set Headers */}
                               <div className="grid grid-cols-12 gap-4 p-4 px-6 bg-zinc-950/30 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 sticky top-0 z-10 backdrop-blur-md">
                                   <div className="col-span-1 text-center">Set</div>
                                   <div className="col-span-4 pl-2">History</div>
                                   <div className="col-span-3 text-center">LBS</div>
                                   <div className="col-span-3 text-center">REPS</div>
                                   <div className="col-span-1 text-center">Status</div>
                               </div>
                               
                               <div className="divide-y divide-zinc-800/50 pb-24">
                                   {currentExercise?.sets.map((set: any, idx: number) => (
                                       <motion.div 
                                          key={idx} 
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className={cn(
                                              "grid grid-cols-12 gap-4 p-4 px-6 items-center transition-all duration-300 group",
                                              set.completed ? "bg-emerald-500/5" : "hover:bg-zinc-800/20"
                                          )}
                                       >
                                           <div className="col-span-1 flex justify-center">
                                               <div className={cn(
                                                   "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                                                   set.completed 
                                                    ? "bg-emerald-500 text-white" 
                                                    : "bg-zinc-800 text-zinc-500"
                                               )}>
                                                   {idx + 1}
                                               </div>
                                           </div>
                                           
                                           <div className="col-span-4 pl-2 flex flex-col justify-center">
                                               <div className="h-1 w-16 bg-zinc-800 rounded-full mb-2" />
                                               <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-wider">No Data</span>
                                           </div>

                                           <div className="col-span-3 relative">
                                                <Input 
                                                  type="number" 
                                                  className={cn(
                                                      "h-14 text-center text-2xl font-black bg-zinc-950 border-zinc-800 focus:ring-0 rounded-2xl transition-all",
                                                      set.completed ? "text-emerald-500 border-emerald-500/20" : "text-white"
                                                  )}
                                                  value={set.weight || ''}
                                                  placeholder="-"
                                                  onChange={(e) => handleUpdateSet(currentExerciseIndex, idx, 'weight', parseFloat(e.target.value))}
                                                />
                                           </div>

                                           <div className="col-span-3 relative">
                                                <Input 
                                                  type="number" 
                                                  className={cn(
                                                      "h-14 text-center text-2xl font-black bg-zinc-950 border-zinc-800 focus:ring-0 rounded-2xl transition-all",
                                                      set.completed ? "text-emerald-500 border-emerald-500/20" : "text-white"
                                                  )}
                                                  value={set.reps || ''}
                                                  placeholder="-"
                                                  onChange={(e) => handleUpdateSet(currentExerciseIndex, idx, 'reps', parseFloat(e.target.value))}    
                                                />
                                           </div>

                                           <div className="col-span-1 flex justify-center">
                                               <button 
                                                  onClick={() => toggleSetComplete(currentExerciseIndex, idx)}
                                                  className={cn(
                                                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 border-2",
                                                      set.completed 
                                                          ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105" 
                                                          : "bg-transparent border-zinc-800 hover:border-zinc-600 text-zinc-600 hover:text-white"
                                                  )}
                                               >
                                                   <CheckCircle2 className="w-6 h-6" />
                                               </button>
                                           </div>
                                       </motion.div>
                                   ))}
                               </div>
                           </div>
                           
                           {/* Sticky Footer Add Button */}
                           <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
                               <Button variant="outline" className="w-full h-14 border-2 border-dashed border-zinc-800 bg-zinc-900/50 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-500 transition-all font-bold uppercase tracking-widest rounded-xl" onClick={() => addSet(currentExerciseIndex)}>
                                   <Plus className="w-4 h-4 mr-2" /> Append Set
                               </Button>
                           </div>
                       </CardContent>
                   </motion.div>
               </AnimatePresence>
           </div>
        </div>

        {/* RIGHT SIDE: Sidebar Widgets */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col gap-6">
            
            {/* CONTROL PANEL */}
            <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={isPaused ? "default" : "outline"} 
                  className={cn("h-20 text-lg font-bold border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-1", isPaused ? "bg-amber-500 hover:bg-amber-600 text-white border-transparent" : "bg-zinc-900 hover:bg-zinc-800")}
                  onClick={() => setIsPaused(!isPaused)}
                >
                    {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
                    <span className="text-xs uppercase tracking-widest opacity-70">{isPaused ? "Resume" : "Pause"}</span>
                </Button>
                <Button 
                  className="h-20 text-lg font-bold bg-white text-black hover:bg-zinc-200 border-0 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-white/5"
                  onClick={finishWorkout}
                >
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="text-xs uppercase tracking-widest opacity-70">Finish</span>
                </Button>
            </div>

            {/* REST TIMER WIDGET */}
            <AnimatePresence>
                {isResting && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.9 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.9 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-3xl p-6 relative overflow-hidden">
                            <div className="relative z-10 text-center">
                                <div className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2 flex justify-center items-center gap-2">
                                    <Timer className="w-4 h-4 animate-spin-slow" /> Recover
                                </div>
                                <div className="text-6xl font-black tabular-nums tracking-tighter text-amber-500 mb-4 font-mono">
                                    {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
                                </div>
                                <div className="flex justify-center gap-2">
                                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full w-20" onClick={() => setRestTimer(prev => prev + 30)}>+30s</Button>
                                    <Button size="sm" variant="ghost" className="text-amber-500 hover:bg-amber-500/20 rounded-full w-20" onClick={() => setIsResting(false)}>Skip</Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EXERCISE LIST / PROGRESS */}
            <div className="flex-1 overflow-hidden flex flex-col border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm rounded-[2rem]">
                <div className="p-6 border-b border-zinc-800 bg-zinc-950/30">
                    <div className="flex justify-between items-end mb-2">
                       <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Roadmap</h3>
                       <span className="text-2xl font-black text-emerald-500">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                        {exercises.map((ex, idx) => {
                            const isCurrent = idx === currentExerciseIndex;
                            const setsDone = ex.sets.filter((s:any) => s.completed).length;
                            const totalSets = ex.sets.length;
                            const isDone = setsDone === totalSets && totalSets > 0;

                            return (
                                <motion.div 
                                  key={idx} 
                                  onClick={() => setCurrentExerciseIndex(idx)}
                                  className={cn(
                                      "p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border group",
                                      isCurrent 
                                          ? "bg-white/10 border-white/20" 
                                          : (isDone ? "bg-emerald-500/10 border-emerald-500/20" : "bg-transparent border-transparent hover:bg-zinc-800/50")
                                  )}
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                            isCurrent ? "bg-white text-black" : (isDone ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-500")
                                        )}>
                                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                        </div>
                                        <div className="truncate">
                                            <div className={cn(
                                                "text-sm font-bold truncate transition-colors",
                                                isCurrent ? "text-white": (isDone ? "text-emerald-500" : "text-zinc-400")
                                            )}>{ex.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-zinc-500">
                                        {setsDone}/{totalSets}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
      </div>
    </div>
  );
}
