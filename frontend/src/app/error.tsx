'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Terminal, ShieldAlert, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative font-mono selection:bg-red-500/30">
      
      {/* RED ALERT BACKGROUND */}
      <div className="absolute inset-0 bg-red-950/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black opacity-80" />
      <div className="absolute top-0 w-full h-1 bg-red-600 shadow-[0_0_20px_2px_rgba(220,38,38,0.5)] animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg relative z-10"
      >
          {/* CRASH WINDOW */}
          <div className="bg-black border border-red-900/50 rounded-xl overflow-hidden shadow-2xl shadow-red-900/20">
              
              {/* WINDOW HEADER */}
              <div className="bg-red-950/30 border-b border-red-900/30 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest">
                      <ShieldAlert className="w-4 h-4 animate-pulse" />
                      CRITICAL_PROCESS_DIED
                  </div>
                  <div className="text-[10px] text-red-700">ERR_0x0000DEAD</div>
              </div>

              {/* CONSOLE CONTENT */}
              <div className="p-6 md:p-8 space-y-6">
                  
                  <div className="flex items-start gap-4">
                       <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 shrink-0">
                           <Cpu className="w-8 h-8 text-red-500" />
                       </div>
                       <div className="space-y-1">
                           <h2 className="text-xl font-bold text-white tracking-tight">System Failure Imminent</h2>
                           <p className="text-sm text-red-300/70 leading-relaxed">
                               The operational runtime encountered an unrecoverable exception. A crash dump has been generated.
                           </p>
                       </div>
                  </div>

                  {/* TRACE DUMP BOX */}
                  <div className="bg-zinc-950 rounded border border-red-900/30 p-4 font-mono text-[10px] md:text-xs text-red-400 overflow-x-auto relative group">
                      <div className="absolute top-2 right-2 text-[9px] text-red-700 uppercase">STACK_TRACE</div>
                      <code className="block opacity-90">
                        {`> ERROR: ${error.message || "Unknown runtime error"}\n`}
                        {error.digest && `> DIGEST: ${error.digest}\n`}
                        {`> TIMESTAMP: ${new Date().toISOString()}\n`}
                        {`> MEM_ALLOC: FAULT\n`}
                        {`> RECOVERY: MANUAL_OVERRIDE_REQUIRED`}
                      </code>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <Button 
                        onClick={() => reset()} 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 shadow-lg shadow-red-600/20 border-t border-red-400"
                      >
                          <RefreshCw className="mr-2 h-4 w-4" /> Reboot Subsystem
                      </Button>
                      <Button 
                        variant="outline" 
                        asChild 
                        className="bg-transparent border-red-900/30 text-red-400 hover:bg-red-950/30 hover:text-red-300 h-12 hover:border-red-800"
                      >
                          <Link href="/dashboard">
                              <Terminal className="mr-2 h-4 w-4" /> Safe Mode
                          </Link>
                      </Button>
                  </div>

              </div>
              
              {/* PROGRESS BAR DECO */}
              <div className="h-1 bg-zinc-900 w-full">
                  <div className="h-full bg-red-600 w-1/3 animate-[pulse_2s_infinite]" />
              </div>

          </div>
          
          <div className="mt-8 text-center text-xs text-zinc-600 font-mono">
              Contact system administrator if the problem persists. <br/>
              CODE: SYSTEM_HALTED
          </div>

      </motion.div>
    </div>
  );
}
