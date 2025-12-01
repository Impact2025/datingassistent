"use client";

import { useEffect } from 'react';
import { useTutorial } from '../tutorial-engine/tutorial-engine';
import { useUser } from '@/providers/user-provider';

export function ProfileSuiteTutorial() {
  const { user } = useUser();
  const { startTutorial, isTutorialCompleted } = useTutorial();

  useEffect(() => {
    // Auto-trigger tutorial for users who haven't completed profile basics
    if (user && !isTutorialCompleted('profile-suite-basics')) {
      // Small delay to let the dashboard load
      const timer = setTimeout(() => {
        startTutorial('profile-suite-basics');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, isTutorialCompleted, startTutorial]);

  // This component doesn't render anything - it just manages tutorial triggers
  return null;
}

// Hook to manually trigger profile suite tutorial
export function useProfileSuiteTutorial() {
  const { startTutorial, isTutorialCompleted } = useTutorial();

  const showTutorial = () => {
    startTutorial('profile-suite-basics');
  };

  const isCompleted = isTutorialCompleted('profile-suite-basics');

  return {
    showTutorial,
    isCompleted
  };
}