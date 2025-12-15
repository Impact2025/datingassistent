'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { MessageCircle, TrendingUp, User, Sparkles, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Haptic feedback utility
const triggerHapticFeedback = () => {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    // Check for vibration API support
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // 50ms vibration
    }
  }
};

export function BottomNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current tab from URL params
  const currentTab = searchParams?.get('tab') || null;

  const navItems = [
    {
      href: '/dashboard',
      icon: null, // Logo image instead of icon
      label: 'Home',
      active: pathname === '/' || (pathname === '/dashboard' && !currentTab),
      color: 'text-gray-700',
      activeColor: 'text-pink-500',
      isLogo: true,
    },
    {
      href: '/kickstart',
      icon: Sparkles,
      label: 'Kickstart',
      active: pathname?.startsWith('/kickstart'),
      color: 'text-gray-700',
      activeColor: 'text-rose-500',
    },
    {
      href: '/dashboard?tab=coach',
      icon: MessageCircle,
      label: 'Coach',
      active: currentTab === 'coach',
      color: 'text-gray-700',
      activeColor: 'text-blue-500',
    },
    {
      href: '/dashboard?tab=tools',
      icon: LayoutGrid,
      label: 'Tools',
      active: currentTab === 'tools',
      color: 'text-gray-700',
      activeColor: 'text-green-500',
    },
    {
      href: '/dashboard?tab=profiel',
      icon: User,
      label: 'Profiel',
      active: currentTab === 'profiel',
      color: 'text-gray-700',
      activeColor: 'text-purple-500',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-lg border-t border-gray-200 md:hidden safe-area-bottom shadow-lg"
      role="navigation"
      aria-label="Hoofdnavigatie"
    >
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={triggerHapticFeedback}
              aria-label={`${item.label}${isActive ? ' (huidige pagina)' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all duration-300 ease-out min-w-[60px] active:scale-95",
                isActive
                  ? "bg-gradient-to-t from-pink-50 via-pink-25 to-transparent shadow-sm scale-105"
                  : "hover:bg-gray-50"
              )}
            >
              {/* Active Indicator Background Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-pink-100/30 rounded-2xl blur-sm -z-10" />
              )}

              {item.isLogo ? (
                <div className="w-6 h-6 mb-1 relative">
                  <Image
                    src="/images/Logo Icon DatingAssistent.png"
                    alt=""
                    aria-hidden="true"
                    fill
                    className={cn(
                      "object-contain transition-all duration-200",
                      isActive ? "opacity-100 scale-110" : "opacity-70"
                    )}
                  />
                </div>
              ) : Icon ? (
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-6 h-6 mb-1 transition-all duration-200",
                      isActive ? `${item.activeColor} scale-110` : item.color
                    )}
                    aria-hidden="true"
                  />
                  {/* Pulse effect for active icon */}
                  {isActive && (
                    <div className="absolute inset-0 animate-ping opacity-20" aria-hidden="true">
                      <Icon className={cn("w-6 h-6", item.activeColor)} aria-hidden="true" />
                    </div>
                  )}
                </div>
              ) : null}
              <span
                className={cn(
                  "text-sm font-medium transition-all duration-200",
                  isActive ? `${item.activeColor} font-semibold` : item.color
                )}
                aria-hidden="true"
              >
                {item.label}
              </span>
              {/* Bottom Active Indicator */}
              {isActive && (
                <div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}