'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HabitNav } from '@/components/HabitNav';
import { FlaskConical, Plus, Beaker, TrendingUp, AlertTriangle, ArrowRight, BarChart3, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Experiment {
    id: string;
    title: string;
    habitName: string;
    hypothesis: string;
    variable: string; // What changed? e.g. "Added morning coffee"
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'failed';
    baselineRate: number; // e.g. 60%
    currentRate: number; // e.g. 80%
    daysLeft: number;
}

const SAMPLE_EXPERIMENTS: Experiment[] = [
    {
        id: '1',
        title: 'Phone-Free Bedroom',
        habitName: 'Sleep 8 Hours',
        hypothesis: 'If I leave my phone in the kitchen, I will sleep 30 mins earlier.',
        variable: 'Environment Change',
        startDate: '2024-01-15',
        endDate: '2024-01-29',
        status: 'active',
        baselineRate: 65,
        currentRate: 85,
        daysLeft: 5
    },
    {
        id: '2',
        title: 'Morning Gym vs Evening',
        habitName: 'Workout',
        hypothesis: 'Switching to 7 AM will increase consistency vs 6 PM fatigue.',
        variable: 'Timing Change',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        status: 'completed',
        baselineRate: 40,
        currentRate: 90,
        daysLeft: 0
    }
];

export default function HabitLabPage() {
    const [experiments, setExperiments] = useState<Experiment[]>(SAMPLE_EXPERIMENTS);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form Stats
    const [title, setTitle] = useState('');
    const [hypothesis, setHypothesis] = useState('');

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'active': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight">Habit Lab</h1>
                     <p className="text-muted-foreground">Apply the scientific method to your behavior change.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                         <Button><Plus className="w-4 h-4 mr-2" /> New Experiment</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Design Experiment</DialogTitle>
                            <DialogDescription>Define your hypothesis and variables.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Experiment Title</label>
                                <Input placeholder="e.g. The 'Running Shoes By Door' Test" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Target Habit</label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Select habit..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gym">Gym</SelectItem>
                                            <SelectItem value="read">Reading</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Test Duration</label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="14 Days" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7">7 Days (Sprint)</SelectItem>
                                            <SelectItem value="14">14 Days (Standard)</SelectItem>
                                            <SelectItem value="30">30 Days (Deep Dive)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Hypothesis</label>
                                <Textarea 
                                    placeholder="If I [change variable], then [habit] will improve because..." 
                                    value={hypothesis} 
                                    onChange={e => setHypothesis(e.target.value)}
                                    className="h-24"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsCreateOpen(false)}>Start Experiment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <HabitNav />

            {/* ACTIVE EXPERIMENTS */}
            <div className="space-y-6">
                {experiments.map(exp => (
                    <Card key={exp.id} className="overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={getStatusColor(exp.status)}>{exp.status.toUpperCase()}</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {exp.startDate} - {exp.endDate}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <FlaskConical className="w-5 h-5 text-primary" />
                                        {exp.title}
                                    </CardTitle>
                                    <CardDescription>Target: <span className="font-medium text-foreground">{exp.habitName}</span> • Variable: <span className="font-medium text-foreground">{exp.variable}</span></CardDescription>
                                </div>
                                <div className="text-right">
                                    {exp.status === 'active' && (
                                        <div className="text-2xl font-bold">{exp.daysLeft} <span className="text-sm font-normal text-muted-foreground">days left</span></div>
                                    )}
                                    {exp.status === 'completed' && (
                                        <div className="text-2xl font-bold text-emerald-500">COMPLETE</div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 grid md:grid-cols-2 gap-8">
                            {/* HYPOTHESIS BLOCK */}
                            <div className="space-y-4">
                                <div className="bg-secondary/30 p-4 rounded-lg border border-secondary">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                        <Beaker className="w-3 h-3" /> Hypothesis
                                    </h4>
                                    <p className="text-sm italic">"{exp.hypothesis}"</p>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Baseline</span>
                                            <span>Current</span>
                                        </div>
                                        <Progress value={exp.currentRate} className="h-2" />
                                    </div>
                                </div>
                            </div>

                            {/* RESULTS BLOCK */}
                            <div className="flex items-stretch gap-4">
                                <div className="flex-1 bg-background border rounded-lg p-4 flex flex-col justify-center items-center text-center shadow-sm">
                                    <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Baseline Consistency</div>
                                    <div className="text-2xl font-bold text-muted-foreground">{exp.baselineRate}%</div>
                                </div>
                                
                                <div className="flex items-center">
                                    <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                                </div>

                                <div className={cn("flex-1 border rounded-lg p-4 flex flex-col justify-center items-center text-center shadow-sm", 
                                    exp.currentRate > exp.baselineRate ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                                )}>
                                    <div className={cn("text-xs uppercase tracking-widest mb-1 font-bold", exp.currentRate > exp.baselineRate ? "text-emerald-600" : "text-red-600")}>
                                        Experimental Data
                                    </div>
                                    <div className={cn("text-3xl font-black", exp.currentRate > exp.baselineRate ? "text-emerald-600" : "text-red-600")}>
                                        {exp.currentRate}%
                                    </div>
                                    <div className={cn("text-xs font-medium mt-1 inline-flex items-center gap-1", exp.currentRate > exp.baselineRate ? "text-emerald-600" : "text-red-600")}>
                                        <TrendingUp className="w-3 h-3" />
                                        {exp.currentRate - exp.baselineRate}% Lift
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="border-t pt-6 mt-12 text-center text-muted-foreground">
                <p className="text-sm">Running experiments helps you isolate variables to find your optimal behavior protocols.</p>
            </div>
        </div>
    );
}
