'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Search, Folder, FileText, Database, Code, 
    Book, Cloud, Lock, Hash, Star, ArrowRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
    { id: 'dev', name: 'Development Protocols', icon: Code, count: 124, color: 'text-cyan-400' },
    { id: 'ops', name: 'System Operations', icon: Database, count: 42, color: 'text-emerald-400' },
    { id: 'res', name: 'Research Archives', icon: Book, count: 89, color: 'text-purple-400' },
    { id: 'sec', name: 'Security Manifests', icon: Lock, count: 15, color: 'text-red-400' },
    { id: 'cld', name: 'Cloud Infrastructure', icon: Cloud, count: 33, color: 'text-blue-400' },
];

const recentDocs = [
    { title: 'Neural Interface API v2.0 Specs', cat: 'Development', date: '2h ago', tags: ['api', 'spec'] },
    { title: 'Q4 System Optimization Report', cat: 'Operations', date: '5h ago', tags: ['report', 'kpi'] },
    { title: 'Project Zero: Architecture Review', cat: 'Research', date: '1d ago', tags: ['arch', 'draft'] },
    { title: 'Firewall Configuration Backup', cat: 'Security', date: '2d ago', tags: ['config', 'backup'] },
];

export default function KnowledgePage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="space-y-8 pb-10 min-h-screen">
            
            {/* HERRO SEARCH SECTION */}
            <div className="relative py-16 px-8 rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col items-center text-center gap-6">
                 {/* Background FX */}
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
                 
                 <div className="z-10 space-y-2">
                     <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                         DATA VAULT
                     </h1>
                     <p className="text-zinc-400 text-lg max-w-lg mx-auto">
                         Centralized repository for all system knowledge, documentation, and archival data.
                     </p>
                 </div>

                 <div className="z-10 w-full max-w-2xl relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                     <Input 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search protocols, documents, or data nodes..." 
                        className="h-14 pl-12 bg-white/5 border-zinc-700 hover:border-zinc-600 focus:border-blue-500 rounded-2xl text-lg transition-all shadow-xl"
                     />
                 </div>
            </div>

            {/* CATEGORY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <motion.div key={cat.id} whileHover={{ y: -4 }}>
                        <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 cursor-pointer group transition-all">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`p-4 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:scale-110 transition-transform duration-300 ${cat.color}`}>
                                    <cat.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-zinc-200 group-hover:text-white transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-sm font-mono text-zinc-500">
                                        {cat.count} Data Nodes
                                    </p>
                                </div>
                                <ArrowRight className="ml-auto w-5 h-5 text-zinc-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                
                {/* Add New Category */}
                 <motion.div whileHover={{ y: -4 }}>
                    <Card className="bg-zinc-900/50 border-zinc-800 border-dashed hover:border-zinc-700 cursor-pointer h-full group">
                        <CardContent className="p-6 flex items-center justify-center h-full gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                             <Database className="w-5 h-5" />
                             <span className="font-bold uppercase tracking-wider text-xs">Initialize Node</span>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* RECENT FILES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> Recent Transmissions
                        </h2>
                        <Button variant="ghost" size="sm" className="text-zinc-500">View All</Button>
                    </div>
                    
                    <div className="space-y-3">
                         {recentDocs.map((doc, i) => (
                             <Card key={i} className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                                 <CardContent className="p-4 flex items-center gap-4">
                                     <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                                         <FileText className="w-5 h-5" />
                                     </div>
                                     <div className="flex-1">
                                         <h4 className="font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                                             {doc.title}
                                         </h4>
                                         <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                             <span>{doc.cat}</span>
                                             <span>•</span>
                                             <span>{doc.date}</span>
                                         </div>
                                     </div>
                                     <div className="flex gap-2">
                                         {doc.tags.map(t => (
                                             <span key={t} className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] uppercase font-mono text-zinc-500">
                                                 #{t}
                                             </span>
                                         ))}
                                     </div>
                                 </CardContent>
                             </Card>
                         ))}
                    </div>
                </div>

                {/* PINNED / FAVORITES */}
                <div className="space-y-4">
                     <h2 className="text-xl font-bold flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" /> Pinned Nodes
                    </h2>
                    <Card className="bg-zinc-900 border-zinc-800 h-full p-6 space-y-6">
                        <div className="space-y-2">
                            <h4 className="font-bold text-zinc-300">Quick Access</h4>
                            <p className="text-sm text-zinc-500">Frequently accessed data nodes and secure documents.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                             {['API Keys', 'Passwords', 'Blueprints', 'Contacts'].map(item => (
                                 <button key={item} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-left">
                                     {item}
                                 </button>
                             ))}
                        </div>

                         <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                             <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                                 <Lock className="w-4 h-4" /> Secure Vault
                             </div>
                             <p className="text-xs text-blue-400/70">
                                 Biometric authentication required for level 5 access.
                             </p>
                             <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 mt-2">
                                 Unlock
                             </Button>
                         </div>
                    </Card>
                </div>
            </div>

        </div>
    );
}
