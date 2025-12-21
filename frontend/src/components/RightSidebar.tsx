'use client';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Activity, X, Zap, CheckCircle2, Circle, ArrowRight, Wind, Sun, Moon, RefreshCw, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useTaskStore } from '@/stores/taskStore';

const MICRO_DIRECTIVES = [
    { text: "Hydrate: 500ml Water", icon: "💧" },
    { text: "Posture Check: Align Spine", icon: "🧘‍♂️" },
    { text: "Vision Break: 20-20-20 Rule", icon: "👀" },
    { text: "Clear Workspace: Zero Clutter", icon: "🧹" },
    { text: "Deep Breath: 4-7-8 Pattern", icon: "🌬️" },
    { text: "Stretch: Stand & Reach", icon: "🧍" },
    { text: "Mindfulness: 60s Silence", icon: "🧠" },
];

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
  
  // Stores
  const { tasks, logs, toggleLog } = useTaskStore();
  
  // Local State
  const [atmosphere, setAtmosphere] = useState<'focus' | 'energy' | 'zen'>('focus');
  const [directive, setDirective] = useState<{ text: string; icon: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

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
  }, [isResizing, onWidthChange]);

  // DATA SELECTORS
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const activeTasks = tasks.filter(t => t.active);
  // Sort by active status (incomplete first) then priority/order
  const queueTasks = activeTasks
      .filter(t => !logs[`${t._id}-${todayStr}`]) // Only incomplete
      .slice(0, 5); // Take top 5

  // Synchronicity Logic
  const generateDirective = () => {
      setIsSpinning(true);
      setDirective(null);
      // Fake spin delay
      setTimeout(() => {
          const random = MICRO_DIRECTIVES[Math.floor(Math.random() * MICRO_DIRECTIVES.length)];
          setDirective(random);
          setIsSpinning(false);
      }, 800);
  };

  if (!isOpen) return null;

  return (
    <div 
        ref={sidebarRef}
        className="fixed inset-y-0 right-0 z-40 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col"
        style={{ width: `${width}px` }}
    >
      {/* Drag Handle */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-50"
        onMouseDown={startResizing}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
          <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              System Overlay
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="w-4 h-4" />
          </Button>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          
          {/* 1. ATMOSPHERE CONTROL */}
          <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <div className="flex items-center gap-2">
                       <Wind className="w-3 h-3" />
                       <span>Atmosphere</span>
                  </div>
              </div>
              
              <div className={cn(
                  "rounded-xl p-5 relative overflow-hidden transition-all duration-500 border border-white/5",
                  atmosphere === 'focus' ? "bg-indigo-950/50 from-indigo-900/50 to-blue-900/50" : 
                  atmosphere === 'energy' ? "bg-amber-950/50 from-amber-900/50 to-orange-900/50" : 
                  "bg-emerald-950/50 from-emerald-900/50 to-teal-900/50"
              )}>
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-500", 
                       atmosphere === 'focus' ? "from-indigo-500/20 to-blue-500/20" : 
                       atmosphere === 'energy' ? "from-amber-500/20 to-orange-500/20" : 
                       "from-emerald-500/20 to-teal-500/20"
                  )} />

                  <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex justify-between items-center bg-black/20 p-1 rounded-lg">
                          <button onClick={() => setAtmosphere('focus')} className={cn("p-2 rounded-md transition-all", atmosphere === 'focus' ? "bg-white/20 text-white shadow-sm" : "text-zinc-400 hover:text-white")} title="Deep Focus">
                             <Moon className="w-4 h-4" />
                          </button>
                          <button onClick={() => setAtmosphere('energy')} className={cn("p-2 rounded-md transition-all", atmosphere === 'energy' ? "bg-white/20 text-white shadow-sm" : "text-zinc-400 hover:text-white")} title="High Energy">
                             <Sun className="w-4 h-4" />
                          </button>
                          <button onClick={() => setAtmosphere('zen')} className={cn("p-2 rounded-md transition-all", atmosphere === 'zen' ? "bg-white/20 text-white shadow-sm" : "text-zinc-400 hover:text-white")} title="Rest & Recovery">
                             <Wind className="w-4 h-4" />
                          </button>
                      </div>
                      
                      <div className="text-center">
                          <h4 className="text-white font-bold text-sm tracking-wide">
                              {atmosphere === 'focus' ? "Deep Focus Protocol" : atmosphere === 'energy' ? "Kinetic Energy Mode" : "Zen Restoration"}
                          </h4>
                          <p className="text-[10px] text-white/50 mt-1">
                              {atmosphere === 'focus' ? "Optimizing cognitive load." : atmosphere === 'energy' ? "Maximizing output velocity." : "Reducing system entropy."}
                          </p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800" />

          {/* 2. TACTICAL QUEUE */}
          <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                   <div className="flex items-center gap-2">
                       <Zap className="w-3 h-3" />
                       <span>Tactical Queue</span>
                   </div>
                   <span className="text-zinc-600">{queueTasks.length} PENDING</span>
              </div>
              
              <div className="space-y-2">
                  {queueTasks.length === 0 ? (
                      <div className="p-4 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
                          <p className="text-xs text-muted-foreground">All systems nominal. Queue empty.</p>
                      </div>
                  ) : (
                      queueTasks.map(task => (
                          <div key={task._id} className="group flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors">
                              <button 
                                onClick={() => toggleLog(task._id, todayStr)}
                                className="mt-0.5 text-zinc-400 hover:text-green-500 transition-colors"
                              >
                                  <Circle className="w-4 h-4" />
                              </button>
                              <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium leading-none truncate">{task.title}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                      <span className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          task.difficulty === 'Hard' ? 'bg-red-500' :
                                          task.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                                      )} />
                                      {task.difficulty} Priority
                                  </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                          </div>
                      ))
                  )}
              </div>
          </div>

          <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800" />

          {/* 3. SYNCHRONICITY ENGINE */}
          <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                   <RefreshCw className="w-3 h-3" />
                   <span>Synchronicity Engine</span>
              </div>
              
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden">
                  {!directive ? (
                      <div className="py-2">
                          <Button 
                              size="lg" 
                              className={cn("w-full transition-all duration-500", isSpinning ? "opacity-50 scale-95" : "")} 
                              onClick={generateDirective}
                              disabled={isSpinning}
                          >
                             {isSpinning ? "Calibrating..." : "Generate Directive"}
                          </Button>
                          <p className="text-[10px] text-muted-foreground mt-2">Activate random micro-optimization.</p>
                      </div>
                  ) : (
                      <div className="animate-in zoom-in slide-in-from-bottom-2 duration-300">
                          <div className="text-4xl mb-2">{directive.icon}</div>
                          <h4 className="font-bold text-lg">{directive.text}</h4>
                          <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-4 gap-2 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors"
                              onClick={() => setDirective(null)}
                          >
                              <Check className="w-4 h-4" /> Complete
                          </Button>
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
}
