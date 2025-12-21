'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, ShieldCheck, Wifi, Binary } from 'lucide-react';
import { cn } from '@/lib/utils';

const BOOT_LOGS = [
    "INITIALIZING_KERNEL_V2.0...",
    "MOUNTING_FILE_SYSTEM...",
    "VERIFYING_IDENTITY_HASH...",
    "CONNECTING_NEURAL_UPLINK...",
    "LOADING_HABIT_MODULES...",
    "SYNCING_FINANCIAL_LEDGER...",
    "CALIBRATING_FITNESS_SENSORS...",
    "ESTABLISHING_SECURE_CONNECTION...",
    "OPTIMIZING_RUNTIME_ENVIRONMENT...",
    "SYSTEM_READY."
];

export function BootSequence({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Fast progress bar
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + Math.random() * 5;
                if (next >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return next;
            });
        }, 30);

        // Log scrolling
        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < BOOT_LOGS.length) {
                setLogs(prev => [...prev.slice(-4), BOOT_LOGS[logIndex]]);
                logIndex++;
            } else {
                clearInterval(logInterval);
            }
        }, 150);

        // Completion delay
        const timeout = setTimeout(() => {
            setIsComplete(true);
            setTimeout(onComplete, 800); // Wait for exit animation
        }, 2200);

        return () => {
            clearInterval(interval);
            clearInterval(logInterval);
            clearTimeout(timeout);
        };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {!isComplete && (
                <motion.div
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center font-mono overflow-hidden text-green-500 selection:bg-green-500/30"
                >
                    {/* CRT Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_80%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_1px] z-50" />
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,transparent_50%,black_100%)] z-40" />

                    <div className="w-full max-w-lg p-8 relative z-30">
                        {/* Header Icons */}
                        <div className="flex justify-center gap-8 mb-12 opacity-50">
                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <Cpu className="w-8 h-8" />
                            </motion.div>
                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
                                <Binary className="w-8 h-8" />
                            </motion.div>
                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}>
                                <Wifi className="w-8 h-8" />
                            </motion.div>
                        </div>

                        {/* Text Glitch Effect Title */}
                        <div className="text-center mb-8 relative">
                            <h1 className="text-4xl font-black tracking-tighter mb-2 glitch-text data-text='OL-OS_KERNEL'">
                                OL-OS KERNEL
                            </h1>
                            <div className="text-xs uppercase tracking-[0.3em] opacity-50">v2.0.4 // SYSTEM INITIALIZATION</div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-green-900/30 mb-8 overflow-hidden rounded-full relative">
                            <motion.div 
                                className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Scrolling Logs */}
                        <div className="h-32 flex flex-col justify-end text-xs font-bold space-y-1 opacity-80">
                            {logs.map((log, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-green-700">{">"}</span> {log}
                                </motion.div>
                            ))}
                        </div>

                    </div>
                    
                    {/* Bottom Status */}
                    <div className="absolute bottom-8 text-[10px] opacity-30 tracking-widest animate-pulse">
                        ACCESSING SECURE DATA VAULT...
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
