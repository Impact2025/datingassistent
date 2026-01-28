"use client";

/**
 * LockedToolCard Component
 *
 * Wereldklasse locked state voor ProfileSuite tools
 * - Elegante semi-transparante overlay met blur
 * - Professioneel slotje icoon
 * - PRO/Transformatie badge
 * - Smooth hover animaties
 * - Click-through naar upgrade
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, Crown, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import type { ProgramTier, ToolAccessLevel } from '@/lib/access-control';

interface LockedToolCardProps {
  tool: {
    id: string;
    label: string;
    icon: LucideIcon;
    description: string;
    badge?: string;
    color: string;
  };
  accessLevel: ToolAccessLevel;
  remaining?: number | 'unlimited';
  limit?: number;
  lockedMessage: string;
  upgradeMessage: string;
  upgradeTier: ProgramTier | null;
  onUnlockedClick: () => void;
}

export function LockedToolCard({
  tool,
  accessLevel,
  remaining,
  limit,
  lockedMessage,
  upgradeMessage,
  upgradeTier,
  onUnlockedClick
}: LockedToolCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const Icon = tool.icon;

  const isLocked = accessLevel === 'locked';
  const isLimited = accessLevel === 'limited';

  // Determine tier badge
  const getTierBadge = () => {
    if (!upgradeTier) return null;

    switch (upgradeTier) {
      case 'vip':
        return { label: 'VIP', icon: Crown, color: 'from-amber-500 to-yellow-400' };
      case 'transformatie':
        return { label: 'PRO', icon: Sparkles, color: 'from-purple-500 to-coral-500' };
      default:
        return { label: 'Upgrade', icon: Zap, color: 'from-coral-500 to-rose-500' };
    }
  };

  const tierBadge = getTierBadge();

  const handleClick = () => {
    if (isLocked) {
      // Navigate to checkout
      if (upgradeTier) {
        router.push(`/checkout/${upgradeTier}`);
      }
    } else {
      onUnlockedClick();
    }
  };

  // LOCKED STATE - Full overlay with blur
  if (isLocked) {
    return (
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer group",
          "transition-all duration-300 ease-out",
          "border-0 shadow-sm",
          "hover:shadow-xl hover:scale-[1.02]"
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background content (blurred) */}
        <CardContent className="p-4 opacity-40 blur-[1px]">
          <div className="text-center space-y-2">
            <div className={cn(
              "w-12 h-12 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
              tool.color
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-50 leading-tight">
              {tool.label}
            </h3>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight line-clamp-2">
              {tool.description}
            </p>
          </div>
        </CardContent>

        {/* Locked overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b from-white/80 via-white/90 to-white/95",
          "dark:from-gray-900/80 dark:via-gray-900/90 dark:to-gray-900/95",
          "flex flex-col items-center justify-center p-3",
          "transition-all duration-300"
        )}>
          {/* Lock icon with pulse effect */}
          <div className={cn(
            "relative mb-2",
            "transition-transform duration-300",
            isHovered && "scale-110"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800",
              "shadow-inner"
            )}>
              <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            {/* Pulse ring on hover */}
            {isHovered && (
              <div className="absolute inset-0 rounded-full animate-ping bg-coral-400/30" />
            )}
          </div>

          {/* Tier badge */}
          {tierBadge && (
            <Badge
              className={cn(
                "mb-2 px-2 py-0.5 text-[10px] font-bold",
                "bg-gradient-to-r text-white border-0 shadow-md",
                tierBadge.color
              )}
            >
              <tierBadge.icon className="w-3 h-3 mr-1" />
              {tierBadge.label}
            </Badge>
          )}

          {/* Tool name */}
          <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-200 text-center mb-1">
            {tool.label.replace(/^[^\s]+\s/, '')}
          </h4>

          {/* Upgrade prompt on hover */}
          <div className={cn(
            "transition-all duration-300 overflow-hidden",
            isHovered ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          )}>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mb-2 px-2">
              {upgradeMessage}
            </p>
            <Button
              size="sm"
              className={cn(
                "h-7 text-[10px] bg-gradient-to-r hover:opacity-90",
                tierBadge?.color || "from-coral-500 to-purple-500"
              )}
            >
              Ontgrendel
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // LIMITED STATE - Accessible but with usage indicator
  if (isLimited && remaining !== 'unlimited') {
    return (
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer group",
          "transition-all duration-200 border-0 shadow-sm",
          "hover:shadow-md bg-white dark:bg-gray-800"
        )}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="relative">
              <div className={cn(
                "w-12 h-12 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
                tool.color
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>

              {/* Usage counter badge */}
              <div className={cn(
                "absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5",
                "rounded-full flex items-center justify-center",
                "text-[10px] font-bold shadow-md",
                remaining === 0
                  ? "bg-red-500 text-white"
                  : remaining === 1
                  ? "bg-amber-500 text-white"
                  : "bg-emerald-500 text-white"
              )}>
                {remaining}x
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-50 leading-tight">
                {tool.label}
              </h3>

              {tool.badge && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  {tool.badge}
                </Badge>
              )}

              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight line-clamp-2">
                {tool.description}
              </p>

              {/* Usage indicator */}
              <div className="flex items-center justify-center gap-1 pt-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: limit || 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        i < (typeof remaining === 'number' ? (limit || 3) - remaining : 0)
                          ? "bg-gray-300 dark:bg-gray-600"
                          : "bg-coral-500"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // FULL ACCESS STATE - Normal card
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-800"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="text-center space-y-2">
          <div className={cn(
            "w-12 h-12 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
            tool.color
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-50 leading-tight">
              {tool.label}
            </h3>

            {tool.badge && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                {tool.badge}
              </Badge>
            )}

            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight line-clamp-2">
              {tool.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact locked indicator for featured tools
 */
export function LockedIndicator({
  upgradeTier
}: {
  upgradeTier: ProgramTier | null
}) {
  const tierConfig: Record<ProgramTier, { label: string; icon: typeof Crown; color: string }> = {
    free: { label: 'Upgrade', icon: Zap, color: 'from-coral-500 to-rose-500' },
    vip: { label: 'VIP', icon: Crown, color: 'from-amber-500 to-yellow-400' },
    transformatie: { label: 'PRO', icon: Sparkles, color: 'from-purple-500 to-coral-500' },
    kickstart: { label: 'Upgrade', icon: Zap, color: 'from-coral-500 to-rose-500' },
  };

  const config = upgradeTier ? tierConfig[upgradeTier] : tierConfig.kickstart;
  const TierIcon = config.icon;

  return (
    <div className={cn(
      "absolute top-2 right-2 z-10",
      "flex items-center gap-1 px-2 py-1 rounded-full",
      "bg-gradient-to-r text-white text-[10px] font-bold shadow-lg",
      config.color
    )}>
      <Lock className="w-3 h-3" />
      <TierIcon className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  );
}

/**
 * Upgrade CTA banner for locked tools section
 */
export function UpgradeBanner({
  lockedCount,
  upgradeTier,
  className
}: {
  lockedCount: number;
  upgradeTier: ProgramTier;
  className?: string;
}) {
  const router = useRouter();

  const tierConfig = {
    transformatie: {
      name: 'Transformatie',
      price: '€147',
      icon: Sparkles,
      color: 'from-purple-500 to-coral-500'
    },
    vip: {
      name: 'VIP',
      price: '€497',
      icon: Crown,
      color: 'from-amber-500 to-yellow-400'
    }
  };

  const config = tierConfig[upgradeTier as keyof typeof tierConfig] || tierConfig.transformatie;
  const TierIcon = config.icon;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-4",
      "bg-gradient-to-r",
      config.color,
      className
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <TierIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              Ontgrendel {lockedCount} premium tools
            </h3>
            <p className="text-white/80 text-xs">
              Upgrade naar {config.name} voor volledige toegang
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push(`/checkout/${upgradeTier}`)}
          className="bg-white text-gray-900 hover:bg-white/90 font-bold shadow-lg"
        >
          <span>{config.price}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
