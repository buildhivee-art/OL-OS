'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Briefcase, Plus, MoreHorizontal, Layers, GitBranch, 
    CheckCircle2, Clock, Terminal, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ProjectStatus = 'active' | 'planning' | 'stasis' | 'complete';

interface Project {
    id: string;
    title: string;
    description: string;
    status: ProjectStatus;
    progress: number;
    tasks: { total: number; completed: number };
    team: number;
    deadline: string;
    tech: string[];
}

const initialProjects: Project[] = [
    {
        id: 'PRJ-ALPHA',
        title: 'Project Neural Link',
        description: 'Developing the core BCI interface for the new operating system integration.',
        status: 'active',
        progress: 65,
        tasks: { total: 45, completed: 29 },
        team: 4,
        deadline: '2024-12-31',
        tech: ['React', 'Node.js', 'Python']
    },
    {
        id: 'PRJ-BETA',
        title: 'Quantum Ledger',
        description: 'Decentralized secure storage for sensitive user archives.',
        status: 'planning',
        progress: 15,
        tasks: { total: 20, completed: 3 },
        team: 2,
        deadline: '2025-06-15',
        tech: ['Rust', 'Solidity']
    },
    {
        id: 'PRJ-GAMMA',
        title: 'Visual Cortex V2',
        description: 'Overhauling the UI rendering engine for 3D spatial navigation.',
        status: 'stasis',
        progress: 88,
        tasks: { total: 50, completed: 44 },
        team: 1,
        deadline: 'Paused',
        tech: ['Three.js', 'WebGL']
    },
    {
        id: 'PRJ-OMEGA',
        title: 'System Zero',
        description: 'Legacy codebase refactor and migration.',
        status: 'complete',
        progress: 100,
        tasks: { total: 112, completed: 112 },
        team: 6,
        deadline: '2023-11-20',
        tech: ['Angular', 'Legacy']
    }
];

export default function ProjectsPage() {
    const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');

    const filteredProjects = filter === 'all' 
        ? initialProjects 
        : initialProjects.filter(p => p.status === filter);

    const getStatusColor = (status: ProjectStatus) => {
        switch(status) {
            case 'active': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'planning': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'stasis': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'complete': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    return (
        <div className="space-y-8 pb-10 min-h-screen">
            
             {/* HEADER */}
             <div className="relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-zinc-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                 
                <div className="relative z-10 space-y-2">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400">
                        <Terminal className="w-3 h-3" /> COMMAND CENTER // ACTIVE MISSIONS: {initialProjects.filter(p=>p.status === 'active').length}
                     </div>
                     <h1 className="text-4xl font-black tracking-tighter text-white">
                         Mission Control
                     </h1>
                </div>

                <div className="relative z-10 flex gap-3">
                     <Button className="h-12 px-6 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl shadow-lg shadow-white/10">
                         <Plus className="mr-2 w-4 h-4" /> Initialize Project
                     </Button>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'active', 'planning', 'stasis', 'complete'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                            filter === f 
                            ? 'bg-zinc-100 text-zinc-900 border-zinc-100' 
                            : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* PROJECTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                    {filteredProjects.map((project) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                        >
                            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 group overflow-hidden relative">
                                {/* Decorator Bar */}
                                <div className={`absolute top-0 left-0 w-1 h-full ${project.status === 'active' ? 'bg-emerald-500' : project.status === 'planning' ? 'bg-blue-500' : 'bg-zinc-800'}`} />
                                
                                <CardContent className="p-6 pl-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                                                    {project.title}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${getStatusColor(project.status)}`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <p className="text-xs font-mono text-zinc-500">{project.id}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        {project.description}
                                    </p>
                                    
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-zinc-800/50">
                                        <div>
                                            <p className="text-[10px] uppercase text-zinc-600 font-bold mb-1">Tasks</p>
                                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                <CheckCircle2 className="w-4 h-4" />
                                                {project.tasks.completed}/{project.tasks.total}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-zinc-600 font-bold mb-1">Deadline</p>
                                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                <Clock className="w-4 h-4" />
                                                {project.deadline}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-zinc-600 font-bold mb-1">Branch</p>
                                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                <GitBranch className="w-4 h-4" />
                                                Main
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tech Stack */}
                                    <div className="flex gap-2">
                                        {project.tech.map(t => (
                                            <Badge key={t} variant="secondary" className="bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700">
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
                                            <span>Completion Sequence</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <Progress value={project.progress} className="h-1 bg-zinc-800" indicatorClassName={project.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-500'} />
                                    </div>

                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                 {/* ADD NEW PLACEHOLDER */}
                 <motion.div layout>
                    <button className="w-full h-full min-h-[300px] border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-all group">
                        <div className="p-4 rounded-full bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="font-bold uppercase tracking-widest text-sm">Initiate New Mission</span>
                    </button>
                 </motion.div>
            </div>
        </div>
    );
}
