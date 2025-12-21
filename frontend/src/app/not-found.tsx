'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Terminal, AlertCircle, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-red-500/30">
      
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay pointer-events-none animate-pulse-slow" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="border border-zinc-800 bg-black/80 backdrop-blur-xl md:rounded-lg overflow-hidden shadow-2xl shadow-red-900/10">
            
            {/* TERMINAL HEADER */}
            <div className="h-10 bg-zinc-900/50 border-b border-zinc-800 flex items-center px-4 justify-between">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">ERROR: 0x404_PAGE_FAULT</div>
                <div className="w-10" />
            </div>

            {/* MAIN CONTENT */}
            <div className="p-8 md:p-12 text-center space-y-8 relative">
                
                {/* GLITCH HEADER */}
                <div className="relative inline-block group">
                    <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-zinc-800 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 text-8xl md:text-9xl font-black tracking-tighter text-red-500 opacity-20 blur-[2px] animate-pulse">404</div>
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                    <div className="flex items-center justify-center gap-2 text-red-500 font-bold uppercase tracking-widest text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Signal Lost</span>
                    </div>
                    <h2 className="text-2xl text-white font-bold">
                        Sector <span className="text-zinc-500 line-through decoration-red-500/50">Coordinates</span> Invalid
                    </h2>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                        The resource you are attempting to access does not exist within the current operational parameters. It may have been redacted, purged, or never initialized.
                    </p>
                </div>

                {/* DIAGNOSTICS DECO */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono text-zinc-600 border-t border-b border-zinc-900 py-4 max-w-xl mx-auto opacity-70">
                    <div className="flex flex-col items-center">
                        <span className="uppercase text-zinc-700">Protocol</span>
                        <span className="text-red-400">HTTP/2</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="uppercase text-zinc-700">Status</span>
                        <span className="text-red-400">MISSING</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="uppercase text-zinc-700">Severity</span>
                        <span className="text-yellow-400">LOW</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="uppercase text-zinc-700">Trace</span>
                        <span className="text-emerald-400">NULL</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button variant="outline" asChild className="h-12 border-zinc-700 hover:bg-zinc-800 text-white min-w-[160px] relative overflow-hidden group">
                        <Link href="/dashboard">
                            <span className="absolute inset-0 w-full h-full bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <Terminal className="mr-2 h-4 w-4 text-emerald-500" /> 
                            <span className="relative font-bold spacing-wider uppercase text-xs">Return to Grid</span>
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild className="h-12 text-zinc-400 hover:text-white hover:bg-transparent min-w-[160px]">
                        <Link href="/">
                           <ArrowLeft className="mr-2 h-4 w-4" /> 
                           <span className="text-xs uppercase tracking-widest">Back to Origin</span>
                        </Link>
                    </Button>
                </div>

            </div>

             {/* FOOTER DECO */}
            <div className="h-2 bg-gradient-to-r from-red-900/20 via-zinc-900 to-red-900/20 border-t border-zinc-900/50" />
        </div>
        
        <div className="mt-8 text-center">
             <div className="text-[10px] text-zinc-700 font-mono">
                Running OL-OS v2.0 // Kernel_Panic_Prevention_Mode
             </div>
        </div>
      </motion.div>
    </div>
  );
}
