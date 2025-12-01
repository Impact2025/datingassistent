'use client';

/**
 * Journey Timeline - Visual progress timeline door alle 5 fases
 * Sprint 3: Het Pad
 */

import { motion } from 'framer-motion';
import {
  User, Heart, MessageCircle, Calendar, TrendingUp,
  Check, Lock, Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyPhase {
  id: number;
  name: string;
  icon: any;
  color: string;
  status: 'completed' | 'current' | 'locked';
  progress: number;
  completedAt?: Date;
}

interface JourneyTimelineProps {
  phases: JourneyPhase[];
  currentPhase: number;
}

export function JourneyTimeline({ phases, currentPhase }: JourneyTimelineProps) {
  const iconMap: Record<number, any> = {
    1: User,
    2: Heart,
    3: MessageCircle,
    4: Calendar,
    5: TrendingUp
  };

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    pink: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-500' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-500' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-500' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-500' },
    teal: { bg: 'bg-teal-500', text: 'text-teal-600', border: 'border-teal-500' }
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gray-200" />

      {/* Active Progress Line */}
      <motion.div
        className="absolute left-8 top-10 w-0.5 bg-gradient-to-b from-pink-500 to-purple-500"
        initial={{ height: 0 }}
        animate={{ height: `${(currentPhase / 5) * 100}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Phases */}
      <div className="space-y-8">
        {phases.map((phase, index) => {
          const Icon = iconMap[phase.id] || Circle;
          const colors = colorMap[phase.color] || colorMap.pink;
          const isCompleted = phase.status === 'completed';
          const isCurrent = phase.status === 'current';
          const isLocked = phase.status === 'locked';

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4"
            >
              {/* Timeline Node */}
              <motion.div
                className={cn(
                  "relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-lg",
                  isCompleted && colors.bg,
                  isCurrent && `${colors.bg} ring-4 ring-pink-100`,
                  isLocked && "bg-gray-300"
                )}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {isCompleted ? (
                  <Check className="w-7 h-7 text-white" />
                ) : isLocked ? (
                  <Lock className="w-6 h-6 text-gray-500" />
                ) : (
                  <Icon className="w-7 h-7 text-white" />
                )}
              </motion.div>

              {/* Phase Info */}
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={cn(
                    "text-lg font-bold",
                    isCompleted && "text-green-700",
                    isCurrent && colors.text,
                    isLocked && "text-gray-500"
                  )}>
                    Fase {phase.id}: {phase.name}
                  </h3>

                  {isCompleted && phase.completedAt && (
                    <span className="text-xs text-gray-500">
                      ✓ {new Date(phase.completedAt).toLocaleDateString('nl-NL')}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {!isLocked && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Voortgang</span>
                      <span className={cn(
                        "font-medium",
                        isCompleted ? "text-green-600" : colors.text
                      )}>
                        {phase.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full",
                          isCompleted ? "bg-green-500" : colors.bg
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${phase.progress}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                )}

                {isLocked && (
                  <p className="text-sm text-gray-500">
                    Voltooi de vorige fase om deze te ontgrendelen
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
