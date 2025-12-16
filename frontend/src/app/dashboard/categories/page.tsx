'use client';

import { useEffect, useState } from 'react';
import { useCategoryStore } from '@/stores/categoryStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Grid, Layers, Code, Heart, Brain, Briefcase, Globe, Music, Cpu, Database, Zap, Shield, ArrowRight, Plus, Star, BarChart3, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CategoriesPage() {
  const { categories, fetchCategories, createCategory, isLoading } = useCategoryStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async () => {
      if (!newCategoryName) return;
      await createCategory(newCategoryName);
      setNewCategoryName('');
      setIsDialogOpen(false);
  };

  const getIcon = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes('dev') || n.includes('code')) return Code;
      if (n.includes('health') || n.includes('body') || n.includes('fit')) return Heart;
      if (n.includes('mind') || n.includes('learn') || n.includes('read')) return Brain;
      if (n.includes('work') || n.includes('career') || n.includes('job')) return Briefcase;
      if (n.includes('social') || n.includes('relat')) return Globe;
      if (n.includes('art') || n.includes('create') || n.includes('write')) return Music;
      if (n.includes('money') || n.includes('fin')) return Database;
      return Layers; 
  };

  const getLevelInfo = (name: string) => {
       // Mock logic - in real app, we'd sum XP from tasks in this category
       // For demo, hash name to get stable random numbers
       let hash = 0;
       for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
       const level = (Math.abs(hash) % 20) + 1;
       const progress = (Math.abs(hash) % 100);
       return { level, progress };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-zinc-900 to-black p-8 rounded-3xl text-white shadow-2xl border border-zinc-800 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-2">
                    <Grid className="w-4 h-4" /> System Architecture
                 </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                   Skill Matrix
                </h1>
                <p className="text-zinc-400 max-w-xl text-lg">
                    Manage and expand your operational domains. View progress across all active life sectors.
                </p>
            </div>
            
            <div className="relative z-10">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                         <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            <Plus className="mr-2 w-5 h-5" /> Initialize Domain
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Initialize New Domain</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Domain Name</Label>
                                <Input 
                                    placeholder="e.g., Cybernetics, Bio-Hacking, Linguistics" 
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={!newCategoryName}>Confirm Initialization</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Background Decoration */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <Layers className="w-64 h-64 -mb-12 -mr-12 text-white" />
            </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                 <CardContent className="p-4 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Layers className="w-5 h-5"/></div>
                     <div>
                         <p className="text-xs text-muted-foreground uppercase font-bold">Total Domains</p>
                         <p className="text-2xl font-black">{categories.length}</p>
                     </div>
                 </CardContent>
             </Card>
             <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                 <CardContent className="p-4 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><Star className="w-5 h-5"/></div>
                     <div>
                         <p className="text-xs text-muted-foreground uppercase font-bold">Mastery Level</p>
                         <p className="text-2xl font-black">12</p>
                     </div>
                 </CardContent>
             </Card>
             <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                 <CardContent className="p-4 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500"><Zap className="w-5 h-5"/></div>
                     <div>
                         <p className="text-xs text-muted-foreground uppercase font-bold">Active Streaks</p>
                         <p className="text-2xl font-black">8</p>
                     </div>
                 </CardContent>
             </Card>
              <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                 <CardContent className="p-4 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><BarChart3 className="w-5 h-5"/></div>
                     <div>
                         <p className="text-xs text-muted-foreground uppercase font-bold">Completion</p>
                         <p className="text-2xl font-black">87%</p>
                     </div>
                 </CardContent>
             </Card>
        </div>

        {/* DOMAINS GRID */}
         {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-72 rounded-3xl bg-zinc-200 dark:bg-zinc-900 animate-pulse" />
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category, index) => {
                    const Icon = getIcon(category.name);
                    const { level, progress } = getLevelInfo(category.name);
                    
                    return (
                        <Card key={category._id} className="group relative overflow-hidden flex flex-col justify-between border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl h-[320px]">
                            {/* Watermark Icon */}
                            <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 rotate-12">
                                <Icon className="w-48 h-48" />
                            </div>

                            <CardHeader className="relative z-10 pb-0">
                                <div className="flex justify-between items-start mb-4">
                                     <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center group-hover:from-primary group-hover:to-primary/80 transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-primary/20">
                                        <Icon className="w-7 h-7 text-zinc-600 dark:text-zinc-400 group-hover:text-white transition-colors duration-500" />
                                    </div>
                                    <div className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono font-bold text-muted-foreground uppercase">
                                        LVL {level}
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-black tracking-tight">{category.name}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-1">
                                    Operational protocols for {category.name} mastery.
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="relative z-10 pb-2 flex-1 flex flex-col justify-end space-y-4">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                        <span className="text-muted-foreground block mb-0.5">XP</span>
                                        <span className="font-mono font-bold">2,450</span>
                                    </div>
                                    <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                        <span className="text-muted-foreground block mb-0.5">Tasks</span>
                                        <span className="font-mono font-bold">12 Active</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>Progress to Lvl {level + 1}</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-1.5 bg-zinc-100 dark:bg-zinc-800" indicatorClassName="bg-primary group-hover:brightness-110 transition-all" />
                                </div>
                            </CardContent>

                            <CardFooter className="relative z-10 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                                <Button variant="ghost" className="w-full justify-between h-auto py-3 px-2 hover:bg-transparent group/btn">
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover/btn:text-primary transition-colors">Open Matrix</span>
                                    <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-white transition-all">
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
                
                {/* LOCKED SLOT */}
                 <Card className="flex flex-col items-center justify-center border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-transparent opacity-50 h-[320px]">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-muted-foreground">Locked Slot</h3>
                    <p className="text-xs text-muted-foreground mt-1">Reach Level 20 to unlock</p>
                </Card>
            </div>
        )}
    </div>
  );
}
