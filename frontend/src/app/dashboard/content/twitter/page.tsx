'use client';

import { useState, useMemo } from 'react';
import { 
    Twitter, Hash, Image as ImageIcon, Send, Clock, 
    Calendar, Repeat, Heart, MessageCircle, BarChart2,
    PenTool, Sparkles, Smile, MoreHorizontal, Copy, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const THREAD_TEMPLATES = [
    { label: 'Storytelling', icon: PenTool, bg: 'bg-purple-500/10 text-purple-500' },
    { label: 'Educational', icon: Sparkles, bg: 'bg-blue-500/10 text-blue-500' },
    { label: 'Contrarian', icon: Zap, bg: 'bg-orange-500/10 text-orange-500' },
    { label: 'Listicle', icon: List, bg: 'bg-green-500/10 text-green-500' },
];

import { Zap, List } from 'lucide-react'; // Import missing icons

export default function TwitterStudioPage() {
    const [activeTab, setActiveTab] = useState('compose');
    const [tweetContent, setTweetContent] = useState('');
    const [threadMode, setThreadMode] = useState(false);
    const [threadTweets, setThreadTweets] = useState(['']);

    // --- COMPUTED ---
    const charCount = tweetContent.length;
    const isOverLimit = charCount > 280;

    // --- HANDLERS ---
    const handleAddThreadTweet = () => {
        setThreadTweets([...threadTweets, '']);
    };

    const handleUpdateThreadTweet = (index: number, val: string) => {
        const newTweets = [...threadTweets];
        newTweets[index] = val;
        setThreadTweets(newTweets);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-foreground font-sans flex overflow-hidden">
            
            {/* LEFT: COMPOSER & TOOLS */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden border-r border-zinc-200 dark:border-zinc-800">
                
                {/* HEADER */}
                <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
                            <Twitter className="w-4 h-4 text-white fill-white" />
                        </div>
                        <h1 className="font-bold text-lg tracking-tight">Tweet Composer</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">Drafts (3)</Button>
                        <Button className="bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full px-6">
                            Schedule
                        </Button>
                    </div>
                </header>

                {/* MAIN EDITOR AREA */}
                <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-[#0f0f0f] relative">
                    
                    {/* Floating Controls */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <Button 
                            variant="outline" size="sm" 
                            className={cn("gap-2 transition-all", threadMode ? "bg-sky-500/10 text-sky-500 border-sky-500/20" : "")}
                            onClick={() => setThreadMode(!threadMode)}
                        >
                            <Repeat className="w-4 h-4" /> Thread Mode
                        </Button>
                    </div>

                    <div className="max-w-2xl mx-auto py-10 px-6 space-y-6">
                        
                        {/* THREAD EDITOR VIEW */}
                        <AnimatePresence>
                            {(threadMode ? threadTweets : [tweetContent]).map((tweet, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative group"
                                >
                                    {/* Connectivity Line */}
                                    {threadMode && idx < threadTweets.length - 1 && (
                                        <div className="absolute left-[2.25rem] top-16 bottom-[-24px] w-0.5 bg-zinc-200 dark:bg-zinc-800 z-0" />
                                    )}

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 pt-2 relative z-10">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg" />
                                        </div>
                                        
                                        <div className="flex-1 space-y-3">
                                            <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 ring-sky-500/20 transition-all p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tweet {idx + 1}</span>
                                                    {threadMode && idx > 0 && (
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-500" onClick={() => {
                                                            const newTweets = threadTweets.filter((_, i) => i !== idx);
                                                            setThreadTweets(newTweets);
                                                        }}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                
                                                <Textarea 
                                                    className="w-full min-h-[120px] bg-transparent border-none resize-none text-xl leading-relaxed p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                                                    placeholder={idx === 0 ? "What's happening?" : "Add another tweet..."}
                                                    value={threadMode ? tweet : tweetContent}
                                                    onChange={e => threadMode ? handleUpdateThreadTweet(idx, e.target.value) : setTweetContent(e.target.value)}
                                                />
                                                
                                                <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-sky-500">
                                                        <Button variant="ghost" size="icon" className="hover:bg-sky-500/10 rounded-full h-8 w-8"><ImageIcon className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" className="hover:bg-sky-500/10 rounded-full h-8 w-8"><Smile className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" className="hover:bg-sky-500/10 rounded-full h-8 w-8"><BarChart2 className="w-4 h-4" /></Button>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn(
                                                            "text-xs font-mono font-bold transition-colors",
                                                            tweet.length > 280 ? "text-red-500" : "text-zinc-400"
                                                        )}>
                                                            {tweet.length}/280
                                                        </span>
                                                        <CircularProgress value={(tweet.length / 280) * 100} isOver={tweet.length > 280} />
                                                        
                                                        {!threadMode && (
                                                            <>
                                                                <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 text-zinc-400 hover:text-sky-500 rounded-full"
                                                                    onClick={() => {
                                                                        setThreadMode(true);
                                                                        setThreadTweets([tweetContent, '']);
                                                                    }}
                                                                >
                                                                    <Plus className="w-5 h-5" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {threadMode && (
                            <div className="flex gap-4">
                                <div className="w-10 flex justify-center">
                                    <div className="w-0.5 h-full bg-zinc-200 dark:bg-zinc-800 -mt-6 mb-4" />
                                </div>
                                <Button 
                                    variant="ghost" 
                                    className="text-sky-500 hover:text-sky-600 hover:bg-sky-500/10 font-bold"
                                    onClick={handleAddThreadTweet}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Tweet
                                </Button>
                            </div>
                        )}

                    </div>
                </div>

                {/* TEMPLATE BAR */}
                <div className="h-16 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] px-6 flex items-center gap-4 overflow-x-auto">
                    <span className="text-xs font-bold uppercase text-muted-foreground whitespace-nowrap">Templates:</span>
                    {THREAD_TEMPLATES.map((tmpl, i) => (
                        <Button key={i} variant="outline" size="sm" className="gap-2 rounded-full border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900">
                             <tmpl.icon className={cn("w-3 h-3", tmpl.bg.split(' ')[1])} /> {tmpl.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* RIGHT: PREVIEW & QUEUE */}
            <div className="w-[400px] flex flex-col bg-white dark:bg-[#0a0a0a] border-l border-zinc-200 dark:border-zinc-800">
                <Tabs defaultValue="preview" className="flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-2 rounded-none p-0 h-14 bg-transparent border-b border-zinc-200 dark:border-zinc-800">
                        <TabsTrigger value="preview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:text-sky-500 h-full">Mobile Preview</TabsTrigger>
                        <TabsTrigger value="queue" className="rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:text-sky-500 h-full">Queue (5)</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preview" className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-6 flex items-center justify-center overflow-auto m-0">
                         {/* PHONE MOCKUP */}
                         <div className="w-[320px] bg-white dark:bg-black rounded-[3rem] shadow-2xl border-8 border-zinc-900 relative overflow-hidden flex flex-col h-[650px]">
                             <div className="absolute top-0 inset-x-0 h-8 bg-zinc-900 z-20 flex justify-center">
                                 <div className="w-32 h-6 bg-black rounded-b-2xl" />
                             </div>
                             
                             {/* Twitter App Header */}
                             <div className="h-24 pt-10 px-4 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur sticky top-0 z-10 border-b border-zinc-100 dark:border-zinc-800">
                                 <div className="w-8 h-8 rounded-full bg-zinc-200" />
                                 <Twitter className="w-6 h-6 text-sky-500 fill-sky-500" />
                                 <Sparkles className="w-6 h-6" />
                             </div>

                             {/* Feed Content */}
                             <div className="flex-1 overflow-y-auto p-0">
                                 {(threadMode ? threadTweets : [tweetContent]).map((txt, i) => (
                                     <div key={i} className={cn(
                                         "p-4 border-b border-zinc-100 dark:border-zinc-800 relative",
                                         i === 0 ? "pb-4" : "pt-4"
                                     )}>
                                         {/* Connector Line for Thread in Preview */}
                                         {threadMode && i < threadTweets.length - 1 && (
                                              <div className="absolute left-[2.2rem] top-16 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800" />
                                         )}

                                         <div className="flex gap-3">
                                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 z-10 relative" />
                                             <div className="flex-1">
                                                 <div className="flex items-center gap-1">
                                                     <span className="font-bold text-sm">User Name</span>
                                                     <span className="text-zinc-500 text-sm">@username · 1m</span>
                                                 </div>
                                                 <p className="text-sm mt-1 whitespace-pre-wrap leading-normal">
                                                     {txt || <span className="text-muted-foreground italic">Start typing...</span>}
                                                 </p>
                                                 <div className="flex justify-between items-center mt-3 text-zinc-500">
                                                     <MessageCircle className="w-4 h-4" />
                                                     <Repeat className="w-4 h-4" />
                                                     <Heart className="w-4 h-4" />
                                                     <BarChart2 className="w-4 h-4" />
                                                     <Send className="w-4 h-4" />
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </TabsContent>

                    <TabsContent value="queue" className="flex-1 p-0 m-0 overflow-y-auto">
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {[1,2,3,4,5].map((_, i) => (
                                <div key={i} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="text-[10px] bg-sky-500/5 text-sky-500 border-sky-500/20">Scheduled</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Tomorrow 9AM
                                        </span>
                                    </div>
                                    <p className="text-sm line-clamp-2 text-foreground/80">
                                        Just shipped a new update to the dashboard. The new performance metrics are insane! 🚀 #buildinginpublic
                                    </p>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

        </div>
    );
}

// Helper Components
function CircularProgress({ value, isOver }: { value: number, isOver: boolean }) {
    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative w-6 h-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="12" cy="12" r={radius} stroke="currentColor" strokeWidth="2" fill="transparent" className="text-zinc-200 dark:text-zinc-800" />
                <circle 
                    cx="12" cy="12" r={radius} 
                    stroke="currentColor" strokeWidth="2" 
                    fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset} 
                    className={cn(isOver ? "text-red-500" : "text-sky-500")}
                />
            </svg>
        </div>
    )
}

// Missing Icon Import Patch
import { Plus } from 'lucide-react';
