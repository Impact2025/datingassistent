'use client';

/**
 * Achievement Toast - Visuele notification bij achievement unlock
 * Sprint 4: Integration & UX Enhancement
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Award, Crown, Zap, Target, Heart, Sparkles,
  TrendingUp, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/lib/achievements/achievement-tracker';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
  duration?: number;
}

export function AchievementToast({
  achievement,
  onClose,
  duration = 5000
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const iconMap: Record<string, any> = {
    'Trophy': Trophy,
    'Star': Star,
    'Award': Award,
    'Crown': Crown,
    'Zap': Zap,
    'Target': Target,
    'Heart': Heart,
    'Sparkles': Sparkles,
    'TrendingUp': TrendingUp
  };

  const rarityColors: Record<string, { bg: string; border: string; glow: string }> = {
    'common': {
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      border: 'border-gray-300',
      glow: 'shadow-gray-200'
    },
    'uncommon': {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-400',
      glow: 'shadow-green-300'
    },
    'rare': {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-400',
      glow: 'shadow-blue-300'
    },
    'epic': {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-400',
      glow: 'shadow-purple-300'
    },
    'legendary': {
      bg: 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-100',
      border: 'border-yellow-400',
      glow: 'shadow-yellow-300'
    }
  };

  const IconComponent = iconMap[achievement.badge_icon] || Trophy;
  const colors = rarityColors[achievement.rarity] || rarityColors.common;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
          className={cn(
            "relative overflow-hidden rounded-2xl border-2 shadow-2xl",
            colors.bg,
            colors.border,
            colors.glow
          )}
          style={{ minWidth: '320px', maxWidth: '400px' }}
        >
          {/* Sparkle background effect */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative p-4 flex items-start gap-4">
            {/* Icon */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: 'spring',
                delay: 0.2,
                stiffness: 200
              }}
              className="flex-shrink-0"
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                "bg-white shadow-lg"
              )}>
                <IconComponent
                  className={cn(
                    "w-8 h-8",
                    achievement.rarity === 'legendary' ? 'text-yellow-600' :
                    achievement.rarity === 'epic' ? 'text-purple-600' :
                    achievement.rarity === 'rare' ? 'text-blue-600' :
                    achievement.rarity === 'uncommon' ? 'text-green-600' :
                    'text-gray-600'
                  )}
                />
              </div>
            </motion.div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide">
                    Achievement Unlocked!
                  </p>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {achievement.name}
                </h3>

                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {achievement.description}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-700">
                      +{achievement.points}
                    </span>
                  </div>

                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    achievement.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-800' :
                    achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
                    achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
                    achievement.rarity === 'uncommon' ? 'bg-green-200 text-green-800' :
                    'bg-gray-200 text-gray-800'
                  )}>
                    {achievement.rarity.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="flex-shrink-0 p-1 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Progress bar */}
          <motion.div
            className="h-1 bg-gradient-to-r from-coral-500 via-purple-500 to-blue-500"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            style={{ transformOrigin: 'left' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
