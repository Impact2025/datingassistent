'use client';

/**
 * BottomNavigation - World-class context-aware mobile navigation
 * Dynamically shows relevant program tab based on user enrollments
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { MessageCircle, User, Sparkles, LayoutGrid, Heart } from 'lucide-react';
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

// Types for enrollment state
interface EnrollmentState {
  hasKickstart: boolean;
  hasTransformatie: boolean;
  isLoading: boolean;
}

export function BottomNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current tab from URL params
  const currentTab = searchParams?.get('tab') || null;

  // Track enrollment state for context-aware navigation
  const [enrollments, setEnrollments] = useState<EnrollmentState>({
    hasKickstart: false,
    hasTransformatie: false,
    isLoading: true,
  });

  // Check enrollments on mount
  useEffect(() => {
    const checkEnrollments = async () => {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('datespark_auth_token')
        : null;

      if (!token) {
        setEnrollments({ hasKickstart: false, hasTransformatie: false, isLoading: false });
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        // Check both enrollments in parallel
        const [kickstartRes, transformatieRes] = await Promise.all([
          fetch('/api/kickstart/check-enrollment', { headers }).catch(() => null),
          fetch('/api/transformatie/check-enrollment', { headers }).catch(() => null),
        ]);

        let hasKickstart = false;
        let hasTransformatie = false;

        if (kickstartRes?.ok) {
          const data = await kickstartRes.json();
          hasKickstart = data.hasEnrollment === true;
        }

        if (transformatieRes?.ok) {
          const data = await transformatieRes.json();
          hasTransformatie = data.isEnrolled === true;
        }

        setEnrollments({ hasKickstart, hasTransformatie, isLoading: false });
      } catch {
        setEnrollments({ hasKickstart: false, hasTransformatie: false, isLoading: false });
      }
    };

    checkEnrollments();
  }, []);

  // Determine which program tab to show based on:
  // 1. Current page (if on /transformatie, show Transformatie)
  // 2. Enrollment status (prioritize higher tier)
  // 3. Default to Kickstart if no enrollment
  const isOnTransformatiePage = pathname?.startsWith('/transformatie');
  const isOnKickstartPage = pathname?.startsWith('/kickstart');

  // Determine the program nav item configuration
  const getProgramNavItem = () => {
    const { hasKickstart, hasTransformatie } = enrollments;

    // If currently on Transformatie page and enrolled, show Transformatie
    if (isOnTransformatiePage && hasTransformatie) {
      return {
        href: '/transformatie',
        icon: Heart,
        label: 'Reis',
        active: isOnTransformatiePage,
        color: 'text-gray-700',
        activeColor: 'text-pink-500',
      };
    }

    // If currently on Kickstart page and enrolled, show Kickstart
    if (isOnKickstartPage && hasKickstart) {
      return {
        href: '/kickstart',
        icon: Sparkles,
        label: 'Kickstart',
        active: isOnKickstartPage,
        color: 'text-gray-700',
        activeColor: 'text-rose-500',
      };
    }

    // If user has both enrollments - show the one based on current context
    if (hasKickstart && hasTransformatie) {
      // If on transformatie pages, show Transformatie
      if (isOnTransformatiePage) {
        return {
          href: '/transformatie',
          icon: Heart,
          label: 'Reis',
          active: isOnTransformatiePage,
          color: 'text-gray-700',
          activeColor: 'text-pink-500',
        };
      }
      // Default to Kickstart for users with both (can switch via dashboard)
      return {
        href: '/kickstart',
        icon: Sparkles,
        label: 'Kickstart',
        active: isOnKickstartPage,
        color: 'text-gray-700',
        activeColor: 'text-rose-500',
      };
    }

    // If only Transformatie enrolled
    if (hasTransformatie) {
      return {
        href: '/transformatie',
        icon: Heart,
        label: 'Reis',
        active: isOnTransformatiePage,
        color: 'text-gray-700',
        activeColor: 'text-pink-500',
      };
    }

    // Default: Kickstart (for enrolled users or as discovery)
    return {
      href: '/kickstart',
      icon: Sparkles,
      label: 'Kickstart',
      active: isOnKickstartPage,
      color: 'text-gray-700',
      activeColor: 'text-rose-500',
    };
  };

  const programNavItem = getProgramNavItem();

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
    programNavItem, // Dynamic program tab
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
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.active;
          // Use index as key since href can be dynamic
          const key = `nav-${index}-${item.label}`;

          return (
            <Link
              key={key}
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

              {'isLogo' in item && item.isLogo ? (
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
