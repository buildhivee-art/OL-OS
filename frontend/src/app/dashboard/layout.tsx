'use client';

import { UserSidebar } from '@/components/UserSidebar';
import { useAuthStore } from '@/stores/authStore';
import { StatusHUD } from '@/components/StatusHUD';
import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';

export default function DashboardLayout({
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
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Fixed Sidebar */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-50">
          <UserSidebar />
      </div>

      {/* Main Content - with left margin to offset fixed sidebar */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
          <StatusHUD />
        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <PageTransition>
             {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
