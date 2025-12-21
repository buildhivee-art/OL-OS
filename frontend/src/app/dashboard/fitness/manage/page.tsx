'use client';

import { useEffect, useState } from 'react';
import { useWorkoutStore, Routine, Exercise, ExerciseSet } from '@/stores/workoutStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Zap, Dumbbell, X, Save, Copy, ChevronRight, Activity, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FitnessNav } from '@/components/FitnessNav';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const POPULAR_EXERCISES = [
    "Bench Press", "Squat", "Deadlift", "Overhead Press", 
    "Pull Up", "Dumbbell Row", "Lateral Raise", "Bicep Curl", 
    "Tricep Extension", "Leg Press", "Leg Extension", "Leg Curl", 
    "Calf Raise", "Lat Pulldown", "Face Pull", "Incline Dumbbell Press", 
    "Bulgarian Split Squat", "Romanian Deadlift", "Push Up", "Dip"
];

const SET_SCHEMES = [
    { label: "3x10", sets: 3, reps: 10 },
    { label: "5x5", sets: 5, reps: 5 },
    { label: "4x8", sets: 4, reps: 8 },
    { label: "3x12", sets: 3, reps: 12 },
];

export default function ManageWorkoutsPage() {
  const router = useRouter();
  const { routines, fetchRoutines, createRoutine, deleteRoutine, updateRoutine, seedRoutines } = useWorkoutStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Partial<Routine> | null>(null);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const handleEdit = (routine: Routine) => {
    setEditingRoutine(routine);
    setIsDialogOpen(true);
  };

  const handleStart = (e: React.MouseEvent, routineId: string) => {
      e.stopPropagation();
      router.push(`/dashboard/fitness/track?routine=${routineId}`);
  };

  const handleCreate = () => {
    setEditingRoutine(null);
    setIsDialogOpen(true);
  };

  // Group routines by day for the schedule view
  const schedule: Record<string, Routine[]> = {};
  DAYS.forEach(day => {
      schedule[day] = routines.filter(r => r.days && r.days.includes(day));
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <FitnessNav />

      {/* HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-8 md:p-12">
           <div className="absolute top-0 right-0 p-12 opacity-10">
               <Activity className="w-64 h-64 text-emerald-500" />
           </div>
           <div className="relative z-10 max-w-2xl space-y-4">
               <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Protocol Architect</Badge>
               <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Engine</span></h1>
               <p className="text-lg text-zinc-400">
                   Construct high-performance workout routines. Assign them to your weekly schedule to automate your training.
               </p>
               <div className="flex flex-wrap gap-3 pt-4">
                   <Button onClick={handleCreate} className="bg-white text-black hover:bg-zinc-200 font-bold h-12 px-6 rounded-full shadow-lg shadow-white/10">
                       <Plus className="mr-2 h-5 w-5" />
                       Create New Protocol
                   </Button>
                   <Button variant="outline" onClick={() => seedRoutines()} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-12 px-6 rounded-full">
                       <Copy className="mr-2 h-4 w-4" />
                       Load Presets
                   </Button>
               </div>
           </div>
      </div>

      {/* WEEKLY SCHEDULE GRID */}
      <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
               <Calendar className="w-5 h-5 text-emerald-500" />
               <h2 className="text-xl font-bold">Weekly Operations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {DAYS.map((day) => {
                 const dayRoutines = schedule[day] || [];
                 const isActive = dayRoutines.length > 0;
                 return (
                    <div key={day} className={cn(
                        "flex flex-col min-h-[140px] rounded-xl border transition-all duration-300 relative overflow-hidden group",
                        isActive 
                            ? "bg-gradient-to-br from-zinc-900 to-black border-emerald-500/30" 
                            : "bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                    )}>
                        {isActive && <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        
                        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-900/50">
                            <span className={cn("text-xs font-bold uppercase tracking-wider", isActive ? "text-emerald-400" : "text-muted-foreground")}>
                                {day.slice(0, 3)}
                            </span>
                        </div>

                        <div className="p-2 space-y-2 flex-1">
                            {isActive ? (
                                dayRoutines.map(routine => (
                                    <div 
                                       key={routine._id} 
                                       className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-2.5 cursor-pointer hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group/item"
                                       onClick={() => handleEdit(routine)}
                                    >
                                        <div className="font-bold text-xs truncate text-white mb-1 group-hover/item:text-emerald-300 transition-colors">{routine.name}</div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                            <Dumbbell className="w-3 h-3" />
                                            {routine.exercises.length} Exercises
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30">
                                    <div className="w-1 h-1 rounded-full bg-current mb-1" />
                                    <span className="text-[9px] uppercase font-bold tracking-widest">Rest</span>
                                </div>
                            )}
                        </div>
                    </div>
                 );
              })}
          </div>
      </div>

      {/* ROUTINE LIST */}
      <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold">Protocol Library</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {routines.map((routine) => (
                  <Card key={routine._id} className="group flex flex-col relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-black">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <CardHeader className="pb-3">
                          <div className="flex justify-between items-start mb-2">
                              <CardTitle className="text-lg font-bold line-clamp-1">{routine.name}</CardTitle>
                              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleEdit(routine); }}>
                                   <Edit2 className="h-4 w-4" />
                              </Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
                                {routine.days.length > 0 ? routine.days.map(d => (
                                    <Badge key={d} variant="secondary" className="text-[9px] px-2 h-5 font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                                        {d.slice(0,3)}
                                    </Badge>
                                )) : <span className="text-[10px] text-zinc-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Not Scheduled</span>}
                          </div>
                      </CardHeader>

                      <CardContent className="flex-1 pb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-[2.5em]">
                              {routine.notes || "No tactical instructions."}
                          </p>
                          <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                              <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {routine.exercises.length} Exercises</span>
                              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {routine.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} Sets</span>
                          </div>
                      </CardContent>
                      
                      <div className="p-4 pt-0 mt-auto">
                          <Button 
                                className="w-full text-xs font-bold uppercase tracking-wider bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition-all shadow-md group-hover:shadow-lg"
                                onClick={(e) => handleStart(e, routine._id)}
                            >
                                <Activity className="w-3 h-3 mr-2" />
                                Initiate Protocol
                          </Button>
                      </div>
                  </Card>
              ))}
              
              <button 
                onClick={handleCreate} 
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-emerald-500/50 transition-all text-muted-foreground hover:text-emerald-500 group min-h-[250px]"
              >
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-xl group-hover:bg-emerald-500/10 transition-all duration-300">
                      <Plus className="h-8 w-8 transition-transform group-hover:rotate-90" />
                  </div>
                  <span className="text-base font-bold">Construct New Protocol</span>
                  <span className="text-xs text-zinc-400 mt-1">Design a custom workout routine</span>
              </button>
          </div>
      </div>

      <RoutineDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={async (data) => {
            if (editingRoutine && editingRoutine._id) {
                await updateRoutine(editingRoutine._id, data);
                toast.success("Protocol Updated");
            } else {
                await createRoutine(data);
                toast.success("Protocol Created");
            }
        }}
        initialData={editingRoutine}
        onDelete={async () => {
             if (editingRoutine && editingRoutine._id) {
                 await deleteRoutine(editingRoutine._id);
                 setIsDialogOpen(false);
                 toast.success("Protocol Terminated");
             }
        }}
      />
    </div>
  );
}

// --------------------------------------------------------------------------------
// DIALOG COMPONENT
// --------------------------------------------------------------------------------

function RoutineDialog({ 
    open, 
    onOpenChange, 
    onSave, 
    initialData,
    onDelete
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void, 
    onSave: (data: Partial<Routine>) => Promise<void>,
    initialData?: Partial<Routine> | null,
    onDelete?: () => Promise<void>
}) {
    const [name, setName] = useState('');
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name || '');
                setSelectedDays(initialData.days || []);
                setNotes(initialData.notes || '');
                setExercises(JSON.parse(JSON.stringify(initialData.exercises || [])));
            } else {
                setName('');
                setSelectedDays([]);
                setNotes('');
                setExercises([]);
            }
        }
    }, [open, initialData]);

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const addExercise = () => {
        setExercises([...exercises, { 
            name: '', 
            sets: [{ weight: 0, reps: 0, completed: false }] 
        }]);
    };

    const updateExercise = (index: number, field: keyof Exercise, val: any) => {
        const newEx = [...exercises];
        // @ts-ignore
        newEx[index][field] = val;
        setExercises(newEx);
    };

    const removeExercise = (index: number) => {
        const newEx = [...exercises];
        newEx.splice(index, 1);
        setExercises(newEx);
    };
    
    // Quick Scheme Applier
    const applyScheme = (idx: number, sets: number, reps: number) => {
        const newEx = [...exercises];
        const newSets = Array(sets).fill(null).map(() => ({ weight: 0, reps, completed: false }));
        newEx[idx].sets = newSets;
        setExercises(newEx);
    };

    const addSet = (exIndex: number) => {
         const newEx = [...exercises];
         newEx[exIndex].sets.push({ weight: 0, reps: 0, completed: false });
         setExercises(newEx);
    }

    const removeSet = (exIndex: number, setIndex: number) => {
        const newEx = [...exercises];
        newEx[exIndex].sets.splice(setIndex, 1);
        setExercises(newEx);
    }
    
    const updateSet = (exIndex: number, setIndex: number, field: keyof ExerciseSet, val: number) => {
         const newEx = [...exercises];
         if (newEx[exIndex].sets[setIndex]) {
             // @ts-ignore
             newEx[exIndex].sets[setIndex][field] = val;
         }
         setExercises(newEx);
    }

    const handleSave = async () => {
        await onSave({
            name: name || 'Untitled Protocol',
            days: selectedDays,
            notes,
            exercises
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950/95 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl">
                
                {/* TOOLBAR HEADER */}
                <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 backdrop-blur-md">
                     <div className="flex items-center gap-3">
                         <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                             <Activity className="h-6 w-6" />
                         </div>
                         <div className="flex flex-col">
                             <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Protocol Editor</span>
                             <span className="text-sm font-semibold">{initialData ? 'Editing Routine' : 'New Routine'}</span>
                         </div>
                     </div>
                     <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                         <Button size="sm" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-full shadow-lg shadow-emerald-500/20">
                             <Save className="w-4 h-4 mr-2" /> Save Changes
                         </Button>
                     </div>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-3xl mx-auto py-12 px-6 space-y-12">
                        
                        {/* SECTION 1: IDENTITY */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <Input 
                                    className="text-4xl md:text-5xl font-black h-auto bg-transparent border-0 px-0 focus-visible:ring-0 placeholder:text-zinc-300 dark:placeholder:text-zinc-700" 
                                    placeholder="Untitled Protocol" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                />
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {DAYS.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(day)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                                                selectedDays.includes(day) 
                                                    ? "bg-black dark:bg-white text-white dark:text-black border-transparent scale-105" 
                                                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400"
                                            )}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Briefing</Label>
                                <Textarea 
                                    placeholder="Enter strategic notes, warm-up protocols, or focus cues..." 
                                    value={notes} 
                                    onChange={e => setNotes(e.target.value)} 
                                    className="h-24 resize-none bg-transparent border-0 px-0 focus-visible:ring-0 text-zinc-600 dark:text-zinc-300 placeholder:opacity-50" 
                                />
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800" />

                        {/* SECTION 2: EXERCISES */}
                        <div className="space-y-8">
                             <div className="flex items-center justify-between">
                                 <h3 className="text-xl font-bold flex items-center gap-2">
                                     <Dumbbell className="w-5 h-5 text-emerald-500" /> Sequence
                                     <span className="text-sm font-normal text-muted-foreground ml-2">{exercises.length} Exercises</span>
                                 </h3>
                             </div>

                             <div className="space-y-6">
                                 {exercises.map((ex, i) => (
                                     <div key={i} className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700">
                                         
                                         {/* DRAG HANDLE / RANK */}
                                         <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-l-2xl">
                                             <span className="text-zinc-400 font-mono font-bold text-lg">{i + 1}</span>
                                         </div>

                                         <div className="pl-12">
                                             {/* CARD HEADER */}
                                             <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-zinc-100 dark:border-zinc-800">
                                                  <div className="flex-1 w-full">
                                                      <Input 
                                                         list="exercises-list"
                                                         className="text-xl font-bold border-0 p-0 h-auto bg-transparent focus-visible:ring-0 placeholder:text-zinc-300"
                                                         placeholder="Exercise Name..."
                                                         value={ex.name}
                                                         onChange={e => updateExercise(i, 'name', e.target.value)}
                                                      />
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-3">
                                                      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                                                          {SET_SCHEMES.map(scheme => (
                                                              <button 
                                                                key={scheme.label}
                                                                onClick={() => applyScheme(i, scheme.sets, scheme.reps)}
                                                                className="px-3 py-1.5 rounded-md text-[10px] font-bold hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all text-muted-foreground hover:text-primary"
                                                              >
                                                                  {scheme.label}
                                                              </button>
                                                          ))}
                                                      </div>
                                                      <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => removeExercise(i)}>
                                                          <Trash2 className="w-4 h-4" />
                                                      </Button>
                                                  </div>
                                             </div>

                                             {/* SETS PANE */}
                                             <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-br-2xl">
                                                  <div className="space-y-3">
                                                      {ex.sets.map((set, si) => (
                                                          <div key={si} className="flex items-center gap-4 group/set">
                                                              <div className="w-8 text-[10px] font-bold text-center text-zinc-400 uppercase tracking-widest">Set {si + 1}</div>
                                                              
                                                              <div className="flex-1 grid grid-cols-2 gap-4">
                                                                  <div className="relative">
                                                                      <Input 
                                                                         type="number"
                                                                         className="pl-8 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                                                                         placeholder="0"
                                                                         value={set.weight || ''}
                                                                         onChange={e => updateSet(i, si, 'weight', parseFloat(e.target.value))}
                                                                      />
                                                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">LB</span>
                                                                  </div>
                                                                  <div className="relative">
                                                                      <Input 
                                                                         type="number"
                                                                         className="pl-8 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                                                                         placeholder="0"
                                                                         value={set.reps || ''}
                                                                         onChange={e => updateSet(i, si, 'reps', parseFloat(e.target.value))}
                                                                      />
                                                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">x</span>
                                                                  </div>
                                                              </div>

                                                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 opacity-0 group-hover/set:opacity-100 hover:text-red-500 transition-all" onClick={() => removeSet(i, si)}>
                                                                  <X className="w-4 h-4" />
                                                              </Button>
                                                          </div>
                                                      ))}
                                                  </div>
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" 
                                                    onClick={() => addSet(i)}
                                                  >
                                                      <Plus className="w-3 h-3 mr-2" /> Add Set
                                                  </Button>
                                             </div>
                                         </div>
                                     </div>
                                 ))}

                                 <button 
                                    onClick={addExercise}
                                    className="w-full py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                                 >
                                     <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center mb-2 transition-colors">
                                         <Plus className="w-6 h-6" />
                                     </div>
                                     <span className="font-bold text-sm uppercase tracking-widest">Add Movement</span>
                                 </button>
                             </div>
                        </div>

                    </div>
                </div>
                
                {initialData && (
                     <div className="absolute bottom-6 left-6">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600 opacity-50 hover:opacity-100 transition-opacity"
                            onClick={onDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Protocol
                        </Button>
                     </div>
                )}
                
                {/* Datalist for autocomplete */}
                <datalist id="exercises-list">
                    {POPULAR_EXERCISES.map(ex => <option key={ex} value={ex} />)}
                </datalist>

            </DialogContent>
        </Dialog>
    );
}
