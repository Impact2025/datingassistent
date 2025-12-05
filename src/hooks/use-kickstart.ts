'use client';

import useSWR from 'swr';
import type {
  ProgramDay,
  DayProgress,
  ProgramWeek,
  UpdateDayProgressInput,
} from '@/types/kickstart.types';

// SWR fetcher with error handling
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch');
    const data = await res.json().catch(() => ({}));
    (error as any).info = data;
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

// Types
interface KickstartProgressResponse {
  success: boolean;
  days: Array<{
    dag_nummer: number;
    titel: string;
    dag_type: string;
    status: string;
    emoji: string;
    ai_tool: string | null;
  }>;
  progress: Array<DayProgress>;
  enrollment: {
    id: number;
    status: string;
    kickstart_onboarding_completed: boolean;
  } | null;
  stats: {
    completedDays: number;
    totalDays: number;
    progressPercentage: number;
    nextDay: number;
  };
}

interface KickstartDayResponse {
  success: boolean;
  day: ProgramDay;
  week: ProgramWeek;
  progress: DayProgress | null;
  navigation: {
    previous: { dag_nummer: number; titel: string } | null;
    next: { dag_nummer: number; titel: string } | null;
  };
  hasAccess: boolean;
  message?: string;
}

/**
 * Hook for fetching overall Kickstart progress
 * Provides caching, revalidation, and optimistic updates
 */
export function useKickstartProgress() {
  const { data, error, isLoading, mutate } = useSWR<KickstartProgressResponse>(
    '/api/kickstart/progress',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 3,
    }
  );

  return {
    progress: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
    // Derived state
    isEnrolled: !!data?.enrollment,
    completedDays: data?.stats?.completedDays || 0,
    totalDays: data?.stats?.totalDays || 21,
    progressPercentage: data?.stats?.progressPercentage || 0,
    nextDay: data?.stats?.nextDay || 1,
    onboardingCompleted: data?.enrollment?.kickstart_onboarding_completed || false,
  };
}

/**
 * Hook for fetching a specific Kickstart day
 * Caches day content to avoid refetching
 */
export function useKickstartDay(dayNumber: number | null) {
  const { data, error, isLoading, mutate } = useSWR<KickstartDayResponse>(
    dayNumber ? `/api/kickstart/day/${dayNumber}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Day content doesn't change often
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Cache day content for 30 seconds
      errorRetryCount: 2,
    }
  );

  // Function to update progress and refresh data
  const updateProgress = async (progressData: UpdateDayProgressInput) => {
    const response = await fetch('/api/kickstart/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progressData),
    });

    if (!response.ok) {
      throw new Error('Failed to update progress');
    }

    const result = await response.json();

    // Optimistically update local data
    mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          progress: result.progress,
        };
      },
      false // Don't revalidate immediately
    );

    return result;
  };

  return {
    day: data?.day || null,
    week: data?.week || null,
    progress: data?.progress || null,
    navigation: data?.navigation || { previous: null, next: null },
    hasAccess: data?.hasAccess ?? false,
    isLoading,
    isError: !!error,
    error,
    mutate,
    updateProgress,
  };
}

/**
 * Hook for prefetching next day content
 * Call this when user is viewing current day
 */
export function usePrefetchDay(dayNumber: number | null) {
  // Prefetch next day
  useSWR(
    dayNumber && dayNumber < 21 ? `/api/kickstart/day/${dayNumber + 1}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );
}

/**
 * Hook for checking enrollment status
 */
export function useKickstartEnrollment() {
  const { data, error, isLoading } = useSWR<{ enrolled: boolean }>(
    '/api/kickstart/check-enrollment',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
      errorRetryCount: 1,
    }
  );

  return {
    isEnrolled: data?.enrolled ?? false,
    isLoading,
    isError: !!error,
  };
}

/**
 * Hook for user reflections
 */
export function useKickstartReflections(dayNumber?: number) {
  const url = dayNumber
    ? `/api/kickstart/reflections?dayNumber=${dayNumber}`
    : '/api/kickstart/reflections?all=true';

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  return {
    reflections: data?.reflections || [],
    total: data?.total || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}
