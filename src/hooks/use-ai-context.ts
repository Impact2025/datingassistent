"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/providers/user-provider';
import { AIContextManager, UserAIContext } from '@/lib/ai-context-manager';

export function useAIContext() {
  const { user, loading: userLoading } = useUser();
  const [context, setContext] = useState<UserAIContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user context
  const loadContext = useCallback(async () => {
    // Wait for user provider to finish loading
    if (userLoading) {
      return;
    }

    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('datespark_auth_token');

      // Skip if no token available yet
      if (!token) {
        console.log('AI Context: No token available yet, skipping load');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/ai-context', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setContext(data.context);
      } else if (response.status === 401) {
        // Silently handle auth errors - user may be logging in
        console.log('AI Context: Auth pending, will retry on next render');
        setContext(null);
      } else {
        console.error('Failed to load AI context:', response.statusText);
        setError('Failed to load AI context');
      }
    } catch (err) {
      console.error('Error loading AI context:', err);
      setError('Failed to load AI context');
    } finally {
      setLoading(false);
    }
  }, [user?.id, userLoading]);

  // Save context
  const saveContext = useCallback(async (updates: Partial<UserAIContext>) => {
    if (!user?.id) return;

    try {
      await AIContextManager.saveUserContext(user.id, updates);
      // Reload context to get updated data
      await loadContext();
    } catch (err) {
      console.error('Error saving AI context:', err);
      setError('Failed to save AI context');
    }
  }, [user?.id, loadContext]);

  // Update specific field
  const updateField = useCallback(async (field: keyof UserAIContext, value: any) => {
    if (!user?.id) return;

    try {
      await AIContextManager.updateContextField(user.id, field, value);
      // Update local state optimistically
      setContext(prev => prev ? { ...prev, [field]: value, lastUpdated: new Date() } : null);
    } catch (err) {
      console.error('Error updating AI context field:', err);
      setError('Failed to update AI context');
    }
  }, [user?.id]);

  // Track tool usage
  const trackToolUsage = useCallback(async (toolName: string) => {
    if (!user?.id) return;

    try {
      await AIContextManager.trackToolUsage(user.id, toolName);
      // Reload context to get updated usage stats
      await loadContext();
    } catch (err) {
      console.error('Error tracking tool usage:', err);
    }
  }, [user?.id, loadContext]);

  // Initialize context from profile
  const initializeFromProfile = useCallback(async (userProfile: any, personalityScan?: any) => {
    if (!user?.id) return;

    try {
      await AIContextManager.initializeFromProfile(user.id, userProfile, personalityScan);
      await loadContext();
    } catch (err) {
      console.error('Error initializing AI context:', err);
      setError('Failed to initialize AI context');
    }
  }, [user?.id, loadContext]);

  // Get context summary for AI prompts
  const getContextSummary = useCallback(() => {
    return AIContextManager.getContextSummary(context);
  }, [context]);

  // Load context on mount and when user changes
  useEffect(() => {
    loadContext();
  }, [loadContext]);

  return {
    context,
    loading,
    error,
    saveContext,
    updateField,
    trackToolUsage,
    initializeFromProfile,
    getContextSummary,
    reloadContext: loadContext
  };
}