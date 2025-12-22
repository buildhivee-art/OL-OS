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
    Zap, CheckCircle2, Clock, Activity, Radar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar } from 'recharts';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function NutritionPage() {
  const { metrics, fetchMetrics, updateMetric, foods, fetchFoods, createFood, deleteFood } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Dialogs
  const [activeDialog, setActiveDialog] = useState<string | null>(null); // 'water', 'weight', 'pantry'
  const [isTrainingDay, setIsTrainingDay] = useState(false);

  // Quick Add State
  const [quickAdd, setQuickAdd] = useState({ name: '', calories: '' });
  const [searchQuery, setSearchQuery] = useState('');



  // TARGETS
  const TARGETS = useMemo(() => isTrainingDay ? {
    calories: 2900, protein: 140, carbs: 400, fats: 80, water: 4000
  } : {
    calories: 2700, protein: 120, carbs: 350, fats: 75, water: 3000
  }, [isTrainingDay]);

  const MICRO_TARGETS = {
      magnesium: 400, calcium: 1000, vitaminD: 600, zinc: 11, iron: 8, potassium: 3500, vitaminC: 90
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
    foodLog: currentMetric.foodLog || [],
    body: currentMetric.body || {}
  }), [currentMetric]);

  const weeklyData = useMemo(() => {
      return eachDayOfInterval({ start: subDays(selectedDate, 6), end: selectedDate }).map(d => {
          const key = format(d, 'yyyy-MM-dd');
          const m = metrics[key] || {};
          return {
              day: format(d, 'EEE'),
              calories: m.calories || 0,
              target: TARGETS.calories
          };
      });
  }, [metrics, selectedDate, TARGETS]);

  // --- ACTIONS ---

  const recalculateAndSave = async (newLog: Meal[]) => {
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
    const totalMicros: any = { magnesium: 0, calcium: 0, vitaminD: 0, zinc: 0, iron: 0, potassium: 0, vitaminC: 0 };
    
    newLog.forEach((m: Meal) => {
        totalCal += m.calories || 0;
        totalP += m.macros?.protein || 0;
        totalC += m.macros?.carbs || 0;
        totalF += m.macros?.fats || 0;
        
        if (m.micros) {
            Object.keys(totalMicros).forEach(k => {
                totalMicros[k] += (m.micros as any)[k] || 0;
            });
        }
    });

    await updateMetric(dateKey, {
        calories: totalCal,
        macros: { protein: totalP, carbs: totalC, fats: totalF },
        micros: totalMicros,
        foodLog: newLog 
    });
  };



  const addFoodToLog = async (food: Food | Partial<Meal>) => {
       const newEntry: Meal = {
           id: Date.now().toString(),
           name: food.name || 'Unknown',
           calories: food.calories || 0,
           macros: food.macros || { protein: 0, carbs: 0, fats: 0 },
           timestamp: new Date().toISOString()
       };
       await recalculateAndSave([...currentData.foodLog, newEntry]);
       toast.success("Fuel Injected");
       setActiveDialog(null);
  };

  const deleteEntry = async (id: string) => {
    const updatedLog = currentData.foodLog.filter(m => m.id !== id);
    await recalculateAndSave(updatedLog);
    toast.success("Entry Purged");
 };

  const getPercent = (val: number, target: number) => Math.min(100, Math.round((val / target) * 100));

  return (
    <div className="min-h-screen pb-20 space-y-8 animate-in fade-in duration-700">
      <FitnessNav />

      {/* DIALOGS */}
      <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className={cn(
            "border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-0 overflow-hidden transition-all duration-300",
            activeDialog === 'pantry' ? "max-w-[95vw] w-[95vw] h-[90vh] md:h-[85vh]" : "sm:max-w-2xl"
        )}>
             {activeDialog === 'food_picker' ? (
                 <div className="flex flex-col h-full w-full bg-zinc-950">
                     
                     {/* PICKER HEADER */}
                     <div className="shrink-0 border-b border-zinc-800 bg-zinc-950 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                         <div className="flex items-center gap-3">
                             <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                 <ShoppingBasket className="w-6 h-6 text-emerald-500" />
                             </div>
                             <div>
                                 <DialogTitle className="text-2xl font-black text-white">SELECT FUEL</DialogTitle>
                                 <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest">Click item to inject</DialogDescription>
                             </div>
                         </div>
                         
                         <div className="flex items-center gap-3 w-full md:w-auto">
                             <div className="relative w-full md:w-[300px]">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                <Input 
                                    className="pl-10 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500/50" 
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                             </div>
                             <Button variant="outline" onClick={() => window.location.href='/dashboard/fitness/pantry'} className="hidden md:flex gap-2 border-zinc-800 bg-zinc-900">
                                 <Activity className="w-4 h-4"/> Manage DB
                             </Button>
                             <Button variant="ghost" size="icon" onClick={() => setActiveDialog(null)}>
                                 <X className="w-5 h-5" />
                             </Button>
                         </div>
                     </div>

                     {/* FOOD GRID */}
                     <div className="flex-1 overflow-y-auto p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100 bg-zinc-950">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(food => (
                                <div 
                                    key={food._id} 
                                    onClick={() => addFoodToLog(food)} 
                                    className="group cursor-pointer bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all duration-200 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="font-bold text-zinc-200 group-hover:text-emerald-400 truncate pr-2">{food.name}</div>
                                        <div className="text-[10px] font-bold bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase">{food.servingSize.amount}{food.servingSize.unit}</div>
                                    </div>

                                    <div className="flex items-baseline gap-1 relative z-10">
                                        <span className="text-3xl font-black text-white">{food.calories}</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">kcal</span>
                                    </div>

                                    {/* Mini Macro Bars */}
                                    <div className="grid grid-cols-3 gap-2 relative z-10 mt-auto">
                                        <div className="h-1 bg-zinc-950 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{width: '60%'}}/></div>
                                        <div className="h-1 bg-zinc-950 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: '40%'}}/></div>
                                        <div className="h-1 bg-zinc-950 rounded-full overflow-hidden"><div className="h-full bg-yellow-500" style={{width: '20%'}}/></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {foods.length === 0 && (
                            <div className="text-center py-12 text-zinc-500">
                                <p>Database empty.</p>
                                <Button variant="link" onClick={() => window.location.href='/dashboard/fitness/pantry'}>Go to Pantry Manager</Button>
                            </div>
                        )}
                     </div>
                 </div>
             ) : activeDialog === 'water' ? (
                 <div className="p-6">
                    <DialogHeader><DialogTitle className="text-cyan-500">Hydration Log</DialogTitle></DialogHeader>
                    <div className="py-8 text-center">
                        <Input autoFocus type="number" className="text-4xl h-20 text-center font-black bg-transparent border-0 border-b-2 border-zinc-800 focus-visible:ring-0 focus-visible:border-cyan-500" placeholder="0" 
                        onChange={(e) => {
                            if(e.target.value.length >= 3) {
                                updateMetric(dateKey, { water: (currentData.water || 0) + Number(e.target.value) });
                                setActiveDialog(null);
                                toast.success("Hydration Updated");
                            }
                        }} /> 
                        <div className="text-sm text-zinc-500 mt-4">Enter amount in ml</div>
                    </div>
                 </div>
             ) : (
                <div className="p-6">
                     <DialogHeader className="mb-6"><DialogTitle className="flex items-center gap-2"><Scale className="w-5 h-5 text-blue-500" /> Update Biometrics</DialogTitle></DialogHeader>
                     <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                 <Label>Weight (KG)</Label>
                                 <Input type="number" className="h-14 text-2xl font-black bg-zinc-900 border-zinc-800"
                                     placeholder={(currentData.weight || 0).toString()}
                                     onBlur={(e) => { if(e.target.value) updateMetric(dateKey, { weight: Number(e.target.value) }); }}
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
                                        <Input type="number" className="bg-zinc-900 border-zinc-800"
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
             )}
        </DialogContent>
      </Dialog>


      {/* 1. HERO CONTROL CENTER */}
      <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 border border-zinc-800 p-8 md:p-12 shadow-2xl">
          {/* Ambient Backgrounds */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"/>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none"/>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"/>

          <div className="relative z-10 flex flex-col xl:flex-row justify-between xl:items-end gap-10">
              <div className="space-y-6">
                  <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 shadow-sm backdrop-blur-md">
                          Metabolic Engine
                      </div>
                      <div className="h-px w-12 bg-zinc-800"/>
                      <div className="bg-zinc-900 p-0.5 rounded-full border border-zinc-800 flex items-center">
                            <button onClick={() => setIsTrainingDay(false)} className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all", !isTrainingDay ? "bg-zinc-800 text-zinc-300" : "text-zinc-600 hover:text-zinc-400")}>Rest</button>
                            <button onClick={() => setIsTrainingDay(true)} className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all", isTrainingDay ? "bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]" : "text-zinc-600 hover:text-zinc-400")}>Active</button>
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                       <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85]">
                           DIET<span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-700 to-zinc-800">OS</span>
                       </h1>
                       <div className="flex items-center gap-4">
                           <div className="flex items-baseline gap-1">
                               <span className="text-4xl font-bold text-emerald-500">{currentData.calories}</span>
                               <span className="text-sm font-bold text-zinc-500 uppercase tracking-wide">/ {TARGETS.calories} kcal</span>
                           </div>
                           <div className="h-8 w-px bg-zinc-800"/>
                           <Button variant="ghost" className="h-auto p-0 hover:bg-transparent group" onClick={() => setActiveDialog('weight')}>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase group-hover:text-blue-400 transition-colors">Body Mass</span>
                                    <span className="text-xl font-bold text-zinc-300 group-hover:text-white transition-colors">{currentData.weight || '--'} <span className="text-xs text-zinc-600">kg</span></span>
                                </div>
                           </Button>
                       </div>
                  </div>
              </div>

              {/* DATE NAVIGATOR */}
              <div className="flex flex-col gap-4 min-w-[300px]">
                   <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-2 rounded-2xl flex items-center justify-between shadow-inner">
                       <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/5 hover:text-white text-zinc-500" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                           <ChevronLeft className="w-5 h-5"/>
                       </Button>
                       <div className="text-center">
                           <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE')}</div>
                           <div className="text-lg font-bold text-white font-mono">{format(selectedDate, 'MMM dd, yyyy')}</div>
                       </div>
                       <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/5 hover:text-white text-zinc-500" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                           <ChevronRight className="w-5 h-5"/>
                       </Button>
                   </div>
                   
                   {/* Quick Action Bar */}
                   <div className="grid grid-cols-2 gap-2">
                       <Button className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-500" onClick={() => setActiveDialog('food_picker')}>
                           <Plus className="w-4 h-4 mr-2"/> Add Fuel
                       </Button>
                       <Button className="bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/20 text-cyan-500" onClick={() => setActiveDialog('water')}>
                           <Droplets className="w-4 h-4 mr-2"/> Water
                       </Button>
                   </div>
              </div>
          </div>
      </div>

      <div className="space-y-8">
          
          {/* 1. HEADS UP DISPLAY: ENERGY & AQUATICS */}
          {/* 1. HEADS UP DISPLAY: ENERGY & AQUATICS */}
          {/* 1. HEADS UP DISPLAY: ENERGY & AQUATICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Energy Tank */}
               <motion.div 
                   initial={{ y: 20, opacity: 0 }} 
                   animate={{ y: 0, opacity: 1 }} 
                   className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-800 p-8 flex flex-col justify-between group h-[340px] shadow-2xl"
                >
                   {/* Glow Effects */}
                   <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3 transition-opacity duration-700 group-hover:bg-orange-500/20"/>
                   <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-red-500/10 blur-[60px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/3"/>
                   
                   <div className="relative z-10 flex justify-between items-start">
                       <div>
                           <div className="flex items-center gap-3 mb-4">
                               <div className="p-2.5 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner">
                                   <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse"/>
                               </div>
                               <span className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">Energy Matrix</span>
                           </div>
                           <div className="flex items-baseline gap-3">
                               <span className="text-6xl font-black text-white tracking-tighter" style={{textShadow: '0 0 40px rgba(249,115,22,0.3)'}}>
                                   {currentData.calories}
                               </span>
                               <span className="text-sm font-bold text-zinc-600 uppercase tracking-widest">/ {TARGETS.calories} kcal</span>
                           </div>
                       </div>
                       <CircularProgressbarWithChildren 
                           value={getPercent(currentData.calories, TARGETS.calories)} 
                           styles={buildStyles({ 
                               pathColor: currentData.calories > TARGETS.calories ? '#ef4444' : '#f97316', 
                               trailColor: '#18181b', 
                               strokeLinecap: 'butt'
                           })}
                           className="w-20 h-20"
                       >
                           <div className="text-xs font-bold text-zinc-500">
                               {Math.round((currentData.calories/TARGETS.calories)*100)}%
                           </div>
                       </CircularProgressbarWithChildren>
                   </div>

                   <div className="relative z-10 space-y-4">
                       <div className="flex justify-between text-xs font-bold uppercase text-zinc-500 tracking-wider">
                           <span>System Status</span>
                           <span>{TARGETS.calories - currentData.calories} kcal Remaining</span>
                       </div>
                       <div className="h-6 bg-zinc-900 rounded-full border border-zinc-800/50 overflow-hidden relative shadow-inner">
                           <div 
                                className={cn("h-full transition-all duration-1000 ease-out relative", currentData.calories > TARGETS.calories ? "bg-red-600 shadow-[0_0_20px_#ef4444]" : "bg-gradient-to-r from-orange-600 to-amber-500 shadow-[0_0_20px_#f97316]")} 
                                style={{width: `${Math.min(100, (currentData.calories/TARGETS.calories)*100)}%`}}
                           >
                               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"/>
                               <div className="absolute inset-0 bg-white/20 animate-pulse-slow"/>
                           </div>
                       </div>
                       <div className="w-full h-px bg-zinc-800/50"/>
                       <div className="flex gap-4 text-[10px] font-bold uppercase text-zinc-600">
                           <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> Protein Heavy</span>
                           <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Carb Moderate</span>
                       </div>
                   </div>
               </motion.div>

               {/* Hydration Module */}
               <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.1 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-800 p-8 flex flex-col justify-between group h-[340px] shadow-2xl cursor-pointer hover:border-cyan-500/30 transition-colors"
                    onClick={() => setActiveDialog('water')}
                >
                   <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3 transition-opacity duration-700 group-hover:bg-cyan-500/20"/>
                   <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-950/40 to-transparent pointer-events-none"/>
                   
                   <div className="relative z-10 flex justify-between items-start">
                       <div>
                           <div className="flex items-center gap-3 mb-4">
                               <div className="p-2.5 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner">
                                   <Droplets className="w-5 h-5 text-cyan-500 fill-cyan-500 animate-bounce-slow"/>
                               </div>
                               <span className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">Hydration Level</span>
                           </div>
                           <div className="flex items-baseline gap-3">
                               <span className="text-6xl font-black text-white tracking-tighter" style={{textShadow: '0 0 40px rgba(6,182,212,0.3)'}}>
                                   {(currentData.water / 1000).toFixed(1)}
                               </span>
                               <span className="text-sm font-bold text-zinc-600 uppercase tracking-widest">/ {(TARGETS.water / 1000).toFixed(1)} L</span>
                           </div>
                       </div>
                        <Button 
                             size="icon" 
                             className="w-16 h-16 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-lg hover:shadow-cyan-500/50"
                             onClick={(e) => { e.stopPropagation(); updateMetric(dateKey, { water: currentData.water + 250 }); toast.success('+250ml Added'); }}
                        >
                            <Plus className="w-8 h-8"/>
                        </Button>
                   </div>

                   <div className="relative z-10 space-y-4">
                        <div className="flex justify-between text-xs font-bold uppercase text-zinc-500 tracking-wider">
                           <span>Volume Saturation</span>
                           <span>{Math.round((currentData.water/TARGETS.water)*100)}%</span>
                       </div>
                       
                        {/* Custom Liquid Bar */}
                       <div className="h-6 bg-zinc-900 rounded-full border border-zinc-800/50 overflow-hidden relative shadow-inner">
                           <div className="absolute inset-0 flex gap-1 p-1">
                               {/* Segmented Bar Look */}
                               {Array.from({length: 20}).map((_, i) => (
                                   <div key={i} className="flex-1 bg-zinc-800/30 rounded-sm overflow-hidden">
                                       <div 
                                          className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-500" 
                                          style={{
                                              opacity: i / 20 < (currentData.water / TARGETS.water) ? 1 : 0, 
                                              transform: `scaleY(${i / 20 < (currentData.water / TARGETS.water) ? 1 : 0})`
                                          }}
                                       />
                                   </div>
                               ))}
                           </div>
                       </div>
                        <div className="w-full h-px bg-zinc-800/50"/>
                       <div className="flex gap-4 text-[10px] font-bold uppercase text-zinc-600">
                           <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500"/> Optimal</span>
                           <span className="flex items-center gap-1.5"> Last Log: Just now</span>
                       </div>
                   </div>
               </motion.div>
          </div>

          
          {/* 2. MIDDLE ROW: MACROS & CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Macro Cylinders (4 cols) */}
              <div className="md:col-span-12 xl:col-span-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-6">
                 {/* Protein */}
                 <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-row xl:flex-row items-center gap-6 group hover:border-red-500/30 transition-all">
                      <div className="w-16 h-16 shrink-0">
                          <CircularProgressbarWithChildren value={getPercent(currentData.protein, TARGETS.protein)} styles={buildStyles({ pathColor: '#ef4444', trailColor: '#27272a' })}>
                              <Flame className="w-4 h-4 text-red-500"/>
                          </CircularProgressbarWithChildren>
                      </div>
                      <div>
                          <div className="text-3xl font-black text-white">{currentData.protein}g</div>
                          <div className="text-xs font-bold text-zinc-500 uppercase">Protein / {TARGETS.protein}g</div>
                      </div>
                 </motion.div>

                  {/* Carbs */}
                 <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-row xl:flex-row items-center gap-6 group hover:border-blue-500/30 transition-all">
                      <div className="w-16 h-16 shrink-0">
                          <CircularProgressbarWithChildren value={getPercent(currentData.carbs, TARGETS.carbs)} styles={buildStyles({ pathColor: '#3b82f6', trailColor: '#27272a' })}>
                              <Zap className="w-4 h-4 text-blue-500"/>
                          </CircularProgressbarWithChildren>
                      </div>
                      <div>
                          <div className="text-3xl font-black text-white">{currentData.carbs}g</div>
                          <div className="text-xs font-bold text-zinc-500 uppercase">Carbs / {TARGETS.carbs}g</div>
                      </div>
                 </motion.div>

                  {/* Fats */}
                 <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-row xl:flex-row items-center gap-6 group hover:border-yellow-500/30 transition-all">
                      <div className="w-16 h-16 shrink-0">
                          <CircularProgressbarWithChildren value={getPercent(currentData.fats, TARGETS.fats)} styles={buildStyles({ pathColor: '#eab308', trailColor: '#27272a' })}>
                              <Droplets className="w-4 h-4 text-yellow-500"/>
                          </CircularProgressbarWithChildren>
                      </div>
                      <div>
                          <div className="text-3xl font-black text-white">{currentData.fats}g</div>
                          <div className="text-xs font-bold text-zinc-500 uppercase">Fats / {TARGETS.fats}g</div>
                      </div>
                 </motion.div>
              </div>

               {/* Analytics (8 cols) */}
               <div className="md:col-span-12 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-[340px]">
                   <Card className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden h-full">
                       <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2"><TrendingUp className="w-3 h-3"/> Caloric Trend (7d)</CardTitle></CardHeader>
                       <div className="h-full w-full pb-14 pr-4 pl-0">
                           <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <Tooltip contentStyle={{backgroundColor: '#09090b', borderColor: '#27272a'}} itemStyle={{fontSize: '12px', fontWeight: 'bold'}} cursor={{fill: '#27272a'}}/>
                                    <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                                        {weeklyData.map((e, i) => (
                                            <Cell key={i} fill={e.calories > e.target ? '#ef4444' : '#27272a'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                           </ResponsiveContainer>
                       </div>
                   </Card>
                   
                   <Card className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden relative h-full">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                           <Radar className="w-24 h-24 text-emerald-500"/>
                       </div>
                       <CardHeader className="pb-0"><CardTitle className="text-xs font-bold uppercase text-zinc-500">Micronutrient Matrix</CardTitle></CardHeader>
                       <div className="h-full w-full flex items-center justify-center -mt-4">
                             <ResponsiveContainer width="100%" height="90%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={Object.entries(MICRO_TARGETS).slice(0, 6).map(([k, t]) => ({ subject: k.substring(0,3).toUpperCase(), A: Math.min(100, (((currentData.micros as any)[k] || 0) / t) * 100), fullMark: 100 }))}>
                                    <PolarGrid stroke="#27272a" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#52525b', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <RechartsRadar name="Micros" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                                </RadarChart>
                            </ResponsiveContainer>
                       </div>
                   </Card>
               </div>
          </div>


          {/* 3. FUEL STREAM LOG (Full Width) */}
          <div className="space-y-6">
              {/* Quick Add Bar */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-3xl flex items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                  
                  <div className="flex items-center gap-4 z-10 w-full">
                      <div className="h-12 w-12 shrink-0 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 shadow-inner">
                          <Zap className="w-5 h-5 text-orange-500"/>
                      </div>
                      <Input 
                            className="bg-transparent border-none text-lg font-bold placeholder:text-zinc-700/50 focus-visible:ring-0 p-4 h-auto tracking-tight" 
                            placeholder="Type to inject fuel..."
                            value={quickAdd.name}
                            onChange={e => setQuickAdd({...quickAdd, name: e.target.value})}
                      />
                  </div>
                  
                  <div className="flex items-center gap-4 z-10">
                       <Input 
                            type="number"
                            className="w-24 bg-zinc-900 border-zinc-800 text-right h-12 text-lg font-mono rounded-xl focus-visible:ring-orange-500/50" 
                            placeholder="0"
                            value={quickAdd.calories}
                            onChange={e => setQuickAdd({...quickAdd, calories: e.target.value})}
                      />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest -ml-2 mr-2">kcal</span>
                      
                      <Button size="icon" className="w-12 h-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20 transition-all hover:scale-105" disabled={!quickAdd.name || !quickAdd.calories} onClick={() => { addFoodToLog({name: quickAdd.name, calories: Number(quickAdd.calories)}); setQuickAdd({name:'', calories:''}); }}>
                          <Plus className="w-5 h-5"/>
                      </Button>
                      <div className="w-px h-8 bg-zinc-800 mx-2"/>
                      <Button variant="outline" className="border-zinc-800 bg-zinc-900 gap-2 h-12 px-4 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all" onClick={() => setActiveDialog('food_picker')}>
                           <ShoppingBasket className="w-4 h-4"/> <span className="uppercase font-bold tracking-wider text-[10px]">Pantry</span>
                      </Button>
                  </div>
              </div>

              {/* Log Feed */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl min-h-[400px]">
                   <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
                       <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-3">
                           <Activity className="w-4 h-4"/> Metabolic Stream
                       </h3>
                       <div className="text-[10px] bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-zinc-500 font-mono uppercase">
                           {currentData.foodLog.length} Events • Today
                       </div>
                   </div>

                   <div className="grid grid-cols-1 divide-y divide-zinc-900">
                        {currentData.foodLog.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-zinc-700 gap-4 opacity-50">
                                <Coffee className="w-12 h-12"/>
                                <span className="text-sm font-mono uppercase tracking-widest">No Fuel Injected Yet</span>
                            </div>
                        ) : (
                            [...currentData.foodLog].reverse().map((item, idx) => (
                                <motion.div 
                                    key={item.id || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 hover:bg-zinc-900/50 transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="text-xs font-mono text-zinc-600 w-12">{item.timestamp ? format(new Date(item.timestamp), 'HH:mm') : '--:--'}</div>
                                        <div>
                                            <div className="text-base font-bold text-zinc-200">{item.name}</div>
                                            <div className="flex gap-4 text-[10px] text-zinc-500 font-mono uppercase mt-1">
                                                {item.macros?.protein > 0 && <span className="text-zinc-500"><span className="text-red-500">P</span> {item.macros.protein}g</span>}
                                                {item.macros?.carbs > 0 && <span className="text-zinc-500"><span className="text-blue-500">C</span> {item.macros.carbs}g</span>}
                                                {item.macros?.fats > 0 && <span className="text-zinc-500"><span className="text-yellow-500">F</span> {item.macros.fats}g</span>}
                                                {(item.micros && Object.keys(item.micros).length > 0) && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Micronutrients</span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="text-xl font-bold text-white tracking-tighter">{item.calories} <span className="text-xs text-zinc-600 font-normal">kcal</span></div>
                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all" onClick={() => deleteEntry(item.id)}>
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
}
