"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

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
}

const colorStyles = {
  pink: {
    gradient: 'from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30',
    border: 'border-pink-200 dark:border-pink-700',
    iconBg: 'bg-pink-100 dark:bg-pink-900/50',
    iconText: 'text-pink-600 dark:text-pink-400',
    titleText: 'text-pink-600 dark:text-pink-400',
    quoteText: 'text-pink-700 dark:text-pink-400',
    badge: 'bg-pink-500 dark:bg-pink-600',
    button: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
  },
  purple: {
    gradient: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
    border: 'border-purple-200 dark:border-purple-700',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconText: 'text-purple-600 dark:text-purple-400',
    titleText: 'text-purple-600 dark:text-purple-400',
    quoteText: 'text-purple-700 dark:text-purple-400',
    badge: 'bg-purple-500 dark:bg-purple-600',
    button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
  },
  blue: {
    gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
    border: 'border-blue-200 dark:border-blue-700',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconText: 'text-blue-600 dark:text-blue-400',
    titleText: 'text-blue-600 dark:text-blue-400',
    quoteText: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-500 dark:bg-blue-600',
    button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
  },
  green: {
    gradient: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
    border: 'border-green-200 dark:border-green-700',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    iconText: 'text-green-600 dark:text-green-400',
    titleText: 'text-green-600 dark:text-green-400',
    quoteText: 'text-green-700 dark:text-green-400',
    badge: 'bg-green-500 dark:bg-green-600',
    button: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
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
  color = 'pink'
}: ScanCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const styles = colorStyles[color];

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className={`border-2 ${styles.border} bg-gradient-to-r ${styles.gradient} shadow-md`}>
      <CardContent className="p-4 sm:p-6">
        {/* Mobile: Stack layout, Desktop: Side-by-side */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          {/* Icon - smaller on mobile */}
          <div className="flex-shrink-0 flex items-center gap-3 sm:block">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${styles.iconBg} rounded-full flex items-center justify-center`}>
              <div className={styles.iconText}>
                {icon}
              </div>
            </div>
            {/* Title on same line as icon on mobile */}
            <div className="sm:hidden flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold text-base ${styles.titleText}`}>{title}</h3>
                <span className={`px-3 py-1 ${styles.badge} text-white text-xs rounded-full shadow-md whitespace-nowrap font-medium`}>
                  {badgeText}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title - hidden on mobile (shown above) */}
            <div className="hidden sm:flex items-center gap-2 mb-2 flex-wrap">
              <h3 className={`font-semibold text-lg ${styles.titleText}`}>{title}</h3>
              <span className={`px-3 py-1 ${styles.badge} text-white text-xs rounded-full shadow-md font-medium`}>
                {badgeText}
              </span>
            </div>

            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-2">{subtitle}</p>
            <p className={`text-xs sm:text-sm ${styles.quoteText} italic mb-4`}>"{quote}"</p>

            {/* Buttons - stack on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                onClick={onAction}
                size="sm"
                className={`gap-2 px-6 py-2 bg-gradient-to-r ${styles.button} text-white rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto justify-center`}
              >
                {actionLabel}
                <ArrowRight className="w-4 h-4" />
              </Button>

              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs sm:text-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Vandaag overslaan
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
