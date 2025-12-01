"use client";

import { useEffect } from 'react';
import { useTutorial } from '../tutorial-engine/tutorial-engine';
import { useUser } from '@/providers/user-provider';

export function AIRelationshipCoachTutorial() {
  const { user } = useUser();
  const { startTutorial, isTutorialCompleted } = useTutorial();

  useEffect(() => {
    // Auto-trigger tutorial for users who haven't completed AI coach basics
    if (user && !isTutorialCompleted('ai-relationship-coach-basics')) {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        startTutorial('ai-relationship-coach-basics');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, isTutorialCompleted, startTutorial]);

  // This component doesn't render anything - it just manages tutorial triggers
  return null;
}

// Hook to manually trigger AI relationship coach tutorial
export function useAIRelationshipCoachTutorial() {
  const { startTutorial, isTutorialCompleted } = useTutorial();

  const showTutorial = () => {
    startTutorial('ai-relationship-coach-basics');
  };

  const isCompleted = isTutorialCompleted('ai-relationship-coach-basics');

  return {
    showTutorial,
    isCompleted
  };
}