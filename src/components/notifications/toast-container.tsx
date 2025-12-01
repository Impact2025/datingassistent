'use client';

/**
 * Toast Container - Manages achievement toast notifications
 * Sprint 4: Integration & UX Enhancement
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AchievementToast } from './achievement-toast';
import type { Achievement } from '@/lib/achievements/achievement-tracker';

interface Toast {
  id: string;
  achievement: Achievement;
}

interface ToastContextType {
  showAchievementToast: (achievement: Achievement) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 3 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showAchievementToast = useCallback((achievement: Achievement) => {
    const id = `toast-${Date.now()}-${Math.random()}`;

    setToasts(prev => {
      // Limit number of toasts
      const newToasts = [...prev, { id, achievement }];
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });

    // Play sound effect (optional)
    try {
      const audio = new Audio('/sounds/achievement-unlock.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio errors (user might have no sound)
      });
    } catch {
      // Ignore audio errors
    }
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showAchievementToast, clearAllToasts }}>
      {children}

      {/* Toast Container - Fixed positioning */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
        <div className="space-y-3 pointer-events-auto">
          {toasts.map(toast => (
            <AchievementToast
              key={toast.id}
              achievement={toast.achievement}
              onClose={() => removeToast(toast.id)}
              duration={5000}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
