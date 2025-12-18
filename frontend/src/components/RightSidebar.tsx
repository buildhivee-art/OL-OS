'use client';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, X, Cpu, Zap, Hourglass, Dna, Sparkles, BrainCircuit } from 'lucide-react';
import { format } from 'date-fns';
import { useTaskStore } from '@/stores/taskStore';

export function RightSidebar({ 
    isOpen, 
    onClose, 
    width, 
    onWidthChange 
}: { 
    isOpen: boolean; 
    onClose: () => void;
    width: number;
    onWidthChange: (w: number) => void;
}) {
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { tasks } = useTaskStore();

  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // Calculate from Right edge
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 600) {
        onWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Quick Stats / Data (Mocked or Real)
  const todayTasks = tasks.filter(t => t.active); 

  if (!isOpen) return null;

  return (
    <div 
        ref={sidebarRef}
        className="fixed inset-y-0 right-0 z-40 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col"
        style={{ width: `${width}px` }}
    >
      {/* Drag Handle */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-50"
        onMouseDown={startResizing}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Widgets
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="w-4 h-4" />
          </Button>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          
          {/* 1. THE LIFE KERNEL (System Monitor) */}
          <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-primary/70">
                  <div className="flex items-center gap-2">
                       <Cpu className="w-4 h-4" />
                       <span>System Kernel</span>
                  </div>
                  <span className="animate-pulse text-emerald-500">⚫ ONLINE</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">Cognitive Load</div>
                      <div className="text-2xl font-black font-mono flex items-baseline gap-1">
                          {Math.min(100, tasks.filter(t => t.active).length * 12)}<span className="text-sm text-muted-foreground">%</span>
                      </div>
                      <Progress value={Math.min(100, tasks.filter(t => t.active).length * 12)} className="h-1 mt-2" />
                  </div>
                   <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">System Uptime</div>
                      <div className="text-xl font-black font-mono">
                          14<span className="text-sm text-muted-foreground">h</span> 12<span className="text-sm text-muted-foreground">m</span>
                      </div>
                      <div className="flex gap-0.5 mt-2.5">
                          {[1,1,1,1,1,0,0,0].map((v, i) => (
                              <div key={i} className={cn("h-1 w-full rounded-full", v ? "bg-emerald-500" : "bg-zinc-700")} />
                          ))}
                      </div>
                  </div>
              </div>
              
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 relative overflow-hidden group cursor-pointer hover:border-red-500/50 transition-colors">
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                   <div className="relative z-10 flex items-center justify-between">
                       <div>
                           <div className="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-0.5">Overclock</div>
                           <div className="text-xs text-zinc-400">Boost focus metrics by 150%</div>
                       </div>
                       <Zap className="w-5 h-5 text-zinc-700 group-hover:text-red-500 transition-colors" />
                   </div>
              </div>
          </div>

          <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

          {/* 2. THE ENTROPY GAUGE (Memento Mori) */}
          <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/70">
                   <Hourglass className="w-4 h-4" />
                   <span>Entropy Gauge</span>
              </div>
              
              <div className="space-y-4">
                  {/* Year Progress */}
                  <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase font-bold">
                          <span>Year Progress (2025)</span>
                          <span className="font-mono text-muted-foreground">
                              {/* Rough calculation for demonstration */}
                              {((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 365) * 100).toFixed(4)}%
                          </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
                          <div 
                              className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                              style={{ width: `${((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 365) * 100)}%` }}
                          />
                      </div>
                  </div>

                   {/* Day Progress */}
                   <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase font-bold">
                          <span>Day Remaining</span>
                          <span className="font-mono text-muted-foreground">
                              {/* Remaining hours */}
                              {(24 - new Date().getHours() - (new Date().getMinutes()/60)).toFixed(1)} hrs
                          </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
                           <div 
                              className="h-full bg-zinc-800 dark:bg-zinc-200" 
                              style={{ width: `${((new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60)) * 100}%` }}
                          />
                      </div>
                  </div>

                  {/* Life Expectancy (The Scary Number) */}
                  <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-lg text-center space-y-1">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Expected Life Completion</div>
                      <div className="text-3xl font-black font-mono tracking-tighter text-foreground">
                          34<span className="text-zinc-400">.02154%</span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

          {/* 3. THE ORACLE (Randomness Engine) */}
          <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/70">
                   <Dna className="w-4 h-4" />
                   <span>The Oracle</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="h-auto py-3 px-4 flex items-center justify-between group hover:border-primary/50 transition-all">
                      <div className="text-left">
                          <div className="text-xs font-bold uppercase">Summon Quest</div>
                          <div className="text-[10px] text-muted-foreground">Activate a random backlog task</div>
                      </div>
                      <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-3 px-4 flex items-center justify-between group hover:border-primary/50 transition-all">
                      <div className="text-left">
                          <div className="text-xs font-bold uppercase">Memory Recall</div>
                          <div className="text-[10px] text-muted-foreground">Surface a past journal entry</div>
                      </div>
                      <BrainCircuit className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                  </Button>
              </div>

              {/* Oblique Strategy Card */}
              <div className="mt-2 p-4 bg-zinc-900 text-zinc-100 rounded-lg text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
                  <p className="text-xs font-serif italic opacity-80 mb-2">"Oblique Strategy"</p>
                  <p className="font-bold text-sm">Honor thy error as a hidden intention.</p>
              </div>
          </div>

      </div>
    </div>
  );
}
