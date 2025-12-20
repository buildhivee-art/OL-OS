'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutList, Activity, BookOpen, PenLine, Layers, FlaskConical } from 'lucide-react';

export function HabitNav() {
  const pathname = usePathname();

  return (
    <div className="flex space-x-2 border-b mb-6">
      <Link
        href="/dashboard/habits"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
          pathname === '/dashboard/habits'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutList className="h-4 w-4" />
        Manage Habits
      </Link>
      <Link
        href="/dashboard/habits/track"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
          pathname === '/dashboard/habits/track'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Activity className="h-4 w-4" />
        Track Progress
      </Link>
      <Link
        href="/dashboard/habits/analytics"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
          pathname === '/dashboard/habits/analytics'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Activity className="h-4 w-4" />
        Analytics
      </Link>
      <Link
        href="/dashboard/habits/weekly-log"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
          pathname === '/dashboard/habits/weekly-log'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <PenLine className="h-4 w-4" />
        Weekly Log
      </Link>
      <Link
        href="/dashboard/habits/reviews"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
          pathname === '/dashboard/habits/reviews'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <BookOpen className="h-4 w-4" />
      </Link>
      <Link
        href="/dashboard/habits/routines"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
          pathname === '/dashboard/habits/routines'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Layers className="h-4 w-4" />
        Routine Stacks
      </Link>
      <Link
        href="/dashboard/habits/lab"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
          pathname === '/dashboard/habits/lab'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <FlaskConical className="h-4 w-4" />
        Habit Lab
      </Link>
    </div>
  );
}
