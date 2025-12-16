'use client';

import { useEffect, useState } from 'react';
import { useWeeklyLogStore } from '@/stores/weeklyLogStore';
import { useTaskStore } from '@/stores/taskStore';
import { HabitNav } from '@/components/HabitNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Save, Star, Loader2, Zap, Target, Trophy, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function WeeklyLogPage() {
  const { currentLog, fetchLogByDate, updateLog } = useWeeklyLogStore();
  const { logs: taskLogs, fetchLogs: fetchTaskLogs, tasks } = useTaskStore();
  
  const [currentDate, setCurrentDate] = useState(new Date()); // Any date in the week
  
  // Form State
  const [title, setTitle] = useState('');
  const [mainFocus, setMainFocus] = useState('');
  const [content, setContent] = useState('');
  const [wins, setWins] = useState('');
  const [lessons, setLessons] = useState('');
  const [goals, setGoals] = useState('');
  const [rating, setRating] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [mood, setMood] = useState('');
  
  const [loading, setLoading] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  // Load Log & Stats
  useEffect(() => {
    fetchLogByDate(weekStartStr);
    fetchTaskLogs(weekStartStr, weekEndStr);
  }, [weekStartStr, fetchLogByDate, fetchTaskLogs, weekEndStr]);

  // Sync state with loaded log
  useEffect(() => {
    if (currentLog) {
        setTitle(currentLog.title || '');
        setMainFocus(currentLog.mainFocus || '');
        setContent(currentLog.content || '');
        setWins(currentLog.wins?.join('\n') || '');
        setLessons(currentLog.lessons?.join('\n') || '');
        setGoals(currentLog.goalsForNextWeek || '');
        setRating(currentLog.rating || 0);
        setEnergyLevel(currentLog.energyLevel || 5);
        setMood(currentLog.mood || '');
    } else {
        // Reset
        setTitle('');
        setMainFocus('');
        setContent('');
        setWins('');
        setLessons('');
        setGoals('');
        setRating(0);
        setEnergyLevel(5);
        setMood('');
    }
  }, [currentLog]);

  const handleSave = async () => {
      setLoading(true);
      try {
          await updateLog({
              weekStartDate: weekStartStr,
              title,
              mainFocus,
              content,
              wins: wins.split('\n').filter(Boolean),
              lessons: lessons.split('\n').filter(Boolean),
              goalsForNextWeek: goals,
              rating,
              energyLevel,
              mood
          });
          toast.success('Weekly log saved successfully');
      } catch (error) {
          toast.error('Failed to save log');
      } finally {
          setLoading(false);
      }
  };

  // Calculate Weekly Stats for Context
  const daysInView = 7; 
  let completedCount = 0;
  tasks.forEach(task => {
      // Loop through each day of the week
      const current = new Date(weekStart);
      for(let i=0; i<7; i++) {
          const dStr = format(current, 'yyyy-MM-dd');
          if (taskLogs[`${task._id}-${dStr}`]) {
              completedCount++;
          }
          current.setDate(current.getDate() + 1);
      }
  });
  const totalPossible = tasks.length * 7;
  const completionRate = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;
  const totalScore = completedCount * 2;

  // Render Stars
  const renderStars = () => {
      return [1, 2, 3, 4, 5].map((star) => (
          <button 
            key={star} 
            onClick={() => setRating(star)}
            className={cn("focus:outline-none transition-all", rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground opacity-30")}
          >
              <Star className={cn("h-6 w-6", rating >= star && "fill-current")} />
          </button>
      ));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Log</h1>
            <p className="text-muted-foreground">{format(weekStart, 'MMM d')} - {format(weekEnd, 'MMMM d, yyyy')}</p>
        </div>
        
        {/* Week Navigator */}
        <div className="flex items-center gap-2 bg-background p-1 rounded-lg border shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-32 text-center">
                {isSameWeek(currentDate, new Date(), { weekStartsOn: 1 }) ? "Current Week" : "Past Week"}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <HabitNav />

      <div className="grid gap-6 md:grid-cols-12">
          
          {/* LEFT COLUMN: JOURNAL & INPUTS */}
          <div className="md:col-span-8 space-y-6">
            
            {/* 1. Title & Focus */}
            <Card className="border-l-4 border-l-primary">
                <CardHeader>
                    <CardTitle>Week Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Week Title / Theme</Label>
                        <Input 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="e.g. The Week of Discipline" 
                            className="font-bold text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                         <Label className="flex items-center gap-2"><Target className="w-4 h-4 text-red-500"/> Main Focus</Label>
                         <Input 
                            value={mainFocus} 
                            onChange={e => setMainFocus(e.target.value)} 
                            placeholder="What was the one thing that mattered most?" 
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 2. Main Journal */}
            <Card>
                <CardHeader>
                    <CardTitle>Deep Reflection</CardTitle>
                    <CardDescription>Brain dump your thoughts, feelings, and events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        placeholder="Start writing..." 
                        className="min-h-[300px] text-base leading-relaxed p-6 resize-y focus:ring-1 focus:ring-primary/20 border-zinc-200 dark:border-zinc-800"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </CardContent>
            </Card>

            {/* 3. Wins & Lessons */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-emerald-500/5 border-emerald-500/10">
                    <CardHeader>
                         <CardTitle className="text-emerald-600 flex items-center gap-2"><Trophy className="w-5 h-5" /> Wins of the Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            value={wins} 
                            onChange={e => setWins(e.target.value)} 
                            placeholder="- Hit the gym 4 times&#10;- Shipped the project"
                            className="min-h-[150px] bg-transparent border-emerald-500/20 focus:border-emerald-500/50"
                        />
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/10">
                    <CardHeader>
                         <CardTitle className="text-blue-600 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Lessons Learned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            value={lessons} 
                            onChange={e => setLessons(e.target.value)} 
                            placeholder="- Sleep earlier&#10;- Don't skip breakfast"
                            className="min-h-[150px] bg-transparent border-blue-500/20 focus:border-blue-500/50"
                        />
                    </CardContent>
                </Card>
            </div>
            
            <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSave} disabled={loading} className="w-full md:w-auto shadow-lg shadow-primary/20">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Weekly Log
                </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: METADATA & RATINGS */}
          <div className="md:col-span-4 space-y-6">
              
              {/* RATINGS CARD */}
              <Card>
                  <CardHeader>
                      <CardTitle>Quantify Your Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                      {/* Rating */}
                      <div className="space-y-3">
                          <Label className="uppercase text-xs font-bold text-muted-foreground tracking-wider">Overall Rating</Label>
                          <div className="flex gap-2 p-2 bg-secondary/30 rounded-lg justify-center">
                              {renderStars()}
                          </div>
                      </div>

                      {/* Energy */}
                      <div className="space-y-3">
                          <div className="flex justify-between">
                             <Label className="uppercase text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-500" /> Energy Level</Label>
                             <span className="text-xs font-bold font-mono">{energyLevel}/10</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={energyLevel} 
                            onChange={(e) => setEnergyLevel(Number(e.target.value))}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                      </div>

                       {/* Mood */}
                       <div className="space-y-3">
                          <Label className="uppercase text-xs font-bold text-muted-foreground tracking-wider">Dominant Mood</Label>
                          <Select value={mood} onValueChange={setMood}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select mood" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Great">Great 😁</SelectItem>
                                <SelectItem value="Good">Good 🙂</SelectItem>
                                <SelectItem value="Neutral">Neutral 😐</SelectItem>
                                <SelectItem value="Bad">Bad 🙁</SelectItem>
                                <SelectItem value="Terrible">Terrible 😫</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                  </CardContent>
              </Card>

               {/* NEXT WEEK GOALS */}
               <Card className="border-orange-500/20 bg-orange-500/5">
                  <CardHeader>
                      <CardTitle className="text-orange-600">Objectives for Next Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                        <Textarea 
                            placeholder="1. Goal A&#10;2. Goal B&#10;3. Goal C" 
                            className="min-h-[150px] border-orange-500/20 bg-transparent focus:border-orange-500/50"
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                        />
                  </CardContent>
              </Card>

              {/* SNAPSHOT CARD */}
              <Card className="bg-muted/30">
                  <CardHeader>
                      <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">System Data</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                      <div className="flex justify-between items-center">
                          <span className="text-sm">Habit Score</span>
                          <span className="text-xl font-bold">{totalScore}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-sm">Consistency</span>
                          <span className={cn("text-xl font-bold", completionRate > 80 ? "text-green-500" : "text-foreground")}>
                              {completionRate}%
                          </span>
                      </div>
                  </CardContent>
              </Card>

          </div>
      </div>
    </div>
  );
}
