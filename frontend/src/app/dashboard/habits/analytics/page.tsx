'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { HabitNav } from '@/components/HabitNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subYears, eachDayOfInterval, getDay, isSameDay, startOfYear, endOfYear, getMonth, getDate } from 'date-fns';
import { TrendingUp, Zap, Target, Trophy, Activity, Calendar as CalendarIcon, ArrowUpRight, Download, ExternalLink, Lightbulb, Flame, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Brush, ScatterChart as RechartsScatterChart, Scatter, ZAxis
} from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { addDays } from 'date-fns';

// --- Components ---

const StatCard = ({ title, value, subtext, icon: Icon, trend, colorClass }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden"
  >
    <Card className="h-full border-border/50 bg-background/60 backdrop-blur-xl hover:bg-background/80 transition-all duration-300 hover:shadow-lg hover:border-primary/20 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-full bg-secondary/50 group-hover:bg-primary/20 transition-colors", colorClass)}>
            <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
            <div>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            </div>
            {trend && (
                <div className="flex items-center text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded-full">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {trend}
                </div>
            )}
        </div>
      </CardContent>
      {/* Decorative gradient blob */}
      <div className="absolute -right-12 -top-12 h-24 w-24 bg-primary/10 blur-3xl rounded-full pointer-events-none group-hover:bg-primary/20 transition-all" />
    </Card>
  </motion.div>
);

const Heatmap = ({ data, startDate, endDate }: { data: any[], startDate: Date, endDate: Date }) => {
    // Generate a full year grid or range grid
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Group by month for labels
    const months = useMemo(() => {
        const m: { name: string; index: number }[] = [];
        let currentMonth = -1;
        days.forEach((day, index) => {
            const month = getMonth(day);
            if (month !== currentMonth) {
                m.push({ name: format(day, 'MMM'), index });
                currentMonth = month;
            }
        });
        return m;
    }, [days]);

    // Determine intensity
    const getIntensity = (score: number) => {
        if (score === 0) return 'bg-secondary/20'; // Empty
        // GitHub-like blue progression
        if (score < 4) return 'bg-blue-200 dark:bg-blue-950';    // Level 1
        if (score < 8) return 'bg-blue-400 dark:bg-blue-800';    // Level 2
        if (score < 12) return 'bg-blue-600 dark:bg-blue-600';   // Level 3
        return 'bg-blue-800 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]'; // Level 4 (Max)
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[800px]">
                <div className="flex text-xs text-muted-foreground mb-2">
                    {months.map((m, i) => (
                        <div key={i} style={{ marginLeft: i === 0 ? 0 : 20, width: 40 }}>{m.name}</div>
                    ))}
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                    {days.map((day, i) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayData = data.find(d => d.fullDate === dateStr);
                        const score = dayData ? dayData.score : 0;
                        return (
                            <div 
                                key={dateStr} 
                                className={cn("h-3 w-3 rounded-[1px] transition-all hover:scale-125 hover:ring-2 ring-ring/50", getIntensity(score))}
                                title={`${dateStr}: ${score} pts`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default function AnalyticsPage() {
  const { tasks, logs, metrics, fetchLogs, fetchMetrics } = useTaskStore();
  const { categories, fetchCategories } = useCategoryStore();
  
  // Date State
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 89), 'yyyy-MM-dd')); // Default to 90 days for better heatmap
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateRangePreset, setDateRangePreset] = useState('30');
  const [scoreChartType, setScoreChartType] = useState<'bar' | 'line' | 'combined'>('combined');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedHabitDetail, setSelectedHabitDetail] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle Preset Change
  const handlePresetChange = (value: string) => {
      setDateRangePreset(value);
      const end = new Date();
      let start = new Date();
      
      switch (value) {
          case '7': start = subDays(end, 6); break;
          case '14': start = subDays(end, 13); break;
          case '30': start = subDays(end, 29); break;
          case '90': start = subDays(end, 89); break;
          case '365': start = subYears(end, 1); break;
          case 'ytd': start = startOfYear(end); break;
          default: return;
      }
      
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const exportToCSV = () => {
      const headers = ['Date', 'Total Score', 'Weight', 'HP', ...tasks.map(t => `"Habit: ${t.title}"`)];
      const rows = dailyData.map(d => {
          const habitStatuses = tasks.map(t => logs[`${t._id}-${d.fullDate}`] ? '1' : '0');
          return [d.fullDate, d.score, d.weight || '', d.hp || '', ...habitStatuses];
      });
      const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `habit_analytics_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  useEffect(() => {
    fetchLogs(startDate, endDate);
    fetchMetrics(startDate, endDate);
  }, [startDate, endDate, fetchLogs, fetchMetrics]);

  // Derived Data Calculation
  const days = useMemo(() => eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) }), [startDate, endDate]);

  const dailyData = useMemo(() => days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    let completedCount = 0;
    tasks.forEach(task => {
        if (logs[`${task._id}-${dateStr}`]) completedCount++;
    });
    const score = completedCount * 2; 
    
    return {
        date: format(day, 'MMM dd'),
        fullDate: dateStr,
        dayOfWeek: getDay(day), 
        score,
        weight: metrics[dateStr]?.weight || null,
        hp: metrics[dateStr]?.hp || null
    };
  }), [days, tasks, logs, metrics]);

  // Monthly Data Calculation
  const monthlyData = useMemo(() => {
      const data: Record<string, { date: string; score: number; count: number }> = {};
      dailyData.forEach(d => {
          const monthKey = format(new Date(d.fullDate), 'yyyy-MM');
          if (!data[monthKey]) {
              data[monthKey] = { date: format(new Date(d.fullDate), 'MMM yyyy'), score: 0, count: 0 };
          }
          data[monthKey].score += d.score;
          data[monthKey].count++;
      });
      return Object.values(data).map(d => ({
          ...d,
          average: Math.round(d.score / d.count)
      }));
  }, [dailyData]);

  const habitPerformance = useMemo(() => tasks.map(task => {
      let count = 0;
      days.forEach(day => {
          if (logs[`${task._id}-${format(day, 'yyyy-MM-dd')}`]) count++;
      });
      return { _id: task._id, name: task.title, value: count, category: task.category };
  }).filter(d => d.value > 0).sort((a,b) => b.value - a.value), [tasks, days, logs]);

  const categoryStats = useMemo(() => {
      const stats: Record<string, number> = {};
      habitPerformance.forEach(h => {
          let catName = 'Uncategorized';
          if (typeof h.category === 'object' && h.category && 'name' in h.category) {
              catName = (h.category as any).name;
          } else if (h.category && typeof h.category === 'string') {
              const found = categories.find(c => c._id === h.category);
              if (found) catName = found.name;
          }
          stats[catName] = (stats[catName] || 0) + h.value;
      });
      return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [habitPerformance, categories]);

  // Category Proficiency Calculation
  const categoryProficiency = useMemo(() => {
      const catStats: Record<string, { completed: number; total: number }> = {};
      tasks.forEach(task => {
           let catName = 'Uncategorized';
           if (typeof task.category === 'object' && task.category && 'name' in task.category) {
               catName = (task.category as any).name;
           } else if (task.category && typeof task.category === 'string') {
               const found = categories.find(c => c._id === task.category);
               if (found) catName = found.name;
           }
           
           if (!catStats[catName]) catStats[catName] = { completed: 0, total: 0 };

           days.forEach(day => {
               catStats[catName].total++;
               if (logs[`${task._id}-${format(day, 'yyyy-MM-dd')}`]) {
                   catStats[catName].completed++;
               }
           });
      });

      return Object.entries(catStats).map(([name, data]) => ({
          name,
          rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      })).sort((a,b) => b.rate - a.rate);
  }, [tasks, days, logs, categories]);

  // Radar Data
  const weekDayData = useMemo(() => {
      const dayStats = [0,0,0,0,0,0,0];
      const dayCounts = [0,0,0,0,0,0,0];
      dailyData.forEach(d => {
          dayStats[d.dayOfWeek] += d.score;
          dayCounts[d.dayOfWeek]++;
      });
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days.map((subject, i) => ({
          subject,
          score: dayCounts[i] ? Math.round(dayStats[i]/dayCounts[i]) : 0,
          fullMark: 100
      }));
  }, [dailyData]);

  // Stats
  const totalScore = dailyData.reduce((acc, d) => acc + d.score, 0);
  const avgScore = days.length > 0 ? Math.round(totalScore / days.length) : 0;
  const bestScore = Math.max(...dailyData.map(d => d.score), 0);
  const completionRate = (tasks.length * days.length) > 0 
    ? Math.round((habitPerformance.reduce((acc, curr) => acc + curr.value, 0) / (tasks.length * days.length)) * 100) 
    : 0;

  // Calculate Streaks (Current & Best in period)
  let currentStreak = 0;
  let maxStreak = 0;
  dailyData.forEach(d => {
      if (d.score > 0) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
          currentStreak = 0;
      }
  });

  // Chart Config
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e'];
  const CHART_Tooltip = {
      contentStyle: { 
        backgroundColor: 'var(--color-popover)', 
        borderColor: 'var(--color-border)', 
        color: 'var(--color-popover-foreground)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        padding: '8px 12px'
      },
      itemStyle: { color: 'var(--color-foreground)' }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Habit Analytics
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">Deep dive into your performance, consistency, and health metrics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-background/50 backdrop-blur-sm p-1.5 rounded-lg border shadow-sm">
            <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground hover:text-foreground" onClick={exportToCSV} title="Export to CSV">
                <Download className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Select value={dateRangePreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[140px] h-9 bg-transparent border-none hover:bg-muted/50 transition-colors">
                    <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="14">Last 14 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 3 Months</SelectItem>
                    <SelectItem value="ytd">Year to Date</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
            </Select>

            {dateRangePreset === 'custom' && (
                 <div className="flex items-center gap-2 border-l pl-2 mr-2">
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 w-auto text-xs" />
                    <span className="text-muted-foreground">-</span>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 w-auto text-xs" />
                </div>
            )}
        </div>
      </div>

      <HabitNav />

      {/* KPI CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Score" 
            value={totalScore} 
            subtext={`Avg: ${avgScore} / Best: ${bestScore}`} 
            icon={Trophy} 
            colorClass="text-yellow-500"
        />
        <StatCard 
            title="Completion Rate" 
            value={`${completionRate}%`} 
            subtext="Consistency Score" 
            icon={Target} 
            colorClass="text-blue-500"
        />
        <StatCard 
            title="Active Streak" 
            value={`${currentStreak} Days`} 
            subtext={`Best: ${maxStreak} Days`} 
            icon={Zap} 
            colorClass="text-amber-500"
        />
        <StatCard 
            title="Perfect Days" 
            value={dailyData.filter(d => d.score > 0 && d.score >= (tasks.length * 2)).length} 
            subtext="100% Habit Completion" 
            icon={Activity} 
            colorClass="text-emerald-500"
        />
      </div>

      {/* SMART INSIGHTS BANNER */}
      {(() => {
          // 1. Best Day of Week
          const bestDayIndex = weekDayData.reduce((bestI, d, i, arr) => d.score > arr[bestI].score ? i : bestI, 0);
          const bestDayName = weekDayData[bestDayIndex].subject;
          
          // 2. Rising Star (Improved Habit)
          let risingStar = null;
          let biggestDiff = 0;
          tasks.forEach(t => {
              const last7 = days.slice(-7);
              const prev7 = days.slice(-14, -7);
              const scoreLast = last7.filter(d => logs[`${t._id}-${format(d, 'yyyy-MM-dd')}`]).length;
              const scorePrev = prev7.filter(d => logs[`${t._id}-${format(d, 'yyyy-MM-dd')}`]).length;
              const diff = scoreLast - scorePrev;
              if (diff > biggestDiff) {
                  biggestDiff = diff;
                  risingStar = t.title;
              }
          });

          // 3. Neglected Area
          const worstCategory = categoryProficiency.length > 0 ? categoryProficiency[categoryProficiency.length - 1].name : null;

          if (!risingStar && !worstCategory) return null;

          return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg flex items-start gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-md text-indigo-500">
                          <Lightbulb className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Peak Performance</p>
                          <p className="text-xs text-muted-foreground mt-1">
                             You are most productive on <span className="font-bold text-foreground">{bestDayName}s</span>.
                          </p>
                      </div>
                  </div>

                  {risingStar && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg flex items-start gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-md text-emerald-500">
                            <Flame className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Rising Star</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-bold text-foreground">{risingStar}</span> is seeing a {biggestDiff * 10}% boost this week.
                            </p>
                        </div>
                    </div>
                  )}

                  {worstCategory && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-md text-amber-500">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Room for Growth</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-bold text-foreground">{worstCategory}</span> habits are trailing behind.
                            </p>
                        </div>
                    </div>
                  )}
              </div>
          );
      })()}

      {/* MAIN CHART SECTION */}
      <div className="grid gap-6 md:grid-cols-12">
        
        {/* SCORE TREND */}
        <Card className="col-span-12 lg:col-span-8 border-border/50 bg-background/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
                <CardTitle>Productivity Trend</CardTitle>
                <CardDescription>Daily scores over time.</CardDescription>
            </div>
            <Select value={scoreChartType} onValueChange={(v: any) => setScoreChartType(v)}>
                <SelectTrigger className="w-[120px] h-8 text-xs bg-muted/30">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="combined">Combined</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pl-0 pt-4">
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyData}>
                        <defs>
                            <linearGradient id="colorScoreBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            </linearGradient>
                            <linearGradient id="colorScoreLine" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
                        <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                        <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip {...CHART_Tooltip} cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} />
                        
                        {(scoreChartType === 'bar' || scoreChartType === 'combined') && (
                            <Bar dataKey="score" name="Daily Score" fill="url(#colorScoreBar)" radius={[4, 4, 0, 0]} barSize={20} />
                        )}
                        {(scoreChartType === 'line' || scoreChartType === 'combined') && (
                            <Area type="monotone" dataKey="score" name="Trend" stroke="#ec4899" strokeWidth={3} fill="url(#colorScoreLine)" dot={false} />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* WEEKLY PATTERN */}
        <Card className="col-span-12 lg:col-span-4 border-border/50 bg-background/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Consistency Radar</CardTitle>
            <CardDescription>Performance by day of week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={weekDayData}>
                        <PolarGrid stroke="var(--color-border)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                        <Tooltip {...CHART_Tooltip} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MONTHLY & CATEGORY PROFICIENCY (NEW) */}
      <div className="grid gap-6 md:grid-cols-2">
           {/* MONTHLY AVERAGE */}
           <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
               <CardHeader>
                   <CardTitle>Monthly Progress</CardTitle>
                   <CardDescription>Average daily score per month.</CardDescription>
               </CardHeader>
               <CardContent>
                   <div className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={monthlyData}>
                               <defs>
                                   <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                                       <stop offset="100%" stopColor="#10b981" stopOpacity={0.3}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                               <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                               <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                               <Tooltip {...CHART_Tooltip} cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} />
                               <Bar dataKey="average" name="Avg Score" fill="url(#colorMonth)" radius={[4, 4, 0, 0]} barSize={32} />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </CardContent>
           </Card>

           {/* CATEGORY PROFICIENCY */}
           <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
               <CardHeader>
                   <CardTitle>Category Proficiency</CardTitle>
                   <CardDescription>Completion rate by category.</CardDescription>
               </CardHeader>
               <CardContent>
                   <div className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={categoryProficiency} layout="vertical" margin={{ left: 20 }}>
                               <XAxis type="number" domain={[0, 100]} hide />
                               <YAxis dataKey="name" type="category" width={100} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                               <Tooltip {...CHART_Tooltip} cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} />
                               <Bar dataKey="rate" name="Completion Rate (%)" radius={[0, 4, 4, 0]} barSize={20}>
                                    {categoryProficiency.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </CardContent>
           </Card>
      </div>

      {/* HEATMAP SECTION */}
      <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Activity Heatmap
              </CardTitle>
              <CardDescription>Visualizing your daily habit density over the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
              <Heatmap data={dailyData} startDate={new Date(startDate)} endDate={new Date(endDate)} />
          </CardContent>
      </Card>

      {/* CATEGORY & HEALTH */}
      <div className="grid gap-6 md:grid-cols-12">
          
          {/* CATEGORY DONUT */}
          <Card className="col-span-12 md:col-span-4 border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Volume of habits by category.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={categoryStats} 
                                cx="50%" cy="40%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value" 
                                stroke="none"
                            >
                                {categoryStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip {...CHART_Tooltip} />
                            <Legend 
                                verticalAlign="bottom" 
                                height={80} 
                                content={({ payload }) => {
                                    if (!payload) return null;
                                    return (
                                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pt-4 px-2">
                                            {payload.map((entry: any, index: number) => (
                                                <div key={`item-${index}`} className="flex items-center gap-1.5 min-w-0 max-w-[120px]">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-xs text-muted-foreground truncate" title={entry.value}>
                                                        {entry.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>

          {/* HEALTH CORRELATION */}
          <Card className="col-span-12 md:col-span-8 border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Health vs Productivity</CardTitle>
                <CardDescription>Analyzing the impact of habits on weight and HP.</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyData}>
                            <defs>
                                <linearGradient id="colorHp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" orientation="left" domain={['auto', 'auto']} tickFormatter={(v) => `${v}kg`}/>
                            <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted-foreground)" domain={[0, 10]} />
                            <Tooltip {...CHART_Tooltip} />
                            <Area yAxisId="left" type="monotone" dataKey="weight" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorWeight)" name="Weight" connectNulls />
                            <Area yAxisId="right" type="monotone" dataKey="hp" stroke="#10b981" fillOpacity={1} fill="url(#colorHp)" name="HP" connectNulls />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>
      </div>

      {/* HABIT TABLE & COMPARISON */}
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
             <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Habit Performance & Comparison
                </h2>
                <p className="text-muted-foreground mt-1">
                    Analyze individual habits and compare their consistency.
                </p>
             </div>
             {selectedTasks.length > 0 && (
                 <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-lg border border-border/50 animate-in slide-in-from-right-10 fade-in">
                     <span className="text-sm font-medium px-2">{selectedTasks.length} selected</span>
                     <Button 
                        size="sm" 
                        variant={showComparison ? "secondary" : "default"}
                        onClick={() => setShowComparison(!showComparison)}
                        className="h-8"
                     >
                        {showComparison ? "Hide Comparison" : "Compare Analytics"}
                     </Button>
                     <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => { setSelectedTasks([]); setShowComparison(false); }}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                     >
                        Clear
                     </Button>
                 </div>
             )}
         </div>


         {/* STRATEGIC OVERVIEW (SCATTER & BALANCE) */}
         <div className="grid gap-6 md:grid-cols-12 mb-8">
            {/* 1. HABIT SYNERGY SCATTER PLOT */}
            <Card className="col-span-12 lg:col-span-8 border-border/50 bg-background/60 backdrop-blur-xl h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-indigo-500" />
                            Habit Matrix
                    </CardTitle>
                    <CardDescription>
                        Visualizing habits by Difficulty vs. Consistency to identify "Easy Wins" and "Money Pits".
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis type="number" dataKey="consistency" name="Consistency" unit="%" domain={[0, 100]} label={{ value: 'Consistency (%)', position: 'bottom', offset: 0 }} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis type="number" dataKey="difficultyScore" name="Difficulty" domain={[0, 3]} label={{ value: 'Difficulty (0-3)', angle: -90, position: 'insideLeft' }} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} ticks={[0,1,2,3]} tickFormatter={(v) => ['None','Easy','Med','Hard'][v]} />
                                <ZAxis type="number" dataKey="impact" range={[100, 400]} />
                                <Tooltip 
                                    cursor={{ strokeDasharray: '3 3' }} 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-xs">
                                                    <p className="font-bold text-sm mb-1">{data.name}</p>
                                                    <p className="text-muted-foreground">Type: <span className={cn("font-medium", data.consistency > 80 ? "text-emerald-500" : data.consistency < 30 ? "text-rose-500" : "text-amber-500")}>
                                                        {data.difficulty === 'Hard' && data.consistency > 80 ? '👑 Mastered' : 
                                                         data.difficulty === 'Easy' && data.consistency > 80 ? '✅ Easy Win' :
                                                         data.difficulty === 'Hard' && data.consistency < 50 ? '🏔️ Aspirational' : '🚧 In Progress'}
                                                    </span></p>
                                                    <p className="text-muted-foreground">Cons.: {data.consistency}%</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter name="Habits" data={tasks.map(t => {
                                    let completed = 0;
                                    days.forEach(d => { if(logs[`${t._id}-${format(d, 'yyyy-MM-dd')}`]) completed++; });
                                    const consistency = days.length > 0 ? Math.round((completed / days.length) * 100) : 0;
                                    const diffScore = t.difficulty === 'Hard' ? 3 : t.difficulty === 'Medium' ? 2 : 1;
                                    return { 
                                        _id: t._id, /* Added ID */
                                        name: t.title, 
                                        consistency, 
                                        difficulty: t.difficulty, 
                                        difficultyScore: diffScore, 
                                        impact: 100 // Placeholder for impact size
                                    };
                                })} fill="#8884d8" onClick={(data: any) => {
                                    if(data && data._id) setSelectedHabitDetail(data._id);
                                }} style={{ cursor: 'pointer' }}>
                                    {tasks.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#4ade80', '#fbbf24', '#f87171'][entry.difficulty === 'Easy' ? 0 : entry.difficulty === 'Medium' ? 1 : 2]} />
                                    ))}
                                </Scatter>
                            </RechartsScatterChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 5. WHEEL OF BALANCE (Category Radar) replace Pie */}
            <Card className="col-span-12 lg:col-span-4 border-border/50 bg-background/60 backdrop-blur-xl h-full">
                <CardHeader>
                    <CardTitle>Wheel of Balance</CardTitle>
                    <CardDescription>Are you neglecting any area of your life?</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <div className="h-[350px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryProficiency}>
                                <PolarGrid stroke="var(--color-border)" gridType="polygon" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Balance" dataKey="rate" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} />
                                <Tooltip {...CHART_Tooltip} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
         </div>

         {/* CONSISTENCY & GROWTH SECTION */}
         <div className="grid gap-6 md:grid-cols-12 mb-8">
             
             {/* 2. CUMULATIVE GROWTH CURVE */}
             <Card className="col-span-12 lg:col-span-8 border-border/50 bg-background/60 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        Cumulative Growth
                    </CardTitle>
                    <CardDescription>Total volume of completed habits over time. "The 20-Mile March".</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={(() => {
                                let runningTotal = 0;
                                return dailyData.map(d => {
                                    runningTotal += d.score;
                                    return { date: d.date, total: runningTotal };
                                });
                            })()}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} minTickGap={40} />
                                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip {...CHART_Tooltip} />
                                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fill="url(#colorGrowth)" animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
             </Card>

             {/* 4. VOLATILITY METER */}
             <Card className="col-span-12 lg:col-span-4 border-border/50 bg-background/60 backdrop-blur-xl">
                 <CardHeader>
                     <CardTitle>Volatility Meter</CardTitle>
                     <CardDescription>Are you "Boom & Bust" or "Steady"?</CardDescription>
                 </CardHeader>
                 <CardContent>
                     {(() => {
                         // Calculate Standard Deviation
                         const mean = dailyData.reduce((acc, d) => acc + d.score, 0) / dailyData.length || 0;
                         const variance = dailyData.reduce((acc, d) => acc + Math.pow(d.score - mean, 2), 0) / dailyData.length || 0;
                         const stdDev = Math.sqrt(variance);
                         const volatilityScore = Math.min(100, Math.round((stdDev / (mean || 1)) * 100)); // CV * 100 approx
                         
                         let status = "Steady";
                         let color = "text-emerald-500";
                         let advice = "Great consistency!";
                         
                         if (volatilityScore > 60) { status = "Chaotic"; color = "text-rose-500"; advice = "Try to lower your daily targets."; }
                         else if (volatilityScore > 30) { status = "Variable"; color = "text-amber-500"; advice = "Avoid burnout days."; }

                         return (
                             <div className="flex flex-col items-center justify-center h-[250px] space-y-6">
                                 <div className="relative w-48 h-24 overflow-hidden">
                                     {/* Gauge Background */}
                                     <div className="absolute w-48 h-48 rounded-full border-[12px] border-secondary border-t-transparent border-l-transparent -rotate-45" style={{ borderRadius: '50%' }}></div>
                                     {/* Gauge Value */}
                                     {/* Simplified visual rep using generic div rotation */}
                                     <div className="w-full text-center mt-8">
                                         <h3 className={cn("text-4xl font-black tracking-tighter", color)}>{volatilityScore}</h3>
                                         <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Volatility Index</p>
                                     </div>
                                 </div>
                                 <div className="text-center space-y-2">
                                     <Badge variant="outline" className={cn("text-base px-4 py-1", color, "bg-background")}>{status}</Badge>
                                     <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">{advice}</p>
                                     <p className="text-[10px] text-muted-foreground/50 pt-2">Lower is better.</p>
                                 </div>
                             </div>
                         );
                     })()}
                 </CardContent>
             </Card>
         </div>

         {/* 3. NEW FEATURE TRIO: HALL OF FAME, PULSE, LEVEL */}
         <div className="grid gap-6 md:grid-cols-12 mb-8">
            
            {/* FEATURE A: HALL OF FAME vs GRAVEYARD */}
            <Card className="col-span-12 md:col-span-4 border-border/50 bg-background/60 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Hall of Fame
                    </CardTitle>
                    <CardDescription>Your Best vs. Worst Habits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3 flex items-center gap-2">
                            <Zap className="w-3 h-3" /> Top Performers
                        </h4>
                        <div className="space-y-2">
                            {habitPerformance.slice(0, 3).map((h, i) => (
                                <div key={i} onClick={() => setSelectedHabitDetail(h._id)} className="flex justify-between items-center text-sm p-2 bg-emerald-500/5 rounded-md border border-emerald-500/10 cursor-pointer hover:bg-emerald-500/10 transition-colors">
                                    <span className="font-medium truncate max-w-[140px]" title={h.name}>{h.name}</span>
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                                        {Math.round((h.value / days.length) * 100)}%
                                    </Badge>
                                </div>
                            ))}
                            {habitPerformance.length === 0 && <span className="text-muted-foreground text-xs">No data yet.</span>}
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-3 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Needs Focus
                        </h4>
                        <div className="space-y-2">
                            {[...habitPerformance].reverse().slice(0, 3).map((h, i) => (
                                <div key={i} onClick={() => setSelectedHabitDetail(h._id)} className="flex justify-between items-center text-sm p-2 bg-rose-500/5 rounded-md border border-rose-500/10 cursor-pointer hover:bg-rose-500/10 transition-colors">
                                    <span className="font-medium truncate max-w-[140px]" title={h.name}>{h.name}</span>
                                    <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-0">
                                        {Math.round((h.value / days.length) * 100)}%
                                    </Badge>
                                </div>
                            ))}
                            {habitPerformance.length === 0 && <span className="text-muted-foreground text-xs">No data yet.</span>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* FEATURE B: MONTHLY PULSE (Perfect Days Grid) */}
            <Card className="col-span-12 md:col-span-4 border-border/50 bg-background/60 backdrop-blur-xl">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-indigo-500" />
                        Monthly Pulse
                    </CardTitle>
                    <CardDescription>Visualizing "Perfect Days" (100% completion) over the last 30 days.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="grid grid-cols-7 gap-1">
                        {['S','M','T','W','T','F','S'].map((d,i) => (
                            <div key={i} className="text-[10px] text-center text-muted-foreground font-medium mb-1">{d}</div>
                        ))}
                        {(() => {
                            // Last 30 days only
                            const last30 = days.slice(-30);
                            // Pad start if needed to match day of week? Simplified for now: just list 30 blobs
                            // Actually better to align to day of week
                            const startPad = new Array(getDay(last30[0])).fill(null);
                            
                            return [...startPad, ...last30].map((day, i) => {
                                if (!day) return <div key={`pad-${i}`} />;
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const dayData = dailyData.find(d => d.fullDate === dateStr);
                                const isPerfect = dayData && dayData.score > 0 && tasks.length > 0 && (dayData.score / 2) === tasks.length;
                                const intensity = dayData ? Math.min(1, dayData.score / (tasks.length * 2 || 1)) : 0;
                                
                                return (
                                    <div 
                                        key={dateStr}
                                        className={cn(
                                            "aspect-square rounded-sm flex items-center justify-center text-[10px] relative group cursor-default transition-all",
                                            isPerfect ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110 z-10 font-bold" : 
                                            intensity > 0 ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" : "bg-secondary/30 text-muted-foreground/30"
                                        )}
                                        style={{ opacity: intensity > 0 && !isPerfect ? 0.3 + (intensity * 0.7) : 1 }}
                                    >
                                        {format(day, 'd')}
                                        {/* Hover Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-xl border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap mb-1 z-20">
                                            {dayData?.score || 0} pts
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shadow shadow-indigo-500/30"></div>
                            <span>Perfect Day</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                             <div className="w-2.5 h-2.5 rounded-sm bg-secondary/30"></div>
                             <span>Rest</span>
                        </div>
                    </div>
                 </CardContent>
            </Card>

            {/* FEATURE C: LEVEL & XP CARD */}
            <Card className="col-span-12 md:col-span-4 border-border/50 bg-background/60 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Trophy className="w-32 h-32 text-primary rotate-12" />
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Level Progress
                    </CardTitle>
                    <CardDescription>Based on total historical score.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                    {(() => {
                        // Simple gamification logic
                        const totalLifetimeScore = totalScore; // Uses filtered range usually, ideally should use ALL time but we only have fetched range
                        // Let's pretend each level is 1000 pts * 1.5 multiplier or something simple
                        // Level N requires 100 * N^2 points? 
                        // Lvl 1: 100, Lvl 2: 400, Lvl 3: 900, Lvl 10: 10000
                        
                        const getLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;
                        const getXpForNextLevel = (lvl: number) => 100 * Math.pow(lvl, 2);
                        
                        const currentLevel = getLevel(totalLifetimeScore);
                        const nextLevelXp = getXpForNextLevel(currentLevel + 1); // Cost to reach next
                        const prevLevelXp = getXpForNextLevel(currentLevel);     // Cost to reach current
                        
                        // Progress within level
                        const levelProgress = totalLifetimeScore - prevLevelXp;
                        const levelTotalNeeded = nextLevelXp - prevLevelXp;
                        const percent = Math.min(100, Math.max(0, Math.round((levelProgress / levelTotalNeeded) * 100)));

                        return (
                            <>
                                <div className="flex items-end justify-between">
                                    <div className="text-5xl font-black tracking-tighter text-foreground">
                                        {currentLevel}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Next Rank</p>
                                        <p className="text-sm font-bold text-primary">{nextLevelXp - totalLifetimeScore} pts left</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/50">
                                        <div 
                                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-1000 ease-out relative" 
                                            style={{ width: `${percent}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                                        <span>Current: {totalLifetimeScore} XP</span>
                                        <span>Target: {nextLevelXp} XP</span>
                                    </div>
                                    <div className="text-[10px] text-center text-muted-foreground/60 pt-1">
                                        {(() => {
                                            const needed = nextLevelXp - totalLifetimeScore;
                                            const dailyAvg = avgScore > 0 ? avgScore : 1; 
                                            const daysLeft = Math.ceil(needed / dailyAvg);
                                            const date = addDays(new Date(), daysLeft);
                                            return `At current pace, you'll level up by ${format(date, 'MMM do, yyyy')}`;
                                        })()}
                                    </div>
                                </div>
                                
                                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                                    <p className="text-xs text-primary/80 italic text-center">
                                        "Consistency is the currency of mastery."
                                    </p>
                                </div>
                            </>
                        );
                    })()}
                </CardContent>
            </Card>
         </div>


         {/* COMPARISON VIEW */}
         {showComparison && selectedTasks.length > 0 && (
             <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
             >
                <Card className="border-border/50 bg-background/60 backdrop-blur-xl mb-8 border-primary/20 shadow-lg shadow-primary/5">
                    <CardHeader>
                        <CardTitle>Comparative Analysis</CardTitle>
                        <CardDescription>Comparing consistency trends over the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                                    <XAxis 
                                        dataKey="date" 
                                        type="category"
                                        allowDuplicatedCategory={false}
                                        stroke="var(--color-muted-foreground)" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        ticks={days.filter((_, i) => i % Math.ceil(days.length / 10) === 0).map(d => format(d, 'yyyy-MM-dd'))}
                                        tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                                    />
                                    <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                    <Tooltip 
                                        trigger="hover"
                                        contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', color: 'var(--color-popover-foreground)' }}
                                    />
                                    <Legend />
                                    {selectedTasks.map((taskId, index) => {
                                        const task = tasks.find(t => t._id === taskId);
                                        if (!task) return null;
                                        
                                        // Calculate rolling average for the chart
                                        const data = days.map((day, dIndex) => {
                                            const windowStart = Math.max(0, dIndex - 6);
                                            const windowEnd = dIndex + 1;
                                            const windowDays = days.slice(windowStart, windowEnd);
                                            
                                            let completedInWindow = 0;
                                            windowDays.forEach(wd => {
                                                if (logs[`${task._id}-${format(wd, 'yyyy-MM-dd')}`]) completedInWindow++;
                                            });
                                            
                                            return {
                                                date: format(day, 'yyyy-MM-dd'),
                                                value: Math.round((completedInWindow / windowDays.length) * 100)
                                            };
                                        });

                                        return (
                                            <Line 
                                                key={task._id}
                                                data={data}
                                                type="monotone" 
                                                dataKey="value" 
                                                name={task.title} 
                                                stroke={COLORS[index % COLORS.length]} 
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6 }}
                                            />
                                        );
                                    })}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Stat Comparison */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
                            {selectedTasks.map((taskId, index) => {
                                const task = tasks.find(t => t._id === taskId);
                                if (!task) return null;
                                
                                let completed = 0;
                                let currentStreak = 0;
                                days.forEach(day => {
                                    if (logs[`${task._id}-${format(day, 'yyyy-MM-dd')}`]) {
                                        completed++;
                                        currentStreak++;
                                    } else {
                                        currentStreak = 0;
                                    }
                                });
                                const rate = days.length > 0 ? Math.round((completed / days.length) * 100) : 0;

                                return (
                                    <div key={task._id} className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <p className="font-semibold text-sm truncate" title={task.title}>{task.title}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Rate</span>
                                                <span className="font-mono font-medium">{rate}%</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Total</span>
                                                <span className="font-mono font-medium">{completed}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Streak</span>
                                                <span className="font-mono font-medium">{currentStreak}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
             </motion.div> 
         )}

         {/* MAIN TABLE */}
         <Card className="border-border/50 bg-background/60 backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/40 text-muted-foreground font-medium border-b border-border/50">
                        <tr>
                            <th className="p-4 w-[50px]">
                                <Checkbox 
                                    checked={selectedTasks.length === tasks.length && tasks.length > 0}
                                    onCheckedChange={(checked: boolean) => {
                                        if (checked) setSelectedTasks(tasks.map(t => t._id));
                                        else setSelectedTasks([]);
                                    }}
                                />
                            </th>
                            <th className="p-4">Habit</th>
                            <th className="p-4 hidden md:table-cell">Category</th>
                            <th className="p-4 w-[250px]">Completion Rate</th>
                            <th className="p-4 text-center">Streak (Cur/Best)</th>
                            <th className="p-4 text-right">Total done</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {tasks.map((task) => {
                            let completed = 0;
                            let maxStreak = 0;
                            let currentStreak = 0;
                            days.forEach(day => {
                                if (logs[`${task._id}-${format(day, 'yyyy-MM-dd')}`]) {
                                    completed++;
                                    currentStreak++;
                                    if (currentStreak > maxStreak) maxStreak = currentStreak;
                                } else {
                                    currentStreak = 0;
                                }
                            });
                            const rate = days.length > 0 ? Math.round((completed / days.length) * 100) : 0;
                            
                            let catName = 'None';
                            if (typeof task.category === 'object' && task.category && 'name' in task.category) {
                                catName = (task.category as any).name;
                            } else if (task.category && typeof task.category === 'string') {
                                const found = categories.find(c => c._id === task.category);
                                if (found) catName = found.name;
                            }

                            const isSelected = selectedTasks.includes(task._id);

                            return (
                                <tr 
                                    key={task._id} 
                                    className={cn(
                                        "group transition-colors hover:bg-secondary/20",
                                        isSelected && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                >
                                    <td className="p-4">
                                        <Checkbox 
                                            checked={isSelected}
                                            onCheckedChange={(checked: boolean) => {
                                                if (checked) setSelectedTasks([...selectedTasks, task._id]);
                                                else setSelectedTasks(selectedTasks.filter(id => id !== task._id));
                                            }}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">{task.title}</div>
                                        <div className="md:hidden text-xs text-muted-foreground mt-0.5">{catName}</div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <Badge variant="outline" className="font-normal bg-background/50 hover:bg-secondary/50 transition-colors">
                                            {catName}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs w-[35px] text-right">{rate}%</span>
                                            <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn("h-full rounded-full transition-all duration-500", 
                                                        rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-yellow-500" : "bg-red-500"
                                                    )}
                                                    style={{ width: `${rate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-mono text-xs">
                                        <span className={cn(currentStreak > 0 ? "text-amber-500 font-bold" : "text-muted-foreground")}>{currentStreak}</span>
                                        <span className="text-muted-foreground/40 mx-1">/</span>
                                        <span className="text-muted-foreground">{maxStreak}</span>
                                    </td>
                                    <td className="p-4 text-right font-mono font-medium">
                                        {completed}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSelectedHabitDetail(task._id)}>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
         </Card>
      </div>
      
      {/* 4. HABIT DETAIL REPORT CARD MODAL */}
      <Dialog open={!!selectedHabitDetail} onOpenChange={(open) => !open && setSelectedHabitDetail(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {(() => {
                  const habit = tasks.find(t => t._id === selectedHabitDetail);
                  if (!habit) return null;

                  // Basic Stats for this habit
                  let totalDone = 0;
                  let currentStreak = 0;
                  let maxHS = 0;
                  const dayMap: Record<string, boolean> = {};

                  days.forEach(d => {
                      const dateStr = format(d, 'yyyy-MM-dd');
                      if(logs[`${habit._id}-${dateStr}`]) {
                          totalDone++;
                          currentStreak++;
                          dayMap[dateStr] = true;
                      } else {
                          currentStreak = 0;
                          dayMap[dateStr] = false;
                      }
                      if(currentStreak > maxHS) maxHS = currentStreak;
                  });
                  const rate = days.length > 0 ? Math.round((totalDone / days.length) * 100) : 0;

                  return (
                      <>
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg bg-primary/10", (habit?.difficulty === 'Hard') ? "text-rose-500" : (habit?.difficulty === 'Medium') ? "text-amber-500" : "text-emerald-500")}>
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl">{habit.title}</DialogTitle>
                                    <DialogDescription>{habit.description || "No description provided."}</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                            {/* MINI STATS */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
                                    <div className="text-2xl font-bold">{rate}%</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Consistency</div>
                                </div>
                                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
                                    <div className="text-2xl font-bold text-amber-500">{currentStreak} <span className="text-xs text-muted-foreground font-normal">/ {maxHS}</span></div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Streak (Cur/Best)</div>
                                </div>
                                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
                                    <div className="text-2xl font-bold text-primary">{totalDone}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Done</div>
                                </div>
                            </div>

                            {/* MINI HEATMAP for Single Habit */}
                            <div className="border border-border/50 rounded-lg p-4 bg-background/50">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                    History
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {days.slice(-60).map(d => { // Last 60 days
                                        const done = dayMap[format(d, 'yyyy-MM-dd')];
                                        return (
                                            <div 
                                                key={d.toISOString()} 
                                                className={cn(
                                                    "w-3 h-3 rounded-[1px]", 
                                                    done ? "bg-primary" : "bg-secondary"
                                                )} 
                                                title={`${format(d, 'MMM dd')}: ${done ? 'Done' : 'Missed'}`}
                                            />
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-right">Last 60 days</p>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 rounded border border-border/50">
                                    <span className="text-muted-foreground block text-xs">Category</span>
                                    <span className="font-medium">{(typeof habit.category === 'object' && habit.category && 'name' in habit.category) ? (habit.category as any).name : 'Uncategorized'}</span>
                                </div>
                                <div className="p-3 rounded border border-border/50">
                                    <span className="text-muted-foreground block text-xs">Difficulty</span>
                                    <span className="font-medium">{habit.difficulty}</span>
                                </div>
                            </div>
                        </div>
                      </>
                  );
              })()}
          </DialogContent>
      </Dialog>
    </div>
  );
}
