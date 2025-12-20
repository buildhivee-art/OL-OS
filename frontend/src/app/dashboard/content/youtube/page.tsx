'use client';

import { useState, useMemo } from 'react';
import { useContentStore, ContentItem } from '@/stores/contentStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Search, Filter, MoreHorizontal, Layout, CheckCircle2, 
    PlayCircle, Video, FileText, Image as ImageIcon, BarChart3, 
    Calendar, Clock, Settings, Upload, Trash2, Mic, Hash, X,
    ChevronRight, ChevronLeft, Save, GripVertical, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- MOCK CHECKLISTS ---
const PRODUCTION_CHECKLIST = [
    { id: '1', text: 'Research Keywords & Topic' },
    { id: '2', text: 'Write Title & Hook (3 Variations)' },
    { id: '3', text: 'Draft Outline/Script' },
    { id: '4', text: 'Design 3 Thumbnail Concepts' },
    { id: '5', text: 'Film A-Roll (Face Cam)' },
    { id: '6', text: 'Film/Source B-Roll' },
    { id: '7', text: 'Record Voiceover' },
    { id: '8', text: 'Edit Rough Cut' },
    { id: '9', text: 'Add Music & Sound FX' },
    { id: '10', text: 'Color Grading' },
    { id: '11', text: 'Final Export & Quality Check' },
    { id: '12', text: 'Upload & Add Metadata' },
];

export default function YouTubePage() {
    const { contents, createContent, updateContent, deleteContent } = useContentStore();
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [activeProject, setActiveProject] = useState<ContentItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- COMPUTED DATA ---
    const youtubeContents = useMemo(() => 
        contents.filter(c => c.platform === 'youtube'), 
    [contents]);

    const filteredContents = useMemo(() => 
        youtubeContents.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())), 
    [youtubeContents, searchQuery]);

    const stats = {
        total: youtubeContents.length,
        views: '24.5K', // Mock
        subs: '1.2K', // Mock
        ctr: '4.8%' // Mock
    };

    // --- HANDLERS ---
    const handleCreate = async () => {
        const newProject: Partial<ContentItem> = {
            title: 'Untitled Video',
            platform: 'youtube',
            type: 'video',
            status: 'idea',
            description: '',
            script: ''
        };
        // In a real app we might want to wait for ID return, but store might not return it immediately in the hook wrapper
        // We'll trust the optimist update or refresh
        await createContent(newProject);
        toast.success("New video project created");
    };

    const handleOpenProject = (item: ContentItem) => {
        setActiveProject(item);
    };

    const handleStatusMove = (item: ContentItem, direction: 'next' | 'prev') => {
        const statuses = ['idea', 'scripting', 'filming', 'editing', 'published'];
        const currentIdx = statuses.indexOf(item.status);
        let newIdx = currentIdx;
        if (direction === 'next' && currentIdx < statuses.length - 1) newIdx++;
        if (direction === 'prev' && currentIdx > 0) newIdx--;
        
        if (newIdx !== currentIdx && item._id) {
            updateContent(item._id, { status: statuses[newIdx] as any });
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-red-500/30 flex overflow-hidden">
            
            {/* SIDEBAR NAVIGATION (Mini) */}
            <div className="w-16 border-r border-zinc-800 flex flex-col items-center py-6 gap-6 bg-[#0a0a0a]">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                    <Video className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 flex flex-col gap-4 w-full px-2">
                    <NavBtn active icon={Layout} label="Dashboard" />
                    <NavBtn icon={PlayCircle} label="Content" />
                    <NavBtn icon={BarChart3} label="Analytics" />
                    <NavBtn icon={Settings} label="Settings" />
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                
                {/* HEADER */}
                <header className="h-16 border-b border-zinc-800 bg-[#0f0f0f] flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold tracking-tight">Channel Dashboard</h1>
                        <div className="h-6 w-[1px] bg-zinc-800" />
                        <div className="flex items-center gap-2 bg-zinc-900/50 rounded-lg border border-zinc-800 px-3 py-1.5 w-64">
                            <Search className="w-4 h-4 text-zinc-500" />
                            <input 
                                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-zinc-600"
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={() => setViewMode('list')}>
                             <Filter className="w-4 h-4" />
                         </Button>
                         <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full gap-2">
                             <Plus className="w-4 h-4" /> New Video
                         </Button>
                    </div>
                </header>

                {/* DASHBOARD GRID */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    
                    {/* STATS ROW */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Subs" value={stats.subs} trend="+12%" />
                        <StatCard label="Total Views" value={stats.views} trend="+5.4%" />
                        <StatCard label="Active Projects" value={youtubeContents.length} sub="Pipeline" />
                        <StatCard label="Avg. CTR" value={stats.ctr} trend="-0.2%" negative />
                    </div>

                    {/* KANBAN BOARD */}
                    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px] overflow-x-auto pb-4">
                        {['idea', 'scripting', 'filming', 'editing', 'published'].map((status) => (
                            <div key={status} className="flex-shrink-0 w-80 flex flex-col gap-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <span className={cn("w-2 h-2 rounded-full", getStatusColor(status))} />
                                        {status}
                                    </h3>
                                    <Badge variant="secondary" className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px]">
                                        {filteredContents.filter(c => c.status === status).length}
                                    </Badge>
                                </div>

                                <div className="flex-1 bg-zinc-900/30 rounded-xl border border-zinc-800 p-2 space-y-3 overflow-y-auto custom-scrollbar">
                                    {filteredContents.filter(c => c.status === status).map((item) => (
                                        <motion.div
                                            layoutId={item._id}
                                            key={item._id}
                                            onClick={() => handleOpenProject(item)}
                                            className="bg-[#1a1a1a] p-3 rounded-lg border border-zinc-800 hover:border-red-500/50 shadow-sm cursor-pointer group transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px] capitalize">
                                                    {item.type}
                                                </Badge>
                                                {status !== 'published' && (
                                                    <Button 
                                                        variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => { e.stopPropagation(); handleStatusMove(item, 'next'); }}
                                                    >
                                                        <ChevronRight className="w-3 h-3 text-zinc-400 hover:text-white" />
                                                    </Button>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-sm text-zinc-200 line-clamp-2 leading-snug mb-2">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2d ago</span>
                                                {item.description && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Desc</span>}
                                            </div>
                                        </motion.div>
                                    ))}
                                    <Button 
                                        variant="ghost" 
                                        className="w-full text-xs text-zinc-600 border border-dashed border-zinc-800 hover:border-zinc-700 hover:text-zinc-500 hover:bg-zinc-900/50"
                                        onClick={handleCreate}
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Quick Add
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* PROJECT EDITOR OVERLAY */}
            <AnimatePresence>
                {activeProject && (
                    <ProjectEditor 
                        project={activeProject} 
                        onClose={() => setActiveProject(null)} 
                        onUpdate={(updated) => activeProject._id && updateContent(activeProject._id, updated)}
                        onDelete={(id) => { deleteContent(id); setActiveProject(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function NavBtn({ icon: Icon, label, active }: any) {
    return (
        <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors group relative",
            active ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
        )}>
            <Icon className="w-5 h-5" />
            <div className="absolute left-14 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {label}
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, trend, negative }: any) {
    return (
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{label}</span>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-black text-white">{value}</span>
                {trend && (
                    <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", negative ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                        {trend}
                    </span>
                )}
                {sub && <span className="text-xs text-zinc-600">{sub}</span>}
            </div>
        </div>
    );
}

function ProjectEditor({ project, onClose, onUpdate, onDelete }: { project: ContentItem, onClose: () => void, onUpdate: (p: any) => void, onDelete: (id: string) => void }) {
    const [localProject, setLocalProject] = useState(project);
    const [tab, setTab] = useState<'script' | 'details' | 'checklist'>('details');

    // Debounced auto-save or simple save handler could go here.
    // For now we trust the user to click save or autosave logic could be added.
    const handleSave = () => {
        onUpdate(localProject);
        toast.success("Saved changes");
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-[800px] bg-[#0f0f0f] border-l border-zinc-800 shadow-2xl z-50 flex flex-col"
        >
            {/* toolbar */}
            <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#0f0f0f]">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
                    <div className="h-6 w-[1px] bg-zinc-800" />
                    <input 
                        className="bg-transparent border-none outline-none font-bold text-lg text-white w-96 placeholder:text-zinc-600"
                        value={localProject.title}
                        onChange={e => setLocalProject({...localProject, title: e.target.value})}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="destructive" size="icon" onClick={() => localProject._id && onDelete(localProject._id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 font-bold" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* SIDE TABS */}
                <div className="w-16 border-r border-zinc-800 bg-[#0a0a0a] flex flex-col items-center py-4 gap-4">
                    <EditorTab active={tab === 'details'} icon={Layout} onClick={() => setTab('details')} label="Details" />
                    <EditorTab active={tab === 'script'} icon={FileText} onClick={() => setTab('script')} label="Script" />
                    <EditorTab active={tab === 'checklist'} icon={CheckCircle2} onClick={() => setTab('checklist')} label="Tasks" />
                    <div className="flex-1" />
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-700" />
                </div>

                <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
                    
                    {tab === 'details' && (
                        <div className="p-8 space-y-8 max-w-2xl mx-auto">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Video className="w-5 h-5 text-red-500" /> Video Metadata
                                </h3>
                                
                                <div className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                             <label className="text-xs font-bold text-zinc-500 uppercase">Status</label>
                                             <select 
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                                                value={localProject.status}
                                                onChange={e => setLocalProject({...localProject, status: e.target.value as any})}
                                             >
                                                 {['idea', 'scripting', 'filming', 'editing', 'scheduled', 'published'].map(s => (
                                                     <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                 ))}
                                             </select>
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-xs font-bold text-zinc-500 uppercase">Type</label>
                                             <select 
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                                                value={localProject.type}
                                                onChange={e => setLocalProject({...localProject, type: e.target.value as any})}
                                             >
                                                 <option value="video">Long Video</option>
                                                 <option value="short">Short</option>
                                             </select>
                                         </div>
                                     </div>

                                     <div className="space-y-2">
                                         <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                                         <Textarea 
                                            className="bg-zinc-900 border-zinc-800 min-h-[150px]"
                                            value={localProject.description || ''}
                                            onChange={e => setLocalProject({...localProject, description: e.target.value})}
                                            placeholder="Video description, timestamps, and links..."
                                         />
                                     </div>

                                     <div className="space-y-2">
                                         <label className="text-xs font-bold text-zinc-500 uppercase">Thumbnail A/B</label>
                                         <div className="grid grid-cols-2 gap-4">
                                             <div className="aspect-video bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 cursor-pointer transition-colors">
                                                 <ImageIcon className="w-8 h-8 mb-2" />
                                                 <span className="text-xs font-bold">Concept A</span>
                                             </div>
                                              <div className="aspect-video bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 cursor-pointer transition-colors">
                                                 <ImageIcon className="w-8 h-8 mb-2" />
                                                 <span className="text-xs font-bold">Concept B</span>
                                             </div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'script' && (
                        <div className="h-full flex flex-col">
                            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#0a0a0a]">
                                <div className="flex gap-2 text-zinc-400">
                                    <Button variant="ghost" size="sm" className="h-8 text-xs">Heading</Button>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs">Bold</Button>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs">List</Button>
                                </div>
                                <span className="text-xs text-zinc-600">
                                    {(localProject.script?.split(' ').length || 0)} words
                                </span>
                            </div>
                            <Textarea 
                                className="flex-1 w-full bg-[#0f0f0f] border-none resize-none p-8 font-serif text-lg leading-loose text-zinc-200 focus-visible:ring-0 selection:bg-red-500/30"
                                placeholder="Start writing your masterpiece..."
                                value={localProject.script || ''}
                                onChange={e => setLocalProject({...localProject, script: e.target.value})}
                            />
                        </div>
                    )}

                    {tab === 'checklist' && (
                        <div className="p-8 max-w-2xl mx-auto space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Production Checklist</h3>
                                <Progress value={33} className="w-32 h-2" />
                            </div>
                            
                            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                                {PRODUCTION_CHECKLIST.map((item, i) => (
                                    <div key={item.id} className="flex items-center gap-3 p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                            i < 4 ? "bg-red-500 border-red-500" : "border-zinc-600 group-hover:border-zinc-500"
                                        )}>
                                            {i < 4 && <CheckCircle2 className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            i < 4 ? "text-zinc-500 line-through" : "text-zinc-300"
                                        )}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </motion.div>
    );
}

function EditorTab({ active, icon: Icon, onClick, label }: any) {
    return (
        <div className="group relative">
            <button 
                onClick={onClick}
                className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    active ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                )}
            >
                <Icon className="w-5 h-5" />
            </button>
            <div className="absolute left-14 top-2 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {label}
            </div>
        </div>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'idea': return 'bg-yellow-500';
        case 'scripting': return 'bg-orange-500';
        case 'filming': return 'bg-red-500';
        case 'editing': return 'bg-purple-500';
        case 'published': return 'bg-green-500';
        default: return 'bg-zinc-500';
    }
}
