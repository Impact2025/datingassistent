'use client';

/**
 * Quick Actions Component
 * Segment-based personalized help actions
 *
 * Features:
 * - Personalized actions per user segment
 * - Visual icons and descriptions
 * - Smooth animations
 */

import { motion } from 'framer-motion';
import {
  UserCircle,
  PlayCircle,
  MessageCircle,
  Zap,
  Camera,
  Phone,
  Search,
  Heart,
  Crown,
  User,
  Sparkles,
  Gift,
  HelpCircle,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getQuickActionsForSegment } from '@/lib/support/knowledge-base';
import type { UserSegment, QuickAction } from '@/lib/support/types';

interface QuickActionsProps {
  userSegment: UserSegment;
  onActionClick: (action: QuickAction) => void;
  className?: string;
  compact?: boolean;
}

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  UserCircle,
  PlayCircle,
  MessageCircle,
  Zap,
  Camera,
  Phone,
  Search,
  Heart,
  Crown,
  User,
  Sparkles,
  Gift,
  HelpCircle,
  ArrowRight,
};

// Segment labels
const SEGMENT_LABELS: Record<UserSegment, string> = {
  new_user: 'Welkom! Dit kan je helpen',
  active_dater: 'Verbeter je resultaten',
  struggling: 'We helpen je graag',
  premium: 'Premium Support',
  churning: 'We missen je!',
  anonymous: 'Populaire acties',
};

// Segment descriptions
const SEGMENT_DESCRIPTIONS: Record<UserSegment, string> = {
  new_user: 'Nieuwe hier? Deze resources helpen je snel op weg.',
  active_dater: 'Je bent lekker bezig! Hier zijn tips om nog beter te worden.',
  struggling: 'Loop je ergens tegenaan? Deze acties kunnen helpen.',
  premium: 'Als Premium lid heb je toegang tot exclusieve support.',
  churning: 'Lang niet gezien! Bekijk wat er nieuw is.',
  anonymous: 'Ontdek wat DatingAssistent voor je kan betekenen.',
};

// Color schemes per segment
const SEGMENT_COLORS: Record<UserSegment, { bg: string; border: string; accent: string }> = {
  new_user: {
    bg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    accent: 'bg-blue-500',
  },
  active_dater: {
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    accent: 'bg-green-500',
  },
  struggling: {
    bg: 'from-purple-50 to-coral-50',
    border: 'border-purple-200',
    accent: 'bg-purple-500',
  },
  premium: {
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    accent: 'bg-amber-500',
  },
  churning: {
    bg: 'from-rose-50 to-coral-50',
    border: 'border-rose-200',
    accent: 'bg-rose-500',
  },
  anonymous: {
    bg: 'from-gray-50 to-slate-50',
    border: 'border-gray-200',
    accent: 'bg-gray-500',
  },
};

export function QuickActions({
  userSegment,
  onActionClick,
  className,
  compact = false,
}: QuickActionsProps) {
  const actions = getQuickActionsForSegment(userSegment);
  const colors = SEGMENT_COLORS[userSegment];

  if (actions.length === 0) return null;

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {actions.map((action, index) => {
          const Icon = ICON_MAP[action.icon] || HelpCircle;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onActionClick(action)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full',
                'bg-white border border-gray-200',
                'hover:border-coral-400 hover:bg-coral-50',
                'text-sm text-gray-700 hover:text-coral-700',
                'transition-all duration-200'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{action.title}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden',
      colors.border,
      className
    )}>
      {/* Header */}
      <div className={cn(
        'px-6 py-4 bg-gradient-to-r',
        colors.bg
      )}>
        <h3 className="font-semibold text-gray-900">
          {SEGMENT_LABELS[userSegment]}
        </h3>
        <p className="text-sm text-gray-600 mt-0.5">
          {SEGMENT_DESCRIPTIONS[userSegment]}
        </p>
      </div>

      {/* Actions Grid */}
      <div className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action, index) => {
            const Icon = ICON_MAP[action.icon] || HelpCircle;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onActionClick(action)}
                className={cn(
                  'group flex items-start gap-3 p-4 rounded-xl',
                  'bg-gray-50 hover:bg-white',
                  'border border-transparent hover:border-coral-200',
                  'hover:shadow-md',
                  'transition-all duration-200 text-left'
                )}
              >
                <div className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg',
                  'flex items-center justify-center',
                  'bg-gradient-to-br from-coral-500 to-coral-600',
                  'group-hover:scale-110 transition-transform duration-200'
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 group-hover:text-coral-700 transition-colors">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {action.description}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-coral-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simple list version
export function QuickActionsList({
  userSegment,
  onActionClick,
  className,
}: QuickActionsProps) {
  const actions = getQuickActionsForSegment(userSegment);

  if (actions.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {actions.map((action, index) => {
        const Icon = ICON_MAP[action.icon] || HelpCircle;
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onActionClick(action)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl',
              'bg-white hover:bg-coral-50 border border-gray-200 hover:border-coral-300',
              'transition-all duration-200 text-left'
            )}
          >
            <Icon className="w-5 h-5 text-coral-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {action.title}
              </div>
              <div className="text-xs text-gray-500">
                {action.description}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </motion.button>
        );
      })}
    </div>
  );
}
