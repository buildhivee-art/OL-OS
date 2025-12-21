'use client';

import { useEffect, useState, useMemo } from 'react';
import { FitnessNav } from '@/components/FitnessNav';
import { useTaskStore } from '@/stores/taskStore';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Scale, MoveVertical, Ruler, Percent, Calculator, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';

// Helper to calculate Body Fat % (Navy Seal Formula - simplified approximation)
const calculateBodyFat = (gender: 'male' | 'female', waist: number, neck: number, height: number, hips?: number) => {
    // Height, Waist, Neck in inches for standard formula or cm. Assuming cm here.
    // 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450 (Male)
    if (waist <= 0 || neck <= 0 || height <= 0) return 0;
    
    // Convert to log10 base
    const log = Math.log10;
    
    if (gender === 'male') {
        const val = 495 / (1.0324 - 0.19077 * log(waist - neck) + 0.15456 * log(height)) - 450;
        return Math.max(0, val);
    } else {
        if (!hips) return 0;
        // 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
        const val = 495 / (1.29579 - 0.35004 * log(waist + hips - neck) + 0.22100 * log(height)) - 450;
        return Math.max(0, val);
    }
};

export default function MeasurementsPage() {
  const { metrics, fetchMetrics, updateMetric } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Local state for editing to avoid constant re-renders/saves
  const [bodyValues, setBodyValues] = useState({
      neck: '', shoulders: '', chest: '', waist: '', hips: '',
      biceps: '', forearms: '', thighs: '', calves: '', height: '175' // default 175cm
  });

  const [gender, setGender] = useState<'male' | 'female'>('male'); // Could be from user profile

  useEffect(() => {
    // Fetch generic range
    const start = subDays(selectedDate, 30);
    const end = addDays(selectedDate, 1);
    fetchMetrics(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
  }, [selectedDate, fetchMetrics]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const currentMetric = metrics[dateKey] || { weight: 0, hp: 0 };
  const measurements = currentMetric.body || {};

  // Initialize inputs with fetched data
  useEffect(() => {
      setBodyValues(prev => ({
          ...prev,
          neck: measurements.neck ? String(measurements.neck) : '',
          shoulders: measurements.shoulders ? String(measurements.shoulders) : '',
          chest: measurements.chest ? String(measurements.chest) : '',
          waist: measurements.waist ? String(measurements.waist) : '',
          hips: measurements.hips ? String(measurements.hips) : '',
          biceps: measurements.biceps ? String(measurements.biceps) : '',
          forearms: measurements.forearms ? String(measurements.forearms) : '',
          thighs: measurements.thighs ? String(measurements.thighs) : '',
          calves: measurements.calves ? String(measurements.calves) : '',
      }));
  }, [measurements]);

  const handleSave = async (key: string, value: string) => {
      const numVal = parseFloat(value);
      if (isNaN(numVal)) return;
      
      const newBody = { ...measurements, [key]: numVal } as any; // Cast to any or helper type due to dynamic key access
      
      await updateMetric(dateKey, {
          body: newBody
      });
      // toast.success(`${key} updated`);
  };

  const bfPercentage = useMemo(() => {
      const w = parseFloat(bodyValues.waist) || 0;
      const n = parseFloat(bodyValues.neck) || 0;
      const h = parseFloat(bodyValues.height) || 175;
      const hip = parseFloat(bodyValues.hips) || 0;
      
      const res = calculateBodyFat(gender, w, n, h, hip);
      return res > 0 && isFinite(res) ? res.toFixed(1) : '--';
  }, [bodyValues, gender]);

  // Visual Body SVG Component (Interactive)
  const BodyMap = () => (
      <div className="relative h-[500px] w-full flex items-center justify-center">
          {/* Abstract SVG Body Representation */}
          <svg viewBox="0 0 200 400" className="h-full drop-shadow-2xl">
              {/* Head/Neck */}
              <g onClick={() => document.getElementById('neck-input')?.focus()} className="cursor-pointer hover:opacity-80 transition-opacity group">
                  <circle cx="100" cy="40" r="25" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2" />
                  <rect x="90" y="65" width="20" height="15" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2 group-hover:fill-blue-500/20" />
                  <text x="130" y="75" className="text-[8px] fill-muted-foreground uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Neck</text>
              </g>

              {/* Shoulders/Chest */}
              <path 
                d="M 60,80 Q 100,70 140,80 L 140,130 Q 100,140 60,130 Z" 
                className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2 cursor-pointer hover:fill-blue-500/20 transition-colors"
                onClick={() => document.getElementById('chest-input')?.focus()}
              />
              
              {/* Torso/Waist */}
              <path 
                d="M 60,130 L 140,130 L 130,200 L 70,200 Z" 
                className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2 cursor-pointer hover:fill-blue-500/20 transition-colors"
                onClick={() => document.getElementById('waist-input')?.focus()}
              />

              {/* Arms */}
              <rect x="35" y="85" width="25" height="70" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2 cursor-pointer hover:fill-blue-500/20 transition-colors" onClick={() => document.getElementById('biceps-input')?.focus()} rx="5"/>
              <rect x="140" y="85" width="25" height="70" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2 cursor-pointer hover:fill-blue-500/20 transition-colors" onClick={() => document.getElementById('biceps-input')?.focus()} rx="5"/>

              {/* Hips */}
               <path 
                d="M 70,200 L 130,200 L 140,240 L 60,240 Z" 
                className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2 cursor-pointer hover:fill-blue-500/20 transition-colors"
                onClick={() => document.getElementById('hips-input')?.focus()}
              />

              {/* Legs */}
              <rect x="65" y="240" width="30" height="70" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2 cursor-pointer hover:fill-blue-500/20 transition-colors" onClick={() => document.getElementById('thighs-input')?.focus()} rx="5"/>
              <rect x="105" y="240" width="30" height="70" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2 cursor-pointer hover:fill-blue-500/20 transition-colors" onClick={() => document.getElementById('thighs-input')?.focus()} rx="5"/>
              
              <rect x="70" y="315" width="20" height="50" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2 cursor-pointer hover:fill-blue-500/20 transition-colors" onClick={() => document.getElementById('calves-input')?.focus()} rx="5"/>
              <rect x="110" y="315" width="20" height="50" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-2 cursor-pointer hover:fill-blue-500/20 transition-colors" onClick={() => document.getElementById('calves-input')?.focus()} rx="5"/>

              {/* Measurement indicators lines */}
              <line x1="50" y1="110" x2="20" y2="110" stroke="currentColor" strokeDasharray="2 2" className="text-zinc-300" />
              <text x="5" y="112" className="text-[10px] fill-muted-foreground font-bold">ARM</text>

              <line x1="100" y1="130" x2="160" y2="130" stroke="currentColor" strokeDasharray="2 2" className="text-zinc-300" />
              <text x="165" y="132" className="text-[10px] fill-muted-foreground font-bold">CHEST</text>

               <line x1="100" y1="165" x2="20" y2="165" stroke="currentColor" strokeDasharray="2 2" className="text-zinc-300" />
              <text x="5" y="167" className="text-[10px] fill-muted-foreground font-bold">WAIST</text>
          </svg>
      </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <FitnessNav />

      {/* HEADER & DATE NAV */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Body Lab</h1>
          <p className="text-muted-foreground mt-1">Biometric tracking and composition analysis.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: VISUAL BODY MAP + CALCULATOR */}
          <div className="space-y-6">
               <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-lg">
                           <MoveVertical className="w-5 h-5" /> Somatometry
                       </CardTitle>
                       <CardDescription>Click body parts to log measurements (cm)</CardDescription>
                   </CardHeader>
                   <CardContent>
                       <BodyMap />
                   </CardContent>
               </Card>

               {/* BODY FAT ESTIMATOR */}
               <Card className="border-blue-500/20 bg-blue-500/5 overflow-hidden">
                   <CardHeader className="pb-2">
                       <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2 text-base">
                           <Calculator className="w-4 h-4" /> Body Composition Estimate
                       </CardTitle>
                   </CardHeader>
                   <CardContent className="grid grid-cols-2 gap-8 items-center">
                        <div>
                             <div className="text-4xl font-black tabular-nums text-foreground">
                                 {bfPercentage}%
                             </div>
                             <div className="text-xs font-bold text-muted-foreground uppercase mt-1">Body Fat (Navy Method)</div>
                             <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
                                 *Estimate based on neck, waist, and height. Ensure accuracy of these fields.
                             </p>
                        </div>
                        <div className="space-y-2">
                             <Label className="text-xs">Approx Height (cm)</Label>
                             <Input 
                                type="number" 
                                className="h-8 bg-background" 
                                value={bodyValues.height} 
                                onChange={(e) => setBodyValues({...bodyValues, height: e.target.value})}
                             />
                             <div className="flex gap-2 mt-2">
                                 <Button 
                                    size="sm" 
                                    variant={gender === 'male' ? 'default' : 'outline'} 
                                    onClick={() => setGender('male')}
                                    className="flex-1 h-7 text-xs"
                                 >
                                     Male
                                 </Button>
                                 <Button 
                                    size="sm" 
                                    variant={gender === 'female' ? 'default' : 'outline'} 
                                    onClick={() => setGender('female')}
                                    className="flex-1 h-7 text-xs"
                                 >
                                     Female
                                 </Button>
                             </div>
                        </div>
                   </CardContent>
               </Card>
          </div>

          {/* RIGHT: INPUT FORM */}
          <div className="space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 h-full">
                  <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                           <Ruler className="w-5 h-5 text-purple-500" /> Measurement Log
                       </CardTitle>
                       <CardDescription>Enter values in centimeters (cm)</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          <div className="space-y-4">
                              <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                  Use Tape <Info className="w-3 h-3" />
                              </h4>
                              
                              <div className="space-y-2">
                                  <Label htmlFor="neck-input" className="flex justify-between">
                                      <span>Neck</span>
                                      <span className="text-muted-foreground font-normal text-xs">{bodyValues.neck || '--'} cm</span>
                                  </Label>
                                  <Input 
                                    id="neck-input"
                                    type="number" 
                                    placeholder="0" 
                                    value={bodyValues.neck}
                                    onChange={(e) => setBodyValues({...bodyValues, neck: e.target.value})}
                                    onBlur={(e) => handleSave('neck', e.target.value)}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="shoulders-input" className="flex justify-between">
                                      <span>Shoulders</span>
                                      <span className="text-muted-foreground font-normal text-xs">{bodyValues.shoulders || '--'} cm</span>
                                  </Label>
                                  <Input 
                                    id="shoulders-input"
                                    type="number" 
                                    placeholder="0" 
                                    value={bodyValues.shoulders}
                                    onChange={(e) => setBodyValues({...bodyValues, shoulders: e.target.value})}
                                    onBlur={(e) => handleSave('shoulders', e.target.value)}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="chest-input" className="flex justify-between">
                                      <span>Chest</span>
                                      <span className="text-muted-foreground font-normal text-xs">{bodyValues.chest || '--'} cm</span>
                                  </Label>
                                  <Input 
                                    id="chest-input"
                                    type="number" 
                                    placeholder="0" 
                                    value={bodyValues.chest}
                                    onChange={(e) => setBodyValues({...bodyValues, chest: e.target.value})}
                                    onBlur={(e) => handleSave('chest', e.target.value)}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="waist-input" className="flex justify-between">
                                      <span>Waist</span>
                                      <span className="text-muted-foreground font-normal text-xs">{bodyValues.waist || '--'} cm</span>
                                  </Label>
                                  <Input 
                                    id="waist-input"
                                    type="number" 
                                    placeholder="0" 
                                    value={bodyValues.waist}
                                    onChange={(e) => setBodyValues({...bodyValues, waist: e.target.value})}
                                    onBlur={(e) => handleSave('waist', e.target.value)}
                                  />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="hips-input" className="flex justify-between">
                                      <span>Hips</span>
                                      <span className="text-muted-foreground font-normal text-xs">{bodyValues.hips || '--'} cm</span>
                                  </Label>
                                  <Input 
                                    id="hips-input"
                                    type="number" 
                                    placeholder="0" 
                                    value={bodyValues.hips}
                                    onChange={(e) => setBodyValues({...bodyValues, hips: e.target.value})}
                                    onBlur={(e) => handleSave('hips', e.target.value)}
                                  />
                              </div>
                          </div>

                          <div className="space-y-4">
                              <h4 className="text-xs font-bold uppercase text-muted-foreground">Extremities</h4>
                              
                              <div className="space-y-2">
                                  <Label htmlFor="biceps-input" className="flex justify-between">
                                      <span>Biceps (L/R Avg)</span>
                                      <span className="text-muted-foreground font-normal text-xs">{bodyValues.biceps || '--'} cm</span>
                                  </Label>
                                  <Input 
                                    id="biceps-input"
                                    type="number" 
                                    placeholder="0" 
                                    value={bodyValues.biceps}
                                    onChange={(e) => setBodyValues({...bodyValues, biceps: e.target.value})}
                                    onBlur={(e) => handleSave('biceps', e.target.value)}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="forearms-input" className="flex justify-between">
                                      <span>Forearms</span>
                                      <span className="text-muted-foreground font-normal text-xs">{bodyValues.forearms || '--'} cm</span>
                                  </Label>
                                  <Input 
                                    id="forearms-input"
                                    type="number" 
                                    placeholder="0" 
                                    value={bodyValues.forearms}
                                    onChange={(e) => setBodyValues({...bodyValues, forearms: e.target.value})}
                                    onBlur={(e) => handleSave('forearms', e.target.value)}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="thighs-input" className="flex justify-between">
                                      <span>Thighs</span>
                                      <span className="text-muted-foreground font-normal text-xs">{bodyValues.thighs || '--'} cm</span>
                                  </Label>
                                  <Input 
                                    id="thighs-input"
                                    type="number" 
                                    placeholder="0" 
                                    value={bodyValues.thighs}
                                    onChange={(e) => setBodyValues({...bodyValues, thighs: e.target.value})}
                                    onBlur={(e) => handleSave('thighs', e.target.value)}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="calves-input" className="flex justify-between">
                                      <span>Calves</span>
                                      <span className="text-muted-foreground font-normal text-xs">{bodyValues.calves || '--'} cm</span>
                                  </Label>
                                  <Input 
                                    id="calves-input"
                                    type="number" 
                                    placeholder="0" 
                                    value={bodyValues.calves}
                                    onChange={(e) => setBodyValues({...bodyValues, calves: e.target.value})}
                                    onBlur={(e) => handleSave('calves', e.target.value)}
                                  />
                              </div>
                          </div>

                      </div>
                  </CardContent>
              </Card>
          </div>

      </div>

    </div>
  );
}
