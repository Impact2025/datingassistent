'use client';

import { Achievement, AchievementTier, getTierColor, getTierBgColor } from '@/types/achievement.types';
import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  currentProgress?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function AchievementBadge({
  achievement,
  unlocked,
  currentProgress = 0,
  showProgress = true,
  size = 'md',
  onClick,
}: AchievementBadgeProps) {
  const percentage = Math.min(100, Math.round((currentProgress / achievement.requirement.target) * 100));

  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-28 h-28 text-5xl',
  };

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.05, y: -4 } : { scale: 1.02 }}
      whileTap={unlocked ? { scale: 0.95 } : {}}
      className={\`relative cursor-pointer \${containerSizeClasses[size]}\`}
      onClick={onClick}
    >
      {/* Badge Container */}
      <div
        className={\`relative \${sizeClasses[size]} rounded-2xl flex items-center justify-center transition-all duration-300 \${
          unlocked
            ? \`bg-gradient-to-br \${getTierColor(achievement.tier)} shadow-lg\`
            : 'bg-gray-200 opacity-50 grayscale'
        }\`}
      >
        {/* Icon */}
        <span className="filter drop-shadow-md">{achievement.icon}</span>

        {/* Lock Overlay */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
            <span className="text-white text-xl">🔒</span>
          </div>
        )}

        {/* Tier Badge */}
        {unlocked && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">
              {achievement.tier === 'bronze' && '🥉'}
              {achievement.tier === 'silver' && '🥈'}
              {achievement.tier === 'gold' && '🥇'}
              {achievement.tier === 'platinum' && '💎'}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {!unlocked && showProgress && percentage > 0 && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className={\`h-full bg-gradient-to-r \${getTierColor(achievement.tier)}\`}
            initial={{ width: 0 }}
            animate={{ width: \`\${percentage}%\` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Tooltip - Title */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className={\`px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium text-white whitespace-nowrap \${
          unlocked ? \`bg-gradient-to-r \${getTierColor(achievement.tier)}\` : 'bg-gray-700'
        }\`}>
          {achievement.title}
        </div>
      </div>
    </motion.div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: Date;
  currentProgress?: number;
  onClick?: () => void;
}

export function AchievementCard({
  achievement,
  unlocked,
  unlockedAt,
  currentProgress = 0,
  onClick,
}: AchievementCardProps) {
  const percentage = Math.min(100, Math.round((currentProgress / achievement.requirement.target) * 100));

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={\`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer \${
        unlocked
          ? \`\${getTierBgColor(achievement.tier)} border-2 border-transparent hover:border-gray-300 shadow-sm hover:shadow-md\`
          : 'bg-gray-50 border-2 border-gray-200 opacity-70'
      }\`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Badge */}
        <div
          className={\`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-3xl transition-all \${
            unlocked
              ? \`bg-gradient-to-br \${getTierColor(achievement.tier)} shadow-md\`
              : 'bg-gray-300 grayscale opacity-50'
          }\`}
        >
          <span className="filter drop-shadow">{achievement.icon}</span>
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
              <span className="text-white text-lg">🔒</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={\`font-semibold text-gray-900 \${unlocked ? '' : 'text-gray-500'}\`}>
              {achievement.title}
            </h3>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
              <span>⭐</span>
              <span>{achievement.points}</span>
            </div>
          </div>

          <p className={\`text-sm mb-2 \${unlocked ? 'text-gray-600' : 'text-gray-400'}\`}>
            {achievement.description}
          </p>

          {/* Progress or Unlocked Date */}
          {unlocked && unlockedAt ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>✅</span>
              <span>Behaald op {new Date(unlockedAt).toLocaleDateString('nl-NL')}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Voortgang</span>
                <span className="font-medium">
                  {currentProgress} / {achievement.requirement.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={\`h-full bg-gradient-to-r \${getTierColor(achievement.tier)}\`}
                  initial={{ width: 0 }}
                  animate={{ width: \`\${percentage}%\` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tier Badge */}
      {unlocked && (
        <div className="absolute top-3 right-3">
          <div className={\`px-2 py-0.5 rounded-full text-xs font-semibold bg-white shadow-sm border \${
            achievement.tier === 'platinum' ? 'border-purple-300 text-purple-700' :
            achievement.tier === 'gold' ? 'border-yellow-300 text-yellow-700' :
            achievement.tier === 'silver' ? 'border-gray-300 text-gray-700' :
            'border-orange-300 text-orange-700'
          }\`}>
            {achievement.tier.toUpperCase()}
          </div>
        </div>
      )}
    </motion.div>
  );
}
