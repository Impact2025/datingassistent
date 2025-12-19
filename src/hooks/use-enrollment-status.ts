'use client';

/**
 * useEnrollmentStatus - World-class enrollment hook
 *
 * Features:
 * - Single API call for ALL enrollments (Kickstart, Transformatie, VIP)
 * - Automatic caching with React Query
 * - Stale-while-revalidate pattern
 * - TypeScript types for safety
 */

import { useQuery } from '@tanstack/react-query';

// Types
interface KickstartEnrollment {
  isEnrolled: boolean;
  enrollment?: {
    id: number;
    status: string;
    enrolledAt: string;
  };
  onboardingCompleted: boolean;
  dayZeroCompleted: boolean;
  needsOnboarding?: boolean;
  needsDayZero?: boolean;
}

interface TransformatieEnrollment {
  isEnrolled: boolean;
  via?: 'vip' | 'direct';
  enrollment?: {
    id: number;
    status: string;
    enrolledAt: string;
    expiresAt?: string;
  };
  onboardingCompleted: boolean;
  needsOnboarding?: boolean;
  progress?: {
    total: number;
    completed: number;
    percentage: number;
    lastActivity?: string;
  };
}

interface VipEnrollment {
  isEnrolled: boolean;
  enrollment?: {
    id: number;
    status: string;
  };
}

interface EnrollmentStatus {
  authenticated: boolean;
  userId?: number;
  kickstart: KickstartEnrollment;
  transformatie: TransformatieEnrollment;
  vip: VipEnrollment;
  _meta?: {
    duration: number;
    timestamp: string;
  };
}

// Fetch function
async function fetchEnrollmentStatus(): Promise<EnrollmentStatus> {
  const token = typeof localStorage !== 'undefined'
    ? localStorage.getItem('datespark_auth_token')
    : null;

  const response = await fetch('/api/user/enrollment-status', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch enrollment status');
  }

  return response.json();
}

// Hook
export function useEnrollmentStatus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['enrollment-status'],
    queryFn: fetchEnrollmentStatus,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    // Return default values while loading
    placeholderData: {
      authenticated: false,
      kickstart: { isEnrolled: false, onboardingCompleted: false, dayZeroCompleted: false },
      transformatie: { isEnrolled: false, onboardingCompleted: false },
      vip: { isEnrolled: false },
    },
  });
}

// Convenience hooks
export function useKickstartEnrollment() {
  const { data, isLoading, error } = useEnrollmentStatus();
  return {
    data: data?.kickstart,
    isLoading,
    error,
    isEnrolled: data?.kickstart?.isEnrolled ?? false,
    needsOnboarding: data?.kickstart?.needsOnboarding ?? false,
    needsDayZero: data?.kickstart?.needsDayZero ?? false,
  };
}

export function useTransformatieEnrollment() {
  const { data, isLoading, error } = useEnrollmentStatus();
  return {
    data: data?.transformatie,
    isLoading,
    error,
    isEnrolled: data?.transformatie?.isEnrolled ?? false,
    needsOnboarding: data?.transformatie?.needsOnboarding ?? false,
    progress: data?.transformatie?.progress,
  };
}

export function useVipStatus() {
  const { data, isLoading, error } = useEnrollmentStatus();
  return {
    data: data?.vip,
    isLoading,
    error,
    isVip: data?.vip?.isEnrolled ?? false,
  };
}

// Export types
export type {
  EnrollmentStatus,
  KickstartEnrollment,
  TransformatieEnrollment,
  VipEnrollment,
};
