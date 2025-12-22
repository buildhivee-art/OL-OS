'use client';

import { useEffect, useState, useMemo } from 'react';
import { FitnessNav } from '@/components/FitnessNav';
import { useTaskStore, Meal, Food } from '@/stores/taskStore';
import { format, subDays, addDays, isSameDay, startOfWeek, eachDayOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    ChevronLeft, ChevronRight, Droplets, Flame, Plus, 
    Sunrise, Sun, Moon, Coffee, Trash2, Utensils, History as HistoryIcon,
    Dumbbell, ArrowRight, TrendingUp, Copy, Scale, ShoppingBasket, Search, X,
    Zap, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function NutritionPage() {
  const { metrics, fetchMetrics, updateMetric, foods, fetchFoods, createFood, deleteFood } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Dialogs
  const [activeDialog, setActiveDialog] = useState<string | null>(null); // 'water', 'breakfast', 'pantry-add'
  const [subDialog, setSubDialog] = useState<'manual' | 'pantry'>('pantry'); // Mode for adding meal

  // Feature Toggle: Training Day
  const [isTrainingDay, setIsTrainingDay] = useState(false);

  // Form State for Quick Add
  const [addValues, setAddValues] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    water: ''
  });

  // Form State for Creating New Food (Inventory)
  const [newFood, setNewFood] = useState({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      micros: {
          magnesium: '',
          calcium: '',
          vitaminD: '',
          zinc: '',
          iron: '',
          potassium: '',
          vitaminC: ''
      },
      servingSize: { amount: '', unit: 'g' }
  });

  // Search Logic
  const [searchQuery, setSearchQuery] = useState('');

  // TARGETS
  const TARGETS = useMemo(() => isTrainingDay ? {
    calories: 2900, // Boosted
    protein: 140,
    carbs: 400,
    fats: 80,
    water: 4000
  } : {
    calories: 2700,
    protein: 120,
    carbs: 350,
    fats: 75,
    water: 3000
  }, [isTrainingDay]);

  const MICRO_TARGETS = {
      magnesium: 400, // mg
      calcium: 1000, // mg
      vitaminD: 600, // IU
      zinc: 11, // mg
      iron: 8, // mg
      potassium: 3500, // mg
      vitaminC: 90 // mg
  };

  useEffect(() => {
    fetchMetrics(format(subDays(selectedDate, 7), 'yyyy-MM-dd'), format(addDays(selectedDate, 7), 'yyyy-MM-dd'));
    fetchFoods();
  }, [selectedDate, fetchMetrics, fetchFoods]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const currentMetric = metrics[dateKey] || {};
  
  const currentData = useMemo(() => ({
    calories: currentMetric.calories || 0,
    protein: currentMetric.macros?.protein || 0,
    carbs: currentMetric.macros?.carbs || 0,
    fats: currentMetric.macros?.fats || 0,
    micros: currentMetric.micros || { magnesium: 0, calcium: 0, vitaminD: 0, zinc: 0, iron: 0, potassium: 0, vitaminC: 0 },
    water: currentMetric.water || 0,
    weight: currentMetric.weight || 0,
    meals: currentMetric.meals || { breakfast: [], lunch: [], dinner: [], snacks: [] },
    supplements: currentMetric.supplements || [],
    body: currentMetric.body || {}
  }), [currentMetric]);

  // CALC DATA FOR CHART
  const weeklyData = useMemo(() => {
      // Last 7 days
      return eachDayOfInterval({ start: subDays(selectedDate, 6), end: selectedDate }).map(d => {
          const key = format(d, 'yyyy-MM-dd');
          const m = metrics[key] || {};
          return {
              day: format(d, 'EEE'),
              date: key,
              calories: m.calories || 0,
              protein: m.macros?.protein || 0,
              target: TARGETS.calories
          };
      });
  }, [metrics, selectedDate, TARGETS]);

  // --- ACTIONS ---

  const handleCreateFood = async () => {

      if (!newFood.name || !newFood.calories) return toast.error("Name and Calories required");
      
      try {
          await createFood({
              name: newFood.name,
              calories: Number(newFood.calories),
              macros: {
                  protein: Number(newFood.protein),
                  carbs: Number(newFood.carbs),
                  fats: Number(newFood.fats),
              },
              micros: {
                  magnesium: Number(newFood.micros.magnesium),
                  calcium: Number(newFood.micros.calcium),
                  vitaminD: Number(newFood.micros.vitaminD),
                  zinc: Number(newFood.micros.zinc),
                  iron: Number(newFood.micros.iron),
                  potassium: Number(newFood.micros.potassium),
                  vitaminC: Number(newFood.micros.vitaminC),
              },
              servingSize: { amount: Number(newFood.servingSize.amount) || 100, unit: newFood.servingSize.unit }
          });
          toast.success("Food Created");
          setActiveDialog(null);
          // Reset
          setNewFood({ name: '', calories: '', protein: '', carbs: '', fats: '', micros: { magnesium: '', calcium: '', vitaminD: '', zinc: '', iron: '', potassium: '', vitaminC: '' }, servingSize: { amount: '', unit: 'g' } });
      } catch (err) {
          toast.error("Failed to create food");
      }
  };

  const handleAddMealFromPantry = async (food: Food) => {
       if (!activeDialog) return;
       const mealType = activeDialog as string;

       const newMeal: Meal = {
           id: Date.now().toString(),
           name: food.name,
           calories: food.calories,
           macros: food.macros,
           micros: food.micros || { magnesium:0, calcium:0, vitaminD:0, zinc:0, iron:0, potassium:0, vitaminC:0 }
       };

       const existingMeals = (currentData.meals as any)[mealType] || [];
       const updatedMeals = {
          ...currentData.meals,
          [mealType]: [...existingMeals, newMeal]
       };
       await recalculateAndSave(updatedMeals);
       toast.success(`Added ${food.name}`);
       setActiveDialog(null);
  };

  const deleteMeal = async (type: string, id: string) => {
    const list = (currentData.meals as any)[type] as Meal[];
    const updatedList = list.filter(m => m.id !== id);
    const updatedMeals = { ...currentData.meals, [type]: updatedList };
    await recalculateAndSave(updatedMeals);
    toast.success("Meal Removed");
 };

  const recalculateAndSave = async (mealsMap: any) => {
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
    const totalMicros = { magnesium: 0, calcium: 0, vitaminD: 0, zinc: 0, iron: 0, potassium: 0, vitaminC: 0 };
    
    Object.values(mealsMap).flat().forEach((m: any) => {
        totalCal += m.calories;
        totalP += m.macros.protein;
        totalC += m.macros.carbs;
        totalF += m.macros.fats;
        
        if (m.micros) {
            totalMicros.magnesium += (m.micros.magnesium || 0);
            totalMicros.calcium += (m.micros.calcium || 0);
            totalMicros.vitaminD += (m.micros.vitaminD || 0);
            totalMicros.zinc += (m.micros.zinc || 0);
            totalMicros.iron += (m.micros.iron || 0);
            totalMicros.potassium += (m.micros.potassium || 0);
            totalMicros.vitaminC += (m.micros.vitaminC || 0);
        }
    });

    await updateMetric(dateKey, {
        calories: totalCal,
        macros: { protein: totalP, carbs: totalC, fats: totalF },
        micros: totalMicros,
        meals: mealsMap
    });
  };

  const getPercent = (val: number, target: number) => Math.min(100, Math.round((val / target) * 100));
  
  const MEAL_SECTIONS = [
      { id: 'breakfast', label: 'Breakfast', icon: Sunrise, color: 'text-orange-400' },
      { id: 'lunch', label: 'Lunch', icon: Sun, color: 'text-yellow-500' },
      { id: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-400' },
      { id: 'snacks', label: 'Snacks', icon: Coffee, color: 'text-pink-400' },
  ];

  /* UI HELPERS */
  const renderMicros = () => (
      <Card className="border-0 bg-zinc-900/50">
          <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-zinc-500">Micronutrients</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {Object.entries(MICRO_TARGETS).map(([key, target]) => {
                   const val = (currentData.micros as any)[key] || 0;
                   return (
                       <div key={key} className="space-y-1">
                           <div className="flex justify-between text-xs font-bold uppercase">
                               <span className="text-zinc-300">{key}</span>
                               <span className={cn(val >= target ? "text-emerald-500" : "text-zinc-500")}>{Math.round(val)}/{target}</span>
                           </div>
                           <Progress value={getPercent(val, target)} className="h-1 bg-zinc-800" indicatorClassName={cn(val >= target ? "bg-emerald-500" : "bg-zinc-600")} />
                       </div>
                   );
               })}
          </CardContent>
      </Card>
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <FitnessNav />

      {/* DIALOGS */}
      <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-2xl border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-0 overflow-hidden">
             {activeDialog === 'pantry-add' ? (
                 <div className="p-6 h-[80vh] overflow-y-auto">
                     <DialogHeader>
                         <DialogTitle className="text-xl flex items-center gap-2"><ShoppingBasket className="w-5 h-5 text-emerald-500"/> New Food Item</DialogTitle>
                         <DialogDescription>Add a new item to your global inventory.</DialogDescription>
                     </DialogHeader>
                     
                     <div className="space-y-6 mt-6">
                         <div className="space-y-2">
                             <Label>Name</Label>
                             <Input placeholder="e.g. Greek Yogurt 0%" value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} className="bg-zinc-900" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                 <Label>Calories</Label>
                                 <Input type="number" value={newFood.calories} onChange={e => setNewFood({...newFood, calories: e.target.value})} className="bg-zinc-900" />
                             </div>
                             <div className="space-y-2">
                                 <Label>Serving Size (g/ml)</Label>
                                 <Input type="number" value={newFood.servingSize.amount} onChange={e => setNewFood({...newFood, servingSize: { ...newFood.servingSize, amount: e.target.value }})} className="bg-zinc-900" />
                             </div>
                         </div>
                         
                         <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold text-muted-foreground">Macros (per serving)</Label>
                             <div className="grid grid-cols-3 gap-2">
                                 <Input placeholder="Protein" value={newFood.protein} onChange={e => setNewFood({...newFood, protein: e.target.value})} className="bg-red-950/20 border-red-900/50" />
                                 <Input placeholder="Carbs" value={newFood.carbs} onChange={e => setNewFood({...newFood, carbs: e.target.value})} className="bg-blue-950/20 border-blue-900/50" />
                                 <Input placeholder="Fats" value={newFood.fats} onChange={e => setNewFood({...newFood, fats: e.target.value})} className="bg-yellow-950/20 border-yellow-900/50" />
                             </div>
                         </div>

                         <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold text-muted-foreground">Micros (Optional)</Label>
                             <div className="grid grid-cols-2 gap-3">
                                 <Input placeholder="Magnesium (mg)" value={newFood.micros.magnesium} onChange={e => setNewFood({...newFood, micros: { ...newFood.micros, magnesium: e.target.value}})} className="bg-zinc-900" />
                                 <Input placeholder="Calcium (mg)" value={newFood.micros.calcium} onChange={e => setNewFood({...newFood, micros: { ...newFood.micros, calcium: e.target.value}})} className="bg-zinc-900" />
                                 <Input placeholder="Vitamin D (IU)" value={newFood.micros.vitaminD} onChange={e => setNewFood({...newFood, micros: { ...newFood.micros, vitaminD: e.target.value}})} className="bg-zinc-900" />
                                 <Input placeholder="Zinc (mg)" value={newFood.micros.zinc} onChange={e => setNewFood({...newFood, micros: { ...newFood.micros, zinc: e.target.value}})} className="bg-zinc-900" />
                                 <Input placeholder="Iron (mg)" value={newFood.micros.iron} onChange={e => setNewFood({...newFood, micros: { ...newFood.micros, iron: e.target.value}})} className="bg-zinc-900" />
                                 <Input placeholder="Potassium (mg)" value={newFood.micros.potassium} onChange={e => setNewFood({...newFood, micros: { ...newFood.micros, potassium: e.target.value}})} className="bg-zinc-900" />
                                 <Input placeholder="Vitamin C (mg)" value={newFood.micros.vitaminC} onChange={e => setNewFood({...newFood, micros: { ...newFood.micros, vitaminC: e.target.value}})} className="bg-zinc-900" />
                             </div>
                         </div>

                         <Button className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold" onClick={handleCreateFood}>Save to Inventory</Button>
                     </div>
                 </div>
             ) : activeDialog === 'water' ? (
                 <div className="p-6">
                    <DialogHeader><DialogTitle className="text-cyan-500">Log Water</DialogTitle></DialogHeader>
                    {/* Water Logic reused or kept simple */}
                    <div className="py-4"><Input autoFocus type="number" className="text-2xl h-14" placeholder="500" onChange={(e) => {
                        // Quick handler for now, usually separate state
                        if(e.target.value.length > 2) {
                             updateMetric(dateKey, { water: (currentData.water || 0) + Number(e.target.value) });
                             setActiveDialog(null);
                             toast.success("Added Water");
                        }
                    }} /> 
                    <div className="text-xs text-muted-foreground mt-2">Type amount and it will auto-submit</div>
                    </div>
                 </div>
             ) : activeDialog === 'weight' ? (
                 <div className="p-6">
                     <DialogHeader className="mb-6"><DialogTitle className="flex items-center gap-2"><Scale className="w-5 h-5 text-blue-500" /> Update Biometrics</DialogTitle></DialogHeader>
                     <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                 <Label>Weight (KG)</Label>
                                 <Input 
                                     type="number" 
                                     className="h-14 text-2xl font-black bg-zinc-900 border-zinc-800"
                                     placeholder={(currentData.weight || 0).toString()}
                                     onBlur={(e) => {
                                         if(e.target.value) updateMetric(dateKey, { weight: Number(e.target.value) });
                                     }}
                                 />
                             </div>
                             <div className="space-y-2">
                                 <Label>Body Fat (%)</Label>
                                 <Input type="number" className="h-14 text-xl font-bold bg-zinc-900 border-zinc-800" placeholder="15%" />
                             </div>
                         </div>
                         
                         <div className="space-y-3">
                             <Label className="uppercase text-xs font-bold text-muted-foreground">Measurements (cm)</Label>
                             <div className="grid grid-cols-2 gap-3">
                                {['Waist', 'Chest', 'Arms', 'Thighs'].map(part => (
                                    <div key={part} className="space-y-1">
                                        <Label className="text-xs text-zinc-500">{part}</Label>
                                        <Input 
                                            type="number" 
                                            className="bg-zinc-900 border-zinc-800"
                                            placeholder={(currentData as any).body?.[part.toLowerCase()]?.toString() || '--'}
                                            onBlur={(e) => {
                                                if(e.target.value) {
                                                    const body = (currentData as any).body || {};
                                                    updateMetric(dateKey, { body: { ...body, [part.toLowerCase()]: Number(e.target.value) } });
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                             </div>
                         </div>
                         <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => setActiveDialog(null)}>Save & Close</Button>
                     </div>
                 </div>
             ) : (
                // MEAL SELECTION DIALOG
                <div className="flex flex-col h-[600px]">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
                        <DialogTitle className="capitalize">Add to {activeDialog}</DialogTitle>
                        <Tabs value={subDialog} onValueChange={(v: any) => setSubDialog(v)} className="w-[200px]">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="pantry">Pantry</TabsTrigger>
                                <TabsTrigger value="manual">Manual</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-zinc-950">
                        {subDialog === 'pantry' ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                    <Input 
                                        placeholder="Search pantry..." 
                                        className="pl-9 bg-zinc-900 border-zinc-800"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(food => (
                                        <div key={food._id} onClick={() => handleAddMealFromPantry(food)} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 cursor-pointer transition-all border border-transparent hover:border-emerald-500/50 group">
                                            <div>
                                                <div className="font-bold text-sm">{food.name}</div>
                                                <div className="text-xs text-zinc-500">{food.calories} kcal • {food.servingSize.amount}{food.servingSize.unit}</div>
                                            </div>
                                            <div className="flex gap-2 text-xs font-mono text-zinc-600 opacity-50 group-hover:opacity-100">
                                                <span>P{food.macros.protein}</span>
                                                <span>C{food.macros.carbs}</span>
                                                <span>F{food.macros.fats}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {foods.length === 0 && (
                                        <div className="text-center py-8 text-zinc-500 text-sm">Pantry is empty.</div>
                                    )}
                                </div>
                                <Button variant="outline" className="w-full border-dashed" onClick={() => setActiveDialog('pantry-add')}>
                                    <Plus className="w-4 h-4 mr-2"/> Create New Item
                                </Button>
                            </div>
                        ) : (
                            <div className="py-4 space-y-4">
                               <Input placeholder="Meal Name" value={addValues.name} onChange={e => setAddValues({...addValues, name: e.target.value})} className="bg-zinc-900" />
                               <Input placeholder="Calories" type="number" value={addValues.calories} onChange={e => setAddValues({...addValues, calories: e.target.value})} className="bg-zinc-900" />
                               <div className="grid grid-cols-3 gap-2">
                                   <Input placeholder="P" type="number" value={addValues.protein} onChange={e => setAddValues({...addValues, protein: e.target.value})} />
                                   <Input placeholder="C" type="number" value={addValues.carbs} onChange={e => setAddValues({...addValues, carbs: e.target.value})} />
                                   <Input placeholder="F" type="number" value={addValues.fats} onChange={e => setAddValues({...addValues, fats: e.target.value})} />
                               </div>
                               <Button className="w-full" onClick={() => {
                                   /* Manual Add Logic Redundant but okay for fallback */
                                   handleAddMealFromPantry({ 
                                       _id: 'temp', name: addValues.name || 'Quick Add', 
                                       calories: Number(addValues.calories), 
                                       macros: { protein: Number(addValues.protein), carbs: Number(addValues.carbs), fats: Number(addValues.fats) },
                                       servingSize: { amount: 1, unit: 'srv' }
                                    } as any)
                               }}>Log Manual</Button>
                            </div>
                        )}
                    </div>
                </div>
             )}
        </DialogContent>
      </Dialog>


      {/* HERO BANNER */}
      <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800 p-8 md:p-10 overflow-hidden shadow-2xl group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 transition-opacity duration-1000 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-widest border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                            Bio-Fuel Logistics
                        </span>
                        <div className="bg-zinc-900/50 p-1 rounded-full border border-zinc-800/50 flex">
                            <button onClick={() => setIsTrainingDay(false)} className={cn("px-4 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-300", !isTrainingDay ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}>Rest</button>
                            <button onClick={() => setIsTrainingDay(true)} className={cn("px-4 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-300", isTrainingDay ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-900/20" : "text-zinc-500 hover:text-zinc-300")}>Training</button>
                        </div>
                    </div>
                    
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white italic">
                            NUTRITION<span className="text-zinc-800 text-stroke-1 dark:text-zinc-900" style={{WebkitTextStroke: '1px #3f3f46'}}>OS</span>
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-2" />
                    </div>

                    <p className="text-zinc-400 font-medium max-w-lg leading-relaxed">
                        Optimize metabolic inventory and fuel intake protocols.
                        <span className="text-zinc-500 block text-xs mt-2 font-mono uppercase tracking-wider">
                            Daily Target: <span className="text-zinc-300">{TARGETS.calories}</span> KCAL • <span className="text-zinc-300">{TARGETS.protein}G</span> PROTEIN
                        </span>
                    </p>
                </div>

                <div className="flex flex-col gap-3 items-end w-full md:w-auto">
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none border-zinc-800 hover:bg-zinc-900 hover:text-white transition-all bg-zinc-950/50 backdrop-blur-sm" onClick={() => setActiveDialog('pantry-add')}>
                            <ShoppingBasket className="w-4 h-4 mr-2 text-emerald-500" /> Pantry
                        </Button>
                        <Button variant="outline" className="flex-1 md:flex-none border-zinc-800 hover:bg-zinc-900 hover:text-white transition-all bg-zinc-950/50 backdrop-blur-sm">
                            <Scale className="w-4 h-4 mr-2 text-blue-500" /> Weight
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 p-1.5 rounded-2xl w-full md:w-auto justify-between backdrop-blur-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-900 rounded-xl" onClick={() => setSelectedDate(subDays(selectedDate, 1))}><ChevronLeft className="w-4 h-4" /></Button>
                        <div className="flex flex-col items-center px-4 min-w-[100px]">
                            <span className="text-xs font-bold text-white uppercase tracking-wide">{dateKey === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(selectedDate, 'EEEE')}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{format(selectedDate, 'MMM dd, yyyy')}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-900 rounded-xl" onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
            </div>
      </div>

       {/* Top Metrics Row */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* MAIN CALORIE CARD */}
           <Card className="lg:col-span-2 border-zinc-800 bg-zinc-950 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"/>
               
               <CardContent className="pt-8 relative z-10">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                       <div>
                           <h2 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-1 flex items-center gap-2">
                               <Flame className="w-4 h-4 text-orange-500" /> Daily Intake
                           </h2>
                           <div className="flex items-baseline gap-2">
                               <span className="text-6xl font-black text-white tracking-tighter">{currentData.calories.toLocaleString()}</span>
                               <span className="text-xl font-bold text-zinc-600">/ {TARGETS.calories.toLocaleString()} <span className="text-sm">kcal</span></span>
                           </div>
                       </div>
                       
                       <div className="flex gap-4 text-right">
                           <div>
                               <div className="text-2xl font-bold text-white">{currentData.calories > TARGETS.calories ? '+' : ''}{currentData.calories - TARGETS.calories}</div>
                               <div className="text-[10px] text-zinc-500 font-bold uppercase">Net Balance</div>
                           </div>
                       </div>
                   </div>

                   <div className="relative h-4 w-full bg-zinc-900 rounded-full overflow-hidden mb-8">
                       <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: `${Math.min(100, (currentData.calories / TARGETS.calories) * 100)}%` }}
                           className={cn("absolute h-full transition-all duration-1000 ease-out", 
                               currentData.calories > TARGETS.calories ? "bg-red-500" : "bg-gradient-to-r from-orange-600 to-yellow-500"
                           )}
                       />
                   </div>

                   <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase text-zinc-400">
                                <span>Protein</span>
                                <span className={cn(currentData.protein >= TARGETS.protein ? "text-emerald-500" : "")}>{currentData.protein}/{TARGETS.protein}g</span>
                            </div>
                            <Progress value={getPercent(currentData.protein, TARGETS.protein)} className="h-1.5 bg-zinc-900" indicatorClassName="bg-red-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase text-zinc-400">
                                <span>Carbs</span>
                                <span className={cn(currentData.carbs >= TARGETS.carbs ? "text-emerald-500" : "")}>{currentData.carbs}/{TARGETS.carbs}g</span>
                            </div>
                            <Progress value={getPercent(currentData.carbs, TARGETS.carbs)} className="h-1.5 bg-zinc-900" indicatorClassName="bg-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase text-zinc-400">
                                <span>Fats</span>
                                <span className={cn(currentData.fats >= TARGETS.fats ? "text-emerald-500" : "")}>{currentData.fats}/{TARGETS.fats}g</span>
                            </div>
                            <Progress value={getPercent(currentData.fats, TARGETS.fats)} className="h-1.5 bg-zinc-900" indicatorClassName="bg-yellow-500" />
                        </div>
                   </div>
               </CardContent>
           </Card>
           
           {/* HYDRATION CARD */}
           <Card className="border-zinc-800 bg-zinc-950 relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/40 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"/>
                
                <CardHeader className="relative z-10 pb-0">
                    <CardTitle className="text-cyan-400 flex gap-2 text-sm uppercase tracking-widest">
                        <Droplets className="w-4 h-4"/> Hydration
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10 pt-4 flex-1 flex flex-col justify-end">
                     <div className="mb-4">
                         <div className="text-5xl font-black text-white tracking-tighter">{(currentData.water / 1000).toFixed(1)}<span className="text-2xl text-zinc-600 font-bold ml-1">L</span></div>
                         <div className="text-xs text-cyan-600 font-bold uppercase mt-1">Target: {(TARGETS.water / 1000).toFixed(1)}L</div>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                         <Button variant="outline" className="border-cyan-900/30 text-cyan-500 hover:bg-cyan-950 hover:text-cyan-400" onClick={() => updateMetric(dateKey, { water: (currentData.water || 0) + 250 })}>+250ml</Button>
                         <Button variant="outline" className="border-cyan-900/30 text-cyan-500 hover:bg-cyan-950 hover:text-cyan-400" onClick={() => updateMetric(dateKey, { water: (currentData.water || 0) + 500 })}>+500ml</Button>
                         <Button className="bg-cyan-600 hover:bg-cyan-500 text-white border-0" onClick={() => setActiveDialog('water')}>Custom</Button>
                     </div>
                </CardContent>
                
                {/* Visual Water Level */}
                <div 
                    className="absolute bottom-0 left-0 right-0 bg-cyan-500/10 blur-xl transition-all duration-1000 ease-in-out" 
                    style={{ height: `${Math.min(100, (currentData.water / TARGETS.water) * 100)}%` }} 
                />
           </Card>
       </div>

       {/* Micros Panel */}
       {renderMicros()}

       {/* MEAL TIMELINE - REDESIGNED */}
       <div>
           <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
               <HistoryIcon className="w-4 h-4" /> Timeline
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {MEAL_SECTIONS.map(section => {
                   const meals = (currentData.meals as any)[section.id] || [];
                   const sectionCals = meals.reduce((acc: number, m: Meal) => acc + m.calories, 0);
                   
                   return (
                       <Card key={section.id} className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900/80 transition-colors flex flex-col h-full group">
                           <CardHeader className="py-4 border-b border-zinc-900 flex flex-row items-center justify-between space-y-0">
                               <div className="flex items-center gap-3">
                                   <div className={cn("p-2 rounded-lg bg-zinc-900", section.color.replace('text-', 'text-opacity-80 text-'))}>
                                       <section.icon className={cn("w-4 h-4", section.color)} />
                                   </div>
                                   <div>
                                       <CardTitle className="text-sm font-bold">{section.label}</CardTitle>
                                       <div className="text-[10px] text-zinc-500 font-mono font-bold">{sectionCals} kcal</div>
                                   </div>
                               </div>
                               <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setActiveDialog(section.id)}>
                                   <Plus className="w-4 h-4"/>
                               </Button>
                           </CardHeader>
                           
                           <CardContent className="flex-1 p-2 space-y-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                                {meals.length === 0 ? (
                                    <div 
                                        onClick={() => setActiveDialog(section.id)}
                                        className="h-full min-h-[100px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-lg cursor-pointer hover:border-zinc-800 hover:bg-zinc-900/50 transition-all group/empty"
                                    >
                                        <Plus className="w-6 h-6 text-zinc-800 group-hover/empty:text-zinc-600 mb-2 transition-colors" />
                                        <span className="text-[10px] font-bold uppercase text-zinc-800 group-hover/empty:text-zinc-600 transition-colors">Log {section.label}</span>
                                    </div>
                                ) : meals.map((m: Meal) => (
                                    <div key={m.id} className="flex flex-col p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-all group/item relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-bold text-zinc-200 line-clamp-1" title={m.name}>{m.name}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteMeal(section.id, m.id); }}
                                                className="text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        
                                        <div className="flex justify-between items-end">
                                            <div className="flex gap-2 text-[10px] uppercase font-bold text-zinc-600">
                                                <span className="text-red-900/80">P{Math.round(m.macros.protein)}</span>
                                                <span className="text-blue-900/80">C{Math.round(m.macros.carbs)}</span>
                                                <span className="text-yellow-900/80">F{Math.round(m.macros.fats)}</span>
                                            </div>
                                            <span className="text-xs font-mono font-bold text-zinc-400">{m.calories}</span>
                                        </div>
                                    </div>
                                ))}
                           </CardContent>
                       </Card>
                   )
               })}
           </div>
       </div>

       {/* WEEKLY ANALYSIS & SUPPLEMENTS */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
           {/* WEEKLY CHART */}
           <Card className="lg:col-span-2 border-zinc-800 bg-zinc-950/50">
               <CardHeader>
                   <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                       <TrendingUp className="w-4 h-4"/> Weekly Fuel Analysis
                   </CardTitle>
               </CardHeader>
               <CardContent className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                            <XAxis 
                                dataKey="day" 
                                stroke="#52525b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                itemStyle={{ color: '#e4e4e7', fontSize: '12px', fontWeight: 'bold' }}
                                cursor={{ fill: '#27272a', opacity: 0.4 }}
                            />
                            <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                {weeklyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.calories > entry.target ? '#ef4444' : '#f97316'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
               </CardContent>
           </Card>

           {/* BODY COMPOSITION & WEIGHT */}
           <Card className="border-zinc-800 bg-zinc-950/50 flex flex-col">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                       <Scale className="w-4 h-4"/> Body Metrix
                   </CardTitle>
                   <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={() => setActiveDialog('weight')}>
                       <TrendingUp className="w-4 h-4"/>
                   </Button>
               </CardHeader>
               
               <CardContent className="flex-1 flex flex-col justify-between">
                   {/* Current Weight Display */}
                   <div className="text-center py-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 mb-4 group hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => setActiveDialog('weight')}>
                        <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Current Mass</div>
                        <div className="flex items-baseline justify-center gap-1">
                             <span className="text-5xl font-black text-white tracking-tighter">{currentData.weight || '--'}</span>
                             <span className="text-sm font-bold text-zinc-600">KG</span>
                        </div>
                        {/* Fake diff for visual pop */}
                        <div className="text-xs font-mono text-emerald-500 mt-1 flex items-center justify-center gap-1">
                            <TrendingUp className="w-3 h-3" /> 0.2kg this week
                        </div>
                   </div>

                   {/* Quick measurements grid */}
                   <div className="grid grid-cols-2 gap-3">
                       {['Waist', 'Chest', 'Arms', 'Thighs'].map((part) => (
                           <div key={part} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex justify-between items-center group hover:bg-zinc-900 transition-colors">
                               <span className="text-xs font-bold text-zinc-500 uppercase">{part}</span>
                               <span className="text-sm font-mono font-bold text-zinc-300">
                                   {(currentData as any).body?.[part.toLowerCase()] || '--'} <span className="text-[10px] text-zinc-600">cm</span>
                               </span>
                           </div>
                       ))}
                   </div>

                   <Button variant="outline" className="w-full mt-4 border-zinc-800 hover:bg-zinc-900 text-xs uppercase tracking-widest font-bold" onClick={() => setActiveDialog('weight')}>
                        Update Biometrics
                   </Button>
               </CardContent>
           </Card>
       </div>

    </div>
  );
}
