'use client';

import { useEffect, useState } from 'react';
import { FitnessNav } from '@/components/FitnessNav';
import { useTaskStore, Food } from '@/stores/taskStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2, Flame, Utensils, Activity, ShoppingBasket, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PantryPage() {
  const { foods, fetchFoods, createFood, deleteFood } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFood, setNewFood] = useState({
      name: '', calories: '', protein: '', carbs: '', fats: '',
      servingSize: { amount: '', unit: 'g' }
  });

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleCreateFood = async () => {
      if (!newFood.name || !newFood.calories) return toast.error("Required fields missing");
      try {
          await createFood({
              name: newFood.name,
              calories: Number(newFood.calories),
              macros: { protein: Number(newFood.protein), carbs: Number(newFood.carbs), fats: Number(newFood.fats) },
              servingSize: { amount: Number(newFood.servingSize.amount) || 100, unit: newFood.servingSize.unit || 'g' },
              micros: {}
          } as any);
          toast.success("Inventory Updated");
          setNewFood({ name: '', calories: '', protein: '', carbs: '', fats: '', servingSize: { amount: '', unit: 'g' } });
          setIsCreateOpen(false);
      } catch (err) { toast.error("Failed to save food"); }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500 min-h-screen relative">
      <FitnessNav />

      {/* HEADER SECTION */}
      <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800 p-10 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                            <ShoppingBasket className="w-6 h-6 text-emerald-500"/>
                        </div>
                        <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Database Manager</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                        PANTRY<span className="text-zinc-800 text-stroke-1 dark:text-zinc-900" style={{WebkitTextStroke: '1px #27272a'}}>OS</span>
                    </h1>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search inventory..."
                            className="h-12 pl-12 bg-zinc-900/50 border-zinc-800 focus-visible:ring-emerald-500/50 text-lg"
                        />
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 font-bold text-white">
                        <Plus className="w-5 h-5 mr-2" /> Add Item
                    </Button>
                </div>
            </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(food => (
              <div 
                  key={food._id} 
                  className="group relative bg-zinc-950 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between shadow-lg hover:shadow-emerald-900/10"
              >
                  {/* Glowing Border Gradient on Hover */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/50 transition-all duration-500" />

                  <div className="space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1" title={food.name}>{food.name}</h3>
                          <button 
                              onClick={() => { if(confirm('Delete ' + food.name + '?')) deleteFood(food._id); }}
                              className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-500 transition-all -mr-2 -mt-2"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>

                      {/* Main Calorie Display */}
                      <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-white tracking-tighter">{food.calories}</span>
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Kcal</span>
                      </div>

                      {/* Serving Badge */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                           <Utensils className="w-3 h-3" />
                           {food.servingSize.amount} {food.servingSize.unit}
                      </div>
                  </div>

                  {/* Footer Macros */}
                  <div className="mt-8 grid grid-cols-3 gap-3 border-t border-zinc-900 pt-4">
                      <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase"><span>Pro</span><span>{food.macros.protein}</span></div>
                          <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-red-500/80" style={{width: '60%'}}/></div>
                      </div>
                      <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase"><span>Carb</span><span>{food.macros.carbs}</span></div>
                          <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-blue-500/80" style={{width: '40%'}}/></div>
                      </div>
                      <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase"><span>Fat</span><span>{food.macros.fats}</span></div>
                          <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-yellow-500/80" style={{width: '20%'}}/></div>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {foods.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
              <ShoppingBasket className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No items in inventory. Create one to get started.</p>
          </div>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="border-zinc-800 bg-zinc-950 p-0 overflow-hidden sm:max-w-lg">
              <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">New Food Asset</DialogTitle>
                    <DialogDescription className="text-zinc-500">Add logic to the nutritional engine</DialogDescription>
                  </div>
                  {/* Close button handled by Dialog primitive usually, but custom one here if needed */}
              </div>
              
              <div className="p-6 space-y-6">
                  <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs font-bold uppercase">Name</Label>
                            <Input value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} className="bg-zinc-900 border-zinc-800 h-12 text-lg" placeholder="e.g. Oatmeal" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs font-bold uppercase">Calories</Label>
                                <div className="relative">
                                    <Input type="number" value={newFood.calories} onChange={e => setNewFood({...newFood, calories: e.target.value})} className="bg-zinc-900 border-zinc-800 pl-9" />
                                    <Flame className="absolute left-3 top-2.5 w-4 h-4 text-orange-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs font-bold uppercase">Serving ({newFood.servingSize.unit})</Label>
                                <Input type="number" value={newFood.servingSize.amount} onChange={e => setNewFood({...newFood, servingSize: { ...newFood.servingSize, amount: e.target.value}})} className="bg-zinc-900 border-zinc-800" placeholder="100" />
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-3">
                             <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase"><Activity className="w-3 h-3"/> Macros</div>
                             <div className="grid grid-cols-3 gap-3">
                                 <div className="space-y-1 text-center">
                                     <Label className="text-[10px] text-red-500 uppercase">Protein</Label>
                                     <Input className="h-10 bg-zinc-950 border-zinc-800 text-center" placeholder="0" value={newFood.protein} onChange={e => setNewFood({...newFood, protein: e.target.value})} />
                                 </div>
                                 <div className="space-y-1 text-center">
                                     <Label className="text-[10px] text-blue-500 uppercase">Carbs</Label>
                                     <Input className="h-10 bg-zinc-950 border-zinc-800 text-center" placeholder="0" value={newFood.carbs} onChange={e => setNewFood({...newFood, carbs: e.target.value})} />
                                 </div>
                                 <div className="space-y-1 text-center">
                                     <Label className="text-[10px] text-yellow-500 uppercase">Fats</Label>
                                     <Input className="h-10 bg-zinc-950 border-zinc-800 text-center" placeholder="0" value={newFood.fats} onChange={e => setNewFood({...newFood, fats: e.target.value})} />
                                 </div>
                             </div>
                        </div>
                  </div>
                  <Button onClick={handleCreateFood} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 font-bold text-lg">Create Asset</Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
