'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { HabitNav } from '@/components/HabitNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subYears, eachDayOfInterval, startOfWeek, getDay } from 'date-fns';
import { TrendingUp, Zap, Target, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export default function AnalyticsPage() {
  const { tasks, logs, metrics, fetchLogs, fetchMetrics } = useTaskStore();
  const { categories, fetchCategories } = useCategoryStore();
  
  // Date State
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 29), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [days, setDays] = useState<Date[]>([]);
  const [dateRangePreset, setDateRangePreset] = useState('30');
  
  // Chart View State
  const [scoreChartType, setScoreChartType] = useState<'bar' | 'line' | 'combined'>('combined');

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
          default: return;
      }
      
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(format(end, 'yyyy-MM-dd'));
  };

  // Fetch data when range changes
  useEffect(() => {
    fetchLogs(startDate, endDate);
    fetchMetrics(startDate, endDate);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    setDays(eachDayOfInterval({ start, end }));
  }, [startDate, endDate, fetchLogs, fetchMetrics]);


  // 1. Daily Data (Score, Weight, HP)
  const dailyData = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    let completedCount = 0;
    tasks.forEach(task => {
        if (logs[`${task._id}-${dateStr}`]) completedCount++;
    });
    const score = completedCount * 2; // 2 points per task
    
    return {
        date: format(day, 'MMM dd'),
        fullDate: dateStr,
        dayOfWeek: getDay(day), // 0=Sun, 1=Mon...
        score,
        weight: metrics[dateStr]?.weight || null,
        hp: metrics[dateStr]?.hp || null
    };
  });

  // 2. Habit Performance (Pie)
  const habitPerformance = tasks.map(task => {
      let count = 0;
      days.forEach(day => {
          if (logs[`${task._id}-${format(day, 'yyyy-MM-dd')}`]) count++;
      });
      return { name: task.title, value: count, category: task.category };
  }).filter(d => d.value > 0);

  // 3. Category Breakdown (Pie)
  const categoryStats: Record<string, number> = {};
  habitPerformance.forEach(h => {
      let catName = 'Uncategorized';
      if (typeof h.category === 'object' && h.category && 'name' in h.category) {
          catName = (h.category as any).name;
      } else if (h.category && typeof h.category === 'string') {
          const found = categories.find(c => c._id === h.category);
          if (found) catName = found.name;
      }
      categoryStats[catName] = (categoryStats[catName] || 0) + h.value;
  });
  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));

  // 4. Day of Week Performance (Radar/Bar)
  const dayStats = [0,0,0,0,0,0,0]; // Sun-Sat
  const dayCounts = [0,0,0,0,0,0,0]; // Count of days (e.g. how many Mondays)
  dailyData.forEach(d => {
      dayStats[d.dayOfWeek] += d.score;
      dayCounts[d.dayOfWeek]++;
  });
  const weekDayData = [
      { subject: 'Sun', A: dayCounts[0] ? Math.round(dayStats[0]/dayCounts[0]) : 0, fullMark: 100 },
      { subject: 'Mon', A: dayCounts[1] ? Math.round(dayStats[1]/dayCounts[1]) : 0, fullMark: 100 },
      { subject: 'Tue', A: dayCounts[2] ? Math.round(dayStats[2]/dayCounts[2]) : 0, fullMark: 100 },
      { subject: 'Wed', A: dayCounts[3] ? Math.round(dayStats[3]/dayCounts[3]) : 0, fullMark: 100 },
      { subject: 'Thu', A: dayCounts[4] ? Math.round(dayStats[4]/dayCounts[4]) : 0, fullMark: 100 },
      { subject: 'Fri', A: dayCounts[5] ? Math.round(dayStats[5]/dayCounts[5]) : 0, fullMark: 100 },
      { subject: 'Sat', A: dayCounts[6] ? Math.round(dayStats[6]/dayCounts[6]) : 0, fullMark: 100 },
  ];


  // 5. Calculate Summary Stats
  const totalScheduled = tasks.length * days.length;
  const totalCompleted = habitPerformance.reduce((acc, curr) => acc + curr.value, 0);
  const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  
  const perfectDaysCount = dailyData.filter(d => d.score >= (tasks.length * 2) && d.score > 0).length;
  const totalScore = dailyData.reduce((acc, d) => acc + d.score, 0);
  const avgScore = days.length > 0 ? Math.round(totalScore / days.length) : 0;
  const bestScore = Math.max(...dailyData.map(d => d.score), 0);
  
  // Streak Calc
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

  // Chart Colors (Vibrant palette that works on dark/light)
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  
  // Common Chart Primitives
  const tooltipStyle = { 
      backgroundColor: 'hsl(var(--popover))', 
      borderColor: 'hsl(var(--border))', 
      color: 'hsl(var(--popover-foreground))',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)' 
  };
  const axisColor = "hsl(var(--muted-foreground))";
  const gridColor = "hsl(var(--border))";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Habit Analytics</h1>
            <p className="text-muted-foreground">Deep dive into your performance and health metrics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-background p-2 rounded-lg border shadow-sm">
            
            {/* Range Presets */}
            <Select value={dateRangePreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="14">Last 14 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 3 Months</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex items-center gap-2 border-l pl-2 ml-1">
                <span className="text-xs font-medium text-muted-foreground">Custom:</span>
                <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => { setStartDate(e.target.value); setDateRangePreset('custom'); }} 
                    className="w-auto h-8 text-xs bg-background text-foreground"
                />
                <span className="text-muted-foreground">-</span>
                <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => { setEndDate(e.target.value); setDateRangePreset('custom'); }} 
                    className="w-auto h-8 text-xs bg-background text-foreground"
                />
            </div>
        </div>
      </div>

      <HabitNav />

      {/* SUMMARY STAT CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Overview</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-2xl font-bold">{totalScore}</div>
                    <p className="text-xs text-muted-foreground">Total Points</p>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block">
                        Avg: {avgScore}
                    </div>
                    <p className="text-xs text-muted-foreground">Best: <span className="text-foreground font-medium">{bestScore}</span></p>
                </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Habit consistency</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfect Days</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{perfectDaysCount}</div>
            <p className="text-xs text-muted-foreground">100% completion days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{maxStreak} Days</div>
            <p className="text-xs text-muted-foreground">Longest active streak</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        
        {/* SCORE CHART */}
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
                <CardTitle>Productivity Score</CardTitle>
                <CardDescription>Daily scores trend over time.</CardDescription>
            </div>
            <Select value={scoreChartType} onValueChange={(v: 'bar'|'line'|'combined') => setScoreChartType(v)}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
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
                    {scoreChartType === 'bar' ? (
                        <BarChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.3} />
                            <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                            <Bar dataKey="score" name="Daily Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : scoreChartType === 'line' ? (
                        <LineChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.3} />
                            <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="score" name="Daily Score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    ) : (
                        <ComposedChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.3} />
                            <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend />
                            <Bar dataKey="score" name="Score" fill="hsl(var(--primary))" fillOpacity={0.6} radius={[4, 4, 0, 0]} barSize={20} />
                            <Line type="monotone" dataKey="score" name="Trend" stroke="#ff7300" strokeWidth={2} dot={false} />
                        </ComposedChart>
                    )}
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* WEEKLY PATTERN (Radar) */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Weekly Pattern</CardTitle>
            <CardDescription>Average score by day of the week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={weekDayData}>
                        <PolarGrid stroke={gridColor} opacity={0.4} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: axisColor, fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                        <Tooltip contentStyle={tooltipStyle}/>
                    </RadarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* HEALTH METRICS */}
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader>
            <CardTitle>Health Correlations</CardTitle>
            <CardDescription>Weight vs HP (Sleep/Recovery)</CardDescription>
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.3} />
                        <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                        <YAxis yAxisId="left" stroke={axisColor} orientation="left" domain={['auto', 'auto']} />
                        <YAxis yAxisId="right" orientation="right" stroke={axisColor} domain={[0, 10]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area yAxisId="left" type="monotone" dataKey="weight" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorWeight)" name="Weight (kg)" connectNulls />
                        <Area yAxisId="right" type="monotone" dataKey="hp" stroke="#10b981" fillOpacity={1} fill="url(#colorHp)" name="HP" connectNulls />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* PIE CHARTS */}
        <Card className="col-span-12 md:col-span-6 lg:col-span-4">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Where you spend your energy.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DETAILED HABIT BREAKDOWN */}
      <div>
         <h2 className="text-xl font-bold tracking-tight mb-4">Habit Breakdown</h2>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map(task => {
                // Calculate Stats for this task
                let completed = 0;
                let maxStreak = 0;
                let currentStreak = 0;
                days.forEach(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    if (logs[`${task._id}-${dateStr}`]) {
                        completed++;
                        currentStreak++;
                        if (currentStreak > maxStreak) maxStreak = currentStreak;
                    } else {
                        currentStreak = 0;
                    }
                });
                const rate = days.length > 0 ? Math.round((completed / days.length) * 100) : 0;
                
                // Resolve Category Name
                let catName = 'General';
                if (typeof task.category === 'object' && task.category && 'name' in task.category) {
                     catName = (task.category as any).name;
                } else if (task.category && typeof task.category === 'string') {
                     const found = categories.find(c => c._id === task.category);
                     if (found) catName = found.name;
                }

                return (
                    <Card key={task._id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle className="text-base bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                        {task.title}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{catName}</p> 
                                </div>
                                <div className={cn(
                                    "text-xl font-bold",
                                    rate >= 80 ? "text-green-500" : rate >= 50 ? "text-yellow-500" : "text-red-500"
                                )}>{rate}%</div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm text-muted-foreground mb-3 font-medium">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <span>Best Streak: <span className="text-foreground">{maxStreak}d</span></span>
                                </div>
                                <span>Done: <span className="text-foreground">{completed}</span></span>
                            </div>
                            
                            {/* Custom Progress Bar */}
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full transition-all duration-500 rounded-full", 
                                        rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${rate}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
         </div>
      </div>
    </div>
  );
}
