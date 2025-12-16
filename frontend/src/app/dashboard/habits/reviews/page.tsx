'use client';

import { useEffect, useState } from 'react';
import { useWeeklyLogStore } from '@/stores/weeklyLogStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronRight, Star, Trophy, Zap, ArrowRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { HabitNav } from '@/components/HabitNav';

export default function WeeklyReviewListPage() {
    const { logs, fetchLogs } = useWeeklyLogStore();
    const router = useRouter();

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getMoodColor = (mood: string) => {
        switch(mood) {
            case 'Great': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Good': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Bad': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'Terrible': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-black tracking-tight">Review Archive</h1>
                    <p className="text-muted-foreground">A chronicle of your weekly evolution.</p>
                 </div>
                 <Button onClick={() => router.push('/dashboard/habits/weekly-log')} className="gap-2">
                    <Calendar className="w-4 h-4" />
                    New Log
                 </Button>
            </div>

            <HabitNav />

            {/* LIST OF LOGS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {logs.length === 0 ? (
                     <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-muted-foreground gap-4">
                         <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                             <Calendar className="w-8 h-8 opacity-50" />
                         </div>
                         <p>No reviews archived yet.</p>
                         <Button variant="outline" onClick={() => router.push('/dashboard/habits/weekly-log')}>Create your first entry</Button>
                     </div>
                 ) : (
                     logs.map((log, index) => (
                         <motion.div 
                            key={log._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                         >
                             <Card className="group hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden relative" onClick={() => router.push(`/dashboard/habits/reviews/${log.weekStartDate}`)}>
                                 {/* GRADIENT OVERLAY */}
                                 <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                 
                                 <CardHeader className="pb-3">
                                     <div className="flex justify-between items-start">
                                         <div>
                                             <div className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">
                                                 Week of {format(parseISO(log.weekStartDate), 'MMM d, yyyy')}
                                             </div>
                                             <CardTitle className="text-lg leading-tight line-clamp-1">{log.title || 'Untitled Week'}</CardTitle>
                                         </div>
                                         <Badge variant="outline" className={`text-[10px] uppercase ${getMoodColor(log.mood)}`}>
                                             {log.mood || 'N/A'}
                                         </Badge>
                                     </div>
                                 </CardHeader>
                                 
                                 <CardContent className="space-y-4">
                                     {/* RATINGS ROW */}
                                     <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                                         <div className="flex items-center gap-1">
                                             <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 
                                             <span>{log.rating}/5</span>
                                         </div>
                                         <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
                                         <div className="flex items-center gap-1">
                                             <Zap className="w-3 h-3 text-blue-500 fill-blue-500" /> 
                                             <span>{log.energyLevel}/10 Energy</span>
                                         </div>
                                     </div>

                                     {/* SNIPPETS */}
                                     {log.mainFocus && (
                                         <div className="space-y-1">
                                             <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Trophy className="w-3 h-3" /> Main Focus</span>
                                             <p className="text-sm line-clamp-1 text-zinc-600 dark:text-zinc-300">{log.mainFocus}</p>
                                         </div>
                                     )}
                                     
                                     {log.wins && log.wins.length > 0 && (
                                         <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Quote className="w-3 h-3" /> Key Win</span>
                                            <p className="text-sm line-clamp-1 text-zinc-600 dark:text-zinc-300 italic">"{log.wins[0]}"</p>
                                         </div>
                                     )}

                                     <div className="pt-2 flex justify-end">
                                         <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                             Read Full Review <ArrowRight className="w-3 h-3" />
                                         </span>
                                     </div>
                                 </CardContent>
                             </Card>
                         </motion.div>
                     ))
                 )}
            </div>
        </div>
    );
}
