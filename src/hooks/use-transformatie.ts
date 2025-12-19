'use client';

/**
 * useTransformatie - World-class Transformatie data hooks
 *
 * Features:
 * - Cached module/lesson data with React Query
 * - Prefetching of next lesson content
 * - Optimistic progress updates
 * - Stale-while-revalidate pattern
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface TransformatieLesson {
  id: number;
  title: string;
  description: string;
  lesson_order: number;
  duration_minutes: number;
  video_url?: string;
  progress?: {
    status: string;
    video_completed: boolean;
    reflectie_answers?: Record<string, string>;
  };
}

interface TransformatieModule {
  id: number;
  title: string;
  description: string;
  module_order: number;
  phase: 'DESIGN' | 'ACTION' | 'SURRENDER';
  phase_label: string;
  mindset_hook?: string;
  ai_tool_name?: string;
  lessons: TransformatieLesson[];
}

interface TransformatieOverview {
  modules: TransformatieModule[];
  phases: any[];
  progress: {
    current_module: number;
    current_lesson: number;
    overall_percentage: number;
    completed_lessons: number;
    total_lessons: number;
  };
}

// Query keys for cache management
export const transformatieKeys = {
  all: ['transformatie'] as const,
  overview: () => [...transformatieKeys.all, 'overview'] as const,
  module: (id: number) => [...transformatieKeys.all, 'module', id] as const,
  lesson: (id: number) => [...transformatieKeys.all, 'lesson', id] as const,
  progress: (lessonId: number) => [...transformatieKeys.all, 'progress', lessonId] as const,
};

// Fetch functions
async function fetchTransformatieOverview(): Promise<TransformatieOverview> {
  const token = typeof localStorage !== 'undefined'
    ? localStorage.getItem('datespark_auth_token')
    : null;

  const response = await fetch('/api/transformatie', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Transformatie overview');
  }

  return response.json();
}

// Main overview hook with 2-minute cache
export function useTransformatieOverview(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: transformatieKeys.overview(),
    queryFn: fetchTransformatieOverview,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? true,
  });
}

// Progress mutation with optimistic updates
export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      data,
    }: {
      lessonId: number;
      data: {
        videoCompleted?: boolean;
        reflectieAnswers?: Record<string, string>;
        reflectieCompleted?: boolean;
        status?: string;
      };
    }) => {
      const token = typeof localStorage !== 'undefined'
        ? localStorage.getItem('datespark_auth_token')
        : null;

      const response = await fetch('/api/transformatie/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ lessonId, ...data }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      return response.json();
    },
    // Optimistic update
    onMutate: async ({ lessonId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: transformatieKeys.overview() });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TransformatieOverview>(
        transformatieKeys.overview()
      );

      // Optimistically update cache
      if (previousData) {
        queryClient.setQueryData<TransformatieOverview>(
          transformatieKeys.overview(),
          (old) => {
            if (!old) return old;

            return {
              ...old,
              modules: old.modules.map((module) => ({
                ...module,
                lessons: module.lessons.map((lesson) => {
                  if (lesson.id === lessonId) {
                    return {
                      ...lesson,
                      progress: {
                        ...lesson.progress,
                        video_completed: data.videoCompleted ?? lesson.progress?.video_completed ?? false,
                        reflectie_answers: data.reflectieAnswers ?? lesson.progress?.reflectie_answers,
                        status: data.status ?? lesson.progress?.status ?? 'in_progress',
                      },
                    };
                  }
                  return lesson;
                }),
              })),
            };
          }
        );
      }

      return { previousData };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          transformatieKeys.overview(),
          context.previousData
        );
      }
    },
    // Refetch after success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transformatieKeys.overview() });
    },
  });
}

// Prefetch next lesson hook
export function usePrefetchNextLesson() {
  const queryClient = useQueryClient();

  return (nextLessonId: number) => {
    // This could prefetch detailed lesson content if we had a separate endpoint
    // For now, the overview includes all lesson data
    console.log(`[Prefetch] Ready to prefetch lesson ${nextLessonId} when endpoint available`);
  };
}

// Get current lesson from cached data
export function useCurrentLesson(lessonId?: number) {
  const { data } = useTransformatieOverview();

  if (!data || !lessonId) return null;

  for (const module of data.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return { lesson, module };
    }
  }

  return null;
}
