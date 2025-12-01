"use client";

import { useEffect } from 'react';
import { useTutorial } from '../tutorial-engine/tutorial-engine';
import { useUser } from '@/providers/user-provider';

export function EmotionalReadinessTutorial() {
  const { user } = useUser();
  const { startTutorial, isTutorialCompleted } = useTutorial();

  useEffect(() => {
    // Auto-trigger tutorial for first-time users on emotional readiness page
    if (user && !isTutorialCompleted('emotional-readiness-intro')) {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        startTutorial('emotional-readiness-intro');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, isTutorialCompleted, startTutorial]);

  // This component doesn't render anything - it just manages tutorial triggers
  return null;
}

// Hook to manually trigger emotional readiness tutorial
export function useEmotionalReadinessTutorial() {
  const { startTutorial, isTutorialCompleted } = useTutorial();

  const showTutorial = () => {
    startTutorial('emotional-readiness-intro');
  };

  const isCompleted = isTutorialCompleted('emotional-readiness-intro');

  return {
    showTutorial,
    isCompleted
  };
}