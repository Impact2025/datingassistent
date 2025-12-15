"use client";

import { Settings, LogOut, CreditCard, Sun, Moon } from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { useTheme } from '@/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { TierBadge } from '@/components/ui/locked-feature';
import { useAccessControl } from '@/hooks/use-access-control';

interface HeaderProps {
  onSettingsClick?: () => void;
  onSubscriptionClick?: () => void;
}

export function Header({ onSettingsClick, onSubscriptionClick }: HeaderProps = {}) {
  const { userProfile, logout } = useUser();
  const { theme, setTheme, actualTheme, mounted } = useTheme();
  const { userTier, isLoading: tierLoading } = useAccessControl();
  const router = useRouter();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If system, switch to opposite of actual theme
      setTheme(actualTheme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <>
      <header className="flex items-center justify-between pb-6" role="banner">
        <div>
          <div className="mb-2">
            <Logo iconSize={40} textSize="lg" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground md:text-base" role="status" aria-live="polite">
              Welkom terug, {userProfile?.name}!
            </p>
            {!tierLoading && userTier !== 'free' && (
              <TierBadge tier={userTier} size="sm" />
            )}
          </div>
        </div>
        <nav className="flex items-center space-x-2" role="navigation" aria-label="Gebruikersmenu">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={actualTheme === 'dark' ? 'Schakel naar licht thema' : 'Schakel naar donker thema'}
              title={actualTheme === 'dark' ? 'Licht thema' : 'Donker thema'}
              suppressHydrationWarning
              noFocusRing
              type="button"
            >
              <Sun className="h-5 w-5" aria-hidden="true" />
              <Moon className="h-5 w-5" aria-hidden="true" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSubscriptionClick || (() => router.push('/dashboard?tab=subscription'))}
            aria-label="Open abonnement instellingen"
            title="Mijn Abonnement"
            noFocusRing
            type="button"
          >
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick || (() => router.push('/dashboard?tab=settings'))}
            aria-label="Open instellingen"
            title="Instellingen"
            noFocusRing
            type="button"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            aria-label="Uitloggen uit je account"
            title="Uitloggen"
            noFocusRing
            type="button"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </Button>
        </nav>
      </header>
    </>
  );
}
