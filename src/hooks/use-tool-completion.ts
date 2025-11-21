/**
 * useToolCompletion Hook
 * Sprint 2 Phase 3
 *
 * React hook for tracking and managing tool completion progress.
 * Provides a simple interface to mark actions as completed and track progress.
 *
 * Usage:
 * ```tsx
 * const { completedActions, progressPercentage, markAsCompleted } = useToolCompletion('profiel-coach');
 *
 * // Mark an action as completed
 * await markAsCompleted('bio_generated', { profiles: 3 });
 *
 * // Check if action is completed
 * const isCompleted = completedActions.includes('bio_generated');
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/providers/user-provider';

interface ToolProgress {
  completedActions: number;
  actionsCompleted: string[];
  progressPercentage: number;
  firstCompletion: string | null;
  lastCompletion: string | null;
}

interface UseToolCompletionReturn {
  // State
  completedActions: string[];
  progressPercentage: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  markAsCompleted: (actionName: string, metadata?: Record<string, any>) => Promise<boolean>;
  isCompleted: (actionName: string) => boolean;
  refresh: () => Promise<void>;
  resetProgress: () => Promise<void>;
}

/**
 * Hook for managing tool completion tracking
 *
 * @param toolName - The tool identifier (e.g., 'profiel-coach', 'foto-advies')
 * @param autoLoad - Whether to automatically load progress on mount (default: true)
 * @returns Tool completion state and actions
 */
export function useToolCompletion(
  toolName: string,
  autoLoad: boolean = true
): UseToolCompletionReturn {
  const { user } = useUser();
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current progress from API
   */
  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userIdParam = user?.id ? `&userId=${user.id}` : '';
      const response = await fetch(`/api/tool-completion/progress?toolName=${toolName}${userIdParam}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        // Handle authentication/subscription issues gracefully
        if (response.status >= 400 && response.status < 500) {
          console.log(`🔐 User not authorized for ${toolName} progress (status: ${response.status}) - using localStorage fallback`);
          // Fall back to localStorage immediately
          try {
            const localKey = `${toolName}-completions`;
            const localData = localStorage.getItem(localKey);
            if (localData) {
              const parsed = JSON.parse(localData);
              setCompletedActions(parsed.actions || []);
              setProgressPercentage(parsed.percentage || 0);
            } else {
              setCompletedActions([]);
              setProgressPercentage(0);
            }
          } catch (localErr) {
            console.warn('localStorage fallback failed:', localErr);
            setCompletedActions([]);
            setProgressPercentage(0);
          }
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch progress');
      }

      const data: ToolProgress = await response.json();

      setCompletedActions(data.actionsCompleted || []);
      setProgressPercentage(data.progressPercentage || 0);

    } catch (err: any) {
      // Handle authentication errors silently
      if (err.message === 'Failed to fetch progress') {
        // This is an auth error that should have been handled above, but if not, handle it here
        console.log(`🔒 Auth error for ${toolName} progress - using localStorage fallback`);
        try {
          const localKey = `${toolName}-completions`;
          const localData = localStorage.getItem(localKey);
          if (localData) {
            const parsed = JSON.parse(localData);
            setCompletedActions(parsed.actions || []);
            setProgressPercentage(parsed.percentage || 0);
          } else {
            setCompletedActions([]);
            setProgressPercentage(0);
          }
        } catch (localErr) {
          console.warn('localStorage fallback failed:', localErr);
          setCompletedActions([]);
          setProgressPercentage(0);
        }
      } else {
        // Log other errors
        console.error(`Error fetching progress for ${toolName}:`, err);
        setError(err.message);

        // Fallback to localStorage for other errors too
        try {
          const localKey = `${toolName}-completions`;
          const localData = localStorage.getItem(localKey);
          if (localData) {
            const parsed = JSON.parse(localData);
            setCompletedActions(parsed.actions || []);
            setProgressPercentage(parsed.percentage || 0);
          } else {
            setCompletedActions([]);
            setProgressPercentage(0);
          }
        } catch (localErr) {
          console.warn('localStorage fallback also failed');
          setCompletedActions([]);
          setProgressPercentage(0);
        }
      }

    } finally {
      setIsLoading(false);
    }
  }, [toolName]);

  /**
   * Mark an action as completed
   */
  const markAsCompleted = useCallback(async (
    actionName: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch('/api/tool-completion/mark-completed', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toolName,
          actionName,
          metadata,
          userId: user?.id
        })
      });

      if (!response.ok) {
        // Handle both client errors (4xx) and server errors (5xx) gracefully
        if (response.status >= 400) {
          console.log(`🔐 User not authorized for ${toolName} or server error (status: ${response.status}) - marking ${actionName} completed in localStorage only`);
          // Fall back to localStorage immediately
          try {
            const localKey = `${toolName}-completions`;
            const currentData = localStorage.getItem(localKey);
            const parsed = currentData ? JSON.parse(currentData) : { actions: [] };

            if (!parsed.actions.includes(actionName)) {
              parsed.actions.push(actionName);
              parsed.lastUpdated = new Date().toISOString();
              localStorage.setItem(localKey, JSON.stringify(parsed));
              setCompletedActions(parsed.actions);
              return true;
            }
          } catch (localErr) {
            console.warn('localStorage fallback failed:', localErr);
          }
          return false;
        }
        throw new Error('Failed to mark action completed');
      }

      const data = await response.json();

      // Update local state immediately
      if (data.success && data.progress) {
        setCompletedActions(data.progress.actionsCompleted);
        setProgressPercentage(data.progress.progressPercentage);
      }

      // Also update localStorage as backup
      try {
        const localKey = `${toolName}-completions`;
        const currentData = localStorage.getItem(localKey);
        const parsed = currentData ? JSON.parse(currentData) : { actions: [] };

        if (!parsed.actions.includes(actionName)) {
          parsed.actions.push(actionName);
          parsed.percentage = data.progress?.progressPercentage || 0;
          parsed.lastUpdated = new Date().toISOString();
          localStorage.setItem(localKey, JSON.stringify(parsed));
        }
      } catch (localErr) {
        console.warn('Failed to update localStorage:', localErr);
      }

      return data.wasNew;

    } catch (err: any) {
      console.error(`Error marking ${actionName} completed:`, err);
      setError(err.message);

      // Fallback to localStorage
      try {
        const localKey = `${toolName}-completions`;
        const currentData = localStorage.getItem(localKey);
        const parsed = currentData ? JSON.parse(currentData) : { actions: [] };

        if (!parsed.actions.includes(actionName)) {
          parsed.actions.push(actionName);
          localStorage.setItem(localKey, JSON.stringify(parsed));
          setCompletedActions(parsed.actions);
          return true;
        }
      } catch (localErr) {
        console.error('localStorage fallback failed:', localErr);
      }

      return false;
    }
  }, [toolName]);

  /**
   * Check if a specific action is completed
   */
  const isCompleted = useCallback((actionName: string): boolean => {
    return completedActions.includes(actionName);
  }, [completedActions]);

  /**
   * Manually refresh progress from API
   */
  const refresh = useCallback(async () => {
    await fetchProgress();
  }, [fetchProgress]);

  /**
   * Reset all progress for this tool (for testing)
   */
  const resetProgress = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(`/api/tool-completion/reset?toolName=${toolName}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to reset progress');
      }

      // Clear local state
      setCompletedActions([]);
      setProgressPercentage(0);

      // Clear localStorage
      try {
        const localKey = `${toolName}-completions`;
        localStorage.removeItem(localKey);
      } catch (localErr) {
        console.warn('Failed to clear localStorage');
      }

    } catch (err: any) {
      console.error(`Error resetting progress for ${toolName}:`, err);
      setError(err.message);
    }
  }, [toolName]);

  // Auto-load progress on mount
  useEffect(() => {
    if (autoLoad) {
      fetchProgress();
    }
  }, [autoLoad, fetchProgress]);

  return {
    // State
    completedActions,
    progressPercentage,
    isLoading,
    error,

    // Actions
    markAsCompleted,
    isCompleted,
    refresh,
    resetProgress
  };
}

/**
 * Hook for getting overall coaching progress across all tools
 */
export function useOverallProgress() {
  const { user } = useUser();
  const [toolsUsed, setToolsUsed] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverallProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userIdParam = user?.id ? `?userId=${user.id}` : '';
      const response = await fetch(`/api/tool-completion/progress${userIdParam}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch overall progress');
      }

      const data = await response.json();

      if (data.overall) {
        setToolsUsed(data.overall.toolsUsed);
        setTotalCompletions(data.overall.totalCompletions);
        setOverallProgress(data.overall.overallProgress);
      }

    } catch (err: any) {
      console.error('Error fetching overall progress:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverallProgress();
  }, [fetchOverallProgress]);

  return {
    toolsUsed,
    totalCompletions,
    overallProgress,
    isLoading,
    error,
    refresh: fetchOverallProgress
  };
}
