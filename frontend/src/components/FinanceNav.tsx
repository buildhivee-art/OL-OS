'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Target, PiggyBank, CreditCard, History } from 'lucide-react';

export function FinanceNav() {
  const pathname = usePathname();

  return (
    <div className="flex space-x-2 border-b mb-6 overflow-x-auto">
      <Link
        href="/dashboard/finance/overview"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/finance/overview'
            ? "border-amber-500 text-amber-500"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutDashboard className="h-4 w-4" />
        Overview
      </Link>
      <Link
        href="/dashboard/finance/goals"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/finance/goals'
            ? "border-amber-500 text-amber-500"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Target className="h-4 w-4" />
        Goals
      </Link>
      <Link
        href="/dashboard/finance/budgets"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/finance/budgets'
            ? "border-amber-500 text-amber-500"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <PiggyBank className="h-4 w-4" />
        Budgets
      </Link>
      <Link
        href="/dashboard/finance/debts"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/finance/debts'
            ? "border-amber-500 text-amber-500"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <CreditCard className="h-4 w-4" />
        Debts
      </Link>
      <Link
        href="/dashboard/finance/history"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === '/dashboard/finance/history'
            ? "border-amber-500 text-amber-500"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <History className="h-4 w-4" />
        History
      </Link>
    </div>
  );
}
