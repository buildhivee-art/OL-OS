'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, User, BookOpen, LogOut, Target, Wallet, Settings, Hourglass, Clapperboard, Dumbbell, Inbox, ListTree, Calendar, ChevronLeft, ChevronRight, Brain, Briefcase, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

// ...

interface UserSidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function UserSidebar({ isCollapsed, toggleCollapse }: UserSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
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
      label: 'Today',
      icon: Calendar,
      href: '/dashboard/today',
      active: pathname === '/dashboard/today',
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
      active: pathname === '/dashboard/content' || pathname.startsWith('/dashboard/content'),
    },
    {
      label: 'Finance',
      icon: Wallet,
      href: '/dashboard/finance',
      active: pathname === '/dashboard/finance',
    },
    {
      label: 'Projects',
      icon: Briefcase,
      href: '/dashboard/projects',
      active: pathname === '/dashboard/projects',
    },
    {
      label: 'Knowledge Base',
      icon: Brain,
      href: '/dashboard/knowledge',
      active: pathname === '/dashboard/knowledge',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      active: pathname === '/dashboard/analytics',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      active: pathname === '/dashboard/settings',
    },
  ];

  return (
    <div className={cn(
        "flex h-full flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 relative",
        isCollapsed ? "w-[80px]" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
          "flex h-16 items-center border-b border-zinc-200 dark:border-zinc-800 transition-all flex-shrink-0",
          isCollapsed ? "justify-center" : "justify-between px-4"
      )}>
        {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground min-w-[32px]">
                 OL
              </div>
              <span>OS</span>
            </Link>
        )}

        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCollapse}
            className={cn("text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800", isCollapsed ? "h-10 w-10" : "h-8 w-8")}
        >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            title={isCollapsed ? route.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative",
              route.active 
                ? "bg-primary/10 text-primary hover:bg-primary/15" 
                : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
              isCollapsed && "justify-center px-0"
            )}
          >
            <route.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed ? "mx-auto" : "")} />
            {!isCollapsed && <span>{route.label}</span>}
          </Link>
        ))}
      </div>
      
      {/* USER STATS - Only show when expanded */}
      {!isCollapsed && (
          <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-300 flex-shrink-0">
              <div className="bg-muted/50 rounded-lg p-3 mb-2">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Level {user?.level || 1}
                    </span>
                    <span className="text-xs font-mono text-primary">
                        {user?.xp || 0} XP
                    </span>
                 </div>
                 
                 <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${((user?.xp || 0) % 1000) / 10}%` }}
                    />
                 </div>
                 
                 <div className="mt-2 text-[10px] text-center text-muted-foreground font-medium border border-border rounded px-1 py-0.5 inline-block w-full">
                     {(() => {
                         const lvl = user?.level || 1;
                         if (lvl >= 100) return 'Master 🏆';
                         if (lvl >= 50) return 'Expert ⚔️';
                         if (lvl >= 25) return 'Adept 🛡️';
                         if (lvl >= 10) return 'Apprentice 🛠️';
                         return 'Novice 🌱';
                     })()}
                 </div>
              </div>
          </div>
      )}

      {/* Footer / Logout */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 flex-shrink-0">
         <button 
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all",
                isCollapsed && "justify-center px-0"
            )}
         >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && "Logout"}
         </button>
      </div>
    </div>
  );
}
