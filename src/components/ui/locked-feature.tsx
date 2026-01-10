"use client";

/**
 * LockedFeature Component
 * Displays a locked state for features not available in the user's tier
 * with an upgrade CTA button
 */

import { Lock, Sparkles, Crown, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessControl } from '@/hooks/use-access-control';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ProgramTier } from '@/lib/access-control';

interface LockedFeatureProps {
  feature: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'card' | 'inline' | 'overlay';
  showPrice?: boolean;
  customMessage?: string;
}

export function LockedFeature({
  feature,
  children,
  className,
  variant = 'card',
  showPrice = true,
  customMessage,
}: LockedFeatureProps) {
  const router = useRouter();
  const { hasFeatureAccess, getLockedMessage, getUpgradeCTA } = useAccessControl();

  // If user has access, render children directly
  if (hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  const message = customMessage || getLockedMessage(feature);
  const cta = getUpgradeCTA(feature);

  const handleUpgrade = () => {
    if (cta.targetTier) {
      router.push(`/checkout/${cta.targetTier}`);
    }
  };

  const TierIcon = getTierIcon(cta.targetTier);

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-gray-500 dark:text-gray-400', className)}>
        <Lock className="h-4 w-4" />
        <span className="text-sm">{message}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleUpgrade}
          className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 p-0 h-auto"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={cn('relative', className)}>
        {/* Blurred content */}
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-lg">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-4 max-w-xs">
            {message}
          </p>
          <Button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <TierIcon className="h-4 w-4 mr-2" />
            {cta.buttonText}
            {showPrice && cta.betaPrice > 0 && (
              <span className="ml-2 opacity-80">
                €{cta.betaPrice}
              </span>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div
      className={cn(
        'border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6',
        'bg-gray-50/50 dark:bg-gray-800/50',
        'flex flex-col items-center justify-center text-center',
        className
      )}
    >
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full p-4 mb-4">
        <Lock className="h-6 w-6 text-gray-400" />
      </div>

      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
        Feature Vergrendeld
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
        {message}
      </p>

      <Button
        onClick={handleUpgrade}
        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
      >
        <TierIcon className="h-4 w-4 mr-2" />
        {cta.buttonText}
      </Button>

      {showPrice && cta.betaPrice > 0 && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="line-through mr-2">€{cta.price}</span>
          <span className="text-pink-600 dark:text-pink-400 font-semibold">€{cta.betaPrice}</span>
          <span className="text-xs ml-1">(Beta prijs)</span>
        </p>
      )}
    </div>
  );
}

/**
 * Wrapper component that shows content only if user has access
 */
interface RequireAccessProps {
  tier: ProgramTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAccess({ tier, children, fallback }: RequireAccessProps) {
  const { hasAccess, isLoading } = useAccessControl();

  if (isLoading) {
    return null;
  }

  if (!hasAccess(tier)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

/**
 * Shows upgrade badge on locked items
 */
interface UpgradeBadgeProps {
  feature: string;
  className?: string;
}

export function UpgradeBadge({ feature, className }: UpgradeBadgeProps) {
  const { hasFeatureAccess, getUpgradeCTA } = useAccessControl();

  if (hasFeatureAccess(feature)) {
    return null;
  }

  const cta = getUpgradeCTA(feature);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        className
      )}
    >
      <Lock className="h-3 w-3" />
      {cta.targetTier === 'vip' ? 'VIP' : cta.targetTier === 'transformatie' ? 'PRO' : 'Upgrade'}
    </span>
  );
}

/**
 * Tier badge component
 */
interface TierBadgeProps {
  tier: ProgramTier;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TierBadge({ tier, className, size = 'md' }: TierBadgeProps) {
  const Icon = getTierIcon(tier);
  const label = getTierLabel(tier);
  const colors = getTierColors(tier);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        colors,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} />
      {label}
    </span>
  );
}

// Helper functions
function getTierIcon(tier: ProgramTier | null) {
  switch (tier) {
    case 'vip':
      return Crown;
    case 'transformatie':
      return Sparkles;
    case 'kickstart':
      return Rocket;
    default:
      return Lock;
  }
}

function getTierLabel(tier: ProgramTier) {
  switch (tier) {
    case 'vip':
      return 'VIP';
    case 'transformatie':
      return 'Transformatie';
    case 'kickstart':
      return 'Kickstart';
    default:
      return 'Free';
  }
}

function getTierColors(tier: ProgramTier) {
  switch (tier) {
    case 'vip':
      return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
    case 'transformatie':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    case 'kickstart':
      return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white';
    default:
      return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }
}
