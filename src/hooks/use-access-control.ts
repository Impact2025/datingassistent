/**
 * useAccessControl Hook
 * Provides tier-based access control functionality in React components
 */

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import {
  ProgramTier,
  hasAccess,
  hasFeatureAccess,
  getLockedMessage,
  getUpgradeCTA,
  getAvailableFeatures,
  getLockedFeatures,
  TIER_CONFIG,
  determineTierFromEnrollments,
  getTierBadgeClass,
} from '@/lib/access-control';

interface EnrolledProgram {
  program_slug: string;
  status: string;
  program?: { slug: string };
}

export interface AccessControlHook {
  // Current user tier
  userTier: ProgramTier;
  tierConfig: typeof TIER_CONFIG[ProgramTier];

  // Access checking functions
  hasAccess: (requiredTier: ProgramTier) => boolean;
  hasFeatureAccess: (feature: string) => boolean;
  getLockedMessage: (feature: string) => string;

  // Upgrade related
  getUpgradeCTA: (feature?: string) => ReturnType<typeof getUpgradeCTA>;
  availableFeatures: ReturnType<typeof getAvailableFeatures>;
  lockedFeatures: ReturnType<typeof getLockedFeatures>;

  // UI helpers
  tierBadgeClass: string;

  // Loading state
  isLoading: boolean;
}

export function useAccessControl(): AccessControlHook {
  const { user, userProfile, loading: userLoading } = useUser();
  const [enrolledPrograms, setEnrolledPrograms] = useState<EnrolledProgram[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  // Fetch enrolled programs when user is available
  useEffect(() => {
    async function fetchEnrollments() {
      if (!user?.id) {
        setEnrollmentsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/enrolled-programs');
        if (response.ok) {
          const data = await response.json();
          setEnrolledPrograms(data.programs || []);
        }
      } catch (error) {
        console.error('Error fetching enrolled programs:', error);
      } finally {
        setEnrollmentsLoading(false);
      }
    }

    fetchEnrollments();
  }, [user?.id]);

  const isLoading = userLoading || enrollmentsLoading;

  // Determine user's tier from their enrollments
  const userTier = useMemo(() => {
    if (!enrolledPrograms || enrolledPrograms.length === 0) {
      // Check if user has a program_tier set
      if (userProfile?.program_tier) {
        return userProfile.program_tier as ProgramTier;
      }
      return 'free';
    }

    return determineTierFromEnrollments(
      enrolledPrograms.map(e => ({
        program_slug: e.program?.slug || e.program_slug || '',
        status: e.status,
      }))
    );
  }, [enrolledPrograms, userProfile?.program_tier]);

  const tierConfig = TIER_CONFIG[userTier];
  const availableFeatures = useMemo(() => getAvailableFeatures(userTier), [userTier]);
  const lockedFeatures = useMemo(() => getLockedFeatures(userTier), [userTier]);
  const tierBadgeClass = getTierBadgeClass(userTier);

  return {
    userTier,
    tierConfig,
    hasAccess: (requiredTier: ProgramTier) => hasAccess(userTier, requiredTier),
    hasFeatureAccess: (feature: string) => hasFeatureAccess(userTier, feature),
    getLockedMessage,
    getUpgradeCTA: (feature?: string) => getUpgradeCTA(userTier, feature),
    availableFeatures,
    lockedFeatures,
    tierBadgeClass,
    isLoading,
  };
}

/**
 * Simple check for Kickstart access
 */
export function useKickstartAccess() {
  const { hasAccess, isLoading } = useAccessControl();
  return {
    hasKickstartAccess: hasAccess('kickstart'),
    isLoading,
  };
}

/**
 * Simple check for Transformatie access
 */
export function useTransformatieAccess() {
  const { hasAccess, isLoading } = useAccessControl();
  return {
    hasTransformatieAccess: hasAccess('transformatie'),
    isLoading,
  };
}

/**
 * Simple check for VIP access
 */
export function useVipAccess() {
  const { hasAccess, isLoading } = useAccessControl();
  return {
    hasVipAccess: hasAccess('vip'),
    isLoading,
  };
}
