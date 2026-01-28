"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, X, Eye } from 'lucide-react';
import { useState } from 'react';
import { ScanStatusBadge } from '@/components/scans/scan-status-badge';

interface CompletionStatus {
  isCompleted: boolean;
  completedAt?: Date | string;
  canRetake: boolean;
  daysUntilRetake?: number;
  latestResult?: string;
  improvementSinceLast?: number;
  totalAttempts?: number;
}

interface ScanCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  quote: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss?: () => void;
  badgeText?: string;
  color?: 'pink' | 'purple' | 'blue' | 'green';

  // New: Completion status
  completionStatus?: CompletionStatus;
  onViewResults?: () => void;
  onRetake?: () => void;
}

// Minimalist color styles
const colorStyles = {
  pink: {
    iconBg: 'bg-coral-50 dark:bg-coral-900/30',
    iconText: 'text-coral-600 dark:text-coral-400',
    badge: 'bg-coral-500',
    button: 'bg-coral-500 hover:bg-coral-600'
  },
  purple: {
    iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    iconText: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500',
    button: 'bg-purple-500 hover:bg-purple-600'
  },
  blue: {
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500',
    button: 'bg-blue-500 hover:bg-blue-600'
  },
  green: {
    iconBg: 'bg-green-50 dark:bg-green-900/30',
    iconText: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-500',
    button: 'bg-green-500 hover:bg-green-600'
  }
};

export function ScanCard({
  icon,
  title,
  subtitle,
  quote,
  actionLabel,
  onAction,
  onDismiss,
  badgeText = 'Tip',
  color = 'pink',
  completionStatus,
  onViewResults,
  onRetake
}: ScanCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const styles = colorStyles[color];

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  // Determine scan status for badge
  const getScanStatus = () => {
    if (!completionStatus?.isCompleted) return 'not_started';
    if (completionStatus.canRetake) return 'available_retake';

    const daysSince = completionStatus.completedAt
      ? Math.floor((Date.now() - new Date(completionStatus.completedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return daysSince < 90 ? 'completed_recent' : 'in_cooldown';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 ${styles.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <div className={styles.iconText}>
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            {!completionStatus && (
              <span className={`px-2 py-0.5 ${styles.badge} text-white text-xs rounded-full`}>
                {badgeText}
              </span>
            )}
          </div>

          {/* Completion Status Badge */}
          {completionStatus && (
            <div className="mb-2">
              <ScanStatusBadge
                status={getScanStatus()}
                completedAt={completionStatus.completedAt}
                daysUntilRetake={completionStatus.daysUntilRetake}
                totalAttempts={completionStatus.totalAttempts}
              />
            </div>
          )}

          {/* Latest Result */}
          {completionStatus?.isCompleted && completionStatus.latestResult && (
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Laatste resultaat: {completionStatus.latestResult}
            </p>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{subtitle}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-3">"{quote}"</p>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {completionStatus?.isCompleted ? (
              <>
                {onViewResults && (
                  <Button
                    onClick={onViewResults}
                    variant="outline"
                    size="sm"
                    className="gap-1 rounded-full text-xs"
                  >
                    <Eye className="w-3 h-3" />
                    Bekijk Resultaten
                  </Button>
                )}
                {completionStatus.canRetake && onRetake && (
                  <Button
                    onClick={onRetake}
                    size="sm"
                    className={`gap-1 ${styles.button} text-white rounded-full text-xs`}
                  >
                    Retake Scan
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
                {!completionStatus.canRetake && completionStatus.daysUntilRetake && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Retake over {completionStatus.daysUntilRetake} dagen
                  </span>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={onAction}
                  size="sm"
                  className={`gap-1 ${styles.button} text-white rounded-full text-xs`}
                >
                  {actionLabel}
                  <ArrowRight className="w-3 h-3" />
                </Button>
                {onDismiss && (
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-3 h-3 inline mr-1" />
                    Vandaag overslaan
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
