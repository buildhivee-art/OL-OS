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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
                             <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">{initialData ? 'Edit Protocol' : 'Design Protocol'}</DialogTitle>
                            <DialogDescription>Configure the parameters for this workout routine.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid gap-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* LEFT COLUMN: Metadata */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Protocol Identity</Label>
                                <Input 
                                    className="text-lg font-bold h-12" 
                                    placeholder="e.g. Hypertrophy A (Push)" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                />
                            </div>
                            
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weekly Schedule</Label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => (
                                        <div
                                            key={day}
                                            className={cn(
                                                "cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                                                selectedDays.includes(day) 
                                                    ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20" 
                                                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-muted-foreground hover:border-zinc-400"
                                            )}
                                            onClick={() => toggleDay(day)}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tactical Notes</Label>
                                <Textarea 
                                    placeholder="Briefing instructions, focus points, or cues..." 
                                    value={notes} 
                                    onChange={e => setNotes(e.target.value)} 
                                    className="h-32 resize-none bg-zinc-50 dark:bg-zinc-900/50" 
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Exercises */}
                        <div className="space-y-4 flex flex-col h-[500px]">
                             <div className="flex items-center justify-between">
                                 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exercise Sequence</Label>
                                 <Button size="sm" onClick={addExercise} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-3 h-3 mr-1" /> Add Exercise</Button>
                             </div>
                             
                             <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 bg-zinc-50 dark:bg-zinc-900/20 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                 {exercises.length === 0 && (
                                     <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                                         <Dumbbell className="w-12 h-12 opacity-20" />
                                         <p className="text-sm">No exercises added yet.</p>
                                     </div>
                                 )}
                                 {exercises.map((ex, i) => (
                                     <Card key={i} className="border-0 shadow-lg bg-white dark:bg-zinc-900 overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800">
                                         {/* Exercise Header */}
                                         <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 flex gap-3 border-b border-zinc-100 dark:border-zinc-800">
                                             <div className="flex items-center justify-center w-8 h-8 rounded bg-white dark:bg-zinc-800 text-xs font-bold shadow-sm">{i + 1}</div>
                                             <div className="flex-1">
                                                 <Input 
                                                    list="exercises-list"
                                                    className="h-8 font-bold border-transparent bg-transparent focus-visible:ring-0 px-0 shadow-none text-base" 
                                                    placeholder="Exercise Name..." 
                                                    value={ex.name} 
                                                    onChange={e => updateExercise(i, 'name', e.target.value)}
                                                 />
                                             </div>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-destructive" onClick={() => removeExercise(i)}>
                                                 <X className="w-4 h-4" />
                                             </Button>
                                         </div>
                                         
                                         <div className="p-4 space-y-4">
                                              {/* Quick Schemes */}
                                              <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                                                  {SET_SCHEMES.map(scheme => (
                                                      <button 
                                                        key={scheme.label}
                                                        onClick={() => applyScheme(i, scheme.sets, scheme.reps)}
                                                        className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-medium hover:bg-emerald-500 hover:text-white hover:border-emerald-600 transition-colors whitespace-nowrap"
                                                      >
                                                          {scheme.label}
                                                      </button>
                                                  ))}
                                              </div>

                                              <div className="space-y-2">
                                                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center mb-1">
                                                      <div className="col-span-2">Set</div>
                                                      <div className="col-span-4">Weight (lbs)</div>
                                                      <div className="col-span-4">Reps</div>
                                                      <div className="col-span-2"></div>
                                                  </div>
                                                  {ex.sets.map((set, si) => (
                                                      <div key={si} className="grid grid-cols-12 gap-2 items-center">
                                                          <div className="col-span-2 flex justify-center">
                                                              <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px]">{si + 1}</div>
                                                          </div>
                                                          <div className="col-span-4">
                                                              <Input 
                                                                 type="number" 
                                                                 className="h-7 text-center text-xs" 
                                                                 placeholder="0"
                                                                 value={set.weight || ''}
                                                                 onChange={e => updateSet(i, si, 'weight', parseFloat(e.target.value))}
                                                              />
                                                          </div>
                                                          <div className="col-span-4">
                                                              <Input 
                                                                 type="number" 
                                                                 className="h-7 text-center text-xs" 
                                                                 placeholder="0"
                                                                 value={set.reps || ''}
                                                                 onChange={e => updateSet(i, si, 'reps', parseFloat(e.target.value))}
                                                              />
                                                          </div>
                                                          <div className="col-span-2 flex justify-center">
                                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-300 hover:text-destructive" onClick={() => removeSet(i, si)}>
                                                                  <X className="w-3 h-3" />
                                                              </Button>
                                                          </div>
                                                      </div>
                                                  ))}
                                                  <Button variant="ghost" size="sm" className="w-full h-7 text-xs border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 hover:text-emerald-500 mt-2" onClick={() => addSet(i)}>
                                                      <Plus className="w-3 h-3 mr-1" /> Add Set
                                                  </Button>
                                              </div>
                                         </div>
                                     </Card>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>
                
                {/* Datalist for autocomplete */}
                <datalist id="exercises-list">
                    {POPULAR_EXERCISES.map(ex => <option key={ex} value={ex} />)}
                </datalist>

                <DialogFooter className="flex sm:justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4 gap-2">
                    {initialData ? (
                        <Button 
                            variant="ghost" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Protocol
                        </Button>
                    ) : (
                        <div /> /* Spacer */
                    )}
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Discard</Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px]">
                            <Save className="w-4 h-4 mr-2" /> Save Protocol
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
