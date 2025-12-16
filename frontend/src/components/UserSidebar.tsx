'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, User, BookOpen, LogOut, Target, Wallet, Settings, Hourglass, Clapperboard, Dumbbell, Inbox, ListTree, Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export function UserSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Profile',
      icon: User,
      href: '/dashboard/profile',
      active: pathname === '/dashboard/profile',
    },
    {
      label: 'Categories',
      icon: BookOpen,
      href: '/dashboard/categories',
      active: pathname === '/dashboard/categories',
    },
    {
      label: 'Habits',
      icon: Target,
      href: '/dashboard/habits',
      active: pathname === '/dashboard/habits' || pathname.startsWith('/dashboard/habits'),
    },
    {
      label: 'Workout',
      icon: Dumbbell,
      href: '/dashboard/workout',
      active: pathname === '/dashboard/workout' || pathname.startsWith('/dashboard/workout'),
    },
    {
      label: 'Deep Focus',
      icon: Hourglass,
      href: '/dashboard/focus',
      active: pathname === '/dashboard/focus',
    },
    {
      label: 'System Roadmap',
      icon: ListTree,
      href: '/dashboard/roadmap',
      active: pathname === '/dashboard/roadmap',
    },
    {
      label: 'The Vault',
      icon: Inbox,
      href: '/dashboard/vault',
      active: pathname === '/dashboard/vault',
    },
    {
      label: 'Content',
      icon: Clapperboard,
      href: '/dashboard/content',
      active: pathname === '/dashboard/content',
    },
    {
      label: 'Finance',
      icon: Wallet,
      href: '/dashboard/finance',
      active: pathname === '/dashboard/finance',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      active: pathname === '/dashboard/settings',
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
             OL
          </div>
          <span>OS</span>
        </Link>
      </div>
      <div className="flex-1 px-4 py-4 space-y-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              route.active 
                ? "bg-primary/10 text-primary hover:bg-primary/15" 
                : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </div>
      
      {/* USER STATS */}
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="bg-muted/50 rounded-lg p-3 mb-2">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Level {useAuthStore.getState().user?.level || 1}
                </span>
                <span className="text-xs font-mono text-primary">
                    {useAuthStore.getState().user?.xp || 0} XP
                </span>
             </div>
             
             {/* Progress Bar */}
             <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${((useAuthStore.getState().user?.xp || 0) % 1000) / 10}%` }}
                />
             </div>
             
             <div className="mt-2 text-[10px] text-center text-muted-foreground font-medium border border-border rounded px-1 py-0.5 inline-block w-full">
                 {/* Rank Logic */}
                 {(() => {
                     const lvl = useAuthStore.getState().user?.level || 1;
                     if (lvl >= 100) return 'Master 🏆';
                     if (lvl >= 50) return 'Expert ⚔️';
                     if (lvl >= 25) return 'Adept 🛡️';
                     if (lvl >= 10) return 'Apprentice 🛠️';
                     return 'Novice 🌱';
                 })()}
             </div>
          </div>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
         <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
         >
            <LogOut className="h-4 w-4" />
            Logout
         </button>
      </div>
    </div>
  );
}
