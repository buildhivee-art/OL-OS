'use client';

import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isHydrated) {
    return null; 
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950">
        <div className="h-full p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
