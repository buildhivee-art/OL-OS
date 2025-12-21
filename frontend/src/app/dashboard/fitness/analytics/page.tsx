'use client';

import { useEffect, useState, useMemo } from 'react';
import { FitnessNav } from '@/components/FitnessNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useWorkoutStore, Workout } from '@/stores/workoutStore';
import { useTaskStore } from '@/stores/taskStore';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { Activity, TrendingUp, Dumbbell, Calendar, Zap, Trophy, Flame, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Types for chart data
interface ChartData {
    date: string;
    value: number;
    formattedDate: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#f97316'];

// Helper to deduce muscle group from exercise name
const CATEGORY_MAP: Record<string, string> = {
    'push': 'Push', 'dip': 'Push', 'bench': 'Push', 'press': 'Push', 'chest': 'Push',
    'pull': 'Pull', 'row': 'Pull', 'chin': 'Pull', 'back': 'Pull', 'deadlift': 'Pull',
    'squat': 'Legs', 'lunge': 'Legs', 'leg': 'Legs', 'calf': 'Legs', 'glute': 'Legs', 'jump': 'Legs',
    'curl': 'Arms', 'tricep': 'Arms', 'extension': 'Arms',
    'plank': 'Core', 'sit': 'Core', 'raise': 'Core', 'crunch': 'Core',
    'run': 'Cardio', 'walk': 'Cardio', 'burpee': 'Cardio', 'climber': 'Cardio'
};

const getCategory = (name: string) => {
    const lower = name.toLowerCase();
    for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
        if (lower.includes(key)) return cat;
    }
    return 'Other';
};

export default function FitnessAnalyticsPage() {
  const { workouts, fetchWorkouts } = useWorkoutStore();
  const { metrics, fetchMetrics } = useTaskStore();
  const [timeRange, setTimeRange] = useState<'7D' | '1M' | '3M' | 'ALL'>('1M');

  useEffect(() => {
    fetchWorkouts();
    // Fetch metrics for wider range just in case
    const end = new Date();
    const start = subDays(end, 365); 
    fetchMetrics(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
  }, [fetchWorkouts, fetchMetrics]);


  // ----------------------------------------------------
  // DATA PROCESSING
  // ----------------------------------------------------

  const { processedData, muscleBalance, recommendedFocus, aggregateStats, progressiveOverload } = useMemo(() => {
      const now = new Date();
      let startDate = subDays(now, 30);
      if (timeRange === '7D') startDate = subDays(now, 7);
      if (timeRange === '3M') startDate = subDays(now, 90);
      if (timeRange === 'ALL') startDate = subDays(now, 365); 

      const dates = eachDayOfInterval({ start: startDate, end: now });

      // 1. Time Series Data
      const data = dates.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const daysWorkouts = workouts.filter(w => isSameDay(parseISO(w.date), date));
          
          let dailyVolume = 0;
          let dailyReps = 0;
          let setsCount = 0;
          
          daysWorkouts.forEach(w => {
              w.exercises.forEach(ex => {
                  ex.sets.forEach(s => {
                       dailyVolume += (s.weight || 0) * (s.reps || 0);
                       dailyReps += (s.reps || 0);
                       setsCount++;
                  });
              });
          });

          const metricData = metrics[dateStr];

          return {
              date: dateStr,
              formattedDate: format(date, 'MMM dd'),
              volume: dailyVolume,
              reps: dailyReps,
              sets: setsCount,
              weight: metricData?.weight || null,
              calories: metricData?.calories || null,
          };
      });

      // 2. Muscle Balance (Radar Data)
      const balance: Record<string, number> = { Push: 0, Pull: 0, Legs: 0, Arms: 0, Core: 0, Cardio: 0 };
      let totalSetsAnalyzed = 0;

      workouts.forEach(w => {
           // Filter by date range
           if (new Date(w.date) >= startDate) {
               w.exercises.forEach(ex => {
                   const cat = getCategory(ex.name);
                   if (balance[cat] !== undefined) {
                       balance[cat] += ex.sets.length;
                       totalSetsAnalyzed += ex.sets.length;
                   }
               });
           }
      });

      const radarData = Object.entries(balance)
        .map(([subject, A]) => ({ subject, A, fullMark: totalSetsAnalyzed > 0 ? totalSetsAnalyzed : 100 }))
        .filter(x => x.subject !== 'Other');

      // 3. Recommendation Logic
      // Find the category with lowest volume (excluding Cardio maybe)
      const lowestCat = radarData
          .filter(d => d.subject !== 'Cardio')
          .sort((a,b) => a.A - b.A)[0];
      
      const recommendedFocus = lowestCat && lowestCat.A < (totalSetsAnalyzed / 5) * 0.5 
          ? lowestCat.subject 
          : "Balanced";


      // 4. Aggregates
      const validCalorieDays = data.filter(d => d.calories !== null && d.calories > 0);
      const avgCalories = validCalorieDays.length > 0 
          ? Math.round(validCalorieDays.reduce((a,b) => a + (b.calories||0), 0) / validCalorieDays.length)
          : 0;
      
      const totalVol = data.reduce((a,b) => a + b.volume, 0);
      const totalSessions = workouts.filter(w => new Date(w.date) >= startDate).length;

      // 5. Progressive Overload Indicator
      // Calculate Avg Volume per Session for first half vs second half of period
      const halfIdx = Math.floor(data.length / 2);
      const firstHalf = data.slice(0, halfIdx).reduce((a,b) => a + b.volume, 0);
      const secondHalf = data.slice(halfIdx).reduce((a,b) => a + b.volume, 0);
      const overloadTrend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

      return {
          processedData: data,
          muscleBalance: radarData,
          recommendedFocus,
          aggregateStats: {
              avgCalories,
              totalVol,
              totalSessions,
          },
          progressiveOverload: overloadTrend
      };
  }, [workouts, metrics, timeRange]);

  // Exercise Frequency for Pie Chart
  const exerciseStats = useMemo(() => {
      const stats: Record<string, number> = {};
      workouts.forEach(w => {
          w.exercises.forEach(ex => {
              stats[ex.name] = (stats[ex.name] || 0) + 1;
          });
      });
      return Object.entries(stats)
          .map(([name, value]) => ({ name, value }))
          .sort((a,b) => b.value - a.value)
          .slice(0, 5);
  }, [workouts]);

  // Personal Records
   const personalRecords = useMemo(() => {
      const prs: Record<string, { weight: number, date: string }> = {};
      workouts.forEach(w => {
          w.exercises.forEach(ex => {
              ex.sets.forEach(s => {
                  if (s.weight && s.weight > 0) {
                      if (!prs[ex.name] || s.weight > prs[ex.name].weight) {
                          prs[ex.name] = { weight: s.weight, date: w.date };
                      }
                  }
              });
          });
      });
      return Object.entries(prs)
          .sort(([,a], [,b]) => b.weight - a.weight)
          .slice(0, 5);
  }, [workouts]);


  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <FitnessNav />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Performance Lab</h1>
            <p className="text-muted-foreground mt-1">Deep dive into your physiological telemetry.</p>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
              {(['7D', '1M', '3M', 'ALL'] as const).map(range => (
                  <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={cn(
                          "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                          timeRange === range 
                              ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-sm" 
                              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                  >
                      {range}
                  </button>
              ))}
          </div>
      </div>

      {/* INTELLIGENCE ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 border-amber-500/20 bg-amber-500/5 overflow-hidden relative">
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Training Intelligence
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="mb-4">
                      <span className="text-xs text-muted-foreground">Detected Weakness:</span>
                      <div className="text-3xl font-black uppercase text-foreground mt-1">
                          {recommendedFocus === "Balanced" ? "All Systems Go" : `Lagging: ${recommendedFocus}`}
                      </div>
                  </div>
                  
                  {recommendedFocus !== "Balanced" ? (
                      <p className="text-xs text-muted-foreground">
                          Analysis indicates your <strong>{recommendedFocus}</strong> volume is significantly lower than other muscle groups. Consider adding an extra session or volume block.
                      </p>
                  ) : (
                      <p className="text-xs text-muted-foreground">
                          Your training distribution is exceptionally balanced across all major movement patterns. Maintain current protocol.
                      </p>
                  )}
                  
                  {/* Visual Decoration */}
                  <Target className="absolute -bottom-4 -right-4 w-24 h-24 text-amber-500/10 rotate-12" />
              </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 border-zinc-200 dark:border-zinc-800">
               <div className="grid grid-cols-2 md:grid-cols-4 h-full divide-x divide-zinc-100 dark:divide-zinc-800">
                    <div className="p-6 flex flex-col justify-center">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Volume Load</div>
                        <div className="text-2xl font-black tabular-nums">{(aggregateStats.totalVol / 1000).toFixed(1)}k</div>
                        <div className={cn("text-xs font-bold mt-1", progressiveOverload > 0 ? "text-green-500" : "text-zinc-400")}>
                            {progressiveOverload > 0 ? '+' : ''}{progressiveOverload.toFixed(1)}% Trend
                        </div>
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Sessions</div>
                        <div className="text-2xl font-black tabular-nums">{aggregateStats.totalSessions}</div>
                        <div className="text-xs text-zinc-400 font-bold mt-1">Completed</div>
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Avg Calories</div>
                        <div className="text-2xl font-black tabular-nums">{aggregateStats.avgCalories}</div>
                        <div className="text-xs text-zinc-400 font-bold mt-1">kcal / day</div>
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Intensity</div>
                        <div className="text-2xl font-black tabular-nums">High</div>
                        <div className="text-xs text-green-500 font-bold mt-1">Optimal Range</div>
                    </div>
               </div>
          </Card>
      </div>


      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* VOLUME AREA CHART */}
          <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-primary" /> Volume Metrics
                  </CardTitle>
                  <CardDescription>Total workload trend over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedData}>
                        <defs>
                            <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.1} />
                        <XAxis 
                            dataKey="formattedDate" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#71717a', fontSize: 10}} 
                            minTickGap={30}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#71717a', fontSize: 10}} 
                            tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} 
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#09090b', 
                                border: '1px solid #27272a', 
                                borderRadius: '12px',
                                boxShadow: '0px 4px 12px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(value: number | undefined) => [`${(value || 0).toLocaleString()} lbs`, 'Volume']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="volume" 
                            stroke="#f97316" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#colorVol)" 
                            activeDot={{r: 6, strokeWidth: 0}}
                        />
                    </AreaChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>

           {/* MUSCLE BALANCE RADAR */}
           <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Muscle Splinter
                  </CardTitle>
                  <CardDescription>Systemic distribution of volume</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={muscleBalance}>
                          <PolarGrid stroke="#333" strokeOpacity={0.2} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                          <Radar
                              name="Sets"
                              dataKey="A"
                              stroke="#a855f7"
                              strokeWidth={2}
                              fill="#a855f7"
                              fillOpacity={0.4}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderRadius: '8px', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                          />
                      </RadarChart>
                  </ResponsiveContainer>
              </CardContent>
           </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PERSONAL RECORDS TABLE */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
               <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                   <CardTitle className="text-lg font-bold flex items-center gap-2">
                       <Trophy className="w-5 h-5 text-yellow-500" /> Hall of Fame
                   </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                   <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                       {personalRecords.length > 0 ? personalRecords.map(([name, data], i) => (
                           <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                               <div className="flex items-center gap-3">
                                   <div className={cn(
                                       "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border",
                                       i === 0 ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/50" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-transparent"
                                   )}>
                                       #{i+1}
                                   </div>
                                   <div>
                                       <div className="font-bold text-sm">{name}</div>
                                       <div className="text-[10px] text-muted-foreground">{format(parseISO(data.date), 'MMM dd, yyyy')}</div>
                                   </div>
                               </div>
                               <div className="text-right">
                                   <div className="font-black text-lg">{data.weight} <span className="text-xs font-normal text-muted-foreground">lbs</span></div>
                               </div>
                           </div>
                       )) : (
                           <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                               <Dumbbell className="w-8 h-8 mb-2 opacity-20" />
                               No records found yet. Log a workout to see stats.
                           </div>
                       )}
                   </div>
               </CardContent>
          </Card>

          {/* WEIGHT TREND */}
           <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                       <Activity className="w-5 h-5 text-blue-500" /> Body Composition
                  </CardTitle>
                  <CardDescription>Correlate weight with training volume</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedData.filter(d => d.weight !== null && d.weight > 0)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.1} />
                        <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} />
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderRadius: '8px', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{r:4, fill:'#3b82f6'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>
      </div>

    </div>
  );
}
