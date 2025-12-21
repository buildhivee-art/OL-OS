'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Settings, 
  User, 
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Zap,
  Youtube,
  Twitter,
  FileText,
  Brain,
  Target
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const { logout } = useAuthStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <Command loop className="w-full bg-transparent">
            
            <div className="flex items-center border-b border-zinc-800 px-3" cmdk-input-wrapper="">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-white" />
              <Command.Input 
                placeholder="Type a command or search..."
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 text-white disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2">
              <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                No results found.
              </Command.Empty>

              <Command.Group heading="Navigation" className="text-zinc-500 px-2 py-1.5 text-xs font-medium">
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/finance/overview'))}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Finance
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/habits/track'))}>
                  <Target className="mr-2 h-4 w-4" />
                  Habits
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/fitness/track'))}>
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Fitness
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/vault'))}>
                  <FileText className="mr-2 h-4 w-4" />
                  Vault
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/content'))}>
                  <Youtube className="mr-2 h-4 w-4" />
                  Content Studio
                </CommandItem>
              </Command.Group>

              <Command.Group heading="Quick Actions" className="text-zinc-500 px-2 py-1.5 text-xs font-medium mt-2">
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/vault?new=true'))}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/fitness/track'))}>
                   <Zap className="mr-2 h-4 w-4" />
                   Log Workout
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/finance/overview'))}>
                   <Calculator className="mr-2 h-4 w-4" />
                   Add Transaction
                </CommandItem>
              </Command.Group>

               <Command.Group heading="System" className="text-zinc-500 px-2 py-1.5 text-xs font-medium mt-2">
                <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                  <span className="mr-2">☀️</span>
                  Light Theme
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                  <span className="mr-2">🌙</span>
                  Dark Theme
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings'))}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => logout())}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </CommandItem>
              </Command.Group>

            </Command.List>
            
            <div className="border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500 bg-zinc-900/50 flex justify-between">
                <span>OL-OS v1.0</span>
                <span>CMD + K to close</span>
            </div>

          </Command>
      </div>
    </div>
  );
}

function CommandItem({ children, onSelect }: { children: React.ReactNode, onSelect: () => void }) {
    return (
        <Command.Item 
            onSelect={onSelect}
            className="flex items-center px-2 py-2 text-sm text-zinc-300 rounded-md cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors aria-selected:bg-zinc-800 aria-selected:text-white"
        >
            {children}
        </Command.Item>
    )
}
