'use client';

import { useEffect, useState, useMemo } from 'react';
import { FitnessNav } from '@/components/FitnessNav';
import { useTaskStore, Meal } from '@/stores/taskStore';
import { format, subDays, addDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    ChevronLeft, ChevronRight, Droplets, Flame, Plus, 
    Sunrise, Sun, Moon, Coffee, Trash2, Utensils, History,
    Dumbbell, ArrowRight, TrendingUp, Copy, Scale
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function NutritionPage() {
  const { metrics, fetchMetrics, updateMetric } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // Feature Toggle: Training Day
  const [isTrainingDay, setIsTrainingDay] = useState(false); // Can be persisted in generic metric field later

  // Form State
  const [addValues, setAddValues] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    water: ''
  });

  // Dynamic Targets based on Mode
  const TARGETS = useMemo(() => isTrainingDay ? {
    calories: 2800,
    protein: 200,
    carbs: 350,
    fats: 65,
    water: 4000
  } : {
    calories: 2300,
    protein: 180,
    carbs: 200,
    fats: 80,
    water: 3000
  }, [isTrainingDay]);

  useEffect(() => {
    fetchMetrics(format(subDays(selectedDate, 14), 'yyyy-MM-dd'), format(addDays(selectedDate, 7), 'yyyy-MM-dd'));
  }, [selectedDate, fetchMetrics]);


  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const currentMetric = metrics[dateKey] || {};
  
  const currentData = useMemo(() => ({
    calories: currentMetric.calories || 0,
    protein: currentMetric.macros?.protein || 0,
    carbs: currentMetric.macros?.carbs || 0,
    fats: currentMetric.macros?.fats || 0,
    water: currentMetric.water || 0,
    weight: currentMetric.weight || 0,
    meals: currentMetric.meals || { breakfast: [], lunch: [], dinner: [], snacks: [] }
  }), [currentMetric]);

  // History Helper: Last 3 unique meals of this type
  const getRecentMeals = (type: string) => {
      const history: Meal[] = [];
      const seen = new Set();
      
      // Look back 7 days
      for (let i = 1; i <= 7; i++) {
          const d = subDays(new Date(), i);
          const k = format(d, 'yyyy-MM-dd');
          const dayData = metrics[k];
          if (dayData && dayData.meals && (dayData.meals as any)[type]) {
              (dayData.meals as any)[type].forEach((m: Meal) => {
                  if (!seen.has(m.name)) {
                      seen.add(m.name);
                      history.push(m);
                  }
              });
          }
          if (history.length >= 3) break;
      }
      return history;
  };

  const handleSmartAdd = (meal: Meal) => {
      setAddValues({
          name: meal.name,
          calories: String(meal.calories),
          protein: String(meal.macros?.protein || 0),
          carbs: String(meal.macros?.carbs || 0),
          fats: String(meal.macros?.fats || 0),
          water: ''
      });
      toast.success("Autofilled from History");
  };

  const copyYesterday = async (type: string) => {
      const yesterdayKey = format(subDays(selectedDate, 1), 'yyyy-MM-dd');
      const yesterdayData = metrics[yesterdayKey];
      if (!yesterdayData || !yesterdayData.meals || !(yesterdayData.meals as any)[type].length) {
          toast.error("No meals found yesterday for " + type);
          return;
      }

      const mealsToCopy = (yesterdayData.meals as any)[type] as Meal[];
      const newMeals = mealsToCopy.map(m => ({ ...m, id: Date.now().toString() + Math.random() }));

      const existingMeals = (currentData.meals as any)[type] || [];
      const updatedMealsMap = {
          ...currentData.meals,
          [type]: [...existingMeals, ...newMeals]
      };

      await recalculateAndSave(updatedMealsMap);
      toast.success(`Copied ${newMeals.length} meals from yesterday`);
  };

    const recalculateAndSave = async (mealsMap: any) => {
        let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
        Object.values(mealsMap).flat().forEach((m: any) => {
            totalCal += m.calories;
            totalP += m.macros.protein;
            totalC += m.macros.carbs;
            totalF += m.macros.fats;
        });

        await updateMetric(dateKey, {
            calories: totalCal,
            macros: { protein: totalP, carbs: totalC, fats: totalF },
            meals: mealsMap
        });
    };

  const handleSaveMeal = async () => {
      if (!activeDialog) return;

      if (activeDialog === 'water') {
          await updateMetric(dateKey, { water: (currentData.water || 0) + Number(addValues.water || 0) });
          toast.success("Hydration Logged");
          setActiveDialog(null);
          return;
      }

      const mealType = activeDialog as string;
      const newMeal: Meal = {
          id: Date.now().toString(),
          name: addValues.name || 'Quick Add',
          calories: Number(addValues.calories || 0),
          macros: {
              protein: Number(addValues.protein || 0),
              carbs: Number(addValues.carbs || 0),
              fats: Number(addValues.fats || 0)
          }
      };

      const existingMeals = (currentData.meals as any)[mealType] || [];
      const updatedMeals = {
          ...currentData.meals,
          [mealType]: [...existingMeals, newMeal]
      };

      await recalculateAndSave(updatedMeals);

      toast.success("Meal Added");
      setActiveDialog(null);
      setAddValues({ name: '', calories: '', protein: '', carbs: '', fats: '', water: '' });
  };

  const deleteMeal = async (type: string, id: string) => {
      const list = (currentData.meals as any)[type] as Meal[];
      const updatedList = list.filter(m => m.id !== id);
      const updatedMeals = { ...currentData.meals, [type]: updatedList };
      await recalculateAndSave(updatedMeals);
      toast.success("Meal Removed");
  };

  const quickAddWater = async (amount: number) => {
      await updateMetric(dateKey, { water: (currentData.water || 0) + amount });
      toast.success(`+${amount}ml Water`);
  };

  // --- ANALYTICS CALCULATIONS ---
  const getWeeklyBalance = () => {
      let balance = 0;
      const start = startOfWeek(selectedDate);
      const days = eachDayOfInterval({ start, end: selectedDate }); // only up to today
      
      days.forEach(d => {
          const k = format(d, 'yyyy-MM-dd');
          const m = metrics[k];
          const consumed = m?.calories || 0;
          // Approximating target for past days
          // Ideally we save 'target' in DB or assume standard. Using standard Training/Rest split is hard without data.
          // We'll use base 2500 for simplicity or Training Target if high.
          balance += (consumed - 2500); 
      });
      return balance;
  };

  const getWeightTrend = () => {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < 7; i++) {
          const d = subDays(selectedDate, i);
          const k = format(d, 'yyyy-MM-dd');
          const w = metrics[k]?.weight;
          if (w) { sum += w; count++; }
      }
      return count > 0 ? (sum / count).toFixed(1) : '---';
  };

  const getPercent = (val: number, target: number) => Math.min(100, Math.round((val / target) * 100));
  const MEAL_SECTIONS = [
      { id: 'breakfast', label: 'Breakfast', icon: Sunrise, color: 'text-orange-400' },
      { id: 'lunch', label: 'Lunch', icon: Sun, color: 'text-yellow-500' },
      { id: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-400' },
      { id: 'snacks', label: 'Snacks', icon: Coffee, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <FitnessNav />

      {/* DIALOG */}
      <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px] border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-6">
            {activeDialog === 'water' ? (
                // Water Dialog
                <>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-cyan-500">
                             <Droplets className="w-5 h-5 fill-cyan-500" /> Log Water
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                         <div className="space-y-2">
                             <Label>Amount (ml)</Label>
                             <Input 
                                 type="number" autoFocus placeholder="e.g. 500" 
                                 className="text-2xl font-black h-14 bg-zinc-900 border-zinc-800"
                                 value={addValues.water}
                                 onChange={e => setAddValues({...addValues, water: e.target.value})}
                             />
                         </div>
                         <Button onClick={handleSaveMeal} className="w-full h-12 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white">Log Hydration</Button>
                    </div>
                </>
            ) : (
                // Meal Dialog
                <>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 capitalize">
                             <Utensils className="w-5 h-5" /> Add to {activeDialog}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 space-y-6">
                         
                         {/* Smart History Chips */}
                         <div className="flex flex-wrap gap-2">
                             {activeDialog && getRecentMeals(activeDialog).map((m, idx) => (
                                 <button 
                                    key={idx} 
                                    onClick={() => handleSmartAdd(m)}
                                    className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold hover:bg-zinc-800 hover:border-emerald-500/50 hover:text-emerald-500 transition-all flex items-center gap-1"
                                 >
                                     <History className="w-3 h-3" /> {m.name}
                                 </button>
                             ))}
                         </div>

                         <div className="space-y-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Meal Name</Label>
                                <Input 
                                    autoFocus placeholder="e.g. Oatmeal & Eggs" 
                                    className="font-bold bg-zinc-900 border-zinc-800 focus:ring-emerald-500"
                                    value={addValues.name}
                                    onChange={e => setAddValues({...addValues, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-orange-500">Calories</Label>
                                    <Input 
                                        type="number" placeholder="0" 
                                        className="h-12 text-xl font-black bg-zinc-900 border-zinc-800"
                                        value={addValues.calories}
                                        onChange={e => setAddValues({...addValues, calories: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-muted-foreground">Macros (P/C/F)</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input type="number" placeholder="P" className="bg-zinc-900 border-zinc-800 text-center" value={addValues.protein} onChange={e => setAddValues({...addValues, protein: e.target.value})} />
                                        <Input type="number" placeholder="C" className="bg-zinc-900 border-zinc-800 text-center" value={addValues.carbs} onChange={e => setAddValues({...addValues, carbs: e.target.value})} />
                                        <Input type="number" placeholder="F" className="bg-zinc-900 border-zinc-800 text-center" value={addValues.fats} onChange={e => setAddValues({...addValues, fats: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                         </div>
                         <Button onClick={handleSaveMeal} className="w-full h-12 text-lg font-bold text-black bg-white hover:bg-zinc-200 shadow-xl shadow-white/5">Save Meal</Button>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           {/* MODE SWITCHER */}
          <div className="flex items-center gap-3 mb-2">
               <h1 className="text-4xl font-black tracking-tighter uppercase italic">Fuel Logistics</h1>
               <div className="flex bg-zinc-900 p-1 rounded-full border border-zinc-800">
                    <button 
                       onClick={() => setIsTrainingDay(false)}
                       className={cn("px-4 py-1 rounded-full text-xs font-bold uppercase transition-all", !isTrainingDay ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300")}
                    >
                        Rest
                    </button>
                    <button 
                       onClick={() => setIsTrainingDay(true)}
                       className={cn("px-4 py-1 rounded-full text-xs font-bold uppercase transition-all flex items-center gap-1", isTrainingDay ? "bg-orange-600 text-white shadow" : "text-zinc-500 hover:text-zinc-300")}
                    >
                        <Dumbbell className="w-3 h-3" /> Training
                    </button>
               </div>
          </div>
          <p className="text-muted-foreground font-medium pl-1">
              Targeting <span className="text-white font-bold">{TARGETS.calories} kcal</span> for {isTrainingDay ? 'muscle growth' : 'recovery'}.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
           <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}><ChevronLeft className="w-4 h-4" /></Button>
           <div className="px-4 font-bold text-sm min-w-[120px] text-center">{isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'MMM dd')}</div>
           <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* TOP WIDGET ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* WEEKLY BANK */}
           <Card className="bg-zinc-900/20 border-zinc-800 flex flex-col justify-center p-4 h-24">
               <div className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1 mb-1">
                   Weekly Balance <ArrowRight className="w-3 h-3 -rotate-45" />
               </div>
               <div className={cn("text-3xl font-black tabular-nums", getWeeklyBalance() > 0 ? "text-orange-500" : "text-emerald-500")}>
                   {getWeeklyBalance() > 0 ? '+' : ''}{getWeeklyBalance()}
               </div>
           </Card>

           {/* WEIGHT TREND */}
           <Card className="bg-zinc-900/20 border-zinc-800 flex flex-col justify-center p-4 h-24">
               <div className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1 mb-1">
                   7-Day Trend <TrendingUp className="w-3 h-3" />
               </div>
               <div className="flex items-baseline gap-1">
                   <div className="text-3xl font-black text-white">{getWeightTrend()}</div>
                   <span className="text-xs font-bold text-zinc-600">lbs</span>
               </div>
           </Card>

           {/* REMAINING */}
           <Card className="bg-zinc-900/20 border-zinc-800 flex flex-col justify-center p-4 h-24">
               <div className="text-xs font-bold uppercase text-muted-foreground mb-1">
                   Remaining
               </div>
               <div className="text-3xl font-black text-zinc-400">
                   {Math.max(0, TARGETS.calories - currentData.calories)}
               </div>
           </Card>
           
           {/* CURRENT WEIGHT */}
           <Card className="bg-zinc-900/50 border-zinc-800 p-4 h-24 flex items-center justify-between relative overflow-hidden group">
               <div>
                   <div className="text-xs font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                       <Scale className="w-3 h-3" /> Morning Weigh-in
                   </div>
                   <Input 
                      className="h-8 text-2xl font-black bg-transparent border-none p-0 focus-visible:ring-0 w-24 text-white placeholder:text-zinc-700" 
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
               </div>
           </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: MAIN STATS (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
               <Card className="border-orange-500/10 bg-gradient-to-b from-orange-500/5 to-transparent relative overflow-hidden">
                   <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-50" />
                   <CardHeader>
                       <CardTitle className="text-2xl font-black uppercase text-orange-600 dark:text-orange-400 flex items-center gap-2">
                           <Flame className="w-6 h-6 fill-orange-500" /> Intake
                       </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-6">
                        <div className="text-center">
                            <div className="text-7xl font-black tabular-nums tracking-tighter text-white drop-shadow-lg">{currentData.calories}</div>
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">Kcal Consumed</div>
                        </div>
                        <Progress value={getPercent(currentData.calories, TARGETS.calories)} className="h-2 bg-zinc-900" indicatorClassName="bg-gradient-to-r from-orange-500 to-yellow-500"/>
                        
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-center">
                                <div className="text-red-500 font-black text-xl">{currentData.protein}g</div>
                                <div className="text-[9px] uppercase font-bold text-zinc-600">Protein</div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-center">
                                <div className="text-blue-500 font-black text-xl">{currentData.carbs}g</div>
                                <div className="text-[9px] uppercase font-bold text-zinc-600">Carbs</div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-center">
                                <div className="text-yellow-500 font-black text-xl">{currentData.fats}g</div>
                                <div className="text-[9px] uppercase font-bold text-zinc-600">Fats</div>
                            </div>
                        </div>
                   </CardContent>
               </Card>

               <Card className="border-cyan-500/20 bg-cyan-900/5 relative overflow-hidden">
                   <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
                       <CardTitle className="flex items-center gap-2 text-cyan-500"><Droplets className="w-5 h-5 fill-cyan-500" /> Hydration</CardTitle>
                       <Button variant="ghost" size="sm" onClick={() => setActiveDialog('water')}><Plus className="w-4 h-4 text-cyan-500" /></Button>
                   </CardHeader>
                   <CardContent className="relative z-10 space-y-4">
                       <div className="text-4xl font-black text-cyan-100 tabular-nums">{(currentData.water / 1000).toFixed(1)}L <span className="text-lg text-cyan-500/50">/ {(TARGETS.water / 1000).toFixed(1)}L</span></div>
                       <div className="flex gap-2">
                           <Button size="sm" variant="outline" className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20" onClick={() => quickAddWater(250)}>+250ml</Button>
                           <Button size="sm" variant="outline" className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20" onClick={() => quickAddWater(500)}>+500ml</Button>
                       </div>
                   </CardContent>
                   <div className="absolute inset-0 z-0 bg-cyan-500/5 pointer-events-none">
                       <div className="absolute bottom-0 left-0 w-full bg-cyan-500/10 transition-all duration-1000 border-t border-cyan-500/20" style={{ height: `${Math.min(100, (currentData.water / TARGETS.water) * 100)}%` }} />
                   </div>
               </Card>
          </div>

          {/* RIGHT: TIMELINE (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
              {MEAL_SECTIONS.map((section) => {
                  const meals = (currentData.meals as any)?.[section.id] || [];
                  const sectionCals = meals.reduce((acc: number, m: any) => acc + m.calories, 0);

                  return (
                      <div key={section.id} className="relative">
                          {/* Timeline Line */}
                          <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-zinc-900 -z-10" />
                          
                          <div className="flex items-start gap-4">
                              <div className={cn("p-3 rounded-2xl shrink-0 z-10 shadow-xl", section.color.replace('text', 'bg').replace('400', '500/10').replace('500', '500/10'), "border border-zinc-800 bg-zinc-950")}>
                                  <section.icon className={cn("w-6 h-6", section.color)} />
                              </div>
                              <div className="flex-1 space-y-4 pt-1">
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <h3 className="text-xl font-bold">{section.label}</h3>
                                          <div className="text-xs font-mono font-bold uppercase text-zinc-500">
                                              {sectionCals} kcal total
                                          </div>
                                      </div>
                                      <div className="flex gap-1">
                                           {meals.length === 0 && (
                                              <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => copyYesterday(section.id)}>
                                                  <Copy className="w-3 h-3 mr-2" /> Copy Yesterday
                                              </Button>
                                           )}
                                           <Button size="sm" variant="outline" className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800" onClick={() => setActiveDialog(section.id)}>
                                               <Plus className="w-4 h-4 mr-2" /> Add Item
                                           </Button>
                                      </div>
                                  </div>

                                  {meals.length > 0 ? (
                                      <div className="grid grid-cols-1 gap-3">
                                          {meals.map((meal: Meal) => (
                                              <div key={meal.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 group hover:border-zinc-700 hover:bg-zinc-900 transition-all">
                                                  <div>
                                                      <div className="font-bold text-zinc-200 text-lg">{meal.name}</div>
                                                      <div className="text-xs text-zinc-500 font-mono font-bold uppercase tracking-wide mt-1">
                                                          {meal.calories} kcal • <span className="text-red-400">P{meal.macros?.protein}</span> <span className="text-blue-400">C{meal.macros?.carbs}</span> <span className="text-yellow-400">F{meal.macros?.fats}</span>
                                                      </div>
                                                  </div>
                                                  <Button 
                                                    size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all hover:bg-red-500/10"
                                                    onClick={() => deleteMeal(section.id, meal.id)}
                                                  >
                                                      <Trash2 className="w-4 h-4" />
                                                  </Button>
                                              </div>
                                          ))}
                                      </div>
                                  ) : (
                                      <div className="h-24 border-2 border-dashed border-zinc-900 rounded-xl flex items-center justify-center text-zinc-700 font-bold text-sm uppercase tracking-widest">
                                          Nothing Logged
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  )
              })}
          </div>

      </div>
    </div>
  );
}
