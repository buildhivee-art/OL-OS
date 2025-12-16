'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { ArrowRight, LayoutDashboard, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Terminal className="h-6 w-6" />
            <span>OL-OS</span>
        </div>
        <div className="flex items-center gap-4">
            <ModeToggle />
            {isAuthenticated ? (
                <Link href="/dashboard">
                    <Button variant="default">Go to Dashboard</Button>
                </Link>
            ) : (
                <Link href="/login">
                    <Button variant="secondary">Login</Button>
                </Link>
            )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-grid-black/[0.05] dark:bg-grid-white/[0.05]">
         <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
         
         <div className="relative z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm leading-6 text-muted-foreground bg-background/50 backdrop-blur-sm">
                <span>The Operating System for Life</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-neutral-100 dark:to-neutral-500">
                Master Your Existence.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Track habits, manage tasks, analyze metrics, and level up your life with a data-driven approach designed for high performers.
            </p>
            
            <div className="flex gap-4 justify-center pt-8">
                <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                    <Button size="lg" className="h-12 px-8 text-lg font-semibold shadow-lg shadow-primary/20">
                        {isAuthenticated ? 'Enter System' : 'Initialize OS'} 
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
                {!isAuthenticated && (
                    <Link href="/login">
                        <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                            Login
                        </Button>
                    </Link>
                )}
            </div>
         </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
         <p>OL-OS System v1.0.0 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
