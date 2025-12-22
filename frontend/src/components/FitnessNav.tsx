'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Dumbbell, Activity, PieChart, Utensils, Scale, ShoppingBasket } from 'lucide-react';

export function FitnessNav() {
  const pathname = usePathname();

  return (
    <div className="flex space-x-2 border-b mb-6 overflow-x-auto">
      <Link
        href="/dashboard/fitness/manage"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/fitness/manage'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Dumbbell className="h-4 w-4" />
        Manage Workouts
      </Link>
      <Link
        href="/dashboard/fitness/track"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/fitness/track'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Activity className="h-4 w-4" />
        Track Session
      </Link>
      <Link
        href="/dashboard/fitness/analytics"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/fitness/analytics'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <PieChart className="h-4 w-4" />
        Performance
      </Link>
      <Link
        href="/dashboard/fitness/diet"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/fitness/diet'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Utensils className="h-4 w-4" />
        Nutrition
      </Link>
      <Link
        href="/dashboard/fitness/pantry"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/fitness/pantry'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <ShoppingBasket className="h-4 w-4" />
        Pantry
      </Link>
      <Link
        href="/dashboard/fitness/measurements"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/fitness/measurements'
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Scale className="h-4 w-4" />
        Measurements
      </Link>
    </div>
  );
}
