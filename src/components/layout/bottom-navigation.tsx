'use client';

/**
 * BottomNavigation - World-class context-aware mobile navigation
 *
 * LOGIC PRIORITY (highest tier first):
 * 1. Transformatie enrolled → Show "Mijn Reis" (premium program)
 * 2. Kickstart enrolled → Show "Kickstart" (starter program)
 * 3. No enrollment → Show "Ontdek" (discovery)
 *
 * OPTIMIZED: Uses React Query cached enrollment status
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { MessageCircle, User, Sparkles, LayoutGrid, Heart, Compass } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useEnrollmentStatus } from '@/hooks/use-enrollment-status';

// Haptic feedback utility
const triggerHapticFeedback = () => {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }
};

export function BottomNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current tab from URL params
  const currentTab = searchParams?.get('tab') || null;

  // OPTIMIZED: Use cached enrollment status from React Query
  const { data: enrollmentData, isLoading } = useEnrollmentStatus();

  // Derive enrollment state from cached data
  const enrollments = useMemo(() => ({
    hasKickstart: enrollmentData?.kickstart?.isEnrolled ?? false,
    hasTransformatie: enrollmentData?.transformatie?.isEnrolled ?? false,
    isLoading,
  }), [enrollmentData, isLoading]);

  // Current page detection
  const isOnTransformatiePage = pathname?.startsWith('/transformatie');
  const isOnKickstartPage = pathname?.startsWith('/kickstart');
  const isOnProgramPage = isOnTransformatiePage || isOnKickstartPage;

  // Determine the program nav item configuration
  // PRIORITY: Transformatie (premium) > Kickstart (starter) > Discovery
  const getProgramNavItem = () => {
    const { hasKickstart, hasTransformatie } = enrollments;

    // PRIORITY 1: Transformatie enrolled (highest tier)
    // Always show Transformatie if user has it
    if (hasTransformatie) {
      return {
        href: '/transformatie',
        icon: Heart,
        label: 'Mijn Reis',
        active: isOnTransformatiePage,
        color: 'text-gray-600',
        activeColor: 'text-pink-500',
        gradient: 'from-pink-500 to-rose-500',
      };
    }

    // PRIORITY 2: Kickstart enrolled (starter tier)
    if (hasKickstart) {
      return {
        href: '/kickstart',
        icon: Sparkles,
        label: 'Kickstart',
        active: isOnKickstartPage,
        color: 'text-gray-600',
        activeColor: 'text-amber-500',
        gradient: 'from-amber-500 to-orange-500',
      };
    }

    // PRIORITY 3: No enrollment - show discovery option
    return {
      href: '/dashboard?tab=pad',
      icon: Compass,
      label: 'Ontdek',
      active: currentTab === 'pad',
      color: 'text-gray-600',
      activeColor: 'text-indigo-500',
      gradient: 'from-indigo-500 to-purple-500',
    };
  };

  const programNavItem = getProgramNavItem();

  // World-class navigation items with clear hierarchy
  const navItems = [
    {
      href: '/dashboard',
      icon: null,
      label: 'Home',
      active: pathname === '/' || (pathname === '/dashboard' && !currentTab) || currentTab === 'home',
      color: 'text-gray-600',
      activeColor: 'text-pink-500',
      isLogo: true,
    },
    programNavItem, // Dynamic: Mijn Reis / Kickstart / Ontdek
    {
      href: '/dashboard?tab=coach',
      icon: MessageCircle,
      label: 'Coach',
      active: currentTab === 'coach',
      color: 'text-gray-600',
      activeColor: 'text-blue-500',
    },
    {
      href: '/dashboard?tab=tools',
      icon: LayoutGrid,
      label: 'Tools',
      active: currentTab === 'tools',
      color: 'text-gray-600',
      activeColor: 'text-emerald-500',
    },
    {
      href: '/dashboard?tab=profiel',
      icon: User,
      label: 'Profiel',
      active: currentTab === 'profiel' || currentTab === 'settings' || currentTab === 'subscription',
      color: 'text-gray-600',
      activeColor: 'text-violet-500',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-t border-gray-100 md:hidden safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      role="navigation"
      aria-label="Hoofdnavigatie"
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.active;
          const key = `nav-${index}-${item.label}`;

          return (
            <Link
              key={key}
              href={item.href}
              onClick={triggerHapticFeedback}
              aria-label={`${item.label}${isActive ? ' (huidige pagina)' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center px-2 py-1.5 rounded-xl transition-all duration-200 ease-out min-w-[56px] active:scale-95",
                isActive
                  ? "bg-gray-50"
                  : "hover:bg-gray-50/50"
              )}
            >
              {'isLogo' in item && item.isLogo ? (
                <div className="w-6 h-6 mb-0.5 relative">
                  <Image
                    src="/images/Logo Icon DatingAssistent.png"
                    alt=""
                    aria-hidden="true"
                    fill
                    className={cn(
                      "object-contain transition-all duration-200",
                      isActive ? "opacity-100" : "opacity-60"
                    )}
                  />
                </div>
              ) : Icon ? (
                <Icon
                  className={cn(
                    "w-6 h-6 mb-0.5 transition-all duration-200",
                    isActive ? item.activeColor : item.color
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={cn(
                  "text-[11px] transition-all duration-200",
                  isActive
                    ? `${item.activeColor} font-semibold`
                    : `${item.color} font-medium`
                )}
              >
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <div
                  className={cn(
                    "absolute -bottom-0.5 w-1 h-1 rounded-full",
                    item.activeColor?.replace('text-', 'bg-') || 'bg-pink-500'
                  )}
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
