"use client";

import { useState, useEffect, useCallback } from "react";

interface OnboardingStatus {
  exists: boolean;
  onboarding?: {
    id: number;
    programId: number | null;
    currentStep: string;
    startedAt: string;
    completedAt: string | null;
    progressPercentage: number;
  };
  intake?: {
    primaryGoal: string | null;
    biggestChallenge: string | null;
    experienceLevel: number | null;
  };
  recommendation?: {
    path: string | null;
    priorityTools: string[] | null;
    irisPersonality: string | null;
  };
  engagement?: {
    firstToolUsed: string | null;
    firstToolCompletedAt: string | null;
  };
  progress?: {
    total_xp: number;
    current_level: number;
    current_streak: number;
    longest_streak: number;
  };
  achievements?: Array<{
    achievement_id: string;
    earned_at: string;
    xp_awarded: number;
  }>;
}

interface UseOnboardingStatusOptions {
  userId: number | undefined;
  enabled?: boolean;
}

export function useOnboardingStatus({
  userId,
  enabled = true,
}: UseOnboardingStatusOptions) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!userId || !enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/onboarding/status?userId=${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch onboarding status");
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error("Error fetching onboarding status:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, enabled]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Helper computed values
  const isOnboardingComplete = status?.onboarding?.completedAt !== null && status?.onboarding?.completedAt !== undefined;
  const isFirstVisit = isOnboardingComplete && !status?.engagement?.firstToolUsed;
  const recommendedPath = status?.recommendation?.path || "profile";
  const priorityTools = status?.recommendation?.priorityTools || [];

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,

    // Computed values
    isOnboardingComplete,
    isFirstVisit,
    recommendedPath,
    priorityTools,

    // Progress info
    totalXp: status?.progress?.total_xp || 0,
    currentLevel: status?.progress?.current_level || 1,
    currentStreak: status?.progress?.current_streak || 0,
    achievements: status?.achievements || [],
  };
}

/**
 * Hook to start onboarding for a user
 */
export function useStartOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startOnboarding = useCallback(
    async (userId: number, programId?: number) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/onboarding/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, programId }),
        });

        if (!response.ok) {
          throw new Error("Failed to start onboarding");
        }

        const data = await response.json();
        return data;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { startOnboarding, isLoading, error };
}

/**
 * Hook to track tool usage after onboarding
 */
export function useTrackToolUsage() {
  const trackFirstToolUsed = useCallback(
    async (userId: number, toolSlug: string) => {
      try {
        // This could be expanded to track tool usage
        // For now, we'll update the onboarding record
        const response = await fetch("/api/onboarding/status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            firstToolUsed: toolSlug,
          }),
        });

        return response.ok;
      } catch (err) {
        console.error("Error tracking tool usage:", err);
        return false;
      }
    },
    []
  );

  return { trackFirstToolUsed };
}
