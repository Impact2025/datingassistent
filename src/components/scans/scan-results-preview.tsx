"use client";

/**
 * ScanResultsPreview Component
 *
 * Shows a compact preview of scan results on the dashboard
 * Click to view full results
 *
 * Used in: Dashboard widgets, My Assessments cards
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart, Brain, Flame, ArrowRight, TrendingUp, Sparkles
} from 'lucide-react';
import { ScanStatusBadge } from './scan-status-badge';
import { cn } from '@/lib/utils';

interface ScanResultsPreviewProps {
  scanType: 'hechtingsstijl' | 'dating-style' | 'emotional-readiness';
  primaryResult: string;
  confidenceScore?: number;
  completedAt: Date | string;
  scores?: Record<string, number>;
  canRetake?: boolean;
  daysUntilRetake?: number;
  improvementVsPrevious?: number;
  totalAttempts?: number;
  onViewResults: () => void;
  onRetake?: () => void;
  className?: string;
}

// Scan metadata
const SCAN_META = {
  'hechtingsstijl': {
    name: 'Hechtingsstijl',
    icon: Heart,
    color: 'purple' as const,
    gradient: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
    border: 'border-purple-200 dark:border-purple-700',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  'dating-style': {
    name: 'Dating Style',
    icon: Brain,
    color: 'pink' as const,
    gradient: 'from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30',
    border: 'border-pink-200 dark:border-pink-700',
    iconBg: 'bg-pink-100 dark:bg-pink-900/50',
    iconColor: 'text-pink-600 dark:text-pink-400'
  },
  'emotional-readiness': {
    name: 'Emotional Readiness',
    icon: Flame,
    color: 'blue' as const,
    gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
    border: 'border-blue-200 dark:border-blue-700',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400'
  }
};

export function ScanResultsPreview({
  scanType,
  primaryResult,
  confidenceScore,
  completedAt,
  scores,
  canRetake = false,
  daysUntilRetake,
  improvementVsPrevious,
  totalAttempts = 1,
  onViewResults,
  onRetake,
  className
}: ScanResultsPreviewProps) {
  const meta = SCAN_META[scanType];
  const Icon = meta.icon;

  // Calculate days since scan
  const daysSince = Math.floor(
    (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine status for badge
  const status = canRetake
    ? 'available_retake'
    : daysSince < 90
    ? 'completed_recent'
    : 'in_cooldown';

  return (
    <Card className={cn("border-2 shadow-sm overflow-hidden", meta.border, className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", meta.iconBg)}>
              <Icon className={cn("w-5 h-5", meta.iconColor)} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {meta.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {daysSince === 0
                  ? 'Vandaag'
                  : daysSince === 1
                  ? 'Gisteren'
                  : `${daysSince} dagen geleden`}
              </p>
            </div>
          </div>

          <ScanStatusBadge
            status={status}
            completedAt={completedAt}
            daysUntilRetake={daysUntilRetake}
            totalAttempts={totalAttempts}
            showDetails={false}
          />
        </div>

        {/* Result */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Jouw Resultaat
            </span>
            {confidenceScore && (
              <Badge variant="secondary" className="text-xs">
                {confidenceScore}% betrouwbaar
              </Badge>
            )}
          </div>
          <p className={cn("text-base font-semibold", meta.iconColor)}>
            {primaryResult}
          </p>
        </div>

        {/* Improvement badge */}
        {improvementVsPrevious && improvementVsPrevious > 0 && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              +{improvementVsPrevious.toFixed(1)}% verbetering
            </span>
          </div>
        )}

        {/* Scores preview (optional) */}
        {scores && Object.keys(scores).length > 0 && (
          <div className="mb-4 space-y-1">
            {Object.entries(scores)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r", `from-${meta.color}-500 to-${meta.color}-600`)}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium w-8 text-right">
                      {value}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onViewResults}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
          >
            Bekijk Resultaten
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>

          {canRetake && onRetake && (
            <Button
              onClick={onRetake}
              size="sm"
              className={cn(
                "flex-1 text-xs bg-gradient-to-r text-white",
                `from-${meta.color}-500 to-${meta.color}-600 hover:from-${meta.color}-600 hover:to-${meta.color}-700`
              )}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Retake
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ScanResultsList - Compact list view for multiple results
 */
interface ScanResultsListProps {
  results: Array<{
    scanType: 'hechtingsstijl' | 'dating-style' | 'emotional-readiness';
    primaryResult: string;
    completedAt: Date | string;
    canRetake: boolean;
  }>;
  onViewResult: (scanType: string) => void;
  className?: string;
}

export function ScanResultsList({
  results,
  onViewResult,
  className
}: ScanResultsListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {results.map((result, index) => {
        const meta = SCAN_META[result.scanType];
        const Icon = meta.icon;
        const daysSince = Math.floor(
          (Date.now() - new Date(result.completedAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div
            key={index}
            onClick={() => onViewResult(result.scanType)}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", meta.iconBg)}>
              <Icon className={cn("w-4 h-4", meta.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {result.primaryResult}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {meta.name} • {daysSince} dagen geleden
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
