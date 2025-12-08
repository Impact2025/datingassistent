"use client";

/**
 * ScanStatusBadge Component
 *
 * Displays completion status and retake eligibility for scans
 * Used in: ScanCard, My Assessments page, Dashboard widgets
 *
 * States:
 * - not_started: Never completed
 * - completed_recent: Completed, in cooldown
 * - available_retake: Eligible for retake
 * - in_cooldown: Completed but can't retake yet
 */

import { CheckCircle2, Clock, Sparkles, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScanStatusBadgeProps {
  status: 'not_started' | 'completed_recent' | 'available_retake' | 'in_cooldown';
  completedAt?: Date | string;
  canRetakeAt?: Date | string;
  daysUntilRetake?: number;
  totalAttempts?: number;
  className?: string;
  showDetails?: boolean;
}

export function ScanStatusBadge({
  status,
  completedAt,
  canRetakeAt,
  daysUntilRetake,
  totalAttempts = 0,
  className,
  showDetails = true
}: ScanStatusBadgeProps) {
  // Calculate days since last scan
  const daysSinceLastScan = completedAt
    ? Math.floor((Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Render based on status
  switch (status) {
    case 'not_started':
      return (
        <Badge
          className={cn(
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
            className
          )}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Nieuw
        </Badge>
      );

    case 'completed_recent':
      return (
        <div className={cn("flex items-center gap-2", className)}>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Voltooid
          </Badge>
          {showDetails && daysSinceLastScan !== null && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {daysSinceLastScan === 0
                ? 'Vandaag'
                : daysSinceLastScan === 1
                ? 'Gisteren'
                : `${daysSinceLastScan} dagen geleden`}
            </span>
          )}
        </div>
      );

    case 'available_retake':
      return (
        <div className={cn("flex items-center gap-2", className)}>
          <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800 animate-pulse">
            <Sparkles className="w-3 h-3 mr-1" />
            Retake Beschikbaar
          </Badge>
          {showDetails && totalAttempts > 1 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalAttempts}e poging
            </span>
          )}
        </div>
      );

    case 'in_cooldown':
      return (
        <div className={cn("flex items-center gap-2", className)}>
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700">
            <Lock className="w-3 h-3 mr-1" />
            Voltooid
          </Badge>
          {showDetails && daysUntilRetake !== undefined && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 inline mr-1" />
              Retake over {daysUntilRetake} dagen
            </span>
          )}
        </div>
      );

    default:
      return null;
  }
}

/**
 * ScanStatusIndicator - Compact version for cards
 */
interface ScanStatusIndicatorProps {
  isCompleted: boolean;
  canRetake: boolean;
  daysUntilRetake?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScanStatusIndicator({
  isCompleted,
  canRetake,
  daysUntilRetake,
  size = 'md'
}: ScanStatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  if (!isCompleted) {
    // Not started - blue dot
    return (
      <div className={cn("rounded-full bg-blue-500", sizeClasses[size])} title="Nog niet gedaan" />
    );
  }

  if (canRetake) {
    // Available for retake - pulsing pink
    return (
      <div
        className={cn("rounded-full bg-pink-500 animate-pulse", sizeClasses[size])}
        title="Retake beschikbaar"
      />
    );
  }

  // Completed, in cooldown - green
  return (
    <div
      className={cn("rounded-full bg-green-500", sizeClasses[size])}
      title={daysUntilRetake ? `Retake over ${daysUntilRetake} dagen` : 'Voltooid'}
    />
  );
}

/**
 * RetakeCountdown - Countdown timer for cooldown period
 */
interface RetakeCountdownProps {
  canRetakeAt: Date | string;
  className?: string;
}

export function RetakeCountdown({ canRetakeAt, className }: RetakeCountdownProps) {
  const retakeDate = new Date(canRetakeAt);
  const now = new Date();
  const daysRemaining = Math.ceil((retakeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return (
      <div className={cn("text-sm text-pink-600 dark:text-pink-400", className)}>
        <Sparkles className="w-4 h-4 inline mr-1" />
        Retake nu beschikbaar!
      </div>
    );
  }

  const percentage = 100 - (daysRemaining / 90) * 100; // Assume 90 day cooldown

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4 inline mr-1" />
          Retake beschikbaar over
        </span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {daysRemaining} dagen
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-pink-500 to-pink-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {retakeDate.toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </div>
    </div>
  );
}
