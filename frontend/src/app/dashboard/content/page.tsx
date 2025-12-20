'use client';

import { useEffect } from 'react';
import { 
    LayoutDashboard, Youtube, Twitter, Globe, Linkedin, 
    ArrowRight, Activity, Calendar, FileText, CheckCircle2,
    Sparkles, Zap, TrendingUp, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useContentStore } from '@/stores/contentStore';
import { motion } from 'framer-motion';

export default function ContentOverviewPage() {
    const { contents, fetchContents } = useContentStore();

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    const stats = {
        total: contents.length,
        published: contents.filter(c => c.status === 'published').length,
        inProgress: contents.filter(c => ['scripting', 'filming', 'editing'].includes(c.status)).length,
        scheduled: contents.filter(c => c.status === 'scheduled').length,
    };

    const PLATFORM_CARDS = [
        {
            id: 'youtube',
            label: 'YouTube Studio',
            icon: Youtube,
            color: 'text-red-500',
            bg: 'bg-red-500/10 dark:bg-red-500/10 bg-red-50',
            border: 'border-red-500/20',
            href: '/dashboard/content/youtube',
            count: contents.filter(c => c.platform === 'youtube').length,
            desc: "Long-form video production pipeline.",
            gradient: "from-red-500/5 to-orange-500/5"
        },
        {
            id: 'twitter',
            label: 'Twitter / X',
            icon: Twitter,
            color: 'text-sky-500',
            bg: 'bg-sky-500/10 dark:bg-sky-500/10 bg-sky-50',
            border: 'border-sky-500/20',
            href: '/dashboard/content/twitter', 
            count: contents.filter(c => c.platform === 'twitter').length,
            desc: "Thread composition and daily tweets.",
            gradient: "from-sky-500/5 to-blue-500/5"
        },
        {
            id: 'linkedin',
            label: 'LinkedIn',
            icon: Linkedin,
            color: 'text-blue-700 dark:text-blue-500', 
            bg: 'bg-blue-700/10 dark:bg-blue-700/10 bg-blue-50',
            border: 'border-blue-700/20',
            href: '#',
            count: contents.filter(c => c.platform === 'linkedin').length,
            desc: "Professional updates and articles.",
            gradient: "from-blue-600/5 to-indigo-600/5"
        },
        {
            id: 'blog',
            label: 'Dev Blog',
            icon: Globe,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 dark:bg-emerald-500/10 bg-emerald-50',
            border: 'border-emerald-500/20',
            href: '#',
            count: contents.filter(c => c.platform === 'blog').length,
            desc: "Technical writing and documentation.",
            gradient: "from-emerald-500/5 to-green-500/5"
        }
    ];

    return (
        <div className="min-h-full space-y-8 animate-in fade-in duration-500 pb-10">
            
            {/* HERO HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900/50 dark:to-zinc-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 dark:opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700 md:block hidden">
                   <Sparkles className="w-64 h-64 text-foreground" />
                </div>
                
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-2">
                        <Zap className="w-4 h-4 fill-primary" /> Command Center
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">
                        Content OS <span className="text-xs align-top bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-muted-foreground ml-1">v2.0</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                        Manage your entire digital footprint from a single hub.
                    </p>
                </div>

                <div className="flex gap-3 relative z-10">
                    <Button variant="outline" className="h-12 px-6 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <Activity className="w-4 h-4 mr-2" /> Recent Logs
                    </Button>
                    <Button className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                        <TrendingUp className="w-4 h-4 mr-2" /> Analytics
                    </Button>
                </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Projects', value: stats.total, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'In Production', value: stats.inProgress, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                    { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((stat, i) => (
                    <Card key={i} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2 rounded-lg", stat.bg)}>
                                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                                </div>
                                {i === 1 && <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Busy</Badge>}
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                                <p className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* PLATFORM STUDIOS */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5" /> Production Studios
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PLATFORM_CARDS.map((platform) => (
                        <Link href={platform.href} key={platform.id} className={cn("block group h-full", platform.href === '#' && 'pointer-events-none opacity-60')}>
                            <div className={cn(
                                "h-full p-1 rounded-3xl bg-gradient-to-br transition-all duration-300 shadow-sm hover:shadow-xl group-hover:-translate-y-1 relative overflow-hidden",
                                platform.gradient,
                                "from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-800"
                            )}>
                                <div className="bg-white dark:bg-zinc-900/90 h-full w-full rounded-[20px] p-6 relative overflow-hidden">
                                     {/* Background Decor */}
                                     <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20", platform.bg)} />
                                     
                                     <div className="relative z-10 flex flex-col h-full justify-between">
                                         <div>
                                             <div className="flex justify-between items-start mb-6">
                                                 <div className={cn("p-4 rounded-2xl shadow-sm", platform.bg)}>
                                                     <platform.icon className={cn("w-8 h-8", platform.color)} />
                                                 </div>
                                                 <Badge variant="outline" className="bg-background/80 backdrop-blur border-zinc-200 dark:border-zinc-700">
                                                     {platform.count} Active
                                                 </Badge>
                                             </div>
                                             
                                             <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                                                 {platform.label}
                                                 <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-bold" />
                                             </h3>
                                             <p className="text-muted-foreground font-medium leading-relaxed">
                                                 {platform.desc}
                                             </p>
                                         </div>

                                         <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                                             <div className="flex -space-x-2">
                                                 {[1,2,3].map(i => (
                                                     <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800" />
                                                 ))}
                                             </div>
                                             <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                 Enter Studio &rarr;
                                             </span>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* RECENT FEED SECTION */}
            <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Activity Feed</h2>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">View Full Log</Button>
                </div>
                
                <div className="space-y-4">
                    {contents.length > 0 ? contents.slice(0, 3).map((item) => {
                        const PlatformIcon = PLATFORM_CARDS.find(p => p.id === item.platform)?.icon || FileText;
                        const platformColor = PLATFORM_CARDS.find(p => p.id === item.platform)?.color || 'text-zinc-500';
                        return (
                            <div key={item._id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                     <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                         <PlatformIcon className={cn("w-4 h-4", platformColor)} />
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                                         <p className="text-xs text-muted-foreground">Updated just now</p>
                                     </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="capitalize text-xs font-normal">
                                        {item.status}
                                    </Badge>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-10 text-muted-foreground">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}