'use client';

import React from 'react';
import { SidebarNav } from './sidebar-nav';

interface AppShellDesktopProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showNavigation?: boolean;
}

export function AppShellDesktop({
  children,
  activeTab,
  onTabChange,
  showNavigation = true,
}: AppShellDesktopProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white flex">

      {/* Left Sidebar — sticky, full viewport height */}
      {showNavigation && (
        <aside className="w-60 flex-shrink-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-r border-gray-100 dark:border-gray-800 sticky top-0 h-screen overflow-y-auto z-30 shadow-[1px_0_12px_rgba(0,0,0,0.04)]">
          <SidebarNav activeTab={activeTab} onTabChange={onTabChange} />
        </aside>
      )}

      {/* Main scrollable content — vult alle beschikbare breedte */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="w-full px-6 py-8 lg:px-8 lg:py-8 space-y-6">
          {children}
        </div>
      </div>

      {/* Right panel slot — Phase 3: Iris always-on chat */}
      {/* <aside className="w-72 flex-shrink-0 border-l ..."> */}
    </div>
  );
}
