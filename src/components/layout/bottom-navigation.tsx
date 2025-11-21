'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageCircle, User } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      active: pathname === '/',
    },
    {
      href: '/courses',
      icon: Heart,
      label: 'Cursussen',
      active: pathname?.startsWith('/courses'),
    },
    {
      href: '/community',
      icon: MessageCircle,
      label: 'Community',
      active: pathname?.startsWith('/community'),
    },
    {
      href: '/dashboard',
      icon: User,
      label: 'Profiel',
      active: pathname?.startsWith('/dashboard'),
    },
  ];

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${item.active ? 'active' : 'text-gray-500'}`}
            >
              <Icon className="nav-icon" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}