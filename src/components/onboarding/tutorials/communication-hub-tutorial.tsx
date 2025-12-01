"use client";

import { useEffect } from 'react';
import { useTutorial } from '../tutorial-engine/tutorial-engine';
import { useUser } from '@/providers/user-provider';

export function CommunicationHubTutorial() {
  const { user } = useUser();
  const { startTutorial, isTutorialCompleted } = useTutorial();

  useEffect(() => {
    // Auto-trigger tutorial for users who haven't completed communication basics
    if (user && !isTutorialCompleted('communication-hub-basics')) {
      // Small delay to let the dashboard load
      const timer = setTimeout(() => {
        startTutorial('communication-hub-basics');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, isTutorialCompleted, startTutorial]);

  // This component doesn't render anything - it just manages tutorial triggers
  return null;
}

// Hook to manually trigger communication hub tutorial
export function useCommunicationHubTutorial() {
  const { startTutorial, isTutorialCompleted } = useTutorial();

  const showTutorial = () => {
    startTutorial('communication-hub-basics');
  };

  const isCompleted = isTutorialCompleted('communication-hub-basics');

  return {
    showTutorial,
    isCompleted
  };
}