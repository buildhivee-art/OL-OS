'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Plus, Check, Clock, AlertTriangle, ArrowRight, Zap, RefreshCw, 
    Terminal, Layers, Hash, Calendar, Search, Filter, Bug, GitCommit, Rocket, MessageSquare 
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}`;

export default function RoadmapPage() {
    const { token } = useAuthStore();
    const [items, setItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState({ title: '', status: 'planned', priority: 'medium', type: 'feature' });
    const [isLoading, setIsLoading] = useState(false);
    
    // UI State
    const [filterQuery, setFilterQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const fetchRoadmap = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/roadmap`, { headers: { Authorization: `Bearer ${token}` } });
            setItems(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const addItem = async () => {
        if(!newItem.title) return;
        try {
           await axios.post(`${API_URL}/roadmap`, newItem, { headers: { Authorization: `Bearer ${token}` } });
           setNewItem({ ...newItem, title: '' });
           fetchRoadmap();
        } catch(e) { console.error(e); }
    };

    const updateStatus = async (id: string, status: string) => {
         try {
           setItems(items.map(i => i._id === id ? { ...i, status } : i)); 
           await axios.put(`${API_URL}/roadmap/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
           fetchRoadmap();
        } catch(e) { console.error(e); }
    };

    const updateItemDetails = async (id: string, updates: any) => {
        try {
            setItems(items.map(i => i._id === id ? { ...i, ...updates } : i));
            setSelectedItem((prev: any) => prev ? { ...prev, ...updates } : null);
            await axios.put(`${API_URL}/roadmap/${id}`, updates, { headers: { Authorization: `Bearer ${token}` } });
        } catch(e) { console.error(e); }
    };

    const deleteItem = async (id: string) => {
        try {
            setItems(items.filter(i => i._id !== id));
            setSelectedItem(null);
            await axios.delete(`${API_URL}/roadmap/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchRoadmap(); }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(filterQuery.toLowerCase());
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const changelogItems = filteredItems
        .filter(i => i.status === 'completed')
        .reduce((acc: any, item) => {
             const date = new Date(); // Mock date
             const month = format(date, 'MMMM yyyy');
             if(!acc[month]) acc[month] = [];
             acc[month].push(item);
             return acc;
        }, {});

    const getPriorityColor = (p: string) => {
        switch(p) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const getTypeIcon = (t: string) => {
        switch(t) {
             case 'bug': return <Bug className="w-3.5 h-3.5 text-red-500" />;
             case 'enhancement': return <Zap className="w-3.5 h-3.5 text-purple-500" />;
             default: return <Rocket className="w-3.5 h-3.5 text-blue-500" />; 
        }
    };

    const columns = [
        { id: 'planned', label: 'Protocol Queue', icon: Layers, color: 'text-zinc-400', bg: 'bg-zinc-50/50 dark:bg-zinc-900/30' },
        { id: 'in-progress', label: 'In Development', icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/5' },
        { id: 'completed', label: 'System Integrated', icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen">
            
            {/* HEADER SECTION */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center text-center gap-6 shadow-2xl">
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                 <div className="absolute top-0 w-full h-full bg-gradient-to-b from-black/0 via-black/50 to-black pointer-events-none" />
                 
                <div className="space-y-4 z-10 max-w-2xl relative">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-400 backdrop-blur-md">
                        <Terminal className="w-3 h-3" /> SYSTEM_V2.0.5 // ROADMAP_MATRIX
                     </div>
                     <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                         System Evolution
                     </h1>
                     <p className="text-zinc-400 text-lg">
                        Architecting the future. One protocol at a time.
                     </p>
                </div>

                {/* SEARCH & FILTERS */}
                <div className="w-full max-w-5xl z-10 flex flex-col md:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input 
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            className="bg-zinc-950/50 border-zinc-800 pl-10 h-11 w-full" 
                            placeholder="Search protocols..." 
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                         <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full md:w-[150px] h-11 bg-zinc-950/50 border-zinc-800">
                                 <div className="flex items-center gap-2"><Filter className="w-4 h-4" /> <SelectValue /></div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="feature">Features</SelectItem>
                                <SelectItem value="bug">Bug Reports</SelectItem>
                                <SelectItem value="enhancement">Enhancements</SelectItem>
                            </SelectContent>
                        </Select>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="h-11 px-6 bg-white text-black hover:bg-zinc-200 font-bold">
                                    <Plus className="w-4 h-4 mr-2" /> New
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Initialize New Protocol</DialogTitle>
                                    <DialogDescription>Add a new item to the system roadmap.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                     <div className="space-y-2">
                                         <label className="text-xs font-bold uppercase">Title</label>
                                         <Input value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} placeholder="e.g. Neural Link Integration" />
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                             <label className="text-xs font-bold uppercase">Type</label>
                                             <Select value={newItem.type} onValueChange={(v) => setNewItem({...newItem, type: v})}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="feature">Feature</SelectItem>
                                                    <SelectItem value="bug">Bug Report</SelectItem>
                                                    <SelectItem value="enhancement">Enhancement</SelectItem>
                                                </SelectContent>
                                            </Select>
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-xs font-bold uppercase">Priority</label>
                                             <Select value={newItem.priority} onValueChange={(v) => setNewItem({...newItem, priority: v})}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="critical">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                         </div>
                                     </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={addItem} disabled={!newItem.title}>Initialize Protocol</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="kanban" className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <TabsList className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50">
                        <TabsTrigger value="kanban" className="gap-2"><Layers className="w-4 h-4" /> Board</TabsTrigger>
                        <TabsTrigger value="timeline" className="gap-2"><Clock className="w-4 h-4" /> Timeline</TabsTrigger>
                        <TabsTrigger value="changelog" className="gap-2"><GitCommit className="w-4 h-4" /> Changelog</TabsTrigger>
                    </TabsList>
                    <div className="text-xs text-muted-foreground font-mono">
                        {filteredItems.length} OBJECTS
                    </div>
                </div>

                {/* TAB: KANBAN BOARD */}
                <TabsContent value="kanban" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                        {columns.map((col, idx) => (
                            <motion.div 
                                key={col.id} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`rounded-3xl p-4 min-h-[500px] border border-transparent flex flex-col ${col.bg}`}
                            >
                                <div className="flex items-center justify-between mb-4 pl-1 pr-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white/40 dark:bg-white/5 border border-white/10 ${col.color}`}>
                                            <col.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="font-exited font-bold text-sm tracking-wide text-zinc-600 dark:text-zinc-400 uppercase block">{col.label}</span>
                                            <span className="text-[10px] text-muted-foreground">{filteredItems.filter(i => i.status === col.id).length} items</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 flex-1">
                                    <AnimatePresence mode='popLayout'>
                                        {filteredItems.filter(i => i.status === col.id).map(item => (
                                            <motion.div
                                                key={item._id}
                                                layoutId={item._id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                onClick={() => setSelectedItem(item)}
                                                className="group cursor-pointer"
                                            >
                                                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden relative group-hover:shadow-xl group-hover:border-primary/30 group-hover:-translate-y-1 transition-all duration-300">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                                                    {getTypeIcon(item.type)}
                                                                </div>
                                                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">#{item._id.slice(-4)}</span>
                                                            </div>
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                                {col.id !== 'completed' && (
                                                                    <Button
                                                                        variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-green-500"
                                                                        onClick={(e) => { e.stopPropagation(); updateStatus(item._id, 'completed'); }}
                                                                    >
                                                                        <Check className="w-3 h-3" />
                                                                    </Button>
                                                                )}
                                                                {col.id === 'planned' && (
                                                                    <Button
                                                                        variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-blue-500"
                                                                        onClick={(e) => { e.stopPropagation(); updateStatus(item._id, 'in-progress'); }}
                                                                    >
                                                                        <ArrowRight className="w-3 h-3" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <h3 className="font-semibold text-sm leading-snug mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                                            <Badge variant="outline" className={`text-[10px] uppercase border-0 px-1.5 py-0 h-5 ${getPriorityColor(item.priority)}`}>
                                                                {item.priority}
                                                            </Badge>
                                                            {item.description && <MessageSquare className="w-3 h-3 text-zinc-400" />}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                     {filteredItems.filter(i => i.status === col.id).length === 0 && (
                                        <div className="h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 gap-2 opacity-50 bg-zinc-50/50 dark:bg-zinc-900/50">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                <Layers className="w-4 h-4 opacity-50" />
                                            </div>
                                            <span className="text-xs uppercase font-bold tracking-widest">Empty Buffer</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                {/* TAB: TIMELINE VIEW */}
                <TabsContent value="timeline" className="mt-0">
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
                        <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 space-y-8 pl-8 py-4">
                             {filteredItems.length === 0 && <div className="text-muted-foreground italic">No items found.</div>}
                             {filteredItems.map((item, idx) => (
                                 <div key={item._id} className="relative group cursor-pointer" onClick={() => setSelectedItem(item)}>
                                     <div className={cn(
                                         "absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center transition-colors",
                                         item.status === 'completed' ? "bg-emerald-500" : item.status === 'in-progress' ? "bg-blue-500" : "bg-zinc-300"
                                     )} />
                                     
                                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-all">
                                         <div>
                                             <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="secondary" className="text-[10px] uppercase">{item.status}</Badge>
                                                <span className="text-xs text-muted-foreground font-mono">#{item._id.slice(-4)}</span>
                                             </div>
                                             <h3 className="font-bold text-base">{item.title}</h3>
                                         </div>
                                         <div className="flex items-center gap-4">
                                              <Badge variant="outline" className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                                             {getTypeIcon(item.type)}
                                         </div>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </Card>
                </TabsContent>

                {/* TAB: CHANGELOG VIEW */}
                <TabsContent value="changelog" className="mt-0">
                     <div className="max-w-3xl mx-auto space-y-8">
                         {Object.keys(changelogItems).length === 0 && (
                             <div className="text-center py-20 text-muted-foreground">
                                 <GitCommit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                 <h3 className="text-lg font-bold">No Changelogs Yet</h3>
                                 <p>Complete items to see them appear here.</p>
                             </div>
                         )}
                         {Object.entries(changelogItems).map(([month, items]: [string, any]) => (
                             <div key={month} className="relative">
                                 <div className="sticky top-20 z-10 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md py-2 border-b border-zinc-200 dark:border-zinc-800 mb-4 flex items-center gap-2">
                                     <Calendar className="w-4 h-4 text-primary" />
                                     <h3 className="text-sm font-bold uppercase tracking-widest">{month}</h3>
                                 </div>
                                 <div className="grid gap-4">
                                     {items.map((item: any) => (
                                         <div key={item._id} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50">
                                              <div className="mt-1">{getTypeIcon(item.type)}</div>
                                              <div>
                                                  <h4 className="font-bold text-sm">{item.title}</h4>
                                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                      {item.description || "No description provided."}
                                                  </p>
                                                  <div className="flex items-center gap-2 mt-3">
                                                      <Badge variant="secondary" className="text-[10px] font-mono">v1.0.{items.indexOf(item) + 1}</Badge>
                                                      <span className="text-[10px] text-zinc-400">Deployed successfully</span>
                                                  </div>
                                              </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         ))}
                     </div>
                </TabsContent>
            </Tabs>

            {/* ITEM DETAILS DIALOG */}
            <Dialog open={!!selectedItem} onOpenChange={(o) => !o && setSelectedItem(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            {getTypeIcon(selectedItem?.type || 'feature')}
                            <span className="font-mono text-zinc-400">#{selectedItem?._id?.slice(-4) || '0000'}</span>
                            <span className="truncate">{selectedItem?.title}</span>
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-4 pt-2">
                             <Badge variant="outline" className="uppercase">{selectedItem?.status}</Badge>
                             <Badge variant="outline" className={getPriorityColor(selectedItem?.priority || 'medium')}>{selectedItem?.priority}</Badge>
                             <span className="text-xs text-muted-foreground flex items-center gap-1">
                                 <Calendar className="w-3 h-3" /> {format(new Date(), 'MMM d, yyyy')}
                             </span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                            <Textarea 
                                className="min-h-[150px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 resize-none focus-visible:ring-primary"
                                placeholder="Add detailed specifications..."
                                value={selectedItem?.description || ''}
                                onChange={(e) => updateItemDetails(selectedItem._id, { description: e.target.value })}
                            />
                        </div>

                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">System Metadata</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-muted-foreground">
                                    Parent_ID: <span className="text-foreground">NULL</span>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-muted-foreground">
                                    Complexity: <span className="text-foreground">O(n)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
                         <Button variant="destructive" size="sm" onClick={() => deleteItem(selectedItem._id)}>
                            Delete Protocol
                        </Button>
                        <Button onClick={() => setSelectedItem(null)}>
                            Close Panel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
