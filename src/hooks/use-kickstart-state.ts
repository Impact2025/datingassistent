/**
 * useKickstartState - Manages Kickstart enrollment and onboarding state
 * Extracted from dashboard page for cleaner architecture
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { debugLog } from '@/lib/constants/dashboard';
import type { KickstartIntakeData } from '@/types/kickstart-onboarding.types';

interface KickstartState {
  isChecking: boolean;
  hasEnrollment: boolean | null;
  needsOnboarding: boolean;
  showDayZero: boolean;
  checkComplete: boolean;
}

interface UseKickstartStateProps {
  userId?: number;
  userProfile: unknown;
  loading: boolean;
}

interface UseKickstartStateReturn {
  kickstartState: KickstartState;
  isAdminUser: boolean;
  isSaving: boolean;
  handleOnboardingComplete: (data: KickstartIntakeData) => Promise<void>;
  handleDayZeroComplete: () => void;
}

export function useKickstartState({
  userId,
  userProfile,
  loading,
}: UseKickstartStateProps): UseKickstartStateReturn {
  const router = useRouter();

  const [kickstartState, setKickstartState] = useState<KickstartState>({
    isChecking: false,
    hasEnrollment: null,
    needsOnboarding: false,
    showDayZero: false,
    checkComplete: false,
  });

  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Parallel API checks for admin + kickstart enrollment
  useEffect(() => {
    const performParallelChecks = async () => {
      if (!userId || loading) return;
      if (kickstartState.checkComplete) return;

      debugLog.info('Starting PARALLEL checks for user:', userId);
      setKickstartState(prev => ({ ...prev, isChecking: true }));

      const token = localStorage.getItem('datespark_auth_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const [adminResponse, kickstartResponse] = await Promise.all([
          fetch('/api/auth/check-admin', { headers }).catch(() => null),
          fetch('/api/kickstart/check-enrollment', { headers }).catch(() => null),
        ]);

        // Process admin check
        let adminStatus = false;
        if (adminResponse?.ok) {
          const adminData = await adminResponse.json();
          adminStatus = adminData.isAdmin === true;
        }
        setIsAdminUser(adminStatus);

        // Process kickstart enrollment
        if (kickstartResponse?.ok) {
          const data = await kickstartResponse.json();
          debugLog.success('Kickstart enrollment check result:', data);

          const hasEnrollment = data.hasEnrollment === true;
          const needsOnboarding = hasEnrollment && !data.hasOnboardingData;
          const needsDayZero = hasEnrollment && data.hasOnboardingData && !data.dayZeroCompleted;

          if (needsOnboarding) {
            debugLog.action('User needs Kickstart onboarding');
          } else if (needsDayZero) {
            debugLog.action('User needs Day Zero');
          } else if (hasEnrollment) {
            debugLog.success('User has completed Kickstart enrollment and dag-0');
          } else {
            debugLog.info('User does not have Kickstart enrollment');
          }

          setKickstartState({
            isChecking: false,
            hasEnrollment,
            needsOnboarding,
            showDayZero: needsDayZero,
            checkComplete: true,
          });
        } else {
          debugLog.warn('Failed to check Kickstart enrollment');
          setKickstartState({
            isChecking: false,
            hasEnrollment: false,
            needsOnboarding: false,
            showDayZero: false,
            checkComplete: true,
          });
        }

        // Admin redirect
        if (adminStatus && !userProfile) {
          debugLog.navigate('Admin user detected without profile, redirecting to /admin');
          router.push('/admin');
        }

      } catch (error) {
        debugLog.error('Error in parallel checks:', error);
        setKickstartState({
          isChecking: false,
          hasEnrollment: false,
          needsOnboarding: false,
          showDayZero: false,
          checkComplete: true,
        });
      }
    };

    performParallelChecks();
  }, [userId, loading, kickstartState.checkComplete, userProfile, router]);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(async (data: KickstartIntakeData) => {
    if (!userId) return;

    setIsSaving(true);

    try {
      debugLog.info('Saving Kickstart onboarding data:', data);

      const response = await fetch("/api/kickstart/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save onboarding");
      }

      const result = await response.json();
      debugLog.success('Kickstart onboarding saved successfully:', result);

      setKickstartState(prev => ({
        ...prev,
        needsOnboarding: false,
        showDayZero: true,
      }));

    } catch (err) {
      debugLog.error('Error saving onboarding:', err);
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  // Handle Day Zero completion
  const handleDayZeroComplete = useCallback(() => {
    debugLog.success('Day Zero completed, redirecting to dag 1');
    setKickstartState(prev => ({
      ...prev,
      showDayZero: false,
    }));
    router.push('/kickstart/dag/1');
  }, [router]);

  return {
    kickstartState,
    isAdminUser,
    isSaving,
    handleOnboardingComplete,
    handleDayZeroComplete,
  };
}
