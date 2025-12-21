'use client';

import { useEffect, useState } from 'react';
import { useWorkoutStore, Routine, Exercise, ExerciseSet } from '@/stores/workoutStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Calendar, Dumbbell, Zap, MoreVertical, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FitnessNav } from '@/components/FitnessNav';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const handleOpenRoutine = (routineData: any) => {
      // Just placeholder for now or maybe view details
      handleEdit(routineData);
  }

  // Group routines by day for the schedule view
  const schedule: Record<string, Routine[]> = {};
  DAYS.forEach(day => {
      schedule[day] = routines.filter(r => r.days && r.days.includes(day));
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <FitnessNav />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-black tracking-tight">Strategy Center</h1>
           <p className="text-muted-foreground">Design your protocol. Assign routines to days.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
            <Button variant="outline" onClick={() => seedRoutines()} className="flex-1 sm:flex-none border-zinc-200 dark:border-zinc-800">
                Load Calisthenics Presets
            </Button>
            <Button onClick={handleCreate} className="flex-1 sm:flex-none bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Create Routine
            </Button>
        </div>
      </div>

      {/* WEEKLY SCHEDULE */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAYS.map((day) => {
             const dayRoutines = schedule[day] || [];
             const isActive = dayRoutines.length > 0;
             return (
                <Card key={day} className={cn(
                    "flex flex-col h-full transition-all duration-300",
                    isActive 
                        ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-sm" 
                        : "border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent opacity-60 hover:opacity-100"
                )}>
                    <CardHeader className="p-3 pb-2">
                        <CardTitle className={cn(
                            "text-xs font-bold uppercase tracking-wider",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}>{day.slice(0, 3)}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 flex-1 space-y-2">
                        {isActive ? (
                            dayRoutines.map(routine => (
                                <div 
                                   key={routine._id} 
                                   className="bg-white dark:bg-zinc-950/50 border border-primary/20 rounded-md p-2 cursor-pointer hover:border-primary transition-colors shadow-sm"
                                   onClick={() => handleEdit(routine)}
                                >
                                    <div className="font-bold text-xs truncate">{routine.name}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">{routine.exercises.length} Exercises</div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center min-h-[60px] gap-1">
                                <span className="text-[10px] text-muted-foreground font-medium">Rest</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
             );
          })}
      </div>

      {/* ROUTINE LIST */}
      <div className="space-y-4">
          <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold">Protocol Library</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {routines.map((routine) => (
                  <Card key={routine._id} className="group flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50 border-zinc-200 dark:border-zinc-800">
                      <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                              <CardTitle className="text-base font-bold line-clamp-1">{routine.name}</CardTitle>
                              <div className="flex gap-1">
                                   <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" onClick={(e) => { e.stopPropagation(); handleEdit(routine); }}>
                                       <Edit2 className="h-3 w-3" />
                                   </Button>
                              </div>
                          </div>
                          <CardDescription className="text-xs flex flex-wrap gap-1 mt-1 min-h-[1.5rem]">
                                {routine.days.length > 0 ? routine.days.map(d => (
                                    <Badge key={d} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">{d.slice(0,3)}</Badge>
                                )) : <span className="text-[10px] text-zinc-400 italic">Unscheduled</span>}
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 pb-2">
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[2.5em]">
                              {routine.notes || "No additional instructions provided."}
                          </p>
                          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                              <Dumbbell className="w-3 h-3" />
                              {routine.exercises.length} Exercises
                          </div>
                      </CardContent>
                      
                      <div className="p-4 pt-2 mt-auto border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/30">
                          <div className="flex gap-2">
                            <Button 
                                className="flex-1 h-9 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-none transition-all"
                                onClick={(e) => handleStart(e, routine._id)}
                            >
                                <Zap className="w-3 h-3 mr-1.5" /> Initialize
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                                onClick={(e) => { e.stopPropagation(); deleteRoutine(routine._id); }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                      </div>
                  </Card>
              ))}
              
              <button 
                onClick={handleCreate} 
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-primary/30 transition-all text-muted-foreground hover:text-primary group min-h-[200px]"
              >
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <Plus className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold">Create Protocol</span>
                  <span className="text-[10px] text-zinc-400 mt-1">Add custom routine</span>
              </button>
          </div>
      </div>

      <RoutineDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={async (data) => {
            if (editingRoutine && editingRoutine._id) {
                await updateRoutine(editingRoutine._id, data);
            } else {
                await createRoutine(data);
            }
        }}
        initialData={editingRoutine}
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
    initialData 
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void, 
    onSave: (data: Partial<Routine>) => Promise<void>,
    initialData?: Partial<Routine> | null
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
    
    // Simplified Set Management for Routines (Templates usually just need Set count or target)
    // But keeping structure for specific targets
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
            name: name || 'Untitled Routine',
            days: selectedDays,
            notes,
            exercises
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Routine' : 'Create Routine'}</DialogTitle>
                    <DialogDescription>Define your workout structure and schedule.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Routine Name</Label>
                                <Input placeholder="e.g. Chest & Triceps" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Schedule Days</Label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => (
                                        <Badge
                                            key={day}
                                            variant={selectedDays.includes(day) ? "default" : "outline"}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => toggleDay(day)}
                                        >
                                            {day.slice(0, 3)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea placeholder="Instructions..." value={notes} onChange={e => setNotes(e.target.value)} className="h-24" />
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                             <div className="flex items-center justify-between">
                                 <Label>Exercises</Label>
                                 <Button size="sm" variant="outline" onClick={addExercise}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                             </div>
                             
                             <div className="space-y-3">
                                 {exercises.map((ex, i) => (
                                     <Card key={i} className="bg-muted/30">
                                         <div className="p-3 space-y-3">
                                             <div className="flex gap-2">
                                                 <Input 
                                                    className="h-8 font-medium" 
                                                    placeholder="Exercise Name" 
                                                    value={ex.name} 
                                                    onChange={e => updateExercise(i, 'name', e.target.value)}
                                                 />
                                                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => removeExercise(i)}>
                                                     <X className="w-4 h-4" />
                                                 </Button>
                                             </div>
                                             
                                             <div className="space-y-1 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700">
                                                 {ex.sets.map((set, si) => (
                                                     <div key={si} className="flex items-center gap-2 text-xs">
                                                         <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[9px]">{si + 1}</div>
                                                         <Input 
                                                            type="number" 
                                                            className="h-6 w-16 text-center text-xs p-0" 
                                                            placeholder="Lbs"
                                                            value={set.weight || ''}
                                                            onChange={e => updateSet(i, si, 'weight', parseFloat(e.target.value))}
                                                         />
                                                         <span className="text-muted-foreground">lbs x</span>
                                                         <Input 
                                                            type="number" 
                                                            className="h-6 w-12 text-center text-xs p-0" 
                                                            placeholder="Reps"
                                                            value={set.reps || ''}
                                                            onChange={e => updateSet(i, si, 'reps', parseFloat(e.target.value))}
                                                         />
                                                         <Button variant="ghost" size="icon" className="h-4 w-4 ml-auto" onClick={() => removeSet(i, si)}>
                                                             <X className="w-3 h-3" />
                                                         </Button>
                                                     </div>
                                                 ))}
                                                 <Button variant="ghost" size="sm" className="h-6 text-[10px] w-full" onClick={() => addSet(i)}>
                                                     + Add Set Target
                                                 </Button>
                                             </div>
                                         </div>
                                     </Card>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Routine</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
