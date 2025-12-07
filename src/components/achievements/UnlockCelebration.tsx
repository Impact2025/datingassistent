'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, getTierColor } from '@/types/achievement.types';
import { AchievementBadge } from './AchievementBadge';

interface UnlockCelebrationProps {
  achievements: Achievement[];
  totalPoints: number;
  onClose: () => void;
}

export function UnlockCelebration({ achievements, totalPoints, onClose }: UnlockCelebrationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Auto-advance through multiple achievements
    if (currentIndex < achievements.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, achievements.length]);

  useEffect(() => {
    // Stop confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];
  const isLastAchievement = currentIndex === achievements.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={isLastAchievement ? onClose : undefined}
      >
        {/* Confetti */}
        {showConfetti && <Confetti />}

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.4 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Header */}
          <div className={\`bg-gradient-to-br \${getTierColor(currentAchievement.tier)} p-8 text-center relative overflow-hidden\`}>
            {/* Sparkle Animation */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute top-4 right-4 text-3xl opacity-50"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute bottom-4 left-4 text-3xl opacity-50"
            >
              ✨
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
              className="mb-4"
            >
              <h2 className="text-2xl font-bold text-white mb-2">🎉 Achievement Behaald!</h2>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <span className="text-7xl filter drop-shadow-lg">{currentAchievement.icon}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-1">{currentAchievement.title}</h3>
              <p className="text-white/90 text-sm">{currentAchievement.description}</p>
            </motion.div>
          </div>

          {/* Points */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-yellow-50 border-t-2 border-yellow-200 p-4"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-yellow-700">+{currentAchievement.points} punten</span>
            </div>
          </motion.div>

          {/* Progress Indicator */}
          {achievements.length > 1 && (
            <div className="px-6 py-3 bg-gray-50">
              <div className="flex items-center justify-center gap-2">
                {achievements.map((_, idx) => (
                  <div
                    key={idx}
                    className={\`h-1.5 rounded-full transition-all duration-300 \${
                      idx === currentIndex
                        ? 'w-8 bg-purple-500'
                        : idx < currentIndex
                        ? 'w-4 bg-purple-300'
                        : 'w-4 bg-gray-300'
                    }\`}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">
                {currentIndex + 1} van {achievements.length} nieuwe achievements
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 bg-white">
            {isLastAchievement ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={\`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r \${getTierColor(currentAchievement.tier)} shadow-lg hover:shadow-xl transition-shadow\`}
              >
                Geweldig! 🎊
              </motion.button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentIndex(achievements.length - 1)}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className={\`flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r \${getTierColor(currentAchievement.tier)} shadow-lg hover:shadow-xl transition-shadow\`}
                >
                  Volgende →
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Confetti Component
function Confetti() {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA'][Math.floor(Math.random() * 6)],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: \`\${piece.left}vw\`, rotate: 0, opacity: 1 }}
          animate={{
            y: '100vh',
            rotate: piece.rotation + 720,
            opacity: 0,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
}
