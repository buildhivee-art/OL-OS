'use client';

import { useEffect, useState, useMemo } from 'react';
import { FitnessNav } from '@/components/FitnessNav';
import { useTaskStore } from '@/stores/taskStore';
import { format, subDays, addDays, parseISO, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Droplets, Flame, Beef, Wheat, Cookie, Save, Plus, RotateCcw, Utensils } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function NutritionPage() {
  const { metrics, fetchMetrics, updateMetric } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeDialog, setActiveDialog] = useState<'food' | 'water' | null>(null);

  // Buffer for editing forms
  const [addValues, setAddValues] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    water: ''
  });

  // Calculate targets (hardcoded for now, could be in user settings later)
  const TARGETS = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fats: 70,
    water: 3000 // ml
  };

  useEffect(() => {
    // Fetch ample range around selected date
    const start = subDays(selectedDate, 7);
    const end = addDays(selectedDate, 7);
    fetchMetrics(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
  }, [selectedDate, fetchMetrics]); // Re-fetch when moving far might be better logic, but this is safe for now

  // Get current day's data
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const currentMetric = metrics[dateKey] || {};
  
  const currentData = useMemo(() => ({
    calories: currentMetric.calories || 0,
    protein: currentMetric.macros?.protein || 0,
    carbs: currentMetric.macros?.carbs || 0,
    fats: currentMetric.macros?.fats || 0,
    water: currentMetric.water || 0,
    weight: currentMetric.weight || 0
  }), [currentMetric]);

  // Reset values when opening dialog
  useEffect(() => {
    if (activeDialog) {
      setAddValues({
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        water: ''
      });
    }
  }, [activeDialog]);

  const handleSave = async () => {
    try {
      if (activeDialog === 'food') {
          await updateMetric(dateKey, {
            calories: (currentData.calories || 0) + Number(addValues.calories || 0),
            macros: {
              protein: (currentData.protein || 0) + Number(addValues.protein || 0),
              carbs: (currentData.carbs || 0) + Number(addValues.carbs || 0),
              fats: (currentData.fats || 0) + Number(addValues.fats || 0)
            }
          });
          toast.success('Food logged successfully');
      } else if (activeDialog === 'water') {
          await updateMetric(dateKey, {
            water: (currentData.water || 0) + Number(addValues.water || 0)
          });
          toast.success('Water logged successfully');
      }

      setActiveDialog(null);
    } catch (error) {
      toast.error('Failed to update log');
    }
  };

  const quickAddWater = async (amount: number) => {
    const newWater = (currentData.water || 0) + amount;
    await updateMetric(dateKey, { water: newWater });
    toast.success(`Added ${amount}ml water`);
  };

  // Helper for macro percentage of calories
  // 1g Protein = 4cal, 1g Carb = 4cal, 1g Fat = 9cal
  const totalMacroCals = (currentData.protein * 4) + (currentData.carbs * 4) + (currentData.fats * 9);
  const getPercent = (val: number, target: number) => Math.min(100, Math.round((val / target) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <FitnessNav />

      <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[425px] border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
             {activeDialog === 'food' && (
                 <>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-muted-foreground" /> Add Food
                        </DialogTitle>
                        <DialogDescription>Add to your daily totals for <span className="text-foreground font-bold">{format(selectedDate, 'MMM dd')}</span></DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="space-y-4">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Energy</Label>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-xs">
                                    <Flame className="w-3 h-3 text-orange-500" /> Calories
                                </Label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        className="pl-8 font-mono font-bold bg-zinc-900/50 border-orange-500/20 focus-visible:ring-orange-500"
                                        placeholder="0"
                                        value={addValues.calories} 
                                        onChange={(e) => setAddValues({...addValues, calories: e.target.value})}
                                        autoFocus
                                    />
                                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">k</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Macros (Optional)</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-red-400 font-bold uppercase flex items-center gap-1">Protein</Label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            className="pr-6 font-mono text-sm bg-red-500/5 border-red-500/20 focus-visible:ring-red-500" 
                                            placeholder="0"
                                            value={addValues.protein} 
                                            onChange={(e) => setAddValues({...addValues, protein: e.target.value})}
                                        />
                                        <span className="absolute right-2 top-2.5 text-[10px] text-muted-foreground font-bold">g</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-blue-400 font-bold uppercase flex items-center gap-1">Carbs</Label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            className="pr-6 font-mono text-sm bg-blue-500/5 border-blue-500/20 focus-visible:ring-blue-500" 
                                            placeholder="0"
                                            value={addValues.carbs} 
                                            onChange={(e) => setAddValues({...addValues, carbs: e.target.value})}
                                        />
                                        <span className="absolute right-2 top-2.5 text-[10px] text-muted-foreground font-bold">g</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-yellow-400 font-bold uppercase flex items-center gap-1">Fats</Label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            className="pr-6 font-mono text-sm bg-yellow-500/5 border-yellow-500/20 focus-visible:ring-yellow-500" 
                                            placeholder="0"
                                            value={addValues.fats} 
                                            onChange={(e) => setAddValues({...addValues, fats: e.target.value})}
                                        />
                                        <span className="absolute right-2 top-2.5 text-[10px] text-muted-foreground font-bold">g</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </>
             )}

             {activeDialog === 'water' && (
                 <>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-cyan-500" /> Add Water
                        </DialogTitle>
                         <DialogDescription>Add a custom amount to your hydration log.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-xs">
                                Amount (ml)
                            </Label>
                            <Input 
                                type="number" 
                                className="font-mono font-bold bg-zinc-900/50 border-cyan-500/20 focus-visible:ring-cyan-500 text-lg h-12"
                                placeholder="e.g. 330"
                                value={addValues.water} 
                                onChange={(e) => setAddValues({...addValues, water: e.target.value})}
                                autoFocus
                            />
                        </div>
                    </div>
                 </>
             )}
            
            <DialogFooter>
                <Button onClick={handleSave} className="w-full font-bold">Add to Log</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HEADER & DATE NAV */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Fuel Logistics</h1>
          <p className="text-muted-foreground mt-1">Manage intake and recovery metrics.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
           <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
             <ChevronLeft className="w-4 h-4" />
           </Button>
           <div className="px-4 font-bold text-sm min-w-[120px] text-center">
             {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'MMM dd, yyyy')}
           </div>
           <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
             <ChevronRight className="w-4 h-4" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MAIN CALORIES CARD */}
          <Card className="col-span-1 md:col-span-2 overflow-hidden border-orange-500/10 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent shadow-xl shadow-orange-500/5 relative group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-50" />
              <CardHeader className="flex flex-row justify-between items-start pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black uppercase text-orange-600 dark:text-orange-400 flex items-center gap-2 tracking-wide">
                         <Flame className="w-6 h-6 fill-orange-500 text-orange-600 animate-pulse" /> Daily Energy
                    </CardTitle>
                    <CardDescription className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70">
                        Total Intake vs {TARGETS.calories} kcal Target
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setActiveDialog('food')}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-900/20 active:scale-95 transition-all"
                  >
                        <Plus className="w-4 h-4 mr-2" /> Add Food
                  </Button>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                      <div className="relative flex flex-col justify-center">
                          {/* Typography Based Progress */}
                          <div className="flex items-baseline gap-2">
                              <span className="text-8xl font-black tracking-tighter text-foreground tabular-nums leading-none">
                                  {currentData.calories}
                              </span>
                              <span className="text-xl font-bold text-muted-foreground/50 uppercase tracking-widest">
                                kcal
                              </span>
                          </div>
                      </div>
                      <div className="flex-1 w-full space-y-3">
                          <div className="flex justify-between items-end">
                              <div className="space-y-1">
                                  <div className="text-xs font-bold uppercase text-muted-foreground">Daily Progress</div>
                                  <div className="text-2xl font-black">{getPercent(currentData.calories, TARGETS.calories)}%</div>
                              </div>
                              <div className="text-right">
                                  <div className="text-xs font-bold uppercase text-muted-foreground">Remaining</div>
                                  <div className="text-xl font-bold tabular-nums text-muted-foreground">
                                      {Math.max(0, TARGETS.calories - currentData.calories)}
                                  </div>
                              </div>
                          </div>
                          <Progress 
                            value={getPercent(currentData.calories, TARGETS.calories)} 
                            className="h-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" 
                            indicatorClassName={cn(
                                "bg-gradient-to-r shadow-lg",
                                getPercent(currentData.calories, TARGETS.calories) > 100 
                                    ? "from-red-500 to-red-600 shadow-red-500/20" 
                                    : "from-orange-500 to-orange-400 shadow-orange-500/20"
                            )}
                          />
                      </div>
                  </div>

                  {/* Quick Macros Summary Bar */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                          <span>Macro Distribution</span>
                          <span>Ratio</span>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                         {totalMacroCals > 0 && (
                             <>
                                <div className="bg-red-500 h-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${(currentData.protein * 4 / totalMacroCals) * 100}%` }} />
                                <div className="bg-blue-500 h-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${(currentData.carbs * 4 / totalMacroCals) * 100}%` }} />
                                <div className="bg-yellow-500 h-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${(currentData.fats * 9 / totalMacroCals) * 100}%` }} />
                             </>
                         )}
                      </div>
                  </div>
              </CardContent>
          </Card>

          {/* WATER CARD */}
          <Card className="col-span-1 border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden flex flex-col justify-between group">
               <CardHeader className="relative z-20">
                  <CardTitle className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                      <Droplets className="w-5 h-5 fill-cyan-500 text-cyan-600" /> Hydration
                  </CardTitle>
               </CardHeader>
               <CardContent className="flex flex-col items-center justify-center gap-2 py-2 flex-grow relative z-20">
                   <div className="text-center space-y-1">
                        <div className="text-6xl font-black text-cyan-700 dark:text-cyan-100 tabular-nums tracking-tighter drop-shadow-sm">
                            {(currentData.water / 1000).toFixed(1)}L
                        </div>
                        <div className="text-xs font-bold text-cyan-700/60 dark:text-cyan-300/60 uppercase tracking-widest">
                            {currentData.water} / {TARGETS.water} ml
                        </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 w-full mt-8">
                       <Button 
                            variant="outline" 
                            className="h-12 border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100 dark:border-cyan-800/50 dark:bg-cyan-900/20 dark:hover:bg-cyan-800/50 text-cyan-700 dark:text-cyan-300 font-bold transition-all active:scale-95" 
                            onClick={() => quickAddWater(250)}
                       >
                           + 250ml
                       </Button>
                       <Button 
                            variant="outline" 
                            className="h-12 border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100 dark:border-cyan-800/50 dark:bg-cyan-900/20 dark:hover:bg-cyan-800/50 text-cyan-700 dark:text-cyan-300 font-bold transition-all active:scale-95" 
                            onClick={() => quickAddWater(500)}
                       >
                           + 500ml
                       </Button>
                   </div>
                   <Button 
                        variant="ghost" 
                        className="w-full mt-2 text-cyan-600 dark:text-cyan-400 font-bold hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                        onClick={() => setActiveDialog('water')}
                   >
                        <Plus className="w-4 h-4 mr-2" /> Custom Amount
                   </Button>
               </CardContent>

                {/* Enhanced Water Visuals */}
               <div className="absolute inset-0 pointer-events-none z-0">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-cyan-500/10 dark:bg-cyan-500/20 transition-all duration-1000 ease-in-out border-t border-cyan-500/20"
                      style={{ height: `${Math.min(100, (currentData.water / TARGETS.water) * 100)}%` }}
                   />
                   {/* Bubbles could go here if we had framer-motion easily accessible but CSS represents fluid well enough */}
               </div>
          </Card>
      </div>

      {/* MACROS BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 bg-zinc-50 dark:bg-zinc-900/50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Beef className="w-24 h-24" />
               </div>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-red-500 flex items-center justify-between">
                      <span className="flex items-center gap-2">Protein</span>
                      <span className="text-xs bg-red-500/10 px-2 py-0.5 rounded-full">{Math.round((currentData.protein / TARGETS.protein) * 100)}%</span>
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="flex items-end gap-2 mb-2">
                      <div className="text-4xl font-black tabular-nums">{currentData.protein}</div>
                      <div className="text-sm font-bold text-muted-foreground mb-1.5">/ {TARGETS.protein}g</div>
                  </div>
                  <Progress value={(currentData.protein / TARGETS.protein) * 100} className="h-1.5 bg-zinc-200 dark:bg-zinc-800" indicatorClassName="bg-red-500"/>
              </CardContent>
          </Card>

          <Card className="border-0 bg-zinc-50 dark:bg-zinc-900/50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Wheat className="w-24 h-24" />
               </div>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-blue-500 flex items-center justify-between">
                      <span className="flex items-center gap-2">Carbs</span>
                      <span className="text-xs bg-blue-500/10 px-2 py-0.5 rounded-full">{Math.round((currentData.carbs / TARGETS.carbs) * 100)}%</span>
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="flex items-end gap-2 mb-2">
                       <div className="text-4xl font-black tabular-nums">{currentData.carbs}</div>
                       <div className="text-sm font-bold text-muted-foreground mb-1.5">/ {TARGETS.carbs}g</div>
                  </div>
                  <Progress value={(currentData.carbs / TARGETS.carbs) * 100} className="h-1.5 bg-zinc-200 dark:bg-zinc-800" indicatorClassName="bg-blue-500"/>
              </CardContent>
          </Card>

          <Card className="border-0 bg-zinc-50 dark:bg-zinc-900/50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Cookie className="w-24 h-24" />
               </div>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-yellow-500 flex items-center justify-between">
                      <span className="flex items-center gap-2">Fats</span>
                      <span className="text-xs bg-yellow-500/10 px-2 py-0.5 rounded-full">{Math.round((currentData.fats / TARGETS.fats) * 100)}%</span>
                  </CardTitle>
              </CardHeader>
              <CardContent>
                   <div className="flex items-end gap-2 mb-2">
                       <div className="text-4xl font-black tabular-nums">{currentData.fats}</div>
                       <div className="text-sm font-bold text-muted-foreground mb-1.5">/ {TARGETS.fats}g</div>
                   </div>
                  <Progress value={(currentData.fats / TARGETS.fats) * 100} className="h-1.5 bg-zinc-200 dark:bg-zinc-800" indicatorClassName="bg-yellow-500"/>
              </CardContent>
          </Card>
      </div>

       {/* WEIGHT ENTRY */}
       <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center'>
                      <RotateCcw className='w-5 h-5 opacity-50'/>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Daily Check-in</CardTitle>
                    <CardDescription>Log your morning weight</CardDescription>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <Input 
                     type="number" 
                     className="w-28 text-right font-black text-xl border-zinc-200 dark:border-zinc-800" 
                     placeholder="0.0"
                     defaultValue={currentData.weight || ''}
                     onBlur={(e) => {
                         const val = parseFloat(e.target.value);
                         if (!isNaN(val) && val !== currentData.weight) {
                             updateMetric(dateKey, { weight: val });
                             toast.success('Weight updated');
                         }
                     }}
                  />
                  <span className="text-sm font-bold text-muted-foreground">lbs</span>
              </div>
          </CardHeader>
      </Card>

    </div>
  );
}
