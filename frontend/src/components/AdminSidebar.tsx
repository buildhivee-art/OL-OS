'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FolderKanban, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export function AdminSidebar() {
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
      href: '/admin',
      active: pathname === '/admin',
    },
    {
      label: 'Categories',
      icon: FolderKanban,
      href: '/admin/categories',
      active: pathname === '/admin/categories',
    },
    {
      label: 'Users',
      icon: Users,
      href: '/admin/users',
      active: pathname === '/admin/users',
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-zinc-900 text-white">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
             A
          </div>
          <span>Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1 px-4 py-4 space-y-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-white",
              route.active 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "text-zinc-400 hover:bg-zinc-800"
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-zinc-800">
         <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white"
         >
            <LogOut className="h-4 w-4" />
            Logout
         </button>
      </div>
    </div>
  );
}
