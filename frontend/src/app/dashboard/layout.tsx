'use client';
import { UserSidebar } from '@/components/UserSidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { useAuthStore } from '@/stores/authStore';
import { StatusHUD } from '@/components/StatusHUD';
import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { cn } from '@/lib/utils';
import { CommandMenu } from '@/components/CommandMenu';

import { BootSequence } from '@/components/BootSequence';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showBoot, setShowBoot] = useState(false);
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Right Sidebar State
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(300);

  useEffect(() => {
    setMounted(true);
    // Check if we've booted this session
    const hasBooted = sessionStorage.getItem('ol-os-booted');
    if (!hasBooted) {
        setShowBoot(true);
        sessionStorage.setItem('ol-os-booted', 'true');
    }
  }, []);

  const handleBootComplete = () => {
    setShowBoot(false);
  };

  if (!mounted || !isHydrated) {
    return null; 
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {showBoot && <BootSequence onComplete={handleBootComplete} />}
      <CommandMenu />
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in"
            onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={cn(
          "fixed inset-y-0 left-0 z-[70] w-64 bg-background shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
          <UserSidebar isCollapsed={false} toggleCollapse={() => setIsMobileOpen(false)} />
      </div>

      {/* Desktop Fixed Sidebar */}
      <div className={cn(
        "hidden md:block fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-64"
      )}>
          <UserSidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Right Sidebar */}
      {isRightSidebarOpen && (
          <RightSidebar 
            isOpen={isRightSidebarOpen} 
            onClose={() => setIsRightSidebarOpen(false)}
            width={rightSidebarWidth}
            onWidthChange={setRightSidebarWidth}
          />
      )}

      {/* Main Content - with dynamic margins */}
      <main 
        className={cn(
            "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
            isCollapsed ? "md:pl-[80px]" : "md:pl-64"
        )}
        style={{
            paddingRight: isRightSidebarOpen ? `${rightSidebarWidth}px` : 0
        }}
      >
        <StatusHUD 
            onMobileMenuClick={() => setIsMobileOpen(true)} 
            onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
        />
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <PageTransition>
             {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
