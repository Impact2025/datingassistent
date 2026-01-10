'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { motion, useSpring, useTransform } from 'framer-motion';

interface ReadingProgressProps {
  /** Target element selector to track progress against */
  targetSelector?: string;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show estimated time remaining */
  showTimeRemaining?: boolean;
  /** Total reading time in minutes */
  readingTime?: number;
  /** Custom class name */
  className?: string;
}

export function ReadingProgress({
  targetSelector = 'article',
  showPercentage = false,
  showTimeRemaining = false,
  readingTime = 0,
  className,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth spring animation for progress
  const springProgress = useSpring(0, { stiffness: 100, damping: 30 });
  const scaleX = useTransform(springProgress, [0, 100], [0, 1]);

  useEffect(() => {
    springProgress.set(progress);
  }, [progress, springProgress]);

  const calculateProgress = useCallback(() => {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const targetTop = rect.top;
    const targetHeight = rect.height;

    // Calculate how much of the article has been scrolled past
    const scrolledPast = Math.max(0, -targetTop + windowHeight * 0.2);
    const totalScrollable = targetHeight - windowHeight * 0.6;
    const percentage = Math.min(100, Math.max(0, (scrolledPast / totalScrollable) * 100));

    setProgress(percentage);
    setIsVisible(targetTop < windowHeight * 0.5 && percentage < 100);
  }, [targetSelector]);

  useEffect(() => {
    calculateProgress();
    window.addEventListener('scroll', calculateProgress, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
    };
  }, [calculateProgress]);

  const timeRemaining = Math.ceil(readingTime * (1 - progress / 100));

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
    >
      {/* Progress bar container */}
      <div className="h-1 bg-muted/50 backdrop-blur-sm">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80 origin-left"
          style={{ scaleX }}
        />
      </div>

      {/* Optional info bar */}
      {(showPercentage || showTimeRemaining) && progress > 0 && progress < 100 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-4 top-2 flex items-center gap-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full border shadow-sm"
        >
          {showPercentage && (
            <span className="font-medium">{Math.round(progress)}%</span>
          )}
          {showTimeRemaining && readingTime > 0 && timeRemaining > 0 && (
            <span>~{timeRemaining} min</span>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Compact version for inline use
export function ReadingProgressInline({
  progress,
  className,
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium min-w-[3ch]">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
