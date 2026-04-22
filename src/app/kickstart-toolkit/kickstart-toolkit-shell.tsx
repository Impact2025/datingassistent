'use client';

import { useRouter } from 'next/navigation';
import { AppShellDesktop } from '@/components/layout/app-shell-desktop';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { KickstartToolkit } from '@/components/tools-tiers/kickstart-toolkit';

export function KickstartToolkitShell() {
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard?tab=${tab}`);
  };

  return (
    <>
      {/* Desktop: render binnen AppShellDesktop met sidebar */}
      <div className="hidden md:flex min-h-screen">
        <AppShellDesktop activeTab="tools" onTabChange={handleTabChange}>
          <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-xl border border-white/30">
            <KickstartToolkit />
          </div>
        </AppShellDesktop>
      </div>

      {/* Mobiel: standalone layout met bottom nav */}
      <div className="md:hidden min-h-screen bg-gray-50 pb-20">
        <KickstartToolkit />
        <BottomNavigation />
      </div>
    </>
  );
}
