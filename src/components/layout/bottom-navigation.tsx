'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Wrench, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      active: pathname === '/' || pathname?.startsWith('/dashboard') || pathname?.startsWith('/mobile-dashboard'),
      color: 'text-gray-600',
      activeColor: 'text-pink-500',
    },
    {
      href: '/chat',
      icon: MessageCircle,
      label: 'Chat',
      active: pathname?.startsWith('/chat'),
      color: 'text-gray-600',
      activeColor: 'text-blue-500',
    },
    {
      href: '/tools',
      icon: Wrench,
      label: 'Tools',
      active: pathname?.startsWith('/tools') ||
              pathname?.startsWith('/profiel') ||
              pathname?.startsWith('/foto') ||
              pathname?.startsWith('/date') ||
              pathname?.startsWith('/opener') ||
              pathname?.startsWith('/voice') ||
              pathname?.startsWith('/match') ||
              pathname?.startsWith('/veiligheid'),
      color: 'text-gray-600',
      activeColor: 'text-purple-500',
    },
    {
      href: '/profiel',
      icon: User,
      label: 'Profiel',
      active: pathname?.startsWith('/profiel') || pathname?.startsWith('/profile'),
      color: 'text-gray-600',
      activeColor: 'text-green-500',
    },
    {
      href: '/meer',
      icon: Settings,
      label: 'Account',
      active: pathname?.startsWith('/meer') ||
              pathname?.startsWith('/community') ||
              pathname?.startsWith('/settings') ||
              pathname?.startsWith('/leren') ||
              pathname?.startsWith('/groei') ||
              pathname?.startsWith('/courses') ||
              pathname?.startsWith('/progress') ||
              pathname?.startsWith('/help') ||
              pathname?.startsWith('/privacy') ||
              pathname?.startsWith('/subscription'),
      color: 'text-gray-600',
      activeColor: 'text-orange-500',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={triggerHapticFeedback}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300 ease-out min-w-[60px] active:scale-95",
                isActive
                  ? "bg-gradient-to-t from-pink-50 to-transparent shadow-sm"
                  : "hover:bg-gray-50 hover:scale-105"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 mb-1 transition-colors duration-200",
                  isActive ? item.activeColor : item.color
                )}
              />
              <span className={cn(
                "text-xs font-medium transition-colors duration-200",
                isActive ? item.activeColor : item.color
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-pink-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}