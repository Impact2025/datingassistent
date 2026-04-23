'use client';

import { useState, useEffect } from 'react';
import { Home, Heart, User, Settings, LogOut, Sun, Moon, ChevronRight, Flame } from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { useTheme } from '@/providers/theme-provider';
import { useTransformatieEnrollment, useKickstartEnrollment } from '@/hooks/use-enrollment-status';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';

const BASE_NAV_ITEMS = [
  { id: 'home',    label: 'Home',      icon: Home,  description: 'Jouw dagelijkse focus' },
  { id: 'profiel', label: 'Profiel',   icon: User,  description: 'Jouw profiel & account' },
];

const SETTINGS_TABS = ['settings', 'subscription', 'data-management'];

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  const { user, logout } = useUser();
  const { actualTheme, setTheme, mounted } = useTheme();
  const { isEnrolled: hasTransformatie, progress } = useTransformatieEnrollment();
  const { isEnrolled: hasKickstart, data: kickstartData } = useKickstartEnrollment();

  const firstName = user?.name?.split(' ')[0] || 'je';
  const avatarLetter = firstName.charAt(0).toUpperCase() || '?';

  // Transformatie progress
  const completedLessons = progress?.completed ?? 0;
  const totalLessons    = progress?.total ?? 16;
  const percentage      = progress?.percentage ?? 0;
  const currentModule   = Math.min(Math.floor(completedLessons / 4) + 1, 12);

  // Kickstart day calculation from enrollment date
  const kickstartEnrolledAt = kickstartData?.enrollment?.enrolledAt;
  const currentKickstartDay = kickstartEnrolledAt
    ? Math.min(Math.max(1, Math.floor((Date.now() - new Date(kickstartEnrolledAt).getTime()) / (1000 * 60 * 60 * 24)) + 1), 21)
    : 1;

  // Plan-aware "Mijn Reis" nav item
  const padLabel = hasTransformatie ? 'Transformatie' : hasKickstart ? 'Kickstart' : 'Mijn Pad';
  const padDescription = hasTransformatie
    ? `Module ${currentModule}/12`
    : hasKickstart
    ? `Dag ${currentKickstartDay}/21`
    : 'Start je journey';

  const NAV_ITEMS = [
    BASE_NAV_ITEMS[0],
    { id: 'pad', label: padLabel, icon: Heart, description: padDescription },
    BASE_NAV_ITEMS[1],
  ];

  // Sidebar subtitle for user pill
  const planLabel = hasTransformatie ? 'Transformatie' : hasKickstart ? 'Kickstart' : 'Gratis';

  const isOnSettingsTab  = SETTINGS_TABS.includes(activeTab);
  const displayActiveTab = isOnSettingsTab ? '' : activeTab;

  return (
    <div className="flex flex-col h-full py-5 px-3">

      {/* Logo */}
      <div className="px-2 mb-6">
        <Logo iconSize={26} textSize="sm" />
      </div>

      {/* User pill */}
      <button
        onClick={() => onTabChange('profiel')}
        className="flex items-center gap-3 px-3 py-2.5 mb-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
      >
        <div className="w-9 h-9 rounded-full bg-coral-500 hover:bg-coral-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-bold text-sm">{avatarLetter}</span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{firstName}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">{planLabel}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0" />
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = displayActiveTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                isActive
                  ? 'bg-coral-50 dark:bg-coral-950/30 text-coral-600 dark:text-coral-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  isActive ? 'text-coral-500' : 'text-gray-400 dark:text-gray-500'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="flex-1 text-left">
                <span className="block">{item.label}</span>
                {item.id === 'pad' && item.description && (
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-normal leading-tight">
                    {item.description}
                  </span>
                )}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-coral-500 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Voortgang widget — Transformatie */}
      {hasTransformatie && (
        <button
          onClick={() => onTabChange('pad')}
          className="mt-4 mx-0 p-3.5 rounded-xl bg-gradient-to-br from-coral-50 to-rose-50 dark:from-gray-800 dark:to-gray-800 border border-coral-100/80 dark:border-gray-700 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Voortgang</p>
            <p className="text-xs text-coral-500 font-semibold">{percentage}%</p>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
            Module {currentModule} van 12
          </p>
          <div className="flex gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i < currentModule - 1
                    ? 'bg-coral-400'
                    : i === currentModule - 1
                    ? 'bg-coral-300'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>
        </button>
      )}

      {/* Voortgang widget — Kickstart */}
      {hasKickstart && !hasTransformatie && (
        <button
          onClick={() => onTabChange('pad')}
          className="mt-4 mx-0 p-3.5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 border border-orange-100/80 dark:border-gray-700 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-orange-500" />
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Kickstart</p>
            </div>
            <p className="text-xs text-orange-500 font-semibold">Dag {currentKickstartDay}/21</p>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i < currentKickstartDay - 1
                    ? 'bg-orange-400'
                    : i === currentKickstartDay - 1
                    ? 'bg-orange-300'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>
        </button>
      )}

      {/* Bottom actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-0.5">
        <button
          onClick={() => onTabChange('settings')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all',
            isOnSettingsTab
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
          Instellingen
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
          >
            {actualTheme === 'dark'
              ? <Sun className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
              : <Moon className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
            }
            {actualTheme === 'dark' ? 'Licht thema' : 'Donker thema'}
          </button>
        )}

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          Uitloggen
        </button>
      </div>
    </div>
  );
}
